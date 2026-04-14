export function OctToolbar() {
  return (
    <header
      className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950"
      role="toolbar"
      aria-label="Annotation tools"
    >
      <span className="mr-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Toolbar
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
        >
          Tools (soon)
        </button>
      </div>
    </header>
  );
}
