# Sprint 2 — Showcase Slides (Presentation Content)

**Purpose:** Copy each Slide block into PowerPoint (one slide per section). **Title** = slide title; bullets = body. **Speaker notes** = presenter notes (Notes pane).

**Course:** ITECH3208 · **Project:** OCT Web Annotation Tool · **Sprint:** 2 (Weeks 8–12)

**Source alignment:** `Docs/Sprint2/TechnicalReport.md`, `Docs/Moduls.txt` (Phases 4–9)

---

## Slide 1 — Title

**Title:** OCT Web Annotation Tool
**Subtitle:** Sprint 2 — Full Annotation Engine

**Bullets:**
- ITECH3208 – Project 1
- Federation University Australia · TP 2026/05
- *[Insert presentation date]*

**Team:**
- Abdulla Hamad Salem Alameri (Scrum Master)
- Nehayan Abdulla Aljaberi (Product Owner)
- Mohammed Alketbi · Ameera Alkhanbashi · Omran Almarzooqi

**Speaker notes:** This sprint took us from a viewer prototype to a fully functional annotation tool. We delivered every drawing mode, the label palette, zoom/pan, edit mode, and JSON export.

---

## Slide 2 — Sprint 2 Goals vs Outcomes

**Title:** What we set out to build — and what we delivered

**Table:**

| Goal | Delivered? |
|------|-----------|
| All drawing tools (point, line, polygon, freehand) | ✅ Yes |
| Surface label palette with active state, CRUD, reorder | ✅ Yes |
| Cursor-centered zoom + pan + magnifier glass | ✅ Yes |
| Edit mode: move vertices, delete annotations | ✅ Yes |
| Undo / Redo (100-step history) | ✅ Yes |
| JSON Save As / Load + cloud save (Ctrl+S) | ✅ Yes |
| AWS S3 file picker | 🔜 Sprint 3 |

**Speaker notes:** We completed Phases 4–9 from our module checklist. S3 is the only planned feature pushed to Sprint 3, which was agreed in the Sprint 2 plan.

---

## Slide 3 — Drawing Tools Deep Dive

**Title:** Four annotation tools, one canvas

**Bullets:**

- 🔵 **Point** — single click places a labeled dot in image-space coordinates
- ➖ **Line** — two clicks define a straight segment; live rubber-band preview between clicks
- 🔷 **Polygon** — click to accumulate vertices; double-click / Enter / Finish button closes the shape with a semi-transparent fill
- ✏️ **Freehand** *(client critical)* — click-drag records a continuous polyline; release commits; enclosed strokes get a background fill; **Esc** cancels mid-stroke

**Key design decision:** All coordinates are stored in **original image pixels** — zoom and pan never affect saved data.

**Speaker notes:** Freehand was the client's top priority. The pointer-event approach samples every mouse position during drag, giving a perfectly smooth stroke. The Esc-cancel was added after team review — essential for correcting mistakes.

---

## Slide 4 — Label Palette: How It Works

**Title:** The surface label palette — the control hub for all annotations

**Bullets:**

**Default labels (pre-loaded):**
- ILM — Inner Limiting Membrane `(blue)`
- RPE — Retinal Pigment Epithelium `(orange-red)`
- NFL — Nerve Fiber Layer `(violet)`

**Active state:**
- Click a label → it becomes *active*; all new shapes inherit its color
- Click the active label again → deactivates (toggle behavior)
- Active label renders brighter on canvas; inactive labels are dimmed

**Add / Delete / Reorder:**
- Type a name → Add → random saturated color assigned instantly
- Delete shows a confirmation dialog; removes the label AND all its annotations across every slice (cross-slice cleanup)
- Up / Down buttons reorder labels (controls visual z-order)

**Show All Layers toggle:**
- ON: all labels' annotations visible simultaneously
- OFF: only the active label's annotations rendered — great for focused editing

**Speaker notes:** The toggle-based active state was a deliberate UX choice — you can click a label to draw with it, then click again to "release" it. This was preferred over a separate checkbox in user testing.

---

## Slide 5 — Zoom, Pan & Magnifier

**Title:** Navigating large OCT volumes at any magnification

**Bullets:**

**Zoom (three entry points — all cursor-centered):**
- Toolbar `+` / `–` buttons
- Mouse wheel / trackpad scroll
- Trackpad pinch gesture
- Range: 0.1× to 32×

**Pan:**
- Hand tool → click and drag to scroll the viewport
- Annotations stay perfectly aligned — coordinates are image-space, not screen-space

**Magnifier Glass:**
- Floating circular lens follows the cursor
- Renders a magnified sub-region of the current slice as an overlay
- Lens zoom: 1×–10× via slider or `+` / `–` buttons
- Zero impact on stored viewport state — purely visual

**Speaker notes:** The key engineering challenge was keeping annotations aligned as zoom and pan change. The `clientToImage()` helper converts any screen click to image pixels accounting for zoom, pan offset, and device pixel ratio.

---

## Slide 6 — Edit Mode & Undo/Redo

**Title:** Fix mistakes — move, delete, and undo

**Bullets:**

**Edit Mode (pencil icon):**
- Click near any vertex → selects it (highlighted)
- Click on a stroke or polygon fill → selects the whole annotation
- Drag a selected vertex → moves it to the new position (one history step)
- Delete / Backspace → removes the selected annotation from the current slice
- Esc → deselects without deleting

**Undo / Redo — 100-step history:**
- Pure-function reducer: every action is a `commit(prevState → nextState)`
- Ctrl+Z / Cmd+Z → Undo
- Ctrl+Shift+Z / Cmd+Shift+Z → Redo
- Toolbar Undo / Redo buttons available
- History resets on project switch; persists across slice navigation

**Speaker notes:** The history reducer pattern made adding undo trivially safe — we just wrapped every state mutation in a `commit()` call. The 100-step cap prevents memory issues on long sessions.

---

## Slide 7 — Save, Load & JSON Schema

**Title:** Saving and sharing annotations — the JSON workflow

**Bullets:**

**Three save paths:**
1. **Ctrl+S / Cloud Save** — pushes annotations to the backend database; merges with other files in the same project
2. **Save As** — opens the native OS "Save As" dialog (File System Access API); user chooses filename and folder
3. **Load** — picks a `.json` file; restores all annotations and labels; warns if project name mismatches

**JSON v2 schema (key fields):**
```
version: 2
projectName: "Retina Study A"
labels: [ { id, name, color } ]
files: {
  "oct-volume.tif": {
    "0": [ { id, labelId, type, points: [{x,y}] } ],
    "1": [ ... ]
  }
}
```

**Annotation types:** `point` · `line` · `polygon` · `freehand`
**Coordinate unit:** original image pixels (float precision)

**Speaker notes:** The v2 schema uses a `files` envelope so one project can hold annotations for multiple volume files without collision. v1 files (from earlier builds) are auto-migrated on load.

---

## Slide 8 — Live Demo Script

**Title:** Demonstration

**Presenter steps:**
1. Open app → navigate to project
2. Load an OCT volume (TIFF or DICOM)
3. Show **freehand** drawing on the ILM label
4. Switch to **polygon** mode → draw + close with Enter
5. Add a **custom label** → draw with it
6. **Delete** a label → show cross-slice cleanup confirmation
7. **Zoom in** with wheel → **pan** → confirm annotation stays aligned
8. **Edit mode** → drag a vertex → **Undo** → vertex returns
9. **Save As** → show native OS dialog → open the JSON file in a text editor
10. **Load** the JSON back → annotations restore

**Speaker notes:** Rehearse the demo path with the exact test file. Keep the magnifier glass as a bonus at the end. Have a backup recording in case of live issues.

---

## Slide 9 — Testing Results

**Title:** Testing — 14 test cases, 14 passing

**Table (abbreviated):**

| # | Test | Result |
|---|------|--------|
| 1 | Load DICOM, display first slice | ✅ Pass |
| 2 | Navigate 50-slice TIFF | ✅ Pass |
| 3 | Freehand stroke committed on pointer-up | ✅ Pass |
| 4 | Polygon closed with Enter + semi-transparent fill | ✅ Pass |
| 5 | Add custom label with random color | ✅ Pass |
| 6 | Delete label → cross-slice cleanup | ✅ Pass |
| 7 | Zoom 200%, pan, annotation stays aligned | ✅ Pass |
| 8 | Undo / Redo round-trip | ✅ Pass |
| 9 | Save As → native OS dialog → valid JSON | ✅ Pass |
| 10 | Load JSON → full restore | ✅ Pass |

**Speaker notes:** Full 14-test table is in the Technical Report Section D. All tests pass. Cross-browser formal testing (Firefox, Safari) is scheduled for Sprint 3.

---

## Slide 10 — What's Next / Sprint 3

**Title:** Sprint 3 — Final polish and delivery

**Bullets:**

**Remaining for Sprint 3 (Phase 10):**
- ☁️ **AWS S3 file picker** — list and load volumes from S3 without login
- 📖 **User manual** — annotated screenshots for every feature
- 🧪 **Formal test report** — 5+ tests aligned to client spec (ProjectInfo rows 97–103)
- ⚡ **Performance profiling** — validate 60 fps on 512-slice × 1000×1024 volumes
- 📝 **Final combined report** — merge Sprint 1 + Sprint 2 into full submission

**Deliverables due (Week 13):**
- Working web app (GitHub repo) ✅ in progress
- README with setup + JSON schema ✅ updated
- User manual 🔜
- Test results document 🔜
- Final technical report 🔜
- Sprint 2 demo (in-class) ← **today**

**Speaker notes:** Sprint 2 completes the core product. Sprint 3 is about hardening, documentation, and the one remaining client feature (S3). We are on track for Week 13 final submission.

---

## Appendix — Screenshot checklist (for slide designer)

Add screenshots to relevant slides:

- [ ] Slide 3 — Canvas with freehand + polygon annotation visible
- [ ] Slide 4 — Label palette showing ILM active (highlighted row) + toggle switch
- [ ] Slide 5 — Magnifier glass lens on zoomed-in OCT slice
- [ ] Slide 6 — Edit mode with a selected vertex (highlighted dot)
- [ ] Slide 7 — Native OS Save As dialog open
- [ ] Slide 8 — Final annotated canvas ready for demo

---

*End of Sprint 2 slide content. Build slides in PowerPoint using your team template.*
