import { useEffect, useState } from 'react';
import {
  User,
  Save,
  Loader2,
  GraduationCap,
  BookOpen,
  Wrench,
  Heart,
  MapPin,
  Globe,
  DollarSign,
  Github,
  Linkedin,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { api } from '../lib/api';

const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
  'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Aerospace',
  'Data Science', 'Artificial Intelligence', 'Robotics', 'Other',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduated'];

const DOMAINS = [
  'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
  'Mobile Development', 'DevOps', 'Cloud Computing', 'Cybersecurity',
  'UI/UX Design', 'Product Management', 'Finance', 'Marketing',
  'Business Development', 'Consulting', 'Research', 'Content Writing',
];

const WORK_MODES = ['remote', 'hybrid', 'onsite'];

const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'C++',
  'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'TensorFlow', 'PyTorch',
  'Figma', 'Framer', 'Next.js', 'Django', 'Flask', 'FastAPI', 'GO',
  'Rust', 'Kotlin', 'Swift', 'Flutter', 'MongoDB', 'PostgreSQL', 'Redis',
];

export function ProfilePage() {
  const [form, setForm] = useState({
    college: '',
    year: '',
    branch: '',
    degree: 'B.Tech',
    skills: [] as string[],
    preferred_domains: [] as string[],
    preferred_locations: [] as string[],
    work_mode: 'remote',
    min_stipend: 0,
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    bio: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.profile.get()
      .then((p) => {
        if (p) {
          setForm({
            college: p.college || '',
            year: p.year || '',
            branch: p.branch || '',
            degree: p.degree || 'B.Tech',
            skills: p.skills || [],
            preferred_domains: p.preferred_domains || [],
            preferred_locations: p.preferred_locations || [],
            work_mode: p.work_mode || 'remote',
            min_stipend: p.min_stipend || 0,
            github_url: p.github_url || '',
            linkedin_url: p.linkedin_url || '',
            portfolio_url: p.portfolio_url || '',
            bio: p.bio || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const addLocation = () => {
    const loc = locationInput.trim();
    if (loc && !form.preferred_locations.includes(loc)) {
      setForm({ ...form, preferred_locations: [...form.preferred_locations, loc] });
    }
    setLocationInput('');
  };

  const removeLocation = (loc: string) => {
    setForm({ ...form, preferred_locations: form.preferred_locations.filter((l) => l !== loc) });
  };

  const toggleDomain = (domain: string) => {
    setForm({
      ...form,
      preferred_domains: form.preferred_domains.includes(domain)
        ? form.preferred_domains.filter((d) => d !== domain)
        : [...form.preferred_domains, domain],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.profile.upsert(form);
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
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 mt-1">Tell us about yourself so we can find the best matches</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-500" />
            Education
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">College / University</label>
              <input
                type="text"
                className="input-field"
                placeholder="Stanford University"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Degree</label>
              <input
                type="text"
                className="input-field"
                placeholder="B.Tech"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Year</label>
              <select
                className="input-field"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Branch / Major</label>
              <select
                className="input-field"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              >
                <option value="">Select branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-brand-500" />
            Skills
          </h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_SKILLS.filter((s) => !form.skills.includes(s)).slice(0, 15).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                + {skill}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="input-field"
              placeholder="Type a skill and press Add"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
            />
            <button type="button" onClick={() => addSkill(skillInput)} className="btn-secondary">Add</button>
          </div>

          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-brand-500" />
            Preferences
          </h2>

          <div>
            <label className="label">Preferred Domains</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.preferred_domains.includes(domain)
                      ? 'bg-brand-50 text-brand-700 border-brand-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Preferred Locations</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input-field"
                  placeholder="Bangalore"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                />
                <button type="button" onClick={addLocation} className="btn-secondary">Add</button>
              </div>
              {form.preferred_locations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.preferred_locations.map((loc) => (
                    <span key={loc} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      <MapPin className="w-3 h-3" />
                      {loc}
                      <button type="button" onClick={() => removeLocation(loc)} className="hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Work Mode</label>
              <div className="flex gap-2">
                {WORK_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, work_mode: mode })}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                      form.work_mode === mode
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Minimum Expected Stipend (INR/month)</label>
            <input
              type="number"
              className="input-field"
              placeholder="15000"
              value={form.min_stipend || ''}
              onChange={(e) => setForm({ ...form, min_stipend: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Links */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-brand-500" />
            Links
          </h2>

          <div className="space-y-4">
            <div>
              <label className="label flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://github.com/yourusername"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://linkedin.com/in/yourusername"
                value={form.linkedin_url}
                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Portfolio
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://yourportfolio.com"
                value={form.portfolio_url}
                onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-500" />
            Bio
          </h2>
          <textarea
            className="input-field min-h-[100px] resize-y"
            placeholder="Tell us a bit about yourself, your interests, and what you're looking for..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary py-3.5 px-8">
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <><Save className="w-4 h-4 mr-2" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Profile</>
            )}
          </button>
          <p className="text-sm text-gray-400">
            Your profile is used to match you with the best opportunities
          </p>
        </div>
      </form>
    </div>
  );
}
