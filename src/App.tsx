import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { StudyProvider } from "./hooks/useStudyState";
import { Notes } from "./pages/Notes";
import { Overview } from "./pages/Overview";
import { Practice } from "./pages/Practice";
import { Progress } from "./pages/Progress";
import { Projects } from "./pages/Projects";
import { Roadmap } from "./pages/Roadmap";
import { Settings } from "./pages/Settings";
import { Skills } from "./pages/Skills";

export default function App() {
  return (
    <StudyProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Overview />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="skills" element={<Skills />} />
          <Route path="practice" element={<Practice />} />
          <Route path="projects" element={<Projects />} />
          <Route path="notes" element={<Notes />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Overview />} />
        </Route>
      </Routes>
    </StudyProvider>
  );
}
