import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Homepage from "./ui/pages/Homepage";
import Login from "./ui/pages/Login";
import ViewPage from "./ui/pages/chirurg/Viewpage";
import BurgerMenu from "./ui/components/headers/BurgerMenu";
import DesktopHeader from "./ui/components/headers/DesktopHeader";
import Dashboard from "./ui/pages/admin/Dashboard";
import Rooms from "./ui/pages/admin/Rooms";
import NewRoom from "./ui/pages/admin/NewRoom";
import NewPatient from "./ui/pages/admin/NewPatient";
import NewAccount from "./ui/pages/admin/NewAccount";
import NewPassword from "./ui/pages/admin/NewPassword";
import ChirurgDashboard from "./ui/pages/chirurg/Dashboard";
import ChirurgRooms from "./ui/pages/chirurg/Rooms";
import ProtectedRoute from "./ui/components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Patients from "./ui/pages/admin/Patients";
import Users from "./ui/pages/admin/Users";
import NotFound from "./ui/pages/NotFound";
import Profile from "./ui/pages/admin/Profile";
import AuthCallback from "./ui/pages/AuthCallback";
import { ROUTES } from "./constants/routes";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 800);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const hideHeaderPaths = useMemo(
    () => new Set([ROUTES.LOGIN, ROUTES.AUTH.CALLBACK]),
    []
  );

  const isKnownPath =
    location.pathname === ROUTES.HOME ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/chirurg") ||
    location.pathname === ROUTES.PROFILE ||
    hideHeaderPaths.has(location.pathname);

  const headerShouldShow = isKnownPath && !hideHeaderPaths.has(location.pathname);

  return (
    <div>
      {headerShouldShow && (isMobile ? <BurgerMenu /> : <DesktopHeader />)}

      <Routes>
        <Route path={ROUTES.HOME} element={<Homepage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.AUTH.CALLBACK} element={<AuthCallback />} />
        <Route
          path="/chirurg/view/:roomId"
          element={
            <ProtectedRoute
              element={<ViewPage />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute
              element={<Profile />}
              allowedRoles={["admin", "surgeon", "user"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <ProtectedRoute
              element={<Dashboard />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.ROOMS}
          element={
            <ProtectedRoute
              element={<Rooms />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.NEW_ROOM}
          element={
            <ProtectedRoute
              element={<NewRoom />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.NEW_PATIENT}
          element={
            <ProtectedRoute
              element={<NewPatient />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.PATIENTS}
          element={
            <ProtectedRoute
              element={<Patients />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.USERS}
          element={
            <ProtectedRoute
              element={<Users />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.NEW_USER}
          element={
            <ProtectedRoute
              element={<NewAccount />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.ADMIN.NEW_PASSWORD}
          element={
            <ProtectedRoute
              element={<NewPassword />}
              allowedRoles={["admin"]}
            />
          }
        />
        <Route
          path={ROUTES.SURGEON.DASHBOARD}
          element={
            <ProtectedRoute
              element={<ChirurgDashboard />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        />
        <Route
          path={ROUTES.SURGEON.ROOMS}
          element={
            <ProtectedRoute
              element={<ChirurgRooms />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        />

        {/* 404 Not Found - This should be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const AppWithRouter = () => (
  <AuthProvider>
    <NotificationProvider>
      <Router>
        <App />
      </Router>
    </NotificationProvider>
  </AuthProvider>
);

export default AppWithRouter;
