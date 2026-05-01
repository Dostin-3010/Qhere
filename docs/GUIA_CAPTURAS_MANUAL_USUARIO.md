# Guia para Completar Capturas del Manual de Usuario

Esta guia explica como generar las capturas del manual de usuario de QHere.

## Capturas ya generadas

Las siguientes capturas publicas ya fueron generadas automaticamente:

- `01_home.png`: pagina principal.
- `02_login.png`: inicio de sesion.
- `03_solicitud_director.png`: solicitud de acceso directivo.

Ubicacion:

```text
entrega_assets/manual_capturas/
```

## Capturas protegidas pendientes

Estas pantallas requieren iniciar sesion con el rol correspondiente:

- `04_super_admin_dashboard.png`
- `05_admin_dashboard.png`
- `06_admin_center.png`
- `07_admin_students.png`
- `08_admin_teachers.png`
- `09_admin_parents.png`
- `10_admin_excuses.png`
- `11_teacher_dashboard.png`
- `12_teacher_inbox.png`
- `13_teacher_absences.png`
- `14_parent_dashboard.png`
- `15_parent_send_excuse.png`
- `16_parent_history.png`
- `17_student_dashboard.png`
- `18_student_excuses.png`

## Paso 1: abrir Chrome con perfil de capturas

Con el frontend ejecutandose en `http://127.0.0.1:5177`, ejecutar:

```bash
python tools/capture_manual_screenshots.py --base-url http://127.0.0.1:5177 --open-login
```

Esto abre una ventana de Chrome usando un perfil especial llamado:

```text
.manual-chrome-profile
```

## Paso 2: iniciar sesion

Iniciar sesion con el rol que se quiere capturar:

- Super administrador.
- Director / administrador.
- Docente.
- Padre o tutor.
- Estudiante.

Despues de confirmar que el panel carga correctamente, cerrar esa ventana de Chrome.

## Paso 3: capturar rutas protegidas

Ejecutar:

```bash
python tools/capture_manual_screenshots.py --base-url http://127.0.0.1:5177 --all --profile
```

El script intentara capturar todas las rutas protegidas usando la sesion guardada en el perfil.

## Recomendacion importante

Como cada rol tiene permisos diferentes, lo ideal es repetir el proceso por rol:

1. Abrir con `--open-login`.
2. Iniciar sesion con el rol.
3. Cerrar Chrome.
4. Ejecutar `--all --profile`.
5. Verificar que las capturas del rol se hayan actualizado.

Si una ruta redirige al login, significa que el usuario actual no tiene permiso para esa pantalla.

## Regenerar el PDF del manual

Luego de tener las capturas, ejecutar:

```bash
python tools/build_user_manual_pdf.py
```

El PDF final se genera en:

```text
docs/pdf/MANUAL_USUARIO_COMPLETO_QHERE.pdf
```
