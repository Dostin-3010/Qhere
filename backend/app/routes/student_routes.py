from flask import Blueprint, request, jsonify

from ..supabase_client import get_supabase_client

student_bp = Blueprint('student', __name__)

supabase = get_supabase_client()

@student_bp.route('/', methods=['GET'])
def get_students():
    try:
        result = supabase.table('students').select('*, grade_sections(grado, seccion, turno)').execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@student_bp.route('/<student_id>', methods=['GET'])
def get_student(student_id):
    try:
        result = supabase.table('students').select('*').eq('id', student_id).single().execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@student_bp.route('/', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        result = supabase.table('students').insert({
            'nombre'          : data.get('nombre'),
            'matricula'       : data.get('matricula'),
            'grade_section_id': data.get('grade_section_id'),
            'school_id'       : data.get('school_id'),
        }).execute()
        return jsonify(result.data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@student_bp.route('/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data   = request.get_json()
        result = supabase.table('students').update(data).eq('id', student_id).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@student_bp.route('/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        supabase.table('students').delete().eq('id', student_id).execute()
        return jsonify({'message': 'Estudiante eliminado'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
