import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import DevciesPage from "./pages/DevicesPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import CreateDevicePage from "./pages/CreateDevicePage";
import EditDevicePage from "./pages/EditDevicePage";

function App() {
  return (
    <Routes>
      {/* Redirect the root URL to the dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public auth pages. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main dashboard pages. */}
      <Route path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
      <Route path="/devices"
        element={
          <ProtectedRoute>
            <DevciesPage />
          </ProtectedRoute>
        } />
      <Route path="/devices/new"
        element={
          <ProtectedRoute>
            <CreateDevicePage />
          </ProtectedRoute>
        } />
      <Route path="/devices/:deviceId/edit"
        element={
          <ProtectedRoute>
            <EditDevicePage />
          </ProtectedRoute>
        } />
      <Route path="/devices/:deviceId"
        element={
          <ProtectedRoute>
            <DeviceDetailPage />
          </ProtectedRoute>
        } />

      {/* Catch-all route for unknown URLs. */}
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App