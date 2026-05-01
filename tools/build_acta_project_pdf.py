from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "docs" / "pdf"
OUTPUT = PDF_DIR / "ACTA_PROYECTO_QHERE_COMPLETA.pdf"

BLACK = colors.HexColor("#111111")
CHARCOAL = colors.HexColor("#222222")
RED = colors.HexColor("#E82127")
LIGHT = colors.HexColor("#F4F4F4")
MID = colors.HexColor("#D9D9D9")
TEXT = colors.HexColor("#3A3A3A")


def p(text: str, style):
    return Paragraph(text, style)


def bullet_items(items: list[str], style):
    story = []
    for item in items:
        story.append(Paragraph(f"• {item}", style))
        story.append(Spacer(1, 4))
    return story


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(RED)
    canvas.rect(0, letter[1] - 0.14 * inch, letter[0], 0.14 * inch, fill=1, stroke=0)
    canvas.setFillColor(BLACK)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(0.65 * inch, 0.42 * inch, "QHere - Acta de Proyecto")
    canvas.setFillColor(colors.HexColor("#777777"))
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(letter[0] - 0.65 * inch, 0.42 * inch, f"Pagina {doc.page}")
    canvas.restoreState()


def build_pdf():
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=0.65 * inch,
        leftMargin=0.65 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.7 * inch,
        title="Acta de Proyecto - QHere",
        author="Jose Luis Polanco",
    )

    base = getSampleStyleSheet()
    title = ParagraphStyle(
        "TitleQ",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=25,
        leading=30,
        textColor=BLACK,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    subtitle = ParagraphStyle(
        "SubtitleQ",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=17,
        textColor=TEXT,
        alignment=TA_CENTER,
        spaceAfter=18,
    )
    h1 = ParagraphStyle(
        "HeadingQ",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=BLACK,
        spaceBefore=12,
        spaceAfter=8,
    )
    h2 = ParagraphStyle(
        "Heading2Q",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=RED,
        spaceBefore=8,
        spaceAfter=5,
    )
    body = ParagraphStyle(
        "BodyQ",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=TEXT,
        spaceAfter=7,
    )
    body_small = ParagraphStyle(
        "BodySmallQ",
        parent=body,
        fontSize=8.4,
        leading=11,
    )
    label = ParagraphStyle(
        "LabelQ",
        parent=body,
        fontName="Helvetica-Bold",
        textColor=BLACK,
    )

    story = []

    cover_box = Table(
        [
            [p("ACTA DE PROYECTO", title)],
            [p("QHere - Sistema de Control de Asistencia Escolar con QR", subtitle)],
            [p("<b>Desarrollador:</b> Jose Luis Polanco<br/><b>Administrador del proyecto:</b> Jose Rijo", subtitle)],
        ],
        colWidths=[7.2 * inch],
    )
    cover_box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 1.3, BLACK),
                ("LINEBELOW", (0, 0), (-1, 0), 4, RED),
                ("TOPPADDING", (0, 0), (-1, -1), 28),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 28),
                ("LEFTPADDING", (0, 0), (-1, -1), 20),
                ("RIGHTPADDING", (0, 0), (-1, -1), 20),
            ]
        )
    )
    story.append(Spacer(1, 1.6 * inch))
    story.append(cover_box)
    story.append(Spacer(1, 0.25 * inch))
    story.append(p("Documento formal de inicio, justificacion, alcance, cadena de valor y entregables del proyecto.", subtitle))
    story.append(PageBreak())

    story.append(p("Resumen", h1))
    story.append(
        p(
            "QHere es un sistema web desarrollado para automatizar el control de asistencia escolar en centros educativos. "
            "La solucion permite registrar estudiantes, docentes, padres o tutores, cursos, secciones, turnos, horarios, "
            "entradas, salidas, tardanzas, ausencias y justificaciones desde una plataforma centralizada.",
            body,
        )
    )
    story.append(
        p(
            "El sistema reemplaza el proceso manual de tomar asistencia por un flujo tecnologico rapido, seguro y auditable, "
            "utilizando codigos QR unicos por estudiante y paneles controlados por roles.",
            body,
        )
    )

    story.append(p("Problematica, Solucion y Objetivos", h1))
    problem_rows = [
        [
            p("<b>Problematica</b>", label),
            p("<b>Solucion</b>", label),
            p("<b>Objetivo</b>", label),
        ],
        [
            p("Registro manual lento y propenso a errores.", body_small),
            p("Escaneo QR y registros digitales.", body_small),
            p("Reducir tiempo y errores operativos.", body_small),
        ],
        [
            p("Dificultad para consultar asistencia en tiempo real.", body_small),
            p("Dashboard y reportes por centro, curso y estudiante.", body_small),
            p("Mejorar la supervision administrativa.", body_small),
        ],
        [
            p("Riesgo de duplicidad o fraude en registros.", body_small),
            p("Validacion de QR, turno, horario y duplicidad.", body_small),
            p("Mantener control y trazabilidad.", body_small),
        ],
        [
            p("Justificaciones sin evidencia o fuera de control.", body_small),
            p("Modulo de excusas con evidencia y aprobacion.", body_small),
            p("Organizar ausencias y tardanzas.", body_small),
        ],
    ]
    table = Table(problem_rows, colWidths=[2.2 * inch, 2.35 * inch, 2.25 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLACK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, MID),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(table)

    story.append(p("Justificacion", h1))
    story.append(
        p(
            "La implementacion de QHere proporciona al centro educativo una herramienta moderna para controlar la asistencia "
            "estudiantil. Al digitalizar el proceso, se reducen errores manuales y se agiliza la consulta de informacion por "
            "parte de direccion, docentes y personal administrativo.",
            body,
        )
    )
    story.append(
        p(
            "El sistema ofrece rapidez, eficiencia, seguridad, calidad de informacion, ahorro de tiempo, comodidad, evidencia "
            "digital y control de los registros de asistencia y justificaciones.",
            body,
        )
    )

    story.append(p("Objetivo General", h1))
    story.append(
        p(
            "Desarrollar una aplicacion web para administrar y controlar la asistencia escolar mediante codigos QR, permitiendo "
            "a los centros educativos gestionar estudiantes, docentes, tutores, horarios, justificaciones, reportes y auditoria "
            "desde una plataforma segura y organizada.",
            body,
        )
    )

    story.append(p("Objetivos Especificos", h1))
    story.extend(
        bullet_items(
            [
                "Registrar centros educativos, estudiantes, docentes, padres o tutores.",
                "Generar codigos QR unicos por estudiante.",
                "Registrar entrada, salida, tardanza, ausencia y asistencia manual.",
                "Gestionar justificaciones con evidencia y aprobacion.",
                "Generar reportes administrativos exportables en PDF y Excel.",
                "Proteger datos sensibles mediante autenticacion y roles.",
            ],
            body,
        )
    )

    story.append(PageBreak())
    story.append(p("Cadena de Valor de la Implementacion", h1))
    story.append(p("Resultados esperados", h2))
    story.extend(
        bullet_items(
            [
                "La direccion podra consultar informacion de asistencia con mayor rapidez.",
                "Los docentes tendran una herramienta mas eficiente para controlar sus grupos.",
                "El centro educativo contara con datos organizados, historicos y exportables.",
                "Los padres o tutores podran tener mejor seguimiento de las justificaciones.",
            ],
            body,
        )
    )

    story.append(p("Impactos previstos", h2))
    story.extend(
        bullet_items(
            [
                "Modernizacion del proceso de asistencia escolar.",
                "Reduccion del uso de registros manuales.",
                "Mayor trazabilidad de acciones dentro del sistema.",
                "Mejor organizacion administrativa.",
            ],
            body,
        )
    )

    story.append(p("Productos, servicios y mejoras evidenciables", h2))
    story.extend(
        bullet_items(
            [
                "Plataforma web QHere.",
                "Panel de administrador absoluto y panel de direccion.",
                "Gestion de estudiantes, docentes y tutores.",
                "Modulo de asistencia por QR y contingencia manual.",
                "Justificaciones con evidencia.",
                "Reportes en pantalla, PDF y Excel.",
                "Documentacion tecnica, manuales, cronograma y presentacion.",
            ],
            body,
        )
    )

    story.append(p("Fundamentacion Tecnologica", h1))
    story.append(
        p(
            "QHere introduce una mejora tecnologica frente al proceso tradicional de asistencia escolar. La solucion integra "
            "React y Vite para el frontend, Python Flask para el backend, Supabase Auth para autenticacion y PostgreSQL como "
            "motor de base de datos.",
            body,
        )
    )
    story.append(
        p(
            "La innovacion principal consiste en unir control de asistencia por QR, gestion academica, aprobacion directiva, "
            "reportes, auditoria, justificaciones y separacion de datos por centro educativo dentro de una misma plataforma.",
            body,
        )
    )

    story.append(p("Entregables", h1))
    story.extend(
        bullet_items(
            [
                "Proyecto completo con frontend y backend.",
                "Base de datos con script completo, tablas, indices, RPC, Realtime y Edge Function.",
                "Diagrama de base de datos.",
                "README, acta de proyecto, manual tecnico y manual de usuario.",
                "Cronograma de actividades.",
                "Capturas de pantalla en PNG y PDF.",
                "Presentacion tipo propuesta.",
                "Paquete final para memoria USB.",
            ],
            body,
        )
    )

    story.append(p("Cierre", h1))
    story.append(
        p(
            "QHere queda definido como una solucion academica completa para centros educativos que requieren modernizar el "
            "control de asistencia. El proyecto mejora la rapidez, seguridad, organizacion y trazabilidad de los procesos "
            "de asistencia escolar mediante una plataforma web funcional y documentada.",
            body,
        )
    )

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
