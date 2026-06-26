import { useEffect, useRef, useState } from 'react';

interface OrbitingCard {
  id: number;
  label: string;
  sublabel: string;
  color: string;
  angle: number;
  speed: number;
  radius: number;
  yOffset: number;
}

const cards: OrbitingCard[] = [
  { id: 0, label: 'Google', sublabel: 'SWE Intern', color: 'from-blue-500 to-blue-600', angle: 0, speed: 0.3, radius: 160, yOffset: 0 },
  { id: 1, label: 'Stripe', sublabel: 'Backend Intern', color: 'from-purple-500 to-purple-600', angle: 72, speed: 0.25, radius: 140, yOffset: -20 },
  { id: 2, label: 'Figma', sublabel: 'Design Intern', color: 'from-pink-500 to-pink-600', angle: 144, speed: 0.35, radius: 150, yOffset: 15 },
  { id: 3, label: 'Notion', sublabel: 'Product Intern', color: 'from-emerald-500 to-emerald-600', angle: 216, speed: 0.2, radius: 170, yOffset: -10 },
  { id: 4, label: 'Vercel', sublabel: 'Frontend Intern', color: 'from-orange-500 to-orange-600', angle: 288, speed: 0.4, radius: 135, yOffset: 10 },
];

const floatingParticles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 3,
}));

const companyLogos = [
  { name: 'Google', color: 'from-blue-400 to-blue-600' },
  { name: 'Meta', color: 'from-sky-400 to-blue-600' },
  { name: 'Amazon', color: 'from-amber-400 to-orange-500' },
  { name: 'Apple', color: 'from-gray-400 to-gray-600' },
  { name: 'Netflix', color: 'from-red-500 to-red-600' },
  { name: 'Spotify', color: 'from-emerald-400 to-emerald-600' },
  { name: 'Stripe', color: 'from-purple-400 to-purple-600' },
  { name: 'Figma', color: 'from-pink-400 to-pink-600' },
];

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [angle, setAngle] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { label: 'Discover', color: '#8b5cf6' },
    { label: 'Match', color: '#6366f1' },
    { label: 'Apply', color: '#10b981' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      setScrollProgress(progress);
      setActiveSection(Math.min(2, Math.floor(progress * 3)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setAngle(prev => (prev + 0.3) % 360);
      setPulseScale(prev => {
        const next = prev + 0.003;
        return next > 1.15 ? 0.85 : next;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const radarRotation = angle * 1.5 + scrollProgress * 45;
  const cardOrbit = cards.map((card, i) => {
    const a = ((card.angle + angle * card.speed) * Math.PI) / 180;
    const r = card.radius + scrollProgress * 20;
    return {
      ...card,
      x: Math.cos(a) * r,
      z: Math.sin(a) * r,
      opacity: Math.max(0.3, 0.5 + Math.sin(a) * 0.5),
      scale: Math.max(0.6, 0.7 + Math.cos(a) * 0.3),
    };
  });

  const parallaxX = (mousePos.x - 0.5) * 20;
  const parallaxY = (mousePos.y - 0.5) * 20;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Grid background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        viewBox="0 0 800 800"
      >
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Floating background particles */}
      <div className="absolute inset-0">
        {floatingParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-brand-400/20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main radar container with parallax */}
      <div
        className="relative"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Outer glow rings */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${sections[activeSection].color}15 0%, transparent 70%)`,
            transform: `scale(${1 + scrollProgress * 0.1})`,
          }}
        />

        {/* Radar rings */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-brand-300/20"
            style={{
              width: `${i * 90}px`,
              height: `${i * 90}px`,
              left: `${180 - i * 45}px`,
              top: `${180 - i * 45}px`,
              transform: `scale(${1 + pulseScale * 0.02 * i})`,
              opacity: 0.5 - i * 0.1,
              transition: 'transform 0.1s ease-out',
            }}
          />
        ))}

        {/* Radar sweep */}
        <div
          className="absolute w-[360px] h-[360px] left-0 top-0"
          style={{ transform: `rotate(${radarRotation}deg)` }}
        >
          <div
            className="absolute w-1/2 h-full origin-right"
            style={{
              background: `linear-gradient(to right, transparent 0%, ${sections[activeSection].color}30 50%, ${sections[activeSection].color}10 100%)`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%)',
              borderRadius: '50% 0 0 50%',
            }}
          />
        </div>

        {/* Center core */}
        <div className="relative w-[360px] h-[360px] flex items-center justify-center">
          {/* Pulsing center dot */}
          <div
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: `radial-gradient(circle at center, ${sections[activeSection].color}40, transparent)`,
              transform: `scale(${pulseScale})`,
            }}
          />
          <div
            className="absolute w-16 h-16 rounded-full"
            style={{
              background: `radial-gradient(circle at center, ${sections[activeSection].color}60, ${sections[activeSection].color}20)`,
              transform: `scale(${pulseScale * 0.8})`,
            }}
          />
          <div
            className="absolute w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${sections[activeSection].color}, #8b5cf6)`,
              boxShadow: `0 0 30px ${sections[activeSection].color}50`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              <circle cx="11" cy="11" r="3" />
              <circle cx="11" cy="11" r="1" />
            </svg>
          </div>

          {/* Orbiting cards */}
          {cardOrbit.map((card) => (
            <div
              key={card.id}
              className="absolute flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0c0c1a]/90 backdrop-blur-sm border border-white/10 shadow-xl shadow-black/30 transition-all duration-300"
              style={{
                transform: `translate(${card.x}px, ${card.yOffset + mousePos.y * 5}px) scale(${card.scale})`,
                opacity: card.opacity,
                boxShadow: `0 4px 20px ${card.color.includes('blue') ? '#3b82f630' : card.color.includes('purple') ? '#8b5cf630' : card.color.includes('pink') ? '#ec489930' : '#10b98130'}`,
                zIndex: Math.round(card.scale * 10),
              }}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                {card.label.slice(0, 2).toUpperCase()}
              </div>
              <div>
                  <p className="text-sm font-semibold text-white leading-tight">{card.label}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">{card.sublabel}</p>
              </div>
            </div>
          ))}

          {/* Dots on radar (representing opportunities) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = ((i * 30 + angle * 0.5) * Math.PI) / 180;
            const r = 70 + Math.sin(i * 1.5 + Date.now() * 0.001) * 30;
            return (
              <div
                key={`dot-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: sections[activeSection].color,
                  transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r}px)`,
                  opacity: 0.3 + Math.sin(i + Date.now() * 0.002) * 0.2,
                  boxShadow: `0 0 8px ${sections[activeSection].color}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom floating company badges */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="flex -space-x-2">
          {companyLogos.slice(0, 5).map((c, i) => (
            <div
              key={c.name}
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-[8px] font-bold border-2 border-white shadow-sm`}
              style={{
                transform: `translateY(${Math.sin(Date.now() * 0.001 + i * 1.5) * 3}px)`,
                transition: 'transform 0.1s',
              }}
            >
              {c.name.slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>1,200+ internships available</span>
        </div>
      </div>

      {/* Section indicator dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {sections.map((s, i) => (
          <div
            key={s.label}
            className="relative flex items-center gap-2"
          >
            <div
              className={`rounded-full transition-all duration-500 ${
                i === activeSection ? 'w-3 h-3' : 'w-2 h-2 opacity-30'
              }`}
              style={{ background: s.color }}
            />
            {i === activeSection && (
              <span className="text-[10px] font-medium text-gray-400 absolute left-5 whitespace-nowrap">
                {s.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scroll indicator */}

      {/* Connection lines from center to cards */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
