export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Gym Tracker
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Track every set, rep &amp; PR.
          </h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            Build your splits, log your lifts, and watch your strength climb
            workout after workout.
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <Feature title="Your splits" desc="Push, Pull, Legs — build any routine you want." />
          <Feature title="Log fast" desc="Sets × reps × weight, pre-filled from last time." />
          <Feature title="See progress" desc="Charts of your lifts over weeks and months." />
        </section>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-500">
          <p className="font-medium text-zinc-300">Phase 1 — Foundation ✅</p>
          <p className="mt-1">
            App scaffolded and running. Up next: accounts &amp; the database.
          </p>
        </div>
      </main>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}
