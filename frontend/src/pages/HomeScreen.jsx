import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSuperAdminProfile } from "../utils/access";
import BrandLogo from "../components/ui/BrandLogo";

const DASHBOARDS = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  parent: "/parent/dashboard",
  student: "/student/dashboard",
};

const FEATURES = [
  ["Registro QR", "Entradas y salidas en segundos con una lectura visual mucho mas clara del estado diario."],
  ["Excusas conectadas", "Adjuntos, comentarios docentes e historial visibles desde un flujo unico y ordenado."],
  ["Paneles por rol", "Direccion, docentes, familias y estudiantes operan con experiencias consistentes."],
  ["Lectura ejecutiva", "Indicadores, tablas y modulos con una presencia mas seria e institucional."],
];

const STEPS = [
  ["01", "El estudiante presenta su codigo", "Cada acceso QR identifica al alumno y habilita un registro preciso."],
  ["02", "El docente valida la jornada", "La asistencia se clasifica al instante y queda trazada para revision."],
  ["03", "La familia recibe seguimiento", "Excusas y novedades conviven en una experiencia mucho mas ordenada."],
];

const STYLES = `
  .hp-root {
    --ink: #111111;
    --muted: #666666;
    --navy: #111111;
    --blue: #111111;
    --blue-strong: #e82127;
    --sky: #dededb;
    --fog: #f5f5f4;
    --paper: rgba(255,255,255,.92);
    --paper-strong: rgba(255,255,255,.98);
    min-height: 100vh;
    color: var(--ink);
    font-family: "Sora", sans-serif;
    background:
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,245,244,.98)),
      linear-gradient(rgba(17,17,17,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.03) 1px, transparent 1px),
      #f5f5f4;
    background-size: auto, 48px 48px, 48px 48px, auto;
    overflow-x: hidden;
  }

  .hp-root * { box-sizing: border-box; }
  .hp-shell { width: min(1220px, calc(100% - 32px)); margin: 0 auto; }

  .hp-nav {
    position: sticky;
    top: 18px;
    z-index: 40;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 18px;
    margin-top: 18px;
    border-radius: 26px;
    border: 1px solid rgba(16,40,71,.1);
    background: rgba(255,255,255,.78);
    backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(8,20,35,.08);
  }

  .hp-brand { display: flex; align-items: center; gap: 12px; }

  .hp-mark {
    width: 48px;
    height: 48px;
    border-radius: 17px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--navy), var(--blue-strong));
    color: #fff;
    box-shadow: 0 18px 34px rgba(27,63,107,.22);
  }

  .hp-brand strong {
    display: block;
    font: 700 1.24rem "Fraunces", serif;
    letter-spacing: -.03em;
  }

  .hp-brand span {
    display: block;
    margin-top: 2px;
    font-size: .78rem;
    color: var(--muted);
  }

  .hp-links {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hp-links a,
  .hp-links button,
  .hp-btn {
    font: inherit;
    border: 0;
    text-decoration: none;
  }

  .hp-links a,
  .hp-links button {
    padding: 10px 14px;
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    font-weight: 700;
    transition: transform .22s ease, color .22s ease;
  }

  .hp-links a:hover,
  .hp-links button:hover {
    transform: translateY(-2px);
    color: var(--blue);
  }

  .hp-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(460px, .94fr);
    gap: 42px;
    align-items: center;
    padding: 96px 0 64px;
  }

  .hp-copy { animation: hp-rise .65s ease both; }

  .hp-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(16,40,71,.1);
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--blue);
  }

  .hp-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ffffff, #e82127);
  }

  .hp-copy h1 {
    margin: 22px 0 18px;
    font: 700 clamp(3rem, 6vw, 5.3rem)/.95 "Fraunces", serif;
    letter-spacing: -.06em;
  }

  .hp-copy h1 em {
    font-style: normal;
    color: var(--blue);
  }

  .hp-copy p {
    max-width: 640px;
    color: var(--muted);
    font-size: 1.03rem;
    line-height: 1.86;
  }

  .hp-actions,
  .hp-cta-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 30px;
  }

  .hp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 22px;
    border-radius: 999px;
    font-weight: 800;
    transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
  }

  .hp-btn:hover { transform: translateY(-2px); }

  .hp-btn-primary {
    background: linear-gradient(135deg, var(--navy), var(--blue-strong));
    color: #fff;
    box-shadow: 0 18px 34px rgba(27,63,107,.2);
  }

  .hp-btn-secondary {
    background: rgba(255,255,255,.82);
    color: var(--ink);
    border: 1px solid rgba(16,40,71,.12);
  }

  .hp-btn-danger {
    color: #8f3f3f;
    background: rgba(179,71,71,.08);
    border: 1px solid rgba(179,71,71,.16);
  }

  .hp-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 30px;
  }

  .hp-command-strip {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
    padding: 10px;
    border-radius: 22px;
    border: 1px solid rgba(17,17,17,.08);
    background: rgba(255,255,255,.72);
    box-shadow: 0 16px 36px rgba(17,17,17,.06);
    backdrop-filter: blur(18px);
  }

  .hp-command-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid rgba(17,17,17,.08);
    color: #111;
    font-size: .78rem;
    font-weight: 800;
  }

  .hp-command-chip::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #e82127;
    box-shadow: 0 0 0 5px rgba(232,33,39,.1);
  }

  .hp-metric,
  .hp-feature,
  .hp-step,
  .hp-role,
  .hp-cta {
    background: var(--paper);
    border: 1px solid rgba(16,40,71,.08);
    box-shadow: 0 24px 56px rgba(8,20,35,.08);
    backdrop-filter: blur(18px);
  }

  .hp-metric {
    padding: 18px;
    border-radius: 22px;
  }

  .hp-metric strong {
    display: block;
    font: 700 clamp(1.8rem, 3vw, 2.35rem) "Fraunces", serif;
  }

  .hp-metric span {
    display: block;
    margin-top: 6px;
    font-size: .9rem;
    color: var(--muted);
    line-height: 1.6;
  }

  .hp-stage {
    position: relative;
    min-height: 620px;
    animation: hp-rise .8s ease both;
  }

  .hp-phone {
    position: absolute;
    z-index: 8;
    top: 18px;
    right: 44px;
    width: 224px;
    padding: 10px;
    border-radius: 34px;
    background: #0b0b0c;
    border: 1px solid rgba(255,255,255,.18);
    box-shadow: 0 34px 78px rgba(0,0,0,.28);
    animation: hp-phone-float 5.4s ease-in-out infinite;
  }

  .hp-phone::before {
    content: "";
    position: absolute;
    top: 9px;
    left: 50%;
    width: 74px;
    height: 20px;
    border-radius: 0 0 14px 14px;
    background: #0b0b0c;
    transform: translateX(-50%);
    z-index: 3;
  }

  .hp-phone-screen {
    position: relative;
    min-height: 430px;
    overflow: hidden;
    border-radius: 26px;
    background:
      linear-gradient(160deg, rgba(232,33,39,.12), transparent 30%),
      linear-gradient(180deg, #fafafa 0%, #f0f0ef 100%);
    border: 1px solid rgba(255,255,255,.12);
  }

  .hp-phone-top {
    padding: 34px 18px 16px;
    background: #111;
    color: #fff;
  }

  .hp-phone-eyebrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: .62rem;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: rgba(255,255,255,.62);
  }

  .hp-phone-live {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #e82127;
    box-shadow: 0 0 0 5px rgba(232,33,39,.18);
  }

  .hp-phone-title {
    margin-top: 20px;
    font-size: 1.9rem;
    font-weight: 900;
    letter-spacing: -.07em;
    line-height: .95;
  }

  .hp-phone-title span {
    color: #e82127;
  }

  .hp-phone-card {
    margin: 12px;
    padding: 14px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(17,17,17,.08);
    box-shadow: 0 16px 30px rgba(17,17,17,.08);
  }

  .hp-phone-card strong {
    display: block;
    font-size: .74rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .hp-phone-card p {
    margin: 8px 0 0;
    color: #666;
    font-size: .72rem;
    line-height: 1.55;
  }

  .hp-phone-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: 10px 12px 0;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(17,17,17,.08);
  }

  .hp-phone-row span {
    display: block;
    color: #71717a;
    font-size: .66rem;
    margin-top: 3px;
  }

  .hp-phone-status {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: #111;
    color: #fff;
    font-size: .72rem;
    font-weight: 900;
  }

  .hp-phone-status.red {
    background: #e82127;
  }

  .hp-aura {
    position: absolute;
    inset: 0;
    border-radius: 38px;
    background:
      radial-gradient(circle at top right, rgba(184,212,232,.2), transparent 26%),
      linear-gradient(160deg, rgba(8,20,35,.98), rgba(16,40,71,.94) 56%, rgba(27,63,107,.92));
    border: 1px solid rgba(184,212,232,.16);
    box-shadow: 0 34px 82px rgba(8,20,35,.2);
  }

  .hp-card {
    position: absolute;
    border-radius: 28px;
    border: 1px solid rgba(16,40,71,.1);
    box-shadow: 0 26px 58px rgba(8,20,35,.14);
    overflow: hidden;
  }

  .hp-card-main {
    inset: 34px 34px 132px 34px;
    padding: 28px;
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(247,251,255,.9));
  }

  .hp-card-side,
  .hp-card-foot {
    width: 236px;
    padding: 22px;
    color: #fff;
    border-color: rgba(184,212,232,.16);
    background: linear-gradient(180deg, rgba(14,32,57,.92), rgba(27,63,107,.9));
    backdrop-filter: blur(16px);
  }

  .hp-card-side {
    right: 14px;
    top: 52px;
    animation: hp-float 4s ease-in-out infinite;
  }

  .hp-card-foot {
    left: 18px;
    bottom: 20px;
    animation: hp-float 4.8s ease-in-out infinite .4s;
  }

  .hp-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(27,63,107,.08);
    color: var(--blue);
    font-size: .75rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .hp-card-side .hp-tag,
  .hp-card-foot .hp-tag {
    background: rgba(255,255,255,.12);
    color: rgba(255,255,255,.88);
  }

  .hp-card h2 {
    margin-top: 18px;
    font: 700 2.15rem/1 "Fraunces", serif;
    letter-spacing: -.04em;
  }

  .hp-card h3 {
    margin-top: 16px;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -.02em;
  }

  .hp-panels {
    display: grid;
    grid-template-columns: 1.08fr .92fr;
    gap: 16px;
    margin-top: 20px;
  }

  .hp-panel {
    padding: 18px;
    border-radius: 22px;
    border: 1px solid rgba(16,40,71,.08);
    background: rgba(238,246,252,.82);
  }

  .hp-panel.dark {
    background: linear-gradient(135deg, rgba(16,40,71,.98), rgba(42,90,148,.94));
    color: #fff;
  }

  .hp-panel strong {
    display: block;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .hp-panel p,
  .hp-card p {
    font-size: .92rem;
    line-height: 1.72;
    color: inherit;
    opacity: .88;
  }

  .hp-progress {
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255,255,255,.2);
    margin-top: 12px;
  }

  .hp-progress span {
    display: block;
    width: 88%;
    height: 100%;
    background: linear-gradient(135deg, #cce4fb, #ffffff);
  }

  .hp-list {
    display: grid;
    gap: 12px;
    margin-top: 18px;
  }

  .hp-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(16,40,71,.08);
  }

  .hp-item strong {
    display: block;
    font-size: .95rem;
  }

  .hp-item span {
    display: block;
    margin-top: 3px;
    font-size: .84rem;
    color: var(--muted);
  }

  .hp-pill {
    margin-left: auto;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: .76rem;
    font-weight: 800;
  }

  .hp-pill.teal {
    background: rgba(138,226,196,.2);
    color: #1e6750;
  }

  .hp-pill.amber {
    background: rgba(255,223,176,.26);
    color: #8f6224;
  }

  .hp-note {
    margin-top: 14px;
    font-size: .9rem;
    color: var(--muted);
    line-height: 1.74;
  }

  .hp-section { padding-top: 42px; }
  .hp-head { max-width: 760px; margin-bottom: 24px; }

  .hp-label {
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--blue);
  }

  .hp-head h2 {
    margin-top: 12px;
    font: 700 clamp(2.1rem, 4vw, 3.35rem)/1.04 "Fraunces", serif;
    letter-spacing: -.04em;
  }

  .hp-head p {
    margin-top: 12px;
    color: var(--muted);
    line-height: 1.84;
  }

  .hp-grid,
  .hp-roles,
  .hp-steps {
    display: grid;
    gap: 16px;
  }

  .hp-grid,
  .hp-roles {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .hp-steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .hp-feature,
  .hp-role,
  .hp-step {
    padding: 24px;
    border-radius: 26px;
    transition: transform .22s ease, box-shadow .22s ease;
  }

  .hp-feature:hover,
  .hp-role:hover,
  .hp-step:hover {
    transform: translateY(-4px);
    box-shadow: 0 28px 62px rgba(8,20,35,.14);
  }

  .hp-feature h3,
  .hp-role h3,
  .hp-step h3,
  .hp-cta h3 {
    margin-top: 16px;
    font-size: 1.04rem;
    font-weight: 800;
    letter-spacing: -.02em;
  }

  .hp-feature p,
  .hp-role p,
  .hp-step p,
  .hp-cta p {
    margin-top: 12px;
    color: var(--muted);
    line-height: 1.74;
    font-size: .94rem;
  }

  .hp-icon,
  .hp-step-no {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    display: grid;
    place-items: center;
  }

  .hp-icon {
    background: linear-gradient(135deg, rgba(184,212,232,.4), rgba(42,90,148,.12));
    color: var(--blue);
  }

  .hp-step-no {
    background: linear-gradient(135deg, var(--navy), var(--blue-strong));
    color: #fff;
    font-weight: 800;
  }

  .hp-role.amber {
    background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(241,247,252,.84));
  }

  .hp-role.teal {
    background: linear-gradient(180deg, rgba(244,250,255,.95), rgba(226,237,248,.84));
  }

  .hp-role.ivory {
    background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(246,250,255,.86));
  }

  .hp-role.slate {
    background: linear-gradient(180deg, rgba(244,248,253,.95), rgba(226,235,245,.84));
  }

  .hp-cta-wrap { padding: 58px 0 86px; }

  .hp-cta {
    position: relative;
    overflow: hidden;
    padding: 36px;
    border-radius: 30px;
    background: linear-gradient(135deg, rgba(8,20,35,.98), rgba(27,63,107,.94));
    color: #fff;
  }

  .hp-cta::before {
    content: "";
    position: absolute;
    width: 240px;
    height: 240px;
    top: -90px;
    right: -18px;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
  }

  .hp-cta p {
    max-width: 620px;
    color: rgba(255,255,255,.82);
  }

  .hp-footer {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 0 0 34px;
    color: var(--muted);
    font-size: .92rem;
  }

  .hp-footer strong { color: var(--ink); }
  .hp-footer-brand { display: inline-flex; align-items: center; gap: 8px; }

  @keyframes hp-rise {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes hp-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes hp-phone-float {
    0%, 100% { transform: translateY(0) rotate(2deg); }
    50% { transform: translateY(-12px) rotate(-1deg); }
  }

  @media (max-width: 1080px) {
    .hp-hero,
    .hp-grid,
    .hp-roles,
    .hp-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 860px) {
    .hp-shell { width: min(100%, calc(100% - 24px)); }
    .hp-nav { position: static; flex-direction: column; align-items: stretch; }
    .hp-links { justify-content: center; }
    .hp-hero,
    .hp-grid,
    .hp-roles,
    .hp-steps,
    .hp-panels,
    .hp-metrics { grid-template-columns: 1fr; }
    .hp-stage { min-height: 740px; }
    .hp-card-main { inset: 24px 18px 220px 18px; }
    .hp-phone { right: 20px; top: 20px; width: 204px; }
    .hp-phone-screen { min-height: 390px; }
    .hp-card-side { top: auto; bottom: 102px; right: 16px; }
    .hp-card-foot { left: 16px; bottom: 18px; }
  }

  @media (max-width: 560px) {
    .hp-shell { width: min(100%, calc(100% - 16px)); }
    .hp-copy h1 { font-size: clamp(2.5rem, 12vw, 3.7rem); }
    .hp-stage { min-height: 810px; }
    .hp-card-main { inset: 14px 10px 270px 10px; padding: 22px 18px; }
    .hp-phone {
      position: relative;
      top: auto;
      right: auto;
      width: min(238px, calc(100% - 50px));
      margin: 0 auto 18px;
    }
    .hp-card-side,
    .hp-card-foot {
      width: calc(100% - 20px);
      left: 10px;
      right: 10px;
    }
    .hp-card-side { bottom: 136px; }
    .hp-card-foot { bottom: 10px; }
    .hp-feature,
    .hp-role,
    .hp-step,
    .hp-cta { padding: 22px; }
  }
`;

function IconLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.4" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.4" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" fill="currentColor" />
      <rect x="14" y="14" width="3" height="3" rx="0.7" fill="currentColor" />
      <rect x="18" y="14" width="3" height="3" rx="0.7" fill="currentColor" />
      <rect x="14" y="18" width="3" height="3" rx="0.7" fill="currentColor" />
      <rect x="18" y="18" width="3" height="3" rx="0.7" fill="currentColor" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconQr() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14h3v3M17 14h3M14 17h6M17 20h3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HomeScreen() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const dashboard = isSuperAdminProfile(profile)
    ? "/super-admin/dashboard"
    : DASHBOARDS[profile?.role] ?? "/login";

  return (
    <>
      <style>{STYLES}</style>
      <div className="hp-root">
        <div className="hp-shell">
          <nav className="hp-nav">
            <div className="hp-brand">
              <BrandLogo
                size={48}
                titleColor="#111111"
                subtitleColor="#666666"
                subtitle="Operacion escolar con una identidad mas institucional y cuidada."
              />
            </div>

            <div className="hp-links">
              <a href="#solucion">Solucion</a>
              <a href="#flujo">Flujo</a>
              <a href="#roles">Roles</a>
              {user ? (
                <>
                  <button type="button" className="hp-btn hp-btn-primary" onClick={() => navigate(dashboard)}>Mi panel</button>
                  <button type="button" className="hp-btn hp-btn-danger" onClick={async () => { await signOut(); navigate("/"); }}>Cerrar sesion</button>
                </>
              ) : (
                <button type="button" className="hp-btn hp-btn-primary" onClick={() => navigate("/login")}>Ingresar</button>
              )}
            </div>
          </nav>

          <section className="hp-hero">
            <div className="hp-copy">
              <div className="hp-kicker"><span className="hp-dot" />Plataforma escolar profesional</div>
              <h1>Asistencia <em>precisa</em>, seguimiento visible y una presencia lista para escalar.</h1>
              <p>La plataforma conserva tus funciones actuales, pero ahora se presenta como una solucion educativa mas seria: registro rapido para docentes, lectura clara para direccion y una experiencia mucho mas confiable para familias.</p>
              <div className="hp-actions">
                <button type="button" className="hp-btn hp-btn-primary" onClick={() => navigate(user ? dashboard : "/login")}>
                  <IconArrow />
                  {user ? "Abrir panel" : "Entrar al sistema"}
                </button>
                <button type="button" className="hp-btn hp-btn-secondary" onClick={() => document.getElementById("solucion")?.scrollIntoView({ behavior: "smooth" })}>Ver la experiencia</button>
              </div>
              <div className="hp-metrics">
                <div className="hp-metric"><strong>01</strong><span>flujo continuo para asistencia, incidencias y seguimiento institucional.</span></div>
                <div className="hp-metric"><strong>QR</strong><span>registro inmediato desde camara o escritorio con mejor contexto visual.</span></div>
                <div className="hp-metric"><strong>4 roles</strong><span>una sola plataforma con experiencias consistentes por perfil.</span></div>
              </div>
              <div className="hp-command-strip" aria-label="Indicadores principales del sistema">
                <span className="hp-command-chip">Escaneo seguro</span>
                <span className="hp-command-chip">Auditoria activa</span>
                <span className="hp-command-chip">Centro seleccionado</span>
              </div>
            </div>

            <div className="hp-stage">
              <div className="hp-aura" />
              <div className="hp-phone" aria-hidden="true">
                <div className="hp-phone-screen">
                  <div className="hp-phone-top">
                    <div className="hp-phone-eyebrow">
                      <span>Control mobile</span>
                      <span className="hp-phone-live" />
                    </div>
                    <div className="hp-phone-title">Entrada <span>07:42</span></div>
                  </div>
                  <div className="hp-phone-card">
                    <strong>Asistencia confirmada</strong>
                    <p>El escaneo QR registra hora, curso y responsable en una sola vista.</p>
                  </div>
                  <div className="hp-phone-row">
                    <div>
                      <strong>3ro B - Matutino</strong>
                      <span>28 presentes, 2 tardanzas</span>
                    </div>
                    <div className="hp-phone-status">QR</div>
                  </div>
                  <div className="hp-phone-row">
                    <div>
                      <strong>Alerta tutor</strong>
                      <span>Notificacion lista para revision</span>
                    </div>
                    <div className="hp-phone-status red">!</div>
                  </div>
                </div>
              </div>
              <div className="hp-card hp-card-main">
                <div className="hp-tag"><IconQr />Jornada escolar en vivo</div>
                <h2>Un sistema que proyecta orden, criterio y control operativo.</h2>
                <div className="hp-panels">
                  <div className="hp-panel dark">
                    <strong>Estado del dia</strong>
                    <p>87% de asistencia al corte, 4 excusas en revision y alertas listas para accion inmediata.</p>
                    <div className="hp-progress"><span /></div>
                  </div>
                  <div className="hp-panel">
                    <strong>Lectura ejecutiva</strong>
                    <p>Resumen ejecutivo del centro con indicadores faciles de leer y defender.</p>
                  </div>
                </div>
                <div className="hp-list">
                  <div className="hp-item"><div><strong>Excusa recibida</strong><span>Adjunto validado y lista para revision docente.</span></div><span className="hp-pill amber">Pendiente</span></div>
                  <div className="hp-item"><div><strong>Registro confirmado</strong><span>Entrada visible para familia y administracion.</span></div><span className="hp-pill teal">Listo</span></div>
                </div>
                <div className="hp-note">La propuesta visual busca que el producto se vea tan confiable como la informacion que organiza.</div>
              </div>
              <div className="hp-card hp-card-side"><div className="hp-tag">Docente</div><h3>Escaneo con contexto</h3><p>El QR registra, ubica al alumno y deja un evento entendible de inmediato.</p></div>
              <div className="hp-card hp-card-foot"><div className="hp-tag">Familia</div><h3>Seguimiento mas claro</h3><p>Historial y excusas visibles desde un flujo mucho mas sereno y profesional.</p></div>
            </div>
          </section>

          <section id="solucion" className="hp-section">
            <div className="hp-head">
              <div className="hp-label">Diseno con criterio</div>
              <h2>Una direccion visual mucho mas fuerte para todo el producto.</h2>
              <p>La experiencia ahora se apoya en superficies limpias, contraste serio y composicion mas ejecutiva para que todo el sistema se vea premium.</p>
            </div>
            <div className="hp-grid">
              {FEATURES.map(([title, copy]) => (
                <article key={title} className="hp-feature">
                  <div className="hp-icon"><IconQr /></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="flujo" className="hp-section">
            <div className="hp-head">
              <div className="hp-label">Flujo operativo</div>
              <h2>Todo ocurre en una secuencia simple y visible.</h2>
              <p>El rediseño comunica mejor el recorrido del sistema: desde el escaneo hasta la confirmacion que ven familias y direccion.</p>
            </div>
            <div className="hp-steps">
              {STEPS.map(([step, title, copy]) => (
                <article key={step} className="hp-step">
                  <div className="hp-step-no">{step}</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="roles" className="hp-section">
            <div className="hp-head">
              <div className="hp-label">Experiencia por rol</div>
              <h2>La plataforma se adapta a quien la usa.</h2>
              <p>Cada perfil mantiene sus permisos actuales, pero ahora dentro de una interfaz mas sobria, clara y coherente.</p>
            </div>
            <div className="hp-roles">
              <article className="hp-role amber"><h3>Direccion</h3><p>Vista ejecutiva del centro, estructura academica y control de usuarios.</p></article>
              <article className="hp-role teal"><h3>Docente</h3><p>Escaneo QR, registro manual, revision de excusas y seguimiento diario.</p></article>
              <article className="hp-role ivory"><h3>Padres y tutores</h3><p>Historial, asistencia y envio de justificativos sin friccion.</p></article>
              <article className="hp-role slate"><h3>Estudiante</h3><p>Consulta personal de asistencia y acceso rapido a su informacion clave.</p></article>
            </div>
          </section>

          <section className="hp-cta-wrap">
            <div className="hp-cta">
              <div className="hp-label" style={{ color: "rgba(255,255,255,.78)" }}>Entrada al sistema</div>
              <h3>Una portada lista para dar una primera impresion mucho mas fuerte.</h3>
              <p>Accede al login y continua con un lenguaje visual mas profesional, mejor ritmo de lectura y una sensacion mucho mas premium en todo el proyecto.</p>
              <div className="hp-cta-actions">
                <button type="button" className="hp-btn hp-btn-primary" onClick={() => navigate(user ? dashboard : "/login")}>
                  <IconArrow />
                  {user ? "Ir a mi panel" : "Entrar ahora"}
                </button>
                {!user && <button type="button" className="hp-btn hp-btn-secondary" onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })}>Ver roles</button>}
              </div>
            </div>
          </section>

          <footer className="hp-footer">
            <span className="hp-footer-brand"><BrandLogo compact size={28} titleColor="#111111" subtitleColor="#666666" /> - asistencia escolar con una presencia visual mucho mas profesional.</span>
            <span>Diseno enfocado en criterio institucional, claridad y continuidad operativa.</span>
          </footer>
        </div>
      </div>
    </>
  );
}

export default HomeScreen;
