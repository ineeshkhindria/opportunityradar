import { Link } from 'react-router-dom';
import { HeroVisual } from '../components/ui/HeroVisual';
import {
  Radar,
  Sparkles,
  Search,
  Mail,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Building2,
  Globe,
  Zap,
  Bell,
  Brain,
} from 'lucide-react';

const problems = [
  {
    icon: Search,
    title: 'LinkedIn is noisy',
    desc: 'Hundreds of irrelevant posts, recruiters who ghost, and no signal in the noise.',
  },
  {
    icon: Building2,
    title: 'Internshala is saturated',
    desc: '500+ applicants per posting within hours. Your application disappears in the crowd.',
  },
  {
    icon: Globe,
    title: 'Referrals are luck',
    desc: 'If you don\'t know someone on the inside, you don\'t stand a chance. That\'s broken.',
  },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    desc: 'Our LLM analyzes your skills, year, branch, and domain preferences to find internships that actually fit.',
  },
  {
    icon: Search,
    title: 'Multi-Source Aggregation',
    desc: 'We scrape Internshala, LinkedIn, and Wellfound so you don\'t have to hunt across 10 tabs.',
  },
  {
    icon: Sparkles,
    title: 'Smart Rankings',
    desc: 'Every opportunity gets a match score and a plain-English explanation of why it fits you.',
  },
  {
    icon: Mail,
    title: 'Weekly Digest',
    desc: 'Your top 5 matches delivered to your inbox every Sunday. Apply in one click.',
  },
  {
    icon: TrendingUp,
    title: 'Application Tracker',
    desc: 'Track every application, get reminded about deadlines, and never drop a ball.',
  },
  {
    icon: Bell,
    title: 'Deadline Reminders',
    desc: 'Smart notifications before deadlines so you always apply on time.',
  },
];

const stats = [
  { value: '10K+', label: 'Internships Scraped Weekly' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '3', label: 'Sources Aggregated' },
  { value: '60%', label: 'Faster Discovery' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Radar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              OpportunityRadar
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-brand-100/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-pink-400/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text content */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-medium text-brand-700">Smart internship discovery, powered by AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight animate-slide-up">
                Stop hunting.{' '}
                <span className="gradient-text">Start matching.</span>
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                OpportunityRadar scrapes internships from across the web, 
                ranks them using AI to match{' '}
                <strong className="text-gray-900">your unique profile</strong>, 
                and delivers your top picks weekly. No noise. No luck required.
              </p>

              <div className="flex items-center gap-4 mt-8">
                <Link to="/register" className="btn-primary text-base lg:text-lg py-3.5 px-7 lg:py-4 lg:px-8">
                  Start Matching Free
                  <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
                <Link to="/login" className="btn-secondary text-base lg:text-lg py-3.5 px-7 lg:py-4 lg:px-8">
                  Watch Demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Free for students
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Set up in 2 minutes
                </span>
              </div>
            </div>

            {/* Right: Dynamic Radar Visualization */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Internship hunting is{' '}
              <span className="gradient-text">broken</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Every student feels this pain. Here's why the system fails you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-4">
              <Radar className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">How it works</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Your personal internship radar
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Set up your profile once. Let AI do the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell us about yourself',
                desc: 'Enter your skills, year, branch, and preferred domains. Takes 2 minutes.',
              },
              {
                step: '02',
                title: 'AI finds your matches',
                desc: 'We scrape 3+ platforms and rank every opportunity against your profile.',
              },
              {
                step: '03',
                title: 'Apply with confidence',
                desc: 'Get a weekly digest of your top 5 matches with clear reasons why they fit.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-brand-100 mb-4">{step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Everything you need to{' '}
              <span className="gradient-text">land the internship</span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built by students who were tired of the old way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover p-6">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold text-white mb-2">{value}</div>
                <div className="text-brand-100 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Stop competing with 500 people.{' '}
            <span className="gradient-text">Let AI find your edge.</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of students who've stopped scrolling and started matching.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-lg py-4 px-10">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>Built with frustration by students who deserved better. &copy; 2026 OpportunityRadar.</p>
        </div>
      </footer>
    </div>
  );
}
