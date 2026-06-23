import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-6 py-4 shadow-md">
      <div className="flex justify-between items-center">
        
        <h1 className="text-xl font-bold">
          AI Cybersecurity Threat Analyzer
        </h1>

        <div className="flex gap-6">
          <Link to="/" className="hover:text-cyan-400">
            Login
          </Link>

          <Link to="/signup" className="hover:text-cyan-400">
            Signup
          </Link>

          <Link to="/dashboard" className="hover:text-cyan-400">
            Dashboard
          </Link>

          <Link to="/analytics" className="hover:text-cyan-400">
            Analytics
          </Link>

          <Link to="/threats" className="hover:text-cyan-400">
            Threats
          </Link>

          <Link to="/profile" className="hover:text-cyan-400">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;