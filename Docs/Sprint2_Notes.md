# Sprint 2 Plan

In Sprint 2, we will focus heavily on building out the core annotation toolkit, advanced viewport controls, and a robust label management system. We will aim to implement all planned drawing and interaction features, leaving the Data Export (JSON) and AWS S3 integrations out of scope for this sprint.

Here is a breakdown of what we will accomplish:

## 🎨 Label Palette System (Core Focus)
We will place a major emphasis on how labels behave, as they dictate the organization of all user annotations. The label palette will act as the central control hub:

*   **Smart Defaults**: The system will initialize with standard labels (ILM, RPE, NFLFs) ready to use out of the box.
*   **Active State Behavior**: Users will be able to click a label to make it "active." Any subsequent drawings or annotations made on the canvas will automatically inherit this active label's specific color and identifier.
*   **Dynamic Creation**: Users will be able to easily add custom labels on the fly. Typing a new label name will instantly add it to the palette and assign it a randomly generated, distinct color.
*   **Safe Deletion & Cross-Slice Cleanup**: Deleting a label will require user confirmation. Upon confirmation, the system will not just delete the label—it will perform a cross-slice cleanup, instantly removing all associated annotations across the entire volume to prevent orphaned data.
*   **Reordering**: The palette will support reordering (via drag/drop or up/down buttons), allowing users to organize their workspace to fit their specific workflow priorities.

## 🛠️ Annotation & Drawing Tools
We will expand the drawing capabilities far beyond basic points:

*   **Freehand Mode**: We will add a continuous drawing tool. Users will be able to click and drag, and a live polyline will follow the mouse exactly. Releasing the mouse will commit the stroke, and pressing `Esc` will cancel an in-progress stroke.
*   **Polygon & Line Modes**: Users will be able to plot individual points to create closed polygons (double-click to close) with semi-transparent fills, or draw simple straight lines.
*   **Edit & Modification**: We will introduce an Edit mode where users can click near a vertex or stroke to select it. Vertices can then be dragged to adjust shapes seamlessly.
*   **Undo/Redo System**: We will build a comprehensive history stack mapped to standard shortcuts (`Ctrl+Z` / `Cmd+Z`, `Shift+Z`) as well as UI buttons to safely reverse or restore actions.

## 🔍 Advanced Viewport Controls (Zoom & Pan)
Handling high-resolution medical images requires smooth navigation:

*   **Cursor-Centered Zoom**: We will implement intuitive zooming using trackpad pinch gestures, mouse wheel scroll, or UI buttons (+/-). The zoom will dynamically center exactly where the user's cursor is pointing.
*   **Pan Mode**: A hand-tool will allow users to click and drag to navigate around the zoomed-in image.
*   **Persistent Alignment**: We will ensure critical alignment stability. All annotations will be mapped to image-space coordinates, ensuring they stay perfectly locked to the underlying medical scan regardless of panning or zoom levels.

## 🔜 Excluded from Sprint 2
The following features will not be part of Sprint 2 and will be addressed later:
1.  **Data Export**: Bundling all slices, labels, and coordinate data into a single, structured JSON schema for download.
2.  **AWS S3 Integration**: Enabling the cloud file picker to load medical volumes directly from S3 buckets.
