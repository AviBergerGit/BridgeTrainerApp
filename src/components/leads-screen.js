window.LeadsScreen = LeadsScreen;
function LeadsScreen({ onBack, onAnswer }) {
  const [hand, setHand] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const newHand = () => {
    const sc = leadGetRandomScenario();
    setScenario(sc);
    setHand(leadGenerateHand(sc));
    setFeedback(null);
  };

  useEffect(() => { newHand(); }, []);
  if (!hand || !scenario) return null;

  const handleCard = (suit, card) => {
    const result = leadEvaluate(card, suit, hand, scenario);
    setFeedback(result);
    const correct = result.correct;
    setStats(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    onAnswer(correct);
  };

  const suitColor = s => s === "♠" ? "#2c3e7a" : s === "♥" ? "#b91c1c" : s === "♦" ? "#c2510a" : "#1a6b2e";
  const suitBg   = s => s === "♠" ? "#e8eeff" : s === "♥" ? "#fff0f0" : s === "♦" ? "#fff5eb" : "#edfff2";
  const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const strategy = leadGetStrategy(scenario, hand);

  const positions = ["West", "North", "East", "South"];
  const bids = scenario.bids || [];
  const dealerIdx = bids.length ? positions.indexOf(bids[0].seat) : 0;
  const rows = [];
  let bidIdx = 0;
  const firstRow = ["", "", ""];
  for (let i = 0; i < 4 - dealerIdx && bidIdx < bids.length; i++) {
    firstRow[positions.indexOf(bids[bidIdx].seat)] = bids[bidIdx].call; bidIdx++;
  }
  rows.push(firstRow);
  while (bidIdx < bids.length) {
    const row = ["", "", ""];
    for (let i = 0; i < 4 && bidIdx < bids.length; i++) {
      row[positions.indexOf(bids[bidIdx].seat)] = bids[bidIdx].call; bidIdx++;
    }
    rows.push(row);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0d1b2a 0%, #1a2f45 100%)", padding: "20px 20px 28px" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#7dd3fc", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#7dd3fc", fontWeight: 700 }}>Opening Leads</div>
        <div style={{ fontSize: 12, color: "#4a6fa5", marginTop: 2 }}>You are West — choose your opening lead</div>
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {[["✓", stats.correct, "#4ade80"], ["Total", stats.total, "#7dd3fc"], ["Rate", `${rate}%`, "#fbbf24"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Auction */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ color: "#7dd3fc", fontWeight: 700, fontSize: 13, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Auction</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 8 }}>
            {["West", "North", "East", "South"].map(p => (
              <div key={p} style={{ color: "#4ade80", fontWeight: 700, fontSize: 11, textAlign: "center" }}>{p}</div>
            ))}
          </div>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginBottom: 2 }}>
              {row.map((call, ci) => (
                <div key={ci} style={{ textAlign: "center", fontSize: 13, fontFamily: "monospace", padding: "3px 2px",
                  color: call === "Pass" ? "#475569" : call === "Dbl" ? "#fbbf24" : call ? "#f1f5f9" : "#1e293b",
                  fontWeight: call && call !== "Pass" ? 700 : 400 }}>
                  {call || "—"}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(251,191,36,0.15)", borderRadius: 8, color: "#fbbf24", fontWeight: 700, fontSize: 15 }}>
            ➜ {scenario.contract}
          </div>
          {scenario.partnerBid && (
            <div style={{ marginTop: 8, padding: "7px 12px", background: "rgba(74,222,128,0.12)", borderRadius: 8, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
              💡 Partner bid {scenario.partnerBid} — lead partner's suit!
            </div>
          )}
          {scenario.partnerDoubled && (
            <div style={{ marginTop: 8, padding: "7px 12px", background: "rgba(251,191,36,0.12)", borderRadius: 8, color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>
              ⚡ Partner doubled — lead your best/longest suit
            </div>
          )}
        </div>

        {/* Strategy hint */}
        <div style={{ background: strategy.strategy === "active" ? "rgba(239,68,68,0.1)" : strategy.strategy === "passive" ? "rgba(34,197,94,0.1)" : "rgba(148,163,184,0.1)",
          border: `1px solid ${strategy.strategy === "active" ? "#ef444440" : strategy.strategy === "passive" ? "#22c55e40" : "#94a3b840"}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: strategy.strategy === "active" ? "#f87171" : strategy.strategy === "passive" ? "#4ade80" : "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
            {strategy.strategy} Lead Strategy
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 3 }}>{strategy.reason}</div>
          <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500, marginTop: 2 }}>→ {strategy.priority}</div>
        </div>

        {/* Hand */}
        <div style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#8B7355", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Your Hand (West)</div>
          {LEAD_SUITS.map(suit => (
            <div key={suit} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, minWidth: 26, color: suitColor(suit) }}>{suit}</span>
              <span style={{ fontFamily: "monospace", fontSize: 15, letterSpacing: 3, color: "#1a1209" }}>
                {hand[suit].length ? hand[suit].join(" ") : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Card buttons */}
        {!feedback && (
          <>
            <div style={{ fontSize: 13, color: "#8B7355", fontWeight: 700, textAlign: "center", marginBottom: 10 }}>Tap a card to lead:</div>
            {LEAD_SUITS.map(suit => hand[suit].length > 0 && (
              <div key={suit} style={{ background: suitBg(suit), border: `1.5px solid ${suitColor(suit)}30`, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: suitColor(suit) }}>{suit}</span>
                  <span style={{ fontSize: 12, color: "#8B7355" }}>
                    {suit==="♠"?"Spades":suit==="♥"?"Hearts":suit==="♦"?"Diamonds":"Clubs"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {hand[suit].map(card => (
                    <button key={`${suit}${card}`} onClick={() => handleCard(suit, card)}
                      style={{ padding: "10px 14px", background: "#fff", border: `2px solid ${suitColor(suit)}`, borderRadius: 10,
                        color: suitColor(suit), fontSize: 18, fontWeight: 700, fontFamily: "monospace",
                        cursor: "pointer", minWidth: 46, minHeight: 46, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                      {card}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{ borderRadius: 14, padding: 20, marginBottom: 16,
            border: `2px solid ${feedback.correct ? "#16a34a" : "#dc2626"}`,
            background: feedback.correct ? "#f0fdf4" : "#fff5f5" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: feedback.correct ? "#15803d" : "#dc2626" }}>
              {feedback.correct ? "✓ Correct!" : "✗ Not Optimal"}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line", color: "#374151" }}>{feedback.message}</div>
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button onClick={newHand} style={{ padding: "12px 32px", background: "linear-gradient(135deg, #0d1b2a, #1a2f45)",
                border: "none", borderRadius: 12, color: "#7dd3fc", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Next Hand →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
