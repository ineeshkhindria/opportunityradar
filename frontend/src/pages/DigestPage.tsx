import { useEffect, useState } from 'react';
import {
  Bell,
  Save,
  Loader2,
  Mail,
  Clock,
  Calendar,
  History,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
];

export function DigestPage() {
  const [prefs, setPrefs] = useState({
    enabled: true,
    frequency: 'weekly',
    day: 'sunday',
    time: '10:00',
    max_results: 5,
    min_match_score: 0,
    include_new_only: true,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      api.digest.getPreferences(),
      api.digest.getLogs(5),
    ])
      .then(([p, l]) => {
        if (p) setPrefs(p);
        setLogs(l || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.digest.updatePreferences(prefs);
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Digest Settings</h1>
        <p className="text-gray-500 mt-1">Get your top internship matches delivered to your inbox</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${prefs.enabled ? 'bg-brand-50' : 'bg-gray-50'}`}>
                <Mail className={`w-6 h-6 ${prefs.enabled ? 'text-brand-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Weekly Digest</h2>
                <p className="text-sm text-gray-500">Receive your top matches via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={(e) => setPrefs({ ...prefs, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>

        {prefs.enabled && (
          <>
            {/* Schedule */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                Schedule
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Frequency</label>
                  <select
                    className="input-field"
                    value={prefs.frequency}
                    onChange={(e) => setPrefs({ ...prefs, frequency: e.target.value })}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Day</label>
                  <select
                    className="input-field capitalize"
                    value={prefs.day}
                    onChange={(e) => setPrefs({ ...prefs, day: e.target.value })}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d} className="capitalize">{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={prefs.time}
                    onChange={(e) => setPrefs({ ...prefs, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-500" />
                Content Preferences
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Max Results</label>
                  <select
                    className="input-field"
                    value={prefs.max_results}
                    onChange={(e) => setPrefs({ ...prefs, max_results: parseInt(e.target.value) })}
                  >
                    {[3, 5, 10, 15, 20].map((n) => (
                      <option key={n} value={n}>{n} opportunities</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Min Match Score</label>
                  <select
                    className="input-field"
                    value={prefs.min_match_score}
                    onChange={(e) => setPrefs({ ...prefs, min_match_score: parseFloat(e.target.value) })}
                  >
                    <option value={0}>Any score</option>
                    <option value={0.3}>30%+</option>
                    <option value={0.5}>50%+</option>
                    <option value={0.7}>70%+</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.include_new_only}
                      onChange={(e) => setPrefs({ ...prefs, include_new_only: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Only new opportunities</span>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={saving} className="btn-primary py-3.5 px-8">
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <><Save className="w-4 h-4 mr-2" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Settings</>
          )}
        </button>
      </form>

      {/* Digest History */}
      {logs.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-brand-500" />
            Recent Digests
          </h2>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  {log.opened ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-300" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {log.opportunities_count} opportunities
                    </p>
                    <p className="text-xs text-gray-500">
                      Sent {new Date(log.sent_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${log.opened ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {log.opened ? 'Opened' : 'Not opened'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
