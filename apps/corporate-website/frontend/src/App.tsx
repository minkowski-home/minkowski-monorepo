import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TestSessionProvider } from "./context/TestSessionContext";
import LandingPage from "./pages/LandingPage";
import ApplicantInfoPage from "./pages/ApplicantInfoPage";
import QuestionPage from "./pages/QuestionPage";
import ResultsPage from "./pages/ResultsPage";
import { TopNavigation } from "./components/TopNavigation";
import { typography, brandColors } from "./styles/brand";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.page}>
      <TopNavigation />
      <main style={styles.mainContent}>{children}</main>
      <footer style={styles.footer}>
        <small>© {new Date().getFullYear()} Minkowski Design Ops</small>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TestSessionProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/start" element={<ApplicantInfoPage />} />
            <Route path="/test/:questionNumber" element={<QuestionPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </TestSessionProvider>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: brandColors.background,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    margin: "0 auto",
    width: "min(1080px, 92vw)",
    padding: "var(--space-lg) var(--space-md)",
    display: "grid"
  },
  footer: {
    borderTop: "1px solid rgba(32, 24, 24, 0.12)",
    padding: "var(--space-md) 1.5rem",
    color: brandColors.muted,
    fontFamily: typography.body,
    fontSize: "0.85rem"
  }
};

export default App;
