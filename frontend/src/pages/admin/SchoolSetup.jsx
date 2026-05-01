import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../../components/ui/BrandLogo'

/* ══════════════════════════════════
   ESTILOS
   ══════════════════════════════════ */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ss-root {
    min-height: 100vh;
    background:
      linear-gradient(90deg, rgba(20, 49, 45, 0.035) 1px, transparent 1px),
      linear-gradient(180deg, rgba(20, 49, 45, 0.035) 1px, transparent 1px),
      #F4F7F2;
    background-size: 32px 32px;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 28px 24px 56px;
  }

  .ss-wrap {
    width: 100%;
    max-width: 1180px;
  }

  /* Header */
  .ss-header {
    text-align: left;
    margin-bottom: 1.25rem;
    background: #14312D;
    color: #F7FBF4;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 18px;
    box-shadow: 0 18px 46px rgba(20,49,45,0.18);
  }

  .ss-logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
  }

  .ss-logo-icon {
    width: 40px; height: 40px;
    background: #C9A24B;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .ss-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #F7FBF4;
  }

  .ss-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: #F7FBF4;
    margin-bottom: 6px;
  }

  .ss-subtitle {
    font-size: 14px;
    color: rgba(247,251,244,0.78);
    font-weight: 400;
    line-height: 1.55;
    max-width: 680px;
  }

  .ss-header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .ss-header-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    align-self: stretch;
  }

  .ss-metric {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 10px;
    padding: 14px;
    min-height: 88px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .ss-metric-label {
    font-size: 11px;
    font-weight: 800;
    color: rgba(247,251,244,0.62);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .ss-metric-value {
    font-size: 28px;
    font-weight: 800;
    color: #F7FBF4;
    line-height: 1;
  }

  /* Stepper */
  .ss-stepper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 1.25rem;
    gap: 8px;
    flex-wrap: wrap;
    background: rgba(255,255,255,0.74);
    border: 1px solid #D8E3D4;
    border-radius: 12px;
    padding: 8px;
  }

  .ss-step {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    position: relative;
    padding: 8px 12px;
    border-radius: 9px;
  }

  .ss-step.active {
    background: #14312D;
  }

  .ss-step-circle {
    width: 26px; height: 26px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800;
    transition: all 0.3s;
    border: 1px solid #C8D8C4;
    background: #fff;
    color: #587267;
    z-index: 1;
  }

  .ss-step.active .ss-step-circle {
    background: #C9A24B;
    border-color: #C9A24B;
    color: #14312D;
    box-shadow: none;
  }

  .ss-step.done .ss-step-circle {
    background: #DDE8D8;
    border-color: #DDE8D8;
    color: #14312D;
  }

  .ss-step-label {
    font-size: 12px;
    font-weight: 800;
    color: #587267;
    text-align: center;
    max-width: 80px;
  }

  .ss-step.active .ss-step-label { color: #F7FBF4; }
  .ss-step.done .ss-step-label { color: #14312D; }

  .ss-step-line {
    display: none;
  }

  /* Card */
  .ss-card {
    background: rgba(255,255,255,0.94);
    border-radius: 14px;
    padding: 1.75rem;
    box-shadow: 0 14px 34px rgba(20,49,45,0.08);
    border: 1px solid #D8E3D4;
    animation: ssFadeUp 0.4s ease-out both;
  }

  @keyframes ssFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ss-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: #14312D;
    margin-bottom: 4px;
  }

  .ss-card-sub {
    font-size: 13px;
    color: #587267;
    margin-bottom: 1.35rem;
    font-weight: 500;
  }

  .ss-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .ss-summary-card {
    background: #F7FAF5;
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .ss-summary-card.full {
    grid-column: 1 / -1;
  }

  .ss-summary-label {
    font-size: 11px;
    font-weight: 800;
    color: #6A7F72;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .ss-summary-value {
    font-size: 14px;
    font-weight: 600;
    color: #14312D;
    line-height: 1.5;
  }

  /* Fields */
  .ss-field { margin-bottom: 18px; }

  .ss-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #4A6A8A;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }

  .ss-input {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #102847;
    background: #FAFCF8;
    border: 1px solid #C8D8C4;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .ss-input::placeholder { color: #B8D4E8; }
  .ss-input:focus {
    border-color: #14312D;
    box-shadow: 0 0 0 3px rgba(20,49,45,0.1);
    background: #fff;
  }

  .ss-select {
    width: 100%;
    padding: 12px 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #102847;
    background: #FAFCF8;
    border: 1px solid #C8D8C4;
    border-radius: 8px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .ss-select:focus { border-color: #14312D; }

  .ss-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .ss-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 14px;
  }

  /* Tags */
  .ss-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .ss-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #EEF6FB;
    border: 1px solid #C8DFF0;
    border-radius: 100px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #1B3F6B;
  }

  .ss-tag-remove {
    background: none; border: none;
    cursor: pointer; color: #8BBAD8;
    padding: 0; display: flex;
    transition: color 0.2s;
    font-size: 14px; line-height: 1;
  }

  .ss-tag-remove:hover { color: #A32D2D; }

  /* Add row */
  .ss-add-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 10px;
  }

  .ss-add-row .ss-field { flex: 1; margin-bottom: 0; }

  .ss-btn-add {
    background: #F7FAF5;
    color: #14312D;
    border: 1px solid #C8D8C4;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
  }

  .ss-btn-add:hover { background: #EEF2EA; border-color: #14312D; }

  /* Schedule cards */
  .ss-schedule-card {
    background: #F7FAF5;
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .ss-schedule-title {
    font-size: 13px;
    font-weight: 700;
    color: #14312D;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ss-course-board {
    margin-top: 24px;
    display: grid;
    gap: 16px;
  }

  .ss-academic-stack {
    display: grid;
    gap: 16px;
  }

  .ss-academic-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .ss-academic-card {
    background: #F7FAF5;
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    padding: 18px;
    display: grid;
    gap: 12px;
  }

  .ss-academic-card-title {
    font-size: 15px;
    font-weight: 700;
    color: #14312D;
  }

  .ss-academic-card-sub {
    font-size: 12px;
    color: #587267;
    line-height: 1.5;
  }

  .ss-catalog-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ss-catalog-chip {
    border: 1px solid #C8D8C4;
    background: #fff;
    color: #14312D;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .ss-catalog-chip.active {
    background: #14312D;
    border-color: #14312D;
    color: #fff;
  }

  .ss-course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .ss-course-card {
    background: #fff;
    border: 1px solid #D8E3D4;
    border-radius: 10px;
    padding: 18px;
    box-shadow: 0 12px 28px rgba(20,49,45,0.08);
    display: grid;
    gap: 14px;
  }

  .ss-course-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .ss-course-title {
    font-size: 18px;
    font-weight: 700;
    color: #102847;
    font-family: 'Playfair Display', serif;
  }

  .ss-course-sub {
    font-size: 12px;
    color: #4A6A8A;
    margin-top: 4px;
    line-height: 1.5;
  }

  .ss-course-kpis {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .ss-course-kpi {
    border: 1px solid #D8EAF4;
    border-radius: 12px;
    background: #F5FAFD;
    padding: 12px;
  }

  .ss-course-kpi-value {
    font-size: 18px;
    font-weight: 700;
    color: #102847;
  }

  .ss-course-kpi-label {
    font-size: 11px;
    color: #4A6A8A;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ss-course-block {
    border-top: 1px solid #EEF6FB;
    padding-top: 14px;
    display: grid;
    gap: 10px;
  }

  .ss-course-block-title {
    font-size: 13px;
    font-weight: 700;
    color: #1B3F6B;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ss-mini-list {
    display: grid;
    gap: 8px;
  }

  .ss-mini-item {
    border: 1px solid #D8EAF4;
    background: #F8FBFE;
    border-radius: 12px;
    padding: 10px 12px;
  }

  .ss-mini-item-title {
    font-size: 13px;
    font-weight: 700;
    color: #102847;
  }

  .ss-mini-item-sub {
    font-size: 12px;
    color: #4A6A8A;
    margin-top: 4px;
    line-height: 1.45;
  }

  .ss-inline-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 0.8fr auto;
    gap: 10px;
    align-items: end;
  }

  .ss-inline-grid.students {
    grid-template-columns: 1.2fr 1fr auto;
  }

  .ss-note {
    padding: 12px 14px;
    border-radius: 12px;
    background: #F5FAFD;
    border: 1px solid #D8EAF4;
    font-size: 12px;
    color: #4A6A8A;
    line-height: 1.5;
  }

  /* Calendar */
  .ss-calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .ss-cal-nav {
    background: none; border: none;
    color: #1B3F6B; cursor: pointer;
    font-size: 18px; padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .ss-cal-nav:hover { background: #EEF6FB; }

  .ss-cal-month {
    font-size: 15px;
    font-weight: 700;
    color: #102847;
    font-family: 'Playfair Display', serif;
  }

  .ss-cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .ss-cal-day-name {
    font-size: 10px;
    font-weight: 700;
    color: #8BBAD8;
    text-align: center;
    padding: 4px 0;
    text-transform: uppercase;
  }

  .ss-cal-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: #102847;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1.5px solid transparent;
  }

  .ss-cal-day:hover { background: #EEF6FB; }
  .ss-cal-day.empty { cursor: default; }
  .ss-cal-day.feriado { background: #fee2e2; color: #A32D2D; border-color: #fca5a5; }
  .ss-cal-day.vacaciones { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
  .ss-cal-day.today { border-color: #1B3F6B; font-weight: 700; }

  .ss-cal-legend {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .ss-cal-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #4A6A8A;
  }

  .ss-cal-legend-dot {
    width: 12px; height: 12px;
    border-radius: 3px;
  }

  /* Day type selector */
  .ss-day-type-wrap {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(16,40,71,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }

  .ss-day-type-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    width: 280px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .ss-day-type-title {
    font-size: 15px;
    font-weight: 700;
    color: #102847;
    margin-bottom: 16px;
    font-family: 'Playfair Display', serif;
  }

  .ss-day-type-btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1.5px solid #C8DFF0;
    background: #F0F7FC;
    color: #102847;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    margin-bottom: 8px;
    transition: all 0.2s;
    text-align: left;
    display: flex; align-items: center; gap: 10px;
  }

  .ss-day-type-btn:hover { border-color: #1B3F6B; background: #EEF6FB; }
  .ss-day-type-btn.feriado { border-color: #fca5a5; background: #fee2e2; color: #A32D2D; }
  .ss-day-type-btn.vacaciones { border-color: #fcd34d; background: #fef3c7; color: #92400e; }
  .ss-day-type-btn.cancel { border-color: #C8DFF0; color: #4A6A8A; }

  /* Buttons */
  .ss-btn-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    gap: 12px;
  }

  .ss-btn-primary {
    background: #14312D;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 13px 32px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }

  .ss-btn-primary:hover:not(:disabled) { background: #21463F; transform: translateY(-1px); }
  .ss-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .ss-btn-primary.success { background: #1B5E3B; }

  .ss-btn-back {
    background: transparent;
    color: #587267;
    border: 1px solid #C8D8C4;
    border-radius: 8px;
    padding: 13px 24px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
  }

  .ss-btn-back:hover { border-color: #14312D; color: #14312D; }

  .ss-header .ss-btn-back {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.16);
    color: #F7FBF4;
  }

  .ss-header .ss-btn-back:hover {
    background: rgba(255,255,255,0.14);
    border-color: rgba(255,255,255,0.28);
    color: #fff;
  }

  .ss-btn-skip {
    background: none; border: none;
    color: #8BBAD8; font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; padding: 0;
    transition: color 0.2s;
    font-weight: 500;
  }

  .ss-btn-skip:hover { color: #1B3F6B; }

  @media (max-width: 980px) {
    .ss-header {
      grid-template-columns: 1fr;
    }

    .ss-header-metrics {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .ss-academic-grid,
    .ss-grid-2,
    .ss-grid-3 {
      grid-template-columns: 1fr;
    }

    .ss-inline-grid,
    .ss-inline-grid.students {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .ss-root {
      padding: 16px;
    }

    .ss-header {
      padding: 18px;
      border-radius: 12px;
    }

    .ss-title {
      font-size: 26px;
    }

    .ss-header-metrics {
      grid-template-columns: 1fr;
    }

    .ss-card {
      padding: 1.1rem;
      border-radius: 12px;
    }

    .ss-stepper {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ss-step {
      justify-content: flex-start;
    }

    .ss-btn-row {
      flex-direction: column;
      align-items: stretch;
    }

    .ss-btn-row > div {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  /* Spinner */
  @keyframes ssSpin { to { transform: rotate(360deg); } }
  .ss-spin { animation: ssSpin 0.9s linear infinite; display: inline-block; }

  /* Tesla local override: this page injects styles after globals. */
  .ss-root {
    background:
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,245,244,.98)),
      linear-gradient(rgba(17,17,17,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.03) 1px, transparent 1px),
      #f5f5f4;
    background-size: auto, 48px 48px, 48px 48px, auto;
    color: #111111;
    font-family: "Sora", sans-serif;
  }
  .ss-header,
  .ss-btn-primary,
  .ss-catalog-chip.active,
  .ss-step.active {
    background: #111111;
    border-color: #111111;
    color: #ffffff;
  }
  .ss-logo-icon,
  .ss-step.active .ss-step-circle,
  .ss-step.done .ss-step-circle {
    background: #111111;
    border-color: #111111;
    color: #ffffff;
    box-shadow: inset 0 -3px 0 #e82127;
  }
  .ss-logo-text,
  .ss-title,
  .ss-header .ss-btn-back,
  .ss-metric-value,
  .ss-step.active .ss-step-label {
    color: #ffffff;
  }
  .ss-logo-text,
  .ss-title,
  .ss-card-title,
  .ss-course-title,
  .ss-cal-month,
  .ss-day-type-title,
  .ss-summary-value,
  .ss-card h1,
  .ss-card h2,
  .ss-card h3 {
    font-family: "Sora", sans-serif;
  }
  .ss-subtitle,
  .ss-metric-label {
    color: rgba(255,255,255,.62);
  }
  .ss-card,
  .ss-stepper,
  .ss-summary-card,
  .ss-academic-card,
  .ss-course-card,
  .ss-schedule-card,
  .ss-mini-item,
  .ss-course-kpi,
  .ss-note,
  .ss-day-type-card {
    background: rgba(255,255,255,.94);
    border-color: #dededb;
    box-shadow: 0 18px 44px rgba(17,17,17,.08);
  }
  .ss-card-title,
  .ss-summary-value,
  .ss-course-title,
  .ss-course-kpi-value,
  .ss-mini-item-title,
  .ss-academic-card-title,
  .ss-schedule-title,
  .ss-course-block-title,
  .ss-cal-month,
  .ss-cal-day,
  .ss-day-type-title,
  .ss-catalog-chip,
  .ss-btn-add {
    color: #111111;
  }
  .ss-card-sub,
  .ss-summary-label,
  .ss-label,
  .ss-course-sub,
  .ss-course-kpi-label,
  .ss-mini-item-sub,
  .ss-academic-card-sub,
  .ss-note,
  .ss-cal-day-name,
  .ss-cal-legend-item,
  .ss-step-label {
    color: #666666;
  }
  .ss-input,
  .ss-select,
  .ss-day-type-btn {
    background: #ffffff;
    border-color: #c9c9c5;
    color: #111111;
  }
  .ss-input::placeholder {
    color: #b7b7b3;
  }
  .ss-input:focus,
  .ss-select:focus,
  .ss-day-type-btn:hover {
    border-color: #111111;
    box-shadow: 0 0 0 4px rgba(232,33,39,.1);
  }
  .ss-btn-back,
  .ss-btn-add,
  .ss-btn-skip {
    background: #ffffff;
    border-color: #c9c9c5;
    color: #111111;
  }
  .ss-header .ss-btn-back {
    background: rgba(255,255,255,.1);
    border-color: rgba(255,255,255,.16);
  }
  .ss-tag {
    background: #f5f5f4;
    border-color: #dededb;
    color: #111111;
  }
  .ss-tag-remove,
  .ss-btn-skip:hover,
  .ss-cal-nav {
    color: #e82127;
  }
  .ss-cal-day.today {
    border-color: #111111;
  }
  .ss-cal-day:hover,
  .ss-cal-nav:hover {
    background: #f5f5f4;
  }
  .ss-cal-day.feriado,
  .ss-day-type-btn.feriado {
    background: #fff1f1;
    border-color: #e82127;
    color: #e82127;
  }
  .ss-cal-day.vacaciones,
  .ss-day-type-btn.vacaciones {
    background: #f5f5f4;
    border-color: #dededb;
    color: #111111;
  }
  .ss-day-type-wrap {
    background: rgba(17,17,17,.58);
  }
`

/* ══════════════════════════════════
   HELPERS
   ══════════════════════════════════ */
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const GRADOS_DEFAULT = ['Inicial','1ro','2do','3ro','4to','5to','6to','7mo','8vo','Bachillerato 1ro','Bachillerato 2do','Bachillerato 3ro','Bachillerato 4to']
const SECCIONES_DEFAULT = ['A','B','C','D','E','F','G','H','I','J']
const CURSOS_DEFAULT = ['Inicial', 'Primaria', 'Secundaria', 'Bachillerato', 'Tecnico']
const TURNOS_DEFAULT = [
  { id: 'manana', label: 'Manana' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noche', label: 'Noche' },
]

function buildSectionKey(grado, seccion, turno) {
  return `${grado}::${seccion}::${turno}`
}

function isPersistedSectionId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))
}

function buildAcademicLabel(curso, grado) {
  const safeCurso = (curso || '').trim()
  const safeGrado = (grado || '').trim()
  if (safeCurso && safeGrado) return `${safeCurso} · ${safeGrado}`
  return safeGrado || safeCurso
}

function parseAcademicLabel(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return { curso: '', grado: '' }

  const [curso, grado] = normalized.split('·').map(part => part?.trim()).filter(Boolean)
  if (curso && grado) return { curso, grado }
  return { curso: '', grado: normalized }
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

/* ══════════════════════════════════
   STEP 1 — DATOS DE LA ESCUELA
   ══════════════════════════════════ */
function Step1({ data, onChange }) {
  return (
    <div key="step1" style={{animation:'ssFadeUp 0.4s ease-out both'}}>
      <div className="ss-card-title">Ajustes operativos del centro</div>
      <div className="ss-card-sub">La informacion institucional queda fija aqui como referencia. En esta vista solo ajustas el periodo academico y el perimetro de escaneo.</div>

      <div className="ss-summary-grid">
        <div className="ss-summary-card full">
          <div className="ss-summary-label">Nombre del centro</div>
          <div className="ss-summary-value">{data.nombre || 'Sin nombre registrado'}</div>
        </div>
        <div className="ss-summary-card">
          <div className="ss-summary-label">Telefono</div>
          <div className="ss-summary-value">{data.telefono || 'No registrado'}</div>
        </div>
        <div className="ss-summary-card">
          <div className="ss-summary-label">Correo institucional</div>
          <div className="ss-summary-value">{data.email || 'No registrado'}</div>
        </div>
        <div className="ss-summary-card full">
          <div className="ss-summary-label">Direccion</div>
          <div className="ss-summary-value">{data.direccion || 'No registrada'}</div>
        </div>
        <div className="ss-summary-card full">
          <div className="ss-summary-label">Director/a</div>
          <div className="ss-summary-value">{data.director || 'No registrado'}</div>
        </div>
      </div>

      <div className="ss-grid-2">
        <div className="ss-field">
          <label className="ss-label">Inicio del periodo academico *</label>
          <input
            className="ss-input"
            type="date"
            value={data.academic_period_start}
            onChange={e => onChange('academic_period_start', e.target.value)}
          />
        </div>
        <div className="ss-field">
          <label className="ss-label">Fin del periodo academico *</label>
          <input
            className="ss-input"
            type="date"
            value={data.academic_period_end}
            onChange={e => onChange('academic_period_end', e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          background: '#ffffff',
          border: '1px solid #dededb',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div className="ss-card-title" style={{ fontSize: 16, marginBottom: 4 }}>Perimetro de escaneo</div>
        <div className="ss-card-sub" style={{ marginBottom: 16 }}>
          Si completas estos campos, el sistema guardara la geolocalizacion del escaneo y marcara alertas fuera del radio permitido.
        </div>

        <div className="ss-grid-3">
          <div className="ss-field" style={{ marginBottom: 0 }}>
            <label className="ss-label">Latitud</label>
            <input
              className="ss-input"
              type="number"
              step="0.000001"
              placeholder="18.486058"
              value={data.latitude}
              onChange={e => onChange('latitude', e.target.value)}
            />
          </div>
          <div className="ss-field" style={{ marginBottom: 0 }}>
            <label className="ss-label">Longitud</label>
            <input
              className="ss-input"
              type="number"
              step="0.000001"
              placeholder="-69.931212"
              value={data.longitude}
              onChange={e => onChange('longitude', e.target.value)}
            />
          </div>
          <div className="ss-field" style={{ marginBottom: 0 }}>
            <label className="ss-label">Radio permitido (m)</label>
            <input
              className="ss-input"
              type="number"
              min="1"
              step="1"
              placeholder="150"
              value={data.allowed_radius_m}
              onChange={e => onChange('allowed_radius_m', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   STEP 2 — GRADOS Y SECCIONES
   ══════════════════════════════════ */
function Step2({ secciones, setSecciones }) {
  const [availableCourses, setAvailableCourses] = useState(CURSOS_DEFAULT)
  const [availableGrades, setAvailableGrades] = useState(GRADOS_DEFAULT)
  const [curso, setCurso] = useState('Primaria')
  const [newCourse, setNewCourse] = useState('')
  const [grado, setGrado] = useState('1ro')
  const [newGrade, setNewGrade] = useState('')
  const [turno, setTurno] = useState('manana')
  const [selectedSections, setSelectedSections] = useState(['A'])
  const [useSpecialSchedule, setUseSpecialSchedule] = useState(false)
  const [specialEntrada, setSpecialEntrada] = useState('')
  const [specialTardanza, setSpecialTardanza] = useState('')
  const [specialSalida, setSpecialSalida] = useState('')

  useEffect(() => {
    const courseSet = new Set(CURSOS_DEFAULT)
    const gradeSet = new Set(GRADOS_DEFAULT)

    secciones.forEach(item => {
      const meta = parseAcademicLabel(item.grado)
      if (meta.curso) courseSet.add(meta.curso)
      if (meta.grado) gradeSet.add(meta.grado)
    })

    const nextCourses = Array.from(courseSet)
    const nextGrades = Array.from(gradeSet)

    setAvailableCourses(nextCourses)
    setAvailableGrades(nextGrades)

    if (!nextCourses.includes(curso) && nextCourses.length) {
      setCurso(nextCourses[0])
    }

    if (!nextGrades.includes(grado) && nextGrades.length) {
      setGrado(nextGrades[0])
    }
  }, [secciones, curso, grado])

  const academicLabel = buildAcademicLabel(curso, grado)

  const addCourseToCatalog = () => {
    const value = newCourse.trim()
    if (!value) return
    setAvailableCourses(prev => prev.includes(value) ? prev : [...prev, value])
    setCurso(value)
    setNewCourse('')
  }

  const addGradeToCatalog = () => {
    const value = newGrade.trim()
    if (!value) return
    setAvailableGrades(prev => prev.includes(value) ? prev : [...prev, value])
    setGrado(value)
    setNewGrade('')
  }

  const toggleSectionSelection = (letter) => {
    setSelectedSections(prev => (
      prev.includes(letter)
        ? prev.filter(item => item !== letter)
        : [...prev, letter]
    ))
  }

  const addSeccion = () => {
    if (!academicLabel) return

    const existingKeys = new Set(secciones.map(item => buildSectionKey(item.grado, item.seccion, item.turno)))
    const lettersToAdd = selectedSections.length ? selectedSections : ['A']
    const nextRows = lettersToAdd
      .filter(letter => !existingKeys.has(buildSectionKey(academicLabel, letter, turno)))
      .map(letter => ({
        grado: academicLabel,
        seccion: letter,
        turno,
        id: `${buildSectionKey(academicLabel, letter, turno)}::${Date.now()}::${Math.random().toString(36).slice(2, 7)}`,
        special_schedule_enabled: useSpecialSchedule,
        hora_entrada_especial: useSpecialSchedule ? specialEntrada : '',
        hora_limite_tardanza_especial: useSpecialSchedule ? specialTardanza : '',
        hora_salida_especial: useSpecialSchedule ? specialSalida : '',
      }))

    if (!nextRows.length) return

    setSecciones(prev => [...prev, ...nextRows])
    setUseSpecialSchedule(false)
    setSpecialEntrada('')
    setSpecialTardanza('')
    setSpecialSalida('')
  }

  const removeSeccion = (id) => setSecciones(prev => prev.filter(s => s.id !== id))
  const updateSeccion = (id, field, value) => {
    setSecciones(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const turnoLabel = { manana: 'Manana', tarde: 'Tarde', noche: 'Noche' }
  const orderedSections = [...secciones].sort((a, b) => {
    const gradeCompare = a.grado.localeCompare(b.grado)
    if (gradeCompare !== 0) return gradeCompare
    const turnoCompare = a.turno.localeCompare(b.turno)
    if (turnoCompare !== 0) return turnoCompare
    return a.seccion.localeCompare(b.seccion)
  })

  return (
    <div key="step2" style={{animation:'ssFadeUp 0.4s ease-out both'}}>
      <div className="ss-card-title">Estructura academica</div>
      <div className="ss-card-sub">Aqui separas la oferta academica del centro. Primero eliges el curso y el grado; despues abres las secciones y turnos que realmente vas a usar.</div>

      <div className="ss-academic-grid" style={{ marginBottom: 16 }}>
        <div className="ss-academic-card">
          <div className="ss-academic-card-title">Catalogo de cursos</div>
          <div className="ss-academic-card-sub">Agrega cursos aparte del centro y luego usalos para abrir secciones.</div>
          <div className="ss-add-row" style={{ marginBottom: 0 }}>
            <div className="ss-field">
              <input
                className="ss-input"
                placeholder="Ej: Pre-media, Comercio, Robotica"
                value={newCourse}
                onChange={e => setNewCourse(e.target.value)}
              />
            </div>
            <button type="button" className="ss-btn-add" onClick={addCourseToCatalog}>
              Agregar curso
            </button>
          </div>
          <div className="ss-catalog-list">
            {availableCourses.map(item => (
              <button
                key={item}
                type="button"
                className={`ss-catalog-chip${curso === item ? ' active' : ''}`}
                onClick={() => setCurso(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="ss-academic-card">
          <div className="ss-academic-card-title">Catalogo de grados</div>
          <div className="ss-academic-card-sub">Mantiene los grados separados del curso para que no parezca una reconfiguracion del centro.</div>
          <div className="ss-add-row" style={{ marginBottom: 0 }}>
            <div className="ss-field">
              <input
                className="ss-input"
                placeholder="Ej: 4to, Modulo 2, Nivel 3"
                value={newGrade}
                onChange={e => setNewGrade(e.target.value)}
              />
            </div>
            <button type="button" className="ss-btn-add" onClick={addGradeToCatalog}>
              Agregar grado
            </button>
          </div>
          <div className="ss-catalog-list">
            {availableGrades.map(item => (
              <button
                key={item}
                type="button"
                className={`ss-catalog-chip${grado === item ? ' active' : ''}`}
                onClick={() => setGrado(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ss-grid-3" style={{ marginBottom: 16 }}>
        <div className="ss-field" style={{ marginBottom: 0 }}>
          <label className="ss-label">Curso seleccionado</label>
          <select className="ss-select" value={curso} onChange={e => setCurso(e.target.value)}>
            {availableCourses.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="ss-field" style={{ marginBottom: 0 }}>
          <label className="ss-label">Grado seleccionado</label>
          <select className="ss-select" value={grado} onChange={e => setGrado(e.target.value)}>
            {availableGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="ss-field" style={{ marginBottom: 0 }}>
          <label className="ss-label">Turno</label>
          <select className="ss-select" value={turno} onChange={e => setTurno(e.target.value)}>
            {TURNOS_DEFAULT.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          background: '#ffffff',
          border: '1px solid #dededb',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="ss-card-title" style={{ fontSize: 16, marginBottom: 4 }}>Secciones a crear</div>
            <div className="ss-card-sub" style={{ marginBottom: 0 }}>
                Curso activo: <strong style={{ color: '#111111' }}>{curso || 'Sin curso'}</strong> - Grado: <strong style={{ color: '#111111' }}>{grado || 'Sin grado'}</strong> - Turno: <strong style={{ color: '#111111' }}>{turnoLabel[turno]}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="ss-btn-add" onClick={addSeccion}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Crear secciones
            </button>
            <button type="button" className="ss-btn-skip" onClick={() => setSelectedSections([...SECCIONES_DEFAULT])}>
              Marcar A-J
            </button>
            <button type="button" className="ss-btn-skip" onClick={() => setSelectedSections([])}>
              Limpiar
            </button>
          </div>
        </div>

        <div className="ss-tags">
          {SECCIONES_DEFAULT.map(letter => {
            const active = selectedSections.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                onClick={() => toggleSectionSelection(letter)}
                style={{
                  border: active ? '1px solid #111111' : '1px solid #c9c9c5',
                  background: active ? '#111111' : '#fff',
                  color: active ? '#fff' : '#111111',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Seccion {letter}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          marginBottom: 14,
          background: '#ffffff',
          border: '1px solid #dededb',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#111111' }}>
          <input
            type="checkbox"
            checked={useSpecialSchedule}
            onChange={e => setUseSpecialSchedule(e.target.checked)}
          />
          Aplicar horario especial a las secciones que se agregaran ahora
        </label>

        {useSpecialSchedule && (
          <div className="ss-grid-3" style={{ marginTop: 14 }}>
            <div className="ss-field" style={{ marginBottom: 0 }}>
              <label className="ss-label">Entrada especial</label>
              <input className="ss-input" type="time" value={specialEntrada} onChange={e => setSpecialEntrada(e.target.value)} />
            </div>
            <div className="ss-field" style={{ marginBottom: 0 }}>
              <label className="ss-label">Tardanza especial</label>
              <input className="ss-input" type="time" value={specialTardanza} onChange={e => setSpecialTardanza(e.target.value)} />
            </div>
            <div className="ss-field" style={{ marginBottom: 0 }}>
              <label className="ss-label">Salida especial</label>
              <input className="ss-input" type="time" value={specialSalida} onChange={e => setSpecialSalida(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="ss-tags" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {orderedSections.length === 0 && (
          <span style={{fontSize:13,color:'#666666',fontStyle:'italic'}}>No hay cursos agregados aun</span>
        )}
        {orderedSections.map(s => (
          <div
            key={s.id}
            style={{
              background: '#fff',
              border: '1px solid #dededb',
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#111111' }}>{s.grado} {s.seccion}</div>
                <div style={{ fontSize: 12, color: '#666666', marginTop: 4 }}>Turno: {turnoLabel[s.turno]}</div>
                <div style={{ fontSize: 12, color: s.special_schedule_enabled ? '#111111' : '#666666', marginTop: 6 }}>
                  {s.special_schedule_enabled ? 'Horario especial activo' : 'Usa horario general del turno'}
                </div>
              </div>
              <button className="ss-tag-remove" onClick={() => removeSeccion(s.id)}>×</button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#111111', marginTop: 14 }}>
              <input
                type="checkbox"
                checked={Boolean(s.special_schedule_enabled)}
                onChange={e => updateSeccion(s.id, 'special_schedule_enabled', e.target.checked)}
              />
              Aplicar horario especial a esta seccion
            </label>

            {s.special_schedule_enabled && (
              <div className="ss-grid-3" style={{ marginTop: 14 }}>
                <div className="ss-field" style={{ marginBottom: 0 }}>
                  <label className="ss-label">Entrada especial</label>
                  <input
                    className="ss-input"
                    type="time"
                    value={s.hora_entrada_especial || ''}
                    onChange={e => updateSeccion(s.id, 'hora_entrada_especial', e.target.value)}
                  />
                </div>
                <div className="ss-field" style={{ marginBottom: 0 }}>
                  <label className="ss-label">Tardanza especial</label>
                  <input
                    className="ss-input"
                    type="time"
                    value={s.hora_limite_tardanza_especial || ''}
                    onChange={e => updateSeccion(s.id, 'hora_limite_tardanza_especial', e.target.value)}
                  />
                </div>
                <div className="ss-field" style={{ marginBottom: 0 }}>
                  <label className="ss-label">Salida especial</label>
                  <input
                    className="ss-input"
                    type="time"
                    value={s.hora_salida_especial || ''}
                    onChange={e => updateSeccion(s.id, 'hora_salida_especial', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════
   STEP 3 — HORARIOS
   ══════════════════════════════════ */
function Step3({ horarios, setHorarios }) {
  const turnos = [
    { id: 'manana', label: 'Turno Mañana', emoji: '🌅' },
    { id: 'tarde',  label: 'Turno Tarde',  emoji: '🌇' },
    { id: 'noche',  label: 'Turno Noche',  emoji: '🌙' },
  ]

  const update = (turno, field, value) => {
    setHorarios(prev => ({ ...prev, [turno]: { ...prev[turno], [field]: value } }))
  }

  return (
    <div key="step3" style={{animation:'ssFadeUp 0.4s ease-out both'}}>
      <div className="ss-card-title">Horarios operativos por turno</div>
      <div className="ss-card-sub">Define las horas oficiales de entrada, salida y limite de tardanza</div>

      {turnos.map(t => (
        <div key={t.id} className="ss-schedule-card">
          <div className="ss-schedule-title">{t.emoji} {t.label}</div>
          <div className="ss-grid-3">
            <div className="ss-field" style={{marginBottom:0}}>
              <label className="ss-label">Entrada</label>
              <input className="ss-input" type="time"
                value={horarios[t.id]?.entrada ?? ''}
                onChange={e => update(t.id, 'entrada', e.target.value)}/>
            </div>
            <div className="ss-field" style={{marginBottom:0}}>
              <label className="ss-label">Límite tardanza</label>
              <input className="ss-input" type="time"
                value={horarios[t.id]?.tardanza ?? ''}
                onChange={e => update(t.id, 'tardanza', e.target.value)}/>
            </div>
            <div className="ss-field" style={{marginBottom:0}}>
              <label className="ss-label">Salida</label>
              <input className="ss-input" type="time"
                value={horarios[t.id]?.salida ?? ''}
                onChange={e => update(t.id, 'salida', e.target.value)}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════
   STEP 4 — CALENDARIO
   ══════════════════════════════════ */
function Step4({ calendario, setCalendario }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [eventNote, setEventNote] = useState('')

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const dateKey = (d) => `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const resolveEntry = (value) => {
    if (!value) return null
    if (typeof value === 'string') return { tipo: value, descripcion: '' }
    return {
      tipo: value.tipo,
      descripcion: value.descripcion || '',
    }
  }

  const handleDayClick = (d) => {
    const currentEntry = resolveEntry(calendario[dateKey(d)])
    setSelectedDay(d)
    setEventNote(currentEntry?.descripcion || '')
    setShowModal(true)
  }

  const setDayType = (type) => {
    const key = dateKey(selectedDay)
    if (type === 'laboral') {
      setCalendario(prev => { const n = {...prev}; delete n[key]; return n })
    } else {
      setCalendario(prev => ({
        ...prev,
        [key]: {
          tipo: type,
          descripcion: type === 'evento' ? eventNote.trim() : '',
        },
      }))
    }
    setShowModal(false)
    setSelectedDay(null)
    setEventNote('')
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) }
    else setViewMonth(m => m-1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) }
    else setViewMonth(m => m+1)
  }

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const feriados = Object.values(calendario).filter(v => resolveEntry(v)?.tipo === 'feriado').length
  const vacaciones = Object.values(calendario).filter(v => resolveEntry(v)?.tipo === 'vacaciones').length
  const eventos = Object.values(calendario).filter(v => resolveEntry(v)?.tipo === 'evento').length

  return (
    <div key="step4" style={{animation:'ssFadeUp 0.4s ease-out both'}}>
      <div className="ss-card-title">Calendario escolar</div>
      <div className="ss-card-sub">Haz clic en los días para marcarlos como feriados o vacaciones</div>

      <div className="ss-calendar-header">
        <button className="ss-cal-nav" onClick={prevMonth}>‹</button>
        <div className="ss-cal-month">{MESES[viewMonth]} {viewYear}</div>
        <button className="ss-cal-nav" onClick={nextMonth}>›</button>
      </div>

      <div className="ss-cal-grid">
        {DIAS.map(d => <div key={d} className="ss-cal-day-name">{d}</div>)}
        {Array.from({length: firstDay}).map((_, i) => <div key={`e-${i}`} className="ss-cal-day empty"/>)}
        {Array.from({length: daysInMonth}).map((_, i) => {
          const d = i + 1
          const key = dateKey(d)
          const entry = resolveEntry(calendario[key])
          const tipo = entry?.tipo
          const isToday = key === todayKey
          const dayStyle = tipo === 'evento'
            ? { background: '#f4f4f2', color: '#111111', borderColor: '#c9c9c5' }
            : undefined
          return (
            <div key={d}
              className={`ss-cal-day${tipo ? ` ${tipo}` : ''}${isToday ? ' today' : ''}`}
              style={dayStyle}
              onClick={() => handleDayClick(d)}>
              {d}
            </div>
          )
        })}
      </div>

      <div className="ss-cal-legend">
        <div className="ss-cal-legend-item">
          <div className="ss-cal-legend-dot" style={{background:'#fee2e2',border:'1px solid #fca5a5'}}/>
          Feriado ({feriados})
        </div>
        <div className="ss-cal-legend-item">
          <div className="ss-cal-legend-dot" style={{background:'#fef3c7',border:'1px solid #fcd34d'}}/>
          Vacaciones ({vacaciones})
        </div>
        <div className="ss-cal-legend-item">
          <div className="ss-cal-legend-dot" style={{background:'#f4f4f2',border:'1px solid #c9c9c5'}}/>
          Eventos ({eventos})
        </div>
        <div className="ss-cal-legend-item">
          <div className="ss-cal-legend-dot" style={{background:'#fff',border:'2px solid #111111'}}/>
          Hoy
        </div>
      </div>

      {showModal && (
        <div className="ss-day-type-wrap" onClick={() => setShowModal(false)}>
          <div className="ss-day-type-card" onClick={e => e.stopPropagation()}>
            <div className="ss-day-type-title">
              {selectedDay} de {MESES[viewMonth]} — ¿Qué tipo de día es?
            </div>
            <button className="ss-day-type-btn" onClick={() => setDayType('laboral')}>
              📚 Día laboral
            </button>
            <button className="ss-day-type-btn feriado" onClick={() => setDayType('feriado')}>
              Feriado nacional
            </button>
            <button className="ss-day-type-btn vacaciones" onClick={() => setDayType('vacaciones')}>
              Vacaciones escolares
            </button>
            <button
              className="ss-day-type-btn"
              style={{ borderColor: '#c9c9c5', background: '#f4f4f2', color: '#111111' }}
              onClick={() => setDayType('evento')}
            >
              Evento escolar
            </button>
            <input
              className="ss-input"
              style={{ marginTop: 8 }}
              placeholder="Detalle del evento (opcional)"
              value={eventNote}
              onChange={e => setEventNote(e.target.value)}
            />
            <button className="ss-day-type-btn cancel" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CourseBoard({
  sections,
  horarios,
  students,
  teachers,
  subjectLinks,
  loading,
  saving,
  onCreateStudent,
  onAssignTeacher,
  onRemoveTeacherSubject,
  onGoStudents,
  onGoTeachers,
}) {
  const [studentDrafts, setStudentDrafts] = useState({})
  const [teacherDrafts, setTeacherDrafts] = useState({})

  const persistedSections = sections.filter(section => isPersistedSectionId(section.id))

  const updateStudentDraft = (sectionId, field, value) => {
    setStudentDrafts(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || { nombre: '', matricula: '' }), [field]: value },
    }))
  }

  const updateTeacherDraft = (sectionId, field, value) => {
    setTeacherDrafts(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || { teacher_id: '', subject: '' }), [field]: value },
    }))
  }

  const resetStudentDraft = (sectionId) => {
    setStudentDrafts(prev => ({ ...prev, [sectionId]: { nombre: '', matricula: '' } }))
  }

  const resetTeacherDraft = (sectionId) => {
    setTeacherDrafts(prev => ({ ...prev, [sectionId]: { teacher_id: '', subject: '' } }))
  }

  if (loading) {
    return (
      <div className="ss-card ss-course-board">
        <div className="ss-card-title">Vista por curso</div>
        <div className="ss-card-sub">Cargando estudiantes y docentes vinculados por curso.</div>
      </div>
    )
  }

  return (
    <div className="ss-card ss-course-board">
      <div className="ss-card-title">Vista por curso</div>
      <div className="ss-card-sub">
        Aqui ves cada curso activo con su horario, estudiantes y docentes. Desde aqui puedes cargar estudiantes rapido y asignar docentes con materia.
      </div>

      {persistedSections.length === 0 ? (
        <div className="ss-note">
          Aun no hay cursos guardados en la base. Guarda los cambios del centro primero y luego podras gestionar estudiantes y docentes dentro de cada curso.
        </div>
      ) : (
        <div className="ss-course-grid">
          {persistedSections.map(section => {
            const academicMeta = parseAcademicLabel(section.grado)
            const sectionStudents = students.filter(student => student.grade_section_id === section.id)
            const sectionStudentIds = new Set(sectionStudents.map(student => student.id))
            const sectionTeachers = teachers.filter(teacher => (teacher.secciones_ids || []).includes(section.id))
            const subjectGroupsMap = new Map()

            subjectLinks
              .filter(link => sectionStudentIds.has(link.student_id))
              .forEach(link => {
                const key = `${link.teacher_id}::${link.subject}`
                const current = subjectGroupsMap.get(key) || { teacher_id: link.teacher_id, subject: link.subject, count: 0 }
                current.count += 1
                subjectGroupsMap.set(key, current)
              })

            const subjectGroups = [...subjectGroupsMap.values()]
            const horario = section.special_schedule_enabled
              ? {
                  entrada: section.hora_entrada_especial || horarios[section.turno]?.entrada || '--',
                  tardanza: section.hora_limite_tardanza_especial || horarios[section.turno]?.tardanza || '--',
                  salida: section.hora_salida_especial || horarios[section.turno]?.salida || '--',
                }
              : {
                  entrada: horarios[section.turno]?.entrada || '--',
                  tardanza: horarios[section.turno]?.tardanza || '--',
                  salida: horarios[section.turno]?.salida || '--',
                }

            const studentDraft = studentDrafts[section.id] || { nombre: '', matricula: '' }
            const teacherDraft = teacherDrafts[section.id] || { teacher_id: '', subject: '' }

            return (
              <div key={section.id} className="ss-course-card">
                <div className="ss-course-head">
                  <div>
                    <div className="ss-course-title">
                      {academicMeta.curso ? `${academicMeta.curso} · ` : ''}{academicMeta.grado || section.grado} {section.seccion}
                    </div>
                    <div className="ss-course-sub">
                      Turno: {section.turno} · Entrada: {horario.entrada} · Tardanza: {horario.tardanza} · Salida: {horario.salida}
                    </div>
                  </div>
                  <button type="button" className="ss-btn-back" onClick={onGoStudents}>
                    Abrir estudiantes
                  </button>
                </div>

                <div className="ss-course-kpis">
                  <div className="ss-course-kpi">
                    <div className="ss-course-kpi-value">{sectionStudents.length}</div>
                    <div className="ss-course-kpi-label">Estudiantes</div>
                  </div>
                  <div className="ss-course-kpi">
                    <div className="ss-course-kpi-value">{sectionTeachers.length}</div>
                    <div className="ss-course-kpi-label">Docentes</div>
                  </div>
                  <div className="ss-course-kpi">
                    <div className="ss-course-kpi-value">{subjectGroups.length}</div>
                    <div className="ss-course-kpi-label">Materias</div>
                  </div>
                </div>

                <div className="ss-course-block">
                  <div className="ss-course-block-title">Alta rapida de estudiante</div>
                  <div className="ss-inline-grid students">
                    <div className="ss-field" style={{ marginBottom: 0 }}>
                      <label className="ss-label">Nombre</label>
                      <input className="ss-input" value={studentDraft.nombre} onChange={e => updateStudentDraft(section.id, 'nombre', e.target.value)} placeholder="Nombre del estudiante" />
                    </div>
                    <div className="ss-field" style={{ marginBottom: 0 }}>
                      <label className="ss-label">Matricula</label>
                      <input className="ss-input" value={studentDraft.matricula} onChange={e => updateStudentDraft(section.id, 'matricula', e.target.value)} placeholder="2026-001" />
                    </div>
                    <button
                      type="button"
                      className="ss-btn-add"
                      disabled={saving || !studentDraft.nombre.trim() || !studentDraft.matricula.trim()}
                      onClick={async () => {
                        await onCreateStudent(section.id, studentDraft)
                        resetStudentDraft(section.id)
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="ss-course-block">
                  <div className="ss-course-block-title">Docentes y materias</div>
                  <div className="ss-inline-grid">
                    <div className="ss-field" style={{ marginBottom: 0 }}>
                      <label className="ss-label">Docente</label>
                      <select className="ss-select" value={teacherDraft.teacher_id} onChange={e => updateTeacherDraft(section.id, 'teacher_id', e.target.value)}>
                        <option value="">Seleccionar docente</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ss-field" style={{ marginBottom: 0 }}>
                      <label className="ss-label">Materia</label>
                      <input className="ss-input" value={teacherDraft.subject} onChange={e => updateTeacherDraft(section.id, 'subject', e.target.value)} placeholder="Matematica, Lengua, Ciencias..." />
                    </div>
                    <div className="ss-note">
                      Hora de llegada base
                      <br />
                      <strong style={{ color: '#111111' }}>{horario.entrada}</strong>
                    </div>
                    <button
                      type="button"
                      className="ss-btn-add"
                      disabled={saving || !teacherDraft.teacher_id || !teacherDraft.subject.trim()}
                      onClick={async () => {
                        await onAssignTeacher(section.id, teacherDraft)
                        resetTeacherDraft(section.id)
                      }}
                    >
                      Asignar
                    </button>
                  </div>

                  {subjectGroups.length === 0 ? (
                    <div className="ss-note">
                      Aun no hay materias asignadas en este curso. Primero agrega estudiantes y luego vincula el docente con su materia.
                    </div>
                  ) : (
                    <div className="ss-mini-list">
                      {subjectGroups.map(group => {
                        const teacher = teachers.find(item => item.id === group.teacher_id)
                        return (
                          <div key={`${group.teacher_id}-${group.subject}`} className="ss-mini-item">
                            <div className="ss-mini-item-title">{teacher?.full_name || 'Docente'}</div>
                            <div className="ss-mini-item-sub">
                              Materia: {group.subject} · Cobertura: {group.count} estudiante(s) · Hora de llegada: {horario.entrada}
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <button type="button" className="ss-btn-skip" onClick={() => onRemoveTeacherSubject(section.id, group.teacher_id, group.subject)}>
                                Quitar materia
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="ss-course-block">
                  <div className="ss-course-block-title">Roster actual</div>
                  {sectionStudents.length === 0 ? (
                    <div className="ss-note">Todavia no hay estudiantes en este curso.</div>
                  ) : (
                    <div className="ss-mini-list">
                      {sectionStudents.map(student => (
                        <div key={student.id} className="ss-mini-item">
                          <div className="ss-mini-item-title">{student.nombre}</div>
                          <div className="ss-mini-item-sub">Matricula: {student.matricula}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button type="button" className="ss-btn-back" onClick={onGoStudents}>Gestionar estudiantes</button>
                    <button type="button" className="ss-btn-back" onClick={onGoTeachers}>Gestionar docentes</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════
   COMPONENTE PRINCIPAL
   ══════════════════════════════════ */
export default function SchoolSetup() {
  const navigate = useNavigate()
  const { profile, activeSchoolId } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [courseBoardLoading, setCourseBoardLoading] = useState(true)
  const [courseBoardSaving, setCourseBoardSaving] = useState(false)
  const [schoolId, setSchoolId] = useState(null)
  const [hasExistingConfig, setHasExistingConfig] = useState(false)

  // Step 1 — datos escuela
  const [schoolData, setSchoolData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    director: '',
    academic_period_start: '',
    academic_period_end: '',
    latitude: '',
    longitude: '',
    allowed_radius_m: '150',
  })

  // Step 2 — secciones
  const [secciones, setSecciones] = useState([])
  const [courseStudents, setCourseStudents] = useState([])
  const [courseTeachers, setCourseTeachers] = useState([])
  const [courseSubjectLinks, setCourseSubjectLinks] = useState([])

  // Step 3 — horarios
  const [horarios, setHorarios] = useState({
    manana: { entrada: '07:30', tardanza: '08:00', salida: '12:30' },
    tarde:  { entrada: '12:30', tardanza: '13:00', salida: '17:30' },
    noche:  { entrada: '17:30', tardanza: '18:00', salida: '21:30' },
  })

  // Step 4 — calendario
  const [calendario, setCalendario] = useState({})

  const updateSchool = (field, value) => setSchoolData(prev => ({ ...prev, [field]: value }))

  const STEPS = [
    { n: 1, label: 'Ajustes' },
    { n: 2, label: 'Cursos' },
    { n: 3, label: 'Turnos' },
    { n: 4, label: 'Calendario' },
  ]

  useEffect(() => {
    if (activeSchoolId) {
      loadExistingSetup()
    } else {
      setBootstrapping(false)
      setCourseBoardLoading(false)
    }
  }, [activeSchoolId])

  async function loadExistingSetup() {
    setBootstrapping(true)
    try {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', activeSchoolId)
        .maybeSingle()

      if (schoolError) throw schoolError

      if (!school) {
        setCourseBoardLoading(false)
        return
      }

      setSchoolId(school.id)
      setHasExistingConfig(Boolean(school.configurado))
      if (school.configurado) {
        setStep(2)
      }
      setSchoolData({
        nombre: school.nombre || '',
        direccion: school.direccion || '',
        telefono: school.telefono || '',
        email: school.email || '',
        director: school.director || profile?.full_name || '',
        academic_period_start: school.academic_period_start || '',
        academic_period_end: school.academic_period_end || '',
        latitude: school.latitude ?? '',
        longitude: school.longitude ?? '',
        allowed_radius_m: school.allowed_radius_m ?? '150',
      })

      const [
        { data: sectionsData, error: sectionsError },
        { data: schedulesData, error: schedulesError },
        { data: calendarData, error: calendarError },
      ] = await Promise.all([
        supabase.from('grade_sections').select('*').eq('school_id', school.id).order('grado').order('seccion'),
        supabase.from('schedules').select('*').eq('school_id', school.id),
        supabase.from('school_calendar').select('*').eq('school_id', school.id),
      ])

      if (sectionsError) throw sectionsError
      if (schedulesError) throw schedulesError
      if (calendarError) throw calendarError

      const mappedSections = (sectionsData || []).map(section => ({
        id: section.id || `${section.grado}-${section.seccion}-${section.turno}`,
        grado: section.grado,
        seccion: section.seccion,
        turno: section.turno,
        special_schedule_enabled: Boolean(section.special_schedule_enabled),
        hora_entrada_especial: section.hora_entrada_especial || '',
        hora_salida_especial: section.hora_salida_especial || '',
        hora_limite_tardanza_especial: section.hora_limite_tardanza_especial || '',
      }))

      setSecciones(mappedSections)

      if (schedulesData?.length) {
        setHorarios(prev => {
          const next = { ...prev }
          schedulesData.forEach(schedule => {
            next[schedule.turno] = {
              entrada: schedule.hora_entrada || prev[schedule.turno]?.entrada || '',
              tardanza: schedule.hora_limite_tardanza || prev[schedule.turno]?.tardanza || '',
              salida: schedule.hora_salida || prev[schedule.turno]?.salida || '',
            }
          })
          return next
        })
      }

      if (calendarData?.length) {
        setCalendario(
          calendarData.reduce((acc, item) => {
            acc[item.fecha] = {
              tipo: item.tipo,
              descripcion: item.descripcion || '',
            }
            return acc
          }, {})
        )
      }

      await loadCourseRoster(mappedSections)
    } catch (error) {
      console.error(error)
      alert('No se pudo cargar la informacion actual del centro.')
    } finally {
      setBootstrapping(false)
    }
  }

  async function loadCourseRoster(sectionRows = secciones) {
    const persistedSectionIds = (sectionRows || [])
      .map(section => section.id)
      .filter(isPersistedSectionId)

    if (!persistedSectionIds.length) {
      setCourseStudents([])
      setCourseTeachers([])
      setCourseSubjectLinks([])
      setCourseBoardLoading(false)
      return
    }

    setCourseBoardLoading(true)

    try {
      const [{ data: studentsData, error: studentsError }, { data: teacherProfiles, error: teachersError }] = await Promise.all([
        supabase.from('students').select('id, nombre, matricula, grade_section_id').in('grade_section_id', persistedSectionIds).order('nombre'),
        supabase.from('profiles').select('*').eq('role', 'teacher'),
      ])

      if (studentsError) throw studentsError
      if (teachersError) throw teachersError

      const scopedTeachers = (teacherProfiles || []).filter(teacher =>
        (teacher.secciones_ids || []).some(sectionId => persistedSectionIds.includes(sectionId))
      )

      const studentIds = (studentsData || []).map(student => student.id)
      const { data: subjectRows, error: subjectError } = studentIds.length
        ? await supabase
            .from('student_teachers')
            .select('*')
            .in('student_id', studentIds)
        : { data: [], error: null }

      if (subjectError) throw subjectError

      setCourseStudents(studentsData || [])
      setCourseTeachers(scopedTeachers)
      setCourseSubjectLinks(subjectRows || [])
    } catch (error) {
      console.error('Error loading course roster:', error)
      setCourseStudents([])
      setCourseTeachers([])
      setCourseSubjectLinks([])
    } finally {
      setCourseBoardLoading(false)
    }
  }

  async function handleCreateStudentForCourse(sectionId, draft) {
    setCourseBoardSaving(true)
    try {
      const nombre = draft?.nombre?.trim()
      const matricula = draft?.matricula?.trim()

      if (!nombre || !matricula) {
        throw new Error('Completa nombre y matricula para agregar el estudiante.')
      }

      const { data: insertedStudent, error: insertError } = await supabase
        .from('students')
        .insert({ nombre, matricula, grade_section_id: sectionId })
        .select('id, nombre, matricula, grade_section_id')
        .single()

      if (insertError) throw insertError

      const siblingStudents = courseStudents.filter(student => student.grade_section_id === sectionId && student.id !== insertedStudent.id)
      const siblingIds = siblingStudents.map(student => student.id)

      if (siblingIds.length) {
        const siblingLinks = courseSubjectLinks.filter(link => siblingIds.includes(link.student_id))
        const uniqueAssignments = [...new Map(
          siblingLinks.map(link => [`${link.teacher_id}::${link.subject}`, { teacher_id: link.teacher_id, subject: link.subject }])
        ).values()]

        if (uniqueAssignments.length) {
          const rows = uniqueAssignments.map(assignment => ({
            student_id: insertedStudent.id,
            teacher_id: assignment.teacher_id,
            subject: assignment.subject,
          }))

          const { error: subjectInsertError } = await supabase
            .from('student_teachers')
            .upsert(rows, { onConflict: 'student_id,teacher_id,subject' })

          if (subjectInsertError) throw subjectInsertError
        }
      }

      await loadCourseRoster()
    } catch (error) {
      alert(`No se pudo agregar el estudiante: ${error.message}`)
    } finally {
      setCourseBoardSaving(false)
    }
  }

  async function handleAssignTeacherToCourse(sectionId, draft) {
    setCourseBoardSaving(true)
    try {
      const teacherId = draft?.teacher_id
      const subject = draft?.subject?.trim()

      if (!teacherId || !subject) {
        throw new Error('Selecciona un docente y escribe la materia.')
      }

      const teacher = courseTeachers.find(item => item.id === teacherId)
        || (await supabase.from('profiles').select('*').eq('id', teacherId).maybeSingle()).data

      if (!teacher) {
        throw new Error('No se encontro el docente seleccionado.')
      }

      const nextSections = Array.from(new Set([...(teacher.secciones_ids || []), sectionId]))
      const { error: teacherUpdateError } = await supabase
        .from('profiles')
        .update({ secciones_ids: nextSections })
        .eq('id', teacherId)

      if (teacherUpdateError) throw teacherUpdateError

      const sectionStudents = courseStudents.filter(student => student.grade_section_id === sectionId)
      if (!sectionStudents.length) {
        throw new Error('Agrega al menos un estudiante al curso antes de asignar la materia del docente.')
      }

      const rows = sectionStudents.map(student => ({
        student_id: student.id,
        teacher_id: teacherId,
        subject,
      }))

      const { error: subjectInsertError } = await supabase
        .from('student_teachers')
        .upsert(rows, { onConflict: 'student_id,teacher_id,subject' })

      if (subjectInsertError) throw subjectInsertError

      await loadCourseRoster()
    } catch (error) {
      alert(`No se pudo asignar el docente: ${error.message}`)
    } finally {
      setCourseBoardSaving(false)
    }
  }

  async function handleRemoveTeacherSubject(sectionId, teacherId, subject) {
    setCourseBoardSaving(true)
    try {
      const sectionStudentIds = courseStudents
        .filter(student => student.grade_section_id === sectionId)
        .map(student => student.id)

      if (!sectionStudentIds.length) {
        setCourseBoardSaving(false)
        return
      }

      const { error } = await supabase
        .from('student_teachers')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('subject', subject)
        .in('student_id', sectionStudentIds)

      if (error) throw error

      await loadCourseRoster()
    } catch (error) {
      alert(`No se pudo quitar la materia: ${error.message}`)
    } finally {
      setCourseBoardSaving(false)
    }
  }

  const canNext = () => {
    if (step === 1) {
      return (
        schoolData.nombre.trim().length > 0
        && schoolData.academic_period_start
        && schoolData.academic_period_end
      )
    }
    return true
  }

  async function saveSections(currentSchoolId) {
    const { data: existingSections, error: existingError } = await supabase
      .from('grade_sections')
      .select('id')
      .eq('school_id', currentSchoolId)

    if (existingError) throw existingError

    const persistedIds = new Set((existingSections || []).map(section => section.id))
    const currentPersistedIds = new Set(
      secciones
        .map(section => section.id)
        .filter(id => typeof id === 'string' && persistedIds.has(id))
    )

    const idsToDelete = (existingSections || [])
      .map(section => section.id)
      .filter(id => !currentPersistedIds.has(id))

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('grade_sections')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) throw deleteError
    }

    for (const section of secciones) {
      const fullPayload = {
        school_id: currentSchoolId,
        grado: section.grado,
        seccion: section.seccion,
        turno: section.turno,
        special_schedule_enabled: Boolean(section.special_schedule_enabled),
        hora_entrada_especial: section.special_schedule_enabled ? section.hora_entrada_especial || null : null,
        hora_salida_especial: section.special_schedule_enabled ? section.hora_salida_especial || null : null,
        hora_limite_tardanza_especial: section.special_schedule_enabled ? section.hora_limite_tardanza_especial || null : null,
      }

      const compatiblePayload = {
        school_id: currentSchoolId,
        grado: section.grado,
        seccion: section.seccion,
        turno: section.turno,
      }

      if (typeof section.id === 'string' && persistedIds.has(section.id)) {
        await saveGradeSectionRow({
          mode: 'update',
          id: section.id,
          fullPayload,
          compatiblePayload,
        })
      } else {
        await saveGradeSectionRow({
          mode: 'insert',
          fullPayload,
          compatiblePayload,
        })
      }
    }
  }

  async function saveSchedules(currentSchoolId) {
    const { error: deleteError } = await supabase
      .from('schedules')
      .delete()
      .eq('school_id', currentSchoolId)

    if (deleteError) throw deleteError

    const rows = Object.entries(horarios)
      .filter(([, horario]) => horario.entrada && horario.salida && horario.tardanza)
      .map(([turno, horario]) => ({
        school_id: currentSchoolId,
        turno,
        hora_entrada: horario.entrada,
        hora_salida: horario.salida,
        hora_limite_tardanza: horario.tardanza,
      }))

    if (!rows.length) return

    const { error: insertError } = await supabase
      .from('schedules')
      .insert(rows)

    if (insertError) throw insertError
  }

  async function saveCalendar(currentSchoolId) {
    const { error: deleteError } = await supabase
      .from('school_calendar')
      .delete()
      .eq('school_id', currentSchoolId)

    if (deleteError) throw deleteError

    const rows = Object.entries(calendario).map(([fecha, value]) => ({
      school_id: currentSchoolId,
      fecha,
      tipo: typeof value === 'string' ? value : value?.tipo,
      descripcion: typeof value === 'string' ? null : value?.descripcion || null,
    }))

    if (!rows.length) return

    const { error: insertError } = await supabase
      .from('school_calendar')
      .insert(rows)

    if (insertError) throw insertError
  }

  function isSchemaCacheColumnError(error) {
    const message = String(error?.message || '').toLowerCase()
    return (
      error?.code === 'PGRST204'
      || message.includes('schema cache')
      || message.includes('could not find')
      || message.includes('column')
    )
  }

  async function saveGradeSectionRow({ mode, id, fullPayload, compatiblePayload }) {
    const run = payload => {
      const query = mode === 'update'
        ? supabase.from('grade_sections').update(payload).eq('id', id)
        : supabase.from('grade_sections').insert(payload)

      return query
    }

    const { error: fullError } = await run(fullPayload)

    if (!fullError) return

    if (!isSchemaCacheColumnError(fullError)) {
      throw fullError
    }

    // Compatibilidad con bases antiguas: si aun no existen columnas de horario
    // especial, el curso/seccion se guarda con los campos esenciales.
    const { error: compatibleError } = await run(compatiblePayload)

    if (compatibleError) throw compatibleError
  }

  async function saveSchoolMetadata(currentSchoolId) {
    const fullPayload = {
      nombre: schoolData.nombre,
      direccion: schoolData.direccion,
      telefono: schoolData.telefono,
      email: schoolData.email,
      director: schoolData.director,
      academic_period_start: schoolData.academic_period_start || null,
      academic_period_end: schoolData.academic_period_end || null,
      latitude: schoolData.latitude === '' ? null : Number(schoolData.latitude),
      longitude: schoolData.longitude === '' ? null : Number(schoolData.longitude),
      allowed_radius_m: schoolData.allowed_radius_m === '' ? null : Number(schoolData.allowed_radius_m),
      configurado: true,
    }

    const { error: fullUpdateError } = await supabase
      .from('schools')
      .update(fullPayload)
      .eq('id', currentSchoolId)

    if (!fullUpdateError) return

    if (!isSchemaCacheColumnError(fullUpdateError)) {
      throw fullUpdateError
    }

    // Compatibilidad con bases antiguas: no bloquear cursos por columnas nuevas
    // que aun no existen o no han refrescado en el schema cache de Supabase.
    const compatiblePayload = {
      nombre: schoolData.nombre,
      direccion: schoolData.direccion,
      telefono: schoolData.telefono,
      email: schoolData.email,
      director: schoolData.director,
    }

    const { error: compatibleUpdateError } = await supabase
      .from('schools')
      .update(compatiblePayload)
      .eq('id', currentSchoolId)

    if (compatibleUpdateError) throw compatibleUpdateError
  }

  const handleFinish = async () => {
    setLoading(true)
    setSuccess(false)
    try {
      let currentSchoolId = schoolId

      if (!currentSchoolId) {
        throw new Error('No tienes un centro educativo asignado para configurar.')
      }

      await saveSchoolMetadata(currentSchoolId)

      await saveSections(currentSchoolId)
      await saveSchedules(currentSchoolId)
      await saveCalendar(currentSchoolId)

      setSuccess(true)
      setTimeout(() => navigate('/admin/dashboard'), 1200)
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const headerTitle = 'Gestion del centro'
  const headerSubtitle = hasExistingConfig
    ? 'Administra cursos, secciones, turnos, horarios y calendario sin rehacer el centro.'
    : 'Define la estructura academica del centro y continua con estudiantes, docentes y asistencia.'
  const centerMetrics = {
    cursos: new Set(secciones.map(section => parseAcademicLabel(section.grado).curso || section.grado).filter(Boolean)).size,
    secciones: secciones.length,
    turnos: new Set(secciones.map(section => section.turno).filter(Boolean)).size,
  }

  if (bootstrapping) {
    return (
      <>
        <style>{styles}</style>
        <div className="ss-root">
          <div className="ss-wrap">
            <div className="ss-card" style={{ textAlign: 'center' }}>
              <div className="ss-card-title">Cargando centro educativo</div>
              <div className="ss-card-sub">Estamos preparando los datos academicos del centro.</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="ss-root">
        <div className="ss-wrap">

          {/* Header */}
          <div className="ss-header">
            <div>
              <div className="ss-logo">
                <BrandLogo compact size={40} titleColor="#ffffff" subtitleColor="rgba(255,255,255,.58)" />
              </div>
              <h1 className="ss-title">{headerTitle}</h1>
              <p className="ss-subtitle">{headerSubtitle}</p>
              <div className="ss-header-actions">
                <button className="ss-btn-back" onClick={() => navigate('/admin/dashboard')}>
                  Volver al panel
                </button>
                <button className="ss-btn-back" onClick={() => navigate('/admin/students')}>
                  Gestionar estudiantes
                </button>
                <button className="ss-btn-back" onClick={() => navigate('/admin/teachers')}>
                  Gestionar docentes
                </button>
              </div>
            </div>

            <div className="ss-header-metrics">
              <div className="ss-metric">
                <div className="ss-metric-label">Cursos</div>
                <div className="ss-metric-value">{centerMetrics.cursos}</div>
              </div>
              <div className="ss-metric">
                <div className="ss-metric-label">Secciones</div>
                <div className="ss-metric-value">{centerMetrics.secciones}</div>
              </div>
              <div className="ss-metric">
                <div className="ss-metric-label">Turnos</div>
                <div className="ss-metric-value">{centerMetrics.turnos}</div>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="ss-stepper">
            {STEPS.map((s, i) => (
              <>
                <div key={s.n} className={`ss-step${step === s.n ? ' active' : step > s.n ? ' done' : ''}`}>
                  <div className="ss-step-circle">
                    {step > s.n
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      : s.n
                    }
                  </div>
                  <div className="ss-step-label">{s.label}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div key={`line-${i}`} className={`ss-step-line${step > s.n ? ' done' : ''}`}/>
                )}
              </>
            ))}
          </div>

          {/* Card */}
          <div className="ss-card">
            {step === 1 && <Step1 data={schoolData} onChange={updateSchool} />}
            {step === 2 && <Step2 secciones={secciones} setSecciones={setSecciones} />}
            {step === 3 && <Step3 horarios={horarios} setHorarios={setHorarios} />}
            {step === 4 && <Step4 calendario={calendario} setCalendario={setCalendario} />}

            {/* Botones */}
            <div className="ss-btn-row">
              <div>
                {step > 1 && (
                  <button className="ss-btn-back" onClick={() => setStep(s => s - 1)}>
                    ← Atrás
                  </button>
                )}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:16}}>
                {step < 4 && step > 1 && (
                  <button className="ss-btn-skip" onClick={() => navigate('/admin/students')}>
                    Ir a estudiantes
                  </button>
                )}
                {step < 4 ? (
                  <button
                    className="ss-btn-primary"
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canNext()}>
                    Continuar
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                ) : (
                  <button
                    className={`ss-btn-primary${success ? ' success' : ''}`}
                    onClick={handleFinish}
                    disabled={loading || success}>
                    {success ? (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        ¡Listo!
                      </>
                    ) : loading ? (
                      <>
                        <span className="ss-spin">⟳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        Guardar cambios
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <CourseBoard
            sections={secciones}
            horarios={horarios}
            students={courseStudents}
            teachers={courseTeachers}
            subjectLinks={courseSubjectLinks}
            loading={courseBoardLoading}
            saving={courseBoardSaving}
            onCreateStudent={handleCreateStudentForCourse}
            onAssignTeacher={handleAssignTeacherToCourse}
            onRemoveTeacherSubject={handleRemoveTeacherSubject}
            onGoStudents={() => navigate('/admin/students')}
            onGoTeachers={() => navigate('/admin/teachers')}
          />

        </div>
      </div>
    </>
  )
}
