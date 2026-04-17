# OCT Image Annotator

Web app for browsing OCT-style volumes and annotating slices: projects (CRUD), per-slice annotations in **original image coordinates**, and tools for **point**, **polygon** (filled), **line**, and **freehand** strokes. Volumes load from **TIFF stacks**, **single images**, or **uncompressed DICOM** (see `Docs/Moduls.txt` for format limits).

## Stack

| Area | Tech |
|------|------|
| UI | React (Vite), TypeScript, Tailwind-style tokens in CSS |
| API | Node, Prisma (see `backend/`) |
| Workers | Off-thread decode: `frontend/src/workers/tiffWorker.ts`, `dicomWorker.ts` |
| Client storage | IndexedDB for cached volume blobs per project |

## Development

### One command (frontend + backend)

```bash
./run.sh
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

### Setup only

```bash
./run.sh setup
```

Installs frontend and backend npm dependencies and optionally a Python venv from `requirements.txt`.

### Frontend only

```bash
./run.sh frontend
```

### Frontend lint + production build

```bash
./run.sh frontend:build
```

### Backend only

```bash
./run.sh backend
```

### Database migrations

```bash
./run.sh backend:migrate
```

## Repository layout

- `frontend/` — Vite app (annotate canvas, projects UI)
- `backend/` — API and Prisma schema
- `Docs/` — module checklist (`Moduls.txt`), requirements mapping, project notes

## Annotate UI (short)

- Slice navigation: buttons, slider, trackpad horizontal scroll / two-finger swipe (where supported), pinch zoom on canvas.
- Drawing modes: point click; polygon with finish (Enter / toolbar / double-click); line two-click; **freehand** click-drag, release to commit; **Esc** cancels drafts / in-progress freehand stroke; undo/redo per history.

Python in `requirements.txt` is optional tooling for this stage.
