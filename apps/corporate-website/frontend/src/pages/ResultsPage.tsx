import { Navigate, useNavigate } from "react-router-dom";
import { useTestSession } from "../context/TestSessionContext";
import { brandColors, typography } from "../styles/brand";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { results, resetSession } = useTestSession();

  if (!results) {
    return <Navigate to="/" replace />;
  }

  const handleRetake = () => {
    resetSession();
    navigate("/start");
  };

  const handleExit = () => {
    resetSession();
    navigate("/");
  };

  return (
    <section style={styles.section}>
      <header style={styles.header}>
        <h2 style={styles.title}>Results</h2>
        <p style={styles.subtitle}>
          Attempt #{results.attemptNumber} for {results.applicant.name} ({results.applicant.email})
        </p>
      </header>

      <div style={styles.summaryCard}>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Overall Closeness</span>
          <span style={styles.summaryValue}>{results.overallCloseness.toFixed(3)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Score</span>
          <span style={styles.summaryValue}>{results.overallClosenessPct.toFixed(1)}%</span>
        </div>
        <div style={styles.summaryRow}>
          <span style={styles.summaryLabel}>Band</span>
          <span style={styles.summaryValue}>{results.band}</span>
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.secondaryButton} onClick={handleExit}>
          Exit
        </button>
        <button type="button" style={styles.primaryButton} onClick={handleRetake}>
          Retake Test
        </button>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    display: "grid",
    gap: "var(--space-md)",
    padding: "var(--space-lg) 0"
  },
  header: {
    display: "grid",
    gap: "0.5rem"
  },
  title: {
    margin: 0,
    fontFamily: typography.heading,
    fontSize: "2.25rem",
    color: brandColors.text
  },
  subtitle: {
    margin: 0,
    color: brandColors.muted
  },
  summaryCard: {
    display: "grid",
    gap: "0.75rem",
    padding: "1.5rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "rgba(243, 242, 236, 0.65)",
    border: "1px solid rgba(32, 24, 24, 0.08)"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  summaryLabel: {
    fontFamily: typography.heading,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    color: brandColors.muted
  },
  summaryValue: {
    fontFamily: typography.heading,
    fontSize: "1.35rem",
    color: brandColors.text
  },
  actions: {
    display: "flex",
    gap: "1rem"
  },
  primaryButton: {
    border: "none",
    borderRadius: "var(--radius-md)",
    backgroundColor: brandColors.primary,
    color: brandColors.background,
    fontFamily: typography.heading,
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer"
  },
  secondaryButton: {
    border: "1px solid rgba(32, 24, 24, 0.18)",
    borderRadius: "var(--radius-md)",
    backgroundColor: brandColors.background,
    color: brandColors.text,
    fontFamily: typography.heading,
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.75rem 1.5rem",
    cursor: "pointer"
  }
};
