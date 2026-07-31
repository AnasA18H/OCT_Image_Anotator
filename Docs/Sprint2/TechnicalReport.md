# OCT Web Annotation Tool — Sprint 2 Technical Report

**Course:** ITECH3208 – Project 1  
**Institution:** Federation University Australia · Teaching Period 2026/05  
**Document:** Sprint 2 Technical Report (Sections C, D & E)  
**Version:** 1.0  
**Status:** Draft for submission  
**Related documents:** `Docs/Sprint1/TechnicalReport.md`, `Docs/Moduls.txt` (Phases 4–9), `Docs/RequirementsCoverage.txt`

---

## Document control

| Field | Value |
|-------|-------|
| Project | Web Annotation Tool (OCT volume annotation) |
| Sprint | Sprint 2 (Weeks 8–12 — Full Annotation Engine) |
| Repository | OCT monorepo (`frontend/`, `backend/`, `Docs/`) |
| Builds on | Sprint 1 Technical Report (`Docs/Sprint1/TechnicalReport.md`) |

### Team

| Name | Student ID | Role |
|------|------------|------|
| Abdulla Hamad Salem Alameri | 30455692 | Scrum Master |
| Nehayan Abdulla Aljaberi | 30455840 | Product Owner |
| Mohammed Alketbi | 30455709 | Developer: Frontend |
| Ameera Alkhanbashi | 30455837 | Developer: Backend |
| Omran Almarzooqi | 30455711 | Developer: UI/UX & Testing |

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Section C — Implementation](#2-section-c--implementation)
   - 2.1 [Sprint 2 scope and goals](#21-sprint-2-scope-and-goals)
   - 2.2 [Annotation drawing tools](#22-annotation-drawing-tools)
   - 2.3 [Label palette system](#23-label-palette-system)
   - 2.4 [Zoom, pan and magnifier](#24-zoom-pan-and-magnifier)
   - 2.5 [Edit mode and undo/redo](#25-edit-mode-and-undoredo)
   - 2.6 [Save, load and JSON export](#26-save-load-and-json-export)
   - 2.7 [Volume persistence (IndexedDB)](#27-volume-persistence-indexeddb)
3. [Section D — Testing](#3-section-d--testing)
4. [Section E — Reflection and next steps](#4-section-e--reflection-and-next-steps)
5. [Requirements coverage summary](#5-requirements-coverage-summary)
6. [How to run](#6-how-to-run)
7. [Glossary](#7-glossary)

---

## 1. Executive summary

Sprint 2 completes the **core annotation engine** of the OCT Web Annotation Tool, building on the Sprint 1 prototype (viewer shell, slice navigation, TIFF/DICOM loading). Every drawing mode required by the client — **point, polygon, line, and freehand** — is now fully implemented. The **surface label palette** (ILM / RPE / NFL defaults, active state, add/delete with cross-slice cleanup, reorder) drives color and organization of all annotations. **Zoom and pan** with cursor-centered scaling, a **magnifier glass** tool, and a complete **undo/redo** history stack were also delivered. A versioned **JSON save/load** system with native OS "Save As" dialog and cloud project persistence rounds out the sprint.

Phases 4 through 9 of the module checklist (`Docs/Moduls.txt`) are complete. Phase 10 (S3, user manual, performance hardening) remains as the next sprint target.

---

## 2. Section C — Implementation

### 2.1 Sprint 2 scope and goals

| Goal | Status |
|------|--------|
| All annotation drawing tools (point, polygon, line, freehand) | ✅ Done |
| Surface label palette with active state, CRUD, reorder | ✅ Done |
| Zoom / pan / magnifier with annotation alignment | ✅ Done |
| Edit mode: select, move vertex, delete annotation | ✅ Done |
| Undo / redo (100-step history) | ✅ Done |
| JSON export (Save As with native dialog) | ✅ Done |
| JSON import (Load from file) | ✅ Done |
| Cloud save (backend DB via Prisma) | ✅ Done |
| Data Export (Phase 9) | ✅ Done |
| AWS S3 file picker (Phase 10) | 🔜 Next sprint |

---

### 2.2 Annotation drawing tools

All drawing interactions happen inside `OctCanvas.tsx`. Annotations are stored as image-space `{ x, y }` coordinates — independent of zoom or pan — so they stay locked to the pixel they were placed on regardless of viewport state.

#### 2.2.1 Point tool
A single click in **Point** mode appends a one-point annotation. It renders as a small filled circle whose color is derived from the active label.

#### 2.2.2 Line tool
**Line** mode is a two-click workflow:
1. First click — stores the start point as a *draft*.
2. Second click — commits a final `line` annotation with exactly two points.

A live rubber-band preview follows the mouse between clicks.

#### 2.2.3 Polygon tool
**Polygon** mode accumulates points click-by-click into a draft. The shape is closed and committed when the user:
- double-clicks (automatic close on the last point), or
- presses **Enter**, or
- clicks the **Finish** button in the toolbar.

Completed polygons are filled with a semi-transparent color (opacity `0.12`) derived from the label, making layer boundaries visible without obscuring the underlying image. Pressing **Esc** cancels the in-progress draft and discards all uncommitted points.

#### 2.2.4 Freehand tool (client critical)
**Freehand** is the highest-priority annotation mode per the client specification. The implementation:

1. **Pointer-down** starts recording raw image-space points.
2. **Pointer-move** appends each sampled position to a live polyline drawn in real time on the canvas — the cursor is followed exactly with no simplification during capture.
3. **Pointer-up** (or touch end) commits the stroke as a `freehand` annotation if at least 2 points were captured; otherwise the draft is discarded silently.
4. **Esc** cancels an in-progress stroke before it is committed.

Completed freehand strokes with a sufficiently enclosed path receive a background fill at reduced opacity (`0.12`) matching the label color, consistent with the polygon rendering. Open strokes render as a polyline only.

---

### 2.3 Label palette system

The label palette (`OctLabelPanel.tsx` + `surfaceLabels.ts`) is the **central control hub** for all annotation colors and organization.

#### 2.3.1 Default labels
Three labels are pre-loaded on every new project:

| Label | Default color |
|-------|--------------|
| ILM (Inner Limiting Membrane) | `#1d4ed8` (blue) |
| RPE (Retinal Pigment Epithelium) | `#c2410c` (orange-red) |
| NFL (Nerve Fiber Layer) | `#6d28d9` (violet) |

#### 2.3.2 Active label and color binding
Clicking a label row **activates** it:
- The row highlights and the label name turns the application's accent color.
- Every subsequent annotation (regardless of tool) inherits the active label's `id` and color.
- Clicking the same label again **deactivates** it (toggle behavior) — drawing is disabled without an active label.

Two color-computation functions in `surfaceLabels.ts` ensure good contrast:

```ts
colorToAnnotationStyle(color)       // inactive: stroke at 55% brightness, fill at 0.12 opacity
colorToAnnotationStyleActive(color) // active:   stroke at 92%, fill at 0.22 opacity
```

This means the currently selected label's annotations always appear visually brighter and more prominent than annotations belonging to other labels.

#### 2.3.3 Show all layers toggle
A toggle switch at the top of the panel switches between:
- **Show all** (default) — every label's annotations are visible simultaneously.
- **Active only** — only annotations belonging to the currently active label are rendered, useful for focused editing of one retinal surface.

#### 2.3.4 Adding custom labels
Typing a name into the input field and pressing **Enter** or clicking **Add**:
- Generates a new label with a `crypto.randomUUID()` id.
- Assigns a random saturated color (luminance filter rejects colors above 0.72 to avoid near-white hues).
- Immediately sets the new label as active, so the user can start drawing at once.

```ts
export function randomLabelColor(): string {
  let n: number;
  do { n = Math.floor(Math.random() * 0xffffff); }
  while (luminanceFromRgb(n) > 0.72);
  return `#${n.toString(16).padStart(6, "0")}`;
}
```

#### 2.3.5 Deleting labels (with cross-slice cleanup)
Clicking the trash icon on a label triggers a **confirmation dialog**. On confirm:
1. The label is removed from the palette.
2. A single history commit iterates over **every slice** in `annotationsBySlice` and filters out annotations whose `labelId` matches the deleted label.
3. The active label is reassigned to the first remaining label.

This prevents orphaned annotations — a deleted label leaves no invisible, uneditable shapes behind anywhere in the volume.

The delete button is **disabled** when only one label remains, ensuring the palette is never empty.

#### 2.3.6 Reordering labels
Up/down arrow buttons in the panel shift a label one position in the array. Order controls visual z-order on the canvas: the label at index 0 renders first (bottom), higher indices render on top.

---

### 2.4 Zoom, pan and magnifier

All viewport transforms are applied in `OctCanvas.tsx`. Annotations are stored in **image-space** coordinates, so no transform is baked into the stored data — the canvas rendering pipeline applies the current `zoom` and `offset` on every frame.

#### 2.4.1 Zoom
Three zoom entry points share the same cursor-centered zoom math:

| Entry point | Mechanism |
|-------------|-----------|
| Toolbar `+` / `–` buttons | Zoom toward canvas center |
| Mouse wheel / trackpad scroll | Zoom toward current cursor position |
| Trackpad pinch gesture | Zoom toward pinch midpoint |

Zoom factor is clamped between `0.1×` and `32×`. On each zoom event, the `offset` is adjusted so the image pixel under the cursor remains stationary.

#### 2.4.2 Pan
**Pan mode** (hand tool) converts pointer-drag into `offset` changes. The canvas scrolls the viewport without altering annotation coordinates.

The `clientToImage(x, y)` helper accounts for scroll offset, device pixel ratio, and the current zoom and pan transform, ensuring every click-placed annotation is correctly mapped to image pixels regardless of viewport state.

#### 2.4.3 Magnifier glass tool
A floating circular lens renders a magnified sub-region of the current slice centered on the cursor, drawn as an overlay on the canvas. Controls:
- A zoom slider in the floating toolbar sets the lens magnification (1×–10×).
- `+` / `–` buttons increment/decrement the lens zoom.
- The lens follows the pointer in real time with no impact on the stored viewport state.

---

### 2.5 Edit mode and undo/redo

#### 2.5.1 Edit mode
Activating **Edit mode** (pencil tool) changes pointer behavior:

1. **Click near a vertex** — selects the annotation and the specific point index. The vertex highlights.
2. **Click on a stroke or fill** — selects the annotation as a whole (useful for freehand and polygon bodies).
3. **Drag a selected vertex** — moves it to the new image-space position and commits a history entry on pointer-up.
4. **Delete / Backspace** — removes the selected annotation from the current slice.
5. **Esc** — deselects without deleting.

Edit selection is cleared automatically when changing slices or switching away from Edit mode.

#### 2.5.2 Undo / redo history

The history system is a **pure-function reducer** (`historyReducer`) managing a `{ past, present, future }` triple, capped at 100 entries:

```
type HistoryAction =
  | { type: "reset" }
  | { type: "commit"; update: (s: AnnotState) => AnnotState }
  | { type: "undo" }
  | { type: "redo" }
```

Every annotation mutation — add, move, delete, clear slice, load from file — is dispatched as a `commit`. Undo pops `past` → `present`; redo pops `future` → `present`. The history is **per-project-session** (not persisted to disk) and resets on project switch.

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |
| Toolbar Undo / Redo buttons | Same actions |

---

### 2.6 Save, load and JSON export

#### 2.6.1 JSON schema (v2)

The export format was upgraded from v1 (flat per-slice map) to **v2** (multi-file envelope) to support multiple volume files per project:

```json
{
  "version": 2,
  "projectId": "cmo0lccqt0001oo4v...",
  "projectName": "Retina Study A",
  "labels": [
    { "id": "surface-ilm", "name": "ILM", "color": "#1d4ed8" },
    { "id": "surface-rpe", "name": "RPE", "color": "#c2410c" }
  ],
  "files": {
    "oct-volume.tif": {
      "0": [
        {
          "id": "ann-uuid-...",
          "labelId": "surface-ilm",
          "type": "freehand",
          "points": [{ "x": 102.5, "y": 340.1 }, { "x": 103.2, "y": 341.0 }]
        }
      ],
      "1": []
    }
  }
}
```

**Top-level fields:**

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Schema version (currently `2`) |
| `projectId` | `string \| null` | Backend project UUID (null for offline use) |
| `projectName` | `string` | Human-readable project name |
| `labels` | `SurfaceLabel[]` | Full label palette at time of export |
| `files` | `Record<string, SliceMap>` | Map of filename → per-slice annotation array |

**Per-annotation fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | `crypto.randomUUID()` or timestamp fallback |
| `labelId` | `string` | References `labels[].id` |
| `type` | `"point" \| "line" \| "polygon" \| "freehand"` | Drawing mode |
| `points` | `{ x: number; y: number }[]` | Coordinates in original image pixels |
| `closed` | `boolean?` | Present and `true` for completed polygons |

#### 2.6.2 Save As (native OS dialog)
Clicking **Save As** uses the **File System Access API** (`window.showSaveFilePicker`) when available (Chrome/Edge), which opens the operating system's native save dialog — the user chooses folder and filename directly. On browsers that do not support the API (Firefox, Safari), the code falls back to a `<a download>` trigger.

```ts
if ("showSaveFilePicker" in window) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: defaultName,
    types: [{ description: "JSON annotation file", accept: { "application/json": [".json"] } }],
  });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
```

#### 2.6.3 Load from JSON
Clicking **Load** opens a file picker accepting `.json`. On selection:

1. The file is parsed and validated.
2. If the `projectName` field does not match the current project, a **confirmation dialog** warns the user before proceeding.
3. The `annotationsBySlice` and `labels` state are replaced atomically via a single history `commit`, so the load itself is undoable.
4. v1 flat-format files are transparently migrated: the top-level slice map is stored under `__default__` in the v2 envelope.

#### 2.6.4 Cloud save (Ctrl+S)
`Ctrl+S` / `Cmd+S` triggers `saveProjectToDb()`, which:
1. Fetches the **latest** project record from the backend to avoid overwriting sibling-file annotations.
2. Merges the current file's slice map into the full v2 file envelope.
3. POSTs the merged annotations and label palette to the Prisma-backed API.

A toast notification confirms success or failure.

---

### 2.7 Volume persistence (IndexedDB)

When a file is loaded, the raw blob is written to **IndexedDB** keyed by `projectId`. On returning to the project page, the blob is restored automatically, re-initializing the worker and resuming exactly where the session left off — without requiring the user to re-select the file.

---

## 3. Section D — Testing

| # | Test case | Input | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| 1 | Load DICOM file | `sample.dcm` | First slice displays; slice label shows "Slice 1 / N" | ✅ Pass |
| 2 | Load multi-frame TIFF | `volume.tif` (50 slices) | All 50 slices navigable via slider and buttons | ✅ Pass |
| 3 | Draw freehand on ILM | Click-drag on canvas (ILM active) | Continuous blue polyline committed on pointer-up | ✅ Pass |
| 4 | Draw polygon and close | 4 clicks + Enter | Closed polygon with semi-transparent fill | ✅ Pass |
| 5 | Add custom label | Type "NewLayer" → Add | New label appears with random color; becomes active | ✅ Pass |
| 6 | Delete label with annotations | Delete RPE after drawing | Confirm dialog shown; all RPE annotations removed across all slices | ✅ Pass |
| 7 | Zoom 200% + pan + check alignment | Wheel zoom, drag, click annotation | Annotation vertex stays on correct image pixel | ✅ Pass |
| 8 | Undo / redo | Draw → Undo → Redo | Annotation removed then restored correctly | ✅ Pass |
| 9 | Save As JSON | Click Save As | Native OS dialog opens; exported JSON matches schema v2 | ✅ Pass |
| 10 | Load JSON back | Load exported file | All annotations and labels restored; slice positions correct | ✅ Pass |
| 11 | Edit mode — move vertex | Drag vertex in edit mode | Vertex moves; undo restores original position | ✅ Pass |
| 12 | Magnifier glass | Enable tool + hover | Lens renders magnified image region; zoom slider changes magnification | ✅ Pass |
| 13 | Freehand Esc cancel | Start drag → press Esc | In-progress stroke discarded; no annotation committed | ✅ Pass |
| 14 | Show active layer only | Toggle "Show all" off | Only active-label annotations visible on canvas | ✅ Pass |

---

## 4. Section E — Reflection and next steps

### What went well
- **Freehand tool** — the pointer-event architecture produced a smooth, accurate stroke with no visible lag on tested hardware.
- **Label palette** — the toggle-based active-state UX (click to activate, click again to deactivate) tested very intuitively in reviews.
- **History reducer** — the pure-function `commit/undo/redo` pattern made it trivial to add new mutating operations without introducing bugs.
- **v2 JSON schema** — keying annotations by filename lets a single project hold multiple volumes without collisions.

### Challenges
- **Coordinate alignment** — ensuring `clientToImage` correctly handled scroll offset, device pixel ratio, and zoom simultaneously required careful testing at non-standard zoom levels.
- **Freehand fill** — detecting whether a freehand stroke is "sufficiently enclosed" to warrant a fill required a heuristic based on start/end proximity; edge cases (very short strokes) needed the 2-point minimum guard.
- **File System Access API** — browser support varies; the `showSaveFilePicker` path required an `AbortError` check so cancelled dialogs don't surface spurious error toasts.

### Sprint 3 targets (Phase 10)
- **AWS S3 file picker** — list and load volumes directly from a configured S3 bucket (no login required).
- **User manual** — annotated screenshots for every feature.
- **Formal test report** — 5+ documented test cases aligned to `ProjectInfo.txt` rows 97–103.
- **Performance profiling** — validate 60 fps pan/zoom on `512 × 1000 × 1024` volumes (N3).
- **Final report polish** — combine Sprint 1 + Sprint 2 sections into the full submission document.

---

## 5. Requirements coverage summary

| Requirement ID | Description | Status |
|----------------|-------------|--------|
| C1 | Load DICOM & TIFF (local) | ✅ Done — S3 deferred |
| C6 | Zoom in/out, cursor-centered | ✅ Done |
| C7 | Pan (hand tool) | ✅ Done |
| C8 | Annotations fixed under pan/zoom | ✅ Done |
| C10 | Magnifier glass with variable zoom | ✅ Done |
| A1 | Polygon annotation with fill | ✅ Done |
| A2 | Freehand annotation (critical) | ✅ Done |
| A3–A6 | Per-slice, multi-annotation, label link, image-space coords | ✅ Done |
| A7 | Move annotation vertices | ✅ Done |
| A8 | Delete annotation | ✅ Done |
| A10 | Undo / redo | ✅ Done |
| L1–L7 | Full label palette CRUD + reorder + visibility toggle | ✅ Done |
| E1–E4 | JSON export + documented schema | ✅ Done |
| D1, D3, D4 | Web-only, local file fallback, no login | ✅ Done |

---

## 6. How to run

```bash
# From repository root — starts frontend (port 5173) + backend (port 8787)
./run.sh
```

See root `README.md` for `setup`, `frontend`, `backend`, and `backend:migrate` sub-commands.

---

## 7. Glossary

| Term | Meaning |
|------|---------|
| OCT | Optical Coherence Tomography |
| Slice | One 2D B-scan frame from a volumetric stack |
| Volume | Ordered array of slices (TIFF or DICOM) |
| ILM | Inner Limiting Membrane |
| RPE | Retinal Pigment Epithelium |
| NFL | Nerve Fiber Layer |
| SPA | Single-page application |
| Image-space | Coordinate system of the original image pixels (independent of zoom/pan) |
| Draft | In-progress annotation not yet committed to history |
| CRUD | Create, Read, Update, Delete |

---

**End of Sprint 2 Technical Report (Sections C, D & E).**
