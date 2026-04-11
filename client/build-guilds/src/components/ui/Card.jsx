/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
function Card({ className = '', children }) {
  return <div className={['rounded-3xl border border-white/10 bg-blueprint-darker', className].join(' ')}>{children}</div>
}

export default Card
