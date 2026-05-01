from flask import Blueprint, jsonify, request

from ..supabase_client import get_supabase_client

teacher_bp = Blueprint('teacher', __name__)

supabase = get_supabase_client()


@teacher_bp.route('/', methods=['GET'])
def get_teachers():
    try:
        result = (
            supabase.table('profiles')
            .select('id, full_name, email, phone, permisos, secciones_ids, margen_tardanza_minutos')
            .eq('role', 'teacher')
            .order('full_name')
            .execute()
        )
        return jsonify(result.data or []), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@teacher_bp.route('/<teacher_id>', methods=['GET'])
def get_teacher(teacher_id):
    try:
        result = (
            supabase.table('profiles')
            .select('id, full_name, email, phone, permisos, secciones_ids, margen_tardanza_minutos')
            .eq('role', 'teacher')
            .eq('id', teacher_id)
            .single()
            .execute()
        )
        return jsonify(result.data), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 404


@teacher_bp.route('/<teacher_id>/students', methods=['GET'])
def get_teacher_students(teacher_id):
    try:
        result = (
            supabase.table('student_teachers')
            .select('subject, students(id, nombre, matricula, grade_sections(grado, seccion, turno))')
            .eq('teacher_id', teacher_id)
            .execute()
        )
        return jsonify(result.data or []), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400


@teacher_bp.route('/<teacher_id>/attendance', methods=['GET'])
def get_teacher_attendance(teacher_id):
    try:
        fecha = request.args.get('fecha')
        query = (
            supabase.table('attendance')
            .select('*, students(id, nombre, matricula)')
            .eq('teacher_id', teacher_id)
        )
        if fecha:
            query = query.eq('fecha', fecha)

        result = query.order('created_at', desc=True).execute()
        return jsonify(result.data or []), 200
    except Exception as exc:
        return jsonify({'error': str(exc)}), 400
