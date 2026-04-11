/**
 * @param {import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
function Input(props) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-white/15 bg-blueprint-darker px-4 py-3 text-base text-white outline-none placeholder:text-white/50',
        'focus:border-blueprint-warning focus:ring-2 focus:ring-blueprint-warning/30',
        props.className || '',
      ].join(' ')}
    />
  )
}

export default Input
