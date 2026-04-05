import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import EmployeeListPage from './pages/public/EmployeeListPage';
import EmployeeActionPage from './pages/public/EmployeeActionPage';
import EmployeeMonthlyPage from './pages/public/EmployeeMonthlyPage';
import AllEmployeesMonthlyPage from './pages/public/AllEmployeesMonthlyPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminManualAttendance from './pages/admin/AdminManualAttendance';
import AdminLeaves from './pages/admin/AdminLeaves';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<EmployeeListPage />} />
          <Route path="/employee/:id" element={<EmployeeActionPage />} />
          <Route path="/employee/:id/monthly" element={<EmployeeMonthlyPage />} />
          <Route path="/monthly-all" element={<AllEmployeesMonthlyPage />} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute><AdminEmployees /></ProtectedRoute>} />
          <Route path="/admin/manual" element={<ProtectedRoute><AdminManualAttendance /></ProtectedRoute>} />
          <Route path="/admin/leaves" element={<ProtectedRoute><AdminLeaves /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
