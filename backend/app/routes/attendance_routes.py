from datetime import datetime, timedelta
import math
import re

from flask import Blueprint, jsonify, request

from ..supabase_client import get_supabase_client

attendance_bp = Blueprint('attendance', __name__)

supabase = get_supabase_client()

SCHEDULE_FALLBACK = {
    'manana': {
        'turno': 'manana',
        'hora_entrada': '07:00',
        'hora_salida': '12:00',
        'hora_limite_tardanza': '07:30',
    },
    'tarde': {
        'turno': 'tarde',
        'hora_entrada': '12:00',
        'hora_salida': '17:00',
        'hora_limite_tardanza': '12:30',
    },
    'noche': {
        'turno': 'noche',
        'hora_entrada': '17:00',
        'hora_salida': '21:00',
        'hora_limite_tardanza': '17:30',
    },
}

DEVICE_BLOCK_MESSAGE = (
    'Este dispositivo no esta autorizado para pasar asistencia. '
    'Usa uno previamente aprobado o solicita autorizacion al administrador.'
)

PROFILE_BASE_FIELDS = ['id', 'role', 'full_name', 'email']
PROFILE_OPTIONAL_FIELDS = ['school_id', 'phone', 'secciones_ids', 'margen_tardanza_minutos']


def _missing_column_name(error):
    message = str(error)
    match = re.search(r"column\s+(?:profiles|students|grade_sections)(?:_\d+)?\.([a-zA-Z0-9_]+)\s+does not exist", message)
    if match:
        return match.group(1)

    markers = [
        'column profiles.',
        'column students.',
        'column grade_sections.',
    ]

    for marker in markers:
        if marker in message and ' does not exist' in message:
            return message.split(marker, 1)[1].split(' does not exist', 1)[0].strip('"\' ')

    return None


def _current_user():
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token:
        raise ValueError('Falta el token de autorizacion.')

    user = supabase.auth.get_user(token)
    if not user or not user.user:
        raise ValueError('No se pudo validar la sesion actual.')

    return str(user.user.id)


def _parse_qr_payload(decoded_text):
    if not isinstance(decoded_text, str) or not decoded_text.startswith('QHERE:'):
        return None

    parts = decoded_text.split(':')
    if len(parts) < 3:
        return None

    return {
        'student_id': parts[1],
        'credential': ':'.join(parts[2:]),
    }


def _normalize_time_value(value):
    raw = str(value or '').strip()
    if not raw:
        return ''

    parts = raw.split(':')
    if len(parts) < 2:
        return raw[:5]

    return f'{parts[0].zfill(2)}:{parts[1].zfill(2)}'


def _time_to_minutes(value):
    normalized = _normalize_time_value(value)
    if not normalized:
        return 0

    try:
        hours, minutes = normalized.split(':')
        return int(hours) * 60 + int(minutes)
    except (TypeError, ValueError):
        return 0


def _minutes_to_time_string(value):
    total = max(0, int(value or 0))
    hours = (total // 60) % 24
    minutes = total % 60
    return f'{hours:02d}:{minutes:02d}'


def _add_minutes_to_time(base_time, delta_minutes):
    return _minutes_to_time_string(_time_to_minutes(base_time) + int(delta_minutes or 0))


def _safe_float(value):
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return None

    if math.isnan(parsed) or math.isinf(parsed):
        return None

    return parsed


def _get_turno_actual(scan_time=None):
    total_minutes = _time_to_minutes(scan_time) if scan_time else _time_to_minutes(datetime.now().strftime('%H:%M'))
    hour = total_minutes // 60

    if 7 <= hour < 12:
        return 'manana'
    if 12 <= hour < 17:
        return 'tarde'
    return 'noche'


def _get_client_ip():
    forwarded = request.headers.get('X-Forwarded-For', '')
    if forwarded:
        return forwarded.split(',')[0].strip()

    return request.remote_addr


def _get_profile(user_id):
    fields = [*PROFILE_BASE_FIELDS, *PROFILE_OPTIONAL_FIELDS]

    while True:
        try:
            result = supabase.table('profiles') \
                .select(', '.join(fields)) \
                .eq('id', user_id) \
                .single() \
                .execute()
            break
        except Exception as exc:
            missing_column = _missing_column_name(exc)
            if missing_column and missing_column in fields and missing_column in PROFILE_OPTIONAL_FIELDS:
                fields.remove(missing_column)
                continue
            raise

    profile = result.data or {}
    if not profile:
        raise ValueError('No se encontro el perfil del usuario actual.')

    return profile


def _load_school(school_id):
    if not school_id:
        return {}

    try:
        result = supabase.table('schools') \
            .select('id, nombre, latitude, longitude, allowed_radius_m') \
            .eq('id', school_id) \
            .single() \
            .execute()
        return result.data or {}
    except Exception:
        return {}


def _load_schedule(turno, school_id=None):
    try:
        query = supabase.table('schedules') \
            .select('turno, hora_entrada, hora_salida, hora_limite_tardanza')

        if school_id:
            query = query.eq('school_id', school_id)

        result = query.eq('turno', turno).limit(1).execute()
        rows = result.data or []
        if rows:
            return rows[0]
    except Exception:
        pass

    return SCHEDULE_FALLBACK.get(turno, SCHEDULE_FALLBACK['manana'])


def _apply_special_schedule(base_schedule, student):
    section = student.get('grade_sections') or {}
    has_special_schedule = bool(section.get('special_schedule_enabled')) or any([
        section.get('hora_entrada_especial'),
        section.get('hora_salida_especial'),
        section.get('hora_limite_tardanza_especial'),
    ])

    if not has_special_schedule:
        return {
            **base_schedule,
            'schedule_scope': 'turno',
            'special_schedule_active': False,
        }

    return {
        **base_schedule,
        'turno': section.get('turno') or base_schedule.get('turno'),
        'hora_entrada': _normalize_time_value(section.get('hora_entrada_especial') or base_schedule.get('hora_entrada')),
        'hora_salida': _normalize_time_value(section.get('hora_salida_especial') or base_schedule.get('hora_salida')),
        'hora_limite_tardanza': _normalize_time_value(
            section.get('hora_limite_tardanza_especial') or base_schedule.get('hora_limite_tardanza')
        ),
        'schedule_scope': 'especial',
        'special_schedule_active': True,
    }


def _get_teacher_grace_minutes(profile, schedule):
    try:
        configured = int(profile.get('margen_tardanza_minutos'))
    except (TypeError, ValueError):
        configured = None

    if configured is not None and configured >= 0:
        return configured

    if schedule.get('hora_entrada') and schedule.get('hora_limite_tardanza'):
        return max(
            0,
            _time_to_minutes(schedule.get('hora_limite_tardanza')) - _time_to_minutes(schedule.get('hora_entrada'))
        )

    return 30


def _build_effective_schedule(schedule, profile, student=None):
    resolved_schedule = _apply_special_schedule(schedule, student or {})
    base_entry = _normalize_time_value(resolved_schedule.get('hora_entrada')) or '07:00'
    base_exit = _normalize_time_value(resolved_schedule.get('hora_salida')) or _add_minutes_to_time(base_entry, 300)
    late_limit = _normalize_time_value(resolved_schedule.get('hora_limite_tardanza'))
    grace_minutes = _get_teacher_grace_minutes(profile, resolved_schedule)

    return {
        **resolved_schedule,
        'hora_entrada': base_entry,
        'hora_salida': base_exit,
        'hora_limite_tardanza': late_limit or _add_minutes_to_time(base_entry, grace_minutes),
        'margen_tardanza_minutos': grace_minutes,
    }


def _status_label(status):
    return {
        'presente': 'A tiempo',
        'tarde': 'Tardanza',
        'ausente': 'Ausente',
        'justificado': 'Justificado',
    }.get(status, 'Registrado')


def _event_label(event_type):
    return {
        'check_in': 'Entrada',
        'check_out': 'Salida',
        'manual': 'Contingencia manual',
    }.get(event_type, 'Registro')


def _build_scan_meta(
    scan_time,
    schedule,
    profile,
    student=None,
    status=None,
    late_minutes=None,
    late_limit=None,
    qr_mode=None,
    event_type='check_in',
    geo_meta=None,
    device_meta=None,
):
    effective_schedule = _build_effective_schedule(schedule, profile, student)
    computed_late = max(
        0,
        _time_to_minutes(scan_time) - _time_to_minutes(effective_schedule.get('hora_limite_tardanza'))
    )
    resolved_status = status or ('tarde' if computed_late > 0 else 'presente')
    resolved_late = computed_late if late_minutes is None else max(0, int(late_minutes))

    meta = {
        'status': resolved_status,
        'status_label': _status_label(resolved_status),
        'late_minutes': resolved_late,
        'late_limit': _normalize_time_value(late_limit or effective_schedule.get('hora_limite_tardanza')),
        'grace_minutes': effective_schedule.get('margen_tardanza_minutos', 30),
        'qr_mode': qr_mode,
        'scanned_at': _normalize_time_value(scan_time),
        'turno': effective_schedule.get('turno') or _get_turno_actual(scan_time),
        'event_type': event_type,
        'event_label': _event_label(event_type),
        'schedule_scope': effective_schedule.get('schedule_scope') or 'turno',
        'special_schedule_active': bool(effective_schedule.get('special_schedule_active')),
    }

    if geo_meta:
        meta.update({
            'geo_captured': bool(geo_meta.get('captured')),
            'geo_distance_m': geo_meta.get('distance_m'),
            'geo_radius_m': geo_meta.get('radius_m'),
            'geo_outside_perimeter': bool(geo_meta.get('outside_perimeter')),
        })

    if device_meta:
        meta.update({
            'device_status': device_meta.get('status'),
            'device_label': device_meta.get('label'),
        })

    return meta


def _can_manage_student(profile, student):
    role = (profile.get('role') or '').strip().lower()
    if role == 'admin':
        return True

    if role != 'teacher':
        return False

    section_ids = profile.get('secciones_ids') or []
    if not section_ids:
        return True

    return student.get('grade_section_id') in section_ids


def _student_select_fields():
    return (
        'id, nombre, matricula, school_id, parent_id, grade_section_id, qr_token, '
        'grade_sections:grade_section_id('
        'id, grado, seccion, turno, special_schedule_enabled, '
        'hora_entrada_especial, hora_salida_especial, hora_limite_tardanza_especial)'
    )


def _student_select_fields_for_missing(missing_columns=None):
    missing_columns = missing_columns or set()
    student_school_field = '' if 'school_id' in missing_columns else 'school_id, '
    special_fields = (
        ''
        if missing_columns.intersection({
            'special_schedule_enabled',
            'hora_entrada_especial',
            'hora_salida_especial',
            'hora_limite_tardanza_especial',
        })
        else ', special_schedule_enabled, hora_entrada_especial, hora_salida_especial, hora_limite_tardanza_especial'
    )

    return (
        f'id, nombre, matricula, {student_school_field}parent_id, grade_section_id, qr_token, '
        f'grade_sections:grade_section_id(id, grado, seccion, turno{special_fields})'
    )


def _fetch_student(field_name, value):
    missing_columns = set()
    select_fields = _student_select_fields_for_missing(missing_columns)

    while True:
        try:
            result = supabase.table('students') \
                .select(select_fields) \
                .eq(field_name, value) \
                .limit(1) \
                .execute()

            rows = result.data or []
            return rows[0] if rows else None
        except Exception as exc:
            missing_column = _missing_column_name(exc)
            if missing_column and missing_column not in missing_columns:
                missing_columns.add(missing_column)
                select_fields = _student_select_fields_for_missing(missing_columns)
                continue
            raise


def _get_student(student_id):
    return _fetch_student('id', student_id)


def _get_student_by_matricula(matricula):
    return _fetch_student('matricula', matricula)


def _get_attendance_for_day(student_id, fecha):
    result = supabase.table('attendance') \
        .select('*') \
        .eq('student_id', student_id) \
        .eq('fecha', fecha) \
        .limit(1) \
        .execute()

    rows = result.data or []
    return rows[0] if rows else None


def _insert_audit(user_id, accion, registro_id, metadata=None):
    try:
        supabase.table('audit_log').insert({
            'user_id': user_id,
            'accion': accion,
            'tabla': 'attendance',
            'registro_id': registro_id,
            'dispositivo': request.user_agent.string[:80] if request.user_agent and request.user_agent.string else 'backend',
            'metadata': metadata or {},
        }).execute()
    except Exception:
        pass


def _ensure_authorized_device(user_id, profile, payload):
    fingerprint = str(payload.get('deviceFingerprint') or '').strip()
    device_name = str(payload.get('deviceName') or '').strip() or 'Dispositivo sin nombre'
    device_type = str(payload.get('deviceType') or '').strip() or 'web'
    platform = str(payload.get('platform') or '').strip() or None
    app_version = str(payload.get('appVersion') or '').strip() or None
    now_iso = datetime.utcnow().isoformat()

    if not fingerprint:
        return {
            'status': 'not_provided',
            'label': 'Dispositivo no identificado',
            'enforced': False,
        }

    try:
        existing_result = supabase.table('authorized_devices') \
            .select('id, status, device_name') \
            .eq('profile_id', user_id) \
            .eq('device_fingerprint', fingerprint) \
            .limit(1) \
            .execute()

        existing_rows = existing_result.data or []
        client_ip = _get_client_ip()
        user_agent = request.user_agent.string[:500] if request.user_agent and request.user_agent.string else None

        if existing_rows:
            device = existing_rows[0]
            supabase.table('authorized_devices').update({
                'device_name': device_name,
                'device_type': device_type,
                'platform': platform,
                'app_version': app_version,
                'last_ip': client_ip,
                'last_user_agent': user_agent,
                'last_seen_at': now_iso,
            }).eq('id', device['id']).execute()

            if device.get('status') != 'approved':
                raise PermissionError(DEVICE_BLOCK_MESSAGE)

            return {
                'status': device.get('status'),
                'label': device.get('device_name') or device_name,
                'fingerprint': fingerprint,
                'enforced': True,
            }

        approved_result = supabase.table('authorized_devices') \
            .select('id') \
            .eq('profile_id', user_id) \
            .eq('status', 'approved') \
            .execute()

        approved_count = len(approved_result.data or [])
        next_status = 'approved' if approved_count == 0 else 'pending'
        notes = (
            'Primer dispositivo aprobado automaticamente para acelerar la puesta en marcha.'
            if next_status == 'approved'
            else 'Pendiente de aprobacion administrativa.'
        )

        insert_result = supabase.table('authorized_devices').insert({
            'profile_id': user_id,
            'device_fingerprint': fingerprint,
            'device_name': device_name,
            'device_type': device_type,
            'platform': platform,
            'app_version': app_version,
            'last_ip': client_ip,
            'last_user_agent': user_agent,
            'status': next_status,
            'approved_by': user_id if next_status == 'approved' else None,
            'approved_at': now_iso if next_status == 'approved' else None,
            'notes': notes,
            'first_seen_at': now_iso,
            'last_seen_at': now_iso,
        }).execute()

        inserted = (insert_result.data or [{}])[0]
        if next_status != 'approved':
            raise PermissionError(DEVICE_BLOCK_MESSAGE)

        return {
            'status': inserted.get('status', next_status),
            'label': inserted.get('device_name') or device_name,
            'fingerprint': fingerprint,
            'enforced': True,
        }
    except PermissionError:
        raise
    except Exception:
        return {
            'status': 'unavailable',
            'label': device_name,
            'fingerprint': fingerprint,
            'enforced': False,
        }


def _haversine_distance_m(lat1, lon1, lat2, lon2):
    earth_radius_m = 6371000
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    arc = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )

    return 2 * earth_radius_m * math.asin(math.sqrt(arc))


def _capture_geo_event(attendance_id, student_id, user_id, event_type, payload, school=None):
    geo = payload.get('geo') if isinstance(payload.get('geo'), dict) else {}
    latitude = _safe_float(geo.get('latitude'))
    longitude = _safe_float(geo.get('longitude'))
    accuracy_m = _safe_float(geo.get('accuracy'))

    if latitude is None or longitude is None:
        return {
            'captured': False,
        }

    source = str(geo.get('source') or 'web').strip().lower()
    if source not in ['mobile', 'web', 'system']:
        source = 'web'

    school_latitude = _safe_float((school or {}).get('latitude'))
    school_longitude = _safe_float((school or {}).get('longitude'))
    allowed_radius_m = _safe_float((school or {}).get('allowed_radius_m'))
    distance_m = None
    outside_perimeter = False

    if school_latitude is not None and school_longitude is not None:
        distance_m = round(_haversine_distance_m(latitude, longitude, school_latitude, school_longitude), 2)
        if allowed_radius_m is not None and allowed_radius_m > 0:
            outside_perimeter = distance_m > allowed_radius_m

    metadata = {
        'accuracy_m': accuracy_m,
        'outside_perimeter': outside_perimeter,
        'distance_m': distance_m,
        'radius_m': allowed_radius_m,
    }

    try:
        supabase.table('attendance_geo_events').insert({
            'attendance_id': attendance_id,
            'student_id': student_id,
            'recorded_by': user_id,
            'event_type': event_type,
            'latitude': latitude,
            'longitude': longitude,
            'accuracy_m': accuracy_m,
            'source': source,
            'metadata': metadata,
        }).execute()
    except Exception:
        pass

    return {
        'captured': True,
        'distance_m': distance_m,
        'radius_m': allowed_radius_m,
        'outside_perimeter': outside_perimeter,
        'accuracy_m': accuracy_m,
    }


def _get_parent_recipients(student):
    recipients = {}

    try:
        links_result = supabase.table('parents') \
            .select('relacion, profile_id, profiles:profile_id(id, full_name, email, phone)') \
            .eq('student_id', student['id']) \
            .execute()

        for link in links_result.data or []:
            profile = link.get('profiles') or {}
            recipient_id = profile.get('id') or link.get('profile_id')
            if not recipient_id:
                continue

            recipients[recipient_id] = {
                'id': recipient_id,
                'full_name': profile.get('full_name'),
                'email': profile.get('email'),
                'phone': profile.get('phone'),
                'relacion': link.get('relacion') or 'tutor',
            }
    except Exception:
        pass

    parent_id = student.get('parent_id')
    if parent_id and parent_id not in recipients:
        try:
            profile_result = supabase.table('profiles') \
                .select('id, full_name, email, phone') \
                .eq('id', parent_id) \
                .single() \
                .execute()
            profile = profile_result.data or {}
            if profile:
                recipients[parent_id] = {
                    'id': profile.get('id'),
                    'full_name': profile.get('full_name'),
                    'email': profile.get('email'),
                    'phone': profile.get('phone'),
                    'relacion': 'tutor',
                }
        except Exception:
            pass

    return list(recipients.values())


def _recent_attendance_counts(student_id, fecha):
    try:
        reference_date = datetime.fromisoformat(fecha).date()
    except ValueError:
        reference_date = datetime.utcnow().date()

    start_date = (reference_date - timedelta(days=30)).isoformat()
    result = supabase.table('attendance') \
        .select('estado') \
        .eq('student_id', student_id) \
        .gte('fecha', start_date) \
        .lte('fecha', reference_date.isoformat()) \
        .execute()

    rows = result.data or []
    return {
        'ausente': sum(1 for row in rows if row.get('estado') == 'ausente'),
        'tarde': sum(1 for row in rows if row.get('estado') == 'tarde'),
    }


def _queue_attendance_alerts(student, attendance, fecha, geo_meta=None):
    status = (attendance.get('estado') or '').strip().lower()
    if status not in ['ausente', 'tarde']:
        return None

    recipients = _get_parent_recipients(student)
    if not recipients:
        return None

    recent_counts = _recent_attendance_counts(student['id'], fecha)
    alert_type = None
    subject = None
    priority = 7

    if status == 'ausente':
        alert_type = 'absence'
        subject = f'Ausencia registrada: {student.get("nombre") or "Estudiante"}'
        priority = 8
    elif recent_counts['tarde'] >= 3:
        alert_type = 'late_recurrence'
        subject = f'Tardanza recurrente: {student.get("nombre") or "Estudiante"}'
        priority = 7

    if not alert_type:
        return None

    base_payload = {
        'student_name': student.get('nombre'),
        'student_code': student.get('matricula'),
        'attendance_date': fecha,
        'attendance_status': status,
        'late_count_last_30_days': recent_counts['tarde'],
        'absence_count_last_30_days': recent_counts['ausente'],
        'geo_outside_perimeter': bool((geo_meta or {}).get('outside_perimeter')),
        'attendance_id': attendance.get('id'),
    }

    queue_rows = []
    for recipient in recipients:
        channels = []
        if recipient.get('email'):
            channels.append('email')
        if recipient.get('phone'):
            channels.append('whatsapp')

        for channel in channels:
            queue_rows.append({
                'recipient_id': recipient['id'],
                'student_id': student['id'],
                'related_table': 'attendance',
                'related_id': attendance.get('id'),
                'channel': channel,
                'template_key': f'attendance_{alert_type}',
                'subject': subject,
                'payload': {
                    **base_payload,
                    'recipient_name': recipient.get('full_name'),
                    'recipient_relation': recipient.get('relacion'),
                    'channel': channel,
                },
                'priority': priority,
                'status': 'pending',
                'scheduled_for': datetime.utcnow().isoformat(),
            })

    if not queue_rows:
        return None

    try:
        supabase.table('notification_queue').insert(queue_rows).execute()
    except Exception:
        return None

    return {
        'type': alert_type,
        'queued': len(queue_rows),
        'recent_counts': recent_counts,
    }


def _append_warning(message, geo_meta):
    if geo_meta and geo_meta.get('outside_perimeter'):
        return f'{message} Fuera del perimetro permitido.'
    return message


@attendance_bp.route('/scan', methods=['POST'])
def scan_qr_attendance():
    try:
        user_id = _current_user()
        payload = request.get_json() or {}
        qr_text = (payload.get('qrText') or payload.get('qr_text') or payload.get('decodedText') or '').strip()

        if not qr_text:
            return jsonify({'error': 'Debes enviar el texto escaneado del QR.'}), 400

        qr_data = _parse_qr_payload(qr_text)
        if not qr_data:
            return jsonify({'error': 'QR no valido para QHERE.'}), 400

        profile = _get_profile(user_id)
        role = (profile.get('role') or '').strip().lower()
        if role not in ['teacher', 'admin']:
            return jsonify({'error': 'No tienes permisos para registrar asistencia por QR.'}), 403

        device_meta = _ensure_authorized_device(user_id, profile, payload)

        student = _get_student(qr_data['student_id'])
        if not student:
            return jsonify({'error': 'Estudiante no encontrado para este QR.'}), 404

        if not _can_manage_student(profile, student):
            return jsonify({'error': 'No puedes registrar asistencia para este estudiante.'}), 403

        secure_match = bool(student.get('qr_token')) and qr_data['credential'] == student.get('qr_token')
        legacy_match = qr_data['credential'] == (student.get('matricula') or '')

        if not secure_match and not legacy_match:
            return jsonify({'error': f"El QR no coincide con {student.get('nombre') or 'el estudiante'}."}), 400

        now = datetime.now()
        fecha = now.date().isoformat()
        hora_actual = now.strftime('%H:%M')
        section = student.get('grade_sections') or {}
        turno = section.get('turno') or _get_turno_actual(hora_actual)
        school_id = profile.get('school_id') or student.get('school_id')
        school = _load_school(school_id)
        schedule = _load_schedule(turno, school_id)
        qr_mode = 'secure' if secure_match else 'legacy'

        existing = _get_attendance_for_day(student['id'], fecha)

        if existing:
            can_upgrade_existing = existing.get('estado') in ['ausente', 'justificado'] or not existing.get('hora_entrada')

            if can_upgrade_existing:
                updates = {
                    'teacher_id': user_id,
                    'hora_entrada': hora_actual,
                    'estado': 'presente',
                    'dispositivo': f'qr-camera:{qr_mode}',
                }

                provisional_scan = _build_scan_meta(
                    hora_actual,
                    schedule,
                    profile,
                    student=student,
                    qr_mode=qr_mode,
                    event_type='check_in',
                    device_meta=device_meta,
                )
                updates['estado'] = provisional_scan['status']
                updates['minutos_tarde'] = provisional_scan['late_minutes']
                updates['limite_tardanza_aplicado'] = provisional_scan['late_limit']

                supabase.table('attendance').update(updates).eq('id', existing['id']).execute()
                attendance = {**existing, **updates}

                geo_meta = _capture_geo_event(attendance['id'], student['id'], user_id, 'check_in', payload, school)
                scan_meta = _build_scan_meta(
                    hora_actual,
                    schedule,
                    profile,
                    student=student,
                    status=attendance.get('estado'),
                    late_minutes=attendance.get('minutos_tarde'),
                    late_limit=attendance.get('limite_tardanza_aplicado'),
                    qr_mode=qr_mode,
                    event_type='check_in',
                    geo_meta=geo_meta,
                    device_meta=device_meta,
                )
                alert_meta = _queue_attendance_alerts(student, attendance, fecha, geo_meta)

                if alert_meta:
                    scan_meta['alerts_queued'] = alert_meta['queued']
                    scan_meta['alert_type'] = alert_meta['type']

                _insert_audit(user_id, 'entrada_qr', attendance['id'], {
                    'qr_mode': qr_mode,
                    'replaced_status': existing.get('estado'),
                    'late_minutes': scan_meta['late_minutes'],
                    'late_limit': scan_meta['late_limit'],
                    'device_status': device_meta.get('status'),
                    'outside_perimeter': geo_meta.get('outside_perimeter'),
                })

                message = (
                    f"Tardanza registrada - {student['nombre']}"
                    if scan_meta['status'] == 'tarde'
                    else f"Asistencia actualizada - {student['nombre']}"
                )

                return jsonify({
                    'action': 'updated',
                    'message': _append_warning(message, geo_meta),
                    'student': student,
                    'attendance': attendance,
                    'scan': scan_meta,
                }), 200

            if existing.get('hora_entrada') and not existing.get('hora_salida'):
                updates = {
                    'teacher_id': user_id,
                    'hora_salida': hora_actual,
                    'dispositivo': f'qr-camera:{qr_mode}',
                }

                supabase.table('attendance').update(updates).eq('id', existing['id']).execute()
                attendance = {**existing, **updates}
                geo_meta = _capture_geo_event(attendance['id'], student['id'], user_id, 'check_out', payload, school)
                scan_meta = _build_scan_meta(
                    hora_actual,
                    schedule,
                    profile,
                    student=student,
                    status=existing.get('estado') or 'presente',
                    late_minutes=existing.get('minutos_tarde') or 0,
                    late_limit=existing.get('limite_tardanza_aplicado'),
                    qr_mode=qr_mode,
                    event_type='check_out',
                    geo_meta=geo_meta,
                    device_meta=device_meta,
                )

                _insert_audit(user_id, 'salida_qr', attendance['id'], {
                    'qr_mode': qr_mode,
                    'device_status': device_meta.get('status'),
                    'outside_perimeter': geo_meta.get('outside_perimeter'),
                })

                return jsonify({
                    'action': 'checked_out',
                    'message': _append_warning(f"Salida registrada - {student['nombre']}", geo_meta),
                    'student': student,
                    'attendance': attendance,
                    'scan': scan_meta,
                }), 200

            duplicate_meta = _build_scan_meta(
                hora_actual,
                schedule,
                profile,
                student=student,
                status=existing.get('estado') or 'presente',
                late_minutes=existing.get('minutos_tarde') or 0,
                late_limit=existing.get('limite_tardanza_aplicado'),
                qr_mode=qr_mode,
                event_type='check_in',
                device_meta=device_meta,
            )

            return jsonify({
                'action': 'duplicate',
                'message': f"{student['nombre']} ya tiene entrada y salida registradas hoy.",
                'student': student,
                'attendance': existing,
                'scan': duplicate_meta,
            }), 200

        provisional_scan = _build_scan_meta(
            hora_actual,
            schedule,
            profile,
            student=student,
            qr_mode=qr_mode,
            event_type='check_in',
            device_meta=device_meta,
        )
        insert_payload = {
            'student_id': student['id'],
            'teacher_id': user_id,
            'fecha': fecha,
            'hora_entrada': hora_actual,
            'estado': provisional_scan['status'],
            'minutos_tarde': provisional_scan['late_minutes'],
            'limite_tardanza_aplicado': provisional_scan['late_limit'],
            'dispositivo': f'qr-camera:{qr_mode}',
        }

        insert_result = supabase.table('attendance').insert(insert_payload).execute()
        inserted_rows = insert_result.data or []
        attendance = inserted_rows[0] if inserted_rows else insert_payload

        geo_meta = {'captured': False}
        if attendance.get('id'):
            geo_meta = _capture_geo_event(attendance['id'], student['id'], user_id, 'check_in', payload, school)
            _insert_audit(user_id, 'entrada_qr', attendance['id'], {
                'qr_mode': qr_mode,
                'late_minutes': provisional_scan['late_minutes'],
                'late_limit': provisional_scan['late_limit'],
                'device_status': device_meta.get('status'),
                'outside_perimeter': geo_meta.get('outside_perimeter'),
            })

        scan_meta = _build_scan_meta(
            hora_actual,
            schedule,
            profile,
            student=student,
            status=attendance.get('estado'),
            late_minutes=attendance.get('minutos_tarde'),
            late_limit=attendance.get('limite_tardanza_aplicado'),
            qr_mode=qr_mode,
            event_type='check_in',
            geo_meta=geo_meta,
            device_meta=device_meta,
        )
        alert_meta = _queue_attendance_alerts(student, attendance, fecha, geo_meta)
        if alert_meta:
            scan_meta['alerts_queued'] = alert_meta['queued']
            scan_meta['alert_type'] = alert_meta['type']

        message = (
            f"Tardanza registrada - {student['nombre']}"
            if scan_meta['status'] == 'tarde'
            else f"Asistencia registrada - {student['nombre']}"
        )

        return jsonify({
            'action': 'created',
            'message': _append_warning(message, geo_meta),
            'student': student,
            'attendance': attendance,
            'scan': scan_meta,
        }), 201
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 401
    except PermissionError as exc:
        return jsonify({'error': str(exc)}), 403
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@attendance_bp.route('/manual', methods=['POST'])
def create_manual_attendance():
    try:
        user_id = _current_user()
        payload = request.get_json() or {}
        profile = _get_profile(user_id)
        role = (profile.get('role') or '').strip().lower()

        if role not in ['teacher', 'admin']:
            return jsonify({'error': 'No tienes permisos para registrar asistencia manual.'}), 403

        device_meta = _ensure_authorized_device(user_id, profile, payload)

        matricula = (payload.get('matricula') or '').strip()
        if not matricula:
            return jsonify({'error': 'La matricula es obligatoria.'}), 400

        action = (payload.get('action') or payload.get('attendance_action') or 'check_in').strip().lower()
        if action not in ['check_in', 'check_out']:
            return jsonify({'error': 'Accion de asistencia no valida.'}), 400

        estado = (payload.get('estado') or 'presente').strip().lower()
        if estado not in ['presente', 'tarde', 'ausente']:
            return jsonify({'error': 'Estado de asistencia no valido.'}), 400

        fecha = (payload.get('fecha') or datetime.now().date().isoformat()).strip()
        hora_actual = (
            payload.get('hora_salida')
            if action == 'check_out'
            else payload.get('hora_entrada')
        ) or datetime.now().strftime('%H:%M')
        hora_actual = _normalize_time_value(hora_actual)
        motivo = (payload.get('motivo') or '').strip()

        student = _get_student_by_matricula(matricula)
        if not student:
            return jsonify({'error': 'Matricula no encontrada.'}), 404

        if not _can_manage_student(profile, student):
            return jsonify({'error': 'No puedes registrar asistencia para este estudiante.'}), 403

        school_id = profile.get('school_id') or student.get('school_id')
        school = _load_school(school_id)
        section = student.get('grade_sections') or {}
        turno = section.get('turno') or _get_turno_actual(hora_actual)
        schedule = _load_schedule(turno, school_id)
        existing = _get_attendance_for_day(student['id'], fecha)

        if action == 'check_out':
            if not existing or not existing.get('hora_entrada'):
                return jsonify({'error': 'No existe una entrada previa para registrar la salida.'}), 409
            if existing.get('hora_salida'):
                return jsonify({'error': 'La salida de este estudiante ya fue registrada hoy.'}), 409

            updates = {
                'teacher_id': user_id,
                'hora_salida': hora_actual,
                'dispositivo': f"manual: {motivo or 'salida sin motivo'}",
            }
            supabase.table('attendance').update(updates).eq('id', existing['id']).execute()
            attendance = {**existing, **updates}

            geo_meta = _capture_geo_event(attendance['id'], student['id'], user_id, 'check_out', payload, school)
            scan_meta = _build_scan_meta(
                hora_actual,
                schedule,
                profile,
                student=student,
                status=existing.get('estado') or 'presente',
                late_minutes=existing.get('minutos_tarde') or 0,
                late_limit=existing.get('limite_tardanza_aplicado'),
                event_type='check_out',
                geo_meta=geo_meta,
                device_meta=device_meta,
            )

            _insert_audit(user_id, 'salida_manual', attendance['id'], {
                'motivo': motivo,
                'device_status': device_meta.get('status'),
                'outside_perimeter': geo_meta.get('outside_perimeter'),
            })

            return jsonify({
                'action': 'checked_out',
                'attendance': attendance,
                'student': student,
                'scan': scan_meta,
                'message': _append_warning(f"Salida manual registrada - {student['nombre']}", geo_meta),
            }), 200

        if existing:
            return jsonify({'error': 'Este estudiante ya tiene asistencia registrada hoy.'}), 409

        provisional_scan = _build_scan_meta(
            hora_actual,
            schedule,
            profile,
            student=student,
            status=estado,
            late_minutes=0 if estado == 'ausente' else None,
            event_type='manual',
            device_meta=device_meta,
        )
        attendance_payload = {
            'student_id': student['id'],
            'teacher_id': user_id,
            'fecha': fecha,
            'hora_entrada': None if estado == 'ausente' else hora_actual,
            'estado': estado,
            'minutos_tarde': 0 if estado == 'ausente' else provisional_scan['late_minutes'],
            'limite_tardanza_aplicado': provisional_scan['late_limit'],
            'dispositivo': f"manual: {motivo or 'sin motivo'}",
        }

        insert_result = supabase.table('attendance').insert(attendance_payload).execute()
        inserted_rows = insert_result.data or []
        attendance = inserted_rows[0] if inserted_rows else attendance_payload

        geo_meta = {'captured': False}
        if attendance and attendance.get('id'):
            geo_meta = _capture_geo_event(attendance['id'], student['id'], user_id, 'manual', payload, school)
            _insert_audit(user_id, 'entrada_manual', attendance['id'], {
                'motivo': motivo,
                'device_status': device_meta.get('status'),
                'outside_perimeter': geo_meta.get('outside_perimeter'),
            })

        scan_meta = _build_scan_meta(
            hora_actual,
            schedule,
            profile,
            student=student,
            status=attendance.get('estado') or estado,
            late_minutes=attendance.get('minutos_tarde'),
            late_limit=attendance.get('limite_tardanza_aplicado'),
            event_type='manual',
            geo_meta=geo_meta,
            device_meta=device_meta,
        )
        alert_meta = _queue_attendance_alerts(student, attendance, fecha, geo_meta)
        if alert_meta:
            scan_meta['alerts_queued'] = alert_meta['queued']
            scan_meta['alert_type'] = alert_meta['type']

        return jsonify({
            'action': 'created',
            'attendance': attendance,
            'student': student,
            'scan': scan_meta,
            'message': _append_warning(
                f'Asistencia manual registrada - {student["nombre"]}',
                geo_meta,
            ),
        }), 201
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 401
    except PermissionError as exc:
        return jsonify({'error': str(exc)}), 403
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400
