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
import ChirurgRooms from "./ui/pages/chirurg/Rooms";
import ProtectedRoute from "./ui/components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Patients from "./ui/pages/admin/Patients";
import Users from "./ui/pages/admin/Users";
import NotFound from "./ui/pages/NotFound";
import Profile from "./ui/pages/admin/Profile";
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

  const isLogin = location.pathname === "/login";
  const isNotFound = location.pathname !== "/" && 
    !location.pathname.startsWith("/admin") && 
    !location.pathname.startsWith("/chirurg") && 
    location.pathname !== "/login" &&
    location.pathname !== "/profiel";
  const headerShouldShow = !isLogin && !isNotFound;
  return (
    <div>
      {headerShouldShow && (
        <>
          {isMobile ? <BurgerMenu /> : <DesktopHeader />}
        </>
      )}

      <Routes>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/chirurg/view/:roomId"
          element={
            <ProtectedRoute
              element={<ViewPage />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        ></Route>
        <Route 
          path="/profiel" 
          element={
            <ProtectedRoute
              element={<Profile />}
              allowedRoles={["admin", "surgeon", "user"]}
            />
          }
        ></Route>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              element={<Dashboard />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route 
          path="/admin/rooms" 
          element={
            <ProtectedRoute
              element={<Rooms />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route 
          path="/admin/rooms/nieuw-room" 
          element={
            <ProtectedRoute
              element={<NewRoom />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route
          path="/admin/patients/nieuw-patient"
          element={
            <ProtectedRoute
              element={<NewPatient />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route 
          path="/admin/patients" 
          element={
            <ProtectedRoute
              element={<Patients />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute
              element={<Users />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>

        <Route
          path="/admin/users/nieuw-account"
          element={
            <ProtectedRoute
              element={<NewAccount />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>
        <Route 
          path="/admin/nieuw-wachtwoord" 
          element={
            <ProtectedRoute
              element={<NewPassword />}
              allowedRoles={["admin"]}
            />
          }
        ></Route>

        <Route 
          path="/chirurg/dashboard" 
          element={
            <ProtectedRoute
              element={<ChirurgDashboard />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        ></Route>
        <Route 
          path="/chirurg/rooms" 
          element={
            <ProtectedRoute
              element={<ChirurgRooms />}
              allowedRoles={["admin", "surgeon"]}
            />
          }
        ></Route>
        
        {/* 404 Not Found - This should be the last route */}
        <Route path="*" element={<NotFound />}></Route>
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
