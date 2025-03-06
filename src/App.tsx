import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
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
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/schools" element={<SchoolsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/availability" element={<TeacherAvailabilityPage />} />
          <Route path="/timesheets" element={<TimesheetsPage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/management" element={<ManagementPage />} />
          <Route path="/team-leaders" element={<TeamLeadersPage />} />
          <Route path="/hr" element={<HRPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/alarms" element={<AlarmsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/directors" element={<DirectorsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/it-admin" element={<ITAdminPage />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </div>
    </Suspense>
  );
}

export default App;
