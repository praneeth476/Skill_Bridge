import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// --- Global Constants & Data (Employer Focused) ---
const GLASS_CLASS = "glass";

// --- PRIMARY COLOR DEFINITION (FIX 6: Using #1D4ED8) ---
const PRIMARY_BLUE = "#1D4ED8";
const LIGHT_BLUE = "#3B82F6"; 
const DARK_NAVY = "#0F172A"; 
const SUBTLE_GRAY = "#6B7280";
const SUCCESS_GREEN = "#10B981";
const WARNING_YELLOW = "#F59E0B";
const DANGER_RED = "#EF4444";

// --- Role-Based Access Control (RBAC) Data (⭐ 9) ---
const ROLES = {
    ADMIN: 'Admin',
    HR: 'HR Team',
    HIRING_MANAGER: 'Hiring Manager',
    INTERVIEWER: 'Interviewer'
};
const defaultUserRole = ROLES.HR; // Default user is an HR team member

// --- Refined Data Structures ---
const hiringMetrics = [
    { title: "Active Postings", value: 5, icon: "fa-solid fa-briefcase", color: PRIMARY_BLUE },
    { title: "New Applications", value: 42, icon: "fa-solid fa-user-graduate", color: SUCCESS_GREEN },
    { title: "Interviews Scheduled", value: 8, icon: "fa-solid fa-calendar-alt", color: WARNING_YELLOW },
    { title: "Offers Extended", value: 3, icon: "fa-solid fa-handshake", color: DANGER_RED },
];

// ⭐ 7: Job Posting Analytics added
const jobPostings = [
    { id: 101, title: "Senior Backend Developer", dept: "Engineering", location: "Remote", status: "Active", applications: 15, date: "Nov 10", views: 450, conversion: '3.3%' },
    { id: 102, title: "UX/UI Designer", dept: "Product", location: "New York, NY", status: "Active", applications: 27, date: "Nov 15", views: 810, conversion: '2.8%' },
    { id: 103, title: "Marketing Specialist", dept: "Marketing", location: "Chicago, IL", status: "Paused", applications: 8, date: "Oct 28", views: 250, conversion: '3.2%' },
    { id: 104, title: "Data Scientist Intern", dept: "Data & AI", location: "Remote", status: "Active", applications: 55, date: "Nov 25", views: 1200, conversion: '4.6%' },
];

// ⭐ 1, 5, 4: AI Analysis, Timeline, and Offer Status added
const candidatePipeline = [
    { 
        id: 201, name: "Alice Johnson", role: "UX/UI Designer", stage: "Interviewing", lastActivity: "2h ago", applicationDate: "2025-11-20",
        aiScore: 92, keywordMatch: 90, cultureFit: 85, offerStatus: "N/A", salary: null,
        timeline: [
            { date: "2025-11-20", activity: "Application Submitted" },
            { date: "2025-11-22", activity: "Initial Screening (Passed)" },
            { date: "2025-12-01", activity: "Interview Scheduled: Dec 10, 10 AM (via Google Meet)" },
        ]
    },
    { 
        id: 202, name: "Bob Smith", role: "Data Scientist Intern", stage: "New Application", lastActivity: "5m ago", applicationDate: "2025-11-28",
        aiScore: 78, keywordMatch: 80, cultureFit: 70, offerStatus: "N/A", salary: null,
        timeline: [
            { date: "2025-11-28", activity: "Application Submitted (New)" },
        ]
    },
    { 
        id: 203, name: "Charlie Davis", role: "Senior Backend Dev", stage: "Offer Sent", lastActivity: "1 day ago", applicationDate: "2025-11-15",
        aiScore: 95, keywordMatch: 98, cultureFit: 92, offerStatus: "Pending Acceptance", salary: "$145,000",
        timeline: [
            { date: "2025-11-15", activity: "Application Submitted" },
            { date: "2025-11-17", activity: "Hiring Manager Screening (Passed)" },
            { date: "2025-11-20", activity: "Final Interview (Success)" },
            { date: "2025-11-27", activity: "Offer Letter Sent (Pending E-Sign)" },
        ]
    },
    { id: 204, name: "Eve Brown", role: "UX/UI Designer", stage: "Screening", lastActivity: "1 day ago", applicationDate: "2025-11-27",
        aiScore: 82, keywordMatch: 85, cultureFit: 75, offerStatus: "N/A", salary: null,
        timeline: [
            { date: "2025-11-27", activity: "Application Submitted" },
            { date: "2025-11-28", activity: "Review Stage: Screening" },
        ] 
    },
];

// Data for Right Summary Bar
const summaryData = {
    upcomingInterviews: [
        { name: "Alice Johnson", time: "Dec 10, 10:00 AM", role: "UX/UI Designer" },
        { name: "Henry Lee", time: "Dec 11, 2:00 PM", role: "Marketing Specialist" },
    ],
    pendingOffers: [
        { name: "Charlie Davis", role: "Senior Backend Dev" },
    ],
    newMessages: 4,
};

const actionItems = [
    { title: "Review New Applications (27)", detail: "UX/UI Designer posting has 27 new applicants.", icon: "fa-solid fa-clipboard-list", color: PRIMARY_BLUE, targetView: 'candidates' },
    { title: "Final Interview: C. Davis", detail: "Schedule final round for Charlie Davis.", icon: "fa-solid fa-calendar-check", color: WARNING_YELLOW, targetView: 'candidates' },
    { title: "Approve Offer Letter", detail: "Approve offer for Senior Backend Developer role.", icon: "fa-solid fa-check-circle", color: SUCCESS_GREEN, targetView: 'candidates' },
];

const candidateStages = ["All Stages", "New Application", "Screening", "Interviewing", "Offer Sent", "Rejected"];

// ⭐ 8: Saved Searches (Mock Data)
const savedFilters = [
    { id: 1, name: 'Urgent: Backend & Data', stage: 'Interviewing', role: 'Dev, Data', dateRange: 'Last 7 Days' },
    { id: 2, name: 'Q4 Offers Pending', stage: 'Offer Sent', role: 'All', dateRange: 'All Time' },
];

// ⭐ 6: Analytics Data (Mock Data)
const analyticsData = {
    appsPerDay: [10, 15, 8, 20, 12, 25, 42], // Last 7 days
    conversionRate: 0.035, // 3.5%
    offerAcceptanceRate: 0.82, // 82%
    timeToHire: 32, // days
};

// Motion Variants
const springVariants = {
    initial: { opacity: 0, y: 10 }, 
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

// --- Utility Components (Breadcrumb, MetricCard are kept) ---

const MetricCard = ({ metric, onClick }) => {
    const isClickable = metric.title !== "Offers Extended"; // Only offers are restricted
    return (
        <motion.div
            className={`card card-hover ${isClickable ? 'ripple' : ''}`}
            style={styles.metricCard}
            whileHover={{ scale: isClickable ? 1.03 : 1, boxShadow: isClickable ? styles.shadowLg : 'none' }} 
            onClick={onClick}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <motion.div 
                    style={{...styles.metricIconCircle, backgroundColor: metric.color}}
                >
                    <i className={metric.icon} style={{color: '#fff', fontSize: '1.5rem'}}></i>
                </motion.div>
                <div style={{ textAlign: 'left' }}>
                    <h3 style={styles.metricTitle}>{metric.title}</h3>
                    <p style={styles.metricValue}>{metric.value}</p>
                </div>
            </div>
            <i className="fa-solid fa-chevron-right" style={{color: SUBTLE_GRAY}}></i>
        </motion.div>
    );
};

// --- Offer Management & Candidate Detail Modal (⭐ 1, ⭐ 2, ⭐ 4, ⭐ 5) ---

const CandidateDetailModal = ({ candidate, onClose, userRole }) => {
    const isOfferManagementAllowed = [ROLES.ADMIN, ROLES.HR].includes(userRole);

    const getOfferStatusStyle = (status) => {
        if (status.includes('Accepted')) return { color: SUCCESS_GREEN, fontWeight: 700 };
        if (status.includes('Pending')) return { color: WARNING_YELLOW, fontWeight: 700 };
        if (status.includes('Rejected')) return { color: DANGER_RED, fontWeight: 700 };
        return { color: SUBTLE_GRAY };
    };

    const handleOfferAction = (action) => {
        if (!isOfferManagementAllowed) {
            alert("Permission Denied: Only HR and Admin can manage offers.");
            return;
        }
        alert(`${action} action triggered for ${candidate.name} (Role: ${candidate.role}).`);
        // In a real app, this would dispatch an action to update the backend data.
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <motion.div 
                style={styles.modalContent}
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ padding: '2rem' }}>
                    <div style={styles.modalHeader}>
                        <h2 style={styles.modalTitle}><i className="fa-solid fa-user-tie" style={{ marginRight: '10px' }}></i>Candidate: {candidate.name}</h2>
                        <button style={styles.modalCloseButton} onClick={onClose}><i className="fa-solid fa-times"></i></button>
                    </div>
                    <p style={styles.descriptionText}>Applied for: **{candidate.role}** | Current Stage: **{candidate.stage}**</p>
                    
                    {/* AI Resume Analysis (⭐ 1) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-microchip" style={{ marginRight: '8px', color: LIGHT_BLUE }}></i> AI Resume Analysis</h3>
                    <div style={styles.aiMetricsContainer}>
                        <MetricCardSimple title="Skills Match" value={`${candidate.aiScore}%`} color={SUCCESS_GREEN} />
                        <MetricCardSimple title="Keyword Density" value={`${candidate.keywordMatch}%`} color={PRIMARY_BLUE} />
                        <MetricCardSimple title="Culture Fit" value={`${candidate.cultureFit}%`} color={WARNING_YELLOW} />
                        <MetricCardSimple title="Experience Score" value="A+" color={SUCCESS_GREEN} />
                    </div>

                    {/* Offer Management (⭐ 4) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-handshake" style={{ marginRight: '8px', color: DANGER_RED }}></i> Offer Management</h3>
                    <div style={styles.offerStatusContainer}>
                        <p style={{...styles.descriptionText, margin: 0}}>Status: <span style={getOfferStatusStyle(candidate.offerStatus)}>**{candidate.offerStatus}**</span></p>
                        {candidate.salary && <p style={{...styles.descriptionText, margin: 0}}>Proposed Salary: **{candidate.salary}**</p>}
                        <div style={styles.offerActions}>
                            <button 
                                style={{...styles.offerActionButton, background: SUCCESS_GREEN}} 
                                className="ripple" 
                                onClick={() => handleOfferAction('Approve/Send Offer')}
                                disabled={!isOfferManagementAllowed}
                            >
                                <i className="fa-solid fa-paper-plane"></i> {candidate.offerStatus.includes('Pending') ? 'Final Approval' : 'Generate Offer'}
                            </button>
                            <button 
                                style={{...styles.offerActionButton, background: WARNING_YELLOW}} 
                                className="ripple"
                                onClick={() => handleOfferAction('Request Revision')}
                                disabled={!isOfferManagementAllowed}
                            >
                                <i className="fa-solid fa-redo"></i> Request Revision
                            </button>
                        </div>
                        {!isOfferManagementAllowed && <p style={{ color: DANGER_RED, fontSize: '0.9rem', marginTop: '10px' }}>*Requires HR/Admin role to act.</p>}
                    </div>

                    {/* Interview Automation (⭐ 2) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-calendar-check" style={{ marginRight: '8px', color: WARNING_YELLOW }}></i> Interview Automation</h3>
                    <div style={styles.offerActions}>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Scheduling Interview for ${candidate.name}`)}><i className="fa-solid fa-calendar-plus"></i> Auto-Schedule</button>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Sending Reminder to ${candidate.name}`)}><i className="fa-solid fa-bell"></i> Send Reminder</button>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Syncing Interview with Calendar`)}><i className="fa-brands fa-google"></i> Sync Calendar</button>
                    </div>

                    {/* Candidate Timeline (⭐ 5) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-history" style={{ marginRight: '8px', color: DARK_NAVY }}></i> Candidate Timeline</h3>
                    <div style={styles.timelineContainer}>
                        {candidate.timeline.map((item, index) => (
                            <div key={index} style={styles.timelineItem}>
                                <div style={styles.timelineDot}></div>
                                <div style={styles.timelineContent}>
                                    <p style={styles.timelineDate}>{item.date}</p>
                                    <p style={styles.timelineActivity}>**{item.activity}**</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

const MetricCardSimple = ({ title, value, color }) => (
    <div style={{ ...styles.aiMetricCard, borderLeft: `4px solid ${color}` }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: SUBTLE_GRAY }}>{title}</p>
        <h4 style={{ margin: '5px 0 0 0', color: color, fontWeight: 800, fontSize: '1.4rem' }}>{value}</h4>
    </div>
);


// --- View Components (Analytics, Inbox, etc.) ---

// ⭐ 6: Analytics Dashboard
const AnalyticsView = ({ onBack, appsPerDay, conversionRate, offerAcceptanceRate, timeToHire }) => {
    
    // Simulate Chart Data (simplified for in-line styling)
    const maxApps = Math.max(...appsPerDay);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const ChartBar = ({ height }) => (
        <div style={{ ...styles.chartBar, height: `${(height / maxApps) * 100}%` }}></div>
    );

    return (
        <motion.div
            key="analytics"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Hiring Analytics Dashboard <i className="fa-solid fa-chart-line" style={{ color: SUCCESS_GREEN, marginLeft: '10px' }}></i>
                    <small style={styles.subtitleSmall}>Key performance indicators and funnel metrics.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
            </div>
            <div style={{...styles.sectionDivider, margin: '2rem 0 3rem'}}></div>

            {/* Top Metrics */}
            <div style={styles.metricsContainer}>
                <MetricCardSimple title="Conversion Rate" value={`${(conversionRate * 100).toFixed(1)}%`} color={PRIMARY_BLUE} />
                <MetricCardSimple title="Offer Acceptance" value={`${(offerAcceptanceRate * 100).toFixed(0)}%`} color={SUCCESS_GREEN} />
                <MetricCardSimple title="Time To Hire (Avg.)" value={`${timeToHire} Days`} color={WARNING_YELLOW} />
                <MetricCardSimple title="Cost Per Hire (Est.)" value="\$2,150" color={DANGER_RED} />
            </div>

            {/* Applications Per Day Chart */}
            <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Applications Per Day (Last 7 Days)</h3>
                <div style={styles.chartContainer}>
                    {appsPerDay.map((apps, index) => (
                        <div key={index} style={styles.chartColumn}>
                            <ChartBar height={apps} />
                            <span style={styles.chartValue}>{apps}</span>
                            <span style={styles.chartLabel}>{dayLabels[index]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ⭐ 3: Communication Inbox
const InboxView = ({ onBack }) => {
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: "Alice Johnson", subject: "Follow-up on Dec 10 Interview", preview: "Just confirming my availability for the upcoming interview...", timestamp: "3 min ago", unread: true },
        { id: 2, sender: "Recruiting Agency X", subject: "New Candidate List - Data Scientist", preview: "Please find attached the short-list of potential candidates for the Data Scientist role...", timestamp: "2h ago", unread: false },
        { id: 3, sender: "Charlie Davis", subject: "Re: Offer Sent - Senior Backend Developer", preview: "Thank you for the amazing offer! I am currently reviewing the details and will get back to you by...", timestamp: "1 day ago", unread: true },
    ]);

    const handleMessageClick = (id) => {
        setMessages(messages.map(m => m.id === id ? { ...m, unread: false } : m));
        alert(`Opening message from: ${messages.find(m => m.id === id).sender}.`);
    };

    return (
        <motion.div
            key="inbox"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Communication Inbox <i className="fa-solid fa-envelope" style={{ color: PRIMARY_BLUE, marginLeft: '10px' }}></i>
                    <small style={styles.subtitleSmall}>Manage all candidate and recruiter correspondence.</small>
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={styles.actionButtonMain} className="ripple" onClick={() => setIsComposeModalOpen(true)}><i className="fa-solid fa-plus"></i> Compose</button>
                    <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
                </div>
            </div>
            <div style={{...styles.sectionDivider, margin: '2rem 0 3rem'}}></div>

            <div style={styles.listContainerCol}>
                {messages.map(msg => (
                    <motion.div 
                        key={msg.id} 
                        style={{...styles.inboxItem, fontWeight: msg.unread ? 700 : 400, background: msg.unread ? '#F0F6FF' : '#fff'}}
                        whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        onClick={() => handleMessageClick(msg.id)}
                    >
                        <i className={`fa-solid ${msg.unread ? 'fa-envelope' : 'fa-envelope-open'}`} style={{ color: PRIMARY_BLUE, marginRight: '15px' }}></i>
                        <div style={{ flex: 1 }}>
                            <p style={styles.inboxSender}>{msg.sender}</p>
                            <p style={styles.inboxSubject}>{msg.subject}</p>
                            <p style={styles.inboxPreview}>{msg.preview}</p>
                        </div>
                        <span style={styles.inboxTimestamp}>{msg.timestamp}</span>
                    </motion.div>
                ))}
                {messages.length === 0 && <p style={{...styles.welcome, textAlign: 'center'}}>Your inbox is empty!</p>}
            </div>

            {isComposeModalOpen && <ComposeEmailModal onClose={() => setIsComposeModalOpen(false)} />}
        </motion.div>
    );
};

// Compose Email Modal
const ComposeEmailModal = ({ onClose }) => {
    const handleSend = () => {
        alert("Email sent (mock action).");
        onClose();
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <motion.div 
                style={{...styles.modalContent, maxWidth: '600px', padding: '1.5rem'}}
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={styles.modalSubtitle}>Compose New Message</h3>
                <input style={styles.emailInput} placeholder="To: Candidate Name or Email" />
                <select style={styles.emailInput} defaultValue="">
                    <option value="" disabled>Select Quick Template</option>
                    <option value="interview">Interview Request</option>
                    <option value="followup">Application Follow-up</option>
                    <option value="offer">Formal Offer Letter</option>
                </select>
                <input style={styles.emailInput} placeholder="Subject" />
                <textarea style={styles.emailTextarea} placeholder="Message Body..."></textarea>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                    <button style={styles.actionButton} className="ripple"><i className="fa-solid fa-paperclip"></i> Attach File</button>
                    <button style={styles.actionButtonMain} className="ripple" onClick={handleSend}><i className="fa-solid fa-paper-plane"></i> Send Email</button>
                </div>
            </motion.div>
        </div>
    );
};


const EmployerHomeView = ({ onSearch, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onSearch(searchTerm); };

    // Navigate to a specific view when a MetricCard is clicked
    const handleMetricClick = (title) => {
        if (title === "Active Postings") onNavigate('postings');
        else if (title === "New Applications" || title === "Interviews Scheduled") onNavigate('candidates');
        else if (title === "Offers Extended") alert('Viewing Offers Extended requires Admin/HR permission, please navigate to the Candidate Tracker view.');
    };

    return (
        <motion.div
            key="home"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
            style={styles.homeContent}
        >
            <motion.div style={{...styles.mainTitle, marginBottom: '0.75rem'}}>
                Welcome to the <span style={{ color: WARNING_YELLOW }}>Employer Portal</span>
            </motion.div>
            <motion.div style={{...styles.mainSubtitle, marginBottom: '2.5rem'}}>
                Manage your postings, track candidates, and grow your team.
            </motion.div>
            
            <form 
                style={{...styles.mainSearchBar, ...styles.glassSearch}} 
                className={GLASS_CLASS} 
                onSubmit={handleSubmit}
            >
                <input 
                    style={styles.mainSearchInput} 
                    placeholder="Search candidates, job titles, reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" style={styles.mainSearchButton} className="ripple">
                    <i className="fa-solid fa-search" /> Search
                </button>
            </form>
            
            <motion.div style={{ width: '100%', marginTop: '3.5rem' }}>
                <h2 style={{...styles.viewTitle, textAlign: 'left', fontSize: '1.8rem', color: PRIMARY_BLUE, marginBottom: '1.5rem'}}>
                    Hiring Overview 
                    <small style={styles.subtitleSmall}>Real-time snapshot of your current pipeline.</small>
                </h2>
                <div style={styles.metricsContainer}>
                    {hiringMetrics.map((metric, i) => <MetricCard key={i} metric={metric} onClick={() => handleMetricClick(metric.title)} />)}
                </div>
            </motion.div>
            
            <motion.div style={{ width: '100%', marginTop: '4rem' }}>
                <h2 style={{...styles.viewTitle, textAlign: 'left', fontSize: '1.8rem', color: PRIMARY_BLUE, marginBottom: '1.5rem'}}>
                    Urgent Actions
                    <small style={styles.subtitleSmall}>Items requiring immediate attention or approval.</small>
                </h2>
                <div style={styles.actionItemsContainer}>
                    {actionItems.map((item, i) => (
                        <motion.div 
                            key={i}
                            className="card card-hover ripple"
                            style={styles.actionItemCard}
                            whileHover={{ scale: 1.01, boxShadow: styles.shadowLg }} 
                            onClick={() => item.targetView && onNavigate(item.targetView)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <i className={item.icon} style={{ color: item.color, fontSize: '1.4rem' }}></i>
                                <div>
                                    <h4 style={styles.actionTitle}>{item.title}</h4>
                                    <p style={styles.actionDetail}>{item.detail}</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-arrow-right" style={{color: SUBTLE_GRAY}}></i>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div style={{...styles.filterGroup, marginTop: '3rem', justifyContent: 'center'}}>
                <button style={styles.upgradeButton} className="ripple" onClick={() => onNavigate('postings')}>
                    <i className="fa-solid fa-plus"></i> Create New Posting
                </button>
            </motion.div>
        </motion.div>
    );
};

const PostingCard = ({ posting, onClick }) => { // ⭐ 7: Job Posting Analytics displayed here
    return (
        <motion.div
            className="card card-hover ripple"
            variants={springVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover={{ scale: 1.01, translateY: -2, boxShadow: styles.shadowLg }} 
            whileTap={{ scale: 0.99 }}
            style={styles.postingCard} 
            onClick={() => onClick(posting)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={styles.cardTitle}>{posting.title}</h3>
                    <p style={styles.cardSubtitle}>{posting.dept} · {posting.location}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.8rem' }}> 
                        <span style={styles.postingStatPill}><i className="fa-solid fa-eye"></i> **{posting.views} Views**</span>
                        <span style={styles.postingStatPill}><i className="fa-solid fa-chart-bar"></i> **{posting.conversion} Rate**</span>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <motion.span style={posting.status === 'Active' ? styles.statusActivePill : styles.statusPausedPill}>
                    {posting.status}
                </motion.span>
                <motion.button 
                    style={styles.actionButton} 
                    className="ripple"
                    whileHover={{ scale: 1.05 }} 
                >
                    Manage <i className="fa-solid fa-edit"></i>
                </motion.button>
            </div>
        </motion.div>
    );
};

const JobPostingView = ({ onBack, onSelectPosting }) => {
    return (
        <motion.div
            key="postings"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Manage Job Postings
                    <small style={styles.subtitleSmall}>Edit, pause, or view applications for all roles.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
            </div>
            <div style={{...styles.sectionDivider, margin: '2rem 0 3rem'}}></div>
            <div style={styles.listContainer}>
                <AnimatePresence>
                    {jobPostings.map(posting => (
                        <PostingCard key={posting.id} posting={posting} onClick={onSelectPosting} />
                    ))}
                </AnimatePresence>
            </div>
            <motion.div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button style={styles.loadMoreButton} className="ripple">
                    <i className="fa-solid fa-plus"></i> View Archive
                </button>
            </motion.div>
        </motion.div>
    );
};

// ⭐ 8: Candidate Tracker with Saved Searches/Filters
const CandidateTrackerView = ({ onBack, onSelectCandidate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('All Stages');
    const [sortBy, setSortBy] = useState({ key: 'applicationDate', direction: 'desc' });
    const [isHoveredRow, setIsHoveredRow] = useState(null);
    const [appliedFilter, setAppliedFilter] = useState(null);

    const getStatusStyle = (stage) => {
        if (stage.includes('New')) return styles.statusNewPillPulse;
        if (stage.includes('Interviewing')) return styles.statusScheduledPillGlow;
        if (stage.includes('Offer')) return styles.statusOfferPill;
        return styles.jobTypePill;
    }

    const filteredAndSortedCandidates = useMemo(() => {
        let candidates = candidatePipeline;

        if (stageFilter !== 'All Stages') {
            candidates = candidates.filter(c => c.stage === stageFilter);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            candidates = candidates.filter(c => 
                c.name.toLowerCase().includes(lowerCaseSearch) ||
                c.role.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return candidates.sort((a, b) => {
            const aVal = a[sortBy.key];
            const bVal = b[sortBy.key];

            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            else if (aVal < bVal) comparison = -1;

            return sortBy.direction === 'asc' ? comparison : comparison * -1;
        });
    }, [stageFilter, searchTerm, sortBy]);
    
    const handleSort = (key) => {
        setSortBy(prev => ({
            key,
            direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortBy.key !== key) return null;
        return <i className={`fa-solid fa-sort-${sortBy.direction === 'asc' ? 'up' : 'down'}`} style={{ marginLeft: '5px' }}></i>;
    };

    const handleSaveFilter = () => {
        const filterName = prompt("Enter a name for your saved filter:");
        if (filterName) {
            alert(`Filter "${filterName}" saved!`);
            setAppliedFilter({ name: filterName, stage: stageFilter, search: searchTerm });
        }
    };
    
    const handleApplySavedFilter = (filter) => {
        setStageFilter(filter.stage);
        setSearchTerm(filter.role.includes('All') ? '' : filter.role.split(', ')[0]);
        setAppliedFilter(filter);
        alert(`Applying filter: ${filter.name}`);
    };

    return (
        <motion.div
            key="candidates"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Candidate Pipeline Tracker
                    <small style={styles.subtitleSmall}>Monitor candidates across hiring stages in real time.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
            </div>
            <div style={{...styles.sectionDivider, margin: '2rem 0 3rem'}}></div>
            
            {/* Filtering and Search Bar (⭐ 8) */}
            <motion.div 
                style={styles.filterBar} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
            >
                <div style={styles.filterGroup}>
                    <span style={{ fontWeight: 600, color: PRIMARY_BLUE }}>Filter Stage:</span>
                    <select style={styles.filterSelect} onChange={(e) => setStageFilter(e.target.value)} value={stageFilter}>
                        {candidateStages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </div>

                <div style={{...styles.filterGroup, flex: 1, minWidth: '250px'}}>
                    <span style={{ fontWeight: 600, color: PRIMARY_BLUE, marginRight: '10px' }}>Search:</span>
                    <input 
                        style={styles.filterInput}
                        placeholder="Search name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <button style={styles.saveFilterButton} className="ripple" onClick={handleSaveFilter}>
                    <i className="fa-solid fa-save"></i> Save Filter
                </button>
            </motion.div>
            
            {/* Saved Filters (⭐ 8) */}
            <div style={styles.savedFiltersContainer}>
                <span style={{ fontWeight: 600, color: PRIMARY_BLUE, marginRight: '10px' }}>Saved Filters:</span>
                {savedFilters.map(filter => (
                    <motion.span 
                        key={filter.id}
                        className={`pill ${appliedFilter && appliedFilter.id === filter.id ? 'active' : ''}`}
                        onClick={() => handleApplySavedFilter(filter)}
                        whileHover={{ scale: 1.03 }}
                    >
                        {filter.name}
                    </motion.span>
                ))}
            </div>

            <p style={{...styles.welcome, marginBottom: '2rem', marginTop: '1rem'}}>Showing **{filteredAndSortedCandidates.length}** candidates matching criteria.</p>
            
            <div style={styles.pipelineTableContainer}>
                <table style={styles.pipelineTable}>
                    <thead>
                        <tr>
                            <th style={styles.pipelineTh} onClick={() => handleSort('name')} className="sortable">Candidate {getSortIcon('name')}</th>
                            <th style={styles.pipelineTh}>Applied For</th>
                            <th style={styles.pipelineTh}>Current Stage</th>
                            <th style={styles.pipelineTh} onClick={() => handleSort('applicationDate')} className="sortable">Date {getSortIcon('applicationDate')}</th>
                            <th style={styles.pipelineTh}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredAndSortedCandidates.length > 0 ? filteredAndSortedCandidates.map((c, i) => (
                                <motion.tr 
                                    key={c.id} 
                                    style={{
                                        ...styles.pipelineTr, 
                                        ...(isHoveredRow === c.id && styles.pipelineTrHover) 
                                    }} 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onMouseEnter={() => setIsHoveredRow(c.id)}
                                    onMouseLeave={() => setIsHoveredRow(null)}
                                >
                                    <td style={styles.pipelineTd}><i className="fa-solid fa-user-circle" style={{ marginRight: '8px', color: '#9CA3AF' }}></i>{c.name}</td>
                                    <td style={styles.pipelineTd}>{c.role}</td>
                                    <td style={styles.pipelineTd}>
                                        <span style={getStatusStyle(c.stage)} className={c.stage.includes('New') ? "pulse-animation" : ""}>
                                            {c.stage}
                                        </span>
                                    </td>
                                    <td style={styles.pipelineTd}>{c.applicationDate}</td>
                                    <td style={styles.pipelineTd}>
                                        <button style={styles.pipelineActionButton} title="View Details" onClick={() => onSelectCandidate(c)}><i className="fa-solid fa-eye"></i></button>
                                        <button style={styles.pipelineActionButton} title="Advance Stage" onClick={() => alert(`Advancing ${c.name} to next stage...`)}><i className="fa-solid fa-angle-double-right"></i></button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr><td colSpan="5" style={{...styles.pipelineTd, textAlign: 'center', padding: '3rem 0'}}>
                                    {/* Empty State UX */}
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }} 
                                        style={styles.emptyStateContainer}
                                    >
                                        <i className="fa-solid fa-inbox-open" style={styles.emptyStateIcon}></i>
                                        <h3 style={styles.emptyStateTitle}>No Candidates Yet</h3>
                                        <p style={styles.emptyStateMessage}>Start posting jobs to attract applicants and see your pipeline fill up!</p>
                                        <button style={styles.upgradeButton} className="ripple" onClick={onBack}>
                                            Go to Home & Post a Job
                                        </button>
                                    </motion.div>
                                </td></tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};


// --- Notification System (⭐ 10) ---
const NotificationCenterModal = ({ onClose }) => {
    const notifications = [
        { id: 1, message: "New Candidate: Bob Smith applied for Data Scientist Intern.", time: "5 minutes ago", icon: "fa-user-graduate", color: SUCCESS_GREEN },
        { id: 2, message: "Alice Johnson interview scheduled for Dec 10, 10:00 AM.", time: "3 hours ago", icon: "fa-calendar-alt", color: WARNING_YELLOW },
        { id: 3, message: "Charlie Davis offer letter is due for final HR approval.", time: "1 day ago", icon: "fa-check-circle", color: DANGER_RED },
    ];
    
    return (
        <div style={styles.notificationModalOverlay} onClick={onClose}>
            <motion.div 
                style={styles.notificationModalContent}
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={styles.summaryTitle}><i className="fa-solid fa-bell" style={{ marginRight: '8px' }}></i> Notification Center</h3>
                <div style={styles.sectionDividerShort}></div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                        <div key={n.id} style={styles.notificationItem} onClick={() => alert(`Clicked notification: ${n.message}`)}>
                            <i className={`fa-solid ${n.icon}`} style={{ color: n.color, marginRight: '10px' }}></i>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 500, color: DARK_NAVY, fontSize: '0.95rem' }}>{n.message}</p>
                                <span style={{ fontSize: '0.8rem', color: SUBTLE_GRAY }}>{n.time}</span>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p style={{ color: SUBTLE_GRAY, textAlign: 'center', marginTop: '10px' }}>No new notifications.</p>}
                </div>
            </motion.div>
        </div>
    );
};

// --- Dashboard Main ---
const EmployerDashboard = () => {
    const [activeView, setActiveView] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null); // Changed from selectedPosting
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [userRole, setUserRole] = useState(defaultUserRole); // ⭐ 9: User Role State
    const [showNotifications, setShowNotifications] = useState(false); // ⭐ 10: Notification State
    
    const { scrollY } = useScroll();
    const spring = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const checkScrollTop = () => {
        const latest = scrollY.get();
        if (latest > 10) { setIsScrolled(true); } else { setIsScrolled(false); }
        if (latest > 600) { setShowScroll(true); } else { setShowScroll(false); }
    };

    useEffect(() => {
        const unsubscribe = spring.on("change", checkScrollTop);
        return () => unsubscribe();
    }, [spring]);

    const scrollTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const handleSelectCandidate = (candidate) => { setSelectedCandidate(candidate); }; // New handler

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            alert(`Employer search triggered for: ${searchTerm}. Navigating to tracker view.`);
            setActiveView('candidates');
        }
    }

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.transition = "background 0.5s";

        document.body.style.background = isDarkMode 
            ? "#1f2937" 
            : "linear-gradient(to bottom, #f0f5ff, #ffffff)";
    }, [isDarkMode]);

    const renderContent = () => {
        switch (activeView) {
            case 'postings':
                return <JobPostingView onBack={() => setActiveView('home')} onSelectPosting={handleSelectCandidate} />;
            case 'candidates':
                return <CandidateTrackerView onBack={() => setActiveView('home')} onSelectCandidate={handleSelectCandidate} />;
            case 'analytics': // ⭐ 6: Analytics View Route
                return <AnalyticsView onBack={() => setActiveView('home')} {...analyticsData} />;
            case 'inbox': // ⭐ 3: Inbox View Route
                return <InboxView onBack={() => setActiveView('home')} />;
            default:
                return <EmployerHomeView onSearch={handleSearch} onNavigate={setActiveView} />;
        }
    };

    const dynamicNavColor = isScrolled ? '#fff' : '#E0E7EF';
    const dynamicNavBackground = isDarkMode 
        ? (isScrolled ? 'rgba(31, 41, 55, 0.9)' : '#1F2937')
        : (isScrolled ? 'rgba(29, 78, 216, 0.8)' : PRIMARY_BLUE);

    const dynamicNavStyle = {
        ...styles.navbar, 
        ...(isScrolled && styles.glassNav),
        background: dynamicNavBackground,
        boxShadow: isScrolled ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
    };
    
    // ⭐ 10: Calculate unread count for notification badge
    const unreadNotificationsCount = 3; // Mocking 3 unread for now

    return (
        <>
            <style>
                {`
                /* Global CSS for animations and base styling */
                html, body, #root {
                    width: 100vw;
                    min-height: 100vh;
                    padding: 0; margin: 0;
                    color: ${isDarkMode ? '#F9FAFB' : DARK_NAVY};
                }
                .container { max-width: 1300px; margin: 0 auto; padding: 0 20px; width: 100%; }
                .sticky-navbar { position: fixed; top: 0; z-index: 1001; width: 100%; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .card { transition: all 0.3s ease; }
                .ripple:active { transform: scale(0.98); transition:0.1s;}
                
                /* Glassmorphism Effect */
                .glass {
                    backdrop-filter: blur(14px);
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
                }

                /* Status Chip Animations */
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(${DANGER_RED.slice(1).match(/.{2}/g).map(h => parseInt(h, 16)).join(',')}, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(${DANGER_RED.slice(1).match(/.{2}/g).map(h => parseInt(h, 16)).join(',')}, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(${DANGER_RED.slice(1).match(/.{2}/g).map(h => parseInt(h, 16)).join(',')}, 0); }
                }

                .pulse-animation {
                    animation: pulse 1.5s infinite;
                }

                /* Pill Filter Styling */
                .pill {
                    padding: 8px 18px;
                    background: ${isDarkMode ? '#4B5563' : '#eaf0ff'};
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    color: ${isDarkMode ? '#D1D5DB' : PRIMARY_BLUE};
                    transition: background 0.3s, color 0.3s, transform 0.2s;
                    font-size: 0.95rem;
                    white-space: nowrap;
                }
                .pill:hover {
                    background: ${isDarkMode ? '#6B7280' : LIGHT_BLUE};
                    color: white;
                }
                .pill.active {
                    background: ${PRIMARY_BLUE};
                    color: white;
                }
                .sortable {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .sortable:hover {
                    color: ${LIGHT_BLUE};
                }
                `}
            </style>
            
            <div style={isDarkMode ? {...styles.app, color: '#F9FAFB'} : styles.app}>
                <motion.nav 
                    className="sticky-navbar" 
                    style={dynamicNavStyle}
                >
                    <motion.div style={styles.logo} onClick={() => setActiveView('home')}>
                        Employer<span style={{ color: WARNING_YELLOW }}>Portal</span>
                    </motion.div>
                    
                    <div style={styles.navLinks}>
                        {['postings', 'candidates', 'analytics', 'inbox'].map(view => (
                            <span 
                                key={view}
                                className={`nav-link ${activeView === view ? 'nav-link-active' : ''}`} 
                                style={{...styles.navLink, color: dynamicNavColor, borderBottom: activeView === view ? `3px solid ${WARNING_YELLOW}` : 'none' }} 
                                onClick={() => setActiveView(view)}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </span>
                        ))}

                        {/* ⭐ 10: Notification Bell */}
                        <motion.button 
                            style={styles.notificationButton} 
                            onClick={() => setShowNotifications(prev => !prev)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Notifications"
                        >
                            <i className="fa-solid fa-bell" style={{color: dynamicNavColor}}></i>
                            {unreadNotificationsCount > 0 && (
                                <span style={styles.notificationBadge}>{unreadNotificationsCount}</span>
                            )}
                        </motion.button>

                        {/* ⭐ 9: Role Switcher (for demo only) */}
                        <select 
                            style={styles.roleSelect} 
                            value={userRole} 
                            onChange={(e) => setUserRole(e.target.value)}
                        >
                            {Object.values(ROLES).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>

                        <motion.button 
                            style={styles.darkModeToggle} 
                            onClick={toggleDarkMode}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Toggle Dark Mode"
                        >
                            <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"} style={{color: isDarkMode ? WARNING_YELLOW : dynamicNavColor}}></i>
                        </motion.button>
                    </div>
                </motion.nav>
                
                <main style={styles.main}>
                    <div className="container" style={styles.mainContentContainer}>
                        <div style={styles.mainContentArea}> 
                            <div style={{
                                ...styles.mainContent, 
                                background: isDarkMode ? '#374151' : '#FFFFFF', 
                                boxShadow: isDarkMode ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.04)',
                                color: isDarkMode ? '#F9FAFB' : DARK_NAVY,
                            }}>
                                <AnimatePresence mode="wait">
                                    {renderContent()}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Right Sidebar Summary */}
                        <div style={styles.rightSidebarArea}>
                            <RightSummaryBar />
                        </div>
                    </div>
                </main>
                
                <Footer isDarkMode={isDarkMode}/>

                {/* Candidate Detail Modal (⭐ 1, 2, 4, 5) */}
                <AnimatePresence>
                    {selectedCandidate && (
                        <CandidateDetailModal 
                            candidate={selectedCandidate} 
                            onClose={() => setSelectedCandidate(null)}
                            userRole={userRole}
                        />
                    )}
                </AnimatePresence>
                
                {/* Scroll to Top Button */}
                <AnimatePresence>
                    {showScroll && (
                        <motion.button 
                            onClick={scrollTop} 
                            style={styles.scrollToTopButton}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                            className="ripple"
                        >
                            <i className="fa-solid fa-arrow-up"></i>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Notification Modal (⭐ 10) */}
                <AnimatePresence>
                    {showNotifications && (
                        <NotificationCenterModal onClose={() => setShowNotifications(false)} />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

// --- Right Summary Bar (Kept and slightly updated) ---
const RightSummaryBar = () => {
    return (
        <motion.aside
            style={styles.rightSidebar}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        >
            <h3 style={styles.summaryTitle}><i className="fa-solid fa-bell" style={{ marginRight: '8px', color: WARNING_YELLOW }}></i> Quick Summary</h3>
            <div style={styles.sectionDividerShort}></div>

            {/* New Messages */}
            <motion.div whileHover={{ scale: 1.01 }} style={styles.summaryItemCard}>
                <h4 style={styles.summaryItemTitle}><i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i> New Messages</h4>
                <p style={styles.summaryItemValue}><span style={{ color: summaryData.newMessages > 0 ? SUCCESS_GREEN : SUBTLE_GRAY }}>{summaryData.newMessages}</span> unread</p>
            </motion.div>

            {/* Pending Offers */}
            <h4 style={styles.summarySectionTitle}><i className="fa-solid fa-handshake" style={{ marginRight: '8px' }}></i> Pending Offers ({summaryData.pendingOffers.length})</h4>
            {summaryData.pendingOffers.map((offer, i) => (
                <motion.div key={i} whileHover={{ scale: 1.01 }} style={styles.summaryItemDetail}>
                    <span style={styles.summaryDetailTitle}>{offer.name}</span>
                    <span style={styles.summaryDetailBadge}>{offer.role}</span>
                </motion.div>
            ))}

            {/* Upcoming Interviews */}
            <h4 style={styles.summarySectionTitle}><i className="fa-solid fa-calendar-alt" style={{ marginRight: '8px' }}></i> Upcoming Interviews ({summaryData.upcomingInterviews.length})</h4>
            {summaryData.upcomingInterviews.map((interview, i) => (
                <motion.div key={i} whileHover={{ scale: 1.01 }} style={styles.summaryItemDetail}>
                    <span style={styles.summaryDetailTitle}>{interview.name}</span>
                    <span style={styles.summaryDetailValue}>{interview.time}</span>
                </motion.div>
            ))}
            <button style={styles.summaryButton} className="ripple">View Full Calendar</button>
        </motion.aside>
    );
};


// --- Footer Component ---
const Footer = ({ isDarkMode }) => (
    <footer style={{...styles.footer, background: isDarkMode ? '#111827' : PRIMARY_BLUE}}>
        <div style={styles.footerContent}>
            <div style={styles.footerSections}>
                <div>
                    <h4 style={styles.footerHeading}>Employer<span style={{ color: WARNING_YELLOW }}>Portal</span></h4>
                    <p style={{...styles.footerText, color: isDarkMode ? '#9CA3AF' : '#E0E7EF'}}>Connecting **Talent** & Opportunity.</p>
                    <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
                        <i className="fa-brands fa-linkedin" style={styles.socialIcon}></i>
                        <i className="fa-brands fa-twitter" style={styles.socialIcon}></i>
                        <i className="fa-brands fa-facebook" style={styles.socialIcon}></i>
                    </div>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Posting</h4>
                    <a href="#new" style={styles.footerLink}>Post New Job</a>
                    <a href="#archive" style={styles.footerLink}>View Archive</a>
                    <a href="#reports" style={styles.footerLink}>Hiring Reports</a>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Candidates</h4>
                    <a href="#tracker" style={styles.footerLink}>Pipeline Tracker</a>
                    <a href="#offers" style={styles.footerLink}>Manage Offers</a>
                    <a href="#feedback" style={styles.footerLink}>Feedback Forms</a>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Account</h4>
                    <a href="#settings" style={styles.footerLink}>Company Profile</a>
                    <a href="#support" style={styles.footerLink}>Support</a>
                </div>
            </div>
            <div style={{...styles.footerCopyright, color: isDarkMode ? '#6B7280' : '#E0E7EF'}}>
                Employer Portal &copy; {new Date().getFullYear()}. All rights reserved.
            </div>
        </div>
    </footer>
);


// --- Styles (Finalized) ---
const styles = {
    // Shared Colors/Shadows
    shadowLg: "0 10px 25px rgba(0,0,0,0.12)",
    
    app: { minHeight: "100vh", width: "100vw", fontFamily: "Poppins, Arial, sans-serif", boxSizing: "border-box" },
    
    // Layout Fix: Main Content and Sidebar Container
    mainContentContainer: {
        maxWidth: "1300px", margin: "0 auto", padding: "0 20px", display: 'flex', gap: '25px', width: '100%', alignItems: 'flex-start',
    },
    mainContentArea: { flex: '3' }, 
    rightSidebarArea: { flex: '1', position: 'sticky', top: '75px', minWidth: '240px', maxWidth: '300px' }, 

    // Content Card Styling
    mainContent: { 
        width: "100%", 
        borderRadius: "18px", 
        padding: "3rem 3rem 2.5rem 3rem", 
        textAlign: "center", 
        boxSizing: 'border-box', 
        transition: 'background 0.3s, box-shadow 0.3s, color 0.3s' 
    },
    
    // Sidebar Summary Styles
    rightSidebar: {
        background: '#fff',
        padding: '20px',
        borderRadius: '18px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        textAlign: 'left',
    },
    summaryTitle: { fontSize: '1.2rem', color: PRIMARY_BLUE, fontWeight: 600, margin: '0 0 10px 0' },
    summarySectionTitle: { fontSize: '1.05rem', color: DARK_NAVY, fontWeight: 600, margin: '15px 0 8px 0' },
    summaryItemCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F0F6FF', padding: '12px', borderRadius: '10px', marginBottom: '8px' },
    summaryItemTitle: { margin: 0, color: PRIMARY_BLUE, fontWeight: 500, fontSize: '0.9rem' },
    summaryItemValue: { margin: 0, fontSize: '1.1rem', fontWeight: 700 },
    summaryItemDetail: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #E0E7EF', fontSize: '0.9rem' },
    summaryDetailTitle: { color: PRIMARY_BLUE, fontWeight: 500 },
    summaryDetailValue: { color: SUBTLE_GRAY, fontWeight: 600 },
    summaryDetailBadge: { 
        backgroundColor: '#E5FFF1', color: SUCCESS_GREEN, 
        padding: '2px 8px', borderRadius: '8px', 
        fontSize: '0.75rem', fontWeight: 700 
    },
    summaryButton: { ...{background: WARNING_YELLOW, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', marginTop: '15px', width: '100%'} },
    sectionDividerShort: { height: '1px', background: '#E0E7EF', margin: '5px 0 15px 0' },

    // Header/Navbar Styles 
    glassNav: { borderBottom: 'none', backdropFilter: 'blur(14px)', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' },
    navbar: { color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", height: '56px', padding: "0 2rem", width: "100vw", boxSizing: "border-box", transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
    logo: { fontSize: "1.8rem", fontWeight: 700, cursor: "pointer", transition: 'font-size 0.3s' },
    navLinks: { display: "flex", gap: "1.5rem", alignItems: 'center' },
    navLink: { cursor: "pointer", fontSize: "1.05rem", fontWeight: 500, padding: '0 5px', letterSpacing: '0.4px', transition: 'all 0.3s' },
    darkModeToggle: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '0.5rem' },
    notificationButton: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative', height: '30px', width: '30px' },
    notificationBadge: { position: 'absolute', top: '-2px', right: '-2px', backgroundColor: DANGER_RED, color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 700, lineHeight: 1 },
    roleSelect: { padding: '5px 10px', borderRadius: '8px', border: '1px solid #E0E7EF', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500, appearance: 'none', cursor: 'pointer' }, // ⭐ 9
    main: { padding: "4rem 0 2.5rem 0", boxSizing: 'border-box' },

    // Home/Global Spacing/Buttons
    homeContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3rem' },
    mainTitle: { fontSize: "3rem", fontWeight: 700, color: PRIMARY_BLUE, marginBottom: '0.75rem' },
    mainSubtitle: { color: LIGHT_BLUE, fontSize: "1.3rem", marginBottom: '2.5rem' },
    mainSearchBar: { marginTop: "2.5rem", display: "flex", gap: "1rem", justifyContent: "center", padding: "0.5rem 1rem", borderRadius: "40px", width: "100%", maxWidth: "680px", position: 'relative' },
    mainSearchInput: { flex: 1, border: "none", outline: "none", fontSize: "1.1rem", background: "transparent", color: PRIMARY_BLUE, padding: "0.7rem 0.6rem 0.7rem 1.2rem" },
    mainSearchButton: { background: PRIMARY_BLUE, color: "#fff", padding: "0.7rem 1.5rem", borderRadius: "25px", border: "none", cursor: "pointer", fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    upgradeButton: { background: LIGHT_BLUE, color: "#fff", border: "none", fontWeight: 600, padding: "0.8rem 1.8rem", borderRadius: "12px", cursor: "pointer", fontSize: "1.1rem", boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)" },
    loadMoreButton: { background: PRIMARY_BLUE, color: "#fff", border: "none", fontWeight: 600, padding: "0.8rem 1.8rem", borderRadius: "12px", cursor: "pointer", fontSize: "1.0rem", boxShadow: "0 4px 8px rgba(30, 64, 175, 0.3)" },
    actionButtonMain: { background: SUCCESS_GREEN, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' },

    metricsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' },
    metricCard: { background: "#F0F6FF", padding: "1.5rem", borderRadius: "18px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
    metricIconCircle: { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    metricTitle: { margin: 0, color: PRIMARY_BLUE, fontWeight: 600, fontSize: '1.1rem' },
    metricValue: { margin: '0.1rem 0 0 0', color: PRIMARY_BLUE, fontWeight: 800, fontSize: '1.8rem' },
    actionItemsContainer: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' },
    actionItemCard: { background: "#fff", padding: "1.2rem 1.5rem", borderRadius: "14px", border: '1px solid #E0E7EF', display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
    actionTitle: { margin: 0, color: PRIMARY_BLUE, fontWeight: 700, fontSize: '1.05rem' },
    actionDetail: { margin: '0.1rem 0 0 0', color: SUBTLE_GRAY, fontSize: '0.9rem' },
    headerContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
    sectionDivider: { height: '2px', width: '100%', background: 'linear-gradient(to right, #ffffff00, #C7D9F8, #ffffff00)', margin: '2rem 0 3rem' }, 
    viewTitle: { color: PRIMARY_BLUE, fontSize: "2.2rem", fontWeight: 800, margin: 0 },
    subtitleSmall: { display: 'block', fontSize: '0.85rem', fontWeight: 500, color: SUBTLE_GRAY, marginTop: '5px' },
    backButton: { padding: "8px 18px", borderRadius: "12px", border: "1px solid #3B82F6", color: PRIMARY_BLUE, background: "transparent", cursor: "pointer", fontSize: '15px', fontWeight: 600 },
    listContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", width: "100%", margin: "0 auto" },
    listContainerCol: { display: 'flex', flexDirection: 'column', gap: '1rem' }, // For Inbox

    // Job Card Hierarchy
    postingCard: { 
        background: "#FFFFFF", padding: "1.5rem", borderRadius: "10px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: '1px solid #E5E7EB',
        display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" 
    },
    cardTitle: { margin: 0, color: DARK_NAVY, fontWeight: 700, fontSize: '1.3rem' },
    cardSubtitle: { margin: '0.1rem 0 0 0', color: SUBTLE_GRAY, fontSize: '0.9rem' },
    postingStatPill: { background: '#F0F6FF', color: PRIMARY_BLUE, padding: "4px 10px", borderRadius: "20px", fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }, // ⭐ 7: New stat pill
    
    // Badge Styles
    jobTypePill: { background: "#F0F6FF", color: PRIMARY_BLUE, padding: "4px 12px", borderRadius: "6px", fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statusActivePill: { background: "#E5FFF1", color: SUCCESS_GREEN, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    statusPausedPill: { background: "#FFFBE6", color: WARNING_YELLOW, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    statusNewPillPulse: { background: "#FFE5E5", color: DANGER_RED, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem', position: 'relative' },
    statusScheduledPillGlow: { 
        background: "#E6F2FF", color: LIGHT_BLUE, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem',
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
    },
    statusOfferPill: { background: "#E5FFF1", color: SUCCESS_GREEN, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    
    actionButton: { background: 'none', border: '1px solid #3B82F6', color: '#3B82F6', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
    filterBar: { position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem', padding: '1rem 1.5rem', borderRadius: '18px', border: '1px solid #C7D9F8', boxSizing: 'border-box' },
    filterGroup: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
    filterSelect: { padding: '8px', borderRadius: '8px', border: '1px solid #C7D9F8', background: '#fff', zIndex: 10 },
    filterInput: { flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #C7D9F8', background: '#fff', minWidth: '150px' },
    saveFilterButton: { background: WARNING_YELLOW, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }, // ⭐ 8
    savedFiltersContainer: { display: 'flex', gap: '8px', margin: '0 0 1rem 0', flexWrap: 'wrap', alignItems: 'center' }, // ⭐ 8
    pipelineTableContainer: { overflowX: 'auto', borderRadius: '14px', border: '1px solid #E5E7EB' },
    pipelineTable: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '700px' },
    pipelineTh: { backgroundColor: '#F0F6FF', color: PRIMARY_BLUE, padding: '15px', textAlign: 'left', fontWeight: 700, fontSize: '0.95rem' },
    pipelineTr: { transition: 'background-color 0.2s, transform 0.2s' },
    pipelineTrHover: { backgroundColor: '#F7FAFF', transform: 'scale(1.005)' },
    pipelineTd: { padding: '15px', borderBottom: '1px solid #E5E7EB', color: SUBTLE_GRAY, fontSize: '0.95rem', display: 'table-cell', verticalAlign: 'middle' },
    pipelineActionButton: { background: 'none', border: 'none', color: LIGHT_BLUE, cursor: 'pointer', fontSize: '1rem', marginLeft: '5px' },
    emptyStateContainer: { padding: '40px 0', border: '2px dashed #C7D9F8', borderRadius: '14px', margin: '2rem auto', maxWidth: '400px' },
    emptyStateIcon: { fontSize: '3rem', color: LIGHT_BLUE, marginBottom: '15px' },
    emptyStateTitle: { fontSize: '1.5rem', color: PRIMARY_BLUE, fontWeight: 700, margin: '0 0 10px 0' },
    emptyStateMessage: { color: SUBTLE_GRAY, marginBottom: '20px' },
    footer: { color: "#D1D5DB", padding: "3rem 0", textAlign: "left", marginTop: "2rem", transition: 'background 0.3s' },
    footerContent: { width: "100%", maxWidth: "1100px", margin: "0 auto", padding: '0 20px' },
    footerSections: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #4B5563' },
    footerHeading: { color: '#F9FAFB', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', marginTop: 0 },
    footerLink: { color: "#9CA3AF", textDecoration: "none", display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', transition: "color 0.2s" },
    socialIcon: { fontSize: '1.5rem', color: '#9CA3AF', cursor: 'pointer', transition: 'color 0.2s' },
    footerCopyright: { textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' },
    scrollToTopButton: { position: 'fixed', bottom: '2rem', right: '2rem', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: LIGHT_BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', zIndex: 1000 },
    
    // Modal Styles (Candidate Detail)
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1002, backdropFilter: 'blur(4px)' },
    modalContent: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    modalTitle: { color: PRIMARY_BLUE, fontWeight: 800, margin: 0, fontSize: '1.8rem' },
    modalSubtitle: { color: DARK_NAVY, fontWeight: 700, margin: '10px 0', fontSize: '1.3rem' },
    modalCloseButton: { background: 'none', border: 'none', fontSize: '1.5rem', color: SUBTLE_GRAY, cursor: 'pointer' },
    descriptionText: { lineHeight: 1.6, color: SUBTLE_GRAY },
    
    // AI Analysis Metrics (⭐ 1)
    aiMetricsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
    aiMetricCard: { background: '#F9FAFB', padding: '15px', borderRadius: '10px', borderLeft: '4px solid', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    
    // Offer Management (⭐ 4)
    offerStatusContainer: { background: '#FFFBE6', border: `1px solid ${WARNING_YELLOW}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' },
    offerActions: { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
    offerActionButton: { background: DANGER_RED, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    interviewActionButton: { background: LIGHT_BLUE, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem' }, // ⭐ 2
    
    // Candidate Timeline (⭐ 5)
    timelineContainer: { maxHeight: '250px', overflowY: 'auto', paddingLeft: '20px', position: 'relative' },
    timelineItem: { position: 'relative', paddingBottom: '20px', paddingLeft: '30px', borderLeft: `2px solid ${PRIMARY_BLUE}`, marginLeft: '-1px' },
    timelineDot: { position: 'absolute', left: '-7px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PRIMARY_BLUE, border: '2px solid #fff', boxShadow: '0 0 0 3px #fff' },
    timelineContent: { background: '#F7FAFF', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    timelineDate: { margin: 0, fontSize: '0.8rem', color: PRIMARY_BLUE, fontWeight: 600 },
    timelineActivity: { margin: '5px 0 0 0', fontSize: '0.95rem', color: DARK_NAVY },

    // Analytics Dashboard (⭐ 6)
    chartCard: { background: '#fff', padding: '20px', borderRadius: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginTop: '25px', border: '1px solid #E0E7EF' },
    chartTitle: { fontSize: '1.2rem', color: PRIMARY_BLUE, fontWeight: 700, margin: '0 0 20px 0' },
    chartContainer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', padding: '0 10px', borderBottom: '1px solid #E0E7EF' },
    chartColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', minWidth: '40px' },
    chartBar: { width: '80%', background: LIGHT_BLUE, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' },
    chartValue: { fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 600, marginTop: '5px' },
    chartLabel: { fontSize: '0.75rem', color: SUBTLE_GRAY, marginTop: '5px' },

    // Inbox Styles (⭐ 3)
    inboxItem: { display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '10px', border: '1px solid #E0E7EF', cursor: 'pointer', transition: 'all 0.3s' },
    inboxSender: { margin: 0, fontSize: '1.05rem', color: DARK_NAVY },
    inboxSubject: { margin: '0 0 5px 0', fontSize: '0.95rem', color: PRIMARY_BLUE },
    inboxPreview: { margin: 0, fontSize: '0.9rem', color: SUBTLE_GRAY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    inboxTimestamp: { fontSize: '0.8rem', color: SUBTLE_GRAY, minWidth: '80px', textAlign: 'right' },
    emailInput: { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #E0E7EF', borderRadius: '8px', boxSizing: 'border-box' },
    emailTextarea: { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #E0E7EF', borderRadius: '8px', boxSizing: 'border-box', minHeight: '150px', resize: 'vertical' },

    // Notification Modal (⭐ 10)
    notificationModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent', zIndex: 1003 },
    notificationModalContent: { position: 'absolute', top: '65px', right: '20px', width: '350px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', padding: '15px', zIndex: 1004 },
    notificationItem: { display: 'flex', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #F0F6FF', cursor: 'pointer', transition: 'background-color 0.1s' }
};

export default EmployerDashboard;