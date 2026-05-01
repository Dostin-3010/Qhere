-- QHere - RPC functions for Supabase/PostgREST
-- Ejecutar despues de schema.sql.

begin;

create or replace function public.rpc_daily_attendance_report(
  p_school_id uuid,
  p_report_date date default current_date
)
returns table (
  section_id uuid,
  grado text,
  seccion text,
  turno text,
  total_estudiantes bigint,
  presentes bigint,
  tardios bigint,
  ausentes bigint,
  justificados bigint
)
language sql
stable
as $$
  select
    gs.id as section_id,
    gs.grado,
    gs.seccion,
    gs.turno,
    count(s.id) as total_estudiantes,
    count(a.id) filter (where a.estado = 'presente') as presentes,
    count(a.id) filter (where a.estado = 'tarde') as tardios,
    count(s.id) filter (where a.id is null) as ausentes,
    count(a.id) filter (where a.estado = 'justificado') as justificados
  from public.grade_sections gs
  left join public.students s
    on s.grade_section_id = gs.id
   and s.activo = true
  left join public.attendance a
    on a.student_id = s.id
   and a.fecha = p_report_date
  where gs.school_id = p_school_id
  group by gs.id, gs.grado, gs.seccion, gs.turno
  order by gs.grado, gs.seccion, gs.turno;
$$;

create or replace function public.rpc_student_attendance_summary(
  p_student_id uuid,
  p_from date,
  p_to date
)
returns table (
  student_id uuid,
  total_dias bigint,
  presentes bigint,
  tardios bigint,
  justificados bigint,
  porcentaje_asistencia numeric
)
language sql
stable
as $$
  select
    p_student_id as student_id,
    count(a.id) as total_dias,
    count(a.id) filter (where a.estado = 'presente') as presentes,
    count(a.id) filter (where a.estado = 'tarde') as tardios,
    count(a.id) filter (where a.estado = 'justificado') as justificados,
    case
      when count(a.id) = 0 then 0
      else round((count(a.id) filter (where a.estado in ('presente', 'tarde', 'justificado'))::numeric / count(a.id)::numeric) * 100, 2)
    end as porcentaje_asistencia
  from public.attendance a
  where a.student_id = p_student_id
    and a.fecha between p_from and p_to;
$$;

commit;

notify pgrst, 'reload schema';
