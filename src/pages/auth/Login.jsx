import { useState, useEffect } from "react"; // Gabungkan React hooks di sini
import { Link, useNavigate, useLocation } from "react-router-dom"; // Gabungkan router hooks di sini
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    const clearSessionAndCheckMessage = async () => {
      // 1. PAKSA LOGOUT: Hapus sesi lama saat user masuk ke halaman login
      // Ini memastikan user tidak bisa 'auto-login' lewat URL
      await supabase.auth.signOut();

      // 2. Tangkap pesan dari ProtectedRoute (jika ada)
      if (location.state?.message) {
        setInfoMessage(location.state.message);
        // Bersihkan state agar pesan tidak muncul lagi saat di-refresh
        window.history.replaceState({}, document.title);
      }
    };
    
    clearSessionAndCheckMessage();
  }, [location]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 'window.location.origin' akan mengambil http://localhost:5173 
          // atau domain asli kamu secara otomatis saat sudah online.
          redirectTo: `${window.location.origin}/about`, 
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error:", error.message);
      alert("Gagal login dengan Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Proses Login ke Auth Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      // 2. Ambil data Profile untuk mengecek Role
      // Pastikan kolom 'role' sudah kamu buat di tabel 'profiles' via SQL Editor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Profile Error:", profileError.message);
        // Jika profil gagal diambil, default ke halaman about
        navigate("/about");
        return;
      }

      // 3. Logika Pengalihan Berdasarkan Role
      if (profile?.role === "admin") {
        console.log("Welcome Admin! Redirecting to Dashboard...");
        navigate("/admin"); // Pastikan path ini sesuai dengan route CRUD Guru kamu
      } else {
        console.log("User logged in. Redirecting to About...");
        navigate("/about");
      }

    } catch (error) {
      alert("Gagal Login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f5f7fb" }}>
      <div className="bg-white w-100" style={{ maxWidth: "420px", borderRadius: "18px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
        <div className="p-4 p-md-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome to EduSpace</h2>
            <p className="text-muted">Sign in to continue</p>
          </div>

          {/* MENAMPILKAN PESAN KETERANGAN JIKA ADA */}
          {infoMessage && (
            <div className="alert alert-warning small py-2 text-center" role="alert">
              {infoMessage}
            </div>
          )}

          <button 
            type="button" // Sangat penting agar tidak bentrok dengan submit form email
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-outline-secondary w-100 rounded-3 py-2 mb-3 d-flex align-items-center justify-content-center gap-2"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              width="18" 
              alt="Google Logo" 
            />
            {loading ? "Menghubungkan..." : "Continue with Google"}
          </button>

          <div className="text-center text-muted my-3 position-relative">
            <span className="bg-white px-2" style={{ zIndex: 1, position: 'relative' }}>OR</span>
            <hr style={{ marginTop: "-12px" }} />
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control py-2 rounded-3"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control py-2 rounded-3"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 py-2 rounded-3 text-white"
              style={{ background: "#0f172a" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="d-flex justify-content-between mt-4 small">
            <a href="#" className="text-decoration-none text-muted">Forgot password?</a>
            <Link to="/registrasi" className="fw-semibold text-decoration-none">Sign up</Link>
          </div>

        </div>
      </div>
    </div>
  );
}