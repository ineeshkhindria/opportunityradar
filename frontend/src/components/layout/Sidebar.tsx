import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  User,
  Bell,
  Radar,
} from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/applications', icon: FileCheck, label: 'Applications' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/digest', icon: Bell, label: 'Digest Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white/[0.02] border-r border-white/[0.06] flex flex-col backdrop-blur-xl">
      <div className="p-6">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
            OpptyRadar
          </span>
        </NavLink>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20 shadow-sm shadow-brand-500/5'
                  : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="rounded-xl bg-gradient-to-br from-brand-600/20 to-emerald-600/20 border border-brand-500/20 p-4">
          <Radar className="w-4 h-4 text-brand-400 mb-2" />
          <p className="text-xs font-medium text-gray-300">AI-powered matches</p>
          <p className="text-sm font-semibold text-brand-300 mt-0.5">Find your perfect internship</p>
        </div>
      </div>
    </aside>
  );
}
