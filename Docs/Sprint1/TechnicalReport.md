# OCT Web Annotation Tool — Sprint 1 Technical Report

**Course:** ITECH3208 – Project 1  
**Institution:** Federation University Australia · Teaching Period 2026/05  
**Document:** Sprint 1 Technical Report (Sections A & B)  
**Version:** 1.0  
**Status:** Draft for submission  
**Related documents:** `Docs/ProjectVisionRoadmap.txt`, `Docs/Moduls.txt` (Phase 1)

---

## Document control

| Field | Value |
|--------|--------|
| Project | Web Annotation Tool (OCT volume annotation) |
| Sprint | Sprint 1 (Weeks 5–7 — Design & Initial Implementation) |
| Repository | OCT monorepo (`frontend/`, `backend/`, `Docs/`) |

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
2. [Section A — Project definition and scope](#2-section-a--project-definition-and-scope)  
   2.1 [Vision alignment](#21-vision-alignment)  
   2.2 [Problem context](#22-problem-context)  
   2.3 [Target users and needs](#23-target-users-and-needs)  
   2.4 [Full project goals (FYP) vs Sprint 1 scope](#24-full-project-goals-fyp-vs-sprint-1-scope)  
   2.5 [Sprint 1 objectives and deliverables (official)](#25-sprint-1-objectives-and-deliverables-official)  
   2.6 [Module-level requirements (internal checklist)](#26-module-level-requirements-internal-checklist)  
   2.7 [Out of scope for Sprint 1](#27-out-of-scope-for-sprint-1)  
   2.8 [Assumptions and constraints](#28-assumptions-and-constraints)  
3. [Section B — Design and architecture](#3-section-b--design-and-architecture)  
   3.1 [Design principles](#31-design-principles)  
   3.2 [High-level system architecture](#32-high-level-system-architecture)  
   3.3 [Logical component model](#33-logical-component-model)  
   3.4 [Technology stack](#34-technology-stack)  
   3.5 [Client-side volume and slice handling](#35-client-side-volume-and-slice-handling)  
   3.6 [Data concepts (Sprint 1)](#36-data-concepts-sprint-1)  
   3.7 [Interface structure (annotate view)](#37-interface-structure-annotate-view)  
   3.8 [Non-functional considerations](#38-non-functional-considerations)  
   3.9 [Risks, limitations, and mitigation](#39-risks-limitations-and-mitigation)  
4. [Implementation summary (Sprint 1 prototype)](#4-implementation-summary-sprint-1-prototype)  
5. [Testing approach (Sprint 1)](#5-testing-approach-sprint-1)  
6. [How to run the application](#6-how-to-run-the-application)  
7. [References and traceability](#7-references-and-traceability)  
8. [Glossary](#8-glossary)

---

## 1. Executive summary

This report satisfies **Sprint 1** coursework requirements for the **OCT Web Annotation Tool** FYP: **Section A (Project definition and scope)** and **Section B (Design and architecture)**. It aligns with the approved **Project Vision Statement & Roadmap** (`Docs/ProjectVisionRoadmap.txt`).

**Sprint 1 official goal (roadmap):** establish an **architectural base**, confirm the **technology stack**, and deliver a **working prototype** that can **load OCT-related image data** and **display it in the browser**, with **navigation across slices** where a multi-frame volume is loaded.

The implementation is a **single-page web application** with a **canvas-based viewer**, **toolbar**, and **label panel** shell. Slice data is represented as an **ordered array** in client application state; **Previous / Next** controls and a **slider** allow the user to move through the stack. The full client vision (freehand and polygon annotation, pan/zoom, JSON export, etc.) is **scheduled for Sprint 2 and later modules**; this report clearly separates **Sprint 1** from that broader scope.

---

## 2. Section A — Project definition and scope

### 2.1 Vision alignment

The agreed **vision** (from `ProjectVisionRoadmap.txt`) is:

> **WHO** medical imaging professionals and researchers who need OCT annotation off the desktop and in the cloud, **THE OCT Web Annotation Tool** is a **browser-based** application that provides a **cloud-oriented annotation experience**, including **freehand and keypoint** tools, a **customisable surface label palette** with ordering, **pan and zoom** on high-resolution volumes, and **JSON output**.

**Sprint 1** does **not** implement the full vision; it establishes the **viewer shell**, **loading path**, and **slice navigation** so that later sprints can attach annotation logic, export, and polish.

### 2.2 Problem context

OCT imaging produces **volumetric** data; clinical and research workflows require **accurate visualisation** of retinal layers (e.g. ILM, RPE) for:

- Clinical measures (e.g. layer thickness).  
- **Ground-truth** data for AI/ML.  
- Diagnosis and surveillance.

Many tools are **desktop-bound** and do not offer flexible **web** access or **pipeline-friendly** exports. A **lightweight, web-based** tool with **structured output** addresses collaboration and downstream processing needs.

### 2.3 Target users and needs

| User | Need | Benefit from the tool |
|------|------|------------------------|
| Ophthalmology researcher | Label surfaces on OCT volumes | Reproducible, exportable annotations |
| AI/ML engineer | Ground-truth training data | Structured, documented files |
| Clinical imaging technician | View and scan layers | Intuitive load-and-view workflow |

**Sprint 1** primarily supports the **technician/researcher** need to **load** and **browse** volumes in-browser.

### 2.4 Full project goals (FYP) vs Sprint 1 scope

The roadmap lists **MUST** goals for the **complete** product: volume viewing, line/polygon annotation, label palette (add/delete/reorder), **JSON export** with documented schema, etc. **Sprint 1** delivers the **foundation** only:

| Theme | Full FYP (roadmap / vision) | Sprint 1 focus |
|--------|------------------------------|----------------|
| Viewing | DICOM/TIFF volumes, 100–512 slices, large frames | Load & display; navigate slices in prototype |
| Annotation | Lines, polygons, freehand, labels | UI regions reserved; not required for Sprint 1 demo scope in this report |
| Export | JSON schema | Deferred to Sprint 2 / Phase 9 per module list |
| UX | Pan/zoom, undo | Later sprints |

### 2.5 Sprint 1 objectives and deliverables (official)

Per **§2.2 Sprint Roadmap** in `ProjectVisionRoadmap.txt`:

| Deliverable | Description | Definition of Done (summary) |
|-------------|-------------|-------------------------------|
| **Architecture document** | System architecture (e.g. MVC/component model), tech stack rationale, data model / ERD for annotations | Accepted by team; stack agreed |
| **OCT image loader (prototype)** | GUI to load and view slice(s); controls to scroll through stack | Test OCT file loads in target browser |
| **UI wireframes** | Tool panel, label panel, main annotation area — low-fidelity; client reviewed | Client feedback incorporated |
| **Product backlog (Sprint 1)** | Trello user stories, assignments, story points | PBIs as stories with acceptance criteria |
| **Technical report (Sprint 1)** | **Section A** + **Section B** | Submitted per unit deadline |

**Sprint goal (verbatim):** *Design architectural base, select the technology stack, and deliver a working prototype which will be able to load an image of OCT and display it within the browser.*

### 2.6 Module-level requirements (internal checklist)

Internal development tracking uses **Phase 1: Foundation** in `Docs/Moduls.txt`:

| ID | Requirement |
|----|----------------|
| 1.1 | Page layout: **canvas**, **toolbar**, **label panel** |
| 1.2 | **File picker** — user selects image from computer |
| 1.3 | **Display** selected image on canvas |
| 1.4 | **Data structure** for multiple slices (array) |
| 1.5 | **Previous / Next** + **slider** for navigation |
| 1.6 | Optional mock data generator (may be deferred if real volumes used) |

### 2.7 Out of scope for Sprint 1

- Full **annotation toolset** (lines, polygons, freehand) as production-ready features.  
- **Pan/zoom** and **annotation persistence under transform** (Sprint 2 emphasis in roadmap).  
- **JSON export** module and **schema** publication (later phase).  
- **S3** or full **cloud** deployment story.  
- Formal **5+ automated test cases** with coverage reports (Sprint 2 / QA lead responsibility).

### 2.8 Assumptions and constraints

- **Client communication:** MS Teams; async updates; sprint reviews (see roadmap §2.4).  
- **JSON** confirmed as export format for the **project**; Sprint 1 does not require export implementation.  
- **Browsers:** vision names Firefox, Safari, Edge; development may prioritise Chromium first for the prototype.  
- **Volume formats:** roadmap mentions DICOM/TIFF at scale; prototype may use **single images** or **stack** paths as implemented in the repository.

---

## 3. Section B — Design and architecture

### 3.1 Design principles

1. **Web-first:** no install for end users; runs in modern browsers.  
2. **Separation of concerns:** UI (React) vs decode (**Web Workers**) vs persistence (API / IndexedDB as applicable).  
3. **Image-space fidelity:** coordinates for future annotations should map to **original pixel space** (extended in later phases).  
4. **Incremental delivery:** Sprint 1 proves **load + view + navigate**; features attach to the same shell.

### 3.2 High-level system architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Browser (SPA)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Toolbar    │  │   Canvas      │  │  Label panel     │  │
│  │  Navigation  │  │  (raster)       │  │  (shell / future)│  │
│  └──────┬───────┘  └───────┬────────┘  └────────┬─────────┘  │
│         │                  │                     │           │
│         └──────────────────┼─────────────────────┘           │
│                            │                                 │
│                   React application state                     │
│         (slice index, volume metadata, UI mode)               │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │ Web Workers (decode)       │   Optional: REST API
              │ TIFF / DICOM slice frames    │   (backend/)
              └──────────────┬──────────────┘
                             │
                    IndexedDB / project storage (volume blob cache)
```

The **Sprint 1** prototype emphasises the **browser SPA**, **canvas**, and **stateful slice navigation**. Worker-based decoding and storage support **multi-slice** files without blocking the UI thread.

### 3.3 Logical component model

| Layer | Responsibility |
|-------|----------------|
| **Pages / routes** | Project list; **annotate** workspace per project |
| **Viewer (`OctCanvas` and related)** | Render current slice; host zoom/pan in later sprints; expose image-space helpers |
| **Toolbar** | File actions, slice **Prev/Next**, optional tools (full toolset in later sprints) |
| **Label panel** | Shell for future **surface label palette** |
| **Volume pipeline** | File → buffer → worker decode → `ImageBitmap` / RGBA → cache by slice index |
| **Backend (optional)** | CRUD for projects; Prisma + API — parallel track to viewer |

### 3.4 Technology stack

The **preliminary** stack in `ProjectVisionRoadmap.txt` listed React or vanilla JS, Python Flask/FastAPI, NumPy/Pillow/pydicom. The **current** implementation aligns as follows:

| Category | Technology | Role in Sprint 1 |
|----------|------------|-------------------|
| **Frontend** | **React**, **TypeScript**, **Vite** | SPA, components, routing |
| **Rendering** | **HTML5 Canvas** | 2D raster display |
| **Workers** | **Web Workers** (`tiffWorker`, `dicomWorker`) | Off-thread decode for stacks |
| **Image decode (client)** | TIFF / uncompressed DICOM pixel paths | Slice extraction into drawable buffers |
| **Backend** | **Node**, **Prisma** (see `backend/`) | Projects API; optional for pure client demo |
| **Local persistence** | **IndexedDB** (volume blobs per project) | Reload last file in session |
| **Version control** | **Git** (e.g. GitHub) | As per unit requirements |
| **PM** | **Trello** | Backlog and sprint PBIs |

**Rationale:** React + Canvas matches the vision’s browser GUI; workers keep the UI responsive for **large** stacks; JSON remains the agreed **export** medium for later phases.

### 3.5 Client-side volume and slice handling

- A **volume** is represented as **slice count** + **width/height** + per-slice **frames** (bitmap or RGBA).  
- **Slice index** selects which frame is drawn.  
- **Navigation** updates index and requests decode if the slice is not cached.  
- This satisfies the Sprint 1 **prototype** requirement: *scroll through slices* in the browser.

### 3.6 Data concepts (Sprint 1)

| Concept | Description |
|---------|-------------|
| **Project** | Container for user workflow (name, id); may reference cached volume |
| **Slice index** | Integer in `[0, N − 1]` |
| **Frame** | `{ width, height, bitmap | rgba }` for display |
| **Annotation (FYP)** | Future: labelled geometric entities in image coordinates — **ERD-level** detail belongs to Sprint 2 design |

### 3.7 Interface structure (annotate view)

- **Top:** project/file actions, optional loading indicator  
- **Slice bar:** “Slice *i* / *N*”, **Previous**, **Next**, **slider** when `N > 1`  
- **Main:** **Canvas** region (dominant)  
- **Side:** **Label panel** (structure for future ILM/RPE/NFL and custom labels)

Wireframes (low-fidelity) should be attached separately per coursework; layout matches this structure.

### 3.8 Non-functional considerations

- **Performance:** worker decode; bounded cache size for slices to avoid memory exhaustion on large stacks.  
- **Security:** local files via file picker; no arbitrary server-side path access in the prototype.  
- **Accessibility:** semantic regions and labels on key controls (ongoing).  
- **Timezone / client:** roadmap notes US East Coast client — meeting scheduling outside raw architecture.

### 3.9 Risks, limitations, and mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Encapsulated DICOM / JPEG2000 not supported | Some clinical files won’t load | Document limitation; use uncompressed/TIFF per worker docs |
| Large volumes (512×1000×1024) | Memory / perf | Prefetch neighbours; trim cache; future profiling |
| Scope creep into Sprint 2 | Miss Sprint 1 review | Freeze Sprint 1 demo to **load + navigate + layout** |

---

## 4. Implementation summary (Sprint 1 prototype)

What reviewers should see in the **Sprint 1** demo (aligned with §2.5):

1. **Layout:** canvas + toolbar + label panel visible.  
2. **Load:** user selects a file (supported format per README).  
3. **Display:** image draws on canvas.  
4. **Multi-slice:** if the file is a stack, **N > 1** and navigation works.  
5. **Navigation:** Previous, Next, slider update the visible slice and index.

The repository may contain **additional** features from ongoing development; for **Sprint 1 marking**, the team should **demonstrate** the official prototype behaviours above and cite this report.

---

## 5. Testing approach (Sprint 1)

| Type | Scope |
|------|--------|
| **Manual** | Load known good file; verify display; step through all slices; edge cases: first/last slice |
| **Cross-browser** | At least one **target** browser per Definition of Done |
| **Automated** | Not mandatory for Sprint 1 roadmap item; Sprint 2 expands QA |

---

## 6. How to run the application

From the repository root:

```bash
./run.sh
```

- Frontend: `http://localhost:5173`  
- Backend API (if used): `http://localhost:8787`  

See root **`README.md`** for variants (`./run.sh frontend`, build, migrations).

---

## 7. References and traceability

| Document | Purpose |
|----------|---------|
| `Docs/ProjectVisionRoadmap.txt` | Vision, users, sprint goals, deliverables, timeline |
| `Docs/Moduls.txt` | Phased module checklist (Phase 1 = Sprint 1 foundation) |
| `Docs/ProjectInfo.txt` | Client contract detail (if present) |
| `README.md` | Run instructions and stack summary |

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **OCT** | Optical coherence tomography |
| **Slice** | One 2D B-scan frame from a volume |
| **Volume** | Ordered stack of slices |
| **SPA** | Single-page application |
| **PBI** | Product backlog item |

---

**End of Sprint 1 Technical Report (Sections A & B).**

*Sprint 2 will extend Sections C–E as required by the unit guide and final submission.*
