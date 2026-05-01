export default function Input({ label, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#607187]">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-2xl border border-[rgba(17,17,17,0.14)] bg-white px-4 py-2 text-sm text-[#111111] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition focus:border-[#111111] focus:ring-4 focus:ring-[rgba(232,33,39,0.12)]"
      />
    </div>
  )
}
