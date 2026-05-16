import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, BookOpen } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold gradient-text">
        <BookOpen className="text-primary" />
        <span>PDF Chat AI</span>
      </Link>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <Link to="/chat" className="hover:text-primary transition-colors">Chat</Link>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <span className="text-sm opacity-80">{user?.name}</span>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-accent"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
