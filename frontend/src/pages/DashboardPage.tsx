import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileCheck,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  Rocket,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profile, appStats, matchedOpps] = await Promise.all([
          api.profile.get().catch(() => null),
          api.applications.stats().catch(() => null),
          api.opportunities.getMatches({ page_size: '5' }).catch(() => null),
        ]);
        setProfileExists(!!profile);
        setStats(appStats);
        setMatches(matchedOpps?.items || []);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Hey, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here's your internship landscape.</p>
      </div>

      {/* Profile Setup CTA */}
      {!profileExists && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900">Complete your profile to get AI-matched opportunities</h3>
            <p className="text-amber-700 text-sm mt-1">Add your skills, year, branch, and preferences so we can find the perfect internships for you.</p>
          </div>
          <Link to="/profile" className="btn-primary text-sm py-2.5 px-5 bg-amber-600 hover:bg-amber-700 shadow-amber-500/20">
            Set Up Profile
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Briefcase,
            label: 'Available Opportunities',
            value: matches.length > 0 ? matches.length + '+' : '—',
            color: 'bg-blue-50 text-blue-600',
          },
          {
            icon: FileCheck,
            label: 'Applications',
            value: stats?.total ?? 0,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            icon: Rocket,
            label: 'Young Startups',
            value: matches.filter((m: any) => m.company_funding_stage).length || '—',
            color: 'bg-purple-50 text-purple-600',
          },
          {
            icon: Target,
            label: 'Match Score Avg',
            value: matches.length > 0
              ? Math.round(matches.reduce((a: number, b: any) => a + (b.match_score || 0) * 100, 0) / matches.length) + '%'
              : '—',
            color: 'bg-brand-50 text-brand-600',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Matched Opportunities */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Top Matches</h2>
            <p className="text-sm text-gray-500 mt-1">AI-ranked opportunities tailored to your profile</p>
          </div>
          <Link to="/opportunities" className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No matches yet{profileExists ? '' : ' — set up your profile first'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.slice(0, 5).map((opp: any) => {
              const score = Math.round((opp.match_score || 0) * 100);
              const scoreClass = score >= 75 ? 'match-score-high' : score >= 50 ? 'match-score-med' : 'match-score-low';
              return (
                <Link
                  key={opp.id}
                  to={`/opportunities/${opp.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className={`match-score ${scoreClass}`}>{score}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{opp.title}</p>
                      {opp.company_funding_stage && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
                          <Rocket className="w-2.5 h-2.5" />
                          Startup
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{opp.company} — {opp.location || 'Remote'}</p>
                    {opp.match_reason && (
                      <p className="text-sm text-gray-400 mt-1 truncate">{opp.match_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {opp.stipend && <span>{opp.stipend}</span>}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Status */}
      {stats && stats.total > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Saved', value: stats.saved, color: 'bg-gray-100 text-gray-700' },
              { label: 'Applied', value: stats.applied, color: 'bg-blue-100 text-blue-700' },
              { label: 'Interview', value: stats.interview, color: 'bg-purple-100 text-purple-700' },
              { label: 'Offered', value: stats.offered, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Rejected', value: stats.rejected, color: 'bg-red-100 text-red-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 rounded-xl bg-gray-50">
                <div className={`text-2xl font-bold ${color.split(' ')[1]}`}>{value || 0}</div>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
