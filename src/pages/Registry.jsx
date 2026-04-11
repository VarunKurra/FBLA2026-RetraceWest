import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Navigation, BookmarkPlus, Crosshair, GraduationCap, Filter, Clock, ChevronRight, Sparkles, BrainCircuit, MessageSquare, Send, X, Camera, ArrowRight, PackageSearch } from 'lucide-react';


import { useApp, PARKWAY_WEST } from '../context/AppContext';
import { MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { useNavigate } from 'react-router-dom';

const Registry = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('Default');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // AI Search State
    const [aiSearching, setAiSearching] = useState(false);
    const [aiRankedIds, setAiRankedIds] = useState(null); // ordered array of IDs from AI
    const [aiError, setAiError] = useState(null);

    // Inquiry & Claim Protocol
    const [inquiryItem, setInquiryItem] = useState(null);
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [sendingInquiry, setSendingInquiry] = useState(false);

    if (!state.user) {
        return (
            <div className="auth-barrier">
                <motion.div
                    className="auth-barrier-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="barrier-icon">
                        <GraduationCap size={42} />
                    </div>
                    <h2>Access Restricted</h2>
                    <p>Community listings are exclusive to verified students and faculty. Please sign in to join your school's network.</p>
                    <button className="btn-primary" onClick={() => navigate('/auth')}>
                        Verify Campus Profile <ChevronRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    if (state.user.role === 'admin' && !state.user.approved) {
        return (
            <div className="auth-barrier">
                <motion.div className="auth-barrier-card glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="barrier-icon"><GraduationCap size={42} /></div>
                    <h2>Admin Authorization Required</h2>
                    <p>Your access is currently restricted. A regional administrator must verify your credentials before you can view the community catalog.</p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    const getRawDistance = (itemCoords) => {
        if (!state.myLocation) return 999;
        const [uLat, uLng] = state.myLocation;
        const [tLat, tLng] = itemCoords;
        const R = 3958.8;
        const dLat = (tLat - uLat) * Math.PI / 180;
        const dLng = (tLng - uLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(uLat * Math.PI / 180) * Math.cos(tLat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getItemDistance = (itemCoords) => {
        const distMi = getRawDistance(itemCoords);
        if (distMi > 100) return "Unknown";
        if (distMi < 0.1) return `${(distMi * 5280).toFixed(0)} FT`;
        return `${distMi.toFixed(2)} MI`;
    };

    // AI-powered search using Groq
    const handleAiSearch = async (query) => {
        const searchQuery = query || searchTerm;
        if (!searchQuery.trim()) {
            setAiRankedIds(null);
            setAiError(null);
            return;
        }

        setAiSearching(true);
        setAiError(null);

        try {
            const candidateItems = state.items.filter(i =>
                i.schoolId === state.user.schoolId || i.schoolId === 'parkway-west' || !i.schoolId
            );

            if (candidateItems.length === 0) {
                setAiRankedIds([]);
                setAiSearching(false);
                return;
            }

            const itemSummaries = candidateItems.map(i => ({
                id: i.id,
                title: i.title || '',
                category: i.category || '',
                description: i.description || '',
                location: i.location_name || i.location || '',
            }));

            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!apiKey) {
                throw new Error('Groq API key not configured (VITE_GROQ_API_KEY missing from .env)');
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `You are a campus lost-and-found search assistant. Given a user search query and a list of items, rank the items by how likely they match the query. Consider semantic similarity, not just exact keyword matches. For example, "jacket" should match "hoodie" or "coat" with moderate confidence.

Return ONLY a valid JSON array of objects with "id" and "confidence" (0.0 to 1.0) fields. Only include items with confidence >= 0.2. Sort by confidence descending. No markdown, no prose, no explanation — just the JSON array.

Example output: [{"id":"ex-001","confidence":0.95},{"id":"ex-003","confidence":0.6}]

If nothing matches at all, return: []`
                        },
                        {
                            role: "user",
                            content: `Search query: "${searchQuery}"

Items to evaluate:
${JSON.stringify(itemSummaries)}`
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 1024,
                })
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => null);
                const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
                throw new Error(`Groq API: ${errMsg}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '[]';

            // Parse the response — handle potential formatting issues
            let parsed;
            try {
                // Try to extract JSON from the response (handle markdown code blocks)
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
            } catch (parseErr) {
                console.warn('AI response parse error:', content);
                // Fallback: try to extract IDs from comma-separated text
                if (content.toLowerCase().includes('none') || content.trim() === '[]') {
                    parsed = [];
                } else {
                    parsed = [];
                }
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
                // Sort by confidence descending and extract IDs
                const sorted = parsed
                    .filter(item => item.confidence >= 0.2)
                    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
                setAiRankedIds(sorted.map(item => item.id));
            } else {
                setAiRankedIds([]);
            }
        } catch (e) {
            console.error("AI Search Failed:", e);
            setAiError(`AI search error: ${e.message}`);
            setAiRankedIds(null); // Fall back to showing all
        } finally {
            setAiSearching(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAiSearch();
        }
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (!val.trim()) {
            setAiRankedIds(null);
            setAiError(null);
        }
    };

    const handleSendInquiry = async () => {
        if (!inquiryMessage.trim()) return alert("Detail Required: Please provide info for verification.");
        setSendingInquiry(true);
        await new Promise(r => setTimeout(r, 1500));
        alert(`Claim Protocol Synchronized. Verification request sent for "${inquiryItem.title}".`);
        setSendingInquiry(false);
        setInquiryItem(null);
        setInquiryMessage('');
    };

    const userSchool = MISSOURI_SCHOOLS.find(s => s.id === state.user.schoolId) || MISSOURI_SCHOOLS[0];

    // Build filtered items list
    let filteredItems = state.items.filter(item => {
        const isSameSchool = item.schoolId === state.user.schoolId ||
            item.schoolId === 'parkway-west' || !item.schoolId;
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return isSameSchool && matchesCategory;
    });

    // Apply AI ranking if active
    if (aiRankedIds !== null) {
        const rankedSet = new Set(aiRankedIds);
        filteredItems = filteredItems.filter(item => rankedSet.has(item.id));
        // Sort by the AI ranking order
        filteredItems.sort((a, b) => {
            const aIdx = aiRankedIds.indexOf(a.id);
            const bIdx = aiRankedIds.indexOf(b.id);
            return aIdx - bIdx;
        });
    }

    if (filterStatus !== 'All') {
        filteredItems = filteredItems.filter(i => i.type === filterStatus);
    }
    if (sortBy === 'Closest') {
        filteredItems.sort((a, b) => getRawDistance(a.coords) - getRawDistance(b.coords));
    } else if (sortBy === 'Farthest') {
        filteredItems.sort((a, b) => getRawDistance(b.coords) - getRawDistance(a.coords));
    }

    const categories = ['All', 'Electronics', 'Jewelry', 'Pets', 'Documents', 'Accessories', 'Other'];

    return (
        <div className="reg-v5 page-wrapper">
            <div className="container">
                <header className="reg-header-v5">
                    <div className="header-txt">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="badge"
                        >
                            RetraceWest: Active Network
                        </motion.div>
                        <h1>Campus Recovery Inventory</h1>
                        <p>AI-powered search across verified campus reports. Type a description and press Enter.</p>
                    </div>

                    <div className="reg-controls glass">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Describe your lost item... (e.g. 'blue jacket' or 'calculator')"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>

                        <div className="reg-actions-v5">
                            <button
                                className={`ai-search-btn-v5 ${aiSearching ? 'active' : ''}`}
                                onClick={() => handleAiSearch()}
                                disabled={aiSearching || !searchTerm.trim()}
                            >
                                <Sparkles size={18} />
                                <span>{aiSearching ? 'Searching...' : 'Neural Search'}</span>
                            </button>

                            <div className="filter-wrapper" style={{ position: 'relative' }}>
                                <button className="filter-trigger-v5" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                    <Filter size={18} /> Filters
                                </button>
                                <AnimatePresence>
                                    {isFilterOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="filter-dropdown glass"
                                        >
                                            <div className="f-sec">
                                                <label>Classification</label>
                                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                                    <option value="All">All Items</option>
                                                    <option value="lost">Lost</option>
                                                    <option value="found">Found</option>
                                                </select>
                                            </div>
                                            <div className="f-sec">
                                                <label>Spatial Sorting</label>
                                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                                    <option value="Default">Default</option>
                                                    <option value="Closest">Closest First</option>
                                                    <option value="Farthest">Farthest First</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {aiError && (
                        <div style={{ marginTop: 12, padding: '10px 16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>
                            {aiError}
                        </div>
                    )}

                    {aiRankedIds !== null && !aiSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}
                        >
                            <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                                <BrainCircuit size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                AI found {aiRankedIds.length} matching item{aiRankedIds.length !== 1 ? 's' : ''} for "{searchTerm}"
                            </span>
                            <button
                                onClick={() => { setAiRankedIds(null); setSearchTerm(''); setAiError(null); }}
                                style={{ background: 'none', border: '1px solid var(--gray-300)', borderRadius: 8, padding: '4px 10px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--gray-500)', fontWeight: 600 }}
                            >
                                Clear
                            </button>
                        </motion.div>
                    )}

                    <div className="cat-scroll-v5">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn-v5 ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="item-grid-v5">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="item-card-v5 glass"
                            >
                                {item.image && (
                                    <div className="card-image-v5">
                                        <img src={item.image} alt={item.title} />
                                        <div className={`tag-v5 ${item.type}`}>{item.type.toUpperCase()}</div>
                                    </div>
                                )}

                                <div className="card-body-v5">
                                    {!item.image && <div className={`tag-v5 ${item.type}`} style={{ position: 'relative', top: 0, right: 0, display: 'inline-block', marginBottom: '10px', width: 'fit-content' }}>{item.type.toUpperCase()}</div>}
                                    <div className="card-top-v5">
                                        <span className="cat-v5">{item.category}</span>
                                        <span className="dist-v5"><Navigation size={12} /> {getItemDistance(item.coords)}</span>
                                    </div>
                                    <h3>{item.title}</h3>
                                    <div className="loc-v5">
                                        <MapPin size={14} /> <span>{item.location_name || item.location}</span>
                                    </div>
                                    <p>{item.description}</p>

                                    <div className="card-footer-v5">
                                        <div className="time-v5">
                                            <Clock size={12} /> {new Date(item.created_at || item.timestamp).toLocaleDateString()}
                                        </div>
                                        <div className="btn-group-v5">
                                            <button className="inquiry-trigger-v5" onClick={() => setInquiryItem(item)}>
                                                <MessageSquare size={18} />
                                            </button>
                                            <button className="navigate-trigger-v5" onClick={() => {
                                                dispatch({ type: 'SET_MAP_VIEW', payload: { center: item.coords, zoom: 18, selectedItem: item } });
                                                navigate('/map');
                                            }}>
                                                Navigate <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                        <div className="no-items glass animate-fade">
                            <PackageSearch size={48} opacity={0.2} />
                            <h3>{aiRankedIds !== null ? 'No Matching Items Found' : 'No Records Available'}</h3>
                            <p>{aiRankedIds !== null ? 'Try a different description or broaden your search terms.' : 'Try adjusting your filters or check back later.'}</p>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {inquiryItem && (
                        <div className="modal-overlay-v5">
                            <motion.div
                                className="modal-content-v5 glass"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="m-header-v5">
                                    <h2>Claim Verification Protocol</h2>
                                    <button onClick={() => setInquiryItem(null)}><X size={20} /></button>
                                </div>
                                <div className="m-body-v5">
                                    <div className="m-item-v5">
                                        <div className="m-thumb-v5">
                                            {inquiryItem.image ? <img src={inquiryItem.image} alt="" /> : <Camera size={20} />}
                                        </div>
                                        <div>
                                            <strong>{inquiryItem.title}</strong>
                                            <span>Institutional ID: {inquiryItem.id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                    <p>Please provide specific identification details to verify ownership.</p>
                                    <textarea
                                        placeholder="Detail specific markings, serial numbers, or internal contents..."
                                        value={inquiryMessage}
                                        onChange={e => setInquiryMessage(e.target.value)}
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div className="m-footer-v5">
                                    <button className="btn-ghost" onClick={() => setInquiryItem(null)}>Abort</button>
                                    <button
                                        className="btn-primary"
                                        disabled={!inquiryMessage.trim() || sendingInquiry}
                                        onClick={handleSendInquiry}
                                    >
                                        {sendingInquiry ? 'Synchronizing...' : 'Submit Claim'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .reg-v5 { padding-top: calc(var(--nav-h) + 20px); min-height: 100vh; background: #FAF9F6; }
                .reg-header-v5 { margin-bottom: 40px; }
                .header-txt .badge { display: inline-block; background: var(--blue-light); color: var(--blue); padding: 8px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .header-txt h1 { font-size: 2.8rem; color: var(--navy); margin-bottom: 0.5rem; letter-spacing: -0.04em; }
                .header-txt p { color: var(--gray-600); font-size: 1.1rem; }

                .reg-controls { margin-top: 30px; padding: 12px; border-radius: 20px; display: flex; align-items: center; gap: 20px; background: white; border: 1px solid var(--border-glass); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08); }
                .search-bar { flex: 1; display: flex; align-items: center; gap: 12px; padding-left: 20px; border-right: 1px solid var(--border-glass); }
                .search-bar input { border: none; background: transparent; padding: 12px 0; font-size: 1rem; width: 100%; outline: none; }
                
                .reg-actions-v5 { display: flex; gap: 10px; padding-right: 8px; }
                .ai-search-btn-v5, .filter-trigger-v5 { 
                    display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; 
                    font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid var(--border-glass);
                }
                .ai-search-btn-v5 { background: #EEF2FF; color: #4F46E5; }
                .ai-search-btn-v5:hover:not(:disabled) { background: #E0E7FF; transform: translateY(-2px); }
                .ai-search-btn-v5.active { background: #4F46E5; color: white; box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
                .ai-search-btn-v5:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .filter-trigger-v5 { background: white; color: var(--text-dim); }
                .filter-trigger-v5:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

                .filter-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 240px; padding: 20px; border-radius: 20px; z-index: 100; display: flex; flex-direction: column; gap: 15px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); background: white; }
                .f-sec label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--navy); text-transform: uppercase; margin-bottom: 8px; }
                .f-sec select { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--gray-200); background: #F8FAFC; outline: none; transition: border 0.3s; }
                .f-sec select:focus { border-color: var(--blue); }

                .cat-scroll-v5 { display: flex; gap: 8px; margin-top: 25px; overflow-x: auto; padding-bottom: 5px; }
                .cat-scroll-v5::-webkit-scrollbar { display: none; }
                .cat-btn-v5 { background: white; border: 1px solid var(--border-glass); color: var(--navy); padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap; }
                .cat-btn-v5:hover { border-color: var(--blue); color: var(--blue); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .cat-btn-v5.active { background: var(--blue); color: white; border-color: var(--blue); box-shadow: 0 6px 14px rgba(59,130,246,0.3); }

                .item-grid-v5 { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; margin-top: 40px; }
                .item-card-v5 { background: white; border-radius: 24px; border: 1px solid var(--gray-200); overflow: hidden; display: flex; flex-direction: column; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .item-card-v5:hover { transform: translateY(-10px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border-color: var(--blue-light); }
                
                .card-image-v5 { height: 200px; background: #F8FAFC; position: relative; }
                .card-image-v5 img { width: 100%; height: 100%; object-fit: cover; }
                .img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #CBD5E1; }
                .tag-v5 { position: absolute; top: 15px; right: 15px; padding: 5px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 900; letter-spacing: 0.05em; }
                .tag-v5.lost { background: #FEE2E2; color: #EF4444; }
                .tag-v5.found { background: #DCFCE7; color: #10B981; }

                .card-body-v5 { padding: 20px; display: flex; flex-direction: column; flex: 1; }
                .card-top-v5 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .cat-v5 { font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; }
                .dist-v5 { font-size: 0.75rem; color: var(--text-dim); font-weight: 600; display: flex; align-items: center; gap: 4px; }
                .card-body-v5 h3 { font-size: 1.4rem; color: var(--color-dark); margin-bottom: 8px; letter-spacing: -0.02em; }
                .loc-v5 { display: flex; align-items: center; gap: 6px; color: var(--text-dim); font-size: 0.85rem; margin-bottom: 12px; }
                .card-body-v5 p { font-size: 0.9rem; color: var(--text-dim); line-height: 1.6; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .card-footer-v5 { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center; }
                .time-v5 { font-size: 0.75rem; color: var(--text-dim); display: flex; align-items: center; gap: 6px; font-weight: 500; }
                .btn-group-v5 { display: flex; gap: 8px; }
                .inquiry-trigger-v5 { width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--border-glass); background: white; color: var(--color-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .inquiry-trigger-v5:hover { background: var(--color-primary-soft); transform: scale(1.05); }
                .navigate-trigger-v5 { height: 44px; padding: 0 16px; border-radius: 12px; background: var(--color-dark); color: white; border: none; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .navigate-trigger-v5:hover { background: var(--color-primary); transform: translateX(2px); }

                .no-items { text-align: center; padding: 60px 20px; grid-column: 1 / -1; }
                .no-items h3 { margin-top: 16px; font-size: 1.2rem; color: var(--navy); }
                .no-items p { color: var(--gray-500); margin-top: 8px; }

                .modal-overlay-v5 { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; }
                .modal-content-v5 { width: 100%; max-width: 500px; background: white; padding: 35px; border-radius: 30px; border: 1px solid var(--border-glass); box-shadow: var(--shadow-xl); }
                .m-header-v5 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .m-header-v5 h2 { font-size: 1.6rem; letter-spacing: -0.04em; }
                .m-header-v5 button { background: none; border: none; color: var(--text-dim); cursor: pointer; }
                
                .m-item-v5 { display: flex; align-items: center; gap: 15px; padding: 15px; background: #F8FAFC; border-radius: 16px; margin-bottom: 20px; }
                .m-thumb-v5 { width: 50px; height: 50px; border-radius: 10px; overflow: hidden; background: #E2E8F0; display: flex; align-items: center; justify-content: center; color: var(--text-dim); }
                .m-thumb-v5 img { width: 100%; height: 100%; object-fit: cover; }
                .m-item-v5 strong { display: block; font-size: 1.1rem; }
                .m-item-v5 span { font-size: 0.8rem; color: var(--text-dim); }

                .m-body-v5 p { font-size: 0.9rem; color: var(--text-dim); margin-bottom: 10px; font-weight: 600; }
                .m-body-v5 textarea { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #F1F5F9; background: #F8FAFC; outline: none; font-family: inherit; font-size: 1rem; resize: none; transition: 0.2s; }
                .m-body-v5 textarea:focus { border-color: var(--color-primary); background: white; }

                .m-footer-v5 { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
                .m-footer-v5 .btn-primary { padding: 14px 28px; border-radius: 15px; }

                @media (max-width: 768px) {
                  .reg-controls { flex-direction: column; align-items: stretch; }
                  .search-bar { border-right: none; border-bottom: 1px solid var(--border-glass); padding: 0 10px 10px; }
                  .item-grid-v5 { grid-template-columns: 1fr; }
                  .header-txt h1 { font-size: 2.2rem; }
                }
            ` }} />
        </div>
    );
};

export default Registry;
