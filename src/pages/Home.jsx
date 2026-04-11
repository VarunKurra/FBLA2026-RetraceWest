import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin, Shield, CheckCircle, AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Import the user's specific image
import heroBgImage from '../assets/Lost-and-Found-Folwell-Elementary.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeStagger = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const Home = () => {
  const { state } = useApp();

  return (
    <div className="home-modern-auth">
      
      {/* ── SPLIT SHADCN HERO ── */}
      <section className="split-hero">
        <div className="container">
          <motion.div className="sh-grid" initial="hidden" animate="visible" variants={fadeStagger}>
            
            {/* Left Content */}
            <div className="sh-text">
               <motion.div variants={fadeUp} className="hero-badge">OFFICIAL PARKWAY WEST APP</motion.div>
               <motion.h1 variants={fadeUp} className="hero-h1">
                 Lost it at<br/>
                 <span className="highlight-red">West High?</span><br/>
                 Find it here.
               </motion.h1>
               <motion.p variants={fadeUp} className="hero-lead">
                 The cardboard box is gone. RetraceWest is the official, real-time digital lost & found designed for the massive Parkway West High School campus.
               </motion.p>
               
               <motion.div variants={fadeUp} className="hero-actions">
                 {state.user ? (
                   <>
                     <Link to="/registry" className="btn-modern btn-primary">Live Registry <ArrowRight size={18} /></Link>
                     <Link to="/report" className="btn-modern btn-outline">Report Item</Link>
                   </>
                 ) : (
                   <>
                     <Link to="/auth" className="btn-modern btn-primary">Sign in with Parkway <ArrowRight size={18} /></Link>
                     <Link to="/about" className="btn-modern btn-outline">Learn More</Link>
                   </>
                 )}
               </motion.div>
            </div>

            {/* Right Image (Shadcn Wrapped) */}
            <motion.div variants={fadeUp} className="sh-image-wrapper">
               <div className="sh-image-card">
                  <div className="sh-browser-bar">
                    <span className="sh-dot red"></span>
                    <span className="sh-dot yellow"></span>
                    <span className="sh-dot green"></span>
                  </div>
                  <img src={heroBgImage} alt="Lost and Found Box" className="sh-img" />
               </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="ql-section">
        <div className="container">
          <motion.div 
             className="ql-grid"
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeStagger}
          >
            <motion.div variants={fadeUp}>
              <Link to="/registry" className="ql-card">
                <div className="ql-icon blue"><Search size={24}/></div>
                <h3>Live Feed</h3>
                <p>Scroll the active campus registry.</p>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/report" className="ql-card">
                <div className="ql-icon red"><MapPin size={24}/></div>
                <h3>Drop a Pin</h3>
                <p>Log exact GPS coordinates on campus.</p>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/about" className="ql-card">
                <div className="ql-icon dark"><Shield size={24}/></div>
                <h3>Verified Secure</h3>
                <p>Only strictly via Parkway emails.</p>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
               <Link to="/leaderboard" className="ql-card">
                  <div className="ql-icon green"><CheckCircle size={24}/></div>
                  <h3>Good Samaritan</h3>
                  <p>Earn credit for returning items.</p>
               </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── MASSIVE CONTENT (Authentic Length) ── */}
      <section className="section-pad" style={{ background: 'var(--white)' }}>
        <div className="container">
          <motion.div 
             className="content-dual-grid"
             initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeStagger}
          >
            
            {/* LEFT COLUMN: GUIDELINES & INSTITUTIONAL TEXT */}
            <motion.div variants={fadeUp} className="cdg-left">
              <h2 className="title-shadcn border-accent-blue">How the System Works</h2>
              <div className="glass-panel text-content">
                <p>
                  With thousands of active students and multiple massive facilities, Parkway West's traditional cardboard-box system was proving highly inefficient. Items were mixed up, stolen, or never found. 
                </p>
                <div className="feature-rows mt-24">
                   <div className="f-row">
                      <div className="fr-icon"><Shield size={20}/></div>
                      <div className="fr-text">
                         <h4>Secure `@parkwayschools.net` Authentication</h4>
                         <p>Only verified students can search and claim, preventing external interference.</p>
                      </div>
                   </div>
                   <div className="f-row">
                      <div className="fr-icon"><MapPin size={20}/></div>
                      <div className="fr-text">
                         <h4>Interactive Campus Mapping</h4>
                         <p>Uses our spatial mapping integrations to drop exact 3D pinpoint locations.</p>
                      </div>
                   </div>
                   <div className="f-row">
                      <div className="fr-icon"><CheckCircle size={20}/></div>
                      <div className="fr-text">
                         <h4>Main Office Verification</h4>
                         <p>Valuables are secured at the front desk and handed over only upon digital claim approval.</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="blue-promo-block shadow-hover">
                <h3 style={{ color: 'white', marginBottom: '12px' }}>The Good Samaritan Initiative</h3>
                <p style={{ color: 'var(--navy-light)', marginBottom: '24px' }}>
                  A core institutional directive. Earn points by logging and handing in lost properties. Top students are placed on the leaderboard and receive special recognition.
                </p>
                <Link to="/leaderboard" className="btn-modern btn-outline" style={{ background: 'white', color: 'var(--navy)', border: 'none' }}>View Rankings</Link>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: SIDEBAR DATA */}
            <motion.aside variants={fadeUp} className="cdg-right">
              
              {/* ALERTS WIDGET */}
              <div className="sidebar-glass-widget shadow-hover">
                 <div className="sgw-header"><BellIcon /> Campus Alerts</div>
                 <div className="sgw-body">
                    <ul className="alert-list-modern">
                       <li><AlertTriangle size={16} color="var(--red)"/> Multiple Student IDs recovered near C-Hall.</li>
                       <li><BookOpen size={16} color="var(--blue)"/> Library lost & found has been fully digitized.</li>
                    </ul>
                 </div>
              </div>

              {/* LIVE FEED WIDGET */}
              <div className="sidebar-glass-widget shadow-hover mt-32">
                 <div className="sgw-header"><ClockIcon /> Recent Live Activity</div>
                 <div className="sgw-body stretch">
                    
                    <div className="feed-item-modern outline">
                       <div className="fi-top">
                          <span className="badge-found">FOUND</span>
                          <span className="fi-time">10 mins ago</span>
                       </div>
                       <h4>AirPods Pro (Left)</h4>
                       <span className="fi-loc"><MapPin size={14}/> Main Library</span>
                    </div>

                    <div className="feed-item-modern">
                       <div className="fi-top">
                          <span className="badge-lost">LOST</span>
                          <span className="fi-time">1 hr ago</span>
                       </div>
                       <h4>TI-84 Graphing Calculator</h4>
                       <span className="fi-loc"><MapPin size={14}/> Room 311</span>
                    </div>

                    <div className="feed-item-modern outline">
                       <div className="fi-top">
                          <span className="badge-returned">RETURNED</span>
                          <span className="fi-time">3 hrs ago</span>
                       </div>
                       <h4>Black Hydroflask</h4>
                       <span className="fi-loc"><CheckCircle size={14}/> Verified by Admin</span>
                    </div>

                 </div>
                 <Link to="/registry" className="sgw-footer">Explore Registry &rarr;</Link>
              </div>

            </motion.aside>

          </motion.div>
        </div>
      </section>

      {/* ── HEAVY FOOTER CTA (Authentic School Style) ── */}
      <section className="footer-cta bg-navy">
        <motion.div 
           className="container focus-container"
           initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        >
          <h2>Longhorn Pride in Action</h2>
          <p>RetraceWest relies on the honesty and integrity of our student body. Sign in today to become part of the solution.</p>
          <Link to={state.user ? '/registry' : '/auth'} className="btn-modern btn-outline" style={{ background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: '1.15rem', padding: '16px 36px' }}>
            {state.user ? 'Enter Dashboard' : 'Sign in via @parkwayschools.net'}
          </Link>
        </motion.div>
      </section>

      <style>{`
        .home-modern-auth {
           min-height: 100vh;
           background: var(--off-white);
           padding-top: var(--nav-h); /* Compensate for massive 100px tall navbar */
        }

        /* ── SPLIT SHADCN HERO ── */
        .split-hero {
           padding: 100px 0 120px;
           background: var(--off-white);
           overflow: hidden;
        }
        .sh-grid {
           display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
        }
        .sh-text { max-width: 600px; }
        
        .hero-badge {
           display: inline-block; padding: 6px 14px; background: rgba(0, 72, 130, 0.1); color: var(--navy);
           border-radius: 20px; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.15em; margin-bottom: 24px;
        }
        .hero-h1 {
           font-size: clamp(3rem, 5vw, 4.2rem); font-family: var(--font-heading); font-weight: 900;
           line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 24px; color: var(--navy);
        }
        .highlight-red { display: inline-block; color: var(--red); margin: 4px 0; }
        .hero-lead {
           font-size: 1.25rem; color: var(--gray-600); line-height: 1.6; margin-bottom: 40px;
        }
        
        .hero-actions { display: flex; gap: 16px; }
        
        /* Shadcn Right Image Box */
        .sh-image-wrapper { position: relative; }
        .sh-image-wrapper::before {
           content: ''; position: absolute; inset: -20px; background: linear-gradient(135deg, var(--blue-light) 0%, transparent 100%);
           border-radius: var(--r-2xl); z-index: 0; transform: rotate(-3deg); opacity: 0.6;
        }
        .sh-image-card {
           position: relative; z-index: 1;
           background: white; border: 1px solid var(--gray-200); border-radius: var(--r-xl);
           box-shadow: var(--shadow-xl); overflow: hidden;
        }
        .sh-browser-bar { 
           height: 40px; background: var(--gray-100); border-bottom: 1px solid var(--gray-200);
           display: flex; align-items: center; padding: 0 16px; gap: 8px;
        }
        .sh-dot { width: 12px; height: 12px; border-radius: 50%; }
        .sh-dot.red { background: #ff5f56; } .sh-dot.yellow { background: #ffbd2e; } .sh-dot.green { background: #27c93f; }
        .sh-img { width: 100%; height: auto; display: block; }

        @media (max-width: 960px) {
           .sh-grid { grid-template-columns: 1fr; text-align: center; }
           .sh-text { margin: 0 auto; max-width: 100%; }
           .hero-actions { justify-content: center; flex-wrap: wrap; gap: 10px; }
           .hero-h1 { font-size: clamp(2.2rem, 8vw, 3rem); }
           .btn-modern { padding: 12px 20px; font-size: 0.95rem; }
           .hero-lead { font-size: 1.1rem; padding: 0 10px; }
        }
        
        /* ── BUTTONS ── */
        .btn-modern {
           display: inline-flex; align-items: center; justify-content: center; gap: 10px;
           padding: 16px 32px; font-size: 1.1rem; font-weight: 700; border-radius: var(--r-md);
           transition: all 0.2s; text-decoration: none;
        }
        .btn-primary { background: var(--navy); color: white; box-shadow: 0 4px 12px rgba(0, 72, 130, 0.25); }
        .btn-primary:hover { background: var(--blue); transform: translateY(-2px); }
        .btn-outline { background: white; border: 2px solid var(--gray-300); color: var(--navy); }
        .btn-outline:hover { background: var(--gray-50); border-color: var(--gray-400); }

        /* ── QUICK LINKS ── */
        .ql-section { margin-top: -60px; position: relative; z-index: 10; padding-bottom: 80px; }
        .ql-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .ql-card {
           display: flex; flex-direction: column; background: white;
           border: 1px solid var(--gray-200); border-radius: var(--r-xl); padding: 32px 24px;
           text-decoration: none; color: var(--navy); box-shadow: var(--shadow-sm);
           transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s;
        }
        .ql-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); border-color: var(--gray-300); }
        .ql-icon {
           width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
        }
        .ql-icon.blue { background: var(--blue-light); color: var(--blue); } .ql-icon.red { background: var(--red-light); color: var(--red); }
        .ql-icon.dark { background: var(--navy-light); color: var(--navy); } .ql-icon.green { background: #dcfce7; color: #16a34a; }
        .ql-card h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; }
        .ql-card p { font-size: 0.95rem; color: var(--gray-600); margin: 0; line-height: 1.6; }

        @media (max-width: 960px) { .ql-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .ql-grid { grid-template-columns: 1fr; } .ql-section { margin-top: -40px; } }

        /* ── DUAL CONTENT (Long Layout) ── */
        .content-dual-grid { display: grid; grid-template-columns: 1.2fr 340px; gap: 60px; padding-bottom: 40px; }
        .title-shadcn { font-size: 2.2rem; font-weight: 800; color: var(--navy); margin-bottom: 24px; letter-spacing: -0.02em; }
        .border-accent-blue { border-bottom: 5px solid var(--navy); padding-bottom: 12px; display: inline-block; }
        
        .glass-panel { background: white; border-radius: var(--r-xl); padding: 40px; border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); margin-bottom: 40px; }
        .text-content p { font-size: 1.15rem; color: var(--gray-600); line-height: 1.8; margin-bottom: 24px; }
        
        .mt-24 { margin-top: 24px; }
        .mt-32 { margin-top: 32px; }
        .shadow-hover { transition: transform 0.2s, box-shadow 0.2s; }
        
        .feature-rows { display: flex; flex-direction: column; gap: 24px; }
        .f-row { display: flex; gap: 20px; align-items: flex-start; }
        .fr-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--off-white); color: var(--navy); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fr-text h4 { font-size: 1.15rem; font-weight: 800; color: var(--navy); margin-bottom: 6px; }
        .fr-text p { font-size: 1.05rem; color: var(--gray-600); line-height: 1.5; margin: 0; }
        
        .blue-promo-block {
           background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
           padding: 40px; border-radius: var(--r-xl); color: white;
           box-shadow: var(--shadow-md);
        }
        .blue-promo-block:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

        /* Sidebar Widgets */
        .sidebar-glass-widget {
           background: white; border: 1px solid var(--gray-200); border-radius: var(--r-lg);
           overflow: hidden; box-shadow: var(--shadow-sm);
        }
        .sidebar-glass-widget:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .sgw-header {
           background: var(--navy); padding: 16px 20px; font-weight: 800; font-size: 1.1rem;
           color: white; border-bottom: 1px solid var(--navy-mid); display: flex; align-items: center; gap: 10px;
        }
        .sgw-body { padding: 20px; }
        .sgw-body.stretch { padding: 0; }
        
        .alert-list-modern { list-style: none; padding: 0; margin: 0; }
        .alert-list-modern li { display: flex; gap: 12px; align-items: flex-start; font-size: 1rem; color: var(--gray-700); margin-bottom: 16px; line-height: 1.5; }
        .alert-list-modern li:last-child { margin-bottom: 0; }
        
        .feed-item-modern { padding: 20px; border-bottom: 1px solid var(--gray-100); }
        .feed-item-modern.outline { background: var(--gray-50); }
        .fi-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .fi-time { font-size: 0.85rem; color: var(--gray-500); font-weight: 700; }
        .feed-item-modern h4 { font-size: 1.1rem; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
        .fi-loc { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: var(--gray-500); font-weight: 600; }
        
        .badge-found { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }
        .badge-lost { background: var(--red-light); color: var(--red-dark); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }
        .badge-returned { background: var(--blue-light); color: var(--blue); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; }
        
        .sgw-footer {
           display: block; padding: 16px; text-align: center; background: var(--off-white);
           color: var(--blue); font-weight: 800; text-decoration: none; border-top: 1px solid var(--gray-200);
           transition: background 0.2s;
        }
        .sgw-footer:hover { background: var(--gray-200); }

        /* ── FOOTER CTA ── */
        .bg-navy { background: var(--navy); color: white; padding: 100px 0; }
        .focus-container { text-align: center; max-width: 680px; margin: 0 auto; }
        .focus-container h2 { font-size: 2.8rem; margin-bottom: 24px; font-weight: 900; }
        .focus-container p { font-size: 1.3rem; color: var(--navy-light); line-height: 1.6; margin-bottom: 32px; }

        @media (max-width: 960px) {
           .content-dual-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

/* Local Icons */
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

export default Home;
