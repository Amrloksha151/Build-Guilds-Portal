/**
 * @param {{
 *   variant?: 'primary' | 'outline' | 'destructive',
 *   className?: string,
 *   type?: 'button' | 'submit' | 'reset',
 *   disabled?: boolean,
 *   onClick?: (event: import('react').MouseEvent<HTMLButtonElement>) => void,
 *   children: import('react').ReactNode
 * }} props
 */
function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  children,
}) {
  const variants = {
    primary: 'bg-white text-blueprint-darker hover:brightness-110',
    outline: 'border border-white bg-transparent text-white hover:bg-white/10',
    destructive: 'bg-blueprint-danger text-blueprint-darker hover:brightness-105',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-sans font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default Button
