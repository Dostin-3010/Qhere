# Diagrama de Base de Datos

Proyecto: QHere - Control de Asistencia Escolar

```mermaid
erDiagram
  schools ||--o{ profiles : asigna
  schools ||--o{ grade_sections : contiene
  schools ||--o{ schedules : define
  schools ||--o{ school_calendar : planifica
  schools ||--o{ students : registra
  schools ||--o{ authorized_devices : autoriza
  schools ||--o{ notification_queue : genera

  profiles ||--o{ parents : vincula
  profiles ||--o{ student_teachers : imparte
  profiles ||--o{ attendance : registra
  profiles ||--o{ excuses : revisa
  profiles ||--o{ audit_log : ejecuta

  grade_sections ||--o{ students : agrupa
  students ||--o{ parents : pertenece
  students ||--o{ student_teachers : recibe
  students ||--o{ attendance : genera
  students ||--o{ excuses : justifica
  attendance ||--o{ excuses : relaciona
  attendance ||--o{ attendance_geo_events : ubica

  schools {
    uuid id PK
    text nombre
    text direccion
    text telefono
    text email
    text director
    date academic_period_start
    date academic_period_end
    numeric latitude
    numeric longitude
    numeric allowed_radius_m
    boolean configurado
  }

  profiles {
    uuid id PK
    uuid school_id FK
    text full_name
    text email
    text role
    text approval_status
    text phone
    text[] permisos
    uuid[] secciones_ids
  }

  grade_sections {
    uuid id PK
    uuid school_id FK
    text grado
    text seccion
    text turno
    boolean special_schedule_enabled
    time hora_entrada_especial
    time hora_salida_especial
    time hora_limite_tardanza_especial
  }

  schedules {
    uuid id PK
    uuid school_id FK
    text turno
    time hora_entrada
    time hora_salida
    time hora_limite_tardanza
  }

  school_calendar {
    uuid id PK
    uuid school_id FK
    date fecha
    text tipo
    text descripcion
  }

  students {
    uuid id PK
    uuid school_id FK
    uuid grade_section_id FK
    text nombre
    text matricula
    text full_name
    text enrollment_code
    uuid parent_id FK
    text qr_token
    boolean activo
  }

  attendance {
    uuid id PK
    uuid student_id FK
    uuid teacher_id FK
    date fecha
    time hora_entrada
    time hora_salida
    text estado
    text dispositivo
    integer minutos_tarde
  }

  excuses {
    uuid id PK
    uuid student_id FK
    uuid parent_id FK
    uuid attendance_id FK
    uuid teacher_id FK
    date absence_date
    text reason
    text attachment_url
    text status
  }
```

## Notas tecnicas

- `profiles` se relaciona con Supabase Auth por medio de `auth.users(id)`.
- `students.qr_token` identifica el QR unico de cada estudiante.
- `attendance` registra entrada, salida, tardanza, dispositivo y relacion con docente.
- `audit_log` conserva trazabilidad de acciones sensibles.
- `authorized_devices` y `attendance_geo_events` cubren control de dispositivo y ubicacion.
