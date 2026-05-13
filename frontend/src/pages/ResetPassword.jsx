import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { updateCurrentUserPassword } from '../api/authApi'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/ui/BrandLogo'

const styles = `
  .rp-root {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      linear-gradient(90deg, rgba(17,17,17,.035) 1px, transparent 1px),
      linear-gradient(180deg, rgba(17,17,17,.035) 1px, transparent 1px),
      #f4f4f2;
    background-size: 34px 34px;
    color: #111111;
    font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .rp-card {
    width: min(100%, 460px);
    background: #ffffff;
    border: 1px solid #dededb;
    border-radius: 18px;
    box-shadow: 0 24px 70px rgba(17,17,17,.14);
    padding: 28px;
  }

  .rp-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 26px;
  }

  .rp-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 30px;
    line-height: 1;
    margin: 0 0 10px;
    letter-spacing: 0;
  }

  .rp-copy {
    color: #666666;
    font-size: 14px;
    line-height: 1.7;
    margin: 0 0 22px;
  }

  .rp-field {
    display: grid;
    gap: 8px;
    margin-bottom: 14px;
  }

  .rp-label {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #666666;
  }

  .rp-input {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #c9c9c5;
    border-radius: 12px;
    padding: 14px 15px;
    font: inherit;
    color: #111111;
    background: #ffffff;
    outline: none;
  }

  .rp-input:focus {
    border-color: #111111;
    box-shadow: 0 0 0 4px rgba(17,17,17,.08);
  }

  .rp-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    flex-wrap: wrap;
  }

  .rp-submit,
  .rp-link {
    border: none;
    border-radius: 12px;
    padding: 13px 18px;
    font: inherit;
    font-weight: 900;
    text-decoration: none;
    cursor: pointer;
  }

  .rp-submit {
    background: #111111;
    color: #ffffff;
  }

  .rp-submit:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .rp-link {
    color: #111111;
    background: #f4f4f2;
  }

  .rp-note {
    margin-top: 18px;
    border: 1px solid #dededb;
    border-radius: 14px;
    padding: 13px 14px;
    color: #666666;
    font-size: 13px;
    line-height: 1.6;
    background: #fafafa;
  }
`

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  const hasRecoveryParams = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    return (
      params.get('code')
      || hashParams.get('access_token')
      || hashParams.get('type') === 'recovery'
    )
  }, [])

  useEffect(() => {
    let mounted = true

    async function hydrateRecoverySession() {
      try {
        if (!hasRecoveryParams) {
          setReady(true)
          return
        }

        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }
      } catch (error) {
        toast.error(error.message || 'El enlace de recuperacion no es valido.')
      } finally {
        if (mounted) setReady(true)
      }
    }

    void hydrateRecoverySession()

    return () => {
      mounted = false
    }
  }, [hasRecoveryParams])

  async function handleSubmit(event) {
    event.preventDefault()

    if (saving) return

    if (password.length < 6) {
      toast.error('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contrasenas no coinciden.')
      return
    }

    setSaving(true)

    try {
      await updateCurrentUserPassword(password)
      toast.success('Contrasena actualizada. Ya puedes iniciar sesion.')
      await supabase.auth.signOut({ scope: 'local' })
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.message || 'No se pudo cambiar la contrasena.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <main className="rp-root">
        <section className="rp-card">
          <div className="rp-brand">
            <BrandLogo size={42} titleColor="#111111" subtitleColor="#666666" />
          </div>

          <h1 className="rp-title">Cambiar contrasena</h1>
          <p className="rp-copy">
            Escribe una nueva contrasena para tu cuenta. Cuando termine, volveras al inicio de sesion.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="rp-field">
              <span className="rp-label">Nueva contrasena</span>
              <input
                className="rp-input"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimo 6 caracteres"
                type="password"
                value={password}
              />
            </label>

            <label className="rp-field">
              <span className="rp-label">Confirmar contrasena</span>
              <input
                className="rp-input"
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la contrasena"
                type="password"
                value={confirmPassword}
              />
            </label>

            <div className="rp-actions">
              <Link className="rp-link" to="/login">Volver</Link>
              <button className="rp-submit" disabled={!ready || saving} type="submit">
                {saving ? 'Guardando...' : 'Guardar contrasena'}
              </button>
            </div>
          </form>

          {!hasRecoveryParams ? (
            <div className="rp-note">
              Abre esta pantalla desde el enlace de recuperacion que llega al correo.
            </div>
          ) : null}
        </section>
      </main>
    </>
  )
}
