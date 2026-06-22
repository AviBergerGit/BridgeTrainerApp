window.ScoringScreen = ScoringScreen;

function ScoringScreen({ onBack, onAnswer }) {
  const [score, setScore] = useState(0);
  const [questions] = useState(() => {
    const shuffled = [...SCORING_BANK].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10).map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) }));
  });

  const internalOnAnswer = (correct, qIndex) => {
    onAnswer(correct);
    if (correct) {
      setScore(s => s + questions[qIndex].points);
    }
  };

  const renderScenario = (question) => (
    <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Contract</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1209" }}>{question.contract}</div>
      </div >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Result</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: question.result?.startsWith("-") ? "#c0392b" : "#2e7d32" }}>{question.result}</div>
      </div >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Vul</div>
        <div style={{ fontWeight: 700, color: question.vulnerable === "VUL" ? "#c0392b" : "#1a1209" }}>{question.vulnerable}</div>
      </div >
      {question.doubled && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Status</div>
          <div style={{ fontWeight: 700, color: "#c0392b" }}>Doubled</div>
        </div >
      )}
    </div >
  );

  const renderQuestionText = (question) => (
    <div style={{ background: "#faf6f0", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #c4a882", fontSize: 15, color: "#2d200e", fontStyle: "italic" }}>
      {question.question}
    </div >
  );

  return (
    <QuestionBase
      questions={questions}
      onBack={onBack}
      onAnswer={internalOnAnswer}
      headerProps={{
        title: "Bridge Scoring",
        typeLabel: "🧮 Scoring · Duplicate Bridge",
        extra: `Score: ${score} pts`
      }}
      renderScenario={renderScenario}
      renderQuestionText={renderQuestionText}
    />
  );
}
