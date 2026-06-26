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
  Building2,
  Globe,
  Zap,
  Bell,
  Brain,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

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
    desc: "If you don't know someone on the inside, you don't stand a chance.",
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
    desc: 'We scrape LinkedIn, and more so you don\'t have to hunt across 10 tabs.',
  },
  {
    icon: Sparkles,
    title: 'Smart Rankings',
    desc: 'Every opportunity gets a match score and a plain-English explanation of why it fits you.',
  },
  {
    icon: Mail,
    title: 'Weekly Digest',
    desc: 'Your top 5 matches delivered to your inbox every week. Apply in one click.',
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

export function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Radar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              OpportunityRadar
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started Free</Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-400" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-white/[0.06] p-4 space-y-3 bg-surface/95 backdrop-blur-xl">
            <Link to="/login" className="block btn-ghost w-full text-center">Log in</Link>
            <Link to="/register" className="block btn-primary text-sm py-2.5 text-center">Get Started Free</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px]">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-brand-500/5 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-medium text-brand-300">Smart internship discovery, powered by AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white animate-slide-up">
                Stop hunting.{' '}
                <span className="gradient-text">Start matching.</span>
              </h1>

              <p className="mt-6 text-lg lg:text-xl text-gray-400 leading-relaxed">
                OpportunityRadar scrapes internships from across the web, 
                ranks them using AI to match{' '}
                <strong className="text-white">your unique profile</strong>, 
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Free for students
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Set up in 2 minutes
                </span>
              </div>
            </div>

            {/* Right: Radar */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Internship hunting is{' '}
              <span className="gradient-text">broken</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Every student feels this pain. Here's why the system fails you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-4">
              <Radar className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium text-brand-300">How it works</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Your personal internship radar
            </h2>
            <p className="mt-4 text-gray-400">
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
                desc: 'We scrape multiple platforms and rank every opportunity against your profile.',
              },
              {
                step: '03',
                title: 'Apply with confidence',
                desc: 'Get a weekly digest of your top 5 matches with clear reasons why they fit.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-black text-brand-500/20 mb-4">{step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Everything you need to{' '}
              <span className="gradient-text">land the internship</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Built by students who were tired of the old way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover p-6">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stop competing with 500 people.{' '}
            <span className="gradient-text">Let AI find your edge.</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
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
      <footer className="border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>Built with frustration by students who deserved better. &copy; 2026 OpportunityRadar.</p>
        </div>
      </footer>
    </div>
  );
}
