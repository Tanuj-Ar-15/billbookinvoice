const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(236,72,153,0.22),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(34,197,94,0.25),transparent_35%)]" />
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  )
}

export default AuthLayout
