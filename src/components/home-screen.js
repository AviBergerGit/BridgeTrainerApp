
window.HomeScreen = HomeScreen;
function HomeScreen({ stats, onNavigate }) {
  const winRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");

  const filteredModules = MODULES.filter((mod) => {
    if (mod.hidden) return false;
    const typeMatch = activeFilter === "all" || mod.type === activeFilter;
    const diffMatch = activeDifficulty === "all" || mod.difficulty === activeDifficulty;
    return typeMatch && diffMatch;
  });

  const filterTabStyle = (key, color) => ({
    flex: 1, padding: "9px 4px", border: "none", borderRadius: 10, cursor: "pointer",
    fontSize: 12, fontWeight: 700, letterSpacing: 0.3, transition: "all 0.2s",
    background: activeFilter === key ? color : "transparent",
    color: activeFilter === key ? "#fff" : "#8B7355",
    boxShadow: activeFilter === key ? `0 2px 8px ${color}55` : "none",
  });

  const diffTabStyle = (key) => {
    const colors = { all: "#8B7355", Beginner: "#27ae60", Intermediate: "#f39c12", Advanced: "#e74c3c" };
    const c = colors[key];
    return {
      padding: "6px 12px", border: `1.5px solid ${activeDifficulty === key ? c : "#e8dcc8"}`,
      borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
      background: activeDifficulty === key ? c : "#fff",
      color: activeDifficulty === key ? "#fff" : "#888", transition: "all 0.2s",
    };
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#8B7355", textTransform: "uppercase", marginBottom: 4 }}>
          Standard American Yellow Card
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#1a1209", margin: 0 }}>
          Bridge Trainer
        </h1>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24,
        background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", borderRadius: 16, padding: 18,
      }}>
        {[
          { label: "Win Rate", value: `${winRate}%` },
          { label: "Streak",   value: `${stats.streak}🔥` },
          { label: "Played",   value: stats.total },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f0c060", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#8B7355", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 10 }}>
          Filter Modules
        </div>
        <div style={{ display: "flex", gap: 6, background: "#f0e8d8", borderRadius: 14, padding: 5, marginBottom: 12 }}>
          <button onClick={() => setActiveFilter("all")}         style={filterTabStyle("all",         "#8B7355")}>🂠 All</button>
          <button onClick={() => setActiveFilter("bidding")}     style={filterTabStyle("bidding",     "#2980b9")}>🗣️ Bidding</button>
          <button onClick={() => setActiveFilter("play")}        style={filterTabStyle("play",        "#d4ac0d")}>🃏 Play</button>
          <button onClick={() => setActiveFilter("conventions")} style={filterTabStyle("conventions", "#8e44ad")}>🎴 Conv</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["all", "Beginner", "Intermediate", "Advanced"].map((d) => (
            <button key={d} onClick={() => setActiveDifficulty(d)} style={diffTabStyle(d)}>
              {d === "all" ? "All Levels" : d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase" }}>Training Modules</div>
        <div style={{ fontSize: 11, color: "#aaa" }}>{filteredModules.length} of {MODULES.length} shown</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredModules.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#aaa", fontFamily: "'Playfair Display', serif", fontSize: 15 }}>
            No modules match your filters.<br />
            <span style={{ fontSize: 12, fontFamily: "Georgia, serif" }}>Try a different combination.</span>
          </div>
        )}
        {filteredModules.map((mod) => {
          const progress = stats.moduleProgress[mod.id] || { correct: 0, total: 0 };
          const completionPct = mod.totalQuestions ? Math.min(100, Math.round((progress.total / mod.totalQuestions) * 100)) : Math.min(100, progress.total * 5);
          const winPct = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0;
          return (
            <div
              key={mod.id}
              onClick={() => onNavigate(mod.id === "leads" ? "leads" : "question", mod)}
              style={{
                background: "#fff", borderRadius: 14, padding: "16px 18px",
                border: "1.5px solid #e8dcc8", cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 17 }}>{mod.type === "bidding" ? "🗣️" : mod.type === "conventions" ? "🎴" : "🃏"}</span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
                      background: mod.type === "bidding" ? "#e8f4fd" : mod.type === "conventions" ? "#f5eef8" : "#fef9e7",
                      color:      mod.type === "bidding" ? "#2980b9" : mod.type === "conventions" ? "#8e44ad" : "#d4ac0d",
                    }}>{mod.type}</span>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#1a1209", marginBottom: 3 }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{mod.description}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <span style={{ fontSize: 10, color: difficultyColor(mod.difficulty), fontWeight: 600 }}>{mod.difficulty}</span>
                  {progress.total > 0 && <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1209", marginTop: 4 }}>{completionPct}%</div>}
                </div>
              </div>
              <div style={{ marginTop: 12, background: "#f0e8d8", borderRadius: 4, height: 4 }}>
                <div style={{
                  height: 4, borderRadius: 4, transition: "width 0.5s",
                  width: `${mod.totalQuestions ? Math.min(100, (progress.total / mod.totalQuestions) * 100) : Math.min(100, progress.total * 5)}%`,
                  background: "linear-gradient(90deg, #8B7355, #c0a060)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "#aaa" }}>{mod.totalQuestions ? `${progress.total}/${mod.totalQuestions}` : progress.total} attempted</span>
                {progress.total > 0 && <span style={{ fontSize: 10, color: "#aaa" }}>{winPct}% correct</span>}
              </div>
              {mod.refLink && (
                <a
                  href={mod.refLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    marginTop: 10, fontSize: 11, color: "#9b7d5a",
                    textDecoration: "none", fontWeight: 600,
                    borderTop: "1px solid #f0e8d8", paddingTop: 8, width: "100%",
                  }}
                >
                  📖 {mod.refLabel}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate("stats")}
        style={{
          marginTop: 20, width: "100%", padding: "14px",
          border: "1.5px solid #1a1209", background: "transparent", borderRadius: 12,
          fontFamily: "'Playfair Display', serif", fontSize: 15, cursor: "pointer",
          color: "#1a1209", letterSpacing: 0.5,
        }}
      >
        View Full Statistics →
      </button>
    </div>
  );
}
