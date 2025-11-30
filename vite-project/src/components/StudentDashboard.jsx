import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// --- Global Constants & Data ---
const GLASS_CLASS = "glass";
const INITIAL_JOB_COUNT = 6;
const LOAD_MORE_COUNT = 3;

const companiesData = [
    { name: "Tech Solutions Inc.", industry: "Technology", rating: 4.5, icon: "fa-solid fa-microchip", logoColor: "#10B981", reviews: 1200 },
    { name: "Creative Minds LLC", industry: "Design & Marketing", rating: 4.8, icon: "fa-solid fa-palette", logoColor: "#EF4444", reviews: 850 },
    { name: "Data Insights Co.", industry: "Data Analytics", rating: 4.2, icon: "fa-solid fa-chart-line", logoColor: "#3B82F6", reviews: 500 },
    { name: "Market Leaders", industry: "Marketing", rating: 4.0, icon: "fa-solid fa-bullhorn", logoColor: "#F59E0B", reviews: 900 },
    { name: "Global Sales Corp", industry: "Sales", rating: 3.9, icon: "fa-solid fa-handshake", logoColor: "#8B5CF6", reviews: 1500 },
    { name: "DesignFirst", industry: "Design", rating: 4.7, icon: "fa-solid fa-pen-ruler", logoColor: "#06B6D4", reviews: 300 },
];

const getCompanyDetails = (companyName) => {
    return companiesData.find(c => c.name === companyName) || {};
};

const jobsData = [
    { id: 1, title: "Software Engineer (Full Stack)", company: "Tech Solutions Inc.", location: "Remote", type: "Full-time", industry: "Technology", experience: "Mid-Level", salary: 110000, description: "Design, develop, and maintain software applications using React and Node.js. Requires 3+ years of experience." },
    { id: 2, title: "Frontend Developer (React)", company: "Creative Minds LLC", location: "New York, NY", type: "Full-time", industry: "Design & Marketing", experience: "Senior", salary: 135000, description: "Lead the frontend team to build responsive and high-performance user interfaces. Expertise in React and Next.js is mandatory." },
    { id: 3, title: "Data Science Intern", company: "Data Insights Co.", location: "San Francisco, CA", type: "Internship", industry: "Data Analytics", experience: "Fresher", salary: 60000, description: "Assist senior data scientists in model training, cleaning large datasets, and visualization. Must be proficient in Python and SQL." },
    { id: 4, title: "Marketing Trainee", company: "Market Leaders", location: "Chicago, IL", type: "Trainee", industry: "Marketing", experience: "Fresher", salary: 55000, description: "Learn various digital marketing strategies including SEO, SEM, and social media management. Great career start." },
    { id: 5, title: "Sales Associate", company: "Global Sales Corp", location: "Austin, TX", type: "Full-time", industry: "Sales", experience: "Junior", salary: 75000, description: "Manage client relationships and drive sales growth in the Texas region. Requires excellent communication skills." },
    { id: 6, title: "UX/UI Designer", company: "DesignFirst", location: "Remote", type: "Contract", industry: "Design", experience: "Mid-Level", salary: 85000, description: "Create wireframes, storyboards, user flows, and site maps. Experience with Figma or Sketch is required." },
    { id: 7, title: "Backend Engineer (GoLang)", company: "Tech Solutions Inc.", location: "Boston, MA", type: "Full-time", industry: "Technology", experience: "Senior", salary: 150000, description: "Develop highly scalable and resilient backend services using GoLang. Familiarity with microservices architecture is a plus." },
    { id: 8, title: "Graphic Designer", company: "Creative Minds LLC", location: "New York, NY", type: "Contract", industry: "Design & Marketing", experience: "Junior", salary: 70000, description: "Design compelling visual content for marketing campaigns and product materials. Portfolio review is mandatory." },
].map(job => ({
    ...job,
    ...getCompanyDetails(job.company),
    workMode: job.location === 'Remote' ? 'Remote' : (job.location.includes('NY') || job.location.includes('Boston') ? 'Hybrid' : 'On-site')
}));

const servicesData = [
    { title: "Resume Maker", description: "Create a professional resume easily with templates and AI suggestions.", icon: "fa-solid fa-file-lines" },
    { title: "Resume Quality Check", description: "Get your resume analyzed and scored by industry experts for free.", icon: "fa-solid fa-magnifying-glass" },
    { title: "Interview Preparation", description: "Practice behavioral and technical questions with mock interviews.", icon: "fa-solid fa-chalkboard-user" },
    { title: "Application Status Tracker", description: "Track all job applications in one place and get deadline reminders.", icon: "fa-solid fa-location-dot" },
    { title: "Skill Gap Analysis", description: "Identify missing skills for your target job profile and find relevant courses.", icon: "fa-solid fa-chart-bar" },
    { title: "Career Counseling", description: "Get personalized advice from experienced mentors about your career path.", icon: "fa-solid fa-user-graduate" },
];

const getUnique = (key) => [...new Set(jobsData.map(job => job[key]))];

// --- Utility Components ---

const springVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const StarRating = ({ rating, reviews }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const Star = ({ type }) => {
        let icon;
        let color = '#F59E0B';
        if (type === 'full') icon = "fa-solid fa-star";
        else if (type === 'half') icon = "fa-solid fa-star-half-stroke";
        else icon = "fa-regular fa-star";
        
        return <i className={icon} style={{ color, marginRight: '2px', transition: 'all 0.3s' }}></i>;
    };

    return (
        <span style={styles.starContainer}>
            {Array(fullStars).fill(0).map((_, i) => <Star key={`f-${i}`} type="full" />)}
            {hasHalfStar && <Star type="half" />}
            {Array(emptyStars).fill(0).map((_, i) => <Star key={`e-${i}`} type="empty" />)}
            {reviews !== undefined && <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#6B7280' }}>({reviews > 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews} reviews)</span>}
        </span>
    );
};

const Breadcrumb = ({ path }) => (
    <div style={styles.breadcrumbContainer}>
        {path.map((item, index) => (
            <React.Fragment key={index}>
                <span style={index === path.length - 1 ? styles.breadcrumbActive : styles.breadcrumbInactive}>
                    {item.name}
                </span>
                {index < path.length - 1 && <span style={styles.breadcrumbSeparator}>/</span>}
            </React.Fragment>
        ))}
    </div>
);

// --- Subcomponents ---

const JobCard = ({ job, isBookmarked, toggleBookmark, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="card card-hover ripple"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            whileHover={{ 
                boxShadow: "0 10px 30px rgba(0,0,0,0.16)", 
                scale: 1.01,
                translateY: -4 
            }}
            whileTap={{ scale: 0.98 }}
            style={styles.jobCard}
            onClick={() => onClick(job)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <motion.div 
                    style={{...styles.logoCircle, backgroundColor: job.logoColor}}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <span style={{color: '#fff', fontWeight: 600, fontSize: '1.2rem'}}>{job.company.charAt(0)}</span>
                </motion.div>
                
                <div style={{ flex: 1 }}>
                    <h3 style={styles.cardTitle}>{job.title}</h3>
                    <p style={styles.cardSubtitle}>{job.company} — {job.location}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <StarRating rating={job.rating} />
                    </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <motion.span 
                    style={styles.jobTypePill}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                >
                    {job.type}
                </motion.span>
                <motion.button
                    style={styles.bookmarkButton}
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    className="ripple"
                >
                    <i className={isBookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}
                       style={{ color: isBookmarked ? "#F59E0B" : "#6B7280" }}></i>
                </motion.button>
            </div>
        </motion.div>
    );
};

const SkeletonJobCard = () => (
    <div style={{...styles.jobCard, height: '100px', opacity: 0.7, cursor: 'default' }} className="shimmer-effect">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '70%' }}>
            <div style={{...styles.logoCircle, backgroundColor: '#ddd' }}></div>
            <div style={{ width: '100%' }}>
                <div style={{...styles.skeletonItem, width: '80%', height: '20px', marginBottom: '8px' }}></div>
                <div style={{...styles.skeletonItem, width: '50%', height: '14px' }}></div>
            </div>
        </div>
        <div style={{ width: '20%', height: '30px', borderRadius: '20px', backgroundColor: '#ddd' }}></div>
    </div>
);

const JobFilter = ({ filters, setFilters }) => {
    const jobTypes = getUnique('type');
    const experienceLevels = getUnique('experience');
    const workModes = getUnique('workMode');

    const toggleFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value
        }));
    };

    const handleSalaryChange = (e) => {
        setFilters(prev => ({
            ...prev,
            salary: parseInt(e.target.value)
        }));
    };

    return (
        <motion.div 
            style={{...styles.filterBar, ...styles.glassFilter}} 
            className={GLASS_CLASS}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            {/* Type Filter */}
            <div style={styles.filterGroup}>
                <span style={{ fontWeight: 600, color: '#1D4ED8' }}>Type:</span>
                {jobTypes.map(type => (
                    <motion.div
                        key={type}
                        className={`pill ripple ${filters.type === type ? 'active' : ''}`}
                        onClick={() => toggleFilter('type', type)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {type}
                    </motion.div>
                ))}
            </div>
            
            {/* Experience Filter */}
            <div style={styles.filterGroup}>
                <span style={{ fontWeight: 600, color: '#1D4ED8' }}>Exp:</span>
                {experienceLevels.map(exp => (
                    <motion.div
                        key={exp}
                        className={`pill ripple ${filters.experience === exp ? 'active' : ''}`}
                        onClick={() => toggleFilter('experience', exp)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {exp}
                    </motion.div>
                ))}
            </div>

            {/* Work Mode Filter */}
            <div style={styles.filterGroup}>
                <span style={{ fontWeight: 600, color: '#1D4ED8' }}>Mode:</span>
                {workModes.map(mode => (
                    <motion.div
                        key={mode}
                        className={`pill ripple ${filters.workMode === mode ? 'active' : ''}`}
                        onClick={() => toggleFilter('workMode', mode)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {mode}
                    </motion.div>
                ))}
            </div>

            {/* Salary Slider */}
            <div style={{...styles.filterGroup, flex: 1, minWidth: '200px', maxWidth: '300px'}}>
                <span style={{ fontWeight: 600, color: '#1D4ED8' }}>Salary Min:</span>
                <input 
                    type="range"
                    min="50000"
                    max="150000"
                    step="10000"
                    value={filters.salary}
                    onChange={handleSalaryChange}
                    style={{ flex: 1 }}
                />
                <span style={{ fontWeight: 600, color: '#1D4ED8', minWidth: '80px' }}>
                    ${(filters.salary / 1000).toFixed(0)}k+
                </span>
            </div>

            <button style={styles.backButtonRed} className="ripple" onClick={() => setFilters({ type: '', location: '', experience: '', workMode: '', salary: 50000 })}>
                Clear All
            </button>
        </motion.div>
    );
};

// --- Modals ---
const JobDetailModal = ({ job, onClose, isBookmarked, toggleBookmark }) => {
    if (!job) return null;

    const formattedSalary = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(job.salary);

    return (
        <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                style={styles.modalContent}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div style={styles.modalHeader}>
                    <button style={styles.modalCloseButton} onClick={onClose}><i className="fa-solid fa-times"></i></button>
                </div>

                <div style={styles.modalBody}>
                    <Breadcrumb path={[{ name: "Home", link: "#" }, { name: "Jobs", link: "#" }, { name: job.title }]} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{...styles.logoCircle, backgroundColor: job.logoColor, width: '60px', height: '60px'}}>
                            <span style={{color: '#fff', fontWeight: 700, fontSize: '1.8rem'}}>{job.company.charAt(0)}</span>
                        </div>
                        <div>
                            <h2 style={styles.modalTitle}>{job.title}</h2>
                            <p style={styles.modalSubtitle}>{job.company} · {job.location} ({job.workMode})</p>
                            <StarRating rating={job.rating} reviews={job.reviews} />
                        </div>
                    </div>

                    <div style={styles.modalDetailsGrid}>
                        <div style={styles.detailPill}><i className="fa-solid fa-briefcase"></i> {job.experience}</div>
                        <div style={styles.detailPill}><i className="fa-solid fa-money-bill-wave"></i> {formattedSalary} / Year</div>
                        <div style={styles.detailPill}><i className="fa-solid fa-clock"></i> {job.type}</div>
                        <div style={styles.detailPill}><i className="fa-solid fa-industry"></i> {job.industry}</div>
                    </div>
                    
                    <h3 style={styles.sectionHeading}>Job Description</h3>
                    <p style={styles.descriptionText}>{job.description}</p>
                    
                    <h3 style={styles.sectionHeading}>Key Requirements</h3>
                    <ul style={styles.requirementsList}>
                        <li>Proven experience in {job.industry} or related field.</li>
                        <li>Ability to work in a {job.workMode} environment.</li>
                        <li>{job.experience} level expertise in core technologies.</li>
                    </ul>

                </div>

                <div style={styles.modalFooter}>
                    <motion.button
                        style={isBookmarked ? styles.bookmarkAppliedButton : styles.bookmarkActionButton}
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="ripple"
                    >
                        <i className={isBookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
                        {isBookmarked ? " Saved" : " Save Job"}
                    </motion.button>
                    <motion.button 
                        style={styles.applyButton} 
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(59, 130, 246, 0.5)" }} 
                        whileTap={{ scale: 0.95 }}
                        className="ripple"
                        onClick={() => alert(`Applying for ${job.title} at ${job.company}`)}
                    >
                        <i className="fa-solid fa-paper-plane"></i> Apply Now
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- View Components ---

const HomeView = ({ onSearch, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const allSuggestions = [
        ...new Set(jobsData.map(j => j.title)),
        ...new Set(jobsData.map(j => j.company)),
    ];

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 2) {
            const filteredSuggestions = allSuggestions
                .filter(s => s.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5);
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestClick = (suggestion) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
        onSearch(suggestion);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
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
            <motion.div style={styles.mainTitle}>
                Find Your Next Career Move on <span style={{ color: "#3B82F6" }}>SkillBridge</span>
            </motion.div>
            <motion.div style={styles.mainSubtitle}>
                A bridge between your ambition and achievement.
            </motion.div>
            
            <form 
                style={{...styles.mainSearchBar, ...styles.glassSearch}} 
                className={GLASS_CLASS} 
                onSubmit={handleSubmit}
            >
                <input 
                    style={styles.mainSearchInput} 
                    placeholder="Search jobs, companies..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)} // Hide suggestions after blur delay
                />
                <button type="submit" style={styles.mainSearchButton} className="ripple">
                    <i className="fa-solid fa-search" /> Search
                </button>
                
                {/* Auto Suggestions */}
                {suggestions.length > 0 && (
                    <motion.div 
                        style={styles.autoSuggest}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <div 
                                key={index} 
                                style={styles.suggestItem}
                                onClick={() => handleSuggestClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </motion.div>
                )}
            </form>
            
            <div style={{...styles.filterGroup, marginTop: '1rem', justifyContent: 'center'}}>
                <motion.div className="pill ripple" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{backgroundColor: '#FFE5E5', color: '#EF4444'}}>🔥 Trending: React</motion.div>
                <motion.div className="pill ripple" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{backgroundColor: '#E5FFF1', color: '#10B981'}}>💼 Market Demand: High</motion.div>
            </div>

            <motion.div style={{marginTop: '2.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                <button style={styles.upgradeButton} className="ripple" onClick={() => onNavigate('jobs')}>
                    Explore All Jobs
                </button>
            </motion.div>
        </motion.div>
    );
};

const JobsView = ({ onBack, bookmarks, toggleBookmark, onSelectJob }) => {
    const [filters, setFilters] = useState({ type: '', location: '', experience: '', workMode: '', salary: 50000 });
    const [isLoading, setIsLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(INITIAL_JOB_COUNT);

    const filterJobs = useCallback(() => {
        return jobsData.filter(job => {
            const typeMatch = filters.type ? job.type === filters.type : true;
            const experienceMatch = filters.experience ? job.experience === filters.experience : true;
            const workModeMatch = filters.workMode ? job.workMode === filters.workMode : true;
            const salaryMatch = job.salary >= filters.salary;
            return typeMatch && experienceMatch && workModeMatch && salaryMatch;
        });
    }, [filters]);

    const filteredJobs = filterJobs();

    useEffect(() => {
        setIsLoading(true);
        setDisplayCount(INITIAL_JOB_COUNT); 
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleLoadMore = () => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setDisplayCount(prev => prev + LOAD_MORE_COUNT);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    };

    return (
        <motion.div
            key="jobs"
            variants={springVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div style={styles.headerContainer}>
                <h2 style={styles.viewTitle}>Available Job Openings</h2>
                <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
            </div>
            <div style={styles.sectionDivider}></div>
            <JobFilter filters={filters} setFilters={setFilters} />
            
            <div style={styles.listContainer}>
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        Array(Math.max(displayCount, 6)).fill().map((_, i) => <SkeletonJobCard key={i} />)
                    ) : filteredJobs.length ? filteredJobs.slice(0, displayCount).map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            isBookmarked={bookmarks.includes(job.id)}
                            toggleBookmark={toggleBookmark}
                            onClick={onSelectJob}
                        />
                    )) : (
                        <motion.p
                            key="no-results"
                            variants={springVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={styles.noResults}
                        >
                            No jobs found matching the current filters. Try lowering the minimum salary.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {filteredJobs.length > displayCount && !isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    style={{ textAlign: 'center', marginTop: '2rem' }}
                >
                    <motion.button 
                        style={styles.loadMoreButton} 
                        className="ripple" 
                        onClick={handleLoadMore}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <i className="fa-solid fa-sync-alt"></i> Load More ({filteredJobs.length - displayCount} remaining)
                    </motion.button>
                </motion.div>
            )}
            
        </motion.div>
    );
};

const CompaniesView = ({ onBack }) => (
    <motion.div
        key="companies"
        variants={springVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >
        <div style={styles.headerContainer}>
            <h2 style={styles.viewTitle}>Featured Companies</h2>
            <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
        </div>
        <div style={styles.sectionDivider}></div>
        <div style={styles.listContainer}>
            <AnimatePresence>
                {companiesData.map((c, i) => (
                    <motion.div
                        key={i}
                        className="card card-hover ripple"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 + i * 0.08 }}
                        whileHover={{ boxShadow: "0 12px 36px rgba(0,0,0,0.2), 0 0 0 3px #3B82F6", scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        style={styles.companyCard}
                    >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{...styles.logoCircle, backgroundColor: c.logoColor}}>
                                <span style={{color: '#fff', fontWeight: 600, fontSize: '1.5rem'}}>{c.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 style={styles.cardTitle}>{c.name}</h3>
                                <p style={styles.cardSubtitle}>{c.industry}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={styles.rating}>{c.rating}</span>
                            <StarRating rating={c.rating} reviews={c.reviews} />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </motion.div>
);

const ServicesView = ({ onBack }) => (
    <motion.div
        key="services"
        variants={springVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >
        <div style={styles.headerContainer}>
            <h2 style={styles.viewTitle}>Career Services & Tools</h2>
            <button style={styles.backButton} className="ripple" onClick={onBack}>← Back to Home</button>
        </div>
        <div style={styles.sectionDivider}></div>
        <div style={styles.listContainer}>
            <AnimatePresence>
                {servicesData.map((s, i) => (
                    <motion.div
                        key={i}
                        className="card card-hover ripple"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 + i * 0.08 }}
                        whileHover={{ boxShadow: "0 10px 30px rgba(0,0,0,0.16)", scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        style={styles.serviceCard}
                    >
                        <i className={s.icon} style={styles.serviceIcon}></i>
                        <h3 style={styles.cardTitle}>{s.title}</h3>
                        <p style={styles.serviceDescription}>{s.description}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </motion.div>
);


// --- Dashboard Main ---
const StudentDashboard = () => {
    const [activeView, setActiveView] = useState('home');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [bookmarks, setBookmarks] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    
    // Scroll effects for Navbar
    const { scrollY } = useScroll();
    const spring = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const checkScrollTop = () => {
        const latest = scrollY.get();
        if (latest > 10) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }

        if (latest > 600) {
            setShowScroll(true);
        } else {
            setShowScroll(false);
        }
    };

    useEffect(() => {
        const unsubscribe = spring.on("change", checkScrollTop);
        return () => unsubscribe();
    }, [spring]);

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const toggleBookmark = (jobId) => {
        setBookmarks(prev => 
            prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
        );
    };

    const handleSelectJob = (job) => {
        setSelectedJob(job);
    };

    const handleSearch = (searchTerm) => {
        if (searchTerm.trim()) {
            alert(`Search functionality triggered for: ${searchTerm}. Navigating to jobs view.`);
            // In a real app, this would navigate to the jobs view with the search term pre-filtered.
            setActiveView('jobs');
        }
    }

    // Apply global body styles
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
            case 'jobs':
                return <JobsView onBack={() => setActiveView('home')} bookmarks={bookmarks} toggleBookmark={toggleBookmark} onSelectJob={handleSelectJob} />;
            case 'companies':
                return <CompaniesView onBack={() => setActiveView('home')} />;
            case 'services':
                return <ServicesView onBack={() => setActiveView('home')} />;
            default:
                return <HomeView onSearch={handleSearch} onNavigate={setActiveView} />;
        }
    };

    // Dynamic Navbar Style
    const dynamicNavStyle = {
        ...styles.navbar, 
        ...(isScrolled && styles.glassNav),
        height: isScrolled ? '56px' : '64px', 
        background: isDarkMode 
            ? (isScrolled ? 'rgba(31, 41, 55, 0.9)' : '#1F2937')
            : (isScrolled ? 'rgba(29, 78, 216, 0.8)' : '#1D4ED8'),
    };
    
    const dynamicLogoStyle = isScrolled
        ? {...styles.logo, fontSize: '1.8rem'}
        : styles.logo;

    return (
        <>
            <style>
                {`
                /* Global CSS for animations and base styling */
                html, body, #root {
                    width: 100vw;
                    min-height: 100vh;
                    padding: 0; margin: 0;
                    color: ${isDarkMode ? '#F9FAFB' : '#1F2937'};
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

                /* Shimmer Effect */
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer-effect > div {
                    background: linear-gradient(90deg, #e0e0e0, #f8f8f8, #e0e0e0);
                    background-size: 300% 100%;
                    animation: shimmer 1.5s infinite;
                }

                /* Pill Filter Styling */
                .pill {
                    padding: 8px 18px;
                    background: ${isDarkMode ? '#4B5563' : '#eaf0ff'};
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    color: ${isDarkMode ? '#D1D5DB' : '#1D4ED8'};
                    transition: background 0.3s, color 0.3s, transform 0.2s;
                    font-size: 0.95rem;
                    white-space: nowrap;
                }
                .pill.active {
                    background: #1d4ed8;
                    color: white;
                }
                `}
            </style>
            
            <div style={isDarkMode ? {...styles.app, color: '#F9FAFB'} : styles.app}>
                <motion.nav 
                    className="sticky-navbar" 
                    style={dynamicNavStyle}
                >
                    <motion.div style={dynamicLogoStyle} onClick={() => setActiveView('home')}>
                        Skill<span style={{ color: "#3B82F6" }}>Bridge</span>
                    </motion.div>
                    <div style={styles.navLinks}>
                        {['jobs', 'companies', 'services'].map(view => (
                            <span 
                                key={view}
                                className={`nav-link ${activeView === view ? 'nav-link-active' : ''}`} 
                                style={{...styles.navLink, color: isScrolled ? '#fff' : '#E0E7EF'}} 
                                onClick={() => setActiveView(view)}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </span>
                        ))}
                        <motion.button 
                            style={styles.darkModeToggle} 
                            onClick={toggleDarkMode}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Toggle Dark Mode"
                        >
                            <i className={isDarkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"} style={{color: isDarkMode ? '#F59E0B' : '#E0E7EF'}}></i>
                        </motion.button>
                    </div>
                </motion.nav>
                
                <main style={styles.main}>
                    <div className="container" style={{
                        ...styles.mainContent, 
                        background: isDarkMode ? '#374151' : '#FFFFFF', 
                        boxShadow: isDarkMode ? '0 2px 16px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.08)',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937',
                    }}>
                        <AnimatePresence mode="wait">
                            {renderContent()}
                        </AnimatePresence>
                    </div>
                </main>
                
                <Footer isDarkMode={isDarkMode}/>

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


                <AnimatePresence>
                    {selectedJob && (
                        <JobDetailModal 
                            job={selectedJob} 
                            onClose={() => setSelectedJob(null)} 
                            isBookmarked={bookmarks.includes(selectedJob.id)}
                            toggleBookmark={toggleBookmark}
                        />
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

// --- Footer Component ---
const Footer = ({ isDarkMode }) => (
    <footer style={{...styles.footer, background: isDarkMode ? '#111827' : '#1D4ED8'}}>
        <div style={styles.footerContent}>
            <div style={styles.footerSections}>
                <div>
                    <h4 style={styles.footerHeading}>SkillBridge</h4>
                    <p style={{...styles.footerText, color: isDarkMode ? '#9CA3AF' : '#E0E7EF'}}>Connecting **Talent** & Opportunity.</p>
                    <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
                        <i className="fa-brands fa-linkedin" style={styles.socialIcon}></i>
                        <i className="fa-brands fa-twitter" style={styles.socialIcon}></i>
                        <i className="fa-brands fa-facebook" style={styles.socialIcon}></i>
                    </div>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Company</h4>
                    <a href="#about" style={styles.footerLink}>About Us</a>
                    <a href="#careers" style={styles.footerLink}>Careers</a>
                    <a href="#press" style={styles.footerLink}>Press</a>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Legal</h4>
                    <a href="#terms" style={styles.footerLink}>Terms of Service</a>
                    <a href="#privacy" style={styles.footerLink}>Privacy Policy</a>
                    <a href="#licensing" style={styles.footerLink}>Licensing</a>
                </div>
                <div>
                    <h4 style={styles.footerHeading}>Contact</h4>
                    <a href="#contact" style={styles.footerLink}>Support</a>
                    <a href="#hiring" style={styles.footerLink}>Hiring? Post a Job</a>
                </div>
            </div>
            <div style={{...styles.footerCopyright, color: isDarkMode ? '#6B7280' : '#E0E7EF'}}>
                SkillBridge &copy; {new Date().getFullYear()}. All rights reserved.
            </div>
        </div>
    </footer>
);


// --- Styles (Updated for Dark Mode / Transitions / Auto-Suggest) ---
const styles = {
    app: {
        minHeight: "100vh",
        width: "100vw",
        fontFamily: "Poppins, Arial, sans-serif",
        boxSizing: "border-box",
    },
    // Glassmorphism Styles (Inline use)
    glassNav: {
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    },
    glassSearch: {
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
    },
    glassFilter: {
        background: 'rgba(238, 244, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
    },

    navbar: {
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        width: "100vw",
        boxSizing: "border-box",
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    logo: {
        fontSize: "2rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: 'font-size 0.3s'
    },
    navLinks: {
        display: "flex",
        gap: "1.5rem",
        alignItems: 'center'
    },
    navLink: {
        cursor: "pointer",
        fontSize: "1.05rem",
        fontWeight: 500,
        padding: '0 5px',
        letterSpacing: '0.4px',
    },
    darkModeToggle: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        marginLeft: '0.5rem',
    },
    main: {
        padding: "5rem 0 2.5rem 0", // Increased padding top for fixed navbar
        boxSizing: 'border-box'
    },
    mainContent: {
        width: "100%",
        maxWidth: "1300px",
        margin: "0 auto",
        borderRadius: "28px",
        padding: "2.5rem 3rem",
        textAlign: "center",
        boxSizing: 'border-box',
        transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
    },
    homeContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '3rem'
    },
    mainTitle: {
        fontSize: "3rem",
        fontWeight: 700,
        color: "#1D4ED8",
        marginBottom: '0.5rem'
    },
    mainSubtitle: {
        color: "#3B82F6",
        fontSize: "1.3rem"
    },
    mainSearchBar: {
        marginTop: "2.5rem",
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        padding: "0.5rem 1rem",
        borderRadius: "40px",
        width: "100%",
        maxWidth: "680px",
        position: 'relative',
    },
    mainSearchInput: {
        flex: 1,
        border: "none",
        outline: "none",
        fontSize: "1.1rem",
        background: "transparent",
        color: "#1D4ED8",
        padding: "0.7rem 0.6rem 0.7rem 1.2rem"
    },
    mainSearchButton: {
        background: "#1E40AF",
        color: "#fff",
        padding: "0.7rem 1.5rem",
        borderRadius: "25px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    upgradeButton: {
        background: "#3B82F6",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        padding: "0.8rem 1.8rem",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "1.1rem",
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    },
    loadMoreButton: {
        background: "#1E40AF",
        color: "#fff",
        border: "none",
        fontWeight: 600,
        padding: "0.8rem 1.8rem",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "1.0rem",
        boxShadow: "0 4px 8px rgba(30, 64, 175, 0.3)",
    },
    headerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem"
    },
    sectionDivider: {
        height: '2px',
        width: '100%',
        background: 'linear-gradient(to right, #ffffff00, #C7D9F8, #ffffff00)',
        margin: '1.5rem 0 2rem',
    },
    viewTitle: {
        color: "#1D4ED8",
        fontSize: "2.2rem",
        fontWeight: 800,
        margin: 0
    },
    backButton: {
        padding: "8px 18px",
        borderRadius: "12px",
        border: "1px solid #3B82F6",
        color: "#1D4ED8",
        background: "transparent",
        cursor: "pointer",
        fontSize: '15px',
        fontWeight: 600,
    },
    backButtonRed: {
        padding: "8px 18px",
        borderRadius: "12px",
        border: "none",
        color: "#fff",
        background: "#EF4444",
        cursor: "pointer",
        fontSize: '15px',
        fontWeight: 600,
        marginLeft: 'auto',
    },
    listContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "1.5rem",
        width: "100%",
        margin: "0 auto"
    },
    jobCard: {
        background: "#FFFFFF",
        padding: "1.5rem",
        borderRadius: "18px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer"
    },
    companyCard: {
        background: "#FFFFFF",
        padding: "1.5rem",
        borderRadius: "18px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        transition: 'background 0.3s, box-shadow 0.3s'
    },
    serviceCard: {
        background: "#FFFFFF",
        padding: "1.5rem",
        borderRadius: "18px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        cursor: "pointer",
        textAlign: 'left',
        transition: 'background 0.3s, box-shadow 0.3s'
    },
    serviceIcon: {
        fontSize: "2.5rem",
        color: "#1E40AF",
        marginBottom: "1rem"
    },
    serviceDescription: {
        margin: '0.5rem 0 0 0',
        color: "#1E40AF",
        lineHeight: 1.6,
        fontSize: '0.95rem'
    },
    logoCircle: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 0 4px rgba(255,255,255,0.8)'
    },
    jobTypePill: {
        background: "#F0F6FF",
        color: "#1E40AF",
        padding: "0.4rem 0.8rem",
        borderRadius: "20px",
        fontWeight: 600,
        fontSize: '0.9rem'
    },
    bookmarkButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0.5rem',
    },
    cardTitle: {
        margin: 0,
        color: '#1D4ED8',
        fontWeight: 700,
        fontSize: '1.3rem'
    },
    cardSubtitle: {
        margin: '0.1rem 0 0 0',
        color: '#3B82F6',
        fontSize: '0.95rem'
    },
    starContainer: {
        color: '#F59E0B',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center'
    },
    rating: {
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#1E40AF"
    },
    filterBar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        padding: '1rem 1.5rem',
        borderRadius: '18px',
        alignItems: 'center',
        border: '1px solid #C7D9F8',
        boxSizing: 'border-box'
    },
    filterGroup: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    noResults: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#3B82F6',
        padding: '3rem 0',
        border: '1px dashed #C7D9F8',
        borderRadius: '14px',
        margin: '1rem 0'
    },
    // Search Auto Suggestion Styles
    autoSuggest: {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%',
        background: '#fff',
        border: '1px solid #C7D9F8',
        borderRadius: '12px',
        marginTop: '0.5rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        textAlign: 'left',
        padding: '0', // Removed inner padding for items to control it
        zIndex: 100,
        overflow: 'hidden'
    },
    suggestItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        color: '#1D4ED8',
        fontWeight: 500,
        transition: 'background 0.2s',
    },
    suggestItemHover: {
        backgroundColor: '#EEF4FF',
    },
    // Footer Styles
    footer: {
        color: "#D1D5DB",
        padding: "3rem 0",
        textAlign: "left",
        marginTop: "2rem",
        transition: 'background 0.3s',
    },
    footerContent: {
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: '0 20px',
    },
    footerSections: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #4B5563',
    },
    footerHeading: {
        color: '#F9FAFB',
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '1rem',
        marginTop: 0,
    },
    footerLink: {
        color: "#9CA3AF",
        textDecoration: "none",
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.95rem',
        transition: "color 0.2s",
    },
    socialIcon: {
        fontSize: '1.5rem',
        color: '#9CA3AF',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    footerCopyright: {
        textAlign: 'center',
        marginTop: '2rem',
        fontSize: '0.9rem',
    },
    // Job Detail Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1002,
        backdropFilter: 'blur(4px)',
    },
    modalContent: {
        background: '#fff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
    },
    modalHeader: {
        padding: '1rem 1rem 0 1rem',
        display: 'flex',
        justifyContent: 'flex-end',
    },
    modalCloseButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#6B7280',
    },
    modalBody: {
        padding: '0 2.5rem 2.5rem 2.5rem',
        textAlign: 'left',
    },
    modalTitle: {
        color: '#1D4ED8',
        fontWeight: 800,
        margin: 0,
        fontSize: '2rem',
    },
    modalSubtitle: {
        color: '#3B82F6',
        margin: '0.2rem 0 0.5rem 0',
        fontWeight: 500,
        fontSize: '1.05rem',
    },
    modalDetailsGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        margin: '1.5rem 0',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '1.5rem',
    },
    detailPill: {
        padding: '0.6rem 1rem',
        background: '#F0F6FF',
        color: '#1E40AF',
        borderRadius: '10px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    sectionHeading: {
        color: '#1D4ED8',
        marginTop: '1.5rem',
        marginBottom: '0.8rem',
        borderLeft: '4px solid #3B82F6',
        paddingLeft: '1rem',
        fontSize: '1.3rem',
    },
    descriptionText: {
        lineHeight: 1.6,
        color: '#4B5563',
    },
    requirementsList: {
        listStyle: 'disc inside',
        paddingLeft: 0,
        color: '#4B5563',
    },
    modalFooter: {
        padding: '1.5rem 2.5rem',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
    },
    applyButton: {
        background: '#3B82F6',
        color: '#fff',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    bookmarkActionButton: {
        background: '#E5E7EB',
        color: '#1D4ED8',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    bookmarkAppliedButton: {
        background: '#FCD34D',
        color: '#92400E',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    breadcrumbContainer: {
        marginBottom: '1rem',
        fontSize: '0.9rem',
        color: '#6B7280',
    },
    breadcrumbInactive: {
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    breadcrumbActive: {
        fontWeight: 600,
        color: '#1D4ED8',
    },
    breadcrumbSeparator: {
        margin: '0 8px',
    },
    scrollToTopButton: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
    }
};

export default StudentDashboard;