# Sprint 1 — PowerPoint slide deck (content only)

**Purpose:** Copy each **Slide** block into PowerPoint (one slide per section). **Title** = slide title; bullets = body. **Speaker notes** = presenter notes (optional Notes pane).

**Course:** ITECH3208 · **Project:** OCT Web Annotation Tool · **Sprint:** 1 (Weeks 5–7)

**Source alignment:** `Docs/ProjectVisionRoadmap.txt` (vision, Sprint 1 goal, deliverables)

---

## Slide 1 — Title

**Title:** OCT Web Annotation Tool  
**Subtitle:** Sprint 1 — Design & Initial Implementation  

**Bullets:**
- ITECH3208 – Project 1  
- Federation University Australia · TP 2026/05  
- *[Insert presentation date]*

**Footer (optional):** Team + client-facing project name  

**Speaker notes:** State that this deck covers Sprint 1 only; full FYP spans two sprints.

---

## Slide 2 — Team & roles

**Title:** Project team  

**Bullets:**
- **Scrum Master:** Abdulla Hamad Salem Alameri (30455692)  
- **Product Owner:** Nehayan Abdulla Aljaberi (30455840)  
- **Developer (Frontend):** Mohammed Alketbi (30455709)  
- **Developer (Backend):** Ameera Alkhanbashi (30455837)  
- **Developer (UI/UX & Testing):** Omran Almarzooqi (30455711)  

**Speaker notes:** One sentence each on how roles supported Sprint 1 (architecture, prototype, wireframes, backlog).

---

## Slide 3 — Agenda

**Title:** Today’s agenda  

**Bullets:**
1. Vision & problem (why this project)  
2. Sprint 1 goal & deliverables (official)  
3. Architecture & technology choices  
4. Live prototype demo  
5. Wireframes & backlog *(brief)*  
6. Next steps / Sprint 2 preview  
7. Q&A  

---

## Slide 4 — Client & communication

**Title:** Client engagement  

**Bullets:**
- **Client:** Eric (US East Coast) — meetings scheduled for timezone alignment  
- **Channels:** Microsoft Teams (unit requirement); email / async updates  
- **Ceremonies:** Sprint planning, sprint review (demo + feedback), ad-hoc clarifications  
- **Outcome:** Vision statement, JSON export preference, feature priorities (e.g. freehand, pan/zoom) captured in roadmap  

**Speaker notes:** Keep brief; shows professional project governance.

---

## Slide 5 — Vision (one sentence)

**Title:** Product vision  

**Bullets:**
- **For** medical imaging professionals and researchers who need OCT annotation in the **browser** (not locked to desktop)  
- **Our product** is a **web-based** OCT annotation application  
- **That provides** slice viewing, annotation tools, **surface label palette**, **pan/zoom**, and **JSON** output for downstream pipelines  

**Speaker notes:** Read vision calmly; Sprint 1 is the first step toward this vision, not the full product.

---

## Slide 6 — Problem context

**Title:** Why OCT annotation in the web?  

**Bullets:**
- OCT volumes need **accurate layer boundaries** (e.g. ILM, RPE) for:  
  - Clinical measures (e.g. thickness)  
  - **AI/ML ground truth**  
  - Diagnosis and surveillance  
- Many tools are **desktop-only** and export data that is **hard to reuse** in research pipelines  
- Need: **lightweight, web-accessible** tool with **structured, documented** output  

---

## Slide 7 — Target users

**Title:** Who benefits?  

**Table (or three bullets per row):**

| User | Need | Benefit |
|------|------|---------|
| Researcher | Label surfaces on volumes | Reproducible, exportable work |
| AI/ML engineer | Training labels | Structured files |
| Imaging technician | View / scan layers | Intuitive load-and-view |

---

## Slide 8 — Full project goals (MUST / SHOULD / COULD)

**Title:** Project goals — priority overview  

**Bullets:**
- **MUST:** View volume in browser; line/polygon annotations; **extendable label palette**; create/delete/reorder surfaces; **JSON export** + documented schema  
- **SHOULD:** Undo/redo  
- **COULD:** Keyboard shortcuts; batch export  

**Callout box:** *Sprint 1 delivers the foundation (viewer + load + navigate); MUST items are phased across Sprint 1 & 2.*

---

## Slide 9 — Sprint 1 official goal

**Title:** Sprint 1 goal (Weeks 5–7)  

**Bullets:**
- **Design** the architectural base  
- **Select** and justify the technology stack  
- Deliver a **working prototype**: **load OCT-related image data** → **display in the browser**  
- Support **scrolling through slices** where a multi-slice volume is loaded  

**Quote (optional, small font):** From approved roadmap — *“load an image of OCT and display it within the browser.”*

---

## Slide 10 — Sprint 1 deliverables vs Definition of Done

**Title:** Sprint 1 deliverables  

**Table:**

| Deliverable | Definition of Done (summary) |
|-------------|-------------------------------|
| Architecture document | Stack agreed; component/MVC-style view documented |
| OCT loader prototype | Test file loads; slice navigation works in browser |
| UI wireframes | Tool, label, canvas areas — client reviewed |
| Product backlog | Trello stories + acceptance criteria + ownership |
| Technical report | **Section A** (scope) + **Section B** (architecture) |

---

## Slide 11 — What we implemented (prototype summary)

**Title:** Prototype — what works today  

**Bullets:**
- **Layout:** Main **canvas** + **toolbar** + **label panel** (shell for future tools)  
- **Load:** Local **file picker** → volume or single image  
- **Display:** Raster drawn on **HTML5 Canvas**  
- **Data:** Slices held as an **ordered array** in application state  
- **Navigate:** **Previous**, **Next**, **slider** when slice count > 1  
- **Optional:** Worker-based decode for **TIFF / DICOM** stacks *(as implemented in repo)*  

**Speaker notes:** Align spoken claims with what you will show live; do not claim Sprint 2 features unless demoing them explicitly as “work in progress.”

---

## Slide 12 — High-level architecture (diagram)

**Title:** System architecture (conceptual)  

**Bullets:**
- **Browser SPA** (React + TypeScript + Vite)  
- **Canvas** = 2D viewer; **application state** = current slice index, volume metadata  
- **Web Workers** = decode TIFF/DICOM without freezing UI *(where used)*  
- **IndexedDB** = cache volume blob per project *(where enabled)*  
- **Backend** = optional REST API for projects *(parallel track)*  

**Visual:** Insert simplified diagram from Technical Report §3.2 (paste as image on slide).

---

## Slide 13 — Technology stack

**Title:** Technology stack  

**Table:**

| Layer | Choice | Why it matters |
|-------|--------|----------------|
| UI | React, TS, Vite | Component model, fast dev, type safety |
| Viewer | HTML5 Canvas | Medical raster + future annotation overlay |
| Decode | Web Workers + slice decoders | Responsive UI on large stacks |
| Export (later) | JSON | Client-confirmed; pipeline-friendly |
| PM / VC | Trello, GitHub | Backlog + version control |

**Footnote:** Preliminary roadmap mentioned Python/Flask for processing; **current** front-loaded stack is web-native; backend may still use Node/Prisma for CRUD.

---

## Slide 14 — UI structure (wireframe reference)

**Title:** User interface layout  

**Bullets:**
- **Top / chrome:** Project name, file actions, loading state  
- **Slice bar:** “Slice *n* / *N*”, step controls, range slider  
- **Centre:** Large **canvas** (primary focus)  
- **Side:** **Label / surface panel** (structure for ILM, RPE, NFL, custom — full behaviour in later sprints)  

**Visual:** Placeholder: *“Insert approved wireframe figure here.”*

---

## Slide 15 — Live demo

**Title:** Demonstration  

**Bullets (script for presenter):**
1. Open application → navigate to **annotate** / project view  
2. **Load** a known-good OCT file (TIFF stack or DICOM or single image)  
3. Show **image on canvas** and **dimensions / slice label**  
4. Use **Next** → **Previous** → **slider** to change slices  
5. Confirm **slice index** updates correctly at ends of stack  

**Speaker notes:** Rehearse with the exact file; have a backup recording if live demo fails.

---

## Slide 16 — Testing (Sprint 1)

**Title:** Verification approach — Sprint 1  

**Bullets:**
- **Manual:** Load → display → navigate entire stack → edge cases (first/last slice)  
- **Browser:** At least one **target** browser per course DoD  
- **Automated tests:** Expanded in Sprint 2 per QA plan  

---

## Slide 17 — Risks & limitations

**Title:** Risks & current limitations  

**Bullets:**
- Some DICOM encodings **not** supported (e.g. compressed); uncompressed / TIFF paths preferred  
- Very large volumes → memory/performance — **caching** and **worker** decode mitigate  
- **Scope discipline:** Sprint 1 success = **architecture + working loader/viewer**; resist feature creep  

---

## Slide 18 — Roadmap — what’s next (Sprint 2 teaser)

**Title:** After Sprint 1  

**Bullets:**
- **Sprint 2 (Weeks 8–12):** Full annotation engine, **pan/zoom**, **freehand**, surface palette, **JSON export**, test suite, user manual, final report  
- Aligns with client priorities: **pan/zoom** and **freehand** called out in roadmap  

**Speaker notes:** One slide only — detail belongs in Sprint 2 planning.

---

## Slide 19 — Summary

**Title:** Sprint 1 summary  

**Bullets:**
- **Delivered:** Architecture + stack + **load/display/navigate** prototype + wireframes/backlog per course  
- **Aligned** with client vision and JSON export direction  
- **Ready** for client review and Sprint 2 kickoff  

---

## Slide 20 — Q&A

**Title:** Thank you / Questions  

**Bullets:**
- Contact: *[email / Teams]*  
- Repository: *[GitHub link]*  
- Full vision & roadmap: documented in `Docs/ProjectVisionRoadmap.txt`  

---

## Appendix — Screenshot checklist (for designer)

Paste into slides where needed:

- [ ] Empty layout (canvas + panels)  
- [ ] Loaded OCT slice (single frame)  
- [ ] Slice bar with “Slice *n* / *N*” and slider  
- [ ] Architecture diagram (export from report)  
- [ ] Approved wireframe (from client review)  

---

*End of slide content. Build slides in PowerPoint; use corporate template if required by the unit.*
