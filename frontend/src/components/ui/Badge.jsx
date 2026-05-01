export default function Badge({ status }) {
  const styles = {
    pending:  'border border-[#dededb] bg-[#f5f5f4] text-[#111111]',
    approved: 'border border-[#111111] bg-[#111111] text-white',
    rejected: 'border border-[#e82127] bg-[#fff1f1] text-[#e82127]',
  }

  const labels = {
    pending:  'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  }

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[status] || 'border border-[#dededb] bg-[#f5f5f4] text-[#666666]'}`}>
      {labels[status] || status}
    </span>
  )
}
