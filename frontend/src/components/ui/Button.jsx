export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
  const styles = {
    primary: 'border border-[#111111] bg-[#111111] text-white shadow-[0_16px_34px_rgba(17,17,17,0.18)]',
    secondary: 'border border-[#c9c9c5] bg-white text-[#111111]',
    danger: 'border border-[#e82127] bg-[#e82127] text-white',
    success: 'border border-[#111111] bg-[#111111] text-white',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 ${styles[variant]} ${disabled ? 'cursor-not-allowed opacity-50 hover:translate-y-0' : ''}`}
    >
      {children}
    </button>
  )
}
