import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const GRID = 10;
const snap = (v) => Math.round(v / GRID) * GRID;

const COMPONENT_TYPES = [
  { type: "rect", label: "Rectangle", icon: "▢", w: 200, h: 120 },
  { type: "text", label: "Text Block", icon: "T", w: 180, h: 32 },
  { type: "button", label: "Button", icon: "⊡", w: 140, h: 44 },
  { type: "input", label: "Input Field", icon: "▭", w: 240, h: 40 },
  { type: "image", label: "Image", icon: "⊞", w: 200, h: 150 },
  { type: "header", label: "Header Bar", icon: "☰", w: 400, h: 56 },
  { type: "card", label: "Card", icon: "❏", w: 260, h: 180 },
  { type: "avatar", label: "Avatar", icon: "◉", w: 48, h: 48 },
  { type: "divider", label: "Divider", icon: "—", w: 300, h: 2 },
  { type: "toggle", label: "Toggle", icon: "◐", w: 48, h: 28 },
  { type: "checkbox", label: "Checkbox", icon: "☑", w: 24, h: 24 },
  { type: "radio", label: "Radio", icon: "◎", w: 24, h: 24 },
  { type: "dropdown", label: "Dropdown", icon: "▾", w: 200, h: 40 },
  { type: "textarea", label: "Text Area", icon: "≡", w: 240, h: 100 },
  { type: "navbar", label: "Nav Bar", icon: "⊟", w: 400, h: 48 },
  { type: "sidebar", label: "Sidebar", icon: "◧", w: 220, h: 400 },
  { type: "modal", label: "Modal", icon: "❐", w: 360, h: 240 },
  { type: "tab", label: "Tab Bar", icon: "⊞", w: 360, h: 40 },
  { type: "list", label: "List Item", icon: "☰", w: 300, h: 56 },
  { type: "badge", label: "Badge", icon: "●", w: 60, h: 24 },
  { type: "icon", label: "Icon", icon: "✦", w: 32, h: 32 },
  { type: "progress", label: "Progress", icon: "▰", w: 200, h: 8 },
  { type: "slider", label: "Slider", icon: "⊶", w: 200, h: 20 },
  { type: "tooltip", label: "Tooltip", icon: "◬", w: 160, h: 36 },
];

let idCounter = 1;
const genId = () => `el_${idCounter++}`;
const genPageId = () => `pg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const createEl = (type, x, y, overrides = {}) => {
  const def = COMPONENT_TYPES.find((c) => c.type === type) || COMPONENT_TYPES[0];
  return {
    id: genId(),
    type,
    x: snap(x),
    y: snap(y),
    w: def.w,
    h: def.h,
    text: def.label,
    fill: "transparent",
    stroke: "#555",
    radius: type === "avatar" ? 999 : type === "card" || type === "modal" ? 12 : type === "button" || type === "badge" || type === "tooltip" ? 6 : type === "input" || type === "dropdown" || type === "textarea" ? 4 : 0,
    fontSize: type === "text" ? 16 : type === "header" ? 20 : 14,
    opacity: 1,
    locked: false,
    ...overrides,
  };
};

// --- Wireframe Element Renderer ---
const WireEl = ({ el, selected, zoom }) => {
  const s = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    opacity: el.opacity,
    borderRadius: el.radius,
    boxSizing: "border-box",
    overflow: "hidden",
    userSelect: "none",
    transition: "box-shadow 0.1s",
  };

  const wireStroke = "#666";
  const wireFill = el.fill !== "transparent" ? el.fill : "transparent";
  const wireText = "#aaa";

  switch (el.type) {
    case "rect":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, background: wireFill }}>
          {el.text !== "Rectangle" && (
            <span style={{ position: "absolute", top: 6, left: 8, color: wireText, fontSize: el.fontSize, fontFamily: "'DM Mono', monospace" }}>{el.text}</span>
          )}
        </div>
      );
    case "text":
      return (
        <div style={{ ...s, display: "flex", alignItems: "center", color: wireText, fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", lineHeight: 1.4 }}>
          {el.text}
        </div>
      );
    case "button":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", justifyContent: "center", color: wireText, fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.04)" }}>
          {el.text}
        </div>
      );
    case "input":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", padding: "0 12px", color: "#555", fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.02)" }}>
          {el.text}
        </div>
      );
    case "image":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="2" stroke="#555" strokeWidth="1.5" /><circle cx="14" cy="17" r="3" stroke="#555" strokeWidth="1.2" /><polyline points="8,28 16,20 22,26 26,22 32,28" stroke="#555" strokeWidth="1.2" fill="none" /></svg>
        </div>
      );
    case "header":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, background: "rgba(255,255,255,0.03)" }}>
          <span style={{ color: wireText, fontSize: 18 }}>☰</span>
          <span style={{ color: wireText, fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{el.text}</span>
          <span style={{ marginLeft: "auto", color: "#555", fontSize: 12 }}>●  ●  ●</span>
        </div>
      );
    case "card":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, background: "rgba(255,255,255,0.02)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ width: "100%", height: "40%", background: "rgba(255,255,255,0.03)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="2" stroke="#555" strokeWidth="1.5" /><circle cx="14" cy="17" r="3" stroke="#555" strokeWidth="1.2" /><polyline points="8,28 16,20 22,26 26,22 32,28" stroke="#555" strokeWidth="1.2" fill="none" /></svg>
          </div>
          <div style={{ color: wireText, fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{el.text}</div>
          <div style={{ height: 6, width: "70%", background: "#333", borderRadius: 3 }} />
          <div style={{ height: 6, width: "50%", background: "#333", borderRadius: 3 }} />
        </div>
      );
    case "avatar":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)" }}>
          <span style={{ color: wireText, fontSize: Math.min(el.w, el.h) * 0.5 }}>👤</span>
        </div>
      );
    case "divider":
      return <div style={{ ...s, borderTop: `1.5px solid ${wireStroke}`, height: 0 }} />;
    case "toggle":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, borderRadius: 999, display: "flex", alignItems: "center", padding: "0 3px", background: "rgba(255,255,255,0.04)" }}>
          <div style={{ width: el.h - 8, height: el.h - 8, borderRadius: 999, background: "#666", marginLeft: "auto" }} />
        </div>
      );
    case "checkbox":
      return <div style={{ ...s, border: `1.5px solid ${wireStroke}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: wireText, fontSize: 16 }}>✓</div>;
    case "radio":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: el.w * 0.4, height: el.h * 0.4, borderRadius: 999, background: "#666" }} />
        </div>
      );
    case "dropdown":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", padding: "0 12px", color: "#555", fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.02)" }}>
          <span style={{ flex: 1 }}>{el.text}</span>
          <span style={{ color: wireText }}>▾</span>
        </div>
      );
    case "textarea":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, padding: 10, color: "#555", fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.02)", lineHeight: 1.5 }}>
          {el.text}
          <div style={{ position: "absolute", bottom: 4, right: 8, color: "#444", fontSize: 10 }}>⤡</div>
        </div>
      );
    case "navbar":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 24, background: "rgba(255,255,255,0.03)" }}>
          <span style={{ color: wireText, fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14 }}>Logo</span>
          {["Home", "About", "Contact"].map((t) => (
            <span key={t} style={{ color: "#555", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{t}</span>
          ))}
        </div>
      );
    case "sidebar":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", flexDirection: "column", padding: "16px 0", background: "rgba(255,255,255,0.02)" }}>
          {["Dashboard", "Projects", "Settings", "Profile"].map((t, i) => (
            <div key={t} style={{ padding: "10px 20px", color: i === 0 ? wireText : "#444", fontSize: 13, fontFamily: "'DM Mono', monospace", background: i === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}>{t}</div>
          ))}
        </div>
      );
    case "modal":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, background: "rgba(30,30,30,0.98)", padding: 20, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: wireText, fontSize: 16, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{el.text}</span>
            <span style={{ color: "#555", cursor: "pointer", fontSize: 18 }}>✕</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 8, width: "90%", background: "#333", borderRadius: 4 }} />
            <div style={{ height: 8, width: "70%", background: "#333", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
            <div style={{ padding: "6px 16px", border: "1px solid #555", borderRadius: 4, color: "#666", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Cancel</div>
            <div style={{ padding: "6px 16px", background: "#444", borderRadius: 4, color: "#bbb", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Confirm</div>
          </div>
        </div>
      );
    case "tab":
      return (
        <div style={{ ...s, borderBottom: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "flex-end" }}>
          {["Tab 1", "Tab 2", "Tab 3"].map((t, i) => (
            <div key={t} style={{ padding: "8px 20px", color: i === 0 ? wireText : "#444", fontSize: 12, fontFamily: "'DM Mono', monospace", borderBottom: i === 0 ? "2px solid #888" : "none" }}>{t}</div>
          ))}
        </div>
      );
    case "list":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 8, width: "60%", background: "#444", borderRadius: 4 }} />
            <div style={{ height: 6, width: "40%", background: "#333", borderRadius: 3 }} />
          </div>
          <span style={{ color: "#444" }}>›</span>
        </div>
      );
    case "badge":
      return (
        <div style={{ ...s, border: `1.5px solid ${wireStroke}`, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: wireText, fontSize: 11, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.04)" }}>
          {el.text}
        </div>
      );
    case "icon":
      return (
        <div style={{ ...s, display: "flex", alignItems: "center", justifyContent: "center", color: wireText, fontSize: Math.min(el.w, el.h) * 0.6 }}>
          ✦
        </div>
      );
    case "progress":
      return (
        <div style={{ ...s, background: "#333", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: "65%", height: "100%", background: "#666", borderRadius: 999 }} />
        </div>
      );
    case "slider":
      return (
        <div style={{ ...s, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, background: "#333", borderRadius: 2, position: "relative" }}>
            <div style={{ width: "55%", height: "100%", background: "#666", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: "50%", left: "55%", transform: "translate(-50%,-50%)", width: 14, height: 14, borderRadius: 999, background: "#888", border: "2px solid #555" }} />
          </div>
        </div>
      );
    case "tooltip":
      return (
        <div style={{ ...s, background: "#444", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 12, fontFamily: "'DM Mono', monospace", position: "relative" }}>
          {el.text}
          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #444" }} />
        </div>
      );
    default:
      return <div style={{ ...s, border: `1.5px solid ${wireStroke}` }} />;
  }
};

// --- Resize Handles ---
const ResizeHandles = ({ el, onResizeStart }) => {
  const handles = [
    { cursor: "nw-resize", pos: "nw", style: { top: -5, left: -5 } },
    { cursor: "ne-resize", pos: "ne", style: { top: -5, right: -5 } },
    { cursor: "sw-resize", pos: "sw", style: { bottom: -5, left: -5 } },
    { cursor: "se-resize", pos: "se", style: { bottom: -5, right: -5 } },
    { cursor: "n-resize", pos: "n", style: { top: -5, left: "50%", transform: "translateX(-50%)" } },
    { cursor: "s-resize", pos: "s", style: { bottom: -5, left: "50%", transform: "translateX(-50%)" } },
    { cursor: "w-resize", pos: "w", style: { top: "50%", left: -5, transform: "translateY(-50%)" } },
    { cursor: "e-resize", pos: "e", style: { top: "50%", right: -5, transform: "translateY(-50%)" } },
  ];
  return handles.map((h) => (
    <div
      key={h.pos}
      onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, h.pos); }}
      style={{ position: "absolute", width: 10, height: 10, background: "#E8FA50", borderRadius: 2, cursor: h.cursor, zIndex: 999, ...h.style }}
    />
  ));
};

// --- Main App ---
export default function WireframeApp() {
  const [pages, setPages] = useState([{ id: "pg_1", name: "Screen 1" }]);
  const [activePage, setActivePage] = useState("pg_1");
  const [elements, setElements] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [multiSelect, setMultiSelect] = useState([]);
  const [tool, setTool] = useState("select");
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [presenting, setPresenting] = useState(false);
  const [presentPage, setPresentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [editingText, setEditingText] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("components");
  const canvasRef = useRef(null);

  const pageEls = useMemo(() => {
    return Object.values(elements).filter((el) => el.pageId === activePage);
  }, [elements, activePage]);

  const selectedEl = selectedId ? elements[selectedId] : null;

  // History
  const pushHistory = useCallback((newEls) => {
    setHistory((h) => {
      const sliced = h.slice(0, historyIdx + 1);
      return [...sliced, JSON.parse(JSON.stringify(newEls))];
    });
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx > 0) {
      setHistoryIdx((i) => i - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx - 1])));
    }
  }, [historyIdx, history]);

  const redo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx((i) => i + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx + 1])));
    }
  }, [historyIdx, history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (editingText) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          const newEls = { ...elements };
          delete newEls[selectedId];
          setElements(newEls);
          pushHistory(newEls);
          setSelectedId(null);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { e.preventDefault(); redo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && selectedEl) {
        setClipboard(JSON.parse(JSON.stringify(selectedEl)));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v" && clipboard) {
        const newEl = { ...clipboard, id: genId(), x: clipboard.x + 20, y: clipboard.y + 20, pageId: activePage };
        const newEls = { ...elements, [newEl.id]: newEl };
        setElements(newEls);
        pushHistory(newEls);
        setSelectedId(newEl.id);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedEl) {
        e.preventDefault();
        const newEl = { ...selectedEl, id: genId(), x: selectedEl.x + 20, y: selectedEl.y + 20 };
        const newEls = { ...elements, [newEl.id]: newEl };
        setElements(newEls);
        pushHistory(newEls);
        setSelectedId(newEl.id);
      }
      if (e.key === "Escape") { setSelectedId(null); setPresenting(false); setEditingText(null); }
      if (e.key === "v" || e.key === "V") setTool("select");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, elements, editingText, selectedEl, clipboard, activePage, pushHistory, undo, redo]);

  // Drop component on canvas
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("componentType");
    if (!type || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const el = createEl(type, x, y, { pageId: activePage });
    const newEls = { ...elements, [el.id]: el };
    setElements(newEls);
    pushHistory(newEls);
    setSelectedId(el.id);
    setTool("select");
  }, [elements, activePage, zoom, pan, pushHistory]);

  // Move
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    if (tool === "select" && e.target === canvasRef.current?.querySelector(".canvas-bg")) {
      setSelectedId(null);
    }
  }, [tool, pan]);

  const handleElMouseDown = useCallback((e, elId) => {
    e.stopPropagation();
    const el = elements[elId];
    if (!el || el.locked) return;
    setSelectedId(elId);
    setTool("select");
    const rect = canvasRef.current.getBoundingClientRect();
    setDragState({
      id: elId,
      startX: (e.clientX - rect.left - pan.x) / zoom - el.x,
      startY: (e.clientY - rect.top - pan.y) / zoom - el.y,
    });
  }, [elements, zoom, pan]);

  const handleResizeStart = useCallback((e, pos) => {
    if (!selectedEl) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setResizeState({
      pos,
      startMouseX: (e.clientX - rect.left - pan.x) / zoom,
      startMouseY: (e.clientY - rect.top - pan.y) / zoom,
      startX: selectedEl.x,
      startY: selectedEl.y,
      startW: selectedEl.w,
      startH: selectedEl.h,
    });
  }, [selectedEl, zoom, pan]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (panning && panStart) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        return;
      }
      if (dragState && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = snap(((e.clientX - rect.left - pan.x) / zoom) - dragState.startX);
        const y = snap(((e.clientY - rect.top - pan.y) / zoom) - dragState.startY);
        setElements((prev) => ({ ...prev, [dragState.id]: { ...prev[dragState.id], x, y } }));
      }
      if (resizeState && selectedId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = (e.clientX - rect.left - pan.x) / zoom;
        const my = (e.clientY - rect.top - pan.y) / zoom;
        const dx = mx - resizeState.startMouseX;
        const dy = my - resizeState.startMouseY;
        let { startX, startY, startW, startH } = resizeState;
        let newX = startX, newY = startY, newW = startW, newH = startH;
        const pos = resizeState.pos;
        if (pos.includes("e")) newW = snap(Math.max(20, startW + dx));
        if (pos.includes("w")) { newW = snap(Math.max(20, startW - dx)); newX = snap(startX + startW - newW); }
        if (pos.includes("s")) newH = snap(Math.max(10, startH + dy));
        if (pos.includes("n")) { newH = snap(Math.max(10, startH - dy)); newY = snap(startY + startH - newH); }
        setElements((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId], x: newX, y: newY, w: newW, h: newH } }));
      }
    };
    const handleMouseUp = () => {
      if (dragState) { pushHistory(elements); }
      if (resizeState) { pushHistory(elements); }
      setDragState(null);
      setResizeState(null);
      setPanning(false);
      setPanStart(null);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [dragState, resizeState, panning, panStart, selectedId, elements, zoom, pan, pushHistory]);

  // Zoom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((z) => Math.max(0.2, Math.min(3, z + delta)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Add page
  const addPage = () => {
    const pg = { id: genPageId(), name: `Screen ${pages.length + 1}` };
    setPages((p) => [...p, pg]);
    setActivePage(pg.id);
  };

  const deletePage = (pgId) => {
    if (pages.length <= 1) return;
    setPages((p) => p.filter((pg) => pg.id !== pgId));
    const newEls = { ...elements };
    Object.keys(newEls).forEach((k) => { if (newEls[k].pageId === pgId) delete newEls[k]; });
    setElements(newEls);
    if (activePage === pgId) setActivePage(pages.find((p) => p.id !== pgId).id);
  };

  const renamePage = (pgId, name) => {
    setPages((p) => p.map((pg) => (pg.id === pgId ? { ...pg, name } : pg)));
  };

  // Update element prop
  const updateEl = (key, value) => {
    if (!selectedId) return;
    const newEls = { ...elements, [selectedId]: { ...elements[selectedId], [key]: value } };
    setElements(newEls);
  };

  const updateElCommit = (key, value) => {
    if (!selectedId) return;
    const newEls = { ...elements, [selectedId]: { ...elements[selectedId], [key]: value } };
    setElements(newEls);
    pushHistory(newEls);
  };

  // Present mode
  if (presenting) {
    const pg = pages[presentPage] || pages[0];
    const pEls = Object.values(elements).filter((el) => el.pageId === pg.id);
    return (
      <div style={{ position: "fixed", inset: 0, background: "#111", zIndex: 9999, display: "flex", flexDirection: "column", fontFamily: "'DM Mono', monospace" }}>
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", color: "#555", fontSize: 13, zIndex: 10, background: "rgba(0,0,0,0.7)", padding: "6px 16px", borderRadius: 8 }}>
          {pg.name} — {presentPage + 1} / {pages.length}
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {pEls.map((el) => <WireEl key={el.id} el={el} zoom={1} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: 16 }}>
          <button onClick={() => setPresentPage((p) => Math.max(0, p - 1))} style={{ padding: "8px 20px", background: "#222", border: "1px solid #444", color: "#aaa", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>← Prev</button>
          <button onClick={() => { setPresenting(false); }} style={{ padding: "8px 20px", background: "#333", border: "1px solid #555", color: "#ccc", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Exit</button>
          <button onClick={() => setPresentPage((p) => Math.min(pages.length - 1, p + 1))} style={{ padding: "8px 20px", background: "#222", border: "1px solid #444", color: "#aaa", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Next →</button>
        </div>
      </div>
    );
  }

  const sidebarWidth = 230;
  const propsWidth = 220;

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#0e0e0e", color: "#ccc", fontFamily: "'DM Mono', monospace", overflow: "hidden", fontSize: 12 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Toolbar */}
      <div style={{ height: 44, background: "#151515", borderBottom: "1px solid #252525", display: "flex", alignItems: "center", padding: "0 12px", gap: 4, flexShrink: 0 }}>
        <span style={{ fontFamily: "'Instrument Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#E8FA50", letterSpacing: -0.5, marginRight: 16 }}>WIRE·FRAME</span>
        <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />
        <ToolBtn icon="↖" label="Select (V)" active={tool === "select"} onClick={() => setTool("select")} />
        <div style={{ width: 1, height: 20, background: "#333", margin: "0 4px" }} />
        <ToolBtn icon="↩" label="Undo" onClick={undo} disabled={historyIdx <= 0} />
        <ToolBtn icon="↪" label="Redo" onClick={redo} disabled={historyIdx >= history.length - 1} />
        <div style={{ width: 1, height: 20, background: "#333", margin: "0 4px" }} />
        <ToolBtn icon="⊞" label="Grid" active={showGrid} onClick={() => setShowGrid(!showGrid)} />
        <div style={{ flex: 1 }} />
        <span style={{ color: "#555", fontSize: 11, marginRight: 8 }}>{Math.round(zoom * 100)}%</span>
        <ToolBtn icon="−" onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))} />
        <ToolBtn icon="+" onClick={() => setZoom((z) => Math.min(3, z + 0.1))} />
        <ToolBtn icon="⊡" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} label="Reset" />
        <div style={{ width: 1, height: 20, background: "#333", margin: "0 8px" }} />
        <button onClick={() => { setPresenting(true); setPresentPage(pages.indexOf(pages.find((p) => p.id === activePage)) || 0); }} style={{ padding: "5px 14px", background: "#E8FA50", color: "#111", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 12 }}>
          ▶ Present
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar */}
        <div style={{ width: sidebarWidth, background: "#131313", borderRight: "1px solid #222", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #222" }}>
            {["components", "layers"].map((tab) => (
              <button key={tab} onClick={() => setSidebarTab(tab)} style={{ flex: 1, padding: "8px 0", background: "transparent", border: "none", borderBottom: sidebarTab === tab ? "2px solid #E8FA50" : "2px solid transparent", color: sidebarTab === tab ? "#E8FA50" : "#555", fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>
                {tab}
              </button>
            ))}
          </div>

          {sidebarTab === "components" ? (
            <div style={{ flex: 1, overflow: "auto", padding: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {COMPONENT_TYPES.map((comp) => (
                <div
                  key={comp.type}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("componentType", comp.type); }}
                  style={{ padding: "10px 6px", background: "#1a1a1a", border: "1px solid #252525", borderRadius: 6, cursor: "grab", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8FA50"; e.currentTarget.style.background = "#1e1e1e"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#252525"; e.currentTarget.style.background = "#1a1a1a"; }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{comp.icon}</span>
                  <span style={{ fontSize: 9, color: "#666", textAlign: "center", lineHeight: 1.2 }}>{comp.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, overflow: "auto", padding: 4 }}>
              {pageEls.length === 0 && <div style={{ padding: 16, color: "#444", fontSize: 11, textAlign: "center" }}>No elements yet.<br />Drag components here.</div>}
              {pageEls.map((el) => (
                <div key={el.id} onClick={() => setSelectedId(el.id)} style={{ padding: "7px 10px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: selectedId === el.id ? "rgba(232,250,80,0.08)" : "transparent", borderRadius: 4, borderLeft: selectedId === el.id ? "2px solid #E8FA50" : "2px solid transparent" }}>
                  <span style={{ fontSize: 13 }}>{COMPONENT_TYPES.find((c) => c.type === el.type)?.icon || "▢"}</span>
                  <span style={{ fontSize: 11, color: selectedId === el.id ? "#E8FA50" : "#888", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{el.text || el.type}</span>
                  <span style={{ fontSize: 9, color: "#444" }}>{el.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onMouseDown={handleCanvasMouseDown}
          style={{ flex: 1, position: "relative", overflow: "hidden", cursor: panning ? "grabbing" : tool === "select" ? "default" : "crosshair" }}
        >
          <div className="canvas-bg" style={{
            position: "absolute",
            inset: 0,
            backgroundImage: showGrid ? `radial-gradient(circle, #222 1px, transparent 1px)` : "none",
            backgroundSize: `${GRID * zoom}px ${GRID * zoom}px`,
            backgroundPosition: `${pan.x % (GRID * zoom)}px ${pan.y % (GRID * zoom)}px`,
          }} />

          {/* Elements Layer */}
          <div style={{ position: "absolute", left: pan.x, top: pan.y, transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
            {pageEls.map((el) => (
              <div
                key={el.id}
                onMouseDown={(e) => handleElMouseDown(e, el.id)}
                onDoubleClick={() => { if (["text", "button", "input", "header", "badge", "modal", "tooltip", "dropdown", "textarea"].includes(el.type)) setEditingText(el.id); }}
                style={{ position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h, cursor: el.locked ? "not-allowed" : "move" }}
              >
                <WireEl el={el} selected={selectedId === el.id} zoom={zoom} />
                {selectedId === el.id && (
                  <>
                    <div style={{ position: "absolute", inset: -1, border: "1.5px solid #E8FA50", borderRadius: el.radius, pointerEvents: "none" }} />
                    <ResizeHandles el={el} onResizeStart={handleResizeStart} />
                  </>
                )}
                {editingText === el.id && (
                  <input
                    autoFocus
                    value={el.text}
                    onChange={(e) => updateEl("text", e.target.value)}
                    onBlur={() => { setEditingText(null); pushHistory(elements); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setEditingText(null); pushHistory(elements); } }}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", border: "1.5px solid #E8FA50", borderRadius: el.radius, color: "#E8FA50", fontSize: el.fontSize, fontFamily: "'DM Mono', monospace", padding: "0 8px", outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {pageEls.length === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ textAlign: "center", color: "#333" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⊞</div>
                <div style={{ fontSize: 14 }}>Drag components from the left panel</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>or double-click a component to add</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Properties Panel */}
        {selectedEl && (
          <div style={{ width: propsWidth, background: "#131313", borderLeft: "1px solid #222", flexShrink: 0, overflow: "auto", padding: 12 }}>
            <div style={{ fontSize: 11, color: "#E8FA50", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Properties</div>

            <PropGroup label="Type">
              <span style={{ color: "#888", fontSize: 12 }}>{selectedEl.type}</span>
            </PropGroup>

            <PropGroup label="Text">
              <input value={selectedEl.text} onChange={(e) => updateEl("text", e.target.value)} onBlur={() => pushHistory(elements)} style={inputStyle} />
            </PropGroup>

            <PropGroup label="Position">
              <div style={{ display: "flex", gap: 6 }}>
                <NumInput label="X" value={selectedEl.x} onChange={(v) => updateElCommit("x", snap(v))} />
                <NumInput label="Y" value={selectedEl.y} onChange={(v) => updateElCommit("y", snap(v))} />
              </div>
            </PropGroup>

            <PropGroup label="Size">
              <div style={{ display: "flex", gap: 6 }}>
                <NumInput label="W" value={selectedEl.w} onChange={(v) => updateElCommit("w", snap(Math.max(10, v)))} />
                <NumInput label="H" value={selectedEl.h} onChange={(v) => updateElCommit("h", snap(Math.max(10, v)))} />
              </div>
            </PropGroup>

            <PropGroup label="Style">
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <NumInput label="Radius" value={selectedEl.radius} onChange={(v) => updateElCommit("radius", Math.max(0, v))} />
                <NumInput label="Font" value={selectedEl.fontSize} onChange={(v) => updateElCommit("fontSize", Math.max(8, v))} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                <span style={{ color: "#555", fontSize: 10, width: 40 }}>Fill</span>
                <input type="color" value={selectedEl.fill === "transparent" ? "#000000" : selectedEl.fill} onChange={(e) => updateElCommit("fill", e.target.value)} style={{ width: 28, height: 22, border: "1px solid #333", borderRadius: 3, background: "transparent", cursor: "pointer" }} />
                <button onClick={() => updateElCommit("fill", "transparent")} style={{ fontSize: 9, color: "#555", background: "transparent", border: "1px solid #333", borderRadius: 3, padding: "2px 6px", cursor: "pointer" }}>Clear</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                <span style={{ color: "#555", fontSize: 10, width: 40 }}>Opacity</span>
                <input type="range" min="0" max="1" step="0.05" value={selectedEl.opacity} onChange={(e) => updateElCommit("opacity", parseFloat(e.target.value))} style={{ flex: 1 }} />
                <span style={{ color: "#666", fontSize: 10, width: 28, textAlign: "right" }}>{Math.round(selectedEl.opacity * 100)}%</span>
              </div>
            </PropGroup>

            <PropGroup label="Actions">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <ActionBtn label="Duplicate" onClick={() => {
                  const newEl = { ...selectedEl, id: genId(), x: selectedEl.x + 20, y: selectedEl.y + 20 };
                  const newEls = { ...elements, [newEl.id]: newEl };
                  setElements(newEls);
                  pushHistory(newEls);
                  setSelectedId(newEl.id);
                }} />
                <ActionBtn label={selectedEl.locked ? "Unlock" : "Lock"} onClick={() => updateElCommit("locked", !selectedEl.locked)} />
                <ActionBtn label="Delete" danger onClick={() => {
                  const newEls = { ...elements };
                  delete newEls[selectedId];
                  setElements(newEls);
                  pushHistory(newEls);
                  setSelectedId(null);
                }} />
              </div>
            </PropGroup>

            <div style={{ marginTop: 16, padding: 8, background: "#1a1a1a", borderRadius: 6, fontSize: 10, color: "#444", lineHeight: 1.6 }}>
              <div style={{ color: "#666", marginBottom: 4 }}>Shortcuts</div>
              Del — Delete<br />
              ⌘D — Duplicate<br />
              ⌘Z / ⌘Y — Undo/Redo<br />
              ⌘C / ⌘V — Copy/Paste<br />
              Dbl-click — Edit text<br />
              Scroll — Zoom<br />
              Alt+drag — Pan
            </div>
          </div>
        )}
      </div>

      {/* Pages Bar */}
      <div style={{ height: 40, background: "#151515", borderTop: "1px solid #252525", display: "flex", alignItems: "center", padding: "0 12px", gap: 2, flexShrink: 0, overflow: "auto" }}>
        <span style={{ fontSize: 10, color: "#444", marginRight: 8, flexShrink: 0 }}>PAGES</span>
        {pages.map((pg, idx) => (
          <div
            key={pg.id}
            onClick={() => { setActivePage(pg.id); setSelectedId(null); }}
            onDoubleClick={() => {
              const name = prompt("Rename page:", pg.name);
              if (name) renamePage(pg.id, name);
            }}
            style={{ padding: "5px 14px", background: activePage === pg.id ? "rgba(232,250,80,0.1)" : "transparent", border: activePage === pg.id ? "1px solid #E8FA50" : "1px solid #252525", borderRadius: 5, cursor: "pointer", fontSize: 11, color: activePage === pg.id ? "#E8FA50" : "#666", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, whiteSpace: "nowrap" }}
          >
            {pg.name}
            {pages.length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); if (confirm("Delete this page?")) deletePage(pg.id); }} style={{ color: "#444", fontSize: 13, cursor: "pointer", lineHeight: 1 }}>×</span>
            )}
          </div>
        ))}
        <button onClick={addPage} style={{ width: 28, height: 28, background: "#1a1a1a", border: "1px solid #333", borderRadius: 5, color: "#E8FA50", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
      </div>
    </div>
  );
}

// --- Sub components ---
function ToolBtn({ icon, label, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "rgba(232,250,80,0.12)" : "transparent",
        border: active ? "1px solid rgba(232,250,80,0.3)" : "1px solid transparent",
        borderRadius: 5, color: active ? "#E8FA50" : disabled ? "#333" : "#888",
        cursor: disabled ? "not-allowed" : "pointer", fontSize: 16,
        fontFamily: "'DM Mono', monospace", transition: "all 0.15s",
      }}
    >{icon}</button>
  );
}

function PropGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: "#555", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      {children}
    </div>
  );
}

function NumInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ color: "#555", fontSize: 10, width: 14 }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ ...inputStyle, width: "100%" }} />
    </div>
  );
}

function ActionBtn({ label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ padding: "4px 10px", background: danger ? "rgba(255,80,80,0.1)" : "#1a1a1a", border: `1px solid ${danger ? "rgba(255,80,80,0.3)" : "#333"}`, borderRadius: 4, color: danger ? "#f66" : "#888", fontSize: 10, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>
      {label}
    </button>
  );
}

const inputStyle = {
  width: "100%", padding: "4px 8px", background: "#1a1a1a", border: "1px solid #333",
  borderRadius: 4, color: "#ccc", fontSize: 12, fontFamily: "'DM Mono', monospace",
  outline: "none", boxSizing: "border-box",
};
