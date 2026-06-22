
const { useState, useEffect } = React;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SUIT_SYMBOLS = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
const SUIT_COLORS  = { spades: "#1a1a2e", hearts: "#c0392b", diamonds: "#c0392b", clubs: "#1a1a2e" };
const difficultyColor = (d) => ({ Beginner: "#27ae60", Intermediate: "#f39c12", Advanced: "#e74c3c" }[d] || "#888");

function Hand({ cards }) {
  if (!cards) return null;
  return (
    <div>
      {Object.entries(cards).map(([suit, holding]) => (
        <div key={suit} style={{ display: "flex", gap: 6, marginBottom: 3 }}>
          <span style={{ color: SUIT_COLORS[suit], fontWeight: 700, width: 18, fontSize: 15 }}>{SUIT_SYMBOLS[suit]}</span>
          <span style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: 1 }}>{holding.replace(/T/g, "10")}</span>
        </div>
      ))}
    </div>
  );
}


// ─── App ─────────────────────────────────────────────────────────────────────

function BridgeTrainer() {
  const [screen, setScreen] = useState("home");
  const [activeModule, setActiveModule] = useState(null);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('bridge-trainer-stats');
    return saved ? JSON.parse(saved) : {
      total: 0, correct: 0, streak: 0,
      biddingTotal: 0, biddingCorrect: 0,
      playTotal: 0, playCorrect: 0,
      moduleProgress: {},
    };
  });

  useEffect(() => {
    localStorage.setItem('bridge-trainer-stats', JSON.stringify(stats));
  }, [stats]);

  const navigate = (dest, mod = null) => {
    setScreen(dest);
    if (mod) setActiveModule(mod);
  };

  const handleAnswer = (correct, isLeads = false) => {
    setStats((prev) => {
      const mp = { ...prev.moduleProgress };
      if (!isLeads && activeModule) {
        const cur = mp[activeModule.id] || { correct: 0, total: 0 };
        mp[activeModule.id] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
      }
      if (isLeads) {
        const cur = mp["leads"] || { correct: 0, total: 0 };
        mp["leads"] = { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 };
      }
      const isBidding = !isLeads && activeModule && activeModule.type === "bidding";
      const isPlay = !isLeads && activeModule && activeModule.type === "play";
      return {
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + (correct ? 1 : 0),
        streak: correct ? prev.streak + 1 : 0,
        biddingTotal:   isBidding ? prev.biddingTotal + 1 : prev.biddingTotal,
        biddingCorrect: isBidding && correct ? prev.biddingCorrect + 1 : prev.biddingCorrect,
        playTotal:      isPlay || isLeads ? prev.playTotal + 1 : prev.playTotal,
        playCorrect:    (isPlay || isLeads) && correct ? prev.playCorrect + 1 : prev.playCorrect,
        moduleProgress: mp,
      };
    });
  };

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "#faf6f0", fontFamily: "'Georgia', serif",
      position: "relative", overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #e8dcc8; }
      `}</style>

      {screen === "home" && <HomeScreen stats={stats} onNavigate={navigate} />}
      {screen === "question" && activeModule && activeModule.id !== "scoring-1" && (
        <QuestionScreen
          module={activeModule}
          onBack={() => setScreen("home")}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "question" && activeModule && activeModule.id === "scoring-1" && (
        <ScoringScreen
          onBack={() => setScreen("home")}
          onAnswer={handleAnswer}
        />
      )}
      {screen === "stats" && <StatsScreen stats={stats} onBack={() => setScreen("home")} />}
      {screen === "leads" && (
        <LeadsScreen
          onBack={() => setScreen("home")}
          onAnswer={(correct) => handleAnswer(correct, true)}
        />
      )}

      {screen !== "leads" && (
        <div style={{
          textAlign: "center", padding: "16px 0 24px",
          fontSize: 11, color: "#999", fontFamily: "Georgia, serif",
          borderTop: "1px solid #e0d8cc", marginTop: 8,
        }}>
          <div style={{
            fontSize: 10, color: "#aaa", fontStyle: "italic",
            marginBottom: 10, lineHeight: 1.6,
            padding: "8px 12px", background: "#f5ede0",
            borderRadius: 8, border: "1px solid #e8dcc8",
          }}>
            ⚠️ Questions may contain errors. Found a mistake?{" "}
            <a href="mailto:bridgetrainergame@gmail.com" style={{ color: "#9b7d5a", textDecoration: "underline" }}>
              bridgetrainergame@gmail.com
            </a>
          </div>
          Developed by <strong style={{ color: "#7a6248" }}>Avi Berger</strong>
          <br />
          <a href="mailto:bridgetrainergame@gmail.com" style={{ color: "#9b7d5a", textDecoration: "none" }}>
            bridgetrainergame@gmail.com
          </a>
          {screen === "home" && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#bbb", letterSpacing: 1 }}>
              v3.1.0
            </div>
          )}
        </div>
      )}
    </div>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(BridgeTrainer));
