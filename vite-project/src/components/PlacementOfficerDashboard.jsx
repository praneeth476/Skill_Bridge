import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// --- Global Constants & Colors (Synced with Employer Portal) ---
const PRIMARY_BLUE = "#1D4ED8";
const LIGHT_BLUE = "#3B82F6"; 
const DARK_NAVY = "#0F172A"; 
const SUBTLE_GRAY = "#6B7280";
const SUCCESS_GREEN = "#10B981";
const WARNING_YELLOW = "#F59E0B";
const DANGER_RED = "#EF4444";
const BORDER_COLOR = '#E0E7FF'; // Light blue border for glass effect

// --- Role-Based Access Control (RBAC) Data ---
const PO_ROLES = {
    ADMIN: 'Admin',
    PLACEMENT_OFFICER: 'Placement Officer',
    FACULTY_COORDINATOR: 'Faculty Coordinator',
};
const defaultUserRole = PO_ROLES.PLACEMENT_OFFICER;

// --- Placement Portal Data Structures ---

const sidebarLinks = [
    { id: 'dashboard', icon: "fa-solid fa-gauge", label: "Dashboard" },
    { id: 'students', icon: "fa-solid fa-users", label: "Student Management" },
    { id: 'companies', icon: "fa-solid fa-building", label: "Company Management" },
    { id: 'scheduling', icon: "fa-solid fa-calendar-days", label: "Interview Scheduling" },
    { id: 'communication', icon: "fa-solid fa-comments", label: "Communication" },
    { id: 'feedback', icon: "fa-solid fa-star", label: "Feedback & Evaluation" },
    { id: 'reports', icon: "fa-solid fa-chart-column", label: "Reports & Analytics" },
];

const poMetrics = [
    { title: "Active Drives", value: 12, icon: "fa-solid fa-briefcase", color: PRIMARY_BLUE, growth: "+12%" },
    { title: "New Registrations", value: 65, icon: "fa-solid fa-user-plus", color: SUCCESS_GREEN, growth: "+25%" },
    { title: "Upcoming Interviews", value: 15, icon: "fa-solid fa-calendar-alt", color: WARNING_YELLOW, growth: "-5%" },
    { title: "Offers Accepted", value: 5, icon: "fa-solid fa-handshake", color: SUCCESS_GREEN, growth: "+40%" },
];

const companyDrives = [
    { id: 1, name: "TechCorp Solutions", role: "Software Engineer", location: "Remote", status: "Active", studentsApplied: 85, offersMade: 4, date: "Dec 10", views: 1200, conversion: '7.1%' },
    { id: 2, name: "Global Finance Inc.", role: "Financial Analyst", location: "New York, NY", status: "Active", studentsApplied: 42, offersMade: 0, date: "Dec 15", views: 600, conversion: '7.0%' },
    { id: 3, name: "Design Studio X", role: "UX/UI Intern", location: "Mumbai", status: "Paused", studentsApplied: 18, offersMade: 2, date: "Nov 28", views: 350, conversion: '5.1%' },
];

const studentPipeline = [
    { 
        id: 301, name: "Priya Sharma", branch: "CS", cgpa: 9.2, status: "Offered", lastActivity: "1d ago", drive: "TechCorp Solutions",
        academicScore: 95, skillMatch: 90, projectQuality: 88, offerStatus: "Accepted", salary: "₹12 LPA",
        timeline: [
            { date: "2025-11-01", activity: "Registered for Placement Drive" },
            { date: "2025-11-20", activity: "Applied to TechCorp Solutions" },
            { date: "2025-12-01", activity: "Final Interview (Success)" },
            { date: "2025-12-05", activity: "Offer Accepted (TechCorp)" },
        ]
    },
    { 
        id: 302, name: "Rahul Verma", branch: "IT", cgpa: 7.8, status: "Interviewing", lastActivity: "5m ago", drive: "Global Finance Inc.",
        academicScore: 80, skillMatch: 75, projectQuality: 70, offerStatus: "N/A", salary: null,
        timeline: [
            { date: "2025-11-05", activity: "Registered for Placement Drive" },
            { date: "2025-12-10", activity: "Interview Scheduled: Global Finance Inc." },
        ]
    },
    { 
        id: 303, name: "Sneha Patel", branch: "ECE", cgpa: 8.5, status: "Applied", lastActivity: "2h ago", drive: "Design Studio X",
        academicScore: 85, skillMatch: 82, projectQuality: 80, offerStatus: "N/A", salary: null,
        timeline: [
            { date: "2025-11-08", activity: "Applied to Design Studio X" },
        ]
    },
];

const reportsData = {
    placementRate: 0.85, 
    avgSalary: 8.5, 
    companiesByType: [
        { type: 'Tech', count: 70 },
        { type: 'Finance', count: 40 },
        { type: 'Design', count: 20 },
    ],
    studentSatisfaction: 4.5, 
    driveTrends: [15, 22, 18, 30, 25, 40, 50] 
};
const studentStages = ["All Stages", "Applied", "Screening", "Interviewing", "Offered", "Rejected"];

const savedFilters = [
    { id: 1, name: 'CS 8+ CGPA', status: 'Applied', search: 'CS' },
    { id: 2, name: 'Interviewing Now', status: 'Interviewing', search: '' },
];


// Motion Variants (6️⃣ Smooth Page Transition)
const springVariants = {
    initial: { opacity: 0, y: 15 }, 
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// --- Utility Components ---

// 🔟 Skeleton Loading Component
const SkeletonLoader = () => (
    <div style={styles.skeletonContainer} className="animate-pulse-skeleton">
        <div style={{...styles.skeletonItem, width: '60%', height: '30px', marginBottom: '20px'}}></div>
        <div style={styles.metricsArea}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={styles.metricSkeleton}>
                    <div style={{...styles.skeletonItem, width: '40%', height: '15px', marginBottom: '10px'}}></div>
                    <div style={{...styles.skeletonItem, width: '70%', height: '40px'}}></div>
                </div>
            ))}
        </div>
        <div style={{...styles.skeletonItem, width: '100%', height: '300px', marginTop: '30px'}}></div>
    </div>
);


// 5️⃣ Top Navbar Component
const TopNavbar = ({ userRole }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadNotificationsCount = 3;

    return (
        <div style={styles.topNavbar}>
            <div style={styles.navbarGreeting}>
                Hello, **{userRole}**! Welcome to SkillBridge.
            </div>
            <div style={styles.navbarActions}>
                 {/* Notifications */}
                <motion.button 
                    style={styles.notificationButton} 
                    onClick={() => setShowNotifications(prev => !prev)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Platform Alerts"
                >
                    <i className="fa-solid fa-bell" style={{color: PRIMARY_BLUE}}></i>
                    {unreadNotificationsCount > 0 && (
                        <span style={styles.notificationBadge}>{unreadNotificationsCount}</span>
                    )}
                </motion.button>
                
                {/* Profile Avatar */}
                <div style={styles.profileAvatar} onClick={() => alert("Profile Settings clicked")}>
                    <i className="fa-solid fa-user-circle" style={{fontSize: '1.5rem'}}></i>
                </div>

                {/* Settings */}
                <motion.button 
                    style={styles.settingsButton} 
                    onClick={() => alert("Settings clicked")}
                    whileHover={{ rotate: 90 }}
                >
                    <i className="fa-solid fa-cog" style={{color: PRIMARY_BLUE}}></i>
                </motion.button>
            </div>

            <AnimatePresence>
                {showNotifications && (
                    <NotificationCenterModal onClose={() => setShowNotifications(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

// Simplified Metric Card for non-dashboard views
const MetricCardSimple = ({ title, value, color }) => (
    <div style={{ ...styles.aiMetricCard, borderLeft: `4px solid ${color}` }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: SUBTLE_GRAY }}>{title}</p>
        <h4 style={{ margin: '5px 0 0 0', color: color, fontWeight: 800, fontSize: '1.4rem' }}>{value}</h4>
    </div>
);

// 8️⃣ Metric Card with Growth Indicator for Dashboard
const MetricCard = ({ metric }) => {
    const isPositive = metric.growth.startsWith('+');
    const growthColor = isPositive ? SUCCESS_GREEN : DANGER_RED;
    const icon = isPositive ? "fa-solid fa-arrow-up" : "fa-solid fa-arrow-down";

    return (
        <motion.div
            style={styles.metricCard}
            whileHover={{ translateY: -5, boxShadow: styles.shadowXl }} 
        >
            <div style={styles.metricTitleContainer}>
                <div style={styles.metricTitle}><i className={metric.icon} style={{marginRight: '8px', color: metric.color}}></i>{metric.title}</div>
                <div style={styles.metricValue}>{metric.value}</div>
            </div>
            
            {/* Growth Indicator (8️⃣) */}
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                <i className={icon} style={{ color: growthColor, marginRight: '5px', fontSize: '0.8rem' }}></i>
                <span style={{ color: growthColor, fontWeight: 600, fontSize: '0.9rem' }}>{metric.growth}</span>
                <span style={{ color: SUBTLE_GRAY, fontSize: '0.85rem', marginLeft: '5px' }}>vs. last month</span>
            </div>
        </motion.div>
    );
};

// Student Detail Modal (Includes ⭐ 1, 4, 5)
const StudentDetailModal = ({ student, onClose, userRole }) => { 
    const isOfferManagementAllowed = [PO_ROLES.ADMIN, PO_ROLES.PLACEMENT_OFFICER].includes(userRole);

    const getOfferStatusStyle = (status) => {
        if (status.includes('Accepted')) return { color: SUCCESS_GREEN, fontWeight: 700 };
        if (status.includes('Pending')) return { color: WARNING_YELLOW, fontWeight: 700 };
        if (status.includes('Rejected')) return { color: DANGER_RED, fontWeight: 700 };
        return { color: SUBTLE_GRAY };
    };

    const handleOfferAction = (action) => {
        if (!isOfferManagementAllowed) {
            alert("Permission Denied: Only Placement Officers and Admin can manage offers.");
            return;
        }
        alert(`${action} action logged for ${student.name}.`);
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
                        <h2 style={styles.modalTitle}><i className="fa-solid fa-user-graduate" style={{ marginRight: '10px' }}></i>Student: {student.name}</h2>
                        <button style={styles.modalCloseButton} onClick={onClose}><i className="fa-solid fa-times"></i></button>
                    </div>
                    <p style={styles.descriptionText}>Branch: **{student.branch}** | CGPA: **{student.cgpa}** | Current Drive: **{student.drive}**</p>
                    
                    {/* Student Profile Audit (⭐ 1) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-clipboard-check" style={{ marginRight: '8px', color: LIGHT_BLUE }}></i> Profile Audit Score</h3>
                    <div style={styles.aiMetricsContainer}>
                        <MetricCardSimple title="Academic Score" value={`${student.academicScore}%`} color={SUCCESS_GREEN} />
                        <MetricCardSimple title="Skill Match (Drive)" value={`${student.skillMatch}%`} color={PRIMARY_BLUE} />
                        <MetricCardSimple title="Project Quality" value={`${student.projectQuality}%`} color={WARNING_YELLOW} />
                        <MetricCardSimple title="Eligibility" value={student.cgpa >= 8.0 ? "Eligible" : "Pending"} color={student.cgpa >= 8.0 ? SUCCESS_GREEN : DANGER_RED} />
                    </div>

                    {/* Offer Tracking (⭐ 4) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-trophy" style={{ marginRight: '8px', color: WARNING_YELLOW }}></i> Offer Tracking</h3>
                    <div style={styles.offerStatusContainer}>
                        <p style={{...styles.descriptionText, margin: 0}}>Status: <span style={getOfferStatusStyle(student.offerStatus)}>**{student.offerStatus}**</span></p>
                        {student.salary && <p style={{...styles.descriptionText, margin: 0}}>Offered Salary: **{student.salary}**</p>}
                        <div style={styles.offerActions}>
                            <button 
                                style={{...styles.offerActionButton, background: SUCCESS_GREEN}} 
                                className="ripple" 
                                onClick={() => handleOfferAction('Log Offer Accepted')}
                                disabled={!isOfferManagementAllowed}
                            >
                                <i className="fa-solid fa-check"></i> Log Accepted
                            </button>
                            <button 
                                style={{...styles.offerActionButton, background: DANGER_RED}} 
                                className="ripple"
                                onClick={() => handleOfferAction('Log Offer Rejected')}
                                disabled={!isOfferManagementAllowed}
                            >
                                <i className="fa-solid fa-times"></i> Log Rejected
                            </button>
                        </div>
                        {!isOfferManagementAllowed && <p style={{ color: DANGER_RED, fontSize: '0.9rem', marginTop: '10px' }}>*Requires Placement Officer/Admin role to act.</p>}
                    </div>

                    {/* Drive Scheduling (⭐ 2) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-calendar-alt" style={{ marginRight: '8px', color: PRIMARY_BLUE }}></i> Drive Scheduling</h3>
                    <div style={styles.offerActions}>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Scheduling Interview for ${student.name} with ${student.drive}`)}><i className="fa-solid fa-calendar-plus"></i> Schedule Interview</button>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Sending Drive Update to ${student.name}`)}><i className="fa-solid fa-paper-plane"></i> Send Drive Update</button>
                        <button style={styles.interviewActionButton} className="ripple" onClick={() => alert(`Generating Admit Card for ${student.name}`)}><i className="fa-solid fa-ticket-alt"></i> Generate Admit Card</button>
                    </div>

                    {/* Student Activity Timeline (⭐ 5) */}
                    <div style={styles.sectionDividerShort}></div>
                    <h3 style={styles.modalSubtitle}><i className="fa-solid fa-history" style={{ marginRight: '8px', color: DARK_NAVY }}></i> Activity Timeline</h3>
                    <div style={styles.timelineContainer}>
                        {student.timeline.map((item, index) => (
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

// 9️⃣ Chart Component (Simplified Bar Chart)
const ChartComponent = ({ data, chartTitle, color = PRIMARY_BLUE }) => {
    const maxCount = Math.max(...data.map(d => d.value));
    
    return (
        <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>{chartTitle}</h3>
            <div style={styles.chartContainer}>
                {data.map((item, index) => (
                    <div key={index} style={styles.chartColumn}>
                        <div style={{ 
                            ...styles.chartBar, 
                            height: `${(item.value / maxCount) * 100}%`, 
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}80` 
                        }}></div>
                        <span style={styles.chartValue}>{item.value}</span>
                        <span style={styles.chartLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// 6️⃣/9️⃣ Reports & Analytics View (Enhanced with Charts)
const ReportsView = ({ onBack, reportsData }) => {
    
    const trendData = reportsData.driveTrends.map((value, i) => ({
        label: `Week ${i + 1}`,
        value: value,
    }));

    const statusData = reportsData.companiesByType.map(c => ({
        label: c.type,
        value: c.count,
    }));
    
    return (
        <motion.div
            key="reports"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Reports & Placement Analytics <i className="fa-solid fa-chart-column" style={{ color: PRIMARY_BLUE, marginLeft: '10px' }}></i>
                    <small style={styles.subtitleSmall}>Track placement success, salaries, and company engagement.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Dashboard</button>
            </div>
            <div style={styles.divider}></div>

            {/* Top Metrics */}
            <div style={styles.metricsArea}>
                <MetricCardSimple title="Placement Rate" value={`${(reportsData.placementRate * 100).toFixed(0)}%`} color={SUCCESS_GREEN} />
                <MetricCardSimple title="Average Salary (LPA)" value={`₹${reportsData.avgSalary.toFixed(1)}`} color={PRIMARY_BLUE} />
                <MetricCardSimple title="Student Satisfaction" value={`${reportsData.studentSatisfaction}/5.0`} color={WARNING_YELLOW} />
                <MetricCardSimple title="Total Drives Held" value="35" color={DARK_NAVY} />
            </div>

            <div style={styles.chartGrid}>
                 {/* Chart 1: Registration Trends */}
                <ChartComponent 
                    data={trendData}
                    chartTitle="Weekly Student Registrations (Last 7 Weeks)"
                    color={LIGHT_BLUE}
                />

                {/* Chart 2: Company Distribution */}
                <ChartComponent 
                    data={statusData}
                    chartTitle="Registered Companies by Industry Type"
                    color={WARNING_YELLOW}
                />
            </div>
        </motion.div>
    );
};

// 3️⃣ Communication View
const CommunicationView = ({ onBack }) => {
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [messages] = useState([
        { id: 1, sender: "TechCorp Solutions (HR)", subject: "Confirmation for Dec 10 Drive Slots", preview: "Please confirm the 10 student slots for the first round of technical interviews...", timestamp: "3 min ago", unread: true },
        { id: 2, sender: "Priya Sharma (Student)", subject: "Query regarding Resume Upload", preview: "I am having trouble uploading my latest resume. Can you please check the portal access?", timestamp: "2h ago", unread: false },
        { id: 3, sender: "Faculty, CS Dept.", subject: "Feedback on SkillBridge Platform", preview: "The new skill assessment feature looks great, but some students reported an issue with...", timestamp: "1 day ago", unread: true },
    ]);

    return (
        <motion.div
            key="communication"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Communication Hub <i className="fa-solid fa-comments" style={{ color: PRIMARY_BLUE, marginLeft: '10px' }}></i>
                    <small style={styles.subtitleSmall}>Manage official correspondence with students, faculty, and companies.</small>
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={styles.actionButtonMain} className="ripple" onClick={() => setIsComposeModalOpen(true)}><i className="fa-solid fa-plus"></i> Compose</button>
                    <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Dashboard</button>
                </div>
            </div>
            <div style={styles.divider}></div>

            <div style={styles.listContainerCol}>
                {messages.map(msg => (
                    <motion.div 
                        key={msg.id} 
                        style={{...styles.inboxItem, fontWeight: msg.unread ? 700 : 400, background: msg.unread ? '#F0F6FF' : 'rgba(255, 255, 255, 0.9)'}}
                        whileHover={{ translateY: -3, boxShadow: styles.shadowLg }}
                        onClick={() => alert(`Opening message from: ${msg.sender}.`)}
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
            </div>

            {isComposeModalOpen && <ComposeEmailModal onClose={() => setIsComposeModalOpen(false)} />}
        </motion.div>
    );
};

// Compose Email Modal (Simplified)
const ComposeEmailModal = ({ onClose }) => {
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <motion.div 
                style={{...styles.modalContent, maxWidth: '600px', padding: '1.5rem'}}
                initial={{ scale: 0.8 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={styles.modalSubtitle}>Compose Platform Message</h3>
                <select style={styles.emailInput} defaultValue="">
                    <option value="" disabled>Select Recipient Type (e.g., All Students, Specific Company)</option>
                    <option value="student">All Eligible Students (CS/IT)</option>
                    <option value="company">TechCorp Solutions HR</option>
                    <option value="faculty">CS Department Faculty</option>
                </select>
                <input style={styles.emailInput} placeholder="Subject" />
                <textarea style={styles.emailTextarea} placeholder="Message Body..."></textarea>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                    <button style={styles.actionButtonMain} className="ripple" onClick={() => { alert("Message sent (mock action)."); onClose(); }}><i className="fa-solid fa-paper-plane"></i> Send Message</button>
                </div>
            </motion.div>
        </div>
    );
};

// Company Card (Includes ⭐ 7)
const CompanyCard = ({ drive, onClick }) => { 
    return (
        <motion.div
            className="card card-hover ripple"
            variants={springVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={styles.postingCard} 
            whileHover={{ translateY: -5, boxShadow: styles.shadowXl }} 
            onClick={() => onClick(drive)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={styles.cardTitle}>{drive.name}</h3>
                    <p style={styles.cardSubtitle}>Role: {drive.role} · {drive.location}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.8rem' }}> 
                        <span style={styles.postingStatPill}><i className="fa-solid fa-users"></i> **{drive.studentsApplied} Applied**</span>
                        <span style={styles.postingStatPill}><i className="fa-solid fa-handshake"></i> **{drive.offersMade} Offers**</span>
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <motion.span style={drive.status === 'Active' ? styles.statusActivePill : styles.statusPausedPill}>
                    {drive.status}
                </motion.span>
                <motion.button 
                    style={styles.actionButton} 
                    className="ripple"
                    whileHover={{ scale: 1.05 }} 
                    onClick={(e) => { e.stopPropagation(); alert(`Managing ${drive.name} drive...`) }}
                >
                    Manage <i className="fa-solid fa-edit"></i>
                </motion.button>
            </div>
        </motion.div>
    );
};

// Company Management View
const CompanyManagementView = ({ onBack, onSelectCompany }) => {
    return (
        <motion.div
            key="companies"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Company Drive Management
                    <small style={styles.subtitleSmall}>Oversee active and archived hiring drives.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Dashboard</button>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.listContainer}>
                <AnimatePresence>
                    {companyDrives.map(drive => (
                        <CompanyCard key={drive.id} drive={drive} onClick={onSelectCompany} />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// Student Management View (Includes ⭐ 8)
const StudentManagementView = ({ onBack, onSelectStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Stages');
    const [appliedFilter, setAppliedFilter] = useState(null);

    const getStatusStyle = (status) => {
        if (status.includes('Offered')) return styles.statusOfferPill;
        if (status.includes('Interviewing')) return styles.statusScheduledPillGlow;
        if (status.includes('Applied')) return styles.jobTypePill;
        return styles.statusPausedPill;
    }

    const filteredStudents = useMemo(() => {
        let students = studentPipeline;

        if (statusFilter !== 'All Stages') {
            students = students.filter(s => s.status === statusFilter);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            students = students.filter(s => 
                s.name.toLowerCase().includes(lowerCaseSearch) ||
                s.branch.toLowerCase().includes(lowerCaseSearch) ||
                s.drive.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return students;
    }, [statusFilter, searchTerm]);

    const handleSaveFilter = () => {
        const filterName = prompt("Enter a name for your saved filter (e.g., CS 8+ CGPA):");
        if (filterName) {
            alert(`Filter "${filterName}" saved!`);
            setAppliedFilter({ id: Date.now(), name: filterName, status: statusFilter, search: searchTerm });
        }
    };
    
    const handleApplySavedFilter = (filter) => {
        setStatusFilter(filter.status);
        setSearchTerm(filter.name.includes('CS') ? 'CS' : '');
        setAppliedFilter(filter);
    };

    return (
        <motion.div
            key="students"
            variants={springVariants} 
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>
                    Student Management Tracker
                    <small style={styles.subtitleSmall}>View student profiles and placement activity.</small>
                </h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Dashboard</button>
            </div>
            <div style={styles.divider}></div>
            
            {/* Filtering and Search Bar (⭐ 8) */}
            <motion.div 
                style={styles.filterBar} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
            >
                <div style={styles.filterGroup}>
                    <span style={{ fontWeight: 600, color: PRIMARY_BLUE }}>Filter Status:</span>
                    <select style={styles.filterSelect} onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
                        {studentStages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                </div>

                <div style={{...styles.filterGroup, flex: 1, minWidth: '250px'}}>
                    <span style={{ fontWeight: 600, color: PRIMARY_BLUE, marginRight: '10px' }}>Search:</span>
                    <input 
                        style={styles.filterInput}
                        placeholder="Search name, branch, or company..."
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
                <span style={{ fontWeight: 600, color: PRIMARY_BLUE, marginRight: '10px' }}>Quick Filters:</span>
                {savedFilters.map(filter => (
                    <motion.span 
                        key={filter.id}
                        className={`pill ${appliedFilter && appliedFilter.id === filter.id ? 'active' : ''}`}
                        onClick={() => handleApplySavedFilter(filter)}
                        whileHover={{ scale: 1.05 }}
                    >
                        {filter.name}
                    </motion.span>
                ))}
            </div>

            <p style={{...styles.welcome, marginBottom: '1.5rem', marginTop: '1rem'}}>Showing **{filteredStudents.length}** students matching criteria.</p>
            
            <div style={styles.pipelineTableContainer}>
                <table style={styles.pipelineTable}>
                    <thead>
                        <tr>
                            <th style={styles.pipelineTh}>Student Name</th>
                            <th style={styles.pipelineTh}>Branch / CGPA</th>
                            <th style={styles.pipelineTh}>Applied Company</th>
                            <th style={styles.pipelineTh}>Current Status</th>
                            <th style={styles.pipelineTh}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredStudents.length > 0 ? filteredStudents.map((s, i) => (
                                <motion.tr 
                                    key={s.id} 
                                    style={styles.pipelineTr}
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td style={styles.pipelineTd}><i className="fa-solid fa-user-circle" style={{ marginRight: '8px', color: '#9CA3AF' }}></i>{s.name}</td>
                                    <td style={styles.pipelineTd}>{s.branch} ({s.cgpa})</td>
                                    <td style={styles.pipelineTd}>{s.drive}</td>
                                    <td style={styles.pipelineTd}>
                                        <span style={getStatusStyle(s.status)}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td style={styles.pipelineTd}>
                                        <button style={styles.pipelineActionButton} title="View Profile" onClick={() => onSelectStudent(s)}><i className="fa-solid fa-eye"></i></button>
                                        <button style={styles.pipelineActionButton} title="Log Placement Status" onClick={() => alert(`Logging status for ${s.name}...`)}><i className="fa-solid fa-clipboard-list"></i></button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr><td colSpan="5" style={{...styles.pipelineTd, textAlign: 'center', padding: '3rem 0'}}>
                                    <h3 style={styles.emptyStateTitle}>No Students Match Filter</h3>
                                    <p style={styles.emptyStateMessage}>Try broadening your search criteria.</p>
                                </td></tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

// Placeholder View
const PlaceholderView = ({ title }) => (
    <div style={styles.placeholderContainer}>
        <div style={styles.heading}>{title}</div>
        <hr style={styles.divider} />
        <div style={styles.placeholderContent}>
            <h3 style={{color: PRIMARY_BLUE, fontWeight: 700}}>Coming Soon!</h3>
            <p style={{color: SUBTLE_GRAY}}>Functionality and dedicated content for **{title}** will be fully implemented here, including dynamic forms, data tables, and integrated workflows.</p>
            <i className="fa-solid fa-cogs" style={{fontSize: '3rem', color: LIGHT_BLUE, marginTop: '20px'}}></i>
        </div>
    </div>
);

// ⭐ 10: Notification System
const NotificationCenterModal = ({ onClose }) => {
    const notifications = [
        { id: 1, message: "New Company: GenZ Systems registered for a drive.", time: "1 hour ago", icon: "fa-building", color: PRIMARY_BLUE },
        { id: 2, message: "TechCorp Solutions: Interview feedback submitted for 10 students.", time: "3 hours ago", icon: "fa-star", color: WARNING_YELLOW },
        { id: 3, message: "Priya Sharma accepted the offer from TechCorp.", time: "1 day ago", icon: "fa-check-circle", color: SUCCESS_GREEN },
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
                <h3 style={styles.summaryTitle}><i className="fa-solid fa-bell" style={{ marginRight: '8px' }}></i> Platform Alerts</h3>
                <div style={styles.sectionDividerShort}></div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                        <div key={n.id} style={styles.notificationItem} onClick={() => alert(`Clicked alert: ${n.message}`)} className="ripple">
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


// --- Dashboard Main Component ---
const PlacementOfficerDashboard = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [userRole, setUserRole] = useState(defaultUserRole);
    const [selectedStudent, setSelectedStudent] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); // 🔟 Skeleton Loading State

    // Simulate loading data
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); 
        return () => clearTimeout(timer);
    }, [activeView]); 

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonLoader />; // 🔟 Show Skeleton while loading
        }
        
        switch (activeView) {
            case 'students':
                return <StudentManagementView onBack={() => setActiveView('dashboard')} onSelectStudent={setSelectedStudent} />;
            case 'companies':
                return <CompanyManagementView onBack={() => setActiveView('dashboard')} onSelectCompany={setSelectedStudent} />; 
            case 'communication':
                return <CommunicationView onBack={() => setActiveView('dashboard')} />;
            case 'reports':
                return <ReportsView onBack={() => setActiveView('dashboard')} reportsData={reportsData} />;
            case 'feedback':
                return <PlaceholderView title="Feedback & Evaluation" />;
            case 'scheduling':
                return <PlaceholderView title="Interview Scheduling" />;
            default:
                return <DashboardView poMetrics={poMetrics} />;
        }
    };

    const activeLink = sidebarLinks.find(l => l.id === activeView);
    const activeLabel = activeLink ? activeLink.label : 'Dashboard';

    return (
        <>
            <style>
                {`
                /* Global CSS for shadows and animations */
                html, body, #root {
                    width: 100vw;
                    min-height: 100vh;
                    padding: 0; margin: 0;
                    color: ${DARK_NAVY};
                }
                .ripple:active { transform: scale(0.98); transition:0.1s;}
                
                .pill {
                    padding: 6px 14px;
                    background: #eaf0ff;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    color: ${PRIMARY_BLUE};
                    transition: all 0.3s;
                    font-size: 0.9rem;
                    white-space: nowrap;
                }
                .pill:hover { background: ${LIGHT_BLUE}; color: white; }
                .pill.active { background: ${PRIMARY_BLUE}; color: white; }
                
                /* 10. Skeleton Animation */
                @keyframes pulse-skeleton {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse-skeleton {
                    animation: pulse-skeleton 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                `}
            </style>
            
            {/* 7️⃣ Gradient Background applied to app container */}
            <div style={styles.app}>
                <aside style={styles.sidebar}>
                    <div>
                        <div style={styles.appTitle}>Skill<span style={{ color: WARNING_YELLOW }}>Bridge</span></div>
                        <div style={styles.subtitle}>Placement Officer Portal</div>
                        {/* 9️⃣ Role Indicator */}
                        <div style={styles.roleIndicator}><i className="fa-solid fa-user-shield"></i> Role: {userRole}</div>
                    </div>
                    
                    <nav style={styles.nav}>
                        {sidebarLinks.map((link) => (
                            <div
                                key={link.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setIsLoading(true); setActiveView(link.id); }}
                                onMouseEnter={(e) => {
                                    if (activeView !== link.id) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    if (activeView !== link.id) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                style={{
                                    ...styles.navLink,
                                    ...(activeView === link.id ? styles.navLinkActive : {}),
                                }}
                            >
                                {/* 3️⃣ Active Tab Highlight Bar */}
                                {activeView === link.id && <div style={styles.navLinkActiveBar}></div>}
                                
                                {/* 4️⃣ Icons */}
                                <i className={link.icon} style={styles.icon}></i>
                                {link.label}
                            </div>
                        ))}
                    </nav>

                    <div style={styles.logoutSection}>
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => alert("Log out functionality")}
                            style={styles.navLink}
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket" style={styles.icon}></i>
                            Log Out
                        </div>
                    </div>
                </aside>
                
                <main style={styles.main}>
                    {/* 5️⃣ Top Navbar */}
                    <TopNavbar userRole={userRole} />
                    
                    <motion.div
                        key={activeView + '-content'} 
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={springVariants}
                        style={styles.contentContainer}
                    >
                         {/* 1️⃣ Content Box with Premium Styling */}
                        <div style={styles.content}>
                            {renderContent()}
                        </div>
                    </motion.div>
                </main>

                <AnimatePresence>
                    {selectedStudent && (
                        <StudentDetailModal 
                            student={selectedStudent} 
                            onClose={() => setSelectedStudent(null)}
                            userRole={userRole}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

// Dashboard View component
const DashboardView = ({ poMetrics }) => (
    <>
        <div style={styles.heading}>Dashboard</div>
        <hr style={styles.divider} />
        <div style={styles.welcome}>
            Welcome, **Placement Officer**! Here is a quick overview of key activities.
        </div>
        <div style={styles.metricsArea}>
            {poMetrics.map((metric, i) => (
                 <MetricCard key={i} metric={metric} />
            ))}
        </div>
    </>
);


// --- Styles Object (Vastly Updated for Premium UI) ---

const styles = {
    // 7️⃣ Gradient Background
    app: {
        minHeight: "100vh",
        width: "100vw",
        background: `linear-gradient(to bottom, #f0f5ff, #ffffff)`,
        display: "flex",
        fontFamily: "Poppins, Arial, sans-serif",
    },
    main: {
        flex: 1,
        minHeight: "100vh",
        overflowY: "auto",
        padding: "0 2rem 2rem 2rem", 
        boxSizing: 'border-box',
        background: `linear-gradient(to bottom, #f0f5ff, #ffffff)`, 
    },
    contentContainer: { // New container for page transition
        width: '100%',
        paddingTop: '2.5rem', 
        maxWidth: 1100,
        margin: '0 auto',
        boxSizing: 'border-box'
    },
    // 1️⃣ Content Box with Premium Styling (Simulated Glassmorphism)
    content: {
        width: "100%",
        background: "rgba(255, 255, 255, 0.7)", // Opacity for backdrop effect
        borderRadius: 20, // Rounded 2xl
        padding: "2.5rem 3rem",
        boxShadow: "0 10px 25px rgba(23, 64, 115, 0.12)", // shadow-lg
        border: `1px solid ${BORDER_COLOR}`,
    },
    heading: { fontSize: "2rem", color: PRIMARY_BLUE, fontWeight: 800, marginBottom: "0.8rem", },
    divider: { width: "100%", height: 1.5, background: "#e7eefe", margin: "0.3rem 0 1.8rem 0", border: "none", },
    welcome: { margin: "0 0 2rem 0", color: DARK_NAVY, fontWeight: 500, fontSize: "1.05rem", lineHeight: 1.6, },
    shadowXl: "0 20px 40px rgba(0,0,0,0.15)", // hover:shadow-xl

    // --- Sidebar (3️⃣ Active Tab, 4️⃣ Icons)
    sidebar: {
        width: 320,
        minWidth: 320,
        background: PRIMARY_BLUE,
        color: "#fff",
        padding: "2.1rem 0",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        height: "100vh",
        overflowY: "auto",
        position: "sticky",
        top: 0,
    },
    appTitle: {
        fontWeight: 700,
        fontSize: "2.1rem",
        letterSpacing: "1px",
        color: "#fff",
        textAlign: "center",
        marginBottom: 0,
        padding: '0 1rem',
    },
    subtitle: {
        fontSize: "1.1rem",
        fontWeight: 500,
        color: "#c3d5f9",
        marginBottom: "1rem", 
        textAlign: "center",
        marginTop: 2,
    },
    roleIndicator: { 
        fontSize: '0.9rem',
        color: WARNING_YELLOW,
        fontWeight: 600,
        textAlign: 'center',
        marginBottom: '1.5rem',
    },
    nav: { width: "100%", paddingLeft: '1.5rem', boxSizing: 'border-box', },
    navLink: {
        display: "flex",
        alignItems: "center",
        padding: "0.85rem 1.8rem",
        gap: "16px",
        cursor: "pointer",
        borderRadius: "11px 0 0 11px",
        fontWeight: 500,
        fontSize: "1.02rem",
        color: "#e2eafc",
        marginBottom: "0.45rem",
        transition: "background-color 0.2s, color 0.2s",
        position: 'relative',
    },
    navLinkActive: {
        background: "#f3f6fb",
        color: PRIMARY_BLUE,
        fontWeight: 700,
    },
    navLinkActiveBar: { // 3️⃣ Active Tab Highlight
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        height: '80%',
        width: '4px',
        background: WARNING_YELLOW,
        borderRadius: '2px',
    },
    icon: {
        fontSize: "1.1rem",
        minWidth: "24px",
        textAlign: "center",
    },
    logoutSection: {
        marginTop: 'auto',
        width: '100%',
        paddingTop: '1rem',
        paddingLeft: '1.5rem',
        boxSizing: 'border-box',
    },

    // --- Top Navbar (5️⃣)
    topNavbar: {
        position: 'sticky',
        top: '0',
        zIndex: 1000,
        height: '60px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        borderRadius: '0 0 10px 10px'
    },
    navbarGreeting: {
        fontSize: '1.05rem',
        fontWeight: 600,
        color: DARK_NAVY,
    },
    navbarActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    notificationButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        position: 'relative',
        height: '30px',
        width: '30px',
    },
    notificationBadge: {
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: DANGER_RED,
        color: 'white',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '0.65rem',
        fontWeight: 700,
        lineHeight: 1,
    },
    profileAvatar: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: LIGHT_BLUE,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    settingsButton: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        transition: 'transform 0.3s',
    },

    // --- Dashboard Metrics (1️⃣ Shadow, 2️⃣ Hover, 8️⃣ Growth)
    metricsArea: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
    },
    metricCard: {
        background: "rgba(255, 255, 255, 0.85)", // 1️⃣ Simulated Glass
        borderRadius: "18px",
        border: `1px solid ${BORDER_COLOR}`,
        padding: "1.5rem",
        boxShadow: "0 8px 18px rgba(0,0,0,0.1)", // 1️⃣ Shadow
        transition: "all 0.3s", // 2️⃣ Transition setup
        cursor: "pointer",
    },
    metricTitleContainer: {
        marginBottom: "10px",
    },
    metricTitle: {
        fontWeight: 600,
        color: PRIMARY_BLUE,
        fontSize: "1.0rem",
        marginBottom: "0.4rem",
        display: 'flex',
        alignItems: 'center',
    },
    metricValue: {
        fontWeight: 800,
        fontSize: "2.2rem",
        color: DARK_NAVY,
    },

    // --- Charts (9️⃣)
    chartGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
    },
    chartCard: { 
        background: "rgba(255, 255, 255, 0.85)",
        borderRadius: "18px", 
        padding: "1.5rem", 
        boxShadow: "0 8px 18px rgba(0,0,0,0.1)", 
        border: `1px solid ${BORDER_COLOR}`,
    },
    chartTitle: { fontSize: '1.2rem', color: DARK_NAVY, fontWeight: 700, margin: '0 0 20px 0' },
    chartContainer: { display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '200px', padding: '0 10px', borderBottom: `1px solid ${BORDER_COLOR}` },
    chartColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12%', minWidth: '40px' },
    chartBar: { width: '80%', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' },
    chartValue: { fontSize: '0.8rem', color: DARK_NAVY, fontWeight: 600, marginTop: '5px' },
    chartLabel: { fontSize: '0.75rem', color: SUBTLE_GRAY, marginTop: '5px' },

    // --- Skeleton Loading (🔟)
    skeletonContainer: {
        padding: "2.5rem 3rem",
    },
    metricSkeleton: {
        padding: "1.5rem",
        borderRadius: "18px",
        background: '#f0f3f7',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        position: 'relative'
    },
    skeletonItem: {
        background: '#e2e8f0', // bg-gray-200
        borderRadius: '8px',
        animation: 'pulse-skeleton 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },

    // --- Student/Company View Shared Styles ---
    headerContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
    sectionDividerShort: { height: '1px', background: '#E0E7EF', margin: '5px 0 15px 0' },

    viewTitle: { color: PRIMARY_BLUE, fontSize: "2.2rem", fontWeight: 800, margin: 0 },
    subtitleSmall: { display: 'block', fontSize: '0.85rem', fontWeight: 500, color: SUBTLE_GRAY, marginTop: '5px' },
    backButton: { padding: "8px 18px", borderRadius: "12px", border: "1px solid #3B82F6", color: PRIMARY_BLUE, background: "transparent", cursor: "pointer", fontSize: '15px', fontWeight: 600 },
    
    listContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", width: "100%", margin: "0 auto" },
    listContainerCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    
    // Company/Drive Card (1️⃣ Shadow, 2️⃣ Hover)
    postingCard: { 
        background: "rgba(255, 255, 255, 0.85)", 
        padding: "1.5rem", 
        borderRadius: "14px", 
        boxShadow: "0 8px 18px rgba(0,0,0,0.1)",
        border: `1px solid ${BORDER_COLOR}`,
        display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
        transition: "all 0.3s",
    },
    cardTitle: { margin: 0, color: PRIMARY_BLUE, fontWeight: 700, fontSize: '1.3rem' },
    cardSubtitle: { margin: '0.1rem 0 0 0', color: SUBTLE_GRAY, fontSize: '0.9rem' },
    postingStatPill: { background: "#E6F2FF", color: PRIMARY_BLUE, padding: "4px 10px", borderRadius: "20px", fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }, 
    statusActivePill: { background: "#E5FFF1", color: SUCCESS_GREEN, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    statusPausedPill: { background: "#FFFBE6", color: WARNING_YELLOW, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    actionButton: { background: 'none', border: '1px solid #3B82F6', color: '#3B82F6', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
    
    // Student Tracker/Filtering
    filterBar: { position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem', padding: '1rem 1.5rem', borderRadius: '18px', border: `1px solid ${BORDER_COLOR}`, background: "rgba(255, 255, 255, 0.9)", boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    filterGroup: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
    filterSelect: { padding: '8px', borderRadius: '8px', border: `1px solid ${BORDER_COLOR}`, background: '#fff', zIndex: 10 },
    filterInput: { flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${BORDER_COLOR}`, background: '#fff', minWidth: '150px' },
    saveFilterButton: { background: WARNING_YELLOW, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' },
    savedFiltersContainer: { display: 'flex', gap: '8px', margin: '0 0 1rem 0', flexWrap: 'wrap', alignItems: 'center' },
    pipelineTableContainer: { overflowX: 'auto', borderRadius: '14px', border: `1px solid ${BORDER_COLOR}`, background: "rgba(255, 255, 255, 0.9)" },
    pipelineTable: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '700px' },
    pipelineTh: { backgroundColor: '#F0F6FF', color: PRIMARY_BLUE, padding: '15px', textAlign: 'left', fontWeight: 700, fontSize: '0.95rem' },
    pipelineTr: { transition: 'background-color 0.2s, transform 0.2s' },
    pipelineTd: { padding: '15px', borderBottom: `1px solid ${BORDER_COLOR}`, color: SUBTLE_GRAY, fontSize: '0.95rem', display: 'table-cell', verticalAlign: 'middle' },
    pipelineActionButton: { background: 'none', border: 'none', color: LIGHT_BLUE, cursor: 'pointer', fontSize: '1rem', marginLeft: '5px' },
    statusOfferPill: { background: "#E5FFF1", color: SUCCESS_GREEN, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem' },
    statusScheduledPillGlow: { 
        background: "#E6F2FF", color: LIGHT_BLUE, padding: "4px 12px", borderRadius: "6px", fontWeight: 700, fontSize: '0.9rem',
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
    },
    jobTypePill: { background: "#F0F6FF", color: PRIMARY_BLUE, padding: "4px 12px", borderRadius: "6px", fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },

    // Student Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1002, backdropFilter: 'blur(4px)' },
    modalContent: { background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    modalTitle: { color: PRIMARY_BLUE, fontWeight: 800, margin: 0, fontSize: '1.8rem' },
    modalSubtitle: { color: DARK_NAVY, fontWeight: 700, margin: '10px 0', fontSize: '1.3rem' },
    modalCloseButton: { background: 'none', border: 'none', fontSize: '1.5rem', color: SUBTLE_GRAY, cursor: 'pointer' },
    descriptionText: { lineHeight: 1.6, color: SUBTLE_GRAY },
    
    aiMetricsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
    aiMetricCard: { background: '#F9FAFB', padding: '15px', borderRadius: '10px', borderLeft: '4px solid', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    offerStatusContainer: { background: '#FFFBE6', border: `1px solid ${WARNING_YELLOW}`, padding: '15px', borderRadius: '10px', marginBottom: '20px' },
    offerActions: { display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' },
    offerActionButton: { background: DANGER_RED, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
    interviewActionButton: { background: LIGHT_BLUE, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.95rem' },
    
    timelineContainer: { maxHeight: '250px', overflowY: 'auto', paddingLeft: '20px', position: 'relative' },
    timelineItem: { position: 'relative', paddingBottom: '20px', paddingLeft: '30px', borderLeft: `2px solid ${PRIMARY_BLUE}`, marginLeft: '-1px' },
    timelineDot: { position: 'absolute', left: '-7px', top: '5px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PRIMARY_BLUE, border: '2px solid #fff', boxShadow: '0 0 0 3px #fff' },
    timelineContent: { background: '#F7FAFF', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    timelineDate: { margin: 0, fontSize: '0.8rem', color: PRIMARY_BLUE, fontWeight: 600 },
    timelineActivity: { margin: '5px 0 0 0', fontSize: '0.95rem', color: DARK_NAVY },

    // Communication Styles
    actionButtonMain: { background: SUCCESS_GREEN, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' },
    inboxItem: { 
        display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '10px', border: `1px solid ${BORDER_COLOR}`, cursor: 'pointer', 
        transition: 'all 0.3s', background: "rgba(255, 255, 255, 0.9)",
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    },
    inboxSender: { margin: 0, fontSize: '1.05rem', color: DARK_NAVY },
    inboxSubject: { margin: '0 0 5px 0', fontSize: '0.95rem', color: PRIMARY_BLUE },
    inboxPreview: { margin: 0, fontSize: '0.9rem', color: SUBTLE_GRAY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    inboxTimestamp: { fontSize: '0.8rem', color: SUBTLE_GRAY, minWidth: '80px', textAlign: 'right' },
    emailInput: { width: '100%', padding: '12px', margin: '10px 0', border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', boxSizing: 'border-box' },
    emailTextarea: { width: '100%', padding: '12px', margin: '10px 0', border: `1px solid ${BORDER_COLOR}`, borderRadius: '8px', boxSizing: 'border-box', minHeight: '150px', resize: 'vertical' },

    // Notification Modal
    notificationModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent', zIndex: 1003 },
    notificationModalContent: { position: 'absolute', top: '70px', right: '30px', width: '350px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', padding: '15px', zIndex: 1004 },
    summaryTitle: { fontSize: '1.2rem', color: PRIMARY_BLUE, fontWeight: 600, margin: '0 0 10px 0' },
    notificationItem: { display: 'flex', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${BORDER_COLOR}`, cursor: 'pointer', transition: 'background-color 0.1s' },

    // Placeholder View Styling
    placeholderContainer: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    placeholderContent: { padding: '3rem 0', background: '#F7FAFF', border: '1px dashed #C7D9F8', borderRadius: '14px', width: '80%', margin: '2rem auto' },
};

export default PlacementOfficerDashboard;