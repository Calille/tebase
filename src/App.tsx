import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/home";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HelpPage from "./pages/HelpPage";
import MissingConfigPage from "./pages/MissingConfigPage";
import TeachersPage from "./pages/TeachersPage";
import SchoolsPage from "./pages/SchoolsPage";
import BookingsPage from "./pages/BookingsPage";
import TeacherAvailabilityPage from "./pages/TeacherAvailabilityPage";
import TimesheetsPage from "./pages/TimesheetsPage";
import VacanciesPage from "./pages/VacanciesPage";
import SettingsPage from "./pages/SettingsPage";
import ManagementPage from "./pages/ManagementPage";
import TeamLeadersPage from "./pages/TeamLeadersPage";
import HRPage from "./pages/HRPage";
import CompliancePage from "./pages/CompliancePage";
import RecruitmentPage from "./pages/RecruitmentPage";
import AlarmsPage from "./pages/AlarmsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import DirectorsPage from "./pages/DirectorsPage";
import WeeklyReportPage from "./pages/WeeklyReportPage";
import PayrollPage from "./pages/PayrollPage";
import ITAdminPage from "./pages/ITAdminPage";
import AWRTrackingPage from "./pages/AWRTrackingPage";
import { ADMIN_ROLES } from "./lib/roles";
import { isSupabaseConfigured } from "./lib/supabase";
import routes from "tempo-routes";
import React from "react";

// Add a simple test component
const TestComponent = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Tebase CRM Test Page</h1>
      <p>If you can see this page, the basic React application is working correctly.</p>
      <p>This page doesn't require authentication.</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
      </div>
    </div>
  );
};

const NewTeacherPage = lazy(() => import("./pages/NewTeacherPage"));
const TeacherDetailPage = lazy(() => import("./pages/TeacherRecordPage"));
const NewSchoolPage = lazy(() => import("./pages/NewSchoolPage"));
const SchoolDetailPage = lazy(() => import("./pages/SchoolRecordPage"));
const TestPage = lazy(() => import("./pages/TestPage"));

function TempoRoutes() {
  return useRoutes(routes);
}

function App() {
  if (!isSupabaseConfigured) {
    return <MissingConfigPage />;
  }

  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="app">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            {import.meta.env.DEV && (
              <>
                <Route path="/test" element={<TestPage />} />
                <Route path="/test-no-auth" element={<TestComponent />} />
              </>
            )}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
            <Route path="/teachers/new" element={<ProtectedRoute><Suspense fallback={<p>Loading...</p>}><NewTeacherPage /></Suspense></ProtectedRoute>} />
            <Route path="/teachers/:id" element={<ProtectedRoute><Suspense fallback={<p>Loading...</p>}><TeacherDetailPage /></Suspense></ProtectedRoute>} />
            
            {/* School routes */}
            <Route path="/schools" element={<ProtectedRoute><SchoolsPage /></ProtectedRoute>} />
            <Route path="/schools/new" element={<ProtectedRoute><Suspense fallback={<p>Loading...</p>}><NewSchoolPage /></Suspense></ProtectedRoute>} />
            <Route path="/schools/:id" element={<ProtectedRoute><Suspense fallback={<p>Loading...</p>}><SchoolDetailPage /></Suspense></ProtectedRoute>} />
            
            <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/weekly-report" element={<ProtectedRoute><WeeklyReportPage /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute><PayrollPage /></ProtectedRoute>} />
            <Route path="/awr-tracking" element={<ProtectedRoute><AWRTrackingPage /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><TeacherAvailabilityPage /></ProtectedRoute>} />
            <Route path="/timesheets" element={<ProtectedRoute><TimesheetsPage /></ProtectedRoute>} />
            <Route path="/vacancies" element={<ProtectedRoute><VacanciesPage /></ProtectedRoute>} />
            <Route path="/management" element={<ProtectedRoute><ManagementPage /></ProtectedRoute>} />
            <Route path="/team-leaders" element={<ProtectedRoute><TeamLeadersPage /></ProtectedRoute>} />
            <Route path="/hr" element={<ProtectedRoute><HRPage /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><CompliancePage /></ProtectedRoute>} />
            <Route path="/recruitment" element={<ProtectedRoute><RecruitmentPage /></ProtectedRoute>} />
            <Route path="/alarms" element={<ProtectedRoute><AlarmsPage /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
            <Route path="/directors" element={<ProtectedRoute><DirectorsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/it-admin" element={<ProtectedRoute roles={ADMIN_ROLES}><ITAdminPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && <TempoRoutes />}
        </div>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
