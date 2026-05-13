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

const NAV_ITEMS = [
  ["Operacion", "operacion"],
  ["Flujo", "flujo"],
  ["Roles", "roles"],
];

const HERO_STATS = [
  ["92%", "asistencia registrada"],
  ["18", "escaneos recientes"],
  ["4", "excusas por revisar"],
];

const FEATURE_ROWS = [
  ["QR en puerta", "Registro rapido de entrada y salida con hora, curso y responsable."],
  ["Excusas trazables", "Adjuntos, estados y comentarios reunidos en el historial del estudiante."],
  ["Panel directivo", "Indicadores simples para revisar asistencia, tardanzas y actividad del centro."],
];

const WORKFLOW = [
  ["1", "Escanear", "El docente valida el codigo QR del estudiante al iniciar la jornada."],
  ["2", "Registrar", "QHere clasifica asistencia, tardanza o ausencia y deja evidencia del evento."],
  ["3", "Resolver", "Familias y administracion revisan excusas, alertas y seguimiento desde su panel."],
];

const ROLES = [
  ["Direccion", "Supervisa el centro, usuarios, cursos y reportes operativos."],
  ["Docentes", "Registran asistencia, revisan excusas y detectan incidencias diarias."],
  ["Familias", "Consultan historial y envian justificativos con archivos adjuntos."],
  ["Estudiantes", "Ven su estado de asistencia y sus excusas desde una vista simple."],
];

const STYLES = `
  .qh-home {
    --ink: #141414;
    --muted: #626262;
    --line: #dfdfdc;
    --paper: #ffffff;
    --paper-soft: #f7f7f3;
    --charcoal: #171717;
    --red: #e82127;
    --red-dark: #b9161c;
    --green: #18745d;
    --green-soft: #e8f5ef;
    --amber: #9d6a1b;
    --amber-soft: #fff3dc;
    --blue: #28648f;
    --blue-soft: #e8f2f7;
    min-height: 100vh;
    color: var(--ink);
    background:
      linear-gradient(90deg, rgba(20, 20, 20, .035) 1px, transparent 1px),
      linear-gradient(180deg, rgba(20, 20, 20, .035) 1px, transparent 1px),
      linear-gradient(180deg, #fbfbf8 0%, #f0f0eb 100%);
    background-size: 44px 44px, 44px 44px, auto;
    font-family: "Sora", sans-serif;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }

  .qh-home * { box-sizing: border-box; }

  .qh-home-shell {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
  }

  .qh-home-nav {
    position: sticky;
    top: 14px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 14px;
    padding: 12px;
    border: 1px solid rgba(20, 20, 20, .1);
    border-radius: 8px;
    background: rgba(255, 255, 255, .9);
    box-shadow: 0 18px 42px rgba(20, 20, 20, .08);
    backdrop-filter: blur(16px);
  }

  .qh-home-links,
  .qh-home-actions,
  .qh-home-cta-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .qh-home-link,
  .qh-home-btn {
    border: 0;
    font: inherit;
    text-decoration: none;
  }

  .qh-home-link {
    padding: 10px 12px;
    color: var(--muted);
    font-size: .88rem;
    font-weight: 800;
    border-radius: 8px;
    transition: background .2s ease, color .2s ease;
  }

  .qh-home-link:hover {
    color: var(--ink);
    background: #f0f0ec;
  }

  .qh-home-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    font-weight: 900;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
  }

  .qh-home-btn:hover {
    transform: translateY(-1px);
  }

  .qh-home-btn.primary {
    color: #fff;
    background: var(--charcoal);
    box-shadow: inset 0 -3px 0 var(--red), 0 14px 28px rgba(20, 20, 20, .16);
  }

  .qh-home-btn.secondary {
    color: var(--ink);
    background: #fff;
    border: 1px solid var(--line);
  }

  .qh-home-btn.danger {
    color: #8d171b;
    background: #fff1f1;
    border: 1px solid #ffd0d0;
  }

  .qh-home-hero {
    display: grid;
    grid-template-columns: minmax(0, .9fr) minmax(430px, 1fr);
    gap: 44px;
    align-items: center;
    min-height: calc(100vh - 88px);
    padding: 48px 0 54px;
  }

  .qh-home-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, .72);
    color: var(--red-dark);
    font-size: .78rem;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .qh-home-kicker img {
    width: 22px;
    height: 22px;
    display: block;
  }

  .qh-home-title {
    max-width: 780px;
    margin: 20px 0 18px;
    font-family: "Fraunces", serif;
    font-size: clamp(3rem, 7vw, 6.15rem);
    font-weight: 800;
    line-height: .9;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }

  .qh-home-title span {
    color: var(--red);
  }

  .qh-home-copy {
    max-width: 640px;
    color: var(--muted);
    font-size: 1.04rem;
    line-height: 1.78;
    overflow-wrap: anywhere;
  }

  .qh-home-hero > *,
  .qh-home-section-head > *,
  .qh-home-cta > * {
    min-width: 0;
  }

  .qh-home-proof {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 30px;
  }

  .qh-home-stat {
    min-height: 98px;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, .78);
  }

  .qh-home-stat strong {
    display: block;
    font-family: "Fraunces", serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    line-height: 1;
  }

  .qh-home-stat span {
    display: block;
    margin-top: 8px;
    color: var(--muted);
    font-size: .82rem;
    line-height: 1.45;
  }

  .qh-home-showcase {
    position: relative;
    min-width: 0;
    padding-top: 42px;
  }

  .qh-home-product {
    position: relative;
    border: 1px solid #2f2f2f;
    border-radius: 8px;
    background: var(--charcoal);
    box-shadow: 0 30px 80px rgba(20, 20, 20, .26);
    overflow: hidden;
  }

  .qh-home-product-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, .12);
  }

  .qh-home-window-dots {
    display: flex;
    gap: 7px;
  }

  .qh-home-window-dots span {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #fff;
    opacity: .34;
  }

  .qh-home-product-label {
    color: rgba(255, 255, 255, .72);
    font-size: .76rem;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .qh-home-product-body {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    min-height: 520px;
    background: #f6f6f2;
  }

  .qh-home-product-side {
    padding: 18px 12px;
    color: #fff;
    background: #171717;
  }

  .qh-home-side-title {
    padding: 0 8px 14px;
    color: rgba(255, 255, 255, .58);
    font-size: .72rem;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .qh-home-side-item {
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 40px;
    margin-bottom: 6px;
    padding: 0 8px;
    border-radius: 8px;
    color: rgba(255, 255, 255, .76);
    font-size: .82rem;
    font-weight: 800;
  }

  .qh-home-side-item.active {
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }

  .qh-home-side-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--red);
  }

  .qh-home-board {
    padding: 18px;
  }

  .qh-home-board-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 16px;
  }

  .qh-home-board h2,
  .qh-home-section h2,
  .qh-home-cta h2 {
    font-family: "Fraunces", serif;
    font-weight: 800;
    letter-spacing: 0;
  }

  .qh-home-board h2 {
    font-size: 2.2rem;
    line-height: 1;
  }

  .qh-home-board p {
    margin-top: 7px;
    color: var(--muted);
    font-size: .88rem;
  }

  .qh-home-live {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    color: var(--green);
    background: var(--green-soft);
    font-size: .74rem;
    font-weight: 900;
    white-space: nowrap;
  }

  .qh-home-live::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green);
  }

  .qh-home-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .qh-home-mini {
    min-height: 118px;
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
  }

  .qh-home-mini span {
    color: var(--muted);
    font-size: .75rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .qh-home-mini strong {
    display: block;
    margin-top: 14px;
    font-size: 1.6rem;
  }

  .qh-home-scan {
    display: grid;
    grid-template-columns: 148px minmax(0, 1fr);
    gap: 12px;
    margin-top: 12px;
  }

  .qh-home-qr {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    padding: 14px;
    aspect-ratio: 1;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
  }

  .qh-home-qr span {
    border-radius: 4px;
    background: var(--charcoal);
  }

  .qh-home-qr span:nth-child(3n),
  .qh-home-qr span:nth-child(5),
  .qh-home-qr span:nth-child(14) {
    background: var(--red);
  }

  .qh-home-activity {
    display: grid;
    gap: 10px;
  }

  .qh-home-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
  }

  .qh-home-row strong {
    display: block;
    font-size: .9rem;
  }

  .qh-home-row span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: .78rem;
  }

  .qh-home-badge {
    padding: 7px 9px;
    border-radius: 8px;
    font-size: .72rem;
    font-weight: 900;
    white-space: nowrap;
  }

  .qh-home-badge.green {
    color: var(--green);
    background: var(--green-soft);
  }

  .qh-home-badge.amber {
    color: var(--amber);
    background: var(--amber-soft);
  }

  .qh-home-phone {
    position: absolute;
    z-index: 5;
    top: 0;
    right: -18px;
    width: 196px;
    padding: 9px;
    border: 1px solid rgba(255, 255, 255, .16);
    border-radius: 30px;
    background: #0d0d0e;
    box-shadow: 0 28px 68px rgba(20, 20, 20, .34);
    animation: qh-home-phone-float 5.2s ease-in-out infinite;
  }

  .qh-home-phone::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    z-index: 2;
    width: 70px;
    height: 18px;
    border-radius: 0 0 14px 14px;
    background: #0d0d0e;
    transform: translateX(-50%);
  }

  .qh-home-phone-screen {
    min-height: 374px;
    overflow: hidden;
    border-radius: 23px;
    background:
      linear-gradient(160deg, rgba(232, 33, 39, .15), transparent 34%),
      linear-gradient(180deg, #fafafa 0%, #efefeb 100%);
  }

  .qh-home-phone-top {
    padding: 32px 16px 15px;
    color: #fff;
    background: var(--charcoal);
  }

  .qh-home-phone-kicker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: rgba(255, 255, 255, .62);
    font-size: .58rem;
    font-weight: 900;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .qh-home-phone-live {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--red);
    box-shadow: 0 0 0 5px rgba(232, 33, 39, .18);
  }

  .qh-home-phone-title {
    margin-top: 18px;
    font-size: 1.62rem;
    font-weight: 900;
    line-height: 1;
  }

  .qh-home-phone-title span {
    display: block;
    color: var(--red);
  }

  .qh-home-phone-card,
  .qh-home-phone-row {
    margin: 10px;
    border: 1px solid rgba(20, 20, 20, .08);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 10px 24px rgba(20, 20, 20, .08);
  }

  .qh-home-phone-card {
    padding: 12px;
  }

  .qh-home-phone-card strong,
  .qh-home-phone-row strong {
    display: block;
    font-size: .72rem;
  }

  .qh-home-phone-card p,
  .qh-home-phone-row span {
    display: block;
    margin-top: 6px;
    color: var(--muted);
    font-size: .66rem;
    line-height: 1.45;
  }

  .qh-home-phone-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px;
  }

  .qh-home-phone-chip {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: #fff;
    background: var(--charcoal);
    font-size: .7rem;
    font-weight: 900;
  }

  .qh-home-phone-chip.red {
    background: var(--red);
  }

  .qh-home-section {
    padding: 54px 0;
    border-top: 1px solid rgba(20, 20, 20, .08);
  }

  .qh-home-section-head {
    display: grid;
    grid-template-columns: minmax(0, .72fr) minmax(280px, .5fr);
    gap: 30px;
    align-items: end;
    margin-bottom: 20px;
  }

  .qh-home-label {
    color: var(--red-dark);
    font-size: .78rem;
    font-weight: 900;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .qh-home-section h2,
  .qh-home-cta h2 {
    margin-top: 10px;
    font-size: clamp(2rem, 4.8vw, 3.6rem);
    line-height: 1;
  }

  .qh-home-section-head p {
    color: var(--muted);
    line-height: 1.75;
  }

  .qh-home-feature-list,
  .qh-home-workflow,
  .qh-home-roles {
    display: grid;
    gap: 10px;
  }

  .qh-home-feature-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .qh-home-workflow {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .qh-home-roles {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .qh-home-feature,
  .qh-home-step,
  .qh-home-role {
    min-height: 188px;
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, .78);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .qh-home-feature:hover,
  .qh-home-step:hover,
  .qh-home-role:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 42px rgba(20, 20, 20, .08);
  }

  .qh-home-icon,
  .qh-home-step-no {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    font-weight: 900;
  }

  .qh-home-icon {
    color: var(--blue);
    background: var(--blue-soft);
  }

  .qh-home-step-no {
    color: #fff;
    background: var(--charcoal);
    box-shadow: inset 0 -3px 0 var(--red);
  }

  .qh-home-feature h3,
  .qh-home-step h3,
  .qh-home-role h3 {
    margin-top: 18px;
    font-size: 1.02rem;
    font-weight: 900;
  }

  .qh-home-feature p,
  .qh-home-step p,
  .qh-home-role p {
    margin-top: 10px;
    color: var(--muted);
    font-size: .92rem;
    line-height: 1.65;
  }

  .qh-home-role:nth-child(2) .qh-home-icon { color: var(--green); background: var(--green-soft); }
  .qh-home-role:nth-child(3) .qh-home-icon { color: var(--amber); background: var(--amber-soft); }
  .qh-home-role:nth-child(4) .qh-home-icon { color: var(--red-dark); background: #fff1f1; }

  .qh-home-cta-wrap {
    padding: 22px 0 58px;
  }

  .qh-home-cta {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
    padding: 28px;
    border-radius: 8px;
    color: #fff;
    background:
      linear-gradient(90deg, rgba(232, 33, 39, .16), transparent 46%),
      var(--charcoal);
    box-shadow: 0 26px 62px rgba(20, 20, 20, .2);
  }

  .qh-home-cta p {
    max-width: 680px;
    margin-top: 12px;
    color: rgba(255, 255, 255, .72);
    line-height: 1.7;
  }

  .qh-home-cta .qh-home-label {
    color: rgba(255, 255, 255, .68);
  }

  .qh-home-cta .qh-home-btn.secondary {
    color: #fff;
    background: rgba(255, 255, 255, .1);
    border-color: rgba(255, 255, 255, .18);
  }

  .qh-home-footer {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    padding: 0 0 28px;
    color: var(--muted);
    font-size: .86rem;
  }

  @keyframes qh-home-phone-float {
    0%, 100% { transform: translateY(0) rotate(2deg); }
    50% { transform: translateY(-12px) rotate(-1deg); }
  }

  @media (max-width: 1080px) {
    .qh-home-hero,
    .qh-home-section-head,
    .qh-home-cta {
      grid-template-columns: 1fr;
    }

    .qh-home-product {
      max-width: 820px;
    }

    .qh-home-phone {
      right: 18px;
    }

    .qh-home-feature-list,
    .qh-home-workflow,
    .qh-home-roles {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .qh-home-shell {
      width: min(100%, calc(100% - 18px));
    }

    .qh-home-nav {
      position: static;
      align-items: stretch;
      flex-direction: column;
    }

    .qh-home-links,
    .qh-home-actions,
    .qh-home-cta-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .qh-home-link,
    .qh-home-btn {
      width: 100%;
      justify-content: center;
      text-align: center;
    }

    .qh-home-hero {
      min-height: auto;
      padding-top: 36px;
    }

    .qh-home-title {
      width: 100%;
      max-width: min(100%, 340px);
      font-size: clamp(2rem, 9.2vw, 2.65rem);
      line-height: 1.06;
      white-space: normal;
      word-break: normal;
    }

    .qh-home-title span {
      display: block;
    }

    .qh-home-copy,
    .qh-home-kicker,
    .qh-home-actions,
    .qh-home-proof,
    .qh-home-showcase,
    .qh-home-product {
      width: 100%;
      max-width: calc(100vw - 18px);
    }

    .qh-home-copy {
      max-width: min(100%, 340px);
    }

    .qh-home-proof,
    .qh-home-grid,
    .qh-home-scan,
    .qh-home-feature-list,
    .qh-home-workflow,
    .qh-home-roles {
      grid-template-columns: 1fr;
    }

    .qh-home-product-body {
      grid-template-columns: 1fr;
    }

    .qh-home-showcase {
      display: flex;
      flex-direction: column;
      padding-top: 0;
    }

    .qh-home-phone {
      position: relative;
      order: -1;
      top: auto;
      right: auto;
      width: min(232px, 78vw);
      margin: 0 auto -18px;
    }

    .qh-home-product-side {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 12px;
    }

    .qh-home-side-title {
      display: none;
    }

    .qh-home-side-item {
      flex: 0 0 auto;
      margin: 0;
      white-space: nowrap;
    }

    .qh-home-board {
      padding: 14px;
    }

    .qh-home-board-head {
      display: grid;
    }

    .qh-home-live {
      justify-self: start;
    }

    .qh-home-feature,
    .qh-home-step,
    .qh-home-role {
      min-height: auto;
    }
  }

  @media (max-width: 460px) {
    .qh-home {
      background-size: 34px 34px, 34px 34px, auto;
    }

    .qh-home-phone-screen {
      min-height: 348px;
    }

    .qh-home-board h2 {
      font-size: 1.75rem;
    }

    .qh-home-product-top {
      align-items: flex-start;
      flex-direction: column;
    }

    .qh-home-row {
      grid-template-columns: 1fr;
    }

    .qh-home-badge {
      justify-self: start;
    }

    .qh-home-cta {
      padding: 20px;
    }
  }
`;

function Icon({ type = "qr" }) {
  const paths = {
    qr: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1.2" />
        <rect x="14" y="4" width="6" height="6" rx="1.2" />
        <rect x="4" y="14" width="6" height="6" rx="1.2" />
        <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
      </>
    ),
    chart: (
      <>
        <path d="M5 19V9" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </>
    ),
    file: (
      <>
        <path d="M7 4h7l4 4v12H7z" />
        <path d="M14 4v5h5" />
        <path d="M9.5 13h5M9.5 16h4" />
      </>
    ),
    user: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={type === "qr" ? "currentColor" : "none"}
      >
        {paths[type] ?? paths.qr}
      </g>
    </svg>
  );
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function HomeScreen() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const dashboard = isSuperAdminProfile(profile)
    ? "/super-admin/dashboard"
    : DASHBOARDS[profile?.role] ?? "/login";
  const destination = user ? dashboard : "/login";

  return (
    <>
      <style>{STYLES}</style>
      <main className="qh-home">
        <div className="qh-home-shell">
          <nav className="qh-home-nav" aria-label="Navegacion principal">
            <BrandLogo
              size={46}
              titleColor="#141414"
              subtitleColor="#626262"
              subtitle="Asistencia escolar con QR"
            />

            <div className="qh-home-links">
              {NAV_ITEMS.map(([label, id]) => (
                <button key={id} type="button" className="qh-home-link" onClick={() => scrollToSection(id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="qh-home-actions">
              {user ? (
                <>
                  <button type="button" className="qh-home-btn secondary" onClick={() => navigate(dashboard)}>
                    Mi panel
                  </button>
                  <button
                    type="button"
                    className="qh-home-btn danger"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}
                  >
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <button type="button" className="qh-home-btn primary" onClick={() => navigate("/login")}>
                  Ingresar
                  <Icon type="arrow" />
                </button>
              )}
            </div>
          </nav>

          <section className="qh-home-hero">
            <div>
              <div className="qh-home-kicker">
                <img src="/qhere-icon.svg" alt="" />
                Control escolar en tiempo real
              </div>
              <h1 className="qh-home-title">
                Asistencia clara <span>para colegios.</span>
              </h1>
              <p className="qh-home-copy">
                QHere reune registro QR, excusas, reportes y paneles por rol para mantener el control diario sin
                perder contexto.
              </p>

              <div className="qh-home-actions" style={{ marginTop: 28 }}>
                <button type="button" className="qh-home-btn primary" onClick={() => navigate(destination)}>
                  {user ? "Abrir mi panel" : "Entrar al sistema"}
                  <Icon type="arrow" />
                </button>
                <button type="button" className="qh-home-btn secondary" onClick={() => scrollToSection("operacion")}>
                  Ver operacion
                </button>
              </div>

              <div className="qh-home-proof" aria-label="Indicadores de ejemplo">
                {HERO_STATS.map(([value, label]) => (
                  <div key={label} className="qh-home-stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="qh-home-showcase">
              <section className="qh-home-product" aria-label="Vista previa del panel QHere">
                <div className="qh-home-product-top">
                  <div className="qh-home-window-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="qh-home-product-label">QHere / jornada de hoy</div>
                </div>

                <div className="qh-home-product-body">
                  <aside className="qh-home-product-side">
                    <div className="qh-home-side-title">Paneles</div>
                    {["Resumen", "QR", "Excusas", "Familias", "Reportes"].map((item, index) => (
                      <div key={item} className={`qh-home-side-item ${index === 0 ? "active" : ""}`}>
                        <span className="qh-home-side-dot" />
                        {item}
                      </div>
                    ))}
                  </aside>

                  <div className="qh-home-board">
                    <div className="qh-home-board-head">
                      <div>
                        <h2>Control de asistencia</h2>
                        <p>Lunes, jornada matutina - Centro principal</p>
                      </div>
                      <span className="qh-home-live">En vivo</span>
                    </div>

                    <div className="qh-home-grid">
                      <div className="qh-home-mini">
                        <span>Presentes</span>
                        <strong>248</strong>
                      </div>
                      <div className="qh-home-mini">
                        <span>Tardanzas</span>
                        <strong>17</strong>
                      </div>
                      <div className="qh-home-mini">
                        <span>Ausencias</span>
                        <strong>9</strong>
                      </div>
                    </div>

                    <div className="qh-home-scan">
                      <div className="qh-home-qr" aria-hidden="true">
                        {Array.from({ length: 16 }, (_, index) => (
                          <span key={index} />
                        ))}
                      </div>

                      <div className="qh-home-activity">
                        <div className="qh-home-row">
                          <div>
                            <strong>3ro B - Sofia Martinez</strong>
                            <span>Entrada validada por QR a las 07:42</span>
                          </div>
                          <span className="qh-home-badge green">Presente</span>
                        </div>
                        <div className="qh-home-row">
                          <div>
                            <strong>5to A - Diego Rojas</strong>
                            <span>Justificativo con adjunto pendiente</span>
                          </div>
                          <span className="qh-home-badge amber">Revision</span>
                        </div>
                        <div className="qh-home-row">
                          <div>
                            <strong>2do C - Maria Alvarez</strong>
                            <span>Notificacion lista para la familia</span>
                          </div>
                          <span className="qh-home-badge green">Listo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="qh-home-phone" aria-hidden="true">
                <div className="qh-home-phone-screen">
                  <div className="qh-home-phone-top">
                    <div className="qh-home-phone-kicker">
                      <span>Control mobile</span>
                      <span className="qh-home-phone-live" />
                    </div>
                    <div className="qh-home-phone-title">
                      Entrada <span>07:42</span>
                    </div>
                  </div>
                  <div className="qh-home-phone-card">
                    <strong>Asistencia confirmada</strong>
                    <p>El escaneo QR registra hora, curso y responsable en una sola vista.</p>
                  </div>
                  <div className="qh-home-phone-row">
                    <div>
                      <strong>3ro B - Matutino</strong>
                      <span>28 presentes, 2 tardanzas</span>
                    </div>
                    <span className="qh-home-phone-chip">QR</span>
                  </div>
                  <div className="qh-home-phone-row">
                    <div>
                      <strong>Alerta tutor</strong>
                      <span>Notificacion lista</span>
                    </div>
                    <span className="qh-home-phone-chip red">!</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="operacion" className="qh-home-section">
            <div className="qh-home-section-head">
              <div>
                <div className="qh-home-label">Operacion escolar</div>
                <h2>Menos friccion en cada registro.</h2>
              </div>
              <p>
                La portada ahora presenta el sistema como una herramienta de trabajo: directa, confiable y lista
                para usarse desde el primer clic.
              </p>
            </div>

            <div className="qh-home-feature-list">
              {FEATURE_ROWS.map(([title, copy], index) => (
                <article key={title} className="qh-home-feature">
                  <div className="qh-home-icon">
                    <Icon type={index === 0 ? "qr" : index === 1 ? "file" : "chart"} />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="flujo" className="qh-home-section">
            <div className="qh-home-section-head">
              <div>
                <div className="qh-home-label">Flujo diario</div>
                <h2>Del QR al seguimiento sin perder contexto.</h2>
              </div>
              <p>
                Cada movimiento queda conectado: escaneo, estado, excusa, revision y lectura administrativa.
              </p>
            </div>

            <div className="qh-home-workflow">
              {WORKFLOW.map(([step, title, copy]) => (
                <article key={step} className="qh-home-step">
                  <div className="qh-home-step-no">{step}</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="roles" className="qh-home-section">
            <div className="qh-home-section-head">
              <div>
                <div className="qh-home-label">Acceso por rol</div>
                <h2>Una entrada clara para cada usuario.</h2>
              </div>
              <p>
                El mismo sistema entrega vistas distintas segun el perfil, manteniendo permisos y tareas bien
                separados.
              </p>
            </div>

            <div className="qh-home-roles">
              {ROLES.map(([title, copy], index) => (
                <article key={title} className="qh-home-role">
                  <div className="qh-home-icon">
                    <Icon type={index === 0 ? "chart" : index === 1 ? "qr" : index === 2 ? "file" : "user"} />
                  </div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="qh-home-cta-wrap">
            <div className="qh-home-cta">
              <div>
                <div className="qh-home-label">Entrada al sistema</div>
                <h2>Empieza la jornada desde un lugar mas claro.</h2>
                <p>
                  Accede al panel que corresponde a tu rol y continua con asistencia, excusas o gestion escolar.
                </p>
              </div>
              <div className="qh-home-cta-actions">
                <button type="button" className="qh-home-btn primary" onClick={() => navigate(destination)}>
                  {user ? "Ir al panel" : "Ingresar"}
                  <Icon type="arrow" />
                </button>
                {!user ? (
                  <button type="button" className="qh-home-btn secondary" onClick={() => navigate("/director/register")}>
                    Solicitud de registro
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <footer className="qh-home-footer">
            <span>QHere - asistencia, excusas y control escolar.</span>
            <span>Hecho para jornadas que necesitan orden desde temprano.</span>
          </footer>
        </div>
      </main>
    </>
  );
}

export default HomeScreen;
