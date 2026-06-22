import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { ReviewPage } from './pages/ReviewPage';
import { ScenarioPickerPage } from './pages/ScenarioPickerPage';
import { ConversationPage } from './pages/ConversationPage';
import { ConversationReportPage } from './pages/ConversationReportPage';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/lesson/:id"
        element={
          <RequireAuth>
            <LessonPlayerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/review"
        element={
          <RequireAuth>
            <ReviewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/conversation"
        element={
          <RequireAuth>
            <ScenarioPickerPage />
          </RequireAuth>
        }
      />
      <Route
        path="/conversation/:scenario"
        element={
          <RequireAuth>
            <ConversationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/conversation-report/:sessionId"
        element={
          <RequireAuth>
            <ConversationReportPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
