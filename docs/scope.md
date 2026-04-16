# Feature Scope

[W] = wireframing-specific · [G] = generic canvas infrastructure

1. [W] Button (standard, navigation, FAB, button bar)
2. [W] Text input / text field
3. [W] Text area
4. [W] Dropdown / combo box / picker
5. [W] Checkbox (simple, hierarchical, grouped)
6. [W] Radio button
7. [W] Toggle / on-off switch
8. [W] Slider
9. [W] Numeric stepper
10. [W] Date picker
11. [W] Time picker
12. [W] Search box
13. [W] Tabs (horizontal, vertical)
14. [W] Accordion
15. [W] Breadcrumbs
16. [W] Menu bar / navigation bar
17. [W] Vertical / sidebar menu
18. [W] Tree pane (hierarchical list)
19. [W] Pagination
20. [W] Link / hyperlink
21. [W] Data grid / table
22. [W] List (simple, icon list, multi-line)
23. [W] Calendar
24. [W] Chart placeholders (pie, line, bar, column)
25. [W] Progress bar
26. [W] Scrollbar (horizontal, vertical)
27. [W] Tooltip / popover
28. [W] Browser window frame
29. [W] iPhone / mobile frame
30. [W] iPad / tablet frame
31. [W] Dialog / modal / lightbox
32. [W] Alert / notification
33. [W] Field set (labeled container)
34. [W] Panel / window / card
35. [W] Splitter
36. [W] Dynamic panel — multi-state container (tabs that switch, modals that open/close)
37. [W] Image placeholder (rectangle with X)
38. [W] Video player placeholder
39. [W] Audio player placeholder
40. [W] Map placeholder
41. [W] Avatar placeholder
42. [W] Lorem ipsum / paragraph block
43. [W] Callout
44. [W] Comment bubble
45. [W] Sticky note
46. [W] Red X (rejection mark)
47. [W] Scratch-out
48. [W] Curly braces (dimension marker)
49. [W] Annotation arrow / line
50. [W] Navbar section (pre-built)
51. [W] Hero section (pre-built)
52. [W] Features section (pre-built)
53. [W] Content section (pre-built)
54. [W] Pricing section (pre-built)
55. [W] FAQ section (pre-built)
56. [W] Footer section (pre-built)
57. [W] Form section (pre-built)
58. [W] Gallery section (pre-built)
59. [W] Built-in icon set (large — Font Awesome, Material, or similar)
60. [W] Sketch skin — hand-drawn, wobbly-line rendering (default via Rough.js)
61. [W] Clean / wireframe skin — straight-line variant for presentations
62. [W] Skin toggle — switch entire project between sketch and clean
63. [W] Hand-drawn font (single font, deliberate constraint)
64. [W] Limited color palette — grayscale by default
65. [W] Roughness levels — multiple degrees of sketchiness (e.g. Architect / Artist / Cartoonist)
66. [W] Type-to-search widget insertion (Quick Add) — press `/` or `+`, type "dropdown" → get a dropdown
67. [W] Markdown-like syntax for bold/italic/links inside widgets
68. [W] Data grid text syntax — commas for columns, newlines for rows
69. [W] Site map text syntax — indented lines define hierarchy
70. [W] Tree pane text syntax — indented lines define nesting
71. [W] Control state via text — `[x]` checks a checkbox, `[o]` selects radio
72. [W] Transform widget type — morph one widget into a compatible type preserving content
73. [W] Multi-page documents — one project contains multiple screens
74. [W] Page navigator — sidebar list of all screens
75. [W] Page hierarchy — nest screens via naming or drag
76. [W] Duplicate page — copy a screen to iterate
77. [W] Page-level notes — documentation per screen
78. [W] Link any widget to another page
79. [W] Link to external URL
80. [W] Hotspots — invisible clickable regions
81. [W] Presentation mode — full-screen click-through with hand cursor on linked elements
82. [W] Markup toggle in presentation — hide annotations during demo
83. [W] Exported PDF retains links
84. [W] Alternates — multiple structural variations of the same screen
85. [W] Promote alternate — replace official wireframe with a chosen variation
86. [W] Per-alternate notes — document rationale for each
87. [W] Export alternates selectively
88. [W] Symbols (components) — group widgets into reusable elements; edits propagate
89. [W] Nested symbols
90. [W] Symbol overrides — instances override specific text/properties
91. [W] Master pages — shared header/sidebar/footer across pages
92. [W] Cross-project sharing — template project pattern
93. [W] Stencil packs — pre-built widget sets (iOS, Android, Bootstrap, Material)
94. [W] Widget-level annotation fields — structured notes per widget
95. [W] Page-level specification notes
96. [W] Auto-generated spec documents (PDF/Word with screenshots + annotations)
97. [W] Spec tools stencil — dimension lines, callouts, measurement markers
98. [W] Flow diagram shapes — decision diamonds, process boxes, terminators
99. [W] Auto-reflowing connectors (flow diagrams)
100. [W] Sitemap view — hierarchical page structure
101. [W] Wireflows — screen content shown inside a flow diagram
102. [W] Built-in page templates — login, dashboard, settings, etc.
103. [W] Community template library
104. [W] Template projects — starter projects with pre-configured symbols
105. [W] Inspect mode — click shapes to see dimensions, spacing, colors
106. [W] Asset export — individual shapes as PNG/SVG
107. [W] Constraints — pin edges/center so shapes resize with their parent
108. [G] ✅ Rectangle — draw by drag
109. [G] Ellipse / circle — draw by drag, shift-constrain
110. [G] Line — click start + end
111. [G] Text label — click to place, type inline
112. [G] Image embedding — place raster images on canvas
113. [G] SVG import — drop in external vector graphics
114. [G] ✅ Single select — click a shape
115. [G] Multi-select — shift+click or marquee
116. [G] Move — drag selected shapes
117. [G] Resize — corner/edge handles, shift-constrain
118. [G] ✅ Delete — keyboard Delete/Backspace
119. [G] Duplicate — Ctrl+D or Alt+drag
120. [G] Copy/cut/paste — Ctrl+C/X/V
121. [G] Lock/unlock — prevent accidental edits
122. [G] Z-order — bring forward, send backward, front, back
123. [G] Group/ungroup — Ctrl+G / Ctrl+Shift+G
124. [G] Enter group — double-click to edit children
125. [G] Pan — middle-click drag, space+drag
126. [G] Zoom — Ctrl+scroll, pinch, zoom-to-fit, zoom-to-selection
127. [G] Infinite canvas
128. [G] Minimap — overview showing viewport position
129. [G] Snap-to-grid — configurable grid size, toggle on/off
130. [G] Snap-to-neighbors — edge/center snapping to nearby shapes
131. [G] Align tools — left/right/center/top/middle/bottom
132. [G] Distribute — space evenly horizontal/vertical
133. [G] Text tool — click to create text block
134. [G] Inline editing — double-click to edit label
135. [G] Font size, weight, alignment — basic formatting
136. [G] Auto-sizing — text block grows with content
137. [G] Stroke color — per-shape, limited palette
138. [G] Fill color — solid, none, hatch pattern
139. [G] Stroke width — thin/medium/thick
140. [G] Dash pattern — solid, dashed, dotted
141. [G] Sketchy vs clean — toggle hand-drawn vs precise rendering
142. [G] Line connector — connects two shapes, stays attached on move
143. [G] Arrow connector — arrowhead on one or both ends
144. [G] Elbow connector — auto-routing right-angle path
145. [G] Connector labels — text on a connector line
146. [G] Undo — Ctrl+Z, deep stack
147. [G] Redo — Ctrl+Shift+Z or Ctrl+Y
148. [G] Save — Ctrl+S, to local file or IndexedDB
149. [G] Load / open — open a saved project
150. [G] Auto-save — periodic save to prevent loss
151. [G] New document
152. [G] Export PNG
153. [G] Export SVG
154. [G] Export PDF — with clickable links preserved
155. [G] Copy as image — clipboard as bitmap
156. [G] Native format — round-trippable project file
157. [G] Shortcut system — hotkeys for all common actions
158. [G] Quick-switch tool — R for rect, E for ellipse, T for text, V for select
159. [G] Toolbar — tools, widgets
160. [G] Property inspector — selected shape's properties
161. [G] Context menu — right-click for common actions
162. [G] Comments / annotations — pin to shapes or canvas regions
163. [G] Version history — browse and restore previous versions
164. [G] Share via link
165. [G] Role-based permissions — editor vs reviewer
166. [G] Jira integration
167. [G] Confluence integration
168. [G] Offline mode — full functionality without network
169. [G] Community library browsing — browse and import widgets from within the editor
