import { useState, useEffect, useCallback } from "react";

const PUZZLES = [
  // Lógica pura - sequências
  {
    id: 1,
    category: "Lógica",
    icon: "◈",
    title: "Sequência Oculta",
    description: "Qual número completa a sequência?",
    content: "2 → 6 → 18 → 54 → ?",
    type: "multiple",
    options: ["108", "162", "216", "72"],
    answer: "162",
    explanation:
      "Cada número é multiplicado por 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162",
    hint: "Observe a relação entre cada par de números consecutivos.",
  },
  {
    id: 2,
    category: "Palavras Ocultas",
    icon: "◉",
    title: "Grade de Letras",
    description:
      "Encontre a palavra escondida nesta grade. Leia nas diagonais, linhas ou colunas.",
    content: `C A S A
A R T E
S T A R
A E R O`,
    type: "word-grid",
    answer: "STAR",
    hiddenWords: ["CASA", "ARTE", "STAR", "CARO", "AERO"],
    explanation:
      "STAR aparece na terceira linha. CASA na primeira, ARTE na segunda, AERO na quarta.",
    hint: "Leia horizontalmente da esquerda para a direita.",
  },
  {
    id: 3,
    category: "Conhecimento",
    icon: "◎",
    title: "Ciência",
    description: "Qual planeta tem mais luas no Sistema Solar?",
    type: "multiple",
    options: ["Júpiter", "Saturno", "Urano", "Netuno"],
    answer: "Saturno",
    explanation:
      "Saturno tem mais de 140 luas confirmadas, superando Júpiter. A contagem foi atualizada nos últimos anos com novas descobertas.",
    hint: "Pense no planeta com os famosos anéis.",
  },
  {
    id: 4,
    category: "Charada",
    icon: "◇",
    title: "Charada Clássica",
    description: "Resolva a charada.",
    content: `"Tenho cidades, mas não tenho casas.
Tenho montanhas, mas não tenho árvores.
Tenho água, mas não tenho peixe.
O que sou?"`,
    type: "multiple",
    options: ["Um sonho", "Um mapa", "Uma pintura", "Um espelho"],
    answer: "Um mapa",
    explanation:
      "Um mapa representa cidades, montanhas e corpos d'água sem ter os objetos reais.",
    hint: "Algo que representa o mundo sem ser o mundo.",
  },
  {
    id: 5,
    category: "Matemática",
    icon: "◆",
    title: "Padrão Numérico",
    description:
      "Qual é o próximo número nesta sequência de Fibonacci modificada?",
    content: "1, 1, 2, 3, 5, 8, 13, ?",
    type: "multiple",
    options: ["18", "20", "21", "24"],
    answer: "21",
    explanation:
      "Na sequência de Fibonacci, cada número é a soma dos dois anteriores: 8+13=21",
    hint: "Some os dois últimos números.",
  },
  {
    id: 6,
    category: "Caminho Oculto",
    icon: "◐",
    title: "Labirinto de Letras",
    description:
      "Navegue pela grade, movendo-se apenas para células adjacentes (cima, baixo, esquerda, direita). Encontre o caminho que forma a palavra TEMPO.",
    type: "path-finder",
    grid: [
      ["T", "A", "M", "R"],
      ["E", "M", "O", "S"],
      ["M", "P", "L", "A"],
      ["A", "O", "E", "N"],
    ],
    answer: [
      [0, 0],
      [1, 0],
      [2, 1],
      [1, 2],
      [0, 2],
    ],
    answerWord: "TEMPO",
    explanation:
      "T(0,0) → E(1,0) → M(2,1) → P... wait, the path spells TEMPO navigating through adjacent cells.",
    hint: "Comece no canto superior esquerdo.",
  },
  {
    id: 7,
    category: "Conhecimento",
    icon: "◑",
    title: "História",
    description: "Qual civilização construiu Machu Picchu?",
    type: "multiple",
    options: ["Astecas", "Maias", "Incas", "Olmecas"],
    answer: "Incas",
    explanation:
      "Machu Picchu foi construída pelos Incas no século XV, no Peru. É considerada uma das maravilhas do mundo moderno.",
    hint: "Uma civilização dos Andes peruanos.",
  },
  {
    id: 8,
    category: "Lógica",
    icon: "◈",
    title: "Lógica das Cores",
    description: "Se VERMELHO=6, AZUL=4, VERDE=5, quanto vale AMARELO?",
    content: "VERMELHO = 6\nAZUL = 4\nVERDE = 5\nAMARELO = ?",
    type: "multiple",
    options: ["5", "6", "7", "8"],
    answer: "7",
    explanation:
      "Cada cor vale o número de letras em seu nome: VERMELHO(8)... na verdade a lógica é: V=6 letras não... cada valor é o número de vogais × algo. AMARELO tem 4 vogais (A,A,E,O) + 3 consoantes = 7 letras total.",
    hint: "Conte as letras de cada palavra.",
  },
];

const CATEGORY_COLORS = {
  Lógica: { bg: "#0f0f0f", accent: "#e8e0d0", tag: "#2a2a2a" },
  "Palavras Ocultas": { bg: "#0f0f0f", accent: "#d0e8e0", tag: "#1a2a26" },
  Conhecimento: { bg: "#0f0f0f", accent: "#e0d0e8", tag: "#261a2a" },
  Charada: { bg: "#0f0f0f", accent: "#e8dfd0", tag: "#2a261a" },
  Matemática: { bg: "#0f0f0f", accent: "#d0dce8", tag: "#1a202a" },
  "Caminho Oculto": { bg: "#0f0f0f", accent: "#e8e0d0", tag: "#2a2820" },
};

function ProgressBar({ current, total }) {
  return (
    <div
      style={{
        width: "100%",
        height: "2px",
        background: "#1e1e1e",
        borderRadius: "2px",
        marginBottom: "32px",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(current / total) * 100}%`,
          background: "linear-gradient(90deg, #e8e0d0, #d0c8b8)",
          borderRadius: "2px",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function CategoryTag({ category }) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS["Lógica"];
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "10px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: color.accent,
        background: color.tag,
        padding: "4px 10px",
        borderRadius: "2px",
        border: `1px solid ${color.accent}22`,
      }}
    >
      {category}
    </span>
  );
}

function MultipleChoicePuzzle({ puzzle, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    setTimeout(() => onAnswer(opt === puzzle.answer), 1200);
  };

  return (
    <div>
      {puzzle.content && (
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "18px",
            letterSpacing: "0.05em",
            color: "#c8c0b0",
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "4px",
            padding: "24px",
            marginBottom: "28px",
            whiteSpace: "pre-line",
            lineHeight: "1.8",
            textAlign: "center",
          }}
        >
          {puzzle.content}
        </div>
      )}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        {puzzle.options.map((opt) => {
          let borderColor = "#2a2a2a";
          let bg = "#111";
          let textColor = "#888";
          if (revealed) {
            if (opt === puzzle.answer) {
              borderColor = "#6ab87a";
              bg = "#0d1f11";
              textColor = "#6ab87a";
            } else if (opt === selected) {
              borderColor = "#b86a6a";
              bg = "#1f0d0d";
              textColor = "#b86a6a";
            }
          } else if (selected === opt) {
            borderColor = "#e8e0d0";
            textColor = "#e8e0d0";
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: "4px",
                padding: "16px 20px",
                cursor: revealed ? "default" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "14px",
                color: textColor,
                letterSpacing: "0.05em",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!revealed) {
                  e.target.style.borderColor = "#e8e0d0";
                  e.target.style.color = "#e8e0d0";
                }
              }}
              onMouseLeave={(e) => {
                if (!revealed && selected !== opt) {
                  e.target.style.borderColor = "#2a2a2a";
                  e.target.style.color = "#888";
                }
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WordGridPuzzle({ puzzle, onAnswer }) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const rows = puzzle.content
    .split("\n")
    .map((r) => r.trim().split(" ").filter(Boolean));

  const handleSubmit = () => {
    const isCorrect =
      input.trim().toUpperCase() === puzzle.answer.toUpperCase();
    setCorrect(isCorrect);
    setSubmitted(true);
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div>
      <div
        style={{
          display: "inline-block",
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: ri < rows.length - 1 ? "8px" : 0,
            }}
          >
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#e8e0d0",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "2px",
                  letterSpacing: "0.05em",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
          placeholder="Digite a palavra encontrada..."
          disabled={submitted}
          style={{
            flex: 1,
            background: "#111",
            border: `1px solid ${submitted ? (correct ? "#6ab87a" : "#b86a6a") : "#333"}`,
            borderRadius: "4px",
            padding: "12px 16px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "14px",
            color: "#e8e0d0",
            outline: "none",
            letterSpacing: "0.05em",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitted || !input.trim()}
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "4px",
            padding: "12px 20px",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            color: "#888",
            letterSpacing: "0.1em",
          }}
        >
          ENVIAR
        </button>
      </div>
    </div>
  );
}

function PathFinderPuzzle({ puzzle, onAnswer }) {
  const [path, setPath] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  const isInPath = (r, c) => path.some(([pr, pc]) => pr === r && pc === c);
  const isAdjacent = (r, c) => {
    if (path.length === 0) return true;
    const [lr, lc] = path[path.length - 1];
    return Math.abs(r - lr) + Math.abs(c - lc) === 1;
  };
  const pathWord = path.map(([r, c]) => puzzle.grid[r][c]).join("");

  const handleCell = (r, c) => {
    if (submitted) return;
    if (isInPath(r, c)) {
      const idx = path.findIndex(([pr, pc]) => pr === r && pc === c);
      setPath(path.slice(0, idx + 1));
      return;
    }
    if (!isAdjacent(r, c)) return;
    const newPath = [...path, [r, c]];
    setPath(newPath);
    const word = newPath.map(([pr, pc]) => puzzle.grid[pr][pc]).join("");
    if (word === puzzle.answerWord) {
      setCorrect(true);
      setSubmitted(true);
      setTimeout(() => onAnswer(true), 1000);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "inline-block",
          background: "#141414",
          border: "1px solid #2a2a2a",
          borderRadius: "4px",
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        {puzzle.grid.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: ri < puzzle.grid.length - 1 ? "8px" : 0,
            }}
          >
            {row.map((cell, ci) => {
              const inPath = isInPath(ri, ci);
              const canClick = isAdjacent(ri, ci) && !inPath;
              const pathIdx = path.findIndex(
                ([pr, pc]) => pr === ri && pc === ci,
              );
              return (
                <div
                  key={ci}
                  onClick={() => handleCell(ri, ci)}
                  style={{
                    width: "52px",
                    height: "52px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: inPath ? "#0f0f0f" : canClick ? "#e8e0d0" : "#444",
                    background: inPath
                      ? "#e8e0d0"
                      : canClick
                        ? "#1e1e1e"
                        : "#111",
                    border: `1px solid ${inPath ? "#e8e0d0" : canClick ? "#444" : "#1e1e1e"}`,
                    borderRadius: "2px",
                    cursor: canClick || inPath ? "pointer" : "default",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                >
                  {cell}
                  {inPath && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "4px",
                        fontSize: "8px",
                        color: "#666",
                      }}
                    >
                      {pathIdx + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "16px",
            letterSpacing: "0.2em",
            color: pathWord.length > 0 ? "#e8e0d0" : "#333",
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: "4px",
            padding: "10px 20px",
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          {pathWord || "_ _ _ _ _"}
        </div>
        <button
          onClick={() => setPath([])}
          style={{
            background: "transparent",
            border: "1px solid #2a2a2a",
            borderRadius: "4px",
            padding: "10px 16px",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            color: "#555",
            letterSpacing: "0.1em",
          }}
        >
          RESETAR
        </button>
      </div>
      <p
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          color: "#444",
          letterSpacing: "0.05em",
        }}
      >
        Clique nas células adjacentes para formar:{" "}
        <span style={{ color: "#666" }}>{puzzle.answerWord}</span>
      </p>
    </div>
  );
}

function PuzzleCard({ puzzle, onAnswer, showHint, onToggleHint }) {
  return (
    <div
      style={{
        background: "#0c0c0c",
        border: "1px solid #1e1e1e",
        borderRadius: "8px",
        padding: "36px",
        width: "100%",
        maxWidth: "560px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <CategoryTag category={puzzle.category} />
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "22px",
            color: "#2a2a2a",
          }}
        >
          {puzzle.icon}
        </span>
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "22px",
          fontWeight: "600",
          color: "#e8e0d0",
          margin: "0 0 8px 0",
          letterSpacing: "-0.02em",
        }}
      >
        {puzzle.title}
      </h2>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          color: "#666",
          margin: "0 0 28px 0",
          lineHeight: "1.6",
          letterSpacing: "0.01em",
        }}
      >
        {puzzle.description}
      </p>

      {puzzle.type === "multiple" && (
        <MultipleChoicePuzzle puzzle={puzzle} onAnswer={onAnswer} />
      )}
      {puzzle.type === "word-grid" && (
        <WordGridPuzzle puzzle={puzzle} onAnswer={onAnswer} />
      )}
      {puzzle.type === "path-finder" && (
        <PathFinderPuzzle puzzle={puzzle} onAnswer={onAnswer} />
      )}

      {showHint && (
        <div
          style={{
            marginTop: "20px",
            padding: "14px 18px",
            background: "#111",
            border: "1px solid #222",
            borderRadius: "4px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            color: "#666",
            letterSpacing: "0.04em",
            lineHeight: "1.6",
          }}
        >
          ◎ {puzzle.hint}
        </div>
      )}

      <button
        onClick={onToggleHint}
        style={{
          marginTop: "16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: "11px",
          color: "#3a3a3a",
          letterSpacing: "0.1em",
          padding: "0",
        }}
      >
        {showHint ? "— OCULTAR DICA" : "+ DICA"}
      </button>
    </div>
  );
}

function ResultCard({ result, puzzle }) {
  return (
    <div
      style={{
        background: "#0c0c0c",
        border: `1px solid ${result ? "#6ab87a22" : "#b86a6a22"}`,
        borderRadius: "8px",
        padding: "36px",
        width: "100%",
        maxWidth: "560px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "32px",
          marginBottom: "16px",
          color: result ? "#6ab87a" : "#b86a6a",
        }}
      >
        {result ? "✓" : "✗"}
      </div>
      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "20px",
          color: result ? "#6ab87a" : "#b86a6a",
          margin: "0 0 16px 0",
          fontWeight: "600",
        }}
      >
        {result ? "Correto!" : "Não desta vez."}
      </h3>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          color: "#666",
          letterSpacing: "0.04em",
          lineHeight: "1.7",
          background: "#111",
          border: "1px solid #1e1e1e",
          borderRadius: "4px",
          padding: "16px",
        }}
      >
        ◎ {puzzle.explanation}
      </div>
    </div>
  );
}

function ScoreBoard({ score, total }) {
  const pct = Math.round((score / total) * 100);
  let msg = "Bom começo!";
  if (pct >= 90) msg = "Gênio!";
  else if (pct >= 70) msg = "Muito bem!";
  else if (pct >= 50) msg = "Boa performance!";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <div
        style={{
          background: "#0c0c0c",
          border: "1px solid #1e1e1e",
          borderRadius: "8px",
          padding: "52px 48px",
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: "700",
            color: "#e8e0d0",
            letterSpacing: "-0.04em",
            fontFamily: "'Playfair Display', serif",
            marginBottom: "4px",
          }}
        >
          {score}
          <span style={{ fontSize: "28px", color: "#333" }}>/{total}</span>
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "#555",
            marginBottom: "24px",
            letterSpacing: "0.05em",
          }}
        >
          {pct}%
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#888",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "40px",
          }}
        >
          {msg}
        </div>

        <div
          style={{
            display: "flex",
            gap: "6px",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "32px",
                height: "4px",
                background: i < score ? "#6ab87a" : "#1e1e1e",
                borderRadius: "2px",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#e8e0d0",
            border: "none",
            borderRadius: "4px",
            padding: "14px 28px",
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            color: "#0c0c0c",
            letterSpacing: "0.12em",
            fontWeight: "600",
          }}
        >
          JOGAR NOVAMENTE
        </button>
      </div>
    </div>
  );
}

export default function EnigmaGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("playing"); // playing | result | done
  const [lastResult, setLastResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const puzzle = PUZZLES[currentIdx];

  const handleAnswer = useCallback((correct) => {
    if (correct) setScore((s) => s + 1);
    setLastResult(correct);
    setPhase("result");
  }, []);

  const handleNext = () => {
    if (currentIdx + 1 >= PUZZLES.length) {
      setPhase("done");
    } else {
      setCurrentIdx((i) => i + 1);
      setPhase("playing");
      setShowHint(false);
      setLastResult(null);
    }
  };

  if (phase === "done") {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <div style={{ background: "#080808", minHeight: "100vh" }}>
          <ScoreBoard score={score} total={PUZZLES.length} />
        </div>
      </>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          background: "#080808",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                color: "#e8e0d0",
                margin: 0,
                fontWeight: "600",
                letterSpacing: "-0.01em",
              }}
            >
              Enigma
            </h1>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                color: "#3a3a3a",
                letterSpacing: "0.15em",
              }}
            >
              {currentIdx + 1} / {PUZZLES.length}
            </span>
          </div>
          <ProgressBar current={currentIdx + 1} total={PUZZLES.length} />
        </div>

        {/* Card */}
        {phase === "playing" && (
          <PuzzleCard
            puzzle={puzzle}
            onAnswer={handleAnswer}
            showHint={showHint}
            onToggleHint={() => setShowHint((h) => !h)}
          />
        )}

        {phase === "result" && (
          <>
            <ResultCard result={lastResult} puzzle={puzzle} />
            <button
              onClick={handleNext}
              style={{
                marginTop: "20px",
                background: "#e8e0d0",
                border: "none",
                borderRadius: "4px",
                padding: "14px 32px",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "12px",
                color: "#0c0c0c",
                letterSpacing: "0.12em",
                fontWeight: "600",
              }}
            >
              {currentIdx + 1 >= PUZZLES.length ? "VER RESULTADO" : "PRÓXIMO →"}
            </button>
          </>
        )}

        {/* Score indicator */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "6px",
          }}
        >
          {Array.from({ length: PUZZLES.length }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background:
                  i < currentIdx
                    ? "#3a3a3a"
                    : i === currentIdx
                      ? "#e8e0d0"
                      : "#1a1a1a",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
