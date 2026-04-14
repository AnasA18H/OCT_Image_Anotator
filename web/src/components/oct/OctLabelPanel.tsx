export function OctLabelPanel() {
  return (
    <aside
      className="flex w-64 shrink-0 flex-col border-l border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Surface labels"
    >
      <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Labels
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Palette (Module 6+)
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No labels yet.
        </p>
      </div>
    </aside>
  );
}
