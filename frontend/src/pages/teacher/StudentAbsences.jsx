// ============================================================
// StudentAbsences.jsx
// Ruta: /teacher/absences
// Prefijo CSS: .sa-
// Registro y seguimiento de ausencias del docente
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminSidebarProfileCard from '../../components/layout/AdminSidebarProfileCard'
import BrandLogo from '../../components/ui/BrandLogo'

// ─── Paleta ─────────────────────────────────────────────────
const C = {
  navy:     '#1B3F6B', navyDeep: '#102847', navyMid: '#2A5590',
  sky:      '#B8D4E8', skyLight: '#D8EAF4', skyPale: '#EEF6FB',
  skyMid:   '#8BBAD8', border:   '#C8DFF0', dark:    '#0D2238', mid: '#4A6A8A',
}

// ─── Iconos ──────────────────────────────────────────────────
const IcoQR       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>
const IcoInbox    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
const IcoAbsences = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
const IcoLogout   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IcoExcel    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="19"/><line x1="15" y1="13" x2="9" y2="19"/></svg>
const IcoPDF      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
const IcoCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcoX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IcoClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

// ─── Estilos ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@400;500;600&display=swap');

  .sa-root { display:flex; min-height:100vh; background:${C.skyPale}; font-family:'DM Sans',sans-serif; }

  /* Sidebar */
  .sa-sidebar { width:240px; min-height:100vh; background:${C.navyDeep}; display:flex; flex-direction:column; position:fixed; left:0; top:0; bottom:0; z-index:100; }
  .sa-logo { padding:28px 24px 20px; border-bottom:1px solid rgba(184,212,232,0.15); }
  .sa-logo-title { font-family:'Playfair Display',serif; font-size:22px; color:#fff; }
  .sa-logo-sub { font-size:11px; color:${C.skyMid}; margin-top:2px; }
  .sa-nav { flex:1; padding:16px 0; }
  .sa-nav-item { display:flex; align-items:center; gap:10px; padding:11px 24px; color:${C.sky}; font-size:14px; font-weight:500; cursor:pointer; border-left:3px solid transparent; transition:all 0.18s; }
  .sa-nav-item:hover { background:rgba(184,212,232,0.08); color:#fff; }
  .sa-nav-item.active { background:rgba(184,212,232,0.12); color:#fff; border-left-color:${C.sky}; }
  .sa-sidebar-footer { padding:16px 24px; border-top:1px solid rgba(184,212,232,0.15); }
  .sa-user-card { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
  .sa-avatar { width:36px; height:36px; border-radius:50%; background:${C.navyMid}; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#fff; flex-shrink:0; }
  .sa-user-name { font-size:13px; color:#fff; font-weight:500; }
  .sa-user-role { font-size:11px; color:${C.skyMid}; }
  .sa-logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; background:rgba(255,80,80,0.12); border:none; border-radius:8px; color:#ff8080; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.18s; }
  .sa-logout:hover { background:rgba(255,80,80,0.22); }

  /* Main */
  .sa-main { margin-left:240px; flex:1; padding:32px; }
  .sa-header { margin-bottom:28px; }
  .sa-header h1 { font-family:'Playfair Display',serif; font-size:26px; color:${C.dark}; }
  .sa-header p { font-size:14px; color:${C.mid}; margin-top:4px; }

  /* Filtros */
  .sa-filters { background:#fff; border-radius:14px; border:1px solid ${C.border}; padding:20px 22px; margin-bottom:24px; }
  .sa-filters-title { font-size:13px; font-weight:600; color:${C.dark}; margin-bottom:14px; }
  .sa-filters-row { display:flex; gap:14px; flex-wrap:wrap; align-items:flex-end; }
  .sa-field { display:flex; flex-direction:column; gap:5px; }
  .sa-label { font-size:12px; font-weight:600; color:${C.mid}; text-transform:uppercase; letter-spacing:0.4px; }
  .sa-select, .sa-input { padding:9px 12px; border-radius:8px; border:1px solid ${C.border}; font-size:14px; font-family:'DM Sans',sans-serif; background:#fff; color:${C.dark}; outline:none; transition:border 0.18s; min-width:160px; }
  .sa-select:focus, .sa-input:focus { border-color:${C.navy}; }
  .sa-input { max-width:140px; }

  /* Botones */
  .sa-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:9px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; }
  .sa-btn-primary   { background:${C.navy}; color:#fff; }
  .sa-btn-primary:hover { background:${C.navyMid}; }
  .sa-btn-excel  { background:#f0fdf4; color:#166534; border:1px solid #86efac; }
  .sa-btn-excel:hover  { background:#dcfce7; }
  .sa-btn-pdf    { background:#fff1f2; color:#9f1239; border:1px solid #fda4af; }
  .sa-btn-pdf:hover    { background:#ffe4e6; }
  .sa-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .sa-export-row { display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap; }

  /* Stats */
  .sa-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:24px; }
  .sa-stat { background:#fff; border-radius:12px; padding:16px; border:1px solid ${C.border}; text-align:center; }
  .sa-stat-val { font-size:22px; font-weight:700; color:${C.dark}; line-height:1; }
  .sa-stat-label { font-size:11px; color:${C.mid}; margin-top:4px; }

  /* Tabla */
  .sa-card { background:#fff; border-radius:14px; border:1px solid ${C.border}; overflow:hidden; }
  .sa-card-head { padding:18px 22px 14px; border-bottom:1px solid ${C.border}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .sa-card-head h3 { font-size:15px; font-weight:600; color:${C.dark}; }
  .sa-card-head p { font-size:12px; color:${C.mid}; margin-top:2px; }
  .sa-search { padding:8px 12px; border-radius:8px; border:1px solid ${C.border}; font-size:13px; font-family:'DM Sans',sans-serif; outline:none; background:#fff; color:${C.dark}; transition:border 0.18s; min-width:200px; }
  .sa-search:focus { border-color:${C.navy}; }
  .sa-table-wrap { overflow-x:auto; }
  .sa-table { width:100%; border-collapse:collapse; font-size:14px; }
  .sa-table th { text-align:left; padding:11px 16px; font-size:12px; font-weight:600; color:${C.mid}; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid ${C.border}; background:${C.skyPale}; white-space:nowrap; }
  .sa-table td { padding:12px 16px; border-bottom:1px solid ${C.border}; color:${C.dark}; vertical-align:middle; }
  .sa-table tr:last-child td { border-bottom:none; }
  .sa-table tr:hover td { background:${C.skyPale}; }
  .sa-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .sa-badge.presente   { background:#dcfce7; color:#166534; }
  .sa-badge.tarde      { background:#fef9c3; color:#854d0e; }
  .sa-badge.ausente    { background:#fee2e2; color:#991b1b; }
  .sa-badge.justificado{ background:#ede9fe; color:#5b21b6; }
  .sa-pct-bar { height:6px; background:${C.border}; border-radius:3px; margin-top:4px; width:80px; overflow:hidden; }
  .sa-pct-fill { height:100%; border-radius:3px; }
  .sa-empty { text-align:center; padding:48px; color:${C.mid}; font-size:14px; }

  @media (max-width:1100px) { .sa-stats { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:900px) {
    .sa-sidebar { transform:translateX(-100%); }
    .sa-main { margin-left:0; padding:20px; }
    .sa-stats { grid-template-columns:repeat(2,1fr); }
  }
`

// ─── Helpers ─────────────────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// ── Construir lista de meses disponibles (año actual) ────────
function getMesesOpciones() {
  const now = new Date()
  const opciones = []
  for (let m = 0; m <= now.getMonth(); m++) {
    const val = `${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`
    opciones.push({ value: val, label: `${MESES[m]} ${now.getFullYear()}` })
  }
  return opciones.reverse()
}

const REPORT_COLORS = {
  navy: '1B3F6B',
  navyDeep: '102847',
  navyMid: '2A5590',
  skyPale: 'EEF6FB',
  skyLight: 'D8EAF4',
  border: 'C8DFF0',
  dark: '0D2238',
  mid: '4A6A8A',
  green: '16A34A',
  yellow: 'CA8A04',
  red: 'DC2626',
  purple: '7C3AED',
  white: 'FFFFFF',
}

const STATUS_LABEL = {
  presente: 'Presente',
  tarde: 'Tarde',
  ausente: 'Ausente',
  justificado: 'Justificado',
}

function getAttendancePct(row) {
  if (!row?.total) return 0
  return Math.round(((row.presentes + row.tardanzas + row.justificados) / row.total) * 100)
}

function getPctColor(pct) {
  if (pct >= 90) return REPORT_COLORS.green
  if (pct >= 75) return REPORT_COLORS.yellow
  return REPORT_COLORS.red
}

function safeReportName(value) {
  return String(value || 'Reporte').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_')
}

function setCellStyle(ws, address, style = {}) {
  if (!ws[address]) return
  ws[address].s = {
    font: { name: 'Arial', sz: 10, color: { rgb: REPORT_COLORS.dark }, ...(style.font || {}) },
    alignment: { vertical: 'center', ...(style.alignment || {}) },
    border: style.border || {
      top: { style: 'thin', color: { rgb: REPORT_COLORS.border } },
      bottom: { style: 'thin', color: { rgb: REPORT_COLORS.border } },
      left: { style: 'thin', color: { rgb: REPORT_COLORS.border } },
      right: { style: 'thin', color: { rgb: REPORT_COLORS.border } },
    },
    fill: style.fill,
    numFmt: style.numFmt,
  }
}

function styleRange(ws, range, style) {
  const decoded = XLSXUtils.decode_range(range)
  for (let row = decoded.s.r; row <= decoded.e.r; row++) {
    for (let col = decoded.s.c; col <= decoded.e.c; col++) {
      setCellStyle(ws, XLSXUtils.encode_cell({ r: row, c: col }), style)
    }
  }
}

let XLSXUtils = null

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function StudentAbsences() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const now = new Date()
  const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [secciones, setSecciones]   = useState([])
  const [records, setRecords]       = useState([])   // datos crudos de attendance
  const [resumen, setResumen]       = useState([])   // resumen por estudiante
  const [loading, setLoading]       = useState(false)
  const [exporting, setExporting]   = useState(false)

  // Filtros
  const [filterSeccion, setFilterSeccion] = useState('todas')
  const [filterMes, setFilterMes]         = useState(mesActual)
  const [filterEstado, setFilterEstado]   = useState('todos')
  const [search, setSearch]               = useState('')

  const mesesOpciones = getMesesOpciones()

  const navItems = [
    { label: 'Escanear QR', path: '/teacher/dashboard', Icon: IcoQR      },
    { label: 'Excusas',     path: '/teacher/inbox',     Icon: IcoInbox   },
    { label: 'Ausencias',   path: '/teacher/absences',  Icon: IcoAbsences },
  ]

  useEffect(() => {
    injectStyles()
    loadSecciones()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSeccion, filterMes])

  function injectStyles() {
    if (document.getElementById('sa-styles')) return
    const el = document.createElement('style')
    el.id = 'sa-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }

  async function loadSecciones() {
    if (!profile?.secciones_ids?.length) return
    const { data } = await supabase
      .from('grade_sections').select('*').in('id', profile.secciones_ids)
    setSecciones(data || [])
  }

  // ── Cargar registros del mes filtrado ─────────────────────
  async function loadRecords() {
    setLoading(true)
    try {
      const [year, month] = filterMes.split('-')
      const inicio = `${year}-${month}-01`
      const fin    = new Date(parseInt(year), parseInt(month), 0).toISOString().slice(0, 10)

      let query = supabase
        .from('attendance')
        .select(`
          *,
          students(id, nombre, matricula, grade_section_id,
            grade_sections:grade_section_id(id, grado, seccion))
        `)
        .gte('fecha', inicio)
        .lte('fecha', fin)
        .eq('teacher_id', profile?.id)
        .order('fecha', { ascending: false })

      // Filtrar por sección si aplica
      if (filterSeccion !== 'todas' && profile?.secciones_ids?.length) {
        const { data: sts } = await supabase
          .from('students').select('id').eq('grade_section_id', filterSeccion)
        const ids = (sts || []).map(s => s.id)
        if (ids.length) query = query.in('student_id', ids)
        else { setRecords([]); setResumen([]); setLoading(false); return }
      }

      const { data } = await query
      const lista = data || []
      setRecords(lista)
      buildResumen(lista)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Construir resumen por estudiante ──────────────────────
  function buildResumen(lista) {
    const map = {}
    lista.forEach(r => {
      const sid = r.student_id
      if (!map[sid]) {
        map[sid] = {
          id:        sid,
          nombre:    r.students?.nombre || '—',
          matricula: r.students?.matricula || '—',
          seccion:   r.students?.grade_sections
            ? `${r.students.grade_sections.grado} ${r.students.grade_sections.seccion}`
            : '—',
          presentes:    0,
          tardanzas:    0,
          ausentes:     0,
          justificados: 0,
          total:        0,
        }
      }
      map[sid].total++
      if (r.estado === 'presente')    map[sid].presentes++
      if (r.estado === 'tarde')       map[sid].tardanzas++
      if (r.estado === 'ausente')     map[sid].ausentes++
      if (r.estado === 'justificado') map[sid].justificados++
    })
    setResumen(Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre)))
  }

  // ── Filtrar resumen para la tabla ─────────────────────────
  const resumenFiltrado = resumen.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.nombre.toLowerCase().includes(q) || r.matricula.toLowerCase().includes(q)
    const matchEstado = filterEstado === 'todos'
      || (filterEstado === 'ausente' && r.ausentes > 0)
      || (filterEstado === 'tarde'   && r.tardanzas > 0)
    return matchSearch && matchEstado
  })

  // ── Stats globales ────────────────────────────────────────
  const globalStats = {
    estudiantes: resumen.length,
    presentes:   records.filter(r => r.estado === 'presente').length,
    tardanzas:   records.filter(r => r.estado === 'tarde').length,
    ausentes:    records.filter(r => r.estado === 'ausente').length,
    justificados:records.filter(r => r.estado === 'justificado').length,
  }

  // ── Exportar Excel ────────────────────────────────────────
  async function exportExcel() {
    setExporting(true)
    try {
      const XLSX = await import('xlsx')
      XLSXUtils = XLSX.utils
      const mesLabel = mesesOpciones.find(m => m.value === filterMes)?.label || filterMes
      const seccionEncontrada = secciones.find(s => s.id === filterSeccion)
      const seccionLabel = filterSeccion === 'todas'
        ? 'Todas mis secciones'
        : seccionEncontrada
          ? `${seccionEncontrada.grado} ${seccionEncontrada.seccion}`
          : 'Seccion seleccionada'
      const generatedAt = new Date().toLocaleString('es-DO')
      const filteredStats = {
        estudiantes: resumenFiltrado.length,
        presentes: resumenFiltrado.reduce((sum, r) => sum + r.presentes, 0),
        tardanzas: resumenFiltrado.reduce((sum, r) => sum + r.tardanzas, 0),
        ausentes: resumenFiltrado.reduce((sum, r) => sum + r.ausentes, 0),
        justificados: resumenFiltrado.reduce((sum, r) => sum + r.justificados, 0),
      }
      const detalleFiltrado = records.filter(record => {
        const studentId = record.student_id || record.students?.id
        return resumenFiltrado.some(row => row.id === studentId)
      })

      // Hoja 1: Resumen por estudiante
      const resumenData = resumenFiltrado.map(r => ({
        'Nombre':       r.nombre,
        'Matrícula':    r.matricula,
        'Sección':      r.seccion,
        'Presentes':    r.presentes,
        'Tardanzas':    r.tardanzas,
        'Ausentes':     r.ausentes,
        'Justificados': r.justificados,
        'Total días':   r.total,
        '% Asistencia': r.total > 0
          ? `${getAttendancePct(r)}%`
          : '—',
      }))

      // Hoja 2: Detalle diario
      const detalleData = detalleFiltrado.map(r => ({
        'Fecha':      r.fecha,
        'Estudiante': r.students?.nombre || '—',
        'Matrícula':  r.students?.matricula || '—',
        'Sección':    r.students?.grade_sections
          ? `${r.students.grade_sections.grado} ${r.students.grade_sections.seccion}` : '—',
        'Entrada':    r.hora_entrada || '—',
        'Salida':     r.hora_salida  || '—',
        'Estado':     r.estado,
      }))

      const wb = XLSX.utils.book_new()
      wb.Props = {
        Title: `Reporte de asistencia - ${mesLabel}`,
        Subject: 'QHere Control de Asistencia',
        Author: 'QHere',
        Company: 'QHere',
        CreatedDate: new Date(),
      }
      const cover = XLSX.utils.aoa_to_sheet([
        ['QHere'],
        ['Reporte de asistencia'],
        [],
        ['Periodo', mesLabel],
        ['Docente', profile?.full_name || '-'],
        ['Seccion', seccionLabel],
        ['Generado', generatedAt],
        [],
        ['Indicador', 'Valor'],
        ['Estudiantes', filteredStats.estudiantes],
        ['Presentes', filteredStats.presentes],
        ['Tardanzas', filteredStats.tardanzas],
        ['Ausencias', filteredStats.ausentes],
        ['Justificadas', filteredStats.justificados],
      ])
      const ws1 = XLSX.utils.json_to_sheet(resumenData)
      const ws2 = XLSX.utils.json_to_sheet(detalleData)

      // Anchos de columna
      ws1['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 11 }, { wch: 11 }, { wch: 10 }, { wch: 13 }, { wch: 10 }, { wch: 14 }]
      ws2['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }]

      cover['!cols'] = [{ wch: 22 }, { wch: 34 }]
      cover['!rows'] = [{ hpt: 28 }, { hpt: 22 }]
      cover['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      ]
      styleRange(cover, 'A1:B1', {
        font: { sz: 22, bold: true, color: { rgb: REPORT_COLORS.white } },
        fill: { fgColor: { rgb: REPORT_COLORS.navyDeep } },
        alignment: { horizontal: 'center' },
      })
      styleRange(cover, 'A2:B2', {
        font: { sz: 14, bold: true, color: { rgb: REPORT_COLORS.navy } },
        fill: { fgColor: { rgb: REPORT_COLORS.skyLight } },
        alignment: { horizontal: 'center' },
      })
      styleRange(cover, 'A9:B9', {
        font: { bold: true, color: { rgb: REPORT_COLORS.white } },
        fill: { fgColor: { rgb: REPORT_COLORS.navy } },
      })
      styleRange(cover, 'A4:B14', {
        fill: { fgColor: { rgb: REPORT_COLORS.skyPale } },
      })
      styleRange(ws1, `A1:I${Math.max(1, resumenData.length + 1)}`, {
        fill: { fgColor: { rgb: REPORT_COLORS.skyPale } },
      })
      styleRange(ws1, 'A1:I1', {
        font: { bold: true, color: { rgb: REPORT_COLORS.white } },
        fill: { fgColor: { rgb: REPORT_COLORS.navy } },
        alignment: { horizontal: 'center' },
      })
      resumenFiltrado.forEach((row, index) => {
        setCellStyle(ws1, `I${index + 2}`, {
          font: { bold: true, color: { rgb: getPctColor(getAttendancePct(row)) } },
          alignment: { horizontal: 'center' },
        })
      })
      styleRange(ws2, `A1:G${Math.max(1, detalleData.length + 1)}`, {
        fill: { fgColor: { rgb: REPORT_COLORS.skyPale } },
      })
      styleRange(ws2, 'A1:G1', {
        font: { bold: true, color: { rgb: REPORT_COLORS.white } },
        fill: { fgColor: { rgb: REPORT_COLORS.navy } },
        alignment: { horizontal: 'center' },
      })
      ws1['!autofilter'] = { ref: `A1:I${Math.max(1, resumenData.length + 1)}` }
      ws2['!autofilter'] = { ref: `A1:G${Math.max(1, detalleData.length + 1)}` }

      XLSX.utils.book_append_sheet(wb, cover, 'Portada')
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')
      XLSX.utils.book_append_sheet(wb, ws2, 'Detalle diario')
      XLSX.writeFile(wb, `QHere_Asistencia_${safeReportName(mesLabel)}.xlsx`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  // ── Exportar PDF ──────────────────────────────────────────
  async function exportPDF() {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const mesLabel = mesesOpciones.find(m => m.value === filterMes)?.label || filterMes
      const seccionEncontrada = secciones.find(s => s.id === filterSeccion)
      const seccionLabel = filterSeccion === 'todas'
        ? 'Todas mis secciones'
        : seccionEncontrada
          ? `${seccionEncontrada.grado} ${seccionEncontrada.seccion}`
          : 'Seccion seleccionada'
      const generatedAt = new Date().toLocaleString('es-DO')
      const filteredStats = {
        estudiantes: resumenFiltrado.length,
        presentes: resumenFiltrado.reduce((sum, r) => sum + r.presentes, 0),
        tardanzas: resumenFiltrado.reduce((sum, r) => sum + r.tardanzas, 0),
        ausentes: resumenFiltrado.reduce((sum, r) => sum + r.ausentes, 0),
        justificados: resumenFiltrado.reduce((sum, r) => sum + r.justificados, 0),
      }
      const detalleFiltrado = records.filter(record => {
        const studentId = record.student_id || record.students?.id
        return resumenFiltrado.some(row => row.id === studentId)
      })
      const doc = new jsPDF({ orientation: 'landscape' })

      // Encabezado
      doc.setFontSize(18)
      doc.setTextColor(27, 63, 107)
      doc.text('Reporte de Asistencia', 14, 18)
      doc.setFontSize(11)
      doc.setTextColor(74, 106, 138)
      doc.text(`Mes: ${mesLabel}   ·   Docente: ${profile?.full_name || '—'}   ·   Generado: ${new Date().toLocaleDateString('es-DO')}`, 14, 26)

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const drawHeader = () => {
        doc.setFillColor(16, 40, 71)
        doc.rect(0, 0, pageWidth, 30, 'F')
        doc.setFillColor(232, 33, 39)
        doc.rect(0, 29, pageWidth, 1.2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(19)
        doc.setFont('helvetica', 'bold')
        doc.text('QHere', 14, 13)
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text('Reporte de asistencia', 14, 22)
        doc.setFontSize(9)
        doc.text(`Generado: ${generatedAt}`, pageWidth - 14, 13, { align: 'right' })
        doc.text(`Docente: ${profile?.full_name || '-'}`, pageWidth - 14, 22, { align: 'right' })
      }
      const drawFooter = () => {
        const pages = doc.internal.getNumberOfPages()
        for (let index = 1; index <= pages; index++) {
          doc.setPage(index)
          doc.setDrawColor(200, 223, 240)
          doc.line(14, pageHeight - 13, pageWidth - 14, pageHeight - 13)
          doc.setTextColor(74, 106, 138)
          doc.setFontSize(8)
          doc.text('QHere - Control de Asistencia', 14, pageHeight - 7)
          doc.text(`Pagina ${index} de ${pages}`, pageWidth - 14, pageHeight - 7, { align: 'right' })
        }
      }

      drawHeader()
      doc.setTextColor(13, 34, 56)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${mesLabel} | ${seccionLabel}`, 14, 40)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(74, 106, 138)
      doc.text('Resumen consolidado de asistencia, tardanzas, ausencias y justificaciones.', 14, 46)

      const statCards = [
        ['Estudiantes', filteredStats.estudiantes, [27, 63, 107]],
        ['Presentes', filteredStats.presentes, [22, 163, 74]],
        ['Tardanzas', filteredStats.tardanzas, [202, 138, 4]],
        ['Ausencias', filteredStats.ausentes, [220, 38, 38]],
        ['Justificadas', filteredStats.justificados, [124, 58, 237]],
      ]
      statCards.forEach(([label, value, color], index) => {
        const x = 14 + (index * 54)
        doc.setDrawColor(200, 223, 240)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, 53, 49, 20, 3, 3, 'FD')
        doc.setTextColor(...color)
        doc.setFontSize(15)
        doc.setFont('helvetica', 'bold')
        doc.text(String(value), x + 5, 62)
        doc.setTextColor(74, 106, 138)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(label, x + 5, 69)
      })

      // Tabla resumen
      autoTable(doc, {
        startY: 82,
        head: [['Nombre', 'Matrícula', 'Sección', 'Presentes', 'Tardanzas', 'Ausentes', 'Justificados', '% Asistencia']],
        body: resumenFiltrado.map(r => [
          r.nombre,
          r.matricula,
          r.seccion,
          r.presentes,
          r.tardanzas,
          r.ausentes,
          r.justificados,
          r.total > 0
            ? `${getAttendancePct(r)}%`
            : '—',
        ]),
        styles: { fontSize: 9, cellPadding: 3.4, textColor: [13, 34, 56], lineColor: [200, 223, 240], lineWidth: 0.1 },
        headStyles: { fillColor: [27, 63, 107], textColor: 255, fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [238, 246, 251] },
        margin: { top: 36, bottom: 18 },
        didDrawPage: drawHeader,
        didParseCell: (data) => {
          if (data.section !== 'body') return
          if ([3, 4, 5, 6, 7].includes(data.column.index)) {
            data.cell.styles.halign = 'center'
            data.cell.styles.fontStyle = 'bold'
          }
          if (data.column.index === 7) {
            const pct = parseInt(String(data.cell.raw).replace('%', ''), 10) || 0
            data.cell.styles.textColor = pct >= 90 ? [22, 163, 74] : pct >= 75 ? [202, 138, 4] : [220, 38, 38]
          }
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 28 },
          2: { cellWidth: 28 },
        },
      })

      doc.addPage('landscape')
      drawHeader()
      doc.setTextColor(13, 34, 56)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Detalle diario', 14, 40)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(74, 106, 138)
      doc.text(`${detalleFiltrado.length} registros incluidos segun los filtros actuales.`, 14, 46)

      autoTable(doc, {
        startY: 54,
        head: [['Fecha', 'Estudiante', 'Matricula', 'Seccion', 'Entrada', 'Salida', 'Estado']],
        body: detalleFiltrado.map(r => [
          r.fecha,
          r.students?.nombre || '-',
          r.students?.matricula || '-',
          r.students?.grade_sections
            ? `${r.students.grade_sections.grado} ${r.students.grade_sections.seccion}` : '-',
          r.hora_entrada || '-',
          r.hora_salida || '-',
          STATUS_LABEL[r.estado] || r.estado || '-',
        ]),
        styles: { fontSize: 8.5, cellPadding: 3, textColor: [13, 34, 56], lineColor: [200, 223, 240], lineWidth: 0.1 },
        headStyles: { fillColor: [16, 40, 71], textColor: 255, fontStyle: 'bold', halign: 'center' },
        alternateRowStyles: { fillColor: [238, 246, 251] },
        margin: { top: 36, bottom: 18 },
        didDrawPage: drawHeader,
        didParseCell: (data) => {
          if (data.section !== 'body' || data.column.index !== 6) return
          const status = String(data.cell.raw || '').toLowerCase()
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.halign = 'center'
          if (status.includes('ausente')) data.cell.styles.textColor = [220, 38, 38]
          else if (status.includes('tarde')) data.cell.styles.textColor = [202, 138, 4]
          else if (status.includes('justificado')) data.cell.styles.textColor = [124, 58, 237]
          else data.cell.styles.textColor = [22, 163, 74]
        },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 62 },
          2: { cellWidth: 30 },
          3: { cellWidth: 28 },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 22, halign: 'center' },
          6: { cellWidth: 28 },
        },
      })

      drawFooter()
      doc.save(`QHere_Asistencia_${safeReportName(mesLabel)}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="sa-root">
      {/* Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <BrandLogo compact size={36} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" subtitle="Panel Docente" />
        </div>
        <nav className="sa-nav">
          {navItems.map(({ label, path, Icon }) => (
            <div key={path} className={`sa-nav-item${location.pathname === path ? ' active' : ''}`} onClick={() => navigate(path)}>
              <Icon />{label}
            </div>
          ))}
        </nav>
        <div className="sa-sidebar-footer">
          <AdminSidebarProfileCard
            profile={profile}
            roleLabel="Docente"
            onSignOut={signOut}
            LogoutIcon={IcoLogout}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="sa-main">
        <div className="sa-header">
          <h1>Reporte de Ausencias</h1>
          <p>Consulta y exporta el historial de asistencia de tus secciones</p>
        </div>

        {/* Filtros */}
        <div className="sa-filters">
          <div className="sa-filters-title">Filtros del reporte</div>
          <div className="sa-filters-row">
            <div className="sa-field">
              <label className="sa-label">Mes</label>
              <select className="sa-select" value={filterMes} onChange={e => setFilterMes(e.target.value)}>
                {mesesOpciones.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {secciones.length > 0 && (
              <div className="sa-field">
                <label className="sa-label">Sección</label>
                <select className="sa-select" value={filterSeccion} onChange={e => setFilterSeccion(e.target.value)}>
                  <option value="todas">Todas mis secciones</option>
                  {secciones.map(s => (
                    <option key={s.id} value={s.id}>{s.grado} {s.seccion}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="sa-field">
              <label className="sa-label">Mostrar</label>
              <select className="sa-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                <option value="todos">Todos los estudiantes</option>
                <option value="ausente">Con ausencias</option>
                <option value="tarde">Con tardanzas</option>
              </select>
            </div>

            <button className="sa-btn sa-btn-primary" onClick={loadRecords} disabled={loading}>
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="sa-stats">
          <div className="sa-stat">
            <div className="sa-stat-val">{globalStats.estudiantes}</div>
            <div className="sa-stat-label">Estudiantes</div>
          </div>
          <div className="sa-stat">
            <div className="sa-stat-val" style={{ color: '#16a34a' }}>{globalStats.presentes}</div>
            <div className="sa-stat-label">Registros presentes</div>
          </div>
          <div className="sa-stat">
            <div className="sa-stat-val" style={{ color: '#ca8a04' }}>{globalStats.tardanzas}</div>
            <div className="sa-stat-label">Tardanzas</div>
          </div>
          <div className="sa-stat">
            <div className="sa-stat-val" style={{ color: '#dc2626' }}>{globalStats.ausentes}</div>
            <div className="sa-stat-label">Ausencias</div>
          </div>
          <div className="sa-stat">
            <div className="sa-stat-val" style={{ color: '#7c3aed' }}>{globalStats.justificados}</div>
            <div className="sa-stat-label">Justificadas</div>
          </div>
        </div>

        {/* Botones exportar */}
        <div className="sa-export-row">
          <button className="sa-btn sa-btn-excel" onClick={exportExcel} disabled={exporting || resumen.length === 0}>
            <IcoExcel /> Exportar Excel
          </button>
          <button className="sa-btn sa-btn-pdf" onClick={exportPDF} disabled={exporting || resumen.length === 0}>
            <IcoPDF /> Exportar PDF
          </button>
          {exporting && <span style={{ fontSize: 13, color: C.mid, alignSelf: 'center' }}>Generando archivo...</span>}
        </div>

        {/* Tabla resumen */}
        <div className="sa-card">
          <div className="sa-card-head">
            <div>
              <h3>Resumen por estudiante</h3>
              <p>{resumenFiltrado.length} estudiante{resumenFiltrado.length !== 1 ? 's' : ''} · {mesesOpciones.find(m => m.value === filterMes)?.label}</p>
            </div>
            <input
              className="sa-search"
              placeholder="Buscar estudiante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sa-table-wrap">
            {loading ? (
              <div className="sa-empty">Cargando datos...</div>
            ) : resumenFiltrado.length === 0 ? (
              <div className="sa-empty">No hay registros con los filtros seleccionados.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Sección</th>
                    <th>Presentes</th>
                    <th>Tardanzas</th>
                    <th>Ausentes</th>
                    <th>Justificados</th>
                    <th>% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenFiltrado.map(r => {
                    const pct = r.total > 0
                      ? Math.round(((r.presentes + r.tardanzas + r.justificados) / r.total) * 100)
                      : 0
                    const pctColor = pct >= 90 ? '#16a34a' : pct >= 75 ? '#ca8a04' : '#dc2626'
                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{r.nombre}</div>
                          <div style={{ fontSize: 11, color: C.mid }}>{r.matricula}</div>
                        </td>
                        <td style={{ fontSize: 13, color: C.mid }}>{r.seccion}</td>
                        <td>
                          <span className="sa-badge presente"><IcoCheck />{r.presentes}</span>
                        </td>
                        <td>
                          <span className="sa-badge tarde"><IcoClock />{r.tardanzas}</span>
                        </td>
                        <td>
                          <span className="sa-badge ausente"><IcoX />{r.ausentes}</span>
                        </td>
                        <td>
                          <span className="sa-badge justificado">{r.justificados}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: pctColor, fontSize: 14 }}>{r.total > 0 ? `${pct}%` : '—'}</div>
                          {r.total > 0 && (
                            <div className="sa-pct-bar">
                              <div className="sa-pct-fill" style={{ width: `${pct}%`, background: pctColor }} />
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
