import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GlobalNav } from './components/layout';
import { ProtectedRoute } from './components/auth';
import { LandingPage, LoginPage, RegisterPage, DashboardPage, LessonPage, ModulesPage, LabPage, HomePage } from './pages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GlobalNav />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/modules" element={<ProtectedRoute><ModulesPage /></ProtectedRoute>} />
          <Route path="/lab" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
          <Route path="/lesson/:moduleId/:lessonPath" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

