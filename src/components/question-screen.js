window.QuestionScreen = QuestionScreen;

function QuestionScreen({ module: mod, onBack, onAnswer }) {
  const questions = QUESTION_BANKS[mod.id] || [];

  const renderScenario = (question) => {
    if (mod.type === "bidding" || mod.type === "conventions") {
      return (
        <>
          <div style={{ display: "flex", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Position</div>
              <div style={{ fontWeight: 700, color: "#1a1209" }}>{question.position}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Vul</div>
              <div style={{ fontWeight: 700, color: question.vulnerability === "Both" ? "#c0392b" : "#1a1209" }}>{question.vulnerability}</div>
            </div>
            {question.auction && question.auction.length > 0 && (
              <div style={{ width: "100%", marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Auction</div>
                {(() => {
                  const seats = ["West", "North", "East", "South"];
                  const posIdx = seats.indexOf(question.position);
                  const dealerIdx = question.dealer
                    ? seats.indexOf(question.dealer)
                    : (posIdx - (question.auction ? question.auction.length : 0) + 400) % 4;
                  const bids = question.auction || [];
                  const padded = Array(dealerIdx).fill(null).concat(bids);
                  const rows = [];
                  for (let i = 0; i < padded.length; i += 4) {
                    const row = padded.slice(i, i + 4);
                    while (row.length < 4) row.push(null);
                    rows.push(row);
                  }
                  if (!rows.length) rows.push([null, null, null, null]);
                  const bidColor = b => !b ? "#ccc" : b === "Pass" ? "#888" : b === "Dbl" || b === "Rdbl" ? "#c0392b" : b && (b.includes("♥") || b.includes("♦")) ? "#c0392b" : "#1a1209";
                  return (
                    <div style={{ border: "1px solid #e8dcc8", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#f5ede0" }}>
                        {seats.map(s => (
                          <div key={s} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: s === question.position ? "#8B4513" : "#888", letterSpacing: 1, padding: "5px 2px", textTransform: "uppercase", borderBottom: "1px solid #e8dcc8", background: s === question.position ? "#fdf3e3" : "transparent" }}>
                            {s}{s === question.position ? " ★" : ""}
                          </div>
                        ))}
                      </div >
                      {rows.map((row, ri) => (
                        <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: ri % 2 === 0 ? "#fff" : "#faf6f0" }}>
                          {[0,1,2,3].map(ci => {
                            const bid = row[ci];
                            const isYou = seats[ci] === question.position && ri === rows.length - 1 && !bid;
                            return (
                              <div key={ci} style={{ textAlign: "center", padding: "6px 2px", fontSize: 14, fontWeight: bid && bid !== "Pass" ? 700 : 400, color: bidColor(bid), fontFamily: "Georgia, serif" }}>
                                {isYou ? <span style={{ color: "#8B4513", fontWeight: 700 }}>?</span> : (bid || "—")}
                              </div>
                            );
                          })}
                        </div >
                      ))}
                    </div >
                  );
                })()}
              </div>
            )}
          </div>
          <div style={{ borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Your Hand</div>
            <Hand cards={question.hand} />
          </div >
        </>
      );
    }

    if (question.type === "count") {
      return (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Auction</div>
            {(() => {
              const seats = ["West", "North", "East", "South"];
              const dealer = question.dealer || "West";
              const dealerIdx = seats.indexOf(dealer);
              const bids = question.auction || [];
              const padded = Array(dealerIdx).fill(null).concat(bids);
              const rows = [];
              for (let i = 0; i < padded.length; i += 4) {
                const row = padded.slice(i, i + 4);
                while (row.length < 4) row.push(null);
                rows.push(row);
              }
              const bidColor = b => !b ? "#ccc" : b === "Pass" ? "#888" : b === "Dbl" || b === "Rdbl" ? "#c0392b" : b && (b.includes("♥") || b.includes("♦")) ? "#c0392b" : "#1a1209";
              return (
                <div style={{ border: "1px solid #e8dcc8", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "#f5ede0" }}>
                    {seats.map(s => (
                      <div key={s} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: s === question.position ? "#8B4513" : "#888", letterSpacing: 1, padding: "5px 2px", textTransform: "uppercase", borderBottom: "1px solid #e8dcc8", background: s === question.position ? "#fdf3e3" : "transparent" }}>
                        {s}{s === question.position ? " ★" : ""}
                      </div>
                    ))}
                  </div >
                  {rows.map((row, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: ri % 2 === 0 ? "#fff" : "#faf6f0" }}>
                      {[0,1,2,3].map(ci => {
                        const bid = row[ci];
                        return (
                          <div key={ci} style={{ textAlign: "center", padding: "6px 2px", fontSize: 13, fontWeight: bid && bid !== "Pass" ? 700 : 400, color: bidColor(bid), fontFamily: "Georgia, serif" }}>
                            {bid || "—"}
                          </div>
                        );
                      })}
                    </div >
                  ))}
                </div >
              );
            })()}
          </div >
          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
              <div style={{ fontWeight: 700, color: "#1a1209", fontSize: 15 }}>{question.contract}</div>
            </div >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Lead</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: question.lead && (question.lead.includes("♥") || question.lead.includes("♦")) ? "#c0392b" : "#1a1209" }}>{question.lead}</div>
            </div >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Partner's Card</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: question.partnerCard && (question.partnerCard.includes("♥") || question.partnerCard.includes("♦")) ? "#c0392b" : "#1a1209" }}>
                {question.partnerCard}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#888", marginLeft: 6 }}>({question.partnerSignalMeaning})</span>
              </div >
            </div >
          </div >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Dummy</div>
              <Hand cards={question.dummy} />
            </div >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Your Hand</div>
              <Hand cards={question.hand} />
            </div >
          </div >
        </>
      );
    }

    return (
      <>
        <div style={{ display: "flex", gap: 20, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
            <div style={{ fontWeight: 700, color: "#1a1209", fontSize: 16 }}>{question.contract}</div>
          </div >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>By</div>
            <div style={{ fontWeight: 700, color: "#1a1209" }}>{question.declarer}</div>
          </div >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Lead</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: question.lead && (question.lead.includes("♥") || question.lead.includes("♦")) ? "#c0392b" : "#1a1209" }}>{question.lead}</div>
          </div >
        </div >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid #e8dcc8", paddingTop: 14 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Dummy (North)</div>
            <Hand cards={question.dummy} />
          </div >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>You (South)</div>
            <Hand cards={question.hand} />
          </div >
        </div >
      </>
    );
  };

  const renderQuestionText = (question) => (
    <div style={{ marginTop: 14, padding: "12px 14px", background: "#faf6f0", borderRadius: 10, borderLeft: "3px solid #8B7355" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#1a1209", fontWeight: 600, lineHeight: 1.4 }}>
        {question.question}
      </div >
    </div >
  );

  return (
    <QuestionBase
      questions={questions}
      onBack={onBack}
      onAnswer={onAnswer}
      headerProps={{
        title: mod.title,
        typeLabel: mod.type === "bidding" ? "🗣️ Bidding" : mod.type === "conventions" ? "🎴 Conventions" : mod.type === "scoring" ? "🧮 Scoring" : "🃏 Card Play",
        extra: `${questions[0]?.points || 0} pts`
      }}
      renderScenario={renderScenario}
      renderQuestionText={renderQuestionText}
    />
  );
}
