# Sprint 1 — manual tests we ran

**Project:** OCT Web Annotation Tool · **Scope:** Foundation (layout, load real file, display, slice navigation)  
**Environment:** *(browser + version, OS — fill in)*  
**Tester:** *(name)* · **Date:** *(YYYY-MM-DD)*

---

## TC-S1-01 — Layout visible

| Field | Content |
|--------|---------|
| **Preconditions** | App running (`./run.sh` or `frontend` dev server); open project annotate view. |
| **Steps** | 1. Navigate to annotate page with a project selected (or empty state). 2. Observe screen regions. |
| **Expected** | **Canvas** area, **toolbar** (or top bar with controls), and **label panel** are visible and not overlapping critically. |
| **Actual** | |
| **Pass / Fail** | |

---

## TC-S1-02 — Load real image file

| Field | Content |
|--------|---------|
| **Preconditions** | Known-good file available (e.g. PNG/JPEG single image, or TIFF/DICOM stack per README). |
| **Steps** | 1. Click file / upload control. 2. Select the file. 3. Confirm load completes (no endless spinner). |
| **Expected** | File is accepted; first slice (or only image) appears on canvas; no unhandled error dialog. |
| **Actual** | *File used:* |
| **Pass / Fail** | |

---

## TC-S1-03 — Display matches file

| Field | Content |
|--------|---------|
| **Preconditions** | TC-S1-02 passed; note expected dimensions from file or viewer metadata. |
| **Steps** | 1. After load, read slice size label if shown (e.g. W×H). 2. Compare to expected. |
| **Expected** | Dimensions match source (or documented behaviour); image is readable, not blank. |
| **Actual** | |
| **Pass / Fail** | |

---

## TC-S1-04 — Multi-slice navigation (Next / Previous)

| Field | Content |
|--------|---------|
| **Preconditions** | Multi-slice file loaded (TIFF stack or multi-frame DICOM); N > 1. |
| **Steps** | 1. Note starting slice index. 2. Click **Next** until last slice. 3. Click **Previous** back to first. |
| **Expected** | Index updates; image changes; **Next** disabled or clamped at last slice; **Previous** at first slice. |
| **Actual** | *N =* |
| **Pass / Fail** | |

---

## TC-S1-05 — Slider navigation

| Field | Content |
|--------|---------|
| **Preconditions** | Same as TC-S1-04; slider visible when N > 1. |
| **Steps** | 1. Drag slider to middle. 2. Drag to end. 3. Drag to start. |
| **Expected** | Slice index and image match slider position; no crash; label “Slice i / N” consistent if present. |
| **Actual** | |
| **Pass / Fail** | |

---

## TC-S1-06 — Single-slice file (regression)

| Field | Content |
|--------|---------|
| **Preconditions** | Single-image file (N = 1). |
| **Steps** | 1. Load file. 2. Try Next/Previous if shown. |
| **Expected** | Image displays; navigation controls behave sensibly (clamped or hidden per design). |
| **Actual** | |
| **Pass / Fail** | |

---

## Summary

| Test ID | Pass / Fail |
|---------|-------------|
| TC-S1-01 | |
| TC-S1-02 | |
| TC-S1-03 | |
| TC-S1-04 | |
| TC-S1-05 | |
| TC-S1-06 | |

**Notes / defects:** *(links to issues, screenshots path)*
