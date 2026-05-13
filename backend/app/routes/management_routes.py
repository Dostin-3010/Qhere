from datetime import datetime
import secrets
import string

from flask import Blueprint, jsonify, request

from ..config import Config
from ..services.notification_service import send_direct_email
from ..supabase_client import get_supabase_client


management_bp = Blueprint('management', __name__)
supabase = get_supabase_client()
_PROFILE_SCHOOL_ID_SUPPORTED = None
_PROFILE_OPTIONAL_COLUMNS = {}

ROLE_LABELS = {
    'admin': 'Director',
    'teacher': 'Docente',
    'parent': 'Padre/Tutor',
}

SUPER_ADMIN_MANAGED_ROLES = ['admin', 'teacher', 'parent']


def _normalize_email(value=''):
    return str(value or '').strip().lower()


def _normalize_optional_uuid(value):
    normalized = str(value or '').strip().lower()
    if normalized in ['', 'undefined', 'null', 'none']:
        return None
    return str(value).strip()


def _utcnow():
    return datetime.utcnow().isoformat()


def _normalize_role(value):
    role = str(value or '').strip().lower()
    return role if role in ['admin', 'teacher', 'parent'] else ''


def _extract_token():
    return request.headers.get('Authorization', '').replace('Bearer ', '').strip()


def _fetch_profile(user_id):
    result = (
        supabase.table('profiles')
        .select('*')
        .eq('id', user_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _fetch_school(school_id):
    if not school_id:
        return None
    result = (
        supabase.table('schools')
        .select('*')
        .eq('id', school_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _delete_profile(profile_id):
    supabase.table('profiles').delete().eq('id', profile_id).execute()


def _delete_auth_user(user_id):
    if not user_id:
        return False

    try:
        supabase.auth.admin.delete_user(str(user_id))
        return True
    except Exception:
        return False


def _auth_user_exists(user_id):
    if not user_id:
        return False

    try:
        return bool(_fetch_auth_user(user_id))
    except Exception:
        return False


def _fetch_auth_user(user_id):
    if not user_id:
        return None

    response = supabase.auth.admin.get_user_by_id(str(user_id))
    return getattr(response, 'user', None)


def _get_profile_fields():
    fields = ['id', 'full_name', 'email', 'phone', 'role', 'created_at']
    for column in [
        'school_id',
        'approval_status',
        'approval_requested_at',
        'approved_at',
        'approved_by',
        'approval_note',
        'permisos',
        'secciones_ids',
        'margen_tardanza_minutos',
    ]:
        if _profiles_supports_column(column):
            fields.append(column)
    return fields


def _fetch_profiles_for_super_admin():
    fields = _get_profile_fields()
    result = (
        supabase.table('profiles')
        .select(', '.join(fields))
        .order('created_at', desc=True)
        .execute()
    )
    return result.data or []


def _get_auth_user_id(auth_user):
    if not auth_user:
        return None
    return str(getattr(auth_user, 'id', None) or (auth_user.get('id') if isinstance(auth_user, dict) else '') or '').strip()


def _update_auth_metadata(user_id, updates):
    auth_user = _fetch_auth_user(user_id)
    if not auth_user:
        return None

    current_metadata = _extract_user_metadata(auth_user)
    next_metadata = {**current_metadata, **{key: value for key, value in updates.items() if value is not None}}
    response = supabase.auth.admin.update_user_by_id(str(user_id), {
        'user_metadata': next_metadata,
    })
    return getattr(response, 'user', None)


def _find_auth_user_by_email(email):
    normalized_email = _normalize_email(email)
    if not normalized_email:
        return None

    page = 1
    while True:
        users = supabase.auth.admin.list_users(page=page, per_page=200) or []
        if not users:
            return None

        for user in users:
            user_email = _normalize_email(getattr(user, 'email', None) or (user.get('email') if isinstance(user, dict) else None))
            if user_email == normalized_email:
                return user

        if len(users) < 200:
            return None
        page += 1


def _cleanup_orphan_profile_by_email(email):
    profile_fields = ['id', 'email', 'full_name', 'phone', 'role', 'created_at']
    if _profiles_supports_column('approval_status'):
        profile_fields.append('approval_status')
    if _profiles_supports_column('approval_requested_at'):
        profile_fields.append('approval_requested_at')
    if _profiles_supports_column('approval_note'):
        profile_fields.append('approval_note')
    if _profiles_supports_school_id():
        profile_fields.append('school_id')

    result = (
        supabase.table('profiles')
        .select(', '.join(profile_fields))
        .eq('email', _normalize_email(email))
        .limit(1)
        .execute()
    )

    rows = result.data or []
    if not rows:
        return None

    profile_row = rows[0]
    if _auth_user_exists(profile_row.get('id')):
        return profile_row

    _delete_profile(profile_row.get('id'))
    return None


def _create_school_record(payload):
    result = (
        supabase.table('schools')
        .insert(payload)
        .execute()
    )

    rows = result.data or []
    if rows:
        return rows[0]

    fallback = (
        supabase.table('schools')
        .select('*')
        .eq('nombre', payload.get('nombre'))
        .order('created_at', desc=True)
        .limit(1)
        .execute()
    )
    fallback_rows = fallback.data or []
    return fallback_rows[0] if fallback_rows else None


def _profiles_supports_school_id():
    global _PROFILE_SCHOOL_ID_SUPPORTED

    if _PROFILE_SCHOOL_ID_SUPPORTED is not None:
        return _PROFILE_SCHOOL_ID_SUPPORTED

    try:
        supabase.table('profiles').select('school_id').limit(1).execute()
        _PROFILE_SCHOOL_ID_SUPPORTED = True
    except Exception:
        _PROFILE_SCHOOL_ID_SUPPORTED = False
        return False

    return _PROFILE_SCHOOL_ID_SUPPORTED


def _profiles_supports_column(column_name):
    if column_name in _PROFILE_OPTIONAL_COLUMNS:
        return _PROFILE_OPTIONAL_COLUMNS[column_name]

    try:
        supabase.table('profiles').select(column_name).limit(1).execute()
        _PROFILE_OPTIONAL_COLUMNS[column_name] = True
    except Exception:
        return False

    return _PROFILE_OPTIONAL_COLUMNS[column_name]


def _filter_profile_payload(payload):
    optional_columns = {
        'school_id',
        'approval_status',
        'approval_requested_at',
        'approved_at',
        'approved_by',
        'approval_note',
    }

    next_payload = {}
    for key, value in payload.items():
        if key in optional_columns and not _profiles_supports_column(key):
            continue
        next_payload[key] = value

    return next_payload


def _extract_user_metadata(auth_user):
    metadata = getattr(auth_user, 'user_metadata', None)
    if isinstance(metadata, dict):
        return metadata

    if isinstance(auth_user, dict):
        metadata = auth_user.get('user_metadata')
        if isinstance(metadata, dict):
            return metadata

    return {}


def _resolve_school_id_for_profile(profile, auth_user=None):
    if not profile:
        return None

    direct_school_id = _normalize_optional_uuid(profile.get('school_id'))
    if direct_school_id:
        return direct_school_id

    metadata_school_id = _normalize_optional_uuid(_extract_user_metadata(auth_user).get('school_id'))
    if metadata_school_id:
        return metadata_school_id

    if profile.get('role') == 'admin':
        full_name = str(profile.get('full_name') or '').strip()
        if full_name:
            result = (
                supabase.table('schools')
                .select('id')
                .eq('director', full_name)
                .order('created_at', desc=True)
                .limit(1)
                .execute()
            )
            rows = result.data or []
            if rows:
                return rows[0].get('id')

    return None


def _resolve_approval_status_for_profile(profile, auth_user=None):
    direct_status = str((profile or {}).get('approval_status') or '').strip().lower()
    if direct_status in ['pending', 'approved', 'rejected']:
        return direct_status

    metadata_status = str(_extract_user_metadata(auth_user).get('approval_status') or '').strip().lower()
    if metadata_status in ['pending', 'approved', 'rejected']:
        return metadata_status

    return 'approved'


def _is_super_admin(profile):
    return _normalize_email(profile.get('email')) == Config.SUPER_ADMIN_EMAIL


def _require_profile():
    token = _extract_token()
    if not token:
        return None, None, (jsonify({'error': 'Token requerido.'}), 401)

    try:
        auth_user = supabase.auth.get_user(token).user
        profile = _fetch_profile(str(auth_user.id))
    except Exception as exc:
        return None, None, (jsonify({'error': str(exc)}), 401)

    if not profile:
        return None, None, (jsonify({'error': 'No se encontro el perfil del usuario.'}), 403)

    resolved_school_id = _resolve_school_id_for_profile(profile, auth_user)
    if resolved_school_id:
        profile['school_id'] = resolved_school_id
    profile['approval_status'] = _resolve_approval_status_for_profile(profile, auth_user)

    return auth_user, profile, None


def _require_director():
    auth_user, profile, error_response = _require_profile()
    if error_response:
        return None, None, error_response

    if profile.get('role') != 'admin':
        return None, None, (jsonify({'error': 'Solo direccion puede realizar esta accion.'}), 403)

    if profile.get('approval_status') != 'approved' and not _is_super_admin(profile):
        return None, None, (jsonify({'error': 'Tu acceso directivo aun no esta aprobado.'}), 403)

    return auth_user, profile, None


def _require_super_admin():
    auth_user, profile, error_response = _require_director()
    if error_response:
        return None, None, error_response

    if not _is_super_admin(profile):
        return None, None, (jsonify({'error': 'Este panel es exclusivo del administrador absoluto.'}), 403)

    return auth_user, profile, None


def _is_schema_cache_column_error(exc):
    message = str(exc or '').lower()
    return (
        'pgrst204' in message
        or 'schema cache' in message
        or 'could not find' in message
        or 'column' in message and 'does not exist' in message
    )


def _map_grade_section(row):
    return {
        'id': row.get('id'),
        'school_id': row.get('school_id'),
        'grado': row.get('grado'),
        'seccion': row.get('seccion'),
        'turno': row.get('turno'),
        'special_schedule_enabled': bool(row.get('special_schedule_enabled')),
        'hora_entrada_especial': row.get('hora_entrada_especial'),
        'hora_salida_especial': row.get('hora_salida_especial'),
        'hora_limite_tardanza_especial': row.get('hora_limite_tardanza_especial'),
    }


def _find_grade_section(school_id, grado, seccion, turno):
    result = (
        supabase.table('grade_sections')
        .select('*')
        .eq('school_id', school_id)
        .eq('grado', grado)
        .eq('seccion', seccion)
        .eq('turno', turno)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _save_grade_section_row(mode, section_id, full_payload, compatible_payload):
    try:
        query = supabase.table('grade_sections')
        result = (
            query.update(full_payload).eq('id', section_id).execute()
            if mode == 'update'
            else query.insert(full_payload).execute()
        )
        rows = result.data or []
        return rows[0] if rows else _find_grade_section(
            compatible_payload['school_id'],
            compatible_payload['grado'],
            compatible_payload['seccion'],
            compatible_payload['turno'],
        )
    except Exception as exc:
        if not _is_schema_cache_column_error(exc):
            existing = _find_grade_section(
                compatible_payload['school_id'],
                compatible_payload['grado'],
                compatible_payload['seccion'],
                compatible_payload['turno'],
            )
            if mode == 'insert' and existing:
                return existing
            raise

    try:
        query = supabase.table('grade_sections')
        result = (
            query.update(compatible_payload).eq('id', section_id).execute()
            if mode == 'update'
            else query.insert(compatible_payload).execute()
        )
        rows = result.data or []
        return rows[0] if rows else _find_grade_section(
            compatible_payload['school_id'],
            compatible_payload['grado'],
            compatible_payload['seccion'],
            compatible_payload['turno'],
        )
    except Exception:
        existing = _find_grade_section(
            compatible_payload['school_id'],
            compatible_payload['grado'],
            compatible_payload['seccion'],
            compatible_payload['turno'],
        )
        if mode == 'insert' and existing:
            return existing
        raise


def _generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + '@#'
    while True:
        candidate = ''.join(secrets.choice(alphabet) for _ in range(length))
        if any(char.islower() for char in candidate) and any(char.isupper() for char in candidate) and any(char.isdigit() for char in candidate):
            return candidate


@management_bp.route('/users', methods=['GET'])
def list_managed_users():
    _, actor_profile, error_response = _require_director()
    if error_response:
        return error_response

    role = _normalize_role(request.args.get('role'))
    if request.args.get('role') and not role:
        return jsonify({'error': 'Rol invalido.'}), 400

    school_id = actor_profile.get('school_id')

    try:
        schools = []
        school = _fetch_school(school_id)
        if school:
            schools = [school]

        sections = []
        scoped_section_ids = set()
        if school_id:
            sections_result = (
                supabase.table('grade_sections')
                .select('*')
                .eq('school_id', school_id)
                .order('grado')
                .order('seccion')
                .execute()
            )
            sections = sections_result.data or []
            scoped_section_ids = {item.get('id') for item in sections}

        users = []
        for item in _fetch_profiles_for_super_admin():
            if role and item.get('role') != role:
                continue
            if item.get('role') not in SUPER_ADMIN_MANAGED_ROLES:
                continue
            if item.get('approval_status') == 'rejected':
                continue
            if _is_super_admin(item):
                continue

            item_school_id = _normalize_optional_uuid(item.get('school_id'))
            item_sections = item.get('secciones_ids') if isinstance(item.get('secciones_ids'), list) else []
            section_match = any(section_id in scoped_section_ids for section_id in item_sections)
            if not _is_super_admin(actor_profile) and item_school_id != school_id and not section_match:
                continue

            auth_user = None
            try:
                auth_user = _fetch_auth_user(item.get('id'))
            except Exception:
                auth_user = None

            resolved_school_id = _resolve_school_id_for_profile(item, auth_user) or item_school_id
            users.append({
                **item,
                'school_id': resolved_school_id,
                'approval_status': _resolve_approval_status_for_profile(item, auth_user),
                'auth_exists': bool(auth_user),
                'school': _fetch_school(resolved_school_id),
            })

        return jsonify({
            'users': users,
            'sections': sections,
            'schools': schools,
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/schools/<school_id>/sections', methods=['PUT'])
def save_school_sections(school_id):
    _, actor_profile, error_response = _require_director()
    if error_response:
        return error_response

    school_id = _normalize_optional_uuid(school_id)
    if not school_id:
        return jsonify({'error': 'Centro invalido.'}), 400

    if not _is_super_admin(actor_profile) and _normalize_optional_uuid(actor_profile.get('school_id')) != school_id:
        return jsonify({'error': 'No tienes permiso para modificar este centro.'}), 403

    if not _fetch_school(school_id):
        return jsonify({'error': 'No se encontro el centro educativo.'}), 404

    data = request.get_json() or {}
    sections = data.get('sections') or []
    if not isinstance(sections, list):
        return jsonify({'error': 'La lista de cursos no es valida.'}), 400

    normalized_sections = []
    for section in sections:
        if not isinstance(section, dict):
            continue

        grado = str(section.get('grado') or '').strip()
        seccion = str(section.get('seccion') or '').strip()
        turno = str(section.get('turno') or '').strip()
        if not grado or not seccion or turno not in ['manana', 'tarde', 'noche']:
            continue

        normalized_sections.append({
            'id': _normalize_optional_uuid(section.get('id')),
            'grado': grado,
            'seccion': seccion,
            'turno': turno,
            'special_schedule_enabled': bool(section.get('special_schedule_enabled')),
            'hora_entrada_especial': section.get('hora_entrada_especial') or None,
            'hora_salida_especial': section.get('hora_salida_especial') or None,
            'hora_limite_tardanza_especial': section.get('hora_limite_tardanza_especial') or None,
        })

    try:
        existing_result = (
            supabase.table('grade_sections')
            .select('id')
            .eq('school_id', school_id)
            .execute()
        )
        persisted_ids = {item.get('id') for item in existing_result.data or []}

        saved_sections = []
        for section in normalized_sections:
            full_payload = {
                'school_id': school_id,
                'grado': section['grado'],
                'seccion': section['seccion'],
                'turno': section['turno'],
                'special_schedule_enabled': section['special_schedule_enabled'],
                'hora_entrada_especial': section['hora_entrada_especial'] if section['special_schedule_enabled'] else None,
                'hora_salida_especial': section['hora_salida_especial'] if section['special_schedule_enabled'] else None,
                'hora_limite_tardanza_especial': section['hora_limite_tardanza_especial'] if section['special_schedule_enabled'] else None,
            }
            compatible_payload = {
                'school_id': school_id,
                'grado': section['grado'],
                'seccion': section['seccion'],
                'turno': section['turno'],
            }
            mode = 'update' if section.get('id') in persisted_ids else 'insert'
            saved = _save_grade_section_row(mode, section.get('id'), full_payload, compatible_payload)
            if saved:
                saved_sections.append(_map_grade_section(saved))

        supabase.table('schools').update({'configurado': True}).eq('id', school_id).execute()

        return jsonify({
            'sections': saved_sections,
            'message': 'Cursos guardados correctamente.',
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


def _send_director_request_email(payload):
    subject = f'Nueva solicitud de direccion - {payload["school_name"]}'
    return send_direct_email(
        Config.DIRECTOR_APPROVAL_EMAIL,
        subject,
        [
            'Se registro una nueva solicitud de direccion en QHere.',
            '',
            f'Centro: {payload["school_name"]}',
            f'Solicitante: {payload["full_name"]}',
            f'Correo: {payload["email"]}',
            f'Telefono: {payload.get("phone") or "No especificado"}',
            f'Fecha: {_utcnow()}',
            '',
            'Revisa la solicitud desde el panel absoluto de administracion.',
        ],
    )


@management_bp.route('/director-requests', methods=['POST'])
def request_director_access():
    data = request.get_json() or {}
    email = _normalize_email(data.get('email'))
    password = str(data.get('password') or '')
    full_name = str(data.get('full_name') or '').strip()
    phone = str(data.get('phone') or '').strip()
    school_name = str(data.get('school_name') or '').strip()
    school_email = _normalize_email(data.get('school_email'))
    school_phone = str(data.get('school_phone') or '').strip()
    school_address = str(data.get('school_address') or '').strip()

    if not email or not password or not full_name or not school_name:
        return jsonify({'error': 'Nombre, correo, contrasena y centro educativo son obligatorios.'}), 400
    if len(password) < 6:
        return jsonify({'error': 'La contrasena debe tener al menos 6 caracteres.'}), 400

    existing_profile = _cleanup_orphan_profile_by_email(email)
    existing_auth_user = _find_auth_user_by_email(email)
    existing_status = _resolve_approval_status_for_profile(existing_profile, existing_auth_user)

    if existing_profile and existing_status != 'rejected':
        if existing_status == 'pending':
            return jsonify({'error': 'Ya tienes una solicitud pendiente con ese correo. Espera la revision del administrador absoluto.'}), 409
        return jsonify({'error': 'Ya existe una cuenta aprobada con ese correo. Inicia sesion o usa recuperacion de contrasena.'}), 409

    if existing_auth_user and not existing_profile:
        metadata_status = _resolve_approval_status_for_profile({}, existing_auth_user)
        if metadata_status != 'rejected':
            return jsonify({'error': 'Ese correo todavia existe en Authentication de Supabase. Si necesitas otra solicitud, rechaza primero la cuenta o usa otro correo.'}), 409

    school = None

    try:
        school = _create_school_record({
            'nombre': school_name,
            'direccion': school_address or None,
            'telefono': school_phone or None,
            'email': school_email or None,
            'director': full_name,
            'configurado': False,
        })
        if not school:
            raise ValueError('No se pudo crear el centro educativo.')

        auth_user = None
        metadata = {
            'full_name': full_name,
            'role': 'admin',
            'approval_status': 'pending',
            'school_id': school['id'],
        }

        if existing_auth_user:
            auth_user_id = _get_auth_user_id(existing_auth_user)
            auth_result = supabase.auth.admin.update_user_by_id(auth_user_id, {
                'password': password,
                'email_confirm': True,
                'user_metadata': metadata,
            })
            auth_user = getattr(auth_result, 'user', None)
        else:
            auth_result = supabase.auth.admin.create_user({
                'email': email,
                'password': password,
                'email_confirm': True,
                'user_metadata': metadata,
            })
            auth_user = auth_result.user

        auth_user_id = str(getattr(auth_user, 'id', None) or _get_auth_user_id(existing_auth_user))
        if not auth_user_id:
            raise ValueError('No se pudo confirmar la cuenta directiva para reenviar la solicitud.')

        profile_payload = {
            'id': auth_user_id,
            'full_name': full_name,
            'email': email,
            'phone': phone or None,
            'role': 'admin',
            'approval_status': 'pending',
            'approval_requested_at': _utcnow(),
        }
        supabase.table('profiles').upsert(_filter_profile_payload({
            **profile_payload,
            'school_id': school['id'],
        })).execute()

        notification_delivery = _send_director_request_email({
            'school_name': school_name,
            'full_name': full_name,
            'email': email,
            'phone': phone,
        })
        notification_warning = None
        if notification_delivery and notification_delivery.get('channel') == 'failed':
            notification_warning = (
                'La solicitud fue creada, pero no se pudo registrar la alerta del panel. '
                'Ejecuta la migracion de notification_queue para permitir el canal panel.'
            )

        return jsonify({
            'message': 'Solicitud enviada. El administrador absoluto podra revisarla desde el panel.',
            'school': school,
            'profile': profile_payload,
            'request_reopened': bool(existing_profile or existing_auth_user),
            'notification_delivery': notification_delivery,
            'notification_warning': notification_warning,
        }), 201
    except Exception as exc:
        if school and school.get('id'):
            try:
                supabase.table('schools').delete().eq('id', school['id']).execute()
            except Exception:
                pass
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/users', methods=['POST'])
def create_managed_user():
    _, actor_profile, error_response = _require_director()
    if error_response:
        return error_response

    data = request.get_json() or {}
    role = _normalize_role(data.get('role'))
    full_name = str(data.get('full_name') or '').strip()
    email = _normalize_email(data.get('email'))
    phone = str(data.get('phone') or '').strip()
    provided_password = str(data.get('password') or '').strip()
    school_id = _normalize_optional_uuid(data.get('school_id')) or actor_profile.get('school_id')
    permisos = data.get('permisos') if isinstance(data.get('permisos'), list) else []
    secciones_ids = data.get('secciones_ids') if isinstance(data.get('secciones_ids'), list) else []
    margen_tardanza = data.get('margen_tardanza_minutos')

    if role not in ['teacher', 'parent', 'admin']:
        return jsonify({'error': 'Rol invalido para este flujo.'}), 400

    if not _is_super_admin(actor_profile) and role == 'admin':
        return jsonify({'error': 'Solo el administrador absoluto puede crear directores.'}), 403

    if not _is_super_admin(actor_profile) and school_id != actor_profile.get('school_id'):
        return jsonify({'error': 'No puedes crear usuarios fuera de tu centro educativo.'}), 403

    if not email or not full_name:
        return jsonify({'error': 'Nombre y correo son obligatorios.'}), 400

    existing_profile = _cleanup_orphan_profile_by_email(email)
    if existing_profile:
        return jsonify({'error': 'Ya existe un perfil registrado con ese correo.'}), 409

    existing_auth_user = _find_auth_user_by_email(email)
    if existing_auth_user:
        return jsonify({'error': 'Ese correo todavia existe en Authentication de Supabase. Eliminelo tambien desde Authentication > Users antes de volver a crearlo.'}), 409

    password = provided_password or _generate_password()

    try:
        auth_result = supabase.auth.admin.create_user({
            'email': email,
            'password': password,
            'email_confirm': True,
            'user_metadata': {
                'full_name': full_name,
                'role': role,
                'school_id': school_id,
                'approval_status': 'approved',
            },
        })

        payload = {
            'id': str(auth_result.user.id),
            'full_name': full_name,
            'email': email,
            'phone': phone or None,
            'role': role,
            'approval_status': 'approved',
            'approved_at': _utcnow(),
            'approved_by': actor_profile.get('id'),
        }
        if role == 'teacher':
            payload['permisos'] = permisos
            payload['secciones_ids'] = secciones_ids
            payload['margen_tardanza_minutos'] = int(margen_tardanza or 30)

        supabase.table('profiles').upsert(_filter_profile_payload({
            **payload,
            'school_id': school_id,
        })).execute()

        return jsonify({
            'message': f'{ROLE_LABELS.get(role, "Usuario")} creado correctamente.',
            'profile': payload,
            'generated_password': None if provided_password else password,
        }), 201
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/overview', methods=['GET'])
def super_admin_overview():
    _, actor_profile, error_response = _require_super_admin()
    if error_response:
        return error_response

    try:
        schools_result = supabase.table('schools').select('*').order('created_at', desc=True).execute()
        schools = schools_result.data or []
        schools_by_id = {school['id']: school for school in schools}

        users = []
        directors = []
        for item in _fetch_profiles_for_super_admin():
            auth_user = None
            try:
                auth_user = _fetch_auth_user(item.get('id'))
            except Exception:
                auth_user = None

            resolved_school_id = _resolve_school_id_for_profile(item, auth_user)
            school = schools_by_id.get(resolved_school_id)
            approval_status = _resolve_approval_status_for_profile(item, auth_user)
            row = {
                **item,
                'school_id': resolved_school_id,
                'approval_status': approval_status,
                'school': school,
                'auth_exists': bool(auth_user),
            }
            users.append(row)
            if item.get('role') == 'admin':
                directors.append(row)

        panel_notifications = []
        try:
            notifications_result = (
                supabase.table('notification_queue')
                .select('id, subject, payload, status, created_at, scheduled_for, recipient_id, channel')
                .eq('channel', 'panel')
                .eq('recipient_id', actor_profile.get('id'))
                .order('created_at', desc=True)
                .limit(8)
                .execute()
            )
            panel_notifications = notifications_result.data or []
        except Exception:
            panel_notifications = []

        return jsonify({
            'super_admin': {
                'email': actor_profile.get('email'),
                'full_name': actor_profile.get('full_name'),
            },
            'stats': {
                'schools': len(schools),
                'directors': len(directors),
                'users': len(users),
                'teachers': len([item for item in users if item.get('role') == 'teacher']),
                'parents': len([item for item in users if item.get('role') == 'parent']),
                'pending_directors': len([item for item in directors if item.get('approval_status') == 'pending']),
            },
            'schools': schools,
            'users': users,
            'directors': directors,
            'panel_notifications': panel_notifications,
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/schools', methods=['POST'])
def create_school():
    _, _, error_response = _require_super_admin()
    if error_response:
        return error_response

    data = request.get_json() or {}
    nombre = str(data.get('nombre') or '').strip()
    direccion = str(data.get('direccion') or '').strip()
    telefono = str(data.get('telefono') or '').strip()
    email = _normalize_email(data.get('email'))
    director = str(data.get('director') or '').strip()

    if not nombre:
        return jsonify({'error': 'El nombre del centro es obligatorio.'}), 400

    try:
        school = _create_school_record({
            'nombre': nombre,
            'direccion': direccion or None,
            'telefono': telefono or None,
            'email': email or None,
            'director': director or None,
            'configurado': False,
        })
        if not school:
            raise ValueError('No se pudo crear el centro educativo.')
        return jsonify({'school': school}), 201
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/schools/<school_id>', methods=['PUT', 'PATCH'])
def update_school(school_id):
    _, _, error_response = _require_super_admin()
    if error_response:
        return error_response

    school_id = _normalize_optional_uuid(school_id)
    if not school_id:
        return jsonify({'error': 'Centro invalido.'}), 400

    if not _fetch_school(school_id):
        return jsonify({'error': 'No se encontro el centro educativo.'}), 404

    data = request.get_json() or {}
    payload = {}
    for key in ['nombre', 'direccion', 'telefono', 'email', 'director']:
        if key in data:
            value = _normalize_email(data.get(key)) if key == 'email' else str(data.get(key) or '').strip()
            payload[key] = value or None

    if 'configurado' in data:
        payload['configurado'] = bool(data.get('configurado'))

    if 'nombre' in payload and not payload['nombre']:
        return jsonify({'error': 'El nombre del centro es obligatorio.'}), 400

    if not payload:
        return jsonify({'error': 'No hay cambios para guardar.'}), 400

    try:
        result = supabase.table('schools').update(payload).eq('id', school_id).execute()
        rows = result.data or []
        school = rows[0] if rows else _fetch_school(school_id)
        return jsonify({'school': school, 'message': 'Centro actualizado correctamente.'}), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


def _school_usage_counts(school_id):
    counts = {
        'users': 0,
        'students': 0,
        'sections': 0,
    }

    if _profiles_supports_school_id():
        try:
            counts['users'] = (
                supabase.table('profiles')
                .select('id', count='exact')
                .eq('school_id', school_id)
                .execute()
                .count or 0
            )
        except Exception:
            counts['users'] = 0

    try:
        counts['students'] = (
            supabase.table('students')
            .select('id', count='exact')
            .eq('school_id', school_id)
            .execute()
            .count or 0
        )
    except Exception:
        counts['students'] = 0

    try:
        counts['sections'] = (
            supabase.table('grade_sections')
            .select('id', count='exact')
            .eq('school_id', school_id)
            .execute()
            .count or 0
        )
    except Exception:
        counts['sections'] = 0

    return counts


@management_bp.route('/super-admin/schools/<school_id>', methods=['DELETE'])
def delete_school(school_id):
    _, actor_profile, error_response = _require_super_admin()
    if error_response:
        return error_response

    school_id = _normalize_optional_uuid(school_id)
    force = str(request.args.get('force') or '').lower() in ['1', 'true', 'yes']
    if not school_id:
        return jsonify({'error': 'Centro invalido.'}), 400

    school = _fetch_school(school_id)
    if not school:
        return jsonify({'error': 'No se encontro el centro educativo.'}), 404

    counts = _school_usage_counts(school_id)
    if not force and any(counts.values()):
        return jsonify({
            'error': 'El centro tiene usuarios, estudiantes o secciones. Confirma el borrado total para continuar.',
            'counts': counts,
        }), 409

    try:
        if _profiles_supports_school_id():
            profiles_result = (
                supabase.table('profiles')
                .select('id, email, role')
                .eq('school_id', school_id)
                .execute()
            )
            for item in profiles_result.data or []:
                if _normalize_email(item.get('email')) == Config.SUPER_ADMIN_EMAIL:
                    continue
                if not _delete_auth_user(item.get('id')):
                    _delete_profile(item.get('id'))

        supabase.table('students').delete().eq('school_id', school_id).execute()
        supabase.table('grade_sections').delete().eq('school_id', school_id).execute()
        supabase.table('schedules').delete().eq('school_id', school_id).execute()
        try:
            supabase.table('school_calendar').delete().eq('school_id', school_id).execute()
        except Exception:
            pass

        supabase.table('schools').delete().eq('id', school_id).execute()
        return jsonify({
            'message': 'Centro eliminado junto con sus usuarios y datos dependientes.',
            'deleted_school_id': school_id,
            'deleted_by': actor_profile.get('id'),
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/schools/<school_id>/assign-director', methods=['POST'])
def assign_director_to_school(school_id):
    _, actor_profile, error_response = _require_super_admin()
    if error_response:
        return error_response

    school_id = _normalize_optional_uuid(school_id)
    director_profile_id = _normalize_optional_uuid((request.get_json() or {}).get('director_profile_id'))

    if not school_id or not director_profile_id:
        return jsonify({'error': 'Centro y director son obligatorios.'}), 400

    school = _fetch_school(school_id)
    if not school:
        return jsonify({'error': 'No se encontro el centro educativo.'}), 404

    target = _fetch_profile(director_profile_id)
    if not target or target.get('role') != 'admin':
        return jsonify({'error': 'No se encontro un director valido para asignar.'}), 404
    if not _auth_user_exists(director_profile_id):
        return jsonify({'error': 'La cuenta directiva fue borrada de Auth. Elimina ese perfil o crea la cuenta de nuevo.'}), 400

    try:
        supabase.table('schools').update({
            'director': target.get('full_name') or school.get('director'),
        }).eq('id', school_id).execute()

        director_payload = _filter_profile_payload({
            'approval_status': 'approved',
            'approved_by': actor_profile.get('id'),
            'approved_at': _utcnow(),
            'school_id': school_id,
        })

        profile_update_applied = bool(director_payload)
        if profile_update_applied:
            supabase.table('profiles').update(director_payload).eq('id', director_profile_id).execute()
        auth_user = _update_auth_metadata(director_profile_id, {
            'full_name': target.get('full_name'),
            'role': 'admin',
            'school_id': school_id,
            'approval_status': 'approved',
        })

        return jsonify({
            'message': 'Centro y director vinculados correctamente.',
            'school_id': school_id,
            'director_id': director_profile_id,
            'director_name': target.get('full_name'),
            'profile_update_applied': profile_update_applied,
            'auth_metadata_updated': bool(auth_user),
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/users/<profile_id>', methods=['PUT', 'PATCH'])
def update_super_admin_user(profile_id):
    _, actor_profile, error_response = _require_super_admin()
    if error_response:
        return error_response

    target = _fetch_profile(profile_id)
    if not target:
        return jsonify({'error': 'No se encontro el usuario.'}), 404
    if _normalize_email(target.get('email')) == Config.SUPER_ADMIN_EMAIL:
        return jsonify({'error': 'La cuenta super admin no se edita desde este CRUD.'}), 403

    data = request.get_json() or {}
    full_name = str(data.get('full_name') or target.get('full_name') or '').strip()
    email = _normalize_email(data.get('email') or target.get('email'))
    phone = str(data.get('phone') if data.get('phone') is not None else target.get('phone') or '').strip()
    role = _normalize_role(data.get('role') or target.get('role'))
    school_id = _normalize_optional_uuid(data.get('school_id')) if 'school_id' in data else _normalize_optional_uuid(target.get('school_id'))
    approval_status = str(data.get('approval_status') or target.get('approval_status') or 'approved').strip().lower()
    permisos = data.get('permisos') if isinstance(data.get('permisos'), list) else target.get('permisos') or []
    secciones_ids = data.get('secciones_ids') if isinstance(data.get('secciones_ids'), list) else target.get('secciones_ids') or []
    margen_tardanza = data.get('margen_tardanza_minutos', target.get('margen_tardanza_minutos') or 30)

    if role not in SUPER_ADMIN_MANAGED_ROLES:
        return jsonify({'error': 'Rol invalido para este panel.'}), 400
    if approval_status not in ['pending', 'approved', 'rejected']:
        return jsonify({'error': 'Estado invalido.'}), 400
    if not full_name or not email:
        return jsonify({'error': 'Nombre y correo son obligatorios.'}), 400
    if school_id and not _fetch_school(school_id):
        return jsonify({'error': 'El centro seleccionado no existe.'}), 404

    try:
        payload = {
            'full_name': full_name,
            'email': email,
            'phone': phone or None,
            'role': role,
            'approval_status': approval_status,
            'approval_note': str(data.get('approval_note') or '').strip() or None,
        }
        if approval_status == 'approved':
            payload['approved_at'] = target.get('approved_at') or _utcnow()
            payload['approved_by'] = target.get('approved_by') or actor_profile.get('id')
        if role == 'teacher':
            payload['permisos'] = permisos
            payload['secciones_ids'] = secciones_ids
            payload['margen_tardanza_minutos'] = int(margen_tardanza or 30)

        filtered_payload = _filter_profile_payload({
            **payload,
            'school_id': school_id,
        })
        result = supabase.table('profiles').update(filtered_payload).eq('id', profile_id).execute()
        rows = result.data or []
        updated_profile = rows[0] if rows else _fetch_profile(profile_id)

        auth_updates = {
            'full_name': full_name,
            'role': role,
            'school_id': school_id,
            'approval_status': approval_status,
        }
        auth_payload = {'user_metadata': auth_updates}
        if email != _normalize_email(target.get('email')):
            auth_payload['email'] = email
            auth_payload['email_confirm'] = True
        try:
            supabase.auth.admin.update_user_by_id(str(profile_id), auth_payload)
        except Exception:
            pass

        if role == 'admin' and school_id:
            supabase.table('schools').update({'director': full_name}).eq('id', school_id).execute()

        return jsonify({'profile': updated_profile, 'message': 'Usuario actualizado correctamente.'}), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/users/<profile_id>', methods=['DELETE'])
def delete_super_admin_user(profile_id):
    _, _, error_response = _require_super_admin()
    if error_response:
        return error_response

    target = _fetch_profile(profile_id)
    if not target:
        return jsonify({'error': 'No se encontro el usuario.'}), 404
    if _normalize_email(target.get('email')) == Config.SUPER_ADMIN_EMAIL:
        return jsonify({'error': 'No puedes borrar la cuenta super admin.'}), 403

    try:
        if target.get('role') == 'admin':
            school_id = _normalize_optional_uuid(target.get('school_id'))
            if school_id:
                school = _fetch_school(school_id)
                if school and str(school.get('director') or '').strip() == str(target.get('full_name') or '').strip():
                    supabase.table('schools').update({'director': None}).eq('id', school_id).execute()

        auth_deleted = _delete_auth_user(profile_id)
        if not auth_deleted:
            _delete_profile(profile_id)

        return jsonify({
            'message': 'Usuario eliminado del panel y de Authentication.',
            'deleted_profile_id': profile_id,
            'auth_deleted': auth_deleted,
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@management_bp.route('/super-admin/directors/<profile_id>/<action>', methods=['POST'])
def update_director_status(profile_id, action):
    _, actor_profile, error_response = _require_super_admin()
    if error_response:
        return error_response

    normalized_action = str(action or '').strip().lower()
    if normalized_action not in ['approve', 'reject']:
        return jsonify({'error': 'Accion invalida.'}), 400

    target = _fetch_profile(profile_id)
    if not target or target.get('role') != 'admin':
        return jsonify({'error': 'No se encontro la solicitud de direccion.'}), 404

    auth_user = None
    try:
        auth_user = _fetch_auth_user(profile_id)
    except Exception:
        auth_user = None

    school_id = _resolve_school_id_for_profile(target, auth_user)
    school = _fetch_school(school_id)
    note = str((request.get_json() or {}).get('note') or '').strip()

    update_payload = _filter_profile_payload({
        'approval_status': 'approved' if normalized_action == 'approve' else 'rejected',
        'approved_by': actor_profile.get('id'),
        'approved_at': _utcnow() if normalized_action == 'approve' else None,
        'approval_note': note or None,
    })

    try:
        if update_payload:
            supabase.table('profiles').update(update_payload).eq('id', profile_id).execute()
        _update_auth_metadata(profile_id, {
            'full_name': target.get('full_name'),
            'role': 'admin',
            'school_id': school_id,
            'approval_status': 'approved' if normalized_action == 'approve' else 'rejected',
        })

        if school and normalized_action == 'approve':
            supabase.table('schools').update({
                'director': target.get('full_name') or school.get('director'),
            }).eq('id', school['id']).execute()

        try:
            send_direct_email(
                target['email'],
                f'Solicitud de direccion {"aprobada" if normalized_action == "approve" else "rechazada"}',
                [
                    f'Hola {target.get("full_name") or "usuario"},',
                    '',
                    f'Tu solicitud para dirigir el centro "{school.get("nombre") if school else "tu centro"}" fue {"aprobada" if normalized_action == "approve" else "rechazada"}.',
                    note or '',
                    '',
                    'Puedes iniciar sesion en QHere para continuar.' if normalized_action == 'approve' else 'Si necesitas mas informacion, responde a administracion.',
                ],
            )
        except Exception:
            pass

        return jsonify({
            'message': 'Estado actualizado correctamente.',
            'profile_id': profile_id,
            'approval_status': update_payload.get('approval_status', 'approved' if normalized_action == 'approve' else 'rejected'),
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400
