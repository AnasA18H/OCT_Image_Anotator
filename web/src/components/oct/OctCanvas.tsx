export function OctCanvas() {
  return (
    <section
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-200/80 p-4 dark:bg-zinc-900/80"
      aria-label="Image canvas"
    >
      <div className="flex min-h-[min(60vh,480px)] flex-1 items-center justify-center rounded-lg border-2 border-dashed border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Canvas area — OCT slice will render here (Module 1.3+)
        </p>
      </div>
    </section>
  );
}
