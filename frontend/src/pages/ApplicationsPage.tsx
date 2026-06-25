import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  ExternalLink,
  Trash2,
  ChevronDown,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  Banknote,
} from 'lucide-react';
import { api } from '../lib/api';

const STATUS_STYLES: Record<string, string> = {
  saved: 'bg-gray-100 text-gray-700',
  applied: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  offered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  saved: ['applied', 'withdrawn'],
  applied: ['interview', 'rejected', 'withdrawn'],
  interview: ['offered', 'rejected', 'withdrawn'],
  offered: ['accepted', 'rejected', 'withdrawn'],
  accepted: ['withdrawn'],
  rejected: [],
  withdrawn: [],
};

export function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status_filter = statusFilter;
      const [appRes, statsRes] = await Promise.all([
        api.applications.list(params),
        api.applications.stats(),
      ]);
      setApplications(appRes.items);
      setTotal(appRes.total);
      setStats(statsRes);
    } catch {} finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await api.applications.update(appId, { status: newStatus });
      await load();
    } catch {}
  };

  const handleDelete = async (appId: string) => {
    try {
      await api.applications.delete(appId);
      await load();
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">{total} applications tracked</p>
        </div>
        <Link to="/opportunities" className="btn-primary text-sm py-2.5 px-5">
          Browse Opportunities
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900' },
            { label: 'Saved', value: stats.saved, color: 'text-gray-600' },
            { label: 'Applied', value: stats.applied, color: 'text-blue-600' },
            { label: 'Interview', value: stats.interview, color: 'text-purple-600' },
            { label: 'Offered', value: stats.offered, color: 'text-emerald-600' },
            { label: 'Accepted', value: stats.accepted, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['', 'saved', 'applied', 'interview', 'offered', 'rejected', 'accepted'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Start by saving opportunities from the feed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const opp = app.opportunity || {};
            const nextStatuses = STATUS_TRANSITIONS[app.status] || [];
            return (
              <div key={app.id} className="card-hover p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/opportunities/${app.opportunity_id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-brand-600"
                    >
                      {opp.title || 'Unknown'}
                    </Link>
                    <p className="text-brand-600 font-medium text-sm">{opp.company}</p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {opp.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{opp.location}</span>
                      )}
                      {opp.stipend && (
                        <span className="flex items-center gap-1"><Banknote className="w-3.5 h-3.5" />{opp.stipend}</span>
                      )}
                      {app.applied_date && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                      )}
                      {app.deadline && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Deadline {new Date(app.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Status badge with dropdown */}
                    <div className="relative group">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${STATUS_STYLES[app.status] || 'bg-gray-100'}`}>
                        {app.status}
                        {nextStatuses.length > 0 && <ChevronDown className="w-3 h-3" />}
                      </span>
                      {nextStatuses.length > 0 && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[130px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {nextStatuses.map((ns) => (
                            <button
                              key={ns}
                              onClick={() => handleStatusChange(app.id, ns)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                            >
                              Mark as {ns}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <a
                      href={opp.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="btn-ghost text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
