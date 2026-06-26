import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-gray-100">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="btn-ghost"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </button>
        <button
          onClick={logout}
          className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
}
