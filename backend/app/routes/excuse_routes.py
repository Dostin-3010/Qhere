from datetime import datetime, timezone
import json
import os
import uuid
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from flask import Blueprint, jsonify, request

from ..supabase_client import get_supabase_client, get_supabase_settings

excuse_bp = Blueprint('excuse', __name__)

SUPABASE_URL, SUPABASE_SERVICE_KEY = get_supabase_settings()
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_UPLOAD_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
}

supabase = get_supabase_client()


def _get_authenticated_context():
    token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token:
        raise ValueError('No autorizado')

    user = supabase.auth.get_user(token)
    user_id = str(user.user.id)
    profile = supabase.table('profiles').select('role').eq('id', user_id).single().execute()

    if not profile.data:
        raise ValueError('Perfil no encontrado')

    return user_id, profile.data


def _upload_to_storage(bucket_name, object_path, file_bytes, content_type):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError('Falta configurar SUPABASE_URL o SUPABASE_SERVICE_KEY en el backend')

    encoded_path = quote(object_path, safe='/')
    upload_url = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/{bucket_name}/{encoded_path}"
    req = Request(upload_url, data=file_bytes, method='POST')
    req.add_header('Authorization', f'Bearer {SUPABASE_SERVICE_KEY}')
    req.add_header('apikey', SUPABASE_SERVICE_KEY)
    req.add_header('Content-Type', content_type)
    req.add_header('x-upsert', 'false')

    try:
        with urlopen(req) as response:
            response.read()
    except HTTPError as exc:
        raw_body = exc.read().decode('utf-8', errors='ignore')
        try:
            payload = json.loads(raw_body)
            message = payload.get('message') or payload.get('error') or raw_body
        except json.JSONDecodeError:
            message = raw_body or str(exc)
        raise ValueError(f'No se pudo subir la evidencia: {message}') from exc

    return f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket_name}/{encoded_path}"


@excuse_bp.route('/', methods=['GET'])
def get_excuses():
    try:
        user_id, profile = _get_authenticated_context()
        role = profile.get('role')

        if role == 'parent':
            result = supabase.table('excuses').select('*, students(*)').eq('parent_id', user_id).order('created_at', desc=True).execute()
        elif role == 'teacher':
            result = supabase.table('excuses').select('*, students(*)').eq('status', 'pending').order('created_at', desc=True).execute()
        else:
            result = supabase.table('excuses').select('*, students(*)').order('created_at', desc=True).execute()

        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@excuse_bp.route('/upload-evidence', methods=['POST'])
def upload_evidence():
    try:
        user_id, profile = _get_authenticated_context()
        if profile.get('role') != 'parent':
            return jsonify({'error': 'Solo los padres o tutores pueden subir evidencias'}), 403

        student_id = (request.form.get('student_id') or '').strip()
        file = request.files.get('file')

        if not student_id:
            return jsonify({'error': 'Debes indicar el estudiante'}), 400

        if file is None or not file.filename:
            return jsonify({'error': 'Debes adjuntar un archivo'}), 400

        content_type = (file.mimetype or '').lower()
        if content_type not in ALLOWED_UPLOAD_MIME_TYPES:
            return jsonify({'error': 'Solo se permiten archivos JPG, PNG, WebP o PDF'}), 400

        file_bytes = file.read()
        if len(file_bytes) > MAX_UPLOAD_BYTES:
            return jsonify({'error': 'El archivo no puede superar los 5 MB'}), 400

        link = supabase.table('parents').select('id').eq('profile_id', user_id).eq('student_id', student_id).limit(1).execute()
        if not link.data:
            return jsonify({'error': 'No tienes permisos para adjuntar evidencia a ese estudiante'}), 403

        object_path = f"{student_id}/{user_id}-{uuid.uuid4().hex}{ALLOWED_UPLOAD_MIME_TYPES[content_type]}"
        public_url = _upload_to_storage('excuses', object_path, file_bytes, content_type)

        return jsonify({'public_url': public_url, 'path': object_path}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@excuse_bp.route('/', methods=['POST'])
def create_excuse():
    try:
        user_id, profile = _get_authenticated_context()
        if profile.get('role') != 'parent':
            return jsonify({'error': 'Solo los padres o tutores pueden enviar excusas'}), 403

        data = request.get_json()

        result = supabase.table('excuses').insert({
            'student_id': data.get('student_id'),
            'parent_id': user_id,
            'attendance_id': data.get('attendance_id'),
            'absence_date': data.get('absence_date'),
            'excuse_type': data.get('excuse_type'),
            'reason': data.get('reason'),
            'attachment_url': data.get('attachment_url'),
            'status': 'pending'
        }).execute()

        return jsonify(result.data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@excuse_bp.route('/<excuse_id>/review', methods=['PATCH'])
def review_excuse(excuse_id):
    try:
        user_id, _profile = _get_authenticated_context()
        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400

        result = supabase.table('excuses').update({
            'status': new_status,
            'reviewed_by': user_id,
            'reviewed_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', excuse_id).execute()

        if new_status == 'approved':
            excuse = supabase.table('excuses').select('student_id, absence_date').eq('id', excuse_id).single().execute()
            supabase.table('attendance').update({
                'estado': 'justificado'
            }).eq('student_id', excuse.data['student_id']).eq('fecha', excuse.data['absence_date']).execute()

        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
