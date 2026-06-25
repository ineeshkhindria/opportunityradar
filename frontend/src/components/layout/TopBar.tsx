import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
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
          className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
}
