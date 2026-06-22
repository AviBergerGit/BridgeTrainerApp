window.QuestionBase = QuestionBase;

function QuestionBase({
  questions,
  onBack,
  onAnswer,
  headerProps,
  renderScenario,
  renderQuestionText
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const question = questions[qIndex];
  if (!question) return null;

  const isCorrect = selected === question.correct;
  const isLastQuestion = qIndex >= questions.length - 1;

  const handleSubmit = () => {
    if (selected) {
      setRevealed(true);
      onAnswer(selected === question.correct, qIndex);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onBack();
    } else {
      setSelected(null);
      setRevealed(false);
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)", padding: "20px 20px 24px" }}>
        <button
          onClick={onBack}
          style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#f0c060", fontSize: 14, cursor: "pointer", padding: "6px 12px", borderRadius: 8, marginBottom: 14 }}
        >← Back</button>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#8B7355", textTransform: "uppercase", marginBottom: 4 }}>
          {headerProps.typeLabel}
        </div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f0c060", fontWeight: 700 }}>{headerProps.title}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              height: 6, flex: 1, borderRadius: 3,
              background: i < qIndex ? "#f0c060" : i === qIndex ? "#fff" : "rgba(255,255,255,0.25)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#8B7355", marginTop: 6 }}>
          {headerProps.subtitle || `Question ${qIndex + 1} of ${questions.length}`} {headerProps.extra && ` · ${headerProps.extra}`}
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "#fff", border: "1.5px solid #e8dcc8", borderRadius: 14, padding: 18, marginBottom: 16 }}>
          {renderScenario(question)}
          {renderQuestionText(question)}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {question.options.map((opt) => {
            let bg = "#fff", border = "1.5px solid #e8dcc8", color = "#1a1209";
            if (revealed) {
              if (opt === question.correct) { bg = "#eafaf1"; border = "2px solid #27ae60"; color = "#1e8449"; }
              else if (opt === selected) { bg = "#fdedec"; border = "2px solid #e74c3c"; color = "#c0392b"; }
            } else if (opt === selected) {
              bg = "#f0e8d8"; border = "2px solid #8B7355";
            }
            return (
              <div
                key={opt}
                onClick={() => { if (!revealed) setSelected(opt); }}
                style={{ background: bg, border, color, borderRadius: 12, padding: "14px 18px",
                  cursor: revealed ? "default" : "pointer", fontFamily: "Georgia, serif", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s", lineHeight: 1.4,
                }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                  border: revealed
                    ? (opt === question.correct ? "2px solid #27ae60" : opt === selected ? "2px solid #e74c3c" : "2px solid #ddd")
                    : `2px solid ${opt === selected ? "#8B7355" : "#ddd"}`,
                  background: revealed
                    ? (opt === question.correct ? "#27ae60" : opt === selected ? "#e74c3c" : "transparent")
                    : (opt === selected ? "#8B7355" : "transparent"),
                }} />
                {opt}
              </div>
            );
          })}
        </div>

        {revealed && (
          <div style={{
            background: isCorrect ? "linear-gradient(135deg,#eafaf1,#d5f5e3)" : "linear-gradient(135deg,#fdedec,#fad7d3)",
            border: `1.5px solid ${isCorrect ? "#27ae60" : "#e74c3c"}`,
            borderRadius: 14, padding: 18, marginBottom: 18,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{isCorrect ? "🎉" : "💡"}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: isCorrect ? "#1e8449" : "#c0392b" }}>
                {isCorrect ? `Correct! +${question.points} pts` : `Correct answer: ${question.correct}`}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#333", lineHeight: 1.7, margin: 0 }}>{question.explanation}</p>
          </div>
        )}

        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            style={{
              width: "100%", padding: "16px",
              background: selected ? "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)" : "#ddd",
              color: selected ? "#f0c060" : "#aaa", border: "none", borderRadius: 12,
              fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700,
              cursor: selected ? "pointer" : "not-allowed", letterSpacing: 0.5,
            }}
          >Submit Answer</button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #1a1209 0%, #2d200e 100%)",
              color: "#f0c060", border: "none", borderRadius: 12,
              fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700,
              cursor: "pointer", letterSpacing: 0.5,
            }}
          >{isLastQuestion ? "Finish Module ✓" : "Next Question →"}</button>
        )}
      </div>
    </div>
  );
}
