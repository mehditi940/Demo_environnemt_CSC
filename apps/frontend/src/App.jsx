import React, { useEffect, useState } from "react";
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
import ProtectedRoute from "./ui/components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AnimatePresence } from "framer-motion";
import Patients from "./ui/pages/admin/Patients";
import Users from "./ui/pages/admin/Users";
import AuthCallback from "./ui/pages/AuthCallback";
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

  const isView = location.pathname === "/chirurg/dashboard";
  const isChirurgDashboard = location.pathname === "/chirurg/view";
  const isLogin = location.pathname === "/login";
  const headerShouldShow = !isView && !isChirurgDashboard && !isLogin;
  return (
    <>
      {headerShouldShow && (isMobile ? <BurgerMenu /> : <DesktopHeader />)}

      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/auth/callback" element={<AuthCallback />}></Route>
        <Route
          path="/chirurg/view/:roomId"
          element={
            <ProtectedRoute
              element={<ViewPage />}
              allowedRoles={["admin", "super-admin"]}
            />
          }
        ></Route>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={<Dashboard />}
              allowedRoles={["super-admin"]}
            />
          }
        ></Route>
        <Route path="/admin/rooms" element={<Rooms />}></Route>
        <Route path="/admin/rooms/nieuw-room" element={<NewRoom />}></Route>
        <Route
          path="/admin/patients/nieuw-patient"
          element={<NewPatient />}
        ></Route>
        <Route path="/admin/patients" element={<Patients />}></Route>
        <Route path="/admin/users" element={<Users />}></Route>

        <Route
          path="/admin/users/nieuw-account"
          element={<NewAccount />}
        ></Route>
        <Route path="/admin/nieuw-wachtwoord" element={<NewPassword />}></Route>

        <Route path="/chirurg/dashboard" element={<ChirurgDashboard />}></Route>
      </Routes>
    </>
  );
}

const AppWithRouter = () => (
  <AnimatePresence mode="wait">
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <App />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  </AnimatePresence>
);

export default AppWithRouter;
