import Card from '../ui/Card'

/**
 * @param {{
 *   title: string,
 *   subtitle: string,
 *   children: import('react').ReactNode,
 *   footer?: import('react').ReactNode
 * }} props
 */
function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-blueprint-dark px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-8">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-30"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-blueprint-dark lg:flex-row">
        <section className="flex w-full flex-col justify-between border-b border-white/10 bg-blueprint-darker px-6 py-7 text-white sm:px-8 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <a href="https://hackclub.com" target="_blank" rel="noreferrer" className="inline-flex">
                <img
                  className="h-12 w-12 shrink-0 rounded-2xl bg-white/10 p-2"
                  src="https://assets.hackclub.com/flag-orpheus-top.svg"
                  alt="Hack Club"
                />
              </a>
              <div>
                <p className="block text-[0.72rem] uppercase tracking-[0.38em] text-blueprint-light/80">
                  Build Guild Portal
                </p>
                <h1 className="mt-1 font-display leading-none text-white sm:text-5xl">{title}</h1>
              </div>
            </div>

            <div className="max-w-md space-y-5">
              <p className="block text-base leading-7 text-blueprint-light/92 sm:text-lg">{subtitle}</p>
              <div className="grid gap-3 text-sm text-blueprint-light/90">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Blueprint-first layout with Hack Club branding and readable contrast.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Dark-blue surfaces, grid lines, and strong accent states from the reference style.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Session cookies, CSRF, and auth flow ready for the backend.</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-blueprint-light/70">
            <span className="h-px flex-1 bg-white/20" />
            Hack Club x Build Guild
            <span className="h-px flex-1 bg-white/20" />
          </div>
        </section>

        <section className="flex w-full flex-1 items-center justify-center px-5 py-7 sm:px-8 lg:px-10 lg:py-12">
          <Card className="w-full max-w-xl rounded-[1.75rem] bg-blueprint-darker p-6 sm:p-8">
            {children}

            {footer ? <div className="mt-6 border-t border-white/10 pt-4">{footer}</div> : null}
          </Card>
        </section>
      </div>
    </main>
  )
}

export default AuthShell
