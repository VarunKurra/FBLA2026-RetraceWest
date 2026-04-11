import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, ShieldCheck, Github, Linkedin, Mail } from 'lucide-react';
import varunImg from '../assets/VarunKurra.png';
import aviralImg from '../assets/AviralPandey.png';
import sreehanImg from '../assets/SreehanMandapati.png';

const FOUNDERS = [
  {
    name: 'Varun Kurra',
    grade: 'Class of 2026',
    role: 'Lead Full-Stack Developer',
    imgUrl: varunImg,
    bio: 'Architected the unified database, mapped the campus using GIS tools, and built secure authentication pipelines.'
  },
  {
    name: 'Aviral Pandey',
    grade: 'Class of 2026',
    role: 'Product Strategy & UI/UX',
    imgUrl: aviralImg,
    bio: 'Defined user interaction cycles, designed the administrative dashboards, and researched student adoption strategies.'
  },
  {
    name: 'Sreehan Mandapati',
    grade: 'Class of 2026',
    role: 'Data Analysis & Research',
    imgUrl: sreehanImg,
    bio: 'Tracked loss zones across facilities and developed the foundational Good Samaritan incentivization system.'
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

const About = () => {
  return (
    <div className="about-modern">

      {/* ── HEADER ── */}
      <section className="about-header section-pad-sm">
        <motion.div className="container" initial="hidden" animate="visible" variants={fadeStagger}>
          <motion.div variants={fadeUp} className="badge-modern">ABOUT RETRACEWEST</motion.div>
          <motion.h1 variants={fadeUp} className="heading-modern">
            Built by Parkway West.<br />
            <span className="text-gradient">For Parkway West.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="subheading-modern">
            An official FBLA 2026 Mobile Application designed to eradicate property loss on high school campuses using real-time spatial mapping.
          </motion.p>
        </motion.div>
      </section>

      {/* ── THE TEAM ── */}
      <section className="team-section section-pad-sm" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeStagger}
            className="text-center mb-12"
          >
             <motion.h2 variants={fadeUp} className="section-title">
               The Development Team
             </motion.h2>
             <motion.p variants={fadeUp} className="subheading-modern" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
               Meet the engineers and designers behind RetraceWest.
             </motion.p>
          </motion.div>

          <motion.div 
            className="team-grid"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeStagger}
          >
            {FOUNDERS.map((f, i) => (
              <motion.div key={i} variants={scaleUp} className="team-card hover-lift">
                {/* Top Half: Professional Headshot */}
                <div className="tc-img-wrap">
                  <motion.img 
                    src={f.imgUrl} 
                    alt={f.name} 
                    className="tc-img"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="tc-overlay">
                    <motion.div className="social-links" initial={{ opacity: 0, y: 10 }} whileHover={{ opacity: 1, y: 0 }}>
                      <a href="#" className="social-icon"><Github size={18} /></a>
                      <a href="#" className="social-icon"><Linkedin size={18} /></a>
                      <a href="#" className="social-icon"><Mail size={18} /></a>
                    </motion.div>
                  </div>
                </div>
                
                {/* Bottom Half: Info */}
                <div className="tc-info">
                  <h3>{f.name}</h3>
                  <div className="tc-role">{f.role}</div>
                  <div className="tc-grade">{f.grade}</div>
                  <p className="tc-bio">{f.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CORE OBJECTIVES ── */}
      <section className="mission-section section-pad">
         <div className="container">
            <motion.div className="mission-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeStagger}>
               
               <motion.div variants={fadeUp} className="mission-text">
                  <h2 className="section-title">The FBLA Mission</h2>
                  <p className="modern-p">
                    With over 2,000 active students and 50+ learning facilities, Parkway West's traditional cardboard-box system resulted in less than 40% of items being returned.
                  </p>
                  <p className="modern-p">
                    RetraceWest digitizes the entire process. No more searching classroom to classroom. Check the app, claim your item, and get back to learning.
                  </p>
               </motion.div>

               <div className="objectives-list">
                 <motion.div variants={fadeUp} whileHover={{ x: 10 }} className="obj-card">
                   <div className="obj-icon red"><Target size={24}/></div>
                   <div>
                     <h4>Centralized Logging</h4>
                     <p>Eradicate physical searching with a live, searchable digital feed updated instantly.</p>
                   </div>
                 </motion.div>
                 
                 <motion.div variants={fadeUp} whileHover={{ x: 10 }} className="obj-card">
                   <div className="obj-icon blue"><CheckCircle size={24}/></div>
                   <div>
                     <h4>Incentivization</h4>
                     <p>The Good Samaritan algorithm rewards students for community honesty through digital points.</p>
                   </div>
                 </motion.div>
                 
                 <motion.div variants={fadeUp} whileHover={{ x: 10 }} className="obj-card">
                   <div className="obj-icon dark"><ShieldCheck size={24}/></div>
                   <div>
                     <h4>Strict Security</h4>
                     <p>Hard-locked to official <code>@parkwayschools.net</code> addresses ensuring campus safety.</p>
                   </div>
                 </motion.div>
               </div>

            </motion.div>
         </div>
      </section>

      <style>{`
        .about-modern {
           min-height: 100vh;
           background: var(--white);
           padding-top: var(--nav-h);
        }
        
        .section-title { font-size: 2.5rem; font-weight: 800; color: var(--navy); margin-bottom: 24px; letter-spacing: -0.02em; }
        .text-center { text-align: center; }
        .mb-12 { margin-bottom: 3rem; }
        .modern-p { font-size: 1.15rem; color: var(--gray-600); line-height: 1.7; margin-bottom: 20px; }
        
        /* ── HEADER ── */
        .about-header {
           text-align: center;
           padding-top: 100px; padding-bottom: 80px;
        }
        .badge-modern {
           display: inline-block; padding: 8px 16px; background: var(--gray-100); color: var(--gray-600);
           border-radius: 20px; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.15em; margin-bottom: 24px;
           text-transform: uppercase;
        }
        .heading-modern {
           font-size: clamp(3rem, 6vw, 4.5rem); font-family: var(--font-heading); font-weight: 900;
           line-height: 1.1; color: var(--navy); margin-bottom: 24px; letter-spacing: -0.03em;
        }
        .text-gradient {
           background: linear-gradient(135deg, var(--blue) 0%, #6366f1 100%);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
        }
        .subheading-modern {
           font-size: 1.25rem; color: var(--gray-500); max-width: 680px; margin: 0 auto; line-height: 1.6;
        }

        /* ── TEAM CARDS ── */
        .team-grid {
           display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
        }
        .team-card {
           background: white; border: 1px solid var(--gray-200); border-radius: 24px;
           overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column;
        }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-12px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
        
        .tc-img-wrap {
           width: 100%; aspect-ratio: 4/5;
           background-color: var(--gray-100);
           position: relative;
           overflow: hidden;
        }
        
        .tc-img {
           width: 100%; height: 100%;
           object-fit: cover;
           object-position: center top; 
           display: block;
        }

        .tc-overlay {
           position: absolute;
           inset: 0;
           background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
           opacity: 0;
           transition: opacity 0.3s ease;
           display: flex;
           align-items: flex-end;
           justify-content: center;
           padding-bottom: 24px;
        }
        
        .team-card:hover .tc-overlay {
           opacity: 1;
        }

        .social-links {
           display: flex; gap: 16px;
        }
        
        .social-icon {
           width: 40px; height: 40px; border-radius: 50%;
           background: white; color: var(--navy);
           display: flex; align-items: center; justify-content: center;
           transition: background 0.2s, color 0.2s, transform 0.2s;
        }
        
        .social-icon:hover {
           background: var(--blue); color: white; transform: scale(1.1);
        }
        
        .tc-info { padding: 32px; flex: 1; display: flex; flex-direction: column; }
        .tc-info h3 { font-size: 1.75rem; margin-bottom: 6px; color: var(--navy); font-weight: 800; letter-spacing: -0.01em; }
        .tc-role { color: var(--blue); font-weight: 700; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .tc-grade { font-size: 0.9rem; color: var(--gray-400); font-weight: 600; margin-bottom: 20px; }
        .tc-bio { font-size: 1.05rem; color: var(--gray-600); line-height: 1.6; }

        /* ── MISSION ── */
        .mission-grid {
           display: grid; grid-template-columns: 1.1fr 1fr; gap: 80px; align-items: center;
        }
        .objectives-list { display: flex; flex-direction: column; gap: 20px; }
        .obj-card {
           display: flex; gap: 24px; align-items: flex-start;
           background: white; border: 1px solid var(--gray-200); padding: 32px;
           border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
           transition: border-color 0.3s, box-shadow 0.3s;
           cursor: default;
        }
        .obj-card:hover {
           border-color: var(--blue-light); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .obj-icon {
           width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .obj-icon.red { background: #fee2e2; color: #ef4444; }
        .obj-icon.blue { background: #e0e7ff; color: #4f46e5; }
        .obj-icon.dark { background: #f3f4f6; color: #1f2937; }
        .obj-card h4 { font-size: 1.25rem; color: var(--navy); margin-bottom: 8px; font-weight: 700; }
        .obj-card p { font-size: 1.05rem; color: var(--gray-600); line-height: 1.6; margin: 0; }

        @media (max-width: 1024px) {
           .team-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
           .team-grid, .mission-grid { grid-template-columns: 1fr; }
           .mission-text { text-align: center; margin-bottom: 40px; }
        }
      `}</style>
    </div>
  );
};

export default About;
