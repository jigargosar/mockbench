# Feature Scope

Order And Implementation are not set in stone.

## Core Features

### Shapes & Drawing

1. ✅ Rectangle — draw by drag.
2. Ellipse/circle — draw by drag, shift-constrain to circle.
3. Line/arrow — click start + end, optional arrowhead.
4. Freehand/pencil — draw with mouse, smooth the path.
5. Text label — click to place, type inline.
6. Polygon/triangle — click vertices or regular-polygon tool.
7. Sticky note — colored rectangle with auto-wrapping text inside.

### Selection & Manipulation

8. ✅ Single select — click a shape.
9. Multi-select — shift+click to toggle, or drag a marquee rectangle to lasso.
10. Move — drag selected shapes to reposition.
11. Resize — drag corner/edge handles. Shift-constrain aspect ratio.
12. Rotate — drag rotation handle or type angle.
13. ✅ Delete — keyboard Delete/Backspace.
14. Duplicate — Ctrl+D or Alt+drag.
15. Copy/cut/paste — Ctrl+C/X/V, paste at cursor.
16. Lock/unlock — prevent accidental edits on finalized shapes.

### Ordering & Layers

17. Z-order — bring forward, send backward, bring to front, send to back.
18. Layers panel — list of shapes, drag to reorder, toggle visibility/lock.

### Grouping

19. Group/ungroup — Ctrl+G / Ctrl+Shift+G. Group acts as one shape.
20. Enter group — double-click to edit children without ungrouping.

### Canvas Navigation

21. Pan — middle-click drag, or space+drag.
22. Zoom — Ctrl+scroll, pinch-to-zoom, zoom to fit, zoom to selection.
23. Infinite canvas — canvas extends in all directions.
24. Minimap — small overview showing viewport position.

### Grid & Alignment

25. Snap-to-grid — configurable grid size, toggle on/off.
26. Smart guides — snap lines appear when aligning with other shapes.
27. Align tools — align left/right/center/top/middle/bottom for multi-selection.
28. Distribute — space selected shapes evenly horizontal/vertical.
29. Rulers — top and left rulers showing pixel/unit position.

### Undo/Redo

30. Undo — Ctrl+Z. Unlimited or deep stack.
31. Redo — Ctrl+Shift+Z or Ctrl+Y.

### Persistence

32. Save — Ctrl+S. To local file, IndexedDB, or server.
33. Load/open — open a saved wireframe.
34. Auto-save — periodic save to local storage to prevent loss.
35. New document — start fresh.

### Export

36. Export PNG — rasterize the canvas at chosen resolution.
37. Export SVG — vector export of the wireframe.
38. Export PDF — for print/share.
39. Copy as image — copy selection to clipboard as bitmap.

### Text Editing

40. Text tool — click to create text block.
41. Inline editing — double-click shape to edit its label.
42. Font size, weight, alignment — basic text formatting.
43. Auto-sizing — text block grows with content.

### Styling / Appearance

44. Stroke color — per-shape, color picker.
45. Fill color — solid fill, none, or hatch pattern (sketchy aesthetic).
46. Stroke width — thin/medium/thick.
47. Opacity — per-shape transparency.
48. Dash pattern — solid, dashed, dotted.
49. Sketchy vs clean — toggle between hand-drawn (rough.js) and precise rendering.

### Connectors

50. Line connector — connects two shapes, stays attached when shapes move.
51. Arrow connector — line with arrowhead on one or both ends.
52. Elbow connector — auto-routing right-angle path between shapes.
53. Connector labels — text on a connector line.

### Pages / Screens

54. Multiple pages — one wireframe document contains multiple screens.
55. Page list — sidebar showing all pages, click to navigate.
56. Duplicate page — copy an entire screen to iterate on it.

### Keyboard Shortcuts

57. Shortcut system — hotkeys for all common actions (documented, discoverable).
58. Quick-switch tool — press R for rect, E for ellipse, T for text, V for select.

### UI Chrome

59. Toolbar — shape tools, select tool, text tool, connector tool.
60. Property inspector — side panel showing selected shape's x/y/w/h/color/etc.
61. Context menu — right-click for common actions.

## Fancy Stuff

### Collaboration

62. Real-time multiplayer — multiple cursors, live edits, conflict resolution.
63. Comments/annotations — pin comments to shapes or canvas regions.
64. Cursor presence — see where others are pointing.
65. Version history — browse and restore previous versions.

### Components & Reuse

66. Symbols/components — define a shape group as reusable; instances auto-update.
67. Component library — shared set of components across documents.
68. Override system — instances can override specific properties (text, color).
69. Stencil packs — pre-built shape libraries (iOS controls, web UI, flowcharts).

### Prototyping

70. Click-through links — link shapes to other pages to simulate navigation.
71. Transitions — animate page-to-page with slide/fade/etc.
72. Hotspots — invisible clickable regions.
73. Prototype preview — full-screen clickable walkthrough.
74. Conditional logic — show/hide elements based on variable state.

### Advanced Drawing

75. Boolean operations — union, subtract, intersect, exclude shapes.
76. Masks / clipping — clip one shape inside another's outline.
77. Freeform pen tool — bezier curves with control points.
78. Shape morphing — smooth transition between two shapes.
79. Pressure-sensitive strokes — varying width with pen tablet.
80. Image embedding — place raster images on the canvas.
81. SVG import — drop in external vector graphics.

### Layout & Responsive

82. Auto-layout — flexbox-like layout inside frames/groups.
83. Constraints — pin edges/center so shapes resize with their parent.
84. Responsive preview — view wireframe at different screen sizes.
85. Grid layout — CSS-grid-style rows/columns inside a frame.

### Effects & Polish

86. Drop shadow — per-shape shadow with offset/blur/color.
87. Blur — background blur or shape blur.
88. Rounded corners — adjustable border radius per corner.
89. Gradients — linear/radial fill gradients.

### Developer Handoff

90. Inspect mode — developers click shapes to see dimensions, spacing, colors.
91. Export to code — generate HTML/CSS skeleton from wireframe.
92. Design tokens — named colors/fonts/spacing reusable across documents.
93. Asset export — export individual shapes as PNG/SVG at multiple sizes.

### Intelligence

94. AI layout suggestions — auto-arrange shapes for better alignment.
95. AI content fill — placeholder text/images generated contextually.
96. Template gallery — pre-built page templates (login, dashboard, settings).
97. Smart resize — shapes rearrange intelligently when canvas/frame resizes.

### Ecosystem

98. Plugin API — third-party extensions.
99. Import from Figma/Sketch — convert existing designs to wireframes.
100. Embed in docs — embed live wireframes in Notion/Confluence/etc.
101. Offline mode — full functionality without network.
102. Custom fonts — upload and use brand fonts.
