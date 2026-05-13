import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { requestDirectorAccess } from '../api/backendApi'
import BrandLogo from '../components/ui/BrandLogo'
import {
  MAX_EMAIL_LENGTH,
  formatDominicanPhone,
  normalizeEmail,
  validateDominicanPhone,
  validateEmail,
} from '../utils/formValidation'

const styles = `
  .dr-root {
    min-height: 100vh;
    padding: 24px 16px 40px;
    background:
      radial-gradient(circle at 12% 8%, rgba(232,33,39,.08), transparent 28%),
      radial-gradient(circle at 86% 12%, rgba(17,17,17,.08), transparent 30%),
      linear-gradient(180deg, rgba(255,255,255,.96), rgba(245,245,244,.98)),
      linear-gradient(rgba(17,17,17,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(17,17,17,.03) 1px, transparent 1px),
      #f5f5f4;
    background-size: auto, 48px 48px, 48px 48px, auto;
    font-family: "Sora", sans-serif;
    color: #111111;
  }
  .dr-wrap {
    width: min(1100px, 100%);
    margin: 0 auto;
  }
  .dr-shell {
    display: grid;
    grid-template-columns: .74fr 1.26fr;
    gap: 18px;
    align-items: start;
  }
  .dr-side {
    position: sticky;
    top: 20px;
    min-height: 620px;
    border-radius: 34px;
    padding: 26px;
    background:
      linear-gradient(145deg, rgba(255,255,255,.08), transparent 38%),
      linear-gradient(180deg, #1b070b, #111111 54%, #181818);
    color: #ffffff;
    box-shadow: 0 30px 80px rgba(17,17,17,.18);
    overflow: hidden;
  }
  .dr-side::after {
    content: "";
    position: absolute;
    right: -80px;
    bottom: -90px;
    width: 260px;
    height: 260px;
    border-radius: 999px;
    border: 42px solid rgba(232,33,39,.16);
  }
  .dr-side h1 {
    position: relative;
    margin: 80px 0 14px;
    font: 800 clamp(2.4rem, 5vw, 4.9rem)/.86 "Fraunces", serif;
    letter-spacing: -.065em;
    color: #ffffff;
    z-index: 1;
  }
  .dr-side p {
    position: relative;
    max-width: 330px;
    color: rgba(255,255,255,.72);
    line-height: 1.75;
    z-index: 1;
  }
  .dr-flow {
    position: relative;
    display: grid;
    gap: 10px;
    margin-top: 34px;
    z-index: 1;
  }
  .dr-flow-step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px;
    border-radius: 18px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.8);
    font-size: .9rem;
    font-weight: 700;
  }
  .dr-flow-step span {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #ffffff;
    color: #111111;
    font-size: .78rem;
    font-weight: 900;
  }
  .dr-card {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(17,17,17,.08);
    border-radius: 34px;
    padding: 24px;
    box-shadow: 0 30px 70px rgba(8,20,35,.1);
  }
  .dr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .dr-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #111111;
  }
  .dr-kicker-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: #e82127;
  }
  .dr-title {
    margin: 0 0 8px;
    font: 800 clamp(1.8rem, 3vw, 2.7rem)/.98 "Fraunces", serif;
    letter-spacing: -.04em;
    color: #111111;
  }
  .dr-copy {
    max-width: 720px;
    color: #5d6f84;
    line-height: 1.78;
    font-size: .95rem;
  }
  .dr-section {
    margin-top: 22px;
    padding: 18px;
    border: 1px solid rgba(17,17,17,.08);
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff, #fbfbfa);
  }
  .dr-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    color: #111111;
    font: 800 1rem "Fraunces", serif;
  }
  .dr-section-title span {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #111111;
    color: #ffffff;
    font: 900 .78rem "Sora", sans-serif;
  }
  .dr-form {
    display: grid;
    gap: 0;
    margin-top: 0;
  }
  .dr-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dr-field {
    display: grid;
    gap: 7px;
  }
  .dr-field.full {
    grid-column: 1 / -1;
  }
  .dr-label {
    font-size: .7rem;
    font-weight: 800;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: #6f6a64;
  }
  .dr-input {
    width: 100%;
    min-height: 54px;
    border-radius: 16px;
    border: 1px solid rgba(17,17,17,.14);
    background: #ffffff;
    color: #111111;
    padding: 0 16px;
    font: inherit;
    font-size: .94rem;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
    box-sizing: border-box;
  }
  .dr-input:focus {
    border-color: #111111;
    box-shadow: 0 0 0 4px rgba(232,33,39,.1);
  }
  .dr-input.invalid {
    border-color: #dc2626;
    background: #fff7f7;
  }
  .dr-error {
    color: #dc2626;
    font-size: .72rem;
    line-height: 1.4;
    margin-top: -4px;
  }
  .dr-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 6px;
  }
  .dr-btn,
  .dr-link {
    min-height: 54px;
    padding: 0 22px;
    border-radius: 18px;
    font: inherit;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    text-decoration: none;
    transition: transform .2s ease, opacity .2s ease;
  }
  .dr-btn {
    border: 0;
    background: #111111;
    color: #fff;
    box-shadow: 0 18px 34px rgba(27,63,107,.18);
  }
  .dr-link {
    border: 1px solid rgba(17,17,17,.12);
    background: #fff;
    color: #111111;
  }
  .dr-btn:hover,
  .dr-link:hover {
    transform: translateY(-2px);
  }
  .dr-btn:disabled {
    opacity: .7;
    cursor: not-allowed;
    transform: none;
  }
  .dr-note {
    margin-top: 20px;
    padding: 16px 18px;
    border-radius: 22px;
    background: #f5f5f4;
    color: #333333;
    border: 1px solid rgba(17,17,17,.08);
    line-height: 1.7;
    font-size: .92rem;
  }
  .dr-note strong { color: #111111; }
  .dr-warning {
    margin-top: 12px;
    padding: 14px 16px;
    border-radius: 20px;
    background: rgba(232,33,39,.07);
    border: 1px solid rgba(232,33,39,.16);
    color: #3b1b1d;
    line-height: 1.65;
    font-size: .9rem;
  }
  @media (max-width: 940px) {
    .dr-shell { grid-template-columns: 1fr; }
    .dr-side { position: relative; min-height: auto; }
    .dr-side h1 { margin-top: 46px; }
  }
  @media (max-width: 720px) {
    .dr-card { padding: 22px; }
    .dr-grid { grid-template-columns: 1fr; }
    .dr-actions > * { width: 100%; }
  }
`

export default function DirectorRegister() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    school_name: '',
    school_email: '',
    school_phone: '',
    school_address: '',
  })
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    const nextValue = field.includes('phone') ? formatDominicanPhone(value) : value
    setForm((current) => ({ ...current, [field]: nextValue }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const normalized = {
      ...form,
      full_name: form.full_name.trim(),
      email: normalizeEmail(form.email),
      phone: formatDominicanPhone(form.phone),
      school_name: form.school_name.trim(),
      school_email: form.school_email ? normalizeEmail(form.school_email) : '',
      school_phone: formatDominicanPhone(form.school_phone),
      school_address: form.school_address.trim(),
    }
    const nextErrors = {
      full_name: normalized.full_name ? '' : 'Tu nombre completo es obligatorio.',
      email: validateEmail(normalized.email, 'correo electronico'),
      password: normalized.password.length >= 6 ? '' : 'La contrasena debe tener al menos 6 caracteres.',
      phone: validateDominicanPhone(normalized.phone),
      school_name: normalized.school_name ? '' : 'El nombre del centro es obligatorio.',
      school_email: normalized.school_email ? validateEmail(normalized.school_email, 'correo del centro') : '',
      school_phone: validateDominicanPhone(normalized.school_phone, { label: 'telefono del centro' }),
    }

    setForm(normalized)
    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error('Revisa los campos marcados antes de enviar.')
      return
    }

    setSubmitting(true)

    try {
      const result = await requestDirectorAccess({
        ...normalized,
      })
      if (result?.notification_warning) {
        toast(result.notification_warning)
      }
      toast.success(result?.request_reopened ? 'Solicitud reenviada y puesta en revision.' : 'Solicitud enviada. Revisa tu correo cuando direccion apruebe el acceso.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="dr-root">
        <div className="dr-wrap">
          <div className="dr-shell">
            <aside className="dr-side">
              <BrandLogo subtitle="Solicitud institucional" size={42} />
              <h1>Acceso directivo controlado.</h1>
              <p>
                Registra el centro, valida la cuenta y deja la aprobacion lista para el panel
                absoluto sin perder trazabilidad.
              </p>
              <div className="dr-flow">
                <div className="dr-flow-step"><span>1</span> Envias los datos del centro</div>
                <div className="dr-flow-step"><span>2</span> El super admin revisa la solicitud</div>
                <div className="dr-flow-step"><span>3</span> Si fue rechazada, puedes corregir y reenviar</div>
              </div>
            </aside>

            <div className="dr-card">
              <div className="dr-card-head">
                <div className="dr-kicker">
                  <span className="dr-kicker-dot" />
                  Solicitud de direccion
                </div>
                <Link className="dr-link" to="/login">Volver al login</Link>
              </div>

              <h1 className="dr-title">Solicita acceso como director.</h1>
              <p className="dr-copy">
                Si tu solicitud anterior fue rechazada, puedes volver a enviarla con el mismo correo.
                La nueva solicitud quedara pendiente y volvera a aparecer en el panel absoluto.
              </p>

              <form className="dr-form" onSubmit={handleSubmit}>
                <section className="dr-section">
                  <div className="dr-section-title"><span>01</span> Datos del solicitante</div>
                  <div className="dr-grid">
                    <label className="dr-field">
                      <span className="dr-label">Nombre completo</span>
                      <input autoComplete="name" className={`dr-input${errors.full_name ? ' invalid' : ''}`} maxLength={90} placeholder="Ej. Dustin Polanco" required value={form.full_name} onChange={(event) => updateField('full_name', event.target.value)} />
                      {errors.full_name && <span className="dr-error">{errors.full_name}</span>}
                    </label>

                    <label className="dr-field">
                      <span className="dr-label">Correo personal o institucional</span>
                      <input autoComplete="email" className={`dr-input${errors.email ? ' invalid' : ''}`} maxLength={MAX_EMAIL_LENGTH} placeholder="director@centro.edu" required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
                      {errors.email && <span className="dr-error">{errors.email}</span>}
                    </label>

                    <label className="dr-field">
                      <span className="dr-label">Contrasena</span>
                      <input autoComplete="new-password" className={`dr-input${errors.password ? ' invalid' : ''}`} minLength={6} placeholder="Minimo 6 caracteres" required type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
                      {errors.password && <span className="dr-error">{errors.password}</span>}
                    </label>

                    <label className="dr-field">
                      <span className="dr-label">Telefono</span>
                      <input autoComplete="tel" className={`dr-input${errors.phone ? ' invalid' : ''}`} inputMode="tel" maxLength={12} placeholder="809-000-0000" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
                      {errors.phone && <span className="dr-error">{errors.phone}</span>}
                    </label>
                  </div>
                </section>

                <section className="dr-section">
                  <div className="dr-section-title"><span>02</span> Datos del centro educativo</div>
                  <div className="dr-grid">
                    <label className="dr-field full">
                      <span className="dr-label">Nombre del centro educativo</span>
                      <input autoComplete="organization" className={`dr-input${errors.school_name ? ' invalid' : ''}`} maxLength={120} placeholder="Nombre oficial del centro" required value={form.school_name} onChange={(event) => updateField('school_name', event.target.value)} />
                      {errors.school_name && <span className="dr-error">{errors.school_name}</span>}
                    </label>

                    <label className="dr-field">
                      <span className="dr-label">Correo del centro</span>
                      <input autoComplete="email" className={`dr-input${errors.school_email ? ' invalid' : ''}`} maxLength={MAX_EMAIL_LENGTH} placeholder="contacto@centro.edu" type="email" value={form.school_email} onChange={(event) => updateField('school_email', event.target.value)} />
                      {errors.school_email && <span className="dr-error">{errors.school_email}</span>}
                    </label>

                    <label className="dr-field">
                      <span className="dr-label">Telefono del centro</span>
                      <input autoComplete="tel" className={`dr-input${errors.school_phone ? ' invalid' : ''}`} inputMode="tel" maxLength={12} placeholder="809-000-0000" value={form.school_phone} onChange={(event) => updateField('school_phone', event.target.value)} />
                      {errors.school_phone && <span className="dr-error">{errors.school_phone}</span>}
                    </label>

                    <label className="dr-field full">
                      <span className="dr-label">Direccion del centro</span>
                      <input autoComplete="street-address" className="dr-input" placeholder="Direccion fisica del centro" value={form.school_address} onChange={(event) => updateField('school_address', event.target.value)} />
                    </label>
                  </div>
                </section>

                <div className="dr-actions">
                  <button className="dr-btn" disabled={submitting} type="submit">
                    {submitting ? 'Enviando solicitud...' : 'Enviar solicitud directiva'}
                  </button>
                </div>
              </form>

              <div className="dr-note">
                La cuenta no queda activa de inmediato. Primero se envia una alerta al panel absoluto
                y, si el correo esta configurado, tambien se notifica a
                <strong> El administrador</strong>.
              </div>
              <div className="dr-warning">
                Una solicitud rechazada no bloquea el correo para siempre: al reenviarla, vuelve a estado pendiente y el administrador puede revisarla otra vez.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
