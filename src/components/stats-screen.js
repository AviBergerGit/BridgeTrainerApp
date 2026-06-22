window.StatsScreen = StatsScreen;
function StatsScreen({ stats, onBack }) {
  const winRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  // Category summaries — denominator is TOTAL POSSIBLE questions (not just attempted)
  const calcCatPct = (mods) => {
    const correct  = mods.reduce((s, m) => s + (stats.moduleProgress[m.id]?.correct || 0), 0);
    const possible = mods.reduce((s, m) => s + (m.totalQuestions || 0), 0);
    return { correct, possible, pct: possible > 0 ? Math.round(correct / possible * 100) : 0 };
  };
  const biddingMods = MODULES.filter(m => !m.hidden && m.type === "bidding");
  const playMods    = MODULES.filter(m => !m.hidden && m.type === "play");
  const convMods    = MODULES.filter(m => !m.hidden && m.type === "conventions");
  const biddingCat  = calcCatPct(biddingMods);
  const playCat     = calcCatPct(playMods);
  const convCat     = calcCatPct(convMods);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", padding: "20px 20px 32px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f0c060", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#f0c060", fontWeight: 700 }}>Statistics</div>
        <div style={{ fontSize: 12, color: "#8B7355" }}>SAYC Performance Overview</div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{
          background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)",
          borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: "#f0c060", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{winRate}%</div>
          <div style={{ color: "#8B7355", fontSize: 13, marginTop: 6 }}>Overall Accuracy</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
            {[{ v: stats.correct, l: "Correct" }, { v: stats.total, l: "Total" }, { v: `${stats.streak}🔥`, l: "Streak" }].map((x) => (
              <div key={x.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{x.v}</div>
                <div style={{ fontSize: 11, color: "#8B7355" }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {[
          { label: "Bidding",     icon: "🗣️", cat: biddingCat, color: "#2980b9" },
          { label: "Card Play",   icon: "🃏", cat: playCat,    color: "#d4ac0d" },
          { label: "Conventions", icon: "🎴", cat: convCat,    color: "#8e44ad" },
        ].map((t) => {
          return (
            <div key={t.label} style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{t.icon}</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16 }}>{t.label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 700, color: t.color }}>{t.cat.pct}%</span>
              </div>
              <div style={{ background: "#f0e8d8", borderRadius: 6, height: 8 }}>
                <div style={{ height: 8, borderRadius: 6, width: `${t.cat.pct}%`, background: `linear-gradient(90deg, ${t.color}88, ${t.color})`, transition: "width 0.8s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>{t.cat.correct} correct</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>{t.cat.possible} possible</span>
              </div>
            </div>
          );
        })}

        <div style={{ fontSize: 11, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 12, marginTop: 8 }}>Module Breakdown</div>
        {MODULES.filter(m => !m.hidden).map((mod) => {
          const p = stats.moduleProgress[mod.id] || { correct: 0, total: 0 };
          const winPct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
          const barWidth = mod.totalQuestions ? Math.min(100, Math.round((p.total / mod.totalQuestions) * 100)) : Math.min(100, p.total * 5);
          const completionPct = mod.totalQuestions ? Math.min(100, Math.round((p.total / mod.totalQuestions) * 100)) : barWidth;
          return (
            <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>{mod.type === "bidding" ? "🗣️" : mod.type === "conventions" ? "🎴" : "🃏"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1209" }}>{mod.title}</span>
                  <span style={{ fontSize: 13, color: "#888" }}>{p.total > 0 ? `${completionPct}%` : "—"}</span>
                </div>
                <div style={{ background: "#f0e8d8", borderRadius: 4, height: 5 }}>
                  <div style={{ height: 5, borderRadius: 4, width: `${barWidth}%`, background: "linear-gradient(90deg,#8B7355,#c0a060)", transition: "width 0.6s" }} />
                </div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 3 }}>{mod.totalQuestions ? `${p.total}/${mod.totalQuestions}` : p.total} attempted</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
