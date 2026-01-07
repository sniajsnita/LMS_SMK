import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      alert("Gagal Login: " + authError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (authError) {
      alert("Gagal Login: " + authError.message);
      setLoading(false);
      return;
    }

    navigate("/about");
    
    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f5f7fb" }}>
      <div className="bg-white w-100" style={{ maxWidth: "420px", borderRadius: "18px", boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}>
        <div className="p-4 p-md-5">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">Welcome to EduSpace</h2>
            <p className="text-muted">Sign in to continue</p>
          </div>

          <button className="btn btn-outline-secondary w-100 rounded-3 py-2 mb-3">
            Continue with Google
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