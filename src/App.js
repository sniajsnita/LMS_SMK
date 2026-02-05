// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import MainLayout from "./layout/MainLayout";
// import Login from "./pages/auth/Login";
// import Registrasi from "./pages/auth/Registrasi";
// import About from "./pages/About";
// import Dashboard from "./pages/Dashboard";

// function App() {
//   return (
//     <MainLayout>
//         <Routes>
//           <Route path="/" element={<Navigate to="/login" />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/registrasi" element={<Registrasi />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Routes>
//     </MainLayout>
      
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";

import ProtectedRoute from "./components/route/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Registrasi";

import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import MyCourses from "./pages/MyCourses";
import CourseDetail from "./pages/CourseDetail";
import ManageCourses from "./pages/ManageCourses";
import Assignments from "./pages/Assignments";
import Discussions from "./pages/Discussions";
import Progres from "./pages/Progres";
import Invitations from "./pages/Invitations";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import Notifications from "./pages/Notifications";
import Admin from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      {/* 1. Default Route: Paksa ke Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 2. Public Routes */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/registrasi" element={<AuthLayout><Register /></AuthLayout>} />

      {/* ===== PROTECTED ROUTES (Hanya User Login) ===== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/course" element={<MyCourses />} />
          <Route path="/course-detail" element={<CourseDetail />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/progres" element={<Progres />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* KHUSUS ADMIN (Hanya Role Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/manage-course" element={<ManageCourses />} />
          </Route>
        </Route>
      </Route>
      {/* 4. Catch All: Jika ngetik URL ngawur, lempar ke login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

