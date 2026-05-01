import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchAvailableSchools,
  resolveDashboardPath,
  sendPasswordReset,
  signInWithGoogle,
  signInWithProfile,
} from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import { ACTIVE_SCHOOL_KEY, LAST_SCHOOL_KEY } from '../utils/schoolAccess'
import BrandLogo from '../components/ui/BrandLogo'

const LAST_EMAIL_KEY = 'qhere:last-email'

const ROLE_LABELS = {
  admin: 'Direccion',
  teacher: 'Docente',
  parent: 'Familia',
  student: 'Estudiante',
}

const FEATURES = [
  {
    title: 'Ingreso por centro',
    copy: 'Validamos el acceso contra el centro correcto sin pasos sobrantes.',
    Icon: IconSchool,
  },
  {
    title: 'Ruta por perfil',
    copy: 'Cada sesion aterriza directo en el panel correcto segun el rol.',
    Icon: IconSpark,
  },
  {
    title: 'Recuperacion simple',
    copy: 'El correo de recuperacion siempre a mano, sin competir con el formulario.',
    Icon: IconCheck,
  },
]

const STYLES = `
  .lg-root {
    --ink: #111111;
    --muted: #666666;
    --navy: #111111;
    --blue: #111111;
    --blue-strong: #e82127;
    min-height: 100vh;
    color: var(--ink);
    font-family: "Sora", sans-serif;
    background:
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,245,244,.98)),
      linear-gradient(rgba(17,17,17,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.03) 1px, transparent 1px),
      #f5f5f4;
    background-size: auto, 48px 48px, 48px 48px, auto;
  }

  .lg-root * { box-sizing: border-box; }

  .lg-shell {
    width: min(1180px, calc(100% - 32px));
    min-height: 100vh;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr);
    gap: 28px;
    align-items: start;
    padding: 32px 0;
  }

  .lg-hero {
    position: relative;
    overflow: hidden;
    padding: 34px;
    border-radius: 32px;
    border: 1px solid rgba(184,212,232,.14);
    background: linear-gradient(160deg, rgba(8,20,35,.98), rgba(16,40,71,.96) 58%, rgba(27,63,107,.92));
    box-shadow: 0 34px 82px rgba(8,20,35,.18);
    color: #fff;
  }

  /* Removed ::after — was overlapping hero text */
  .lg-hero::before {
    content: "";
    position: absolute;
    inset: auto -10% -18% auto;
    width: 300px;
    height: 300px;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    pointer-events: none;
  }

  .lg-nav,
  .lg-hero-body { position: relative; z-index: 1; }

  .lg-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
  }

  .lg-brand { display: flex; align-items: center; gap: 14px; }

  .lg-mark {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #ffffff, #dce9f5);
    color: var(--blue);
    box-shadow: 0 18px 40px rgba(0,0,0,.16);
    flex-shrink: 0;
  }

  .lg-brand-copy strong,
  .lg-panel-brand strong {
    display: block;
    font: 700 1.25rem "Fraunces", serif;
    letter-spacing: -.03em;
  }

  .lg-brand-copy span,
  .lg-panel-brand span {
    display: block;
    margin-top: 4px;
    font-size: .84rem;
    color: rgba(255,255,255,.72);
  }

  .lg-home {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.08);
    color: #fff;
    text-decoration: none;
    font-weight: 700;
    font-size: .88rem;
    transition: transform .2s ease, background .2s ease;
    white-space: nowrap;
  }

  .lg-home:hover {
    transform: translateY(-2px);
    background: rgba(255,255,255,.14);
  }

  .lg-hero-body { margin-top: 48px; }

  .lg-hero-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, .72fr);
    gap: 26px;
    align-items: center;
  }

  .lg-hero-copy {
    min-width: 0;
  }

  .lg-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    font-size: .74rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .lg-kicker-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ffffff, #e82127);
  }

  .lg-title {
    margin: 20px 0 16px;
    font: 700 clamp(2.8rem, 5.5vw, 4.6rem)/.95 "Fraunces", serif;
    letter-spacing: -.05em;
  }

  .lg-copy {
    max-width: 560px;
    font-size: .96rem;
    line-height: 1.84;
    color: rgba(255,255,255,.82);
  }

  .lg-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }

  .lg-chip {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    font-weight: 700;
    font-size: .88rem;
  }

  .lg-scan-scene {
    position: relative;
    min-height: 450px;
    display: grid;
    place-items: center;
  }

  .lg-scan-orbit {
    position: absolute;
    inset: 34px 8px auto auto;
    width: 180px;
    height: 180px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.1);
    background:
      radial-gradient(circle at center, rgba(232,33,39,.12), transparent 56%),
      rgba(255,255,255,.04);
    filter: blur(.1px);
  }

  .lg-phone {
    position: relative;
    z-index: 2;
    width: min(245px, 100%);
    padding: 10px;
    border-radius: 34px;
    background: #070708;
    border: 1px solid rgba(255,255,255,.16);
    box-shadow: 0 34px 78px rgba(0,0,0,.34);
    transform: rotate(2deg);
    animation: lg-phone-float 5.6s ease-in-out infinite;
  }

  .lg-phone::before {
    content: "";
    position: absolute;
    top: 9px;
    left: 50%;
    z-index: 4;
    width: 78px;
    height: 19px;
    border-radius: 0 0 14px 14px;
    background: #070708;
    transform: translateX(-50%);
  }

  .lg-phone-screen {
    position: relative;
    min-height: 456px;
    overflow: hidden;
    border-radius: 26px;
    background:
      linear-gradient(160deg, rgba(232,33,39,.12), transparent 32%),
      linear-gradient(180deg, #fafafa 0%, #f1f1ef 100%);
    color: #111;
  }

  .lg-phone-header {
    padding: 34px 18px 16px;
    background: #111;
    color: #fff;
  }

  .lg-phone-eyebrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: rgba(255,255,255,.62);
    font-size: .62rem;
    font-weight: 900;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .lg-phone-live {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #e82127;
    box-shadow: 0 0 0 5px rgba(232,33,39,.18);
  }

  .lg-phone-title {
    margin-top: 18px;
    font-size: 1.64rem;
    font-weight: 900;
    letter-spacing: -.06em;
    line-height: 1;
  }

  .lg-scan-window {
    position: relative;
    display: grid;
    place-items: center;
    margin: 14px;
    min-height: 188px;
    border-radius: 22px;
    background: #fff;
    border: 1px solid rgba(17,17,17,.08);
    box-shadow: 0 18px 34px rgba(17,17,17,.08);
    overflow: hidden;
  }

  .lg-scan-window::before,
  .lg-scan-window::after {
    content: "";
    position: absolute;
    inset: 20px;
    border: 2px solid #111;
    border-radius: 18px;
    pointer-events: none;
  }

  .lg-scan-window::after {
    inset: auto 26px 50%;
    height: 2px;
    border: 0;
    border-radius: 999px;
    background: #e82127;
    box-shadow: 0 0 18px rgba(232,33,39,.62);
    animation: lg-scan-line 2.2s ease-in-out infinite;
  }

  .lg-qr {
    width: 112px;
    height: 112px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 5px;
    padding: 10px;
    border-radius: 14px;
    background: #f5f5f4;
  }

  .lg-qr span {
    border-radius: 4px;
    background: #111;
  }

  .lg-phone-status-card {
    margin: 0 14px 12px;
    padding: 14px;
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(17,17,17,.08);
  }

  .lg-phone-status-card strong {
    display: block;
    font-size: .76rem;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .lg-phone-status-card p {
    margin-top: 7px;
    color: #666;
    font-size: .74rem;
    line-height: 1.55;
  }

  .lg-scan-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 14px 14px;
    padding: 9px 12px;
    border-radius: 999px;
    background: #111;
    color: #fff;
    font-size: .72rem;
    font-weight: 900;
  }

  .lg-scan-pill::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #e82127;
    box-shadow: 0 0 0 5px rgba(232,33,39,.14);
  }

  .lg-scan-card {
    position: absolute;
    z-index: 3;
    left: 0;
    bottom: 38px;
    width: 190px;
    padding: 14px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(17,17,17,.78);
    color: #fff;
    box-shadow: 0 24px 58px rgba(0,0,0,.28);
    backdrop-filter: blur(18px);
  }

  .lg-scan-card strong {
    display: block;
    font-size: .82rem;
  }

  .lg-scan-card span {
    display: block;
    margin-top: 6px;
    color: rgba(255,255,255,.68);
    font-size: .72rem;
    line-height: 1.45;
  }

  @keyframes lg-phone-float {
    0%, 100% { transform: translateY(0) rotate(2deg); }
    50% { transform: translateY(-12px) rotate(-1deg); }
  }

  @keyframes lg-scan-line {
    0%, 100% { transform: translateY(-54px); opacity: .36; }
    50% { transform: translateY(54px); opacity: 1; }
  }

  .lg-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 24px;
  }

  .lg-stat {
    padding: 14px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(16px);
  }

  .lg-stat strong {
    display: block;
    font: 700 1.8rem "Fraunces", serif;
  }

  .lg-stat span {
    display: block;
    margin-top: 5px;
    font-size: .82rem;
    color: rgba(255,255,255,.72);
    line-height: 1.5;
  }

  .lg-feature-list {
    display: grid;
    gap: 12px;
    margin-top: 26px;
  }

  .lg-feature {
    padding: 16px 18px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(16px);
  }

  .lg-feature-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lg-feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,.14);
    color: #fff;
    flex-shrink: 0;
  }

  .lg-feature h3 {
    margin: 0;
    font-size: .98rem;
    font-weight: 800;
  }

  .lg-feature p {
    margin: 8px 0 0;
    color: rgba(255,255,255,.72);
    line-height: 1.7;
    font-size: .9rem;
  }

  .lg-panel {
    padding: 28px;
    border-radius: 32px;
    border: 1px solid rgba(255,255,255,.76);
    background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(247,251,255,.94));
    box-shadow: 0 30px 70px rgba(8,20,35,.12);
    color: var(--ink);
  }

  .lg-panel-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lg-panel-brand .lg-mark {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #edf5fc, #ffffff);
    box-shadow: none;
  }

  .lg-panel-brand span { color: var(--muted); }

  .lg-panel-head { margin-top: 24px; }

  .lg-panel-head h2 {
    margin: 0;
    font: 700 clamp(2rem, 3.8vw, 2.7rem)/1.02 "Fraunces", serif;
    letter-spacing: -.04em;
  }

  .lg-panel-head p {
    margin: 10px 0 0;
    color: var(--muted);
    line-height: 1.76;
    font-size: .92rem;
  }

  .lg-stack {
    display: grid;
    gap: 16px;
    margin-top: 22px;
  }

  .lg-notice,
  .lg-helper {
    padding: 13px 15px;
    border-radius: 16px;
    font-size: .9rem;
    line-height: 1.72;
  }

  .lg-notice {
    background: rgba(245,245,244,.92);
    color: #333333;
    border: 1px solid rgba(17,17,17,.1);
  }

  .lg-helper {
    background: rgba(255,248,236,.86);
    color: #7a5937;
    border: 1px solid rgba(214,176,115,.18);
  }

  .lg-form { display: grid; gap: 14px; }
  .lg-field { display: grid; gap: 7px; }

  .lg-label {
    font-size: .74rem;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #66788e;
  }

  .lg-control { position: relative; }

  .lg-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #6f7e8f;
  }

  .lg-action {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .lg-input,
  .lg-select {
    width: 100%;
    min-height: 54px;
    border-radius: 18px;
    border: 1px solid rgba(17,17,17,.14);
    background: #ffffff;
    color: var(--ink);
    padding: 0 16px 0 46px;
    font: inherit;
    font-size: .94rem;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }

  .lg-input:focus,
  .lg-select:focus {
    border-color: #111111;
    box-shadow: 0 0 0 4px rgba(232,33,39,.12);
    background: #ffffff;
  }

  .lg-select {
    appearance: none;
    padding-right: 16px;
  }

  .lg-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #6f7e8f;
    cursor: pointer;
    transition: background .2s ease, color .2s ease;
  }

  .lg-toggle:hover {
    background: #edf3f8;
    color: var(--blue);
  }

  .lg-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .lg-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: .9rem;
    color: var(--muted);
  }

  .lg-checkbox input {
    width: 16px;
    height: 16px;
    accent-color: var(--blue);
  }

  .lg-link {
    border: 0;
    background: none;
    padding: 0;
    color: var(--blue);
    font: inherit;
    font-size: .9rem;
    font-weight: 800;
    cursor: pointer;
  }

  .lg-link:hover { text-decoration: underline; }

  .lg-submit,
  .lg-google,
  .lg-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 54px;
    padding: 0 20px;
    border: 0;
    border-radius: 18px;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease;
  }

  .lg-submit {
    background: linear-gradient(135deg, var(--navy), var(--blue-strong));
    color: #ffffff;
    box-shadow: 0 18px 34px rgba(27,63,107,.18);
  }

  .lg-google {
    margin-top: 10px;
    background: #ffffff;
    color: #111111;
    border: 1px solid rgba(17,17,17,.14);
    box-shadow: 0 14px 34px rgba(17,17,17,.08);
  }

  .lg-google-mark {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    display: inline-grid;
    place-items: center;
    background:
      conic-gradient(from -45deg, #4285f4 0 25%, #34a853 0 50%, #fbbc05 0 75%, #ea4335 0);
    color: #ffffff;
    font-size: 12px;
    font-weight: 900;
    line-height: 1;
  }

  .lg-secondary {
    background: #eef3f8;
    color: var(--ink);
  }

  .lg-submit:hover,
  .lg-google:hover,
  .lg-secondary:hover { transform: translateY(-2px); }

  .lg-submit:disabled,
  .lg-google:disabled,
  .lg-secondary:disabled,
  .lg-link:disabled {
    cursor: not-allowed;
    opacity: .7;
    transform: none;
  }

  .lg-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .lg-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #415160;
    font-size: .84rem;
    font-weight: 700;
  }

  .lg-active-card {
    padding: 20px;
    border-radius: 22px;
    background: #f7fafc;
    border: 1px solid rgba(20,33,50,.08);
  }

  .lg-active-card strong {
    display: block;
    font-size: 1.05rem;
  }

  .lg-active-card span {
    display: block;
    margin-top: 5px;
    color: var(--muted);
    line-height: 1.7;
    font-size: .9rem;
  }

  .lg-divider {
    height: 1px;
    background: linear-gradient(90deg, rgba(20,33,50,0), rgba(20,33,50,.12), rgba(20,33,50,0));
    margin: 4px 0;
  }

  .lg-foot {
    margin-top: 16px;
    font-size: .88rem;
    line-height: 1.7;
    color: var(--muted);
  }

  .lg-foot strong { color: var(--ink); }

  @media (max-width: 980px) {
    .lg-shell {
      grid-template-columns: 1fr;
      padding: 20px 0 34px;
    }
    .lg-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .lg-hero-body { margin-top: 34px; }
    .lg-hero-main { grid-template-columns: 1fr; }
    .lg-scan-scene { min-height: 420px; }
  }

  @media (max-width: 600px) {
    .lg-shell { width: min(100%, calc(100% - 20px)); }
    .lg-hero,
    .lg-panel { padding: 22px; }
    .lg-title { font-size: clamp(2.2rem, 10vw, 3.5rem); }
    .lg-grid { grid-template-columns: 1fr; }
    .lg-scan-card { left: 12px; right: 12px; bottom: 18px; width: auto; }
    .lg-phone { width: min(224px, 100%); }
  }

  /* Compact final layout: tighter, cleaner, and less visually crowded. */
  .lg-shell {
    width: min(1120px, calc(100% - 28px));
    min-height: auto;
    align-items: center;
    gap: 22px;
    padding: 22px 0;
  }

  .lg-hero,
  .lg-panel {
    border-radius: 28px;
  }

  .lg-hero {
    padding: 24px;
    background:
      linear-gradient(135deg, rgba(232,33,39,.12), transparent 34%),
      linear-gradient(180deg, #09090b 0%, #18181b 100%);
    box-shadow: 0 28px 62px rgba(17,17,17,.18);
  }

  .lg-hero::before {
    width: 220px;
    height: 220px;
    opacity: .62;
  }

  .lg-nav {
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  .lg-home {
    padding: 9px 12px;
    font-size: .82rem;
  }

  .lg-hero-body {
    margin-top: 22px;
  }

  .lg-hero-main {
    grid-template-columns: minmax(0, .94fr) minmax(210px, .66fr);
    gap: 18px;
  }

  .lg-kicker {
    padding: 8px 11px;
    font-size: .66rem;
  }

  .lg-kicker-dot {
    background: #e82127;
    box-shadow: 0 0 0 5px rgba(232,33,39,.12);
  }

  .lg-title {
    max-width: 520px;
    margin: 14px 0 12px;
    font-size: clamp(2.2rem, 4.6vw, 3.45rem);
    line-height: .96;
  }

  .lg-copy {
    max-width: 500px;
    font-size: .9rem;
    line-height: 1.65;
  }

  .lg-chip-row {
    gap: 8px;
    margin-top: 16px;
  }

  .lg-chip {
    padding: 8px 11px;
    font-size: .78rem;
    background: rgba(255,255,255,.09);
  }

  .lg-scan-scene {
    min-height: 330px;
  }

  .lg-scan-orbit {
    width: 140px;
    height: 140px;
    right: 0;
  }

  .lg-phone {
    width: min(198px, 100%);
    border-radius: 30px;
    box-shadow: 0 26px 56px rgba(0,0,0,.32);
  }

  .lg-phone::before {
    width: 64px;
    height: 16px;
  }

  .lg-phone-screen {
    min-height: 336px;
    border-radius: 22px;
  }

  .lg-phone-header {
    padding: 28px 14px 12px;
  }

  .lg-phone-eyebrow {
    font-size: .54rem;
  }

  .lg-phone-title {
    margin-top: 13px;
    font-size: 1.26rem;
  }

  .lg-scan-window {
    min-height: 132px;
    margin: 10px;
    border-radius: 18px;
  }

  .lg-scan-window::before {
    inset: 15px;
    border-radius: 14px;
  }

  .lg-scan-window::after {
    left: 22px;
    right: 22px;
  }

  .lg-qr {
    width: 82px;
    height: 82px;
    gap: 4px;
    padding: 8px;
  }

  .lg-qr span {
    border-radius: 3px;
  }

  .lg-phone-status-card {
    margin: 0 10px 9px;
    padding: 11px;
    border-radius: 15px;
  }

  .lg-phone-status-card strong {
    font-size: .64rem;
  }

  .lg-phone-status-card p {
    margin-top: 5px;
    font-size: .66rem;
    line-height: 1.42;
  }

  .lg-scan-pill {
    margin: 0 10px 10px;
    padding: 8px 10px;
    font-size: .64rem;
  }

  .lg-scan-card {
    left: auto;
    right: 0;
    bottom: 8px;
    width: 170px;
    padding: 12px;
    border-radius: 17px;
  }

  .lg-scan-card strong {
    font-size: .76rem;
  }

  .lg-scan-card span {
    font-size: .66rem;
  }

  .lg-grid {
    gap: 8px;
    margin-top: 16px;
  }

  .lg-stat {
    padding: 11px 12px;
    border-radius: 16px;
  }

  .lg-stat strong {
    font-size: 1.38rem;
  }

  .lg-stat span {
    font-size: .7rem;
    line-height: 1.35;
  }

  .lg-feature-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .lg-feature {
    padding: 11px;
    border-radius: 16px;
  }

  .lg-feature-head {
    gap: 8px;
  }

  .lg-feature-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }

  .lg-feature h3 {
    font-size: .78rem;
  }

  .lg-feature p {
    display: none;
  }

  .lg-panel {
    padding: 22px;
    background: rgba(255,255,255,.94);
    border-color: #dededb;
    box-shadow: 0 24px 54px rgba(17,17,17,.1);
  }

  .lg-panel-brand {
    padding-bottom: 14px;
    border-bottom: 1px solid #ececea;
  }

  .lg-panel-head {
    margin-top: 16px;
  }

  .lg-panel-head h2 {
    font-size: clamp(1.8rem, 3.2vw, 2.35rem);
  }

  .lg-panel-head p {
    margin-top: 7px;
    font-size: .86rem;
    line-height: 1.58;
  }

  .lg-stack {
    gap: 12px;
    margin-top: 16px;
  }

  .lg-notice,
  .lg-helper,
  .lg-active-card {
    border-color: #dededb !important;
    background: #f5f5f4 !important;
    color: #111111 !important;
  }

  .lg-form {
    gap: 12px;
  }

  .lg-field {
    gap: 7px;
  }

  .lg-input,
  .lg-select {
    min-height: 46px;
  }

  .lg-actions {
    gap: 10px;
    margin-top: 4px;
  }

  .lg-submit {
    min-height: 48px;
  }

  .lg-foot {
    margin-top: 12px;
    font-size: .8rem;
  }

  @media (max-width: 980px) {
    .lg-shell {
      width: min(100%, calc(100% - 24px));
      padding: 18px 0 28px;
    }
    .lg-hero-main {
      grid-template-columns: minmax(0, 1fr) minmax(190px, 230px);
    }
    .lg-feature-list {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .lg-hero-main {
      grid-template-columns: 1fr;
    }
    .lg-scan-scene {
      min-height: 300px;
    }
    .lg-phone {
      width: min(190px, 100%);
    }
    .lg-scan-card {
      left: 12px;
      right: 12px;
      width: auto;
    }
  }

  @media (max-width: 600px) {
    .lg-shell {
      width: min(100%, calc(100% - 16px));
      padding-top: 12px;
    }
    .lg-hero,
    .lg-panel {
      padding: 18px;
      border-radius: 22px;
    }
    .lg-title {
      font-size: clamp(2rem, 10vw, 2.9rem);
    }
    .lg-grid {
      grid-template-columns: 1fr;
    }
    .lg-feature-list {
      display: none;
    }
  }

  /* Fix global skin collisions on the dark login hero. */
  .lg-root .lg-hero .lg-nav {
    background: rgba(255,255,255,.055) !important;
    border: 1px solid rgba(255,255,255,.1) !important;
    border-radius: 18px !important;
    box-shadow: none !important;
    backdrop-filter: blur(14px) !important;
    padding: 10px 12px !important;
  }

  .lg-root .lg-hero .qh-brand-logo strong {
    color: #ffffff !important;
  }

  .lg-root .lg-hero .qh-brand-logo span,
  .lg-root .lg-hero .qh-brand-logo > span > span {
    color: rgba(255,255,255,.64) !important;
  }

  .lg-root .lg-hero .lg-home {
    background: rgba(255,255,255,.08) !important;
    border: 1px solid rgba(255,255,255,.14) !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }

  .lg-root .lg-hero .lg-home:hover {
    background: rgba(255,255,255,.14) !important;
    color: #ffffff !important;
  }

  .lg-root .lg-hero .lg-kicker {
    background: rgba(255,255,255,.09) !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }

  .lg-root .lg-hero .lg-kicker-dot {
    background: #e82127 !important;
  }

  .lg-root .lg-hero .lg-chip {
    background: rgba(255,255,255,.09) !important;
    border: 1px solid rgba(255,255,255,.1) !important;
    color: #ffffff !important;
  }

  @media (max-width: 600px) {
    .lg-root .lg-hero .lg-nav {
      align-items: flex-start;
      flex-direction: column;
    }
  }
`

function persistRememberedAccess(rememberAccess, email, schoolId) {
  if (schoolId) {
    window.sessionStorage.setItem(ACTIVE_SCHOOL_KEY, schoolId)
  } else {
    window.sessionStorage.removeItem(ACTIVE_SCHOOL_KEY)
  }

  if (!rememberAccess) {
    window.localStorage.removeItem(LAST_EMAIL_KEY)
    window.localStorage.removeItem(LAST_SCHOOL_KEY)
    return
  }

  window.localStorage.setItem(LAST_EMAIL_KEY, email)

  if (schoolId) {
    window.localStorage.setItem(LAST_SCHOOL_KEY, schoolId)
  } else {
    window.localStorage.removeItem(LAST_SCHOOL_KEY)
  }
}

function normalizeRememberedSchool(value) {
  if (value === undefined || value === null) return ''

  const normalized = String(value).trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return ''
  }

  return normalized
}

function LoginScreen() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [schools, setSchools] = useState([])
  const [rememberAccess, setRememberAccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [continuing, setContinuing] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [schoolLoadError, setSchoolLoadError] = useState(false)

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(LAST_EMAIL_KEY)
    const savedSchool = normalizeRememberedSchool(
      window.sessionStorage.getItem(ACTIVE_SCHOOL_KEY) || window.localStorage.getItem(LAST_SCHOOL_KEY)
    )

    if (savedEmail) {
      setEmail(savedEmail)
      setRememberAccess(true)
    }

    if (savedSchool) {
      setSchoolId(savedSchool)
      setRememberAccess(true)
    }

    let active = true

    async function loadSchools() {
      try {
        const availableSchools = await fetchAvailableSchools()

        if (!active) return

        setSchools(availableSchools)

        if (savedSchool && availableSchools.some((school) => school.id === savedSchool)) {
          setSchoolId(savedSchool)
        } else if (availableSchools.length === 1) {
          setSchoolId(availableSchools[0].id)
        } else {
          setSchoolId('')
        }
      } catch (error) {
        console.error('Error loading schools:', error)

        if (!active) return

        setSchoolLoadError(true)
      } finally {
        if (active) {
          setLoadingSchools(false)
        }
      }
    }

    void loadSchools()

    return () => {
      active = false
    }
  }, [])

  const selectedSchool = schools.find((school) => school.id === schoolId) ?? null
  const activeSchool = schools.find((school) => school.id === profile?.school_id) ?? null
  const requiresSchool = !loadingSchools && schools.length > 0 && !selectedSchool

  async function openDashboard(currentProfile) {
    const nextPath = await resolveDashboardPath(currentProfile)
    navigate(nextPath, { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting || resetting) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      toast.error('Completa correo y contrasena.')
      return
    }

    if (loadingSchools) {
      toast.error('Espera un momento mientras cargamos los centros.')
      return
    }

    if (requiresSchool) {
      toast.error('Selecciona el centro educativo de tu acceso.')
      return
    }

    setSubmitting(true)

    try {
      const { profile: nextProfile } = await signInWithProfile({
        email: normalizedEmail,
        password,
        schoolId,
      })

      persistRememberedAccess(rememberAccess, normalizedEmail, schoolId)

      toast.success(`Bienvenido${nextProfile?.full_name ? `, ${nextProfile.full_name.split(' ')[0]}` : ''}.`)
      await openDashboard(nextProfile)
    } catch (error) {
      toast.error(error.message || 'No se pudo iniciar sesion.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    if (submitting || googleSubmitting || resetting) return

    if (loadingSchools) {
      toast.error('Espera un momento mientras cargamos los centros.')
      return
    }

    if (requiresSchool) {
      toast.error('Selecciona el centro educativo antes de entrar con Google.')
      return
    }

    setGoogleSubmitting(true)

    try {
      persistRememberedAccess(rememberAccess, email.trim().toLowerCase(), schoolId)
      await signInWithGoogle()
    } catch (error) {
      toast.error(error.message || 'No se pudo iniciar sesion con Google.')
      setGoogleSubmitting(false)
    }
  }

  async function handleResetPassword() {
    if (resetting) return

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      toast.error('Escribe primero tu correo.')
      return
    }

    setResetting(true)

    try {
      await sendPasswordReset(normalizedEmail)
      toast.success(`Enlace enviado a ${normalizedEmail}.`)
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar el enlace.')
    } finally {
      setResetting(false)
    }
  }

  async function handleContinueSession() {
    if (!profile) {
      toast.error('Tu sesion no tiene un perfil listo todavia.')
      return
    }

    setContinuing(true)

    try {
      await openDashboard(profile)
    } catch (error) {
      toast.error(error.message || 'No se pudo abrir tu panel.')
    } finally {
      setContinuing(false)
    }
  }

  async function handleUseAnotherAccount() {
    if (continuing) return

    setContinuing(true)

    try {
      await signOut()
      setPassword('')
      toast.success('Sesion cerrada. Ya puedes entrar con otra cuenta.')
    } catch (error) {
      toast.error(error.message || 'No se pudo cerrar la sesion.')
    } finally {
      setContinuing(false)
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <div className="lg-root">
        <div className="lg-shell">
          <section className="lg-hero">
            <div className="lg-nav">
              <div className="lg-brand">
                <BrandLogo
                  size={42}
                  titleColor="#ffffff"
                  subtitleColor="rgba(255,255,255,.68)"
                  subtitle="Acceso institucional para asistencia escolar."
                />
              </div>

              <Link className="lg-home" to="/">
                <IconHome />
                Volver
              </Link>
            </div>

            <div className="lg-hero-body">
              <div className="lg-hero-main">
                <div className="lg-hero-copy">
                  <div className="lg-kicker">
                    <span className="lg-kicker-dot" />
                    Acceso profesional
                  </div>

                  <h1 className="lg-title">Entra con la misma precision con la que registras asistencia.</h1>

                  <p className="lg-copy">
                    El acceso ahora se presenta como una experiencia de control: eliges el centro,
                    validas tu perfil y entras al panel correcto con una lectura visual mas clara.
                  </p>

                  <div className="lg-chip-row">
                    <span className="lg-chip">
                      <IconCheck />
                      Flujo claro
                    </span>
                    <span className="lg-chip">
                      <IconSpark />
                      Escaneo QR
                    </span>
                    <span className="lg-chip">
                      <IconSchool />
                      Centro validado
                    </span>
                  </div>
                </div>

                <div className="lg-scan-scene" aria-hidden="true">
                  <div className="lg-scan-orbit" />
                  <div className="lg-phone">
                    <div className="lg-phone-screen">
                      <div className="lg-phone-header">
                        <div className="lg-phone-eyebrow">
                          <span>Scanner activo</span>
                          <span className="lg-phone-live" />
                        </div>
                        <div className="lg-phone-title">Validando QR</div>
                      </div>

                      <div className="lg-scan-window">
                        <div className="lg-qr">
                          {Array.from({ length: 25 }).map((_, index) => (
                            <span
                              key={index}
                              style={{ opacity: [1, 2, 5, 6, 8, 10, 12, 13, 16, 18, 19, 20, 22, 24].includes(index) ? 1 : 0.18 }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="lg-phone-status-card">
                        <strong>Centro identificado</strong>
                        <p>El sistema valida escuela, rol y sesion antes de abrir el panel correspondiente.</p>
                      </div>

                      <div className="lg-scan-pill">Acceso protegido</div>
                    </div>
                  </div>

                  <div className="lg-scan-card">
                    <strong>Lectura segura</strong>
                    <span>El mismo lenguaje de escaneo del sistema aparece desde el primer acceso.</span>
                  </div>
                </div>
              </div>

              <div className="lg-grid">
                <div className="lg-stat">
                  <strong>{loadingSchools ? '--' : String(schools.length)}</strong>
                  <span>centro{schools.length === 1 ? '' : 's'} activo{schools.length === 1 ? '' : 's'}</span>
                </div>

                <div className="lg-stat">
                  <strong>1</strong>
                  <span>accion principal en pantalla</span>
                </div>

                <div className="lg-stat">
                  <strong>0</strong>
                  <span>registro publico</span>
                </div>
              </div>

              <div className="lg-feature-list">
                {FEATURES.map(({ title, copy, Icon }) => (
                  <article key={title} className="lg-feature">
                    <div className="lg-feature-head">
                      <div className="lg-feature-icon">
                        <Icon />
                      </div>
                      <h3>{title}</h3>
                    </div>
                    <p>{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="lg-panel">
            <div className="lg-panel-brand">
              <BrandLogo size={38} titleColor="#111111" subtitleColor="#666666" />

              <div>
                <strong>Ingreso al sistema</strong>
                <span>Mas solido por fuera, igual de estable por dentro.</span>
              </div>
            </div>

            <div className="lg-panel-head">
              <h2>{user ? 'Sesion detectada' : 'Inicia sesion'}</h2>
              <p>
                {user
                  ? 'Ya hay una cuenta activa en este navegador. Puedes continuar o cambiar de usuario sin salir de esta pantalla.'
                  : 'Usa tu correo institucional y la contrasena de tu cuenta. Si tu centro aparece, dejalo seleccionado para validar mejor el acceso.'}
              </p>
            </div>

            {user ? (
              <div className="lg-stack">
                <div className="lg-notice">
                  La sesion ya esta abierta. Dejamos solo las acciones utiles: continuar o usar
                  otra cuenta.
                </div>

                <div className="lg-active-card">
                  <strong>{profile?.full_name || user.email || 'Cuenta activa'}</strong>
                  <span>{user.email}</span>
                  <span>
                    {activeSchool?.nombre || 'Centro asignado'} &mdash; {ROLE_LABELS[profile?.role] || profile?.role || 'Perfil'}
                  </span>
                </div>

                <div className="lg-meta">
                  <span className="lg-pill">
                    <IconCheck />
                    {profile?.approval_status === 'approved' ? 'Acceso aprobado' : 'Sesion activa'}
                  </span>

                  {profile?.school_id && activeSchool?.nombre ? (
                    <span className="lg-pill">
                      <IconSchool />
                      {activeSchool.nombre}
                    </span>
                  ) : null}
                </div>

                <button
                  className="lg-submit"
                  disabled={continuing || !profile}
                  onClick={handleContinueSession}
                  type="button"
                >
                  <IconArrow />
                  {continuing ? 'Abriendo panel...' : 'Abrir mi panel'}
                </button>

                <button
                  className="lg-secondary"
                  disabled={continuing}
                  onClick={handleUseAnotherAccount}
                  type="button"
                >
                  Usar otra cuenta
                </button>
              </div>
            ) : (
              <div className="lg-stack">
                <div className="lg-notice">
                  El formulario se queda con lo esencial: centro, correo, contrasena y recuperacion.
                </div>

                {schoolLoadError ? (
                  <div className="lg-helper">
                    No pudimos cargar la lista de centros. Puedes intentar iniciar sesion igual y el
                    sistema validara tu perfil cuando entre.
                  </div>
                ) : null}

                {!schoolLoadError && !loadingSchools && schools.length === 0 ? (
                  <div className="lg-helper">
                    Aun no hay centros visibles en esta lista. Si tu cuenta ya existe, igual puedes
                    entrar con correo y contrasena.
                  </div>
                ) : null}

                <form className="lg-form" onSubmit={handleSubmit}>
                  {(loadingSchools || schools.length > 0) && (
                    <Field icon={<IconSchool />} label="Centro educativo">
                      <select
                        className="lg-select"
                        disabled={loadingSchools}
                        onChange={(event) => setSchoolId(event.target.value)}
                        value={schoolId}
                      >
                        <option value="">
                          {loadingSchools
                            ? 'Cargando centros...'
                            : schools.length
                              ? 'Selecciona un centro'
                              : 'Sin centros visibles'}
                        </option>

                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.nombre}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  <Field icon={<IconMail />} label="Correo">
                    <input
                      autoComplete="username"
                      className="lg-input"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="correo@ejemplo.com"
                      type="email"
                      value={email}
                    />
                  </Field>

                  <Field
                    action={
                      <button
                        className="lg-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        type="button"
                      >
                        <IconEye open={showPassword} />
                      </button>
                    }
                    icon={<IconLock />}
                    label="Contrasena"
                  >
                    <input
                      autoComplete="current-password"
                      className="lg-input"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Tu contrasena"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                    />
                  </Field>

                  <div className="lg-row">
                    <label className="lg-checkbox">
                      <input
                        checked={rememberAccess}
                        onChange={(event) => setRememberAccess(event.target.checked)}
                        type="checkbox"
                      />
                      Recordar correo y centro en este equipo
                    </label>

                    <button
                      className="lg-link"
                      disabled={resetting}
                      onClick={handleResetPassword}
                      type="button"
                    >
                      {resetting ? 'Enviando...' : 'Olvide mi contrasena'}
                    </button>
                  </div>

                  {selectedSchool ? (
                    <div className="lg-meta">
                      <span className="lg-pill">
                        <IconSchool />
                        {selectedSchool.nombre}
                      </span>
                    </div>
                  ) : null}

                  <button className="lg-submit" disabled={submitting || resetting} type="submit">
                    <IconArrow />
                    {submitting ? 'Entrando...' : 'Iniciar sesion'}
                  </button>

                  <button
                    className="lg-google"
                    disabled={submitting || googleSubmitting || resetting}
                    onClick={handleGoogleSignIn}
                    type="button"
                  >
                    <span className="lg-google-mark">G</span>
                    {googleSubmitting ? 'Abriendo Google...' : 'Continuar con Google'}
                  </button>
                </form>

                <div className="lg-divider" />

                <p className="lg-foot">
                  <strong>Sin registro publico desde este login.</strong> Las cuentas deben quedar
                  creadas desde la administracion del centro para evitar perfiles a medias, roles
                  incorrectos y usuarios sin aprobacion.
                </p>

                <p className="lg-foot">
                  Si necesitas abrir un centro nuevo como director, usa la solicitud especial.
                  {' '}
                  <Link to="/director/register"><strong>Solicitar acceso directivo</strong></Link>
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}

function Field({ label, icon, action, children }) {
  return (
    <label className="lg-field">
      <span className="lg-label">{label}</span>
      <span className="lg-control">
        <span className="lg-icon">{icon}</span>
        {children}
        {action ? <span className="lg-action">{action}</span> : null}
      </span>
    </label>
  )
}

function IconMark() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <rect height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" width="6.5" x="2.5" y="2.5" />
      <rect height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" width="6.5" x="15" y="2.5" />
      <rect height="6.5" rx="1.2" stroke="currentColor" strokeWidth="2" width="6.5" x="2.5" y="15" />
      <path
        d="M14.5 15.5h2.6v2.6h-2.6zM18.3 15.5h2.2M14.5 19.3h6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconHome() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m3 10 9-7 9 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M5 9.5V21h14V9.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconMail() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <rect height="16" rx="2" stroke="currentColor" strokeWidth="2" width="20" x="2" y="4" />
      <path d="m22 7-10 6L2 7" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <rect height="10" rx="2" stroke="currentColor" strokeWidth="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconSchool() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="m12 3 9 4-9 4-9-4 9-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 10v6m14-6v6M7 13.5V18h10v-4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconSpark() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconEye({ open }) {
  if (open) {
    return (
      <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
        <path
          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M3 3 21 21" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="M10.6 10.6a3 3 0 1 0 4.2 4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M9.2 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a16.8 16.8 0 0 1-4 4.9M6 6.3A16.2 16.2 0 0 0 2 12s4 7 10 7a10.7 10.7 0 0 0 4.1-.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default LoginScreen
