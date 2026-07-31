# Sprint 1 only — scope & deliverables

**Project:** Web / OCT Image Annotation Tool · **Unit:** ITECH3208 Project 1  
**Sprint 1 window:** Weeks **5–7** (showcase / reports per your timetable, e.g. Week 8)  
**Official name in roadmap:** *Design & Initial Implementation*

This page is **only Sprint 1**. It does **not** describe Sprint 2 (full annotation, JSON export, user manual, etc.).

---

## Sprint 1 goal (single sentence)

**Design the architectural base, select the technology stack, and deliver a working prototype that can load an OCT-related image and display it in the browser** (with navigation through slices when the file is a stack).

*Source: `Docs/ProjectVisionRoadmap.txt` §2.2 Sprint 1.*

---

## Official Sprint 1 deliverables (must complete)

| # | Deliverable | Definition of Done (summary) |
|---|-------------|------------------------------|
| 1 | **Architecture document** | Diagram / component view; tech stack justified; team agrees. |
| 2 | **OCT image loader (prototype)** | GUI loads a test OCT-related file; image visible in browser; can move through slices if multi-slice. |
| 3 | **UI wireframes** | Tool area, label panel, main viewer — low-fidelity; **client reviewed**; revisions if needed. |
| 4 | **Product backlog (Sprint 1)** | Trello: user stories, acceptance criteria, owners, story points. |
| 5 | **Technical report (Sprint 1)** | **Section A** (definition & scope) + **Section B** (design & architecture); submitted per unit. |

---

## What “done” looks like for the prototype

- [ ] Layout: **canvas** + **toolbar** + **label panel** (shell is fine).  
- [ ] **File picker** → user selects a file from disk.  
- [ ] **Image draws** on the canvas.  
- [ ] **Multi-slice** data represented; **Previous / Next / slider** when *N* > 1.  
- [ ] Works in **at least one** target browser with a **test file** you document.

---

## Not Sprint 1 (do not promise for Sprint 1 submission)

- Freehand / full polygon-line **annotation engine** as final product  
- **Pan & zoom** with annotations locked (Sprint 2 emphasis in roadmap)  
- **JSON export** + schema in README  
- Full **user manual**, formal **5+ automated tests**  
- **S3 / cloud** picker  

Put those in **Product backlog** / Sprint 2 on Trello.

---

## Documents to use (all under `Docs/Sprint1/`)

| Use | File |
|-----|------|
| **Technical report** | [TechnicalReport.md](./TechnicalReport.md) |
| **Slides (PPT text)** | [ShowcaseSlides.md](./ShowcaseSlides.md) |
| **Team artefacts** | [TeamArtefacts.md](./TeamArtefacts.md) |
| **This page** | [Sprint1-Only.md](./Sprint1-Only.md) |

**Vision & timeline (full project):** `Docs/ProjectVisionRoadmap.txt`  
**Internal module checklist:** `Docs/Moduls.txt` — **Phase 1** = Sprint 1 foundation.

---

## Trello — what to add where

**Product backlog:** Sprint 2+ only (e.g. **freehand**, JSON export, full user manual). Delete placeholder “Hello” cards.

**Sprint 1 To Do** (everything Sprint 1 not started yet):

- Set up **repo & dev environment** (everyone can run the app).  
- **Open OCT / image file** in the web UI (file picker → display).  
- **Navigate slices** (Previous, Next, slider, “Slice i / N”) for multi-slice files.  
- **Architecture** story (diagram + tech stack in team doc).  
- **Wireframes** (tool panel, label panel, main canvas) + client review.  
- **Technical report** A + B (submit Moodle).  
- **Showcase slides** + demo rehearsal.  
- **Team artefacts** (roles, repo link, paste **Trello board URL**).  
- **QA smoke test** (one browser, test file, screenshots or notes).  
- **Board hygiene** (each card: owner, story points, checklist acceptance criteria).

**Sprint 1 In Progress:** only cards someone is working on **today** (few cards).

**Sprint 1 Review / Testing:** work finished, needs peer/PO check or test run.

**Sprint 1 Done:** accepted, checklist complete.

---

*End of Sprint 1-only summary.*
