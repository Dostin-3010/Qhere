import { useNavigate } from "react-router-dom";

function IconQr() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14h3v3M17 14h3M14 17h6M17 20h3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function StudentSurface({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-[rgba(17,17,17,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,245,244,0.92))] p-8 shadow-[0_28px_76px_rgba(17,17,17,0.1)] backdrop-blur-xl md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.86)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#111111]">
              <IconQr />
              Portal estudiantil
            </div>

            <h1 className="mt-6 font-['Fraunces'] text-4xl leading-none tracking-[-0.05em] text-[#081423] md:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#55677c]">
              {description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[rgba(17,17,17,0.08)] bg-white/80 p-5 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <strong className="block text-[15px] text-[#081423]">Nuevo lenguaje visual</strong>
                <span className="mt-2 block text-sm leading-7 text-[#55677c]">
                  Esta ruta ahora mantiene la misma presencia institucional del resto del sistema.
                </span>
              </div>

              <div className="rounded-[24px] border border-[rgba(17,17,17,0.08)] bg-white/80 p-5 shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <strong className="block text-[15px] text-[#081423]">Preparada para crecer</strong>
                <span className="mt-2 block text-sm leading-7 text-[#55677c]">
                  La estructura queda lista para conectar futuras funciones sin perder coherencia.
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(160deg,rgba(27,7,11,0.98),rgba(17,17,17,0.96)_58%,rgba(33,33,33,0.94))] p-6 text-white shadow-[0_28px_70px_rgba(17,17,17,0.22)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-white/90">
              <span className="h-2 w-2 rounded-full bg-[#d8e9fa]" />
              Vista en evolucion
            </div>

            <h2 className="mt-5 font-['Fraunces'] text-3xl leading-none tracking-[-0.04em]">
              Experiencia estudiantil con la misma firma visual del rediseño.
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/78">
              Dejamos esta superficie lista para seguir construyendo funciones del alumno dentro de un contenedor que ya se ve serio, estable y conectado con el resto del sistema.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
                <strong className="block text-sm">Base consistente</strong>
                <span className="mt-2 block text-sm leading-6 text-white/72">
                  Tipografia, color y profundidad alineados con admin, docente y familia.
                </span>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4">
                <strong className="block text-sm">Escalable</strong>
                <span className="mt-2 block text-sm leading-6 text-white/72">
                  Lista para conectar asistencia, reportes o acciones rapidas del estudiante.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl bg-[linear-gradient(135deg,#111111,#e82127)] px-5 py-3 font-extrabold text-white shadow-[0_18px_34px_rgba(232,33,39,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
            onClick={() => navigate("/login")}
          >
            Volver al acceso
          </button>
          <button
            type="button"
            className="rounded-2xl border border-[rgba(16,40,71,0.1)] bg-white px-5 py-3 font-extrabold text-[#44566b] transition-transform duration-200 hover:-translate-y-0.5"
            onClick={() => navigate("/")}
          >
            Ir a la portada
          </button>
        </div>
      </div>
    </div>
  );
}
