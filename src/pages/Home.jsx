import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Search, ShieldCheck, Heart, Map as MapIcon, ChevronRight, Globe, Layers, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Home = () => {
    const { state } = useApp();
    const navigate = useNavigate();

    // Redirect if already logged in (useLayoutEffect for faster trigger)
    React.useLayoutEffect(() => {
        if (state.user) navigate('/dashboard');
    }, [state.user, navigate]);

    return (
        <div className="home-v5">

            {/* Hero Section - Clean & Inviting */}
            <section className="hero-v5">
                <div className="v5-pattern" />
                <div className="container v5-hero-inner">
                    <div className="v5-hero-text">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="badge-v5">
                                <span className="live-tag">NEW</span>
                                <span>Advanced Campus Recovery Network</span>
                            </div>

                            <h1 className="v5-title">
                                Reclaim what <br />
                                <span>matters most.</span>
                            </h1>

                            <p className="v5-desc">
                                The high-precision recovery network for Missouri's academic community. Protect your valuables and help fellow students with school-verified security.
                            </p>

                            <div className="v5-cta">
                                <Link to="/auth" className="btn-primary-v5">
                                    Join Your Campus <ChevronRight size={20} />
                                </Link>
                                <Link to="/registry" className="btn-secondary-v5">
                                    View Live Listings
                                </Link>
                            </div>
                        </motion.div>
                    </div>


                    <div className="v5-hero-media">
                        <motion.div
                            className="app-preview-v5 glass"
                            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                            animate={{ opacity: 1, scale: 1, rotate: 3 }}
                            transition={{ duration: 1, delay: 0.2 }}
                        >
                            <div className="p-header">
                                <div className="p-dots"><span></span><span></span><span></span></div>
                                <div className="p-url">retrace-mo-portal.edu</div>
                            </div>
                            <div className="p-content">
                                <div className="p-campus-card">
                                    <MapIcon size={24} color="white" />
                                    <div className="txt">
                                        <strong>Active Campus Monitor</strong>
                                        <span>24 active reports at your school</span>
                                    </div>
                                </div>
                                <div className="p-list">
                                    <div className="p-item"><span></span> Lost Airpods (Library)</div>
                                    <div className="p-item"><span></span> HydroFlask (Cafeteria)</div>
                                    <div className="p-item"><span></span> Student ID (Main Office)</div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="v5-floating-badge"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <div className="ico"><ShieldCheck size={20} /></div>
                            <span>Verified Network</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust & Community Section */}
            <section className="v5-trust container">
                <motion.div
                    className="trust-card glass"
                    initial={{ y: 40, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="stats">
                        <div className="s-block">
                            <strong>500+</strong>
                            <span>Verified Schools</span>
                        </div>
                        <div className="s-block">
                            <strong>4.2k</strong>
                            <span>Items Recovered</span>
                        </div>
                        <div className="s-block">
                            <strong>99.9%</strong>
                            <span>Precision Rate</span>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features - Student Centric */}
            <section className="v5-features container">
                <div className="v5-sec-head">
                    <div className="mini-badge">FEATURES</div>
                    <h2>Engineered for Integrity</h2>
                    <p>We've combined geospatial precision with institutional security to create the safest campus network in Missouri.</p>
                </div>

                <div className="v5-feat-grid">
                    <motion.div
                        className="v5-feat-box glass"
                        whileHover={{ y: -10 }}
                    >
                        <div className="icon b1"><GraduationCap size={32} /></div>
                        <h3>Verified Academic IDs</h3>
                        <p>Access is exclusive to verified students and faculty, ensuring all interactions are accountable and safe.</p>
                    </motion.div>
                    <motion.div
                        className="v5-feat-box glass"
                        whileHover={{ y: -10 }}
                    >
                        <div className="icon b2"><MapPin size={32} /></div>
                        <h3>Smart Campus Mapping</h3>
                        <p>Our proprietary spatial boundaries automatically filter reports to your specific campus area.</p>
                    </motion.div>
                    <motion.div
                        className="v5-feat-box glass"
                        whileHover={{ y: -10 }}
                    >
                        <div className="icon b3"><Heart size={32} /></div>
                        <h3>Community Rewards</h3>
                        <p>Built-in integrity system that rewards students for returning valuables to their rightful owners.</p>
                    </motion.div>
                </div>
            </section>

            <section className="v5-cta-final container">
                <motion.div
                    className="cta-card-v5 glass"
                    whileHover={{ scale: 1.01 }}
                >
                    <h2>Ready to secure your campus?</h2>
                    <p>Join thousands of Missouri students today and never lose track of what matters most.</p>
                    <Link to="/auth" className="btn-primary-v5">Create Your Profile <ArrowRight size={20} /></Link>
                </motion.div>
            </section>

            <footer className="v5-footer container">
                <div className="f-inner">
                    <div className="f-left">
                        <div className="logo">Retrace<span>MO</span></div>
                        <p>The Missouri Student Recovery Network.</p>
                    </div>
                    <div className="f-right">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Contact Support</a>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        .home-v5 { background: #FFFFFF; color: var(--text-main); overflow-x: hidden; }
        
        .hero-v5 { padding: 180px 0 120px; position: relative; display: flex; align-items: center; background: #F8FAFC; border-bottom: 1px solid #F1F5F9; }
        .v5-pattern { position: absolute; inset: 0; background-image: radial-gradient(#E2E8F0 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5; }

        .v5-hero-inner { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; position: relative; z-index: 10; }
        
        .badge-v5 { 
          display: inline-flex; align-items: center; gap: 10px; background: white; padding: 6px 16px; border-radius: 40px;
          font-family: var(--font-mono); font-size: 11px; font-weight: 600; color: var(--color-primary);
          box-shadow: var(--shadow-sm); margin-bottom: 2rem; border: 1px solid #E2E8F0;
        }
        .live-tag { background: var(--color-primary); color: white; padding: 2px 8px; border-radius: 4px; font-size: 9px; }

        .v5-title { font-size: 4.5rem; line-height: 1.1; margin-bottom: 2rem; color: var(--color-dark); letter-spacing: -0.04em; }
        .v5-title span { color: var(--color-primary); }

        .v5-desc { font-size: 1.25rem; color: var(--text-dim); line-height: 1.7; max-width: 560px; margin-bottom: 3rem; }

        .v5-cta { display: flex; gap: 1.5rem; align-items: center; }
        .btn-primary-v5 { 
          background: var(--gradient-main); color: white; padding: 1.2rem 2.5rem; border-radius: var(--radius-lg);
          font-family: var(--font-heading); font-weight: 700; text-decoration: none;
          display: flex; align-items: center; gap: 0.75rem; transition: all 0.3s;
          box-shadow: var(--shadow-primary);
        }
        .btn-primary-v5:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.4); }

        .btn-secondary-v5 { color: var(--text-dim); font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .btn-secondary-v5:hover { color: var(--color-dark); }

        .v5-hero-media { position: relative; display: flex; justify-content: center; }
        .app-preview-v5 { width: 380px; height: 320px; border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-xl); transform: rotate(3deg); }
        .p-header { background: #1E293B; padding: 12px; display: flex; align-items: center; gap: 15px; }
        .p-dots { display: flex; gap: 6px; }
        .p-dots span { width: 8px; height: 8px; background: rgba(255,255,255,0.2); border-radius: 50%; }
        .p-url { color: rgba(255,255,255,0.4); font-size: 10px; font-family: var(--font-mono); }
        .p-content { padding: 25px; background: white; height: 100%; }
        .p-campus-card { background: var(--color-primary); color: white; padding: 15px; border-radius: 12px; display: flex; gap: 15px; align-items: center; margin-bottom: 20px; }
        .p-campus-card .txt { display: flex; flex-direction: column; }
        .p-campus-card .txt strong { font-size: 0.9rem; }
        .p-campus-card .txt span { font-size: 0.75rem; opacity: 0.8; }
        .p-list { display: flex; flex-direction: column; gap: 12px; }
        .p-item { font-size: 0.85rem; color: var(--color-dark); display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .p-item span { width: 6px; height: 6px; background: var(--color-primary); border-radius: 50%; }

        .v5-floating-badge { 
          position: absolute; bottom: 20px; right: 40px; background: white; padding: 15px 25px; 
          border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-xl);
          transform: rotate(-5deg); z-index: 20;
        }
        .v5-floating-badge .ico { color: var(--color-secondary); }
        .v5-floating-badge span { font-weight: 700; font-size: 0.9rem; color: var(--color-dark); }

        .v5-trust { margin-top: -60px; position: relative; z-index: 30; }
        .trust-card { padding: 40px; border-radius: 30px; background: white; }
        .stats { display: flex; justify-content: space-around; text-align: center; }
        .s-block strong { display: block; font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.25rem; }
        .s-block span { color: var(--text-dim); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; font-weight: 700; }

        .v5-features { padding: 120px 0; }
        .v5-sec-head { text-align: center; margin-bottom: 6rem; }
        .v5-sec-head h2 { font-size: 3rem; margin-bottom: 1.5rem; }
        .v5-sec-head p { font-size: 1.2rem; color: var(--text-dim); max-width: 700px; margin: 0 auto; }

        .v5-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .v5-feat-box { padding: 3rem; border-radius: var(--radius-xl); transition: all 0.3s; background: #F8FAFC; border: none; }
        .v5-feat-box:hover { transform: translateY(-10px); background: white; box-shadow: var(--shadow-xl); }
        .v5-feat-box .icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: white; }
        .icon.b1 { background: linear-gradient(135deg, #6366F1, #818CF8); }
        .icon.b2 { background: linear-gradient(135deg, #2563EB, #60A5FA); }
        .icon.b3 { background: linear-gradient(135deg, #10B981, #34D399); }
        .v5-feat-box h3 { font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-dark); }
        .v5-feat-box p { color: var(--text-dim); line-height: 1.6; }

        .v5-cta-final { padding: 100px 0; }
        .cta-card-v5 { 
          background: var(--color-dark); border-radius: 40px; padding: 80px 40px; text-align: center; color: white;
          background-image: radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.3) 0%, transparent 50%);
          box-shadow: var(--shadow-xl);
        }

        .cta-card-v5 h2 { font-size: 3.5rem; margin-bottom: 1.5rem; }
        .cta-card-v5 p { font-size: 1.25rem; opacity: 0.8; margin-bottom: 3.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }

        .v5-footer { padding: 80px 0; border-top: 1px solid #F1F5F9; }
        .f-inner { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: 800; color: var(--color-dark); }
        .logo span { color: var(--color-primary); }
        .f-left p { color: var(--text-dim); font-size: 0.9rem; margin-top: 0.5rem; }
        .f-right { display: flex; gap: 2rem; }
        .f-right a { text-decoration: none; color: var(--text-dim); font-size: 0.95rem; font-weight: 500; }
        .f-right a:hover { color: var(--color-primary); }

        @media (max-width: 1024px) {
           .v5-hero-inner { grid-template-columns: 1fr; text-align: center; }
           .v5-title { font-size: 3rem; }
           .v5-desc { margin: 0 auto 3rem; }
           .v5-cta { justify-content: center; }
           .v5-hero-media { display: none; }
           .v5-feat-grid { grid-template-columns: 1fr 1fr; }
           .stats { flex-direction: row; gap: 20px; }
           .cta-card-v5 h2 { font-size: 2.5rem; }
        }

        @media (max-width: 768px) {
           .hero-v5 { padding: 120px 0 80px; }
           .v5-title { font-size: 2.4rem; }
           .v5-desc { font-size: 1.05rem; }
           .v5-cta { flex-direction: column; gap: 1rem; }
           .btn-primary-v5 { width: 100%; justify-content: center; padding: 1rem 2rem; }
           .v5-feat-grid { grid-template-columns: 1fr; gap: 20px; }
           .v5-feat-box { padding: 2rem; }
           .v5-features { padding: 60px 0; }
           .v5-sec-head h2 { font-size: 2rem; }
           .v5-sec-head p { font-size: 1rem; }
           .v5-sec-head { margin-bottom: 3rem; }
           .stats { flex-direction: column; gap: 24px; }
           .trust-card { padding: 30px; border-radius: 20px; }
           .s-block strong { font-size: 2rem; }
           .cta-card-v5 { padding: 50px 24px; border-radius: 24px; }
           .cta-card-v5 h2 { font-size: 2rem; }
           .cta-card-v5 p { font-size: 1rem; margin-bottom: 2rem; }
           .v5-cta-final { padding: 60px 0; }
           .f-inner { flex-direction: column; gap: 1.5rem; text-align: center; }
           .f-right { justify-content: center; }
           .v5-footer { padding: 40px 0; }
        }

        @media (max-width: 480px) {
           .hero-v5 { padding: 100px 0 60px; }
           .v5-title { font-size: 2rem; }
           .badge-v5 { font-size: 9px; padding: 4px 10px; margin-bottom: 1.2rem; }
           .v5-feat-box { padding: 1.5rem; border-radius: 20px; }
           .v5-feat-box h3 { font-size: 1.2rem; }
           .v5-feat-box .icon { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 1rem; }
           .cta-card-v5 h2 { font-size: 1.6rem; }
           .trust-card { padding: 24px; }
        }
      `}</style>
        </div>
    );
};

export default Home;
