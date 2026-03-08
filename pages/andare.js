import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/andare.module.css';

// ─── Configuration ──────────────────────────────────────────────────
// Replace LIVE_STREAM_ID with your actual YouTube live stream / video ID
// e.g. https://www.youtube.com/watch?v=abc123XYZ  →  LIVE_STREAM_ID = 'abc123XYZ'
const YOUTUBE_STREAM_ID = 'LIVE_STREAM_ID';

// ─── SVG Wave Divider ────────────────────────────────────────────────
function WaveDown({ fromColor = '#1a1a2e', toColor = '#F5F3EF' }) {
    return (
        <div className={styles.waveDivider}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect width="1440" height="80" fill={fromColor} />
                <path
                    d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
                    fill={toColor}
                />
            </svg>
        </div>
    );
}

function WaveUp({ fromColor = '#F5F3EF', toColor = '#1a1a2e' }) {
    return (
        <div className={styles.waveDivider}>
            <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect width="1440" height="80" fill={fromColor} />
                <path
                    d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,0 L0,0 Z"
                    fill={toColor}
                />
            </svg>
        </div>
    );
}

// ─── Lead Form ───────────────────────────────────────────────────────
function LeadForm() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        interest: '',
        message: '',
    });
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('');

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/andare-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Submission failed. Please try again.');
            }

            setStatus('success');
            setForm({ firstName: '', lastName: '', email: '', phone: '', interest: '', message: '' });
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
                {/* First Name */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="firstName">
                        First Name<span className={styles.formRequired}>*</span>
                    </label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        placeholder="Elena"
                        value={form.firstName}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                </div>

                {/* Last Name */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="lastName">
                        Last Name<span className={styles.formRequired}>*</span>
                    </label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        autoComplete="family-name"
                        placeholder="Rossi"
                        value={form.lastName}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="email">
                        Email Address<span className={styles.formRequired}>*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="elena@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="phone">
                        Phone Number<span className={styles.formRequired}>*</span>
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+1 (954) 000-0000"
                        value={form.phone}
                        onChange={handleChange}
                        className={styles.formInput}
                    />
                </div>

                {/* Residence Interest */}
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="interest">
                        Residence Interest<span className={styles.formRequired}>*</span>
                    </label>
                    <select
                        id="interest"
                        name="interest"
                        required
                        value={form.interest}
                        onChange={handleChange}
                        className={styles.formSelect}
                    >
                        <option value="" disabled>Select a residence type…</option>
                        <option value="2BR">2-Bedroom Residence</option>
                        <option value="3BR">3-Bedroom Residence</option>
                        <option value="4BR">4-Bedroom Residence</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Not Sure">Not Sure Yet</option>
                    </select>
                </div>

                {/* Message */}
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="message">
                        Message / Notes <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>(Optional)</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        placeholder="Share any specific questions, preferred move-in timeline, or budget range…"
                        value={form.message}
                        onChange={handleChange}
                        className={styles.formTextarea}
                        rows={4}
                    />
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                id="submit-lead-form"
                className={styles.formSubmit}
                disabled={status === 'loading' || status === 'success'}
            >
                {status === 'loading' ? (
                    <>
                        <span className={styles.formSubmitSpinner} />
                        Sending…
                    </>
                ) : status === 'success' ? (
                    '✓ Information Sent'
                ) : (
                    'Send My Information'
                )}
            </button>

            {/* Success Message */}
            {status === 'success' && (
                <div className={styles.formSuccess} role="status">
                    <div className={styles.formSuccessIcon}>✓</div>
                    <div className={styles.formSuccessText}>
                        <strong>Thank you — we&apos;ll be in touch shortly.</strong>
                        <span>
                            A member of our team will contact you within one business day to discuss
                            availability at Andare Residences Las Olas.
                        </span>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
                <div className={styles.formError} role="alert">
                    {errorMsg}
                </div>
            )}
        </form>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function AndarePage() {
    const [scrolled, setScrolled] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('andare-page');
        return () => document.body.classList.remove('andare-page');
    }, []);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 20);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    function scrollToForm() {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <>
            <Head>
                <title>Watch Andare Residences Rise — Live Construction Stream | Las Olas, Fort Lauderdale</title>
                <meta
                    name="description"
                    content="Watch the Andare Residences luxury tower rise in real time from Las Olas, Fort Lauderdale. Register your interest in 2BR–Penthouse residences designed by Pininfarina."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* ── NAVBAR ─────────────────────────────────────────────── */}
            <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`} aria-label="Main navigation">
                <a href="#" className={styles.navLogo} id="nav-logo">
                    <span className={styles.navLogoMain}>Andare</span>
                    <span className={styles.navLogoSub}>Residences · Las Olas</span>
                </a>

                <ul className={styles.navLinks} role="list">
                    <li><a href="#about" id="nav-about">About the Building</a></li>
                    <li><a href="#residences" id="nav-residences">Residences</a></li>
                    <li><a href="#stream" id="nav-stream">Watch Live</a></li>
                    <li><a href="#contact" id="nav-contact">Contact</a></li>
                </ul>

                <div className={styles.navRight}>
                    <a href="tel:+19547999857" className={styles.navPhone} id="nav-phone" aria-label="Call us at 954-799-9857">
                        954-799-9857
                    </a>
                    <button onClick={scrollToForm} className={styles.btnNav} id="nav-get-info" aria-label="Get information about Andare Residences">
                        Get Info
                    </button>
                </div>
            </nav>

            {/* ── HERO / STREAM ──────────────────────────────────────── */}
            <section className={styles.hero} id="stream" aria-label="Live construction stream">
                <div className={styles.heroOverlayTop} aria-hidden="true" />

                <div className={styles.heroTagline}>
                    <span className={styles.heroEyebrow}>Fort Lauderdale · Las Olas · Live</span>
                    <h1 className={styles.heroTitle}>
                        Watch Andare Residences Rise —<br />
                        <em>Live from Las Olas</em>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        An exclusive, front-row view of Fort Lauderdale&apos;s most anticipated luxury
                        residence — streaming directly from the construction site.
                    </p>
                    <button onClick={scrollToForm} className={styles.btnPrimary} id="hero-register-cta" aria-label="Register your interest">
                        Register Your Interest
                    </button>
                </div>

                <div className={styles.heroStreamWrapper}>
                    <div className={styles.streamContainer}>
                        <iframe
                            id="live-stream-embed"
                            src={`https://www.youtube.com/embed/${YOUTUBE_STREAM_ID}?autoplay=1&mute=1&loop=1&rel=0&modestbranding=1`}
                            title="Andare Residences Live Construction Stream — Las Olas, Fort Lauderdale"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>

                <div className={styles.heroCta}>
                    <div className={styles.scrollArrow} aria-hidden="true">
                        <span />
                    </div>
                </div>
            </section>

            <WaveDown fromColor="#1a1a2e" toColor="#F5F3EF" />

            {/* ── ABOUT ──────────────────────────────────────────────── */}
            <section className={styles.about} id="about" aria-label="About Andare Residences">
                <div className={styles.aboutInner}>
                    {/* Left — Copy */}
                    <div>
                        <span className={styles.sectionEyebrow}>Fort Lauderdale · Pininfarina Design</span>
                        <h2 className={styles.sectionTitle} id="residences">
                            A New Icon<br />on Las Olas
                        </h2>
                        <p className={styles.aboutText}>
                            Andare Residences is a landmark 42-story luxury tower rising at the heart of Fort
                            Lauderdale&apos;s most prestigious address — 788 East Las Olas Boulevard. Conceived by
                            the world-renowned Pininfarina design studio and developed with an uncompromising
                            commitment to lifestyle, Andare offers 163 exquisitely appointed residences above a
                            curated world of amenity.
                        </p>
                        <p className={styles.aboutText}>
                            From sunrise yoga above the Las Olas skyline to private dining and curated wellness
                            experiences, life at Andare is defined by seamless service and extraordinary design.
                            Every residence features floor-to-ceiling glass, open-plan living, and bespoke
                            Italian-inspired finishes — crafted for those who expect more.
                        </p>

                        <ul className={styles.amenitiesList} aria-label="Key amenities">
                            <li>35,000 sq ft of resort-style amenities</li>
                            <li>Rooftop infinity pool with panoramic Intracoastal views</li>
                            <li>Private residents&apos; club, bar &amp; social lounge</li>
                            <li>State-of-the-art fitness center &amp; wellness spa</li>
                            <li>Concierge services, valet &amp; private storage</li>
                            <li>Steps from world-class dining, art &amp; the beach</li>
                        </ul>

                        <div className={styles.aboutStats} aria-label="Building statistics">
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>163</span>
                                <span className={styles.statLabel}>Luxury Residences</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>42</span>
                                <span className={styles.statLabel}>Stories High</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>35K</span>
                                <span className={styles.statLabel}>Sq Ft Amenities</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>#1</span>
                                <span className={styles.statLabel}>Las Olas Address</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — Visual */}
                    <div className={styles.aboutImageWrapper} aria-hidden="true">
                        {/* Elegant placeholder — a gradient card representing the tower */}
                        <div
                            style={{
                                width: '100%',
                                height: '520px',
                                background: 'linear-gradient(160deg, #1a1a2e 0%, #2c3e5a 40%, #8FA8C8 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                padding: '40px',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            role="img"
                            aria-label="Andare Residences rendering"
                        >
                            {/* Tower silhouette */}
                            <svg
                                viewBox="0 0 200 400"
                                style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '55%', opacity: 0.15 }}
                                aria-hidden="true"
                            >
                                <rect x="60" y="0" width="80" height="400" fill="white" />
                                <rect x="40" y="100" width="120" height="300" fill="white" opacity="0.7" />
                                <rect x="70" y="380" width="60" height="20" fill="white" opacity="0.5" />
                            </svg>

                            <div style={{ position: 'relative', textAlign: 'center' }}>
                                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', lineHeight: 1.3 }}>
                                    Pininfarina Design
                                </p>
                                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(143,168,200,0.8)' }}>
                                    Fort Lauderdale · Est. 2025
                                </p>
                            </div>
                            <div className={styles.aboutImageAccent} aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </section>

            <WaveUp fromColor="#F5F3EF" toColor="#1a1a2e" />

            {/* ── LEAD FORM ──────────────────────────────────────────── */}
            <section className={styles.formSection} id="contact" aria-label="Register your interest" ref={formRef}>
                <div className={styles.formBg} aria-hidden="true" />
                <div className={styles.formInner}>
                    <div className={styles.formHeader}>
                        <span className={styles.formEyebrow}>Register Your Interest</span>
                        <h2 className={styles.formTitle}>
                            Interested in Owning<br />a Residence? Register Below.
                        </h2>
                    </div>
                    <div className={styles.formCard}>
                        <LeadForm />
                    </div>
                </div>
            </section>

            <WaveDown fromColor="#1a1a2e" toColor="#10101f" />

            {/* ── FOOTER ─────────────────────────────────────────────── */}
            <footer className={styles.footer} aria-label="Site footer">
                <div className={styles.footerInner}>
                    <div className={styles.footerTop}>
                        {/* Brand */}
                        <div>
                            <span className={styles.footerLogoMain}>Andare</span>
                            <span className={styles.footerLogoSub}>Residences · Las Olas</span>
                            <p className={styles.footerTagline}>
                                Fort Lauderdale&apos;s most anticipated luxury address.
                                163 residences. Pininfarina design. An icon rising above Las Olas.
                            </p>
                        </div>

                        {/* Address */}
                        <div>
                            <span className={styles.footerColumnTitle}>Sales Gallery</span>
                            <address className={styles.footerAddress}>
                                788 E Las Olas Blvd<br />
                                Fort Lauderdale, FL 33301<br />
                                <br />
                                By Appointment
                            </address>
                        </div>

                        {/* Contact */}
                        <div>
                            <span className={styles.footerColumnTitle}>Contact</span>
                            <div className={styles.footerContact}>
                                <a href="tel:+19547999857" id="footer-phone" aria-label="Call 954-799-9857">
                                    (954) 799-9857
                                </a>
                                <a href="mailto:info@andareresidences.com" id="footer-email" aria-label="Email Andare Residences">
                                    info@andareresidences.com
                                </a>
                                <a href="#stream" id="footer-watch-live" aria-label="Watch live construction stream">
                                    Watch Live Stream ↑
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footerBottom}>
                        <p className={styles.footerDisclaimer}>
                            This page is operated by an independent referral partner. All sales are subject to availability.
                            Pricing, floor plans, and availability are subject to change without notice.
                            Renderings are artist&apos;s impressions and are not intended to be an accurate depiction of the final product.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
