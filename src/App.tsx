import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { StudyProvider } from "./hooks/useStudyState";
import { Overview } from "./pages/Overview";
import { Projects } from "./pages/Projects";
import { Roadmap } from "./pages/Roadmap";
import { Settings } from "./pages/Settings";
import { Weekly } from "./pages/Weekly";

export default function App() {
  return (
    <StudyProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="weekly" element={<Weekly />} />
          <Route path="projects" element={<Projects />} />
          <Route path="settings" element={<Settings />} />
          <Route path="skills" element={<Navigate to="/roadmap" replace />} />
          <Route path="practice" element={<Navigate to="/" replace />} />
          <Route path="notes" element={<Navigate to="/" replace />} />
          <Route path="progress" element={<Navigate to="/weekly" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StudyProvider>
  );
}
