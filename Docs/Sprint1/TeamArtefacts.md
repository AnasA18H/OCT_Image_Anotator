# Sprint 1 — team artefacts

Checklist for **Sprint 1** submission. Fill in names, repo URL, and dates where marked *(TODO)*.

---

## 1. Repository

| Item | Location / note |
|------|------------------|
| Source | This repo — root URL *(TODO: GitHub/GitLab link)* |
| Default branch | *(TODO: e.g. `main`)* |
| Licence / visibility | *(TODO)* |

---

## 2. Project & initial role assignments

**Project:** OCT Volume Annotation Tool  

The following five roles were assigned **at project kick-off**. They describe **ownership across the full coursework**; Sprint 1 only covers foundation items (see §4). Later sprints map more heavily to annotation tools, storage, export, and QA.

### Student 1 — GUI & Visualization Lead

- Owns the **graphical user interface**, with emphasis on **loading and rendering** OCT volumes.
- Integrates libraries/paths for **medical image formats** (e.g. NiBabel or similar — align with what the stack actually uses: see `Docs/Moduls.txt` and workers under `frontend/src/workers/`).
- Ensures users can **scroll through slices** smoothly and the **canvas** shows retinal structures clearly.
- Implements **visual feedback** for annotations (lines, polygons), drawn **accurately**, and supports **selection / modification** in coordination with the annotation lead.
- Strong focus on **UX** within rendering constraints.

### Student 2 — Annotation Tools & Interaction Lead

- Owns **core annotation features**: **line-based** annotations and **closed polygons** on the OCT viewer.
- Handles **mouse/pointer events**, **control points**, and algorithms to **draw and finalize** shapes.
- Works with the GUI lead so tools **integrate cleanly** with the viewer.
- **Surface ordering:** implements behaviour so users can **edit the order of retinal surfaces**; annotations **layer and display** correctly when order changes.
- Ensures **add/remove surface labels** triggers correct **reordering** of visual elements.

### Student 3 — Data Structures & Storage Lead

- Designs the **backend data model** for all annotation data.
- Delivers a **documented** structure (JSON and/or lightweight DB) that other apps can consume, per client expectations.
- Defines how **retinal surfaces** are represented (properties, coordinates, **ordering**).
- Keeps storage **consistent** when the GUI adds, removes, or reorders surfaces.
- **Export:** utilities to export annotated data in a **standard form** and documentation for **parsing saved files**.

### Student 4 — Application Architecture & Integration Lead

- **Technical backbone:** connects **frontend** to **data models** and storage.
- Designs **application flow** so GUI and data layer communicate efficiently.
- Manages **application state** (tool selection, annotation edits → correct updates).
- **Dependencies & stack:** Python version, GUI framework, imaging libraries — keep the stack coherent *(note: this repo’s primary UI is web/React; align wording with your chosen architecture).*
- **Main integration loop** and bringing **modules together** into one runnable application.

### Student 5 — Testing, Quality Assurance & Documentation Lead

- **Testing strategy:** unit tests for data models; integration tests for annotation tools.
- Verifies lines/polygons **persist correctly**, **surface ordering** survives sessions, and **loading volumes** does not crash the app.
- **Coverage** reporting where applicable; **at least five** documented test cases (inputs + expected outcomes).
- **User manual:** installation, dependencies, walkthrough of core features so **external users** can run the tool.

### Names *(fill in)*

| # | Role | Student name |
|---|------|----------------|
| 1 | GUI & Visualization Lead | *(TODO)* |
| 2 | Annotation Tools & Interaction Lead | *(TODO)* |
| 3 | Data Structures & Storage Lead | *(TODO)* |
| 4 | Application Architecture & Integration Lead | *(TODO)* |
| 5 | Testing, QA & Documentation Lead | *(TODO)* |

---

## 3. Process artefacts

| Artefact | Where / status |
|----------|----------------|
| Sprint 1 scope | `Docs/Sprint1/` + `Docs/Moduls.txt` Phase 1 |
| Trello board | Web-app Image Annotation Tool — user stories on board (URL in repo README or here *TODO*) |
| Showcase outline | `Docs/Sprint1/ShowcaseSlides.md` |
| Technical report | `Docs/Sprint1/TechnicalReport.md` |
| Meeting notes | *(TODO: link or `Docs/team/meetings/` if you add it)* |
| ADRs / decisions | *(TODO: optional short log)* |

---

## 4. Definition of Done (Sprint 1)

Sprint 1 maps most directly to **foundation** work (layout, load, display, multi-slice navigation). Tie demo and report to Phase 1 in `Docs/Moduls.txt`; full role scope spans later modules.

- [ ] Layout: canvas + toolbar + label panel visible in annotate flow.  
- [ ] User can choose a local file and see it on the canvas.  
- [ ] Multiple slices represented; user can move between slices with controls + slider when applicable.  
- [ ] Showcase + technical report + this artefact list updated for submission.  

---

## 5. Handover

- Onboarding: read root `README.md`, then `Docs/Sprint1/TechnicalReport.md`.  
- Full product roadmap: **`Docs/Moduls.txt`** (not part of Sprint 1-only narrative).

---

**Team name / course code:** *(TODO)*  
**Submission date:** *(TODO)*
