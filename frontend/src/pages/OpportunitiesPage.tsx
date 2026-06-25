import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Banknote,
  Building2,
  ExternalLink,
  BookmarkPlus,
  Check,
  Loader2,
  Globe,
  Briefcase,
  Rocket,
  FlaskConical,
} from 'lucide-react';
import { api } from '../lib/api';

const SOURCE_ICONS: Record<string, typeof Briefcase> = {
  internshala: Briefcase,
  linkedin: Building2,
  wellfound: Globe,
};

const SOURCE_COLORS: Record<string, string> = {
  internshala: 'bg-orange-50 text-orange-600 border-orange-200',
  linkedin: 'bg-blue-50 text-blue-600 border-blue-200',
  wellfound: 'bg-purple-50 text-purple-600 border-purple-200',
};

export function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [startupOnly, setStartupOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: 20 };
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      if (workModeFilter) params.work_mode = workModeFilter;
      if (startupOnly) params.founded_within_months = 36;
      const res = await api.opportunities.list(params);
      setOpportunities(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, search, sourceFilter, workModeFilter, startupOnly]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (oppId: string) => {
    setSaving(oppId);
    try {
      await api.applications.create({ opportunity_id: oppId });
    } catch {
      // already saved or error
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
        <p className="text-gray-500 mt-1">{total} internships found across all sources</p>
      </div>

      {/* Search & Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by title, company, skills..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <select
              className="input-field w-44"
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Sources</option>
              <option value="internshala">Internshala</option>
              <option value="linkedin">LinkedIn</option>
              <option value="wellfound">Wellfound</option>
            </select>
            <select
              className="input-field w-44"
              value={workModeFilter}
              onChange={(e) => { setWorkModeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            <button
              onClick={() => { setStartupOnly(!startupOnly); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                startupOnly
                  ? 'bg-brand-50 text-brand-700 border-brand-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Young Startups Only
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No opportunities match your criteria</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => {
            const score = Math.round((opp.match_score || 0) * 100);
            const scoreClass = score >= 75 ? 'match-score-high' : score >= 50 ? 'match-score-med' : 'match-score-low';
            const SourceIcon = SOURCE_ICONS[opp.source] || Briefcase;

            return (
              <div key={opp.id} className="card-hover p-5">
                <div className="flex items-start gap-4">
                  {/* Score */}
                  <div className={`match-score ${scoreClass} hidden sm:flex`}>{score}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to={`/opportunities/${opp.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                        >
                          {opp.title}
                        </Link>
                        <p className="text-brand-600 font-medium text-sm mt-0.5">{opp.company}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${SOURCE_COLORS[opp.source] || 'bg-gray-50 text-gray-600'}`}>
                        <SourceIcon className="w-3 h-3" />
                        {opp.source}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      {opp.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {opp.location}
                        </span>
                      )}
                      {opp.stipend && (
                        <span className="flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5" />
                          {opp.stipend}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {opp.work_mode || 'Remote'}
                      </span>
                    </div>

                    {opp.match_reason && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {opp.match_reason}
                      </p>
                    )}

                    {/* Startup badge */}
                    {opp.company_funding_stage && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-brand-50 to-purple-50 text-brand-700 border border-brand-200">
                          <Rocket className="w-3 h-3" />
                          {opp.company_funding_stage}
                        </span>
                        {opp.company_age_months && (
                          <span className="text-xs text-gray-400">
                            {Math.round(opp.company_age_months)} months old
                          </span>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    {opp.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {opp.skills_required.slice(0, 5).map((skill: string) => (
                          <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {opp.skills_required.length > 5 && (
                          <span className="px-2.5 py-1 text-gray-400 text-xs">
                            +{opp.skills_required.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleSave(opp.id)}
                      disabled={saving === opp.id}
                      className="btn-secondary text-sm py-2 px-3"
                      title="Save opportunity"
                    >
                      {saving === opp.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <BookmarkPlus className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={opp.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm py-2 px-3"
                      title="Open original listing"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm py-2 px-4"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary text-sm py-2 px-4"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
