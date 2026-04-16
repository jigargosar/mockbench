# Feature Scope

## Ship First

1. Move — drag selected shapes
2. Resize — corner/edge handles
3. Multi-select — shift+click and marquee
4. Undo/Redo
5. Copy/cut/paste
6. Duplicate — Ctrl+D
7. Z-order — bring forward/back
8. Pan — space+drag
9. Zoom — Ctrl+scroll, zoom-to-fit
10. Infinite canvas
11. Text — click to place, type inline, double-click to edit, auto-sizes
12. Widget properties — each widget exposes constrained presets (state, label, size, color) not freeform styling
13. Snapping — grid and neighbor edge/center alignment
14. Keyboard shortcuts — hotkeys for tools and actions
15. Group/ungroup
16. Core widget library — button, text input, dropdown, checkbox, radio, image placeholder, dialog/modal, panel/card, callout, sticky note (first 10; library grows over time to include connectors/arrows)
17. Multi-screen documents — project contains multiple screens with navigator, duplicate, hierarchy
18. Presentation mode — full-screen click-through; widgets link to other screens
19. Save/load with auto-save and version history
20. Export — PNG, PDF

## Unsorted — needs cutting and reprioritizing

### Widget Library (remaining)

21. Toggle / on-off switch
22. Slider
23. Numeric stepper
24. Date picker
25. Time picker
26. Search box
27. Tabs (horizontal, vertical)
28. Accordion
29. Breadcrumbs
30. Menu bar / navigation bar
31. Vertical / sidebar menu
32. Tree pane (hierarchical list)
33. Pagination
34. Link / hyperlink
35. Data grid / table
36. List (simple, icon list, multi-line)
37. Calendar
38. Chart placeholders (pie, line, bar, column)
39. Progress bar
40. Scrollbar (horizontal, vertical)
41. Tooltip / popover
42. Browser window frame
43. iPhone / mobile frame
44. iPad / tablet frame
45. Alert / notification
46. Field set (labeled container)
47. Splitter
48. Dynamic panel — multi-state container (tabs that switch, modals that open/close)
49. Video player placeholder
50. Audio player placeholder
51. Map placeholder
52. Avatar placeholder
53. Lorem ipsum / paragraph block
54. Red X (rejection mark)
55. Scratch-out
56. Curly braces (dimension marker)
57. Built-in icon set (large — Font Awesome, Material, or similar)

### Sketchy Aesthetic

58. Sketch skin — hand-drawn rendering via Rough.js
59. Clean / wireframe skin — straight-line variant for presentations
60. Skin toggle — switch entire project between sketch and clean
61. Hand-drawn font (single font, deliberate constraint)
62. Limited color palette — grayscale by default
63. Roughness levels — multiple degrees of sketchiness

### Text-Driven Widget Configuration

64. Quick Add — type-to-search widget insertion
65. Markdown-like syntax for bold/italic/links inside widgets
66. Data grid text syntax — commas for columns, newlines for rows
67. Site map text syntax — indented lines define hierarchy
68. Tree pane text syntax — indented lines define nesting
69. Control state via text — `[x]` checks a checkbox, `[o]` selects radio
70. Transform widget type — morph one widget into a compatible type preserving content

### Screen Workflows

71. Page hierarchy — nest screens via naming or drag
72. Page-level notes — documentation per screen
73. Link to external URL
74. Hotspots — invisible clickable regions
75. Markup toggle in presentation — hide annotations during demo

### Alternates

76. Alternates — multiple structural variations of the same screen
77. Promote alternate — replace official wireframe with a chosen variation
78. Per-alternate notes — document rationale for each

### Components / Symbols

79. Symbols (components) — group widgets into reusable elements; edits propagate
80. Nested symbols
81. Symbol overrides — instances override specific text/properties
82. Master pages — shared header/sidebar/footer across pages
83. Cross-project sharing — template project pattern
84. Stencil packs — pre-built widget sets (iOS, Android, Bootstrap, Material)

### Annotations / Specifications

85. Widget-level annotation fields — structured notes per widget
86. Page-level specification notes
87. Auto-generated spec documents (PDF/Word with screenshots + annotations)

### Flow Diagrams / Sitemaps

88. Flow diagram shapes — decision diamonds, process boxes, terminators
89. Auto-reflowing connectors (flow diagrams)
90. Sitemap view — hierarchical page structure
91. Wireflows — screen content shown inside a flow diagram

### Templates

92. Built-in page templates — login, dashboard, settings, etc.
93. Community template library
94. Template projects — starter projects with pre-configured symbols

### Developer Handoff

95. Inspect mode — click shapes to see dimensions, spacing, colors
96. Asset export — individual shapes as PNG/SVG

### Canvas Infrastructure

97. Minimap — overview showing viewport position
98. Align tools — left/right/center/top/middle/bottom
99. Distribute — space evenly horizontal/vertical
100. Lock/unlock — prevent accidental edits
101. Enter group — double-click to edit children
102. Connectors — lines/arrows that attach to widgets and follow on move, with labels
103. Export SVG
104. Copy as image — clipboard as bitmap
105. Native format — round-trippable project file
106. Constraints — pin edges/center so shapes resize with their parent

### UI Chrome

107. Toolbar
108. Property inspector
109. Context menu — right-click for common actions

### Collaboration

110. Comments / annotations — pin to shapes or canvas regions
111. Share via link
112. Role-based permissions — editor vs reviewer
113. Offline mode — full functionality without network
