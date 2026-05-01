from datetime import datetime

from flask import Blueprint, jsonify, request

from ..supabase_client import get_supabase_client

auth_bp = Blueprint('auth', __name__)

supabase = get_supabase_client()
_PROFILE_OPTIONAL_COLUMNS = {}


def _normalize_role(value):
    role = str(value or 'parent').strip().lower()
    return role if role in ['parent', 'teacher', 'admin'] else 'parent'


def _normalize_approval_status(value):
    status = str(value or 'approved').strip().lower()
    return status if status in ['pending', 'approved', 'rejected'] else 'approved'


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


def _profiles_supports_column(column_name):
    if column_name in _PROFILE_OPTIONAL_COLUMNS:
        return _PROFILE_OPTIONAL_COLUMNS[column_name]

    try:
        supabase.table('profiles').select(column_name).limit(1).execute()
        _PROFILE_OPTIONAL_COLUMNS[column_name] = True
    except Exception:
        _PROFILE_OPTIONAL_COLUMNS[column_name] = False

    return _PROFILE_OPTIONAL_COLUMNS[column_name]


def _filter_profile_payload(payload):
    optional_columns = {
        'school_id',
        'approval_status',
        'approval_requested_at',
    }

    next_payload = {}
    for key, value in payload.items():
        if key in optional_columns and not _profiles_supports_column(key):
            continue
        next_payload[key] = value

    return next_payload


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = str(data.get('email') or '').strip().lower()
        password = str(data.get('password') or '')

        if not email or not password:
            return jsonify({'error': 'Email y contrasena requeridos.'}), 400

        result = supabase.auth.sign_in_with_password({
            'email': email,
            'password': password,
        })

        user = result.user
        session = result.session
        profile = _fetch_profile(str(user.id))

        return jsonify({
            'access_token': session.access_token,
            'refresh_token': session.refresh_token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'role': profile.get('role') if profile else None,
                'rol': profile.get('role') if profile else None,
                'full_name': profile.get('full_name') if profile else None,
                'nombre': profile.get('full_name') if profile else None,
                'school_id': profile.get('school_id') if profile else None,
                'approval_status': profile.get('approval_status') if profile else None,
            },
            'profile': profile,
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        supabase.auth.sign_out()
        return jsonify({'message': 'Sesion cerrada.'}), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@auth_bp.route('/me', methods=['GET'])
def me():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
        if not token:
            return jsonify({'error': 'Token requerido.'}), 401

        user = supabase.auth.get_user(token)
        profile = _fetch_profile(str(user.user.id))

        return jsonify({
            'user': {
                'id': str(user.user.id),
                'email': user.user.email,
            },
            'profile': profile,
        }), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        email = str(data.get('email') or '').strip().lower()
        password = str(data.get('password') or '')
        full_name = str(data.get('full_name') or data.get('nombre') or '').strip()
        role = _normalize_role(data.get('role') or data.get('rol'))
        school_id = data.get('school_id')
        approval_status = _normalize_approval_status(data.get('approval_status'))

        if not email or not password or not full_name:
            return jsonify({'error': 'Email, contrasena y nombre completo son obligatorios.'}), 400

        metadata = {
            'full_name': full_name,
            'role': role,
            'approval_status': approval_status,
        }
        if school_id:
            metadata['school_id'] = school_id

        result = supabase.auth.admin.create_user({
            'email': email,
            'password': password,
            'email_confirm': True,
            'user_metadata': metadata,
        })

        user_id = str(result.user.id)
        profile_payload = {
            'id': user_id,
            'email': email,
            'full_name': full_name,
            'role': role,
            'school_id': school_id,
            'approval_status': approval_status,
        }
        if approval_status == 'pending':
            profile_payload['approval_requested_at'] = datetime.utcnow().isoformat()

        supabase.table('profiles').upsert(_filter_profile_payload(profile_payload)).execute()

        return jsonify({
            'message': 'Usuario creado correctamente.',
            'id': user_id,
            'profile': profile_payload,
        }), 201
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400
