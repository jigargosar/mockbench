# MockBench — Philosophy, Features & Progressive Discovery

## The Balsamiq Lesson

Balsamiq's original pitch wasn't "look at all our features." It was the opposite:
"Life's too short for bad software." Their selling point was *deliberate limitation*.

The sketchy aesthetic wasn't decoration — it was a psychological trick. As one review put it:
"Stakeholders aren't afraid to critique a drawing that looks like it took five minutes."
High-fidelity mockups shut down feedback. Low-fidelity invites it.

Peldi built Balsamiq to solve one problem: he kept drawing wireframes on whiteboards
and then having to digitize them. He wanted a tool as fast as a pencil but smarter than paper.
That's it. Everything else grew from that single itch.

MockBench should have a similarly sharp origin statement:
**"Sketch it, present it, ship the idea — before anyone wastes time building the wrong thing."**


## MockBench as an Authoring Tool

Wireframing tools compare themselves to design tools (Figma, Sketch).
That's a mistake. MockBench is closer to an authoring tool (Google Docs, Notion, iA Writer).

Why? Because the output isn't a visual asset — it's a *document of intent*.
A wireframe says "here's what we should build and why." That's authoring.

This reframing unlocks a whole category of proven features that wireframe tools ignore:


### Features Borrowed from Authoring Tools

**1. Versioning with named checkpoints (from Google Docs / Git)**
Not just undo/redo — let users name save points: "Before the nav redesign",
"Version we showed to stakeholders." Jump between them. Compare them side by side.
This is your visual history panel evolved into something with *meaning*.

**2. Comments and annotations (from Google Docs / Figma)**
Drop a comment pin on any element. "Why is this button here?" "This needs to match
the API response." Comments turn a wireframe from a picture into a conversation.
This matters because wireframes exist to generate feedback.

**3. Focus mode / Zen mode (from iA Writer / Ulysses)**
Hide every panel. Just the canvas. No toolbar, no palette, no properties.
One keystroke to enter, one to exit. For when you're in the flow and the chrome
is the distraction. iA Writer built a whole brand on this single idea.

**4. Templates as starting points (from Notion / Google Docs)**
Don't start with a blank canvas. Offer "Login flow", "Dashboard", "Settings page",
"Onboarding sequence" as one-click starting points. This is also the programmatic
SEO play — each template becomes a landing page.

**5. Outline / structure view (from Scrivener / Notion)**
A bird's-eye view of all pages as a tree or flow diagram.
Not the layers panel (that's per-page). This is the *information architecture* view.
"Page 1 links to Page 3 via the nav bar, Page 3 links to Page 5 via the CTA."
This is where your hotspot links become visible as a graph.

**6. Export as a spec document (from authoring tools generally)**
Not just PNG/PDF of visuals. Export a structured document:
"Page 1: Login — contains email input, password input, submit button, forgot password link.
Links to: Dashboard (on submit), Reset Password (on forgot password click)."
That's a developer handoff document generated automatically from the wireframe.

**7. Inline editing (from every text editor ever)**
Double-click text on canvas, type, done. Your v1 noted this was partial —
property panel only, no inline editing. This is the single most important
quality-of-life feature missing. Every second spent switching to the property
panel to change "Button" to "Submit" is a paper cut.

**8. Content placeholders with real data (from Sketch / Figma)**
Instead of "Lorem ipsum" and "John Doe", pull from a pool of realistic names,
emails, addresses, dates. Makes wireframes immediately more convincing.
Low effort, high impact.


### Features That Are NOT Worth Borrowing

- Real-time collaboration / multiplayer (too complex, Figma owns this)
- Plugin/extension system (premature abstraction)
- Design tokens / brand system (opposite of the lo-fi philosophy)
- AI generation (resist the trend — the value is in thinking, not generating)
- Version diffing at the element level (too granular, not useful for wireframes)


## Progressive Discovery

The principle: **show people the basics first. Once they understand that,
let them discover the expert features.**

This is not just a UI pattern. Applied to MockBench, it's a product strategy
that spans the app, the landing page, the docs, and the release cadence.


### In the App

**Layer 1 — The blank canvas (first 30 seconds)**
User opens MockBench. They see a canvas, a small palette of ~8 components
(rectangle, text, button, input, image, header, card, divider), and nothing else.
No property panel. No layers panel. No pages panel. No toolbar clutter.
Just: drag a thing, place it, move it. Done.

This is the Balsamiq "no features" moment. The tool teaches itself.

**Layer 2 — Contextual reveal (first 5 minutes)**
User selects an element → property panel slides in from the right.
User has 5+ elements → a subtle "Layers" tab appears.
User double-clicks text → inline editing activates.
User hits Ctrl+Z → a tiny "History" icon pulses once to say "I exist."

Nothing appears until the user's behavior signals they're ready for it.

**Layer 3 — Power user unlock (first session)**
After the user creates a second page, the pages panel appears.
After they use hotspot links, presentation mode becomes available.
After they've undone 3+ times, the history panel reveals itself.
After they've used 10+ components, the "all components" expanded palette unlocks.

The principle: features arrive when the user's *actions* prove they need them.

**Layer 4 — Pro mode (explicit opt-in)**
Keyboard shortcut cheatsheet (Ctrl+/)
Grid customization
Snap-to-guide settings  
Export options (JSON, PDF, PNG, SVG)
Named checkpoints in history
Sketchy ↔ clean toggle

These live behind a single "Pro" toggle or settings panel.
They never clutter the main interface.


### On the Landing Page

The landing page should mirror the same progressive structure:

**Hero** — One sentence, one visual. "Sketch your app idea in minutes."
Show a hand-drawn wireframe being built in real-time (animated or video).
One CTA: "Start wireframing — no signup."

**Section 2 — The basics** — "Drag. Drop. Done."
Show the 8 core components. Show placing, moving, resizing.
This is for the person who's never wireframed before.

**Section 3 — The flow** — "Connect your screens."
Show multi-page with hotspot links. Show presentation mode.
"Walk your team through the flow, not a static image."
This is for the PM who needs to present ideas.

**Section 4 — The power** — "Built for speed."
Keyboard shortcuts, history scrubber, sketchy ↔ clean toggle,
named checkpoints, export as spec document.
"Everything you need. Nothing you don't."
This is for the power user who's evaluating the tool seriously.

**Section 5 — Templates** — "Don't start blank."
Show 6-8 template categories. Each one is a click to start.
Each one is also an SEO landing page.

No pricing section (it's free / local-first).
No feature comparison table (that's defensive positioning).
No screenshots of every panel and button (that's feature dumping).


### In the Docs / Guides

Instead of a traditional docs site with every feature listed alphabetically,
structure it as three learning paths:

**Path 1: "I have 5 minutes"** — Place a component, move it, present it.
A single page. No navigation. No sidebar. Just the essential loop.

**Path 2: "I'm building something real"** — Multi-page flows, hotspot links,
property editing, layers, groups, export. A guided walkthrough
that builds a small project step by step.

**Path 3: "I want to master this"** — Every keyboard shortcut, history
scrubbing, named checkpoints, component states, accessibility features,
advanced export. Reference-style, for people who already know the basics.

The user self-selects their depth. Nobody is forced through docs
they don't need.


### In the Release Cadence (Progressive Releases → Progressive Discovery)

This is the insight you mentioned — applying the same philosophy to *how* you ship:

**Release 1** ships with Layer 1 + Layer 2 features only.
Canvas, 8 components, select/move/resize, property panel, undo.
That's it. The landing page only shows these features.
The app only has these features. There's nothing to be overwhelmed by.

**Release 2** adds multi-page and presentation mode.
The landing page adds Section 3. The app reveals the pages panel
once users have content. Existing users discover it naturally.
New users see a slightly richer product.

**Release 3** adds power features — history panel, export, shortcuts.
The landing page adds Section 4. The app reveals these contextually.
The docs add Path 3.

Each release makes the product deeper without making the first experience
more complex. The entry point stays simple forever. Only the ceiling rises.

This is the opposite of how most tools ship. Most tools add features
and immediately expose them to everyone. Progressive release means
new features are *hidden by default* and revealed through the same
progressive discovery rules as everything else.


## Summary

MockBench's philosophy in one paragraph:

A wireframe is a document of intent, not a visual asset. The tool should be
as fast as a pencil, as smart as an outline, and as presentable as a slide deck.
Show people the minimum they need to think clearly. Let them discover depth
when they're ready. Ship less, reveal gradually, and never let the interface
outgrow the idea it's trying to capture.
