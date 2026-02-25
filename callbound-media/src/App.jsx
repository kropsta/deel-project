import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';

const Navbar = () => (
  <nav className="nav-container">
    <div className="nav-content">
      <div className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '8px', background: '#0F172A', borderRadius: '8px', color: 'white' }}>CB</div>
        <span>CallBound <span style={{ color: '#EF4444' }}>Media</span></span>
      </div>
      <div className="nav-links">
        <a href="#about">What We Do</a>
        <a href="#publishers">Publishers</a>
        <a href="#advertisers">Advertisers</a>
        <button className="btn btn-primary">Join Network</button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="hero">
    <div className="section-container">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-tagline"
      >
        Where Intent Meets Opportunity
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hero-title"
      >
        The Premier Pay-Per-Call <br /> <span style={{ color: '#0EA5E9' }}>Insurance Network</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hero-subtitle"
      >
        Connecting world-class publishers with leading insurance agencies. We specialize in high-intent inbound calls and live transfers for Final Expense and ACA.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
      >
        <button className="btn btn-primary" onClick={() => document.getElementById('signup').scrollIntoView()}>
          Get Started <ArrowRight size={18} />
        </button>
        <button className="btn btn-outline">Explore Verticals</button>
      </motion.div>
    </div>
  </section>
);

const Services = () => (
  <section id="about" className="section-container">
    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
      <h2>Performance-Driven Growth</h2>
      <p style={{ color: '#64748B', maxWidth: '600px', margin: '16px auto' }}>
        We simplify the bridge between traffic and revenue with compliant, high-conversion call matching.
      </p>
    </div>
    <div className="services-grid">
      <div className="card">
        <div className="card-icon"><PhoneCall size={24} /></div>
        <h3>Real-Time Transfers</h3>
        <p style={{ color: '#64748B' }}>Inbound calls and live transfers routed instantly to your sales floor with 100% transparency.</p>
      </div>
      <div className="card">
        <div className="card-icon"><Users size={24} /></div>
        <h3>Targeted Audiences</h3>
        <p style={{ color: '#64748B' }}>Specialized campaigns for Final Expense and ACA insurance prospects searching for solutions.</p>
      </div>
      <div className="card">
        <div className="card-icon"><BarChart3 size={24} /></div>
        <h3>ROAS Focused</h3>
        <p style={{ color: '#64748B' }}>Data-driven optimization to ensure both publishers and advertisers achieve maximum efficiency.</p>
      </div>
    </div>
  </section>
);

const IndustryFocus = () => (
  <section style={{ background: '#0F172A', color: 'white', padding: '100px 20px' }}>
    <div className="section-container" style={{ padding: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '24px' }}>Our Core Verticals</h2>
          <p style={{ color: '#94A3B8', fontSize: '1.25rem', marginBottom: '32px' }}>
            We focus on the most competitive and rewarding insurance sectors, ensuring deep expertise and high-quality traffic.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Final Expense Life Insurance', 'ACA Health Insurance (Obamacare)', 'Medicare Advantage & Supplements'].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#0EA5E9" />
                <span style={{ fontSize: '1.125rem' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', borderRadius: '24px', padding: '48px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0EA5E9', marginBottom: '8px' }}>98%</div>
            <div style={{ color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Average Connectivity</div>
            <div style={{ margin: '32px 0', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#EF4444', marginBottom: '8px' }}>150k+</div>
            <div style={{ color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Monthly Call Volume</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SignupForm = () => {
  const [role, setRole] = useState('publisher'); // publisher or advertiser

  return (
    <section id="signup" className="section-container signup-section" style={{ borderRadius: '40px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2>Join CallBound Media</h2>
        <p style={{ color: '#64748B' }}>Ready to scale your insurance business? Choose your path below.</p>
      </div>

      <div className="form-toggle">
        <button
          className={`toggle-btn ${role === 'publisher' ? 'active' : ''}`}
          onClick={() => setRole('publisher')}
        >
          I am a Publisher
        </button>
        <button
          className={`toggle-btn ${role === 'advertiser' ? 'active' : ''}`}
          onClick={() => setRole('advertiser')}
        >
          I am an Advertiser
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="form-container"
        >
          <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>
            {role === 'publisher' ? 'Get High-Intent Calls' : 'Monetize Your Traffic'}
          </h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="form-input" placeholder="John Doe" required />
            </div>
            <div className="input-group">
              <label className="input-label">Work Email</label>
              <input type="email" className="form-input" placeholder="john@company.com" required />
            </div>
            <div className="input-group">
              <label className="input-label">Company Name</label>
              <input type="text" className="form-input" placeholder="Media Pros Inc." required />
            </div>
            <div className="input-group">
              <label className="input-label">
                {role === 'publisher' ? 'Traffic Source' : 'Industry/Vertical'}
              </label>
              <select className="form-input">
                <option>{role === 'publisher' ? 'Search / PPC' : 'Final Expense'}</option>
                <option>{role === 'publisher' ? 'Social Media' : 'ACA / Health'}</option>
                <option>{role === 'publisher' ? 'SEO' : 'Medicare'}</option>
                <option>Other</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              Submit Application
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const Footer = () => (
  <footer style={{ background: '#F8FAFC', padding: '80px 20px', borderTop: '1px solid #E2E8F0' }}>
    <div className="section-container" style={{ padding: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
        <div>
          <div className="logo-text" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
            CallBound <span style={{ color: '#EF4444' }}>Media</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
            Where Intent Meets Opportunity. Empowering the insurance industry with high-quality pay-per-call solutions.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '20px' }}>Company</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: '#64748B' }}>
            <li>About Us</li>
            <li>Careers</li>
            <li>Compliance</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '20px' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: '#64748B' }}>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '20px' }}>Contact</h4>
          <p style={{ color: '#64748B' }}>hello@callboundmedia.com</p>
        </div>
      </div>
      <div style={{ marginTop: '80px', paddingTop: '32px', borderTop: '1px solid #E2E8F0', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
        © {new Date().getFullYear()} CallBound Media. All rights reserved.
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <Navbar />
      <Hero />
      <Services />
      <IndustryFocus />
      <SignupForm />
      <Footer />
    </div>
  );
}

export default App;
