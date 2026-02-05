// src/components/route/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const ProtectedRoute = ({ allowedRoles }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentSession.user.id)
          .single();
        setUserRole(data?.role);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null; // Atau spinner loading

  // JIKA TIDAK ADA SESSION (USER BELUM LOGIN)
  if (!session) {
    return <Navigate 
      to="/login" 
      replace 
      state={{ message: "Silakan login terlebih dahulu untuk mengakses halaman ini." }} 
    />;
  }

  // JIKA ROLE TIDAK SESUAI
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate 
      to="/dashboard" 
      replace 
      state={{ message: "Anda tidak memiliki izin untuk mengakses halaman tersebut." }}
    />;
  }

  return <Outlet />;
};

export default ProtectedRoute;