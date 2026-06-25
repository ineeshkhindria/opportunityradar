import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Banknote,
  Building2,
  Clock,
  Users,
  ExternalLink,
  BookmarkPlus,
  Check,
  Globe,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { api } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

const SOURCE_COLORS: Record<string, string> = {
  internshala: 'bg-orange-50 text-orange-600 border-orange-200',
  linkedin: 'bg-blue-50 text-blue-600 border-blue-200',
  wellfound: 'bg-purple-50 text-purple-600 border-purple-200',
};

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.opportunities.get(id)
      .then(setOpp)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await api.applications.create({ opportunity_id: id });
      setSaved(true);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Opportunity not found</p>
        <Link to="/opportunities" className="text-brand-600 mt-4 inline-block">Back to opportunities</Link>
      </div>
    );
  }

  const score = Math.round((opp.match_score || 0) * 100);
  const scoreClass = score >= 75 ? 'match-score-high' : score >= 50 ? 'match-score-med' : 'match-score-low';

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </Link>

      {/* Header */}
      <div className="card p-8">
        <div className="flex items-start gap-6">
          <div className={`match-score ${scoreClass} w-16 h-16 text-xl`}>{score}</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>
                <p className="text-lg text-brand-600 font-medium mt-1">{opp.company}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${SOURCE_COLORS[opp.source] || 'bg-gray-50 text-gray-600'}`}>
                <Globe className="w-3.5 h-3.5" />
                {opp.source}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-500">
              {opp.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {opp.location}
                </span>
              )}
              {opp.stipend && (
                <span className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  {opp.stipend}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {opp.work_mode}
              </span>
              {opp.duration && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {opp.duration}
                </span>
              )}
              {opp.applicants_count !== null && opp.applicants_count !== undefined && (
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {opp.applicants_count} applicants
                </span>
              )}
            </div>

            {/* Match reason */}
            {opp.match_reason && (
              <div className="mt-6 p-4 bg-brand-50 rounded-xl border border-brand-100">
                <p className="text-sm font-medium text-brand-800">Why this fits you</p>
                <p className="text-sm text-brand-700 mt-1">{opp.match_reason}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`btn-primary ${saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
              >
                {saved ? (
                  <><Check className="w-4 h-4 mr-2" /> Saved</>
                ) : (
                  <><BookmarkPlus className="w-4 h-4 mr-2" /> Save Opportunity</>
                )}
              </button>
              <a
                href={opp.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original Listing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
          {opp.description || 'No description available.'}
        </div>
      </div>

      {/* Skills & Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Required Skills</h3>
          {opp.skills_required?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {opp.skills_required.map((skill: string) => (
                <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No skills listed</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Details</h3>
          <div className="space-y-3 text-sm">
            {opp.posted_date && (
              <div className="flex justify-between">
                <span className="text-gray-500">Posted</span>
                <span className="text-gray-900">{formatDistanceToNow(new Date(opp.posted_date), { addSuffix: true })}</span>
              </div>
            )}
            {opp.deadline && (
              <div className="flex justify-between">
                <span className="text-gray-500">Deadline</span>
                <span className="text-gray-900">{new Date(opp.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Source</span>
              <span className="text-gray-900 capitalize">{opp.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Work Mode</span>
              <span className="text-gray-900 capitalize">{opp.work_mode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
