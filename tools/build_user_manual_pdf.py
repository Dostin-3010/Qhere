from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
CAPTURES = ROOT / "entrega_assets" / "manual_capturas"
PDF_DIR = ROOT / "docs" / "pdf"
OUTPUT = PDF_DIR / "MANUAL_USUARIO_COMPLETO_QHERE.pdf"

BLACK = colors.HexColor("#111111")
RED = colors.HexColor("#E82127")
LIGHT = colors.HexColor("#F5F5F5")
TEXT = colors.HexColor("#333333")
MID = colors.HexColor("#D8D8D8")


SECTIONS = [
    (
        "1. Pagina Principal",
        "La pantalla principal presenta QHere, explica el objetivo del sistema y permite ir al inicio de sesion o a la solicitud directiva.",
        "01_home.png",
        ["Abrir la URL del sistema.", "Revisar informacion principal.", "Seleccionar iniciar sesion o solicitud de direccion."],
    ),
    (
        "2. Inicio de Sesion",
        "Pantalla donde el usuario ingresa con correo, contrasena, seleccion de centro y acceso opcional con Google.",
        "02_login.png",
        ["Seleccionar centro educativo si aplica.", "Escribir correo y contrasena.", "Presionar iniciar sesion."],
    ),
    (
        "3. Solicitud Directiva",
        "Formulario usado por directores para registrar su centro y solicitar aprobacion del administrador absoluto.",
        "03_solicitud_director.png",
        ["Completar datos personales.", "Completar datos del centro.", "Enviar solicitud y esperar aprobacion."],
    ),
    (
        "4. Panel de Administrador Absoluto",
        "Panel maestro para revisar solicitudes de direccion, registrar centros y asignar directores.",
        "04_super_admin_dashboard.png",
        ["Revisar indicadores.", "Aprobar o rechazar solicitudes.", "Asignar directores a centros."],
    ),
    (
        "5. Dashboard Administrativo",
        "Vista principal del director o administrador del centro con resumen operativo de asistencia y registros.",
        "05_admin_dashboard.png",
        ["Consultar resumen general.", "Revisar alertas.", "Usar el menu lateral para acceder a modulos."],
    ),
    (
        "6. Gestion del Centro",
        "Apartado para configurar datos institucionales, cursos, grados, secciones, turnos, horarios y calendario.",
        "06_admin_center.png",
        ["Actualizar datos del centro.", "Crear cursos, grados y secciones.", "Configurar turnos, horarios y calendario."],
    ),
    (
        "7. Gestion de Estudiantes",
        "Modulo para registrar, editar, buscar estudiantes y gestionar matricula unica y QR.",
        "07_admin_students.png",
        ["Presionar nuevo estudiante.", "Completar datos y curso.", "Guardar y generar QR si corresponde."],
    ),
    (
        "8. Gestion de Docentes",
        "Modulo para registrar docentes, definir permisos y asignar materias o secciones.",
        "08_admin_teachers.png",
        ["Crear docente.", "Asignar rol o permisos.", "Guardar cambios."],
    ),
    (
        "9. Gestion de Padres y Tutores",
        "Modulo para registrar tutores y vincularlos con estudiantes.",
        "09_admin_parents.png",
        ["Crear padre o tutor.", "Completar datos de contacto.", "Vincular estudiante correspondiente."],
    ),
    (
        "10. Excusas Administrativas",
        "Bandeja para revisar justificaciones, evidencias y cambiar estado a aprobada o rechazada.",
        "10_admin_excuses.png",
        ["Abrir excusa pendiente.", "Revisar motivo y evidencia.", "Aprobar o rechazar."],
    ),
    (
        "11. Panel Docente",
        "Panel de trabajo del docente para escanear QR, registrar asistencia y consultar informacion del grupo.",
        "11_teacher_dashboard.png",
        ["Permitir camara.", "Escanear QR.", "Ver confirmacion de entrada, salida o duplicidad."],
    ),
    (
        "12. Bandeja Docente",
        "Vista donde el docente revisa solicitudes o excusas relacionadas con sus grupos.",
        "12_teacher_inbox.png",
        ["Abrir bandeja.", "Revisar solicitudes pendientes.", "Tomar accion segun permiso."],
    ),
    (
        "13. Ausencias",
        "Vista para consultar estudiantes ausentes o tardios y filtrar informacion.",
        "13_teacher_absences.png",
        ["Filtrar por fecha o grupo.", "Revisar ausentes y tardios.", "Exportar si aplica."],
    ),
    (
        "14. Panel Padre o Tutor",
        "Vista del tutor para consultar estudiantes vinculados, asistencia y justificaciones.",
        "14_parent_dashboard.png",
        ["Revisar estudiantes vinculados.", "Consultar historial.", "Entrar a enviar excusa."],
    ),
    (
        "15. Enviar Excusa",
        "Formulario para enviar justificaciones con motivo y evidencia.",
        "15_parent_send_excuse.png",
        ["Seleccionar estudiante y fecha.", "Escribir motivo.", "Adjuntar evidencia y enviar."],
    ),
    (
        "16. Historial de Excusas",
        "Pantalla para consultar excusas enviadas y su estado.",
        "16_parent_history.png",
        ["Revisar historial.", "Ver estado pendiente, aprobada o rechazada.", "Consultar detalle."],
    ),
    (
        "17. Panel Estudiante",
        "Vista del estudiante para consultar informacion personal relacionada con asistencia o excusas.",
        "17_student_dashboard.png",
        ["Entrar con usuario estudiante.", "Revisar informacion disponible.", "Consultar excusas."],
    ),
    (
        "18. Mis Excusas",
        "Pantalla donde el estudiante puede revisar solicitudes y estados relacionados.",
        "18_student_excuses.png",
        ["Abrir Mis excusas.", "Revisar historial.", "Consultar estado."],
    ),
]


def p(text, style):
    return Paragraph(text, style)


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(RED)
    canvas.rect(0, letter[1] - 0.12 * inch, letter[0], 0.12 * inch, fill=1, stroke=0)
    canvas.setFillColor(BLACK)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(0.65 * inch, 0.42 * inch, "QHere - Manual de Usuario Completo")
    canvas.setFillColor(colors.HexColor("#777777"))
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(letter[0] - 0.65 * inch, 0.42 * inch, f"Pagina {doc.page}")
    canvas.restoreState()


def image_or_placeholder(filename: str, caption_style):
    path = CAPTURES / filename
    if path.exists() and path.stat().st_size > 0:
        img = Image(str(path))
        max_w = 6.75 * inch
        max_h = 3.8 * inch
        scale = min(max_w / img.imageWidth, max_h / img.imageHeight)
        img.drawWidth = img.imageWidth * scale
        img.drawHeight = img.imageHeight * scale
        return [img, Spacer(1, 4), p(filename, caption_style)]

    missing = Table(
        [[p(f"Captura pendiente: {filename}", caption_style)]],
        colWidths=[6.75 * inch],
        rowHeights=[2.5 * inch],
    )
    missing.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, MID),
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    return [missing]


def build_pdf():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.72 * inch,
        bottomMargin=0.7 * inch,
        title="Manual de Usuario Completo - QHere",
        author="Jose Luis Polanco",
    )

    base = getSampleStyleSheet()
    title = ParagraphStyle(
        "ManualTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=16,
    )
    subtitle = ParagraphStyle(
        "ManualSubtitle",
        parent=base["Normal"],
        fontSize=10.5,
        leading=16,
        alignment=TA_CENTER,
        textColor=TEXT,
        spaceAfter=16,
    )
    h1 = ParagraphStyle(
        "ManualH1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=BLACK,
        spaceBefore=8,
        spaceAfter=7,
    )
    body = ParagraphStyle(
        "ManualBody",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.3,
        leading=13.5,
        textColor=TEXT,
        spaceAfter=6,
    )
    caption = ParagraphStyle(
        "ManualCaption",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7.5,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#666666"),
        spaceAfter=8,
    )

    story = []
    story.append(Spacer(1, 1.25 * inch))
    story.append(p("Manual de Usuario", title))
    story.append(p("QHere - Sistema de Control de Asistencia Escolar con QR", subtitle))
    story.append(
        p(
            "Documento guia para aprender a utilizar los apartados publicos, administrativos, docentes, familiares y estudiantiles del sistema.",
            subtitle,
        )
    )
    story.append(PageBreak())

    story.append(p("Objetivo del Manual", h1))
    story.append(
        p(
            "Este manual explica el uso de QHere paso a paso. Incluye los roles del sistema, la forma de iniciar sesion, "
            "la solicitud directiva, la gestion administrativa, el escaneo QR, las justificaciones y los reportes.",
            body,
        )
    )
    story.append(p("Roles incluidos", h1))
    for role in ["Administrador absoluto", "Director o administrador del centro", "Docente", "Padre o tutor", "Estudiante"]:
        story.append(p(f"• {role}", body))
    story.append(PageBreak())

    for title_text, description, filename, steps in SECTIONS:
        block = [p(title_text, h1), p(description, body)]
        block.extend(image_or_placeholder(filename, caption))
        block.append(p("<b>Pasos principales:</b>", body))
        for step in steps:
            block.append(p(f"• {step}", body))
        story.append(KeepTogether(block))
        story.append(Spacer(1, 10))

    story.append(PageBreak())
    story.append(p("Mensajes Frecuentes", h1))
    for item in [
        "QR no valido: el codigo no pertenece al formato esperado o no corresponde a un estudiante registrado.",
        "Ya tiene asistencia registrada: el sistema evita duplicidad en el mismo turno.",
        "Cuenta directiva sin centro asignado: el administrador absoluto debe asignar un centro.",
        "Failed to fetch: puede indicar backend apagado, variables incorrectas o problema de conexion.",
        "Column does not exist: falta ejecutar el script completo de base de datos en Supabase.",
    ]:
        story.append(p(f"• {item}", body))

    story.append(p("Cierre", h1))
    story.append(
        p(
            "QHere centraliza la asistencia escolar y mejora el control administrativo mediante roles, QR, reportes, "
            "justificaciones y auditoria. Para obtener mejores resultados, se recomienda mantener actualizados los datos "
            "del centro, usuarios, horarios y relaciones entre estudiantes y tutores.",
            body,
        )
    )

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
