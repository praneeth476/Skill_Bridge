import React, { useState, useEffect, useMemo } from 'react';

// --- Static Data & Configuration ---

const sidebarLinks = [
    // Main Section
    { id: 'dashboard', icon: "fa-solid fa-house-chimney", label: "Dashboard", section: "Main" },

    // Manage Section
    { id: 'students', icon: "fa-solid fa-graduation-cap", label: "Manage Students", section: "Manage" },
    { id: 'employers', icon: "fa-solid fa-building", label: "Manage Employers", section: "Manage" },
    { id: 'jobs', icon: "fa-solid fa-briefcase", label: "Job Postings", section: "Manage" },

    // Reports & Communication Section
    { id: 'reports', icon: "fa-solid fa-chart-line", label: "Analytics & Reports", section: "Reports & Comms" },
    { id: 'announcements', icon: "fa-solid fa-bullhorn", label: "Announcements", section: "Reports & Comms" },

    // ⭐ New Section: Advanced
    { id: 'rbac', icon: "fa-solid fa-user-lock", label: "RBAC & Users", section: "Advanced" }, // 🚀 1. RBAC
    { id: 'audit-logs', icon: "fa-solid fa-clipboard-list", label: "Activity/Audit Logs", section: "Advanced" }, // 🚀 7 & 8. Logs

    // Settings Section (moved to bottom)
    { id: 'settings', icon: "fa-solid fa-gear", label: "System Settings", section: "Settings" },
];

const initialMetrics = [
    { 
        label: "Total Students", 
        value: null, 
        color: "blue-500", 
        icon: "fa-solid fa-user-group", 
        key: 'total_students', 
        trend: { value: '12%', up: true, period: 'this month' } 
    },
    { 
        label: "Registered Employers", 
        value: null, 
        color: "green-500", 
        icon: "fa-solid fa-user-tie", 
        key: 'total_employers',
        trend: { value: '8%', up: false, period: 'last month' }
    },
    { 
        label: "Active Job Postings", 
        value: null, 
        color: "yellow-500", 
        icon: "fa-solid fa-magnifying-glass", 
        key: 'active_jobs',
        trend: { value: '25', up: true, period: 'last week' } 
    },
    { 
        label: "Pending Approvals", 
        value: null, 
        color: "red-500", 
        icon: "fa-solid fa-exclamation-triangle", 
        key: 'pending_approvals',
        trend: { value: '3', up: false, period: 'yesterday' } 
    },
];

const mockStudentData = [
    { id: 101, name: 'Alex Johnson', email: 'alex.j@univ.edu', year: 2024, status: 'Active', applications: 12 },
    { id: 102, name: 'Sarah Lee', email: 'sarah.l@univ.edu', year: 2025, status: 'Pending', applications: 5 },
    { id: 103, name: 'David Chen', email: 'david.c@univ.edu', year: 2024, status: 'Placed', applications: 20 },
    { id: 104, name: 'Emily Brown', email: 'emily.b@univ.edu', year: 2026, status: 'Active', applications: 3 },
    { id: 105, name: 'Michael O’Neal', email: 'michael.o@univ.edu', year: 2025, status: 'Active', applications: 8 },
    { id: 106, name: 'Jessica Alba', email: 'jess.a@univ.edu', year: 2024, status: 'Pending', applications: 15 },
    { id: 107, name: 'Robert Smith', email: 'rob.s@univ.edu', year: 2025, status: 'Placed', applications: 18 },
    { id: 108, name: 'Alice Smith', email: 'alice.s@univ.edu', year: 2024, status: 'Active', applications: 10 },
    { id: 109, name: 'Bob Johnson', email: 'bob.j@univ.edu', year: 2025, status: 'Active', applications: 7 },
    { id: 110, name: 'Charlie Brown', email: 'charlie.b@univ.edu', year: 2026, status: 'Pending', applications: 4 },
    { id: 111, name: 'Diana Prince', email: 'diana.p@univ.edu', year: 2024, status: 'Placed', applications: 25 },
    { id: 112, name: 'Clark Kent', email: 'clark.k@univ.edu', year: 2025, status: 'Active', applications: 11 },
];

const mockApprovalData = [
    { id: 'E101', type: 'Employer', name: 'Tech Innovations Inc.', reason: 'New account registration', date: '2024-11-20' },
    { id: 'J205', type: 'Job Post', name: 'Frontend Developer (React)', reason: 'Review required before publishing', date: '2024-11-21' },
    { id: 'S312', type: 'Student Profile', name: 'Jia Li (ID: 108)', reason: 'Profile updated with new certification', date: '2024-11-22' },
];

const mockEmployerData = [
    { id: 'E101', name: 'Tech Innovations Inc.', industry: 'Software', status: 'Pending', jobPosts: 3, contact: 'ceo@tech.com' },
    { id: 'E102', name: 'Global Finance Group', industry: 'Finance', status: 'Verified', jobPosts: 8, contact: 'hr@gfg.com' },
    { id: 'E103', name: 'Green Energy Solutions', industry: 'Renewable Energy', status: 'Verified', jobPosts: 2, contact: 'info@ges.com' },
    { id: 'E104', name: 'City Hospital', industry: 'Healthcare', status: 'Suspended', jobPosts: 0, contact: 'admin@cityhosp.com' },
    { id: 'E105', name: 'Digital Marketing Pros', industry: 'Marketing', status: 'Verified', jobPosts: 5, contact: 'recruitment@dmp.net' },
    { id: 'E106', name: 'Automotive Future', industry: 'Automotive', status: 'Pending', jobPosts: 1, contact: 'jobs@autofuture.com' },
    { id: 'E107', name: 'Local Bank Services', industry: 'Finance', status: 'Verified', jobPosts: 4, contact: 'careers@localbank.com' },
];

const mockJobPostingsData = [
    { 
        id: 'J001', 
        title: 'Senior Backend Engineer (Python)', 
        company: 'Tech Innovations Inc.', 
        type: 'Full-time', 
        applications: 45, 
        status: 'Active',
        statusHistory: ['Posted (Oct 1)', 'Reviewing (Oct 2)', 'Approved (Oct 3)', 'Active (Oct 3)'],
        conversionRate: '15%',
        avgProfileScore: '8.5/10',
        employerRating: 4.5
    },
    { 
        id: 'J002', 
        title: 'Financial Analyst Intern', 
        company: 'Global Finance Group', 
        type: 'Internship', 
        applications: 80, 
        status: 'Active',
        statusHistory: ['Posted (Sep 15)', 'Approved (Sep 16)', 'Active (Sep 16)'],
        conversionRate: '10%',
        avgProfileScore: '7.2/10',
        employerRating: 4.8
    },
    { 
        id: 'J003', 
        title: 'Junior Data Scientist', 
        company: 'Data Insights Co.', 
        type: 'Full-time', 
        applications: 12, 
        status: 'Pending Review',
        statusHistory: ['Posted (Nov 18)', 'Reviewing (Nov 19)'],
        conversionRate: 'N/A',
        avgProfileScore: 'N/A',
        employerRating: 3.9
    },
    { 
        id: 'J004', 
        title: 'Marketing Assistant', 
        company: 'Digital Marketing Pros', 
        type: 'Contract', 
        applications: 10, 
        status: 'Closed',
        statusHistory: ['Posted (Aug 1)', 'Active (Aug 2)', 'Closed (Oct 1)'],
        conversionRate: '5%',
        avgProfileScore: '6.8/10',
        employerRating: 4.1
    },
    { id: 'J005', title: 'Solar Panel Installer Trainee', company: 'Green Energy Solutions', type: 'Internship', applications: 2, status: 'Active', statusHistory: ['Posted (Oct 25)', 'Active (Oct 26)'], conversionRate: '50%', avgProfileScore: '6.1/10', employerRating: 4.2 },
    { id: 'J006', title: 'HR Coordinator', company: 'City Hospital', type: 'Full-time', applications: 5, status: 'Pending Review', statusHistory: ['Posted (Nov 20)'], conversionRate: 'N/A', avgProfileScore: 'N/A', employerRating: 3.5 },
    { id: 'J007', title: 'Embedded Systems Intern', company: 'Automotive Future', type: 'Internship', applications: 15, status: 'Active', statusHistory: ['Posted (Nov 1)', 'Active (Nov 2)'], conversionRate: '20%', avgProfileScore: '7.8/10', employerRating: 4.0 },
];

const mockPlacementData = [
    { month: 'Sep', placed: 120, target: 150 },
    { month: 'Oct', placed: 140, target: 150 },
    { month: 'Nov', placed: 110, target: 150 },
    { month: 'Dec', placed: 90, target: 150 },
];

const mockDepartmentApplications = [
    { department: 'Computer Science', count: 450, color: 'text-blue-500' },
    { department: 'Mechanical Eng.', count: 280, color: 'text-gray-500' },
    { department: 'Electrical Eng.', count: 320, color: 'text-yellow-500' },
    { department: 'Civil Eng.', count: 180, color: 'text-green-500' },
];

const mockUpcomingDrives = [
    { company: 'Global Finance Group', date: 'Dec 10, 2025', type: 'Interview', icon: 'fa-solid fa-calendar-check' },
    { company: 'Tech Innovations Inc.', date: 'Dec 15, 2025', type: 'Assessment', icon: 'fa-solid fa-keyboard' },
    { company: 'Green Energy Solutions', date: 'Jan 5, 2026', type: 'Drive', icon: 'fa-solid fa-suitcase' },
];

// ⭐ Mock Data for RBAC Roles
const mockRoles = [
    { id: 1, name: 'Super Admin', permissions: ['FULL_ACCESS'] },
    { id: 2, name: 'Data Entry Officer', permissions: ['BULK_UPLOAD', 'VIEW_ALL', 'MANAGE_STUDENTS'] },
    { id: 3, name: 'Approval Manager', permissions: ['VIEW_ALL', 'APPROVE_JOBS', 'APPROVE_EMPLOYER'] },
    { id: 4, name: 'Analytics Viewer', permissions: ['VIEW_REPORTS', 'VIEW_ONLY'] },
];

// ⭐ Mock Data for Activity Logs
const mockActivityLogs = [
    { id: 1, timestamp: '2025-11-23 10:30', user: 'Admin Praveen K.', action: 'APPROVE_EMPLOYER', details: 'Verified Tech Innovations Inc. account.', status: 'Success' },
    { id: 2, timestamp: '2025-11-23 09:15', user: 'Sub-Admin Alex J.', action: 'UPDATE_JOB', details: 'Updated job J001 (Senior Backend Engineer) salary band.', status: 'Success' },
    { id: 3, timestamp: '2025-11-22 14:45', user: 'Admin Praveen K.', action: 'DELETE_STUDENT', details: 'Deleted student profile 112 (Clark Kent).', status: 'Warning' },
    { id: 4, timestamp: '2025-11-22 11:20', user: 'Data Entry Alex T.', action: 'BULK_UPLOAD_STUDENTS', details: 'Imported 50 new students via CSV.', status: 'Success' },
];


// --- Utility Functions ---

const getStatusColor = (status, type) => {
    switch (type) {
        case 'student':
            switch (status) {
                case 'Active': return 'bg-green-100 text-green-800';
                case 'Pending': return 'bg-yellow-100 text-yellow-800';
                case 'Placed': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        case 'employer':
            switch (status) {
                case 'Verified': return 'bg-green-100 text-green-800';
                case 'Pending': return 'bg-yellow-100 text-yellow-800';
                case 'Suspended': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        case 'job':
            switch (status) {
                case 'Active': return 'bg-green-100 text-green-800';
                case 'Pending Review': return 'bg-yellow-100 text-yellow-800';
                case 'Closed': return 'bg-gray-200 text-gray-700';
                default: return 'bg-gray-100 text-gray-800';
            }
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Job Type Badges Utility
const getJobTypeColor = (type) => {
    switch (type) {
        case 'Full-time': return 'bg-blue-600'; 
        case 'Internship': return 'bg-green-600'; 
        case 'Contract': return 'bg-orange-600'; 
        default: return 'bg-gray-600';
    }
}

// --- Sub Components ---

// ActionsDropdown remains the same as previous step
const ActionsDropdown = ({ student }) => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { label: 'View Profile', icon: 'fa-solid fa-eye', handler: () => console.log(`Viewing Student ${student.name}`) },
        { label: 'Approve Account', icon: 'fa-solid fa-circle-check', handler: () => console.log(`Approving Student ${student.name}`), requiresStatus: 'Pending', color: 'text-green-600' },
        { label: 'Disable Account', icon: 'fa-solid fa-user-slash', handler: () => console.log(`Disabling Student ${student.name}`), requiresStatus: 'Active', color: 'text-yellow-600' },
        { label: 'Delete Account', icon: 'fa-solid fa-trash', handler: () => console.log(`Deleting Student ${student.name}`), color: 'text-red-600' },
    ];
    
    // Determine which actions are available based on status
    const availableActions = actions.filter(action => {
        if (!action.requiresStatus) return true;
        if (action.requiresStatus === 'Pending') return student.status === 'Pending';
        if (action.requiresStatus === 'Active') return student.status === 'Active' || student.status === 'Placed';
        return true;
    });

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Actions
                <i className={`fa-solid fa-chevron-down ml-2 -mr-1 w-3 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-pop-in">
                    <div className="py-1">
                        {availableActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => { action.handler(); setIsOpen(false); }}
                                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            >
                                <i className={`${action.icon} ${action.color || 'text-gray-500'} mr-3 w-4 text-center`}></i>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// JobDetailsModal remains the same as previous step
const JobDetailsModal = ({ job, onClose }) => {
    if (!job) return null;

    const timelineSteps = ['Posted', 'Reviewing', 'Approved', 'Active', 'Closed'];

    const getStatusTime = (status) => {
        const historyItem = job.statusHistory.find(item => item.startsWith(status));
        return historyItem ? historyItem.match(/\(([^)]+)\)/)?.[1] || 'N/A' : 'N/A';
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<i key={i} className="fa-solid fa-star text-yellow-500"></i>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<i key={i} className="fa-solid fa-star-half-stroke text-yellow-500"></i>);
            } else {
                stars.push(<i key={i} className="fa-regular fa-star text-gray-300"></i>);
            }
        }
        return stars;
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-2xl transform transition-all duration-300 animate-pop-in overflow-y-auto max-h-[90vh]">
                <h3 className="text-3xl font-bold text-blue-800 mb-2 border-b pb-2">
                    {job.title}
                </h3>
                <p className="text-lg text-gray-600 mb-4 flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">{job.company}</span>
                    — Current Status: <span className={`ml-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(job.status, 'job')}`}>{job.status}</span>
                </p>

                {/* Employer Rating & Job Type */}
                <div className="flex flex-wrap items-center space-x-6 mb-6">
                    <div className="flex items-center mb-2 sm:mb-0">
                        <span className="text-sm font-medium text-gray-600 mr-2">Employer Rating:</span>
                        <div className="flex text-lg">
                            {getStarRating(job.employerRating)}
                        </div>
                        <span className="ml-2 font-bold text-gray-800">({job.employerRating})</span>
                    </div>
                    <div className={`px-3 py-1 text-sm font-semibold rounded-full text-white ${getJobTypeColor(job.type)} mb-2 sm:mb-0`}>
                        {job.type}
                    </div>
                </div>

                {/* Job Insights */}
                <h4 className="text-xl font-bold text-gray-800 mb-3 border-t pt-4">Job Insights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{job.applications}</div>
                        <div className="text-sm text-gray-600">Total Applicants</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">{job.conversionRate}</div>
                        <div className="text-sm text-gray-600">Conversion Rate</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">{job.avgProfileScore}</div>
                        <div className="text-sm text-gray-600">Avg. Profile Score</div>
                    </div>
                </div>

                {/* Status Timeline */}
                <h4 className="text-xl font-bold text-gray-800 mb-4 border-t pt-4">Job Status Timeline</h4>
                <div className="flex justify-between items-start space-x-2 relative after:content-[''] after:absolute after:top-4 after:left-0 after:right-0 after:h-0.5 after:bg-gray-300">
                    {timelineSteps.map((step, index) => {
                        const isCompleted = job.statusHistory.some(h => h.startsWith(step)) || step === job.status;
                        const isCurrent = step === job.status || (!isCompleted && index > 0 && job.statusHistory.some(h => h.startsWith(timelineSteps[index - 1])));
                        const time = isCompleted ? getStatusTime(step) : 'Pending';

                        return (
                            <div key={step} className="flex flex-col items-center z-10 w-1/5 text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-orange-500 text-white shadow-lg' : isCompleted ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <i className={`fa-solid ${isCompleted ? 'fa-check' : (isCurrent ? 'fa-spinner fa-spin' : 'fa-circle')} text-sm`}></i>
                                </div>
                                <span className={`mt-2 text-sm font-semibold ${isCurrent ? 'text-orange-600' : 'text-gray-700'}`}>{step}</span>
                                <span className="text-xs text-gray-500">{time}</span>
                            </div>
                        );
                    })}
                </div>


                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const SkeletonMetricCard = () => (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
    </div>
);

const MetricCard = ({ label, value, color, icon, trend }) => ( 
    <div className={`bg-white rounded-xl border-2 border-gray-100 p-6 flex flex-col justify-center shadow-lg transition-all duration-300 ring-2 ring-transparent hover:scale-[1.01] hover:ring-${color}/50 hover:shadow-xl hover:shadow-${color}/20`}>
        <div className={`flex items-center justify-between mb-2 text-${color} text-opacity-75`}>
            <i className={`${icon} text-2xl`}></i>
            <div className={`font-extrabold text-sm uppercase text-gray-500`}>{label}</div>
        </div>
        <div className={`font-extrabold text-4xl text-gray-900 tracking-wide mb-1`}>
            {value}
        </div>
        {/* Trend Indicator Display */}
        {trend && value !== null && (
            <div className={`flex items-center text-sm font-semibold ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`fa-solid ${trend.up ? 'fa-caret-up' : 'fa-caret-down'} mr-1`}></i>
                {trend.up ? `${trend.value} increase` : `${trend.value} decrease`} 
                <span className="text-gray-500 font-normal ml-1 text-xs"> vs {trend.period}</span>
            </div>
        )}
    </div>
);

const PlacementChartMock = ({ data }) => (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg h-full">
        <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Monthly Placements vs. Target</h3>
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.month} className="flex flex-col">
                    <div className="flex justify-between text-sm font-semibold mb-1 text-gray-700">
                        <span>{item.month}</span>
                        <span>{item.placed} / {item.target} Placed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="h-3 rounded-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${(item.placed / item.target) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 italic">Visualized for the current quarter based on mock data.</p>
    </div>
);

const PendingApprovals = ({ data }) => (
    <div className="bg-white rounded-xl border-2 border-yellow-100 p-6 shadow-lg h-full">
        <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center">
            <i className="fa-solid fa-hourglass-half mr-3"></i>
            Pending Action Queue ({data.length})
        </h3>
        <ul className="space-y-3">
            {data.map(item => (
                <li key={item.id} className="p-3 bg-yellow-50 rounded-lg flex justify-between items-center transition-all duration-300 hover:bg-yellow-100 border border-transparent hover:border-yellow-300">
                    <div>
                        <span className="font-semibold text-gray-800 block">{item.name}</span>
                        <span className="text-sm text-gray-600 italic">[{item.type}] - {item.reason}</span>
                    </div>
                    <button
                        onClick={() => console.log(`Approving ${item.id}`)}
                        className="text-sm text-white bg-blue-600 px-3 py-1 rounded-full font-medium transition-colors hover:bg-blue-700 hover:shadow-md"
                    >
                        Review
                    </button>
                </li>
            ))}
        </ul>
        {data.length === 0 && <p className="text-gray-500 italic">No pending items to review. All clear!</p>}
    </div>
);


const DepartmentApplicationsChart = ({ data }) => (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Applications by Department</h3>
        <div className="space-y-4">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col">
                    <div className="flex justify-between text-sm font-semibold mb-1 text-gray-700">
                        <span className="font-bold">{item.department}</span>
                        <span>{item.count} Apps</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className={`h-4 rounded-full ${item.color.replace('text', 'bg')} transition-all duration-1000`}
                            style={{ width: `${(item.count / 500) * 100}%` }} 
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const UpcomingDrivesCalendar = ({ data }) => (
    <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg h-full">
        <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center border-b pb-2">
            <i className="fa-solid fa-calendar-alt mr-3"></i>
            Upcoming Drives & Interviews
        </h3>
        <ul className="space-y-3">
            {data.length === 0 && <p className="text-gray-500 italic">No events scheduled currently.</p>}
            {data.map(item => (
                <li key={item.date + item.company} className="p-3 bg-purple-50 rounded-lg flex items-center transition-all duration-300 hover:bg-purple-100 border border-transparent hover:border-purple-300">
                    <i className={`${item.icon} text-purple-600 mr-3 w-4 text-center`}></i>
                    <div>
                        <span className="font-semibold text-gray-800 block">{item.company}</span>
                        <span className="text-sm text-gray-600 italic">{item.type} on {item.date}</span>
                    </div>
                </li>
            ))}
        </ul>
        <button className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View Full Calendar
        </button>
    </div>
);

const TrendChartGrid = () => {
    // ⭐ New Mock Data for Advanced Analytics
    const mockCtcData = [
        { label: "CGPA 8+", avg: 12.5, highest: 25 },
        { label: "CGPA 7-8", avg: 9.8, highest: 18 },
        { label: "CGPA <7", avg: 6.5, highest: 14 },
    ];
    
    // CGPA by Department mock data for visualization
    const mockDeptPlacement = [
        { dept: 'CS', placed: 85, target: 100, color: 'bg-blue-500' },
        { dept: 'EE', placed: 75, target: 100, color: 'bg-yellow-500' },
        { dept: 'ME', placed: 60, target: 100, color: 'bg-green-500' },
    ];
    
    return (
        <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Key Placement Trends</h3>
             {/* Placement % by Department Mock */}
            <div className="space-y-4 mb-6">
                {mockDeptPlacement.map(dept => (
                    <div key={dept.dept}>
                        <div className="flex justify-between text-sm font-semibold mb-1">
                            <span>{dept.dept} ({dept.placed}/{dept.target})</span>
                            <span>{((dept.placed / dept.target) * 100).toFixed(0)}% Placed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className={`${dept.color} h-3 rounded-full`} style={{ width: `${(dept.placed / dept.target) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
            {/* CTC by CGPA Mock */}
            <h4 className="text-md font-bold text-gray-700 mb-2 border-t pt-2">CTC by CGPA (LPA)</h4>
            <div className="space-y-2">
                 {mockCtcData.map((data, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-700 p-1 bg-gray-50 rounded-md">
                        <span className="font-semibold">{data.label}:</span>
                        <span className="text-green-600 font-bold">{data.avg} Avg</span> / 
                        <span className="text-red-600 font-bold">{data.highest} High</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardView = ({ loading, metrics, approvals }) => {
    const adminFeatures = [
        "Approve or reject employer accounts based on verification status (Approvals Workflow).",
        "Manage Sub-Admins and define custom roles (RBAC).",
        "View detailed analytics on student applications, placements, and CTC (Advanced Analytics).",
        "Manage all user accounts (students, employers, officers) and update permissions.",
        "Broadcast announcements and notifications to specific user groups (Notification System).",
    ];

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Dashboard Overview</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium leading-relaxed">
                Welcome, Admin! Here is your portal overview including essential features and key performance metrics.
            </p>

            {/* KPI Cards with Trends (A) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading
                    ? initialMetrics.map((_, i) => <SkeletonMetricCard key={i} />)
                    : metrics.map((metric, i) => (
                        <MetricCard key={i} {...metric} />
                    ))}
            </div>

            {/* Charts and Reports Section (B) */}
            <h2 className="text-3xl text-gray-800 font-extrabold tracking-tight mb-4 mt-8">Performance Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Row 1, Column 1 (2/3 width) - Placement Chart */}
                <div className="lg:col-span-2">
                    <PlacementChartMock data={mockPlacementData} />
                </div>
                {/* Row 1, Column 2 (1/3 width) - Department Apps */}
                <DepartmentApplicationsChart data={mockDepartmentApplications} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Row 2, Column 1 (1/3 width) - Pending Approvals (Approvals Workflow) */}
                <PendingApprovals data={mockApprovalData} />
                
                {/* Row 2, Column 2 (1/3 width) - Upcoming Drives/Calendar */}
                <UpcomingDrivesCalendar data={mockUpcomingDrives} />
                
                {/* Row 2, Column 3 (1/3 width) - Key Trends (Advanced Analytics Placeholder) */}
                <TrendChartGrid />
            </div>

            {/* Quick Action Features (re-labeled for professional features) */}
            <div className="mt-8 bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                <h2 className="font-bold text-2xl text-blue-800 mt-0 mb-4 border-b-2 border-blue-100 pb-2">
                    Core Admin Capabilities
                </h2>
                <ul className="pl-4 text-lg text-gray-700 list-disc list-outside space-y-3">
                    {adminFeatures.map((f, i) => (
                        <li key={i} className="text-gray-700 transition-colors duration-300 hover:text-blue-600">
                            <span className="font-medium text-gray-900">{f}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const ManageStudentsView = () => {
    const [students, setStudents] = useState(mockStudentData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterYear, setFilterYear] = useState('All'); 
    const [sortKey, setSortKey] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 

    const uniqueYears = useMemo(() => {
        const years = [...new Set(mockStudentData.map(s => s.year))].sort((a, b) => b - a);
        return ['All', ...years.map(String)];
    }, []);
    
    // Helper function for sort icon
    const getSortIcon = (key) => {
        if (sortKey !== key) return null;
        return <i className={`ml-2 fa-solid ${sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>;
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
        setCurrentPage(1); 
    };

    // Filtered, Sorted, and Paginated Data Logic (useMemo)
    const paginatedData = useMemo(() => {
        let filtered = students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
            const matchesYear = filterYear === 'All' || String(student.year) === filterYear; 

            return matchesSearch && matchesStatus && matchesYear;
        });

        const sorted = filtered.sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            let comparison = 0;
            if (typeof valA === 'number') {
                comparison = valA - valB;
            } else if (valA < valB) {
                comparison = -1;
            } else if (valA > valB) {
                comparison = 1;
            }

            return sortDirection === 'asc' ? comparison : comparison * -1;
        });

        // Apply Pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = sorted.slice(startIndex, endIndex);

        return {
            totalItems: sorted.length,
            totalPages: Math.ceil(sorted.length / itemsPerPage),
            items: paginated,
        };
    }, [students, searchTerm, filterStatus, filterYear, sortKey, sortDirection, currentPage]); 

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'year', label: 'Grad Year' },
        { key: 'status', label: 'Status' },
        { key: 'applications', label: 'Apps' },
    ];

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Manage Students 🎓</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                View, filter, and manage all student accounts currently registered in the system.
            </p>
            
            {/* 🚀 4. Bulk Upload Placeholder */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 shadow-inner flex justify-between items-center">
                <span className="font-semibold text-purple-800 flex items-center">
                    <i className="fa-solid fa-cloud-arrow-up mr-3 text-xl"></i>
                    Bulk Actions: Upload Students via CSV/Excel
                </span>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    Upload & Import
                </button>
            </div>

            {/* Filters and Search Section */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Search by Student Name or Email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                
                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} 
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Placed">Placed</option>
                </select>

                {/* Grad Year Filter (Eligibility Placeholder: Batch Year) */}
                <select
                    value={filterYear}
                    onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }} 
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    {uniqueYears.map(year => (
                        <option key={year} value={year}>{year === 'All' ? 'All Years' : `Class of ${year}`}</option>
                    ))}
                </select>
                {/* CGPA, Department, Skill, Backlog filters would be implemented similarly here (Eligibility Engine UI) */}
            </div>


            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-blue-100"
                                >
                                    {col.label}
                                    {getSortIcon(col.key)}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {paginatedData.items.map(student => ( 
                            <tr key={student.id} className="transition-colors duration-150 hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {col.key === 'status' ? (
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student[col.key], 'student')}`}>
                                                {student[col.key]}
                                            </span>
                                        ) : (
                                            col.key === 'applications' ? (
                                                <span className="font-bold text-blue-700">{student[col.key]}</span>
                                            ) : (
                                                col.key === 'year' ? `${student[col.key]}` : student[col.key]
                                            )
                                        )}
                                    </td>
                                ))}
                                {/* Actions Dropdown (Actions Workflow) */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    <ActionsDropdown student={student} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginatedData.totalItems === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No students match the current filters.</div>
                )}
            </div>
            
            {/* Pagination Controls */}
            {paginatedData.totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center bg-white p-4 rounded-lg shadow-md border border-gray-100">
                    <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedData.totalItems)} of {paginatedData.totalItems} results
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        {[...Array(paginatedData.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                aria-current={currentPage === i + 1 ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === i + 1
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedData.totalPages))}
                            disabled={currentPage === paginatedData.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};


const ManageEmployersView = () => {
    // Re-using full implementation from previous step
    const [employers, setEmployers] = useState(mockEmployerData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterIndustry, setFilterIndustry] = useState('All');
    const [sortKey, setSortKey] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [copiedEmail, setCopiedEmail] = useState(null);

    const industries = useMemo(() => {
        const list = [...new Set(mockEmployerData.map(e => e.industry))].sort();
        return ['All', ...list];
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleCopyEmail = (email, id) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
                setCopiedEmail(id);
                setTimeout(() => setCopiedEmail(null), 2000);
            });
        } else {
            alert(`Email copied: ${email}`);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Verified': return <i className="fa-solid fa-certificate text-green-600 mr-2" title="Verified Partner"></i>;
            case 'Pending': return <i className="fa-solid fa-clock text-yellow-600 mr-2" title="Pending Review"></i>;
            case 'Suspended': return <i className="fa-solid fa-triangle-exclamation text-red-600 mr-2" title="Suspended Account"></i>;
            default: return null;
        }
    };

    const filteredAndSortedEmployers = useMemo(() => {
        let filtered = employers.filter(employer => {
            const matchesSearch = employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employer.contact.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'All' || employer.status === filterStatus;
            const matchesIndustry = filterIndustry === 'All' || employer.industry === filterIndustry;

            return matchesSearch && matchesStatus && matchesIndustry;
        });

        return filtered.sort((a, b) => {
            if (typeof a[sortKey] === 'number') {
                return sortDirection === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
            }
            if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [employers, searchTerm, filterStatus, filterIndustry, sortKey, sortDirection]);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Company Name' },
        { key: 'industry', label: 'Industry' },
        { key: 'jobPosts', label: 'Active Jobs' },
        { key: 'status', label: 'Verification Status' },
    ];

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Manage Employers 🏢</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Review and manage all corporate partners and their verification status.
            </p>
            
            {/* 🚀 4. Bulk Upload Placeholder */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 shadow-inner flex justify-between items-center">
                <span className="font-semibold text-purple-800 flex items-center">
                    <i className="fa-solid fa-cloud-arrow-up mr-3 text-xl"></i>
                    Bulk Actions: Upload Jobs or Employer Data via CSV/Excel
                </span>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                    Upload & Import
                </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Search by Company Name or Contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <select
                    value={filterIndustry}
                    onChange={(e) => setFilterIndustry(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    {industries.map(industry => (
                        <option key={industry} value={industry}>{industry === 'All' ? 'All Industries' : industry}</option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    <option value="All">All Statuses</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-blue-100"
                                >
                                    {col.label}
                                    {sortKey === col.key && (
                                        <i className={`ml-2 fa-solid ${sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                    )}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Quick Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredAndSortedEmployers.map(employer => (
                            <tr key={employer.id} className="transition-colors duration-150 hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            {col.key === 'status' && getStatusIcon(employer[col.key])}
                                            {col.key === 'status' ? (
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employer[col.key], 'employer')}`}>
                                                    {employer[col.key]}
                                                </span>
                                            ) : (
                                                col.key === 'jobPosts' ? (
                                                    <span className="font-bold text-yellow-700">{employer[col.key]}</span>
                                                ) : (
                                                    employer[col.key]
                                                )
                                            )}
                                        </div>
                                    </td>
                                ))}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                    <button
                                        onClick={() => handleCopyEmail(employer.contact, employer.id)}
                                        className={`px-2 py-1 rounded transition-colors duration-300 ${copiedEmail === employer.id ? 'bg-green-500 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}
                                        title={copiedEmail === employer.id ? "Copied!" : "Copy Contact Email"}
                                    >
                                        <i className={`fa-solid ${copiedEmail === employer.id ? 'fa-check' : 'fa-envelope'}`}></i>
                                    </button>
                                    <button
                                        onClick={() => console.log(`Viewing Employer ${employer.name}`)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-50/50"
                                        title="View Profile"
                                    >
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                    {employer.status !== 'Verified' && employer.status !== 'Suspended' && (
                                        <button
                                            onClick={() => console.log(`Verifying Employer ${employer.name}`)}
                                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-50/50"
                                            title="Verify Account"
                                        >
                                            <i className="fa-solid fa-circle-check"></i>
                                        </button>
                                    )}
                                    {employer.status !== 'Suspended' && (
                                        <button
                                            onClick={() => console.log(`Suspending Employer ${employer.name}`)}
                                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-50/50"
                                            title="Suspend Account"
                                        >
                                            <i className="fa-solid fa-ban"></i>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAndSortedEmployers.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No employers match the current filters.</div>
                )}
            </div>
        </div>
    );
};


const JobPostingsView = () => {
    // Re-using full implementation from previous step
    const [jobs, setJobs] = useState(mockJobPostingsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [sortKey, setSortKey] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedJob, setSelectedJob] = useState(null); // ⭐ New State for Modal

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedJobs = useMemo(() => {
        let filtered = jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
            const matchesType = filterType === 'All' || job.type === filterType;

            return matchesSearch && matchesStatus && matchesType;
        });

        return filtered.sort((a, b) => {
            if (typeof a[sortKey] === 'number') {
                return sortDirection === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
            }
            if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [jobs, searchTerm, filterStatus, filterType, sortKey, sortDirection]);

    const columns = [
        { key: 'id', title: 'ID' },
        { key: 'title', title: 'Job Title' },
        { key: 'company', title: 'Company' },
        { key: 'type', title: 'Job Type' },
        { key: 'applications', title: 'Apps' },
        { key: 'status', title: 'Status' },
    ];

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Job Postings 💼</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Manage all active, pending, and closed job postings submitted by employers.
            </p>

            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Search by Job Title or Company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors hover:bg-blue-100"
                                >
                                    {col.title}
                                    {sortKey === col.key && (
                                        <i className={`ml-2 fa-solid ${sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                                    )}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Details
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredAndSortedJobs.map(job => (
                            <tr key={job.id} className="transition-colors duration-150 hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {col.key === 'status' ? (
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job[col.key], 'job')}`}>
                                                {job[col.key]}
                                            </span>
                                        ) : col.key === 'type' ? ( 
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${getJobTypeColor(job.type)}`}>
                                                {job[col.key]}
                                            </span>
                                        ) : (
                                            col.key === 'applications' ? (
                                                <span className="font-bold text-red-700">{job[col.key]}</span>
                                            ) : (
                                                job[col.key]
                                            )
                                        )}
                                    </td>
                                ))}
                                {/* View Details Action (opens modal) */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                                    <button
                                        onClick={() => setSelectedJob(job)} 
                                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-50/50"
                                        title="View Details"
                                    >
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAndSortedJobs.length === 0 && (
                    <div className="p-6 text-center text-gray-500 italic">No job postings match the current filters.</div>
                )}
            </div>

            {/* Job Details Modal Integration */}
            <JobDetailsModal 
                job={selectedJob} 
                onClose={() => setSelectedJob(null)} 
            />
        </div>
    );
};

// --- FULLY IMPLEMENTED AnalyticsReportsView Component (Refactored for 🚀 2) ---

const AnalyticsReportsView = () => {
    const mockReportMetrics = [
        { label: "Total Applications", value: "8,200", icon: "fa-solid fa-paper-plane", color: "blue-600" },
        { label: "Placement Rate", value: "78%", icon: "fa-solid fa-chart-pie", color: "green-600" },
        { label: "Active Employers", value: "215", icon: "fa-solid fa-building", color: "purple-600" },
        { label: "Average App per Job", value: "18.2", icon: "fa-solid fa-calculator", color: "yellow-600" },
    ];

    const mockTopEmployers = [
        { name: 'Tech Innovations Inc.', apps: 450, placements: 15 },
        { name: 'Global Finance Group', apps: 320, placements: 10 },
        { name: 'Cloud Solutions LLC', apps: 280, placements: 8 },
    ];
    
    // New Mock Data for Advanced Analytics
    const mockCtcData = [
        { label: "CGPA 8+", avg: 12.5, highest: 25 },
        { label: "CGPA 7-8", avg: 9.8, highest: 18 },
        { label: "CGPA <7", avg: 6.5, highest: 14 },
    ];
    
    // CGPA by Department mock data for visualization
    const mockDeptPlacement = [
        { dept: 'CS', placed: 85, target: 100, color: 'bg-blue-500' },
        { dept: 'EE', placed: 75, target: 100, color: 'bg-yellow-500' },
        { dept: 'ME', placed: 60, target: 100, color: 'bg-green-500' },
    ];


    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Analytics & Reports 📈</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Deep dive into placement performance, employer engagement, and application trends.
            </p>

            {/* Existing Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {mockReportMetrics.map((metric, i) => (
                    <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                        <div className={`text-${metric.color} mb-2`}>
                            <i className={`${metric.icon} text-3xl`}></i>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                        <div className="text-sm uppercase text-gray-500 font-semibold mt-1">{metric.label}</div>
                    </div>
                ))}
            </div>

            {/* ⭐ New Advanced Charts Section */}
            <h2 className="text-2xl font-bold text-purple-700 mb-4 mt-8 border-b pb-2">Advanced CTC & Placement Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* Placement % by Department (Part of 🚀 2) */}
                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Placement Percentage by Department</h3>
                    <div className="space-y-4">
                        {mockDeptPlacement.map(dept => (
                            <div key={dept.dept}>
                                <div className="flex justify-between text-sm font-semibold mb-1">
                                    <span>{dept.dept} ({dept.placed}/{dept.target})</span>
                                    <span>{((dept.placed / dept.target) * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div className={`${dept.color} h-3 rounded-full`} style={{ width: `${(dept.placed / dept.target) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTC by CGPA (Part of 🚀 2) */}
                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Avg/Highest CTC by CGPA (LPA)</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">CGPA Band</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Avg. CTC</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Highest CTC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockCtcData.map((data, i) => (
                                <tr key={i} className="hover:bg-blue-50/50">
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{data.label}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-bold">{data.avg}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-red-600 font-bold">{data.highest}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            
            {/* Existing Bottom Panels (Application Trend Bar Chart, Top Employers) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Application Trend (Last 6 Months)</h3>
                    <div className="h-64 flex items-end space-x-4 pt-4">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                            <div key={month} className="flex flex-col items-center justify-end h-full flex-1">
                                <div
                                    className="w-full rounded-t-lg bg-blue-500 transition-all duration-700 hover:bg-blue-700"
                                    style={{ height: `${(Math.random() * 80) + 20}%` }}
                                    title={`Applications in ${month}`}
                                ></div>
                                <span className="text-xs text-gray-500 mt-1">{month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Top Hiring Employers</h3>
                    <ul className="space-y-3">
                        {mockTopEmployers.map((employer, i) => (
                            <li key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-800">{i + 1}. {employer.name}</span>
                                <span className="text-sm text-blue-600 font-bold">{employer.placements} Placements</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const NotificationsAnnouncementsView = () => {
    // Re-using full implementation from previous step
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('All');
    const [isSending, setIsSending] = useState(false);
    const [sentMessage, setSentMessage] = useState(null);

    const targetRoles = [
        { value: 'All', label: 'All Users (Students & Employers)' },
        { value: 'Students', label: 'Only Students' },
        { value: 'Employers', label: 'Only Employers' },
        { value: 'Pending', label: 'Pending Accounts' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSending(true);
        setSentMessage(null);

        setTimeout(() => {
            const mockAnnouncement = {
                id: Date.now(),
                title,
                message,
                target,
                timestamp: new Date().toLocaleString(),
            };

            console.log("Announcement Sent:", mockAnnouncement);
            setSentMessage(mockAnnouncement);
            setTitle('');
            setMessage('');
            setTarget('All');
            setIsSending(false);
        }, 1500);
    };

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Send Announcements 📢</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Broadcast important news, policy changes, or system updates to specific user groups. (🚀 **Notification System**)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Announcement Composer */}
                <div className="lg:col-span-2 bg-white rounded-xl border-2 border-gray-100 p-6 shadow-xl">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">Compose Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="target-role" className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <select
                                id="target-role"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                                required
                            >
                                {targetRoles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title / Subject</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., New Resume Policy Update"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
                                required
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your full announcement here..."
                                rows="6"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${isSending ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {isSending ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane"></i>
                                    <span>Send Announcement</span>
                                </>
                            )}
                        </button>
                    </form>

                    {sentMessage && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                            <i className="fa-solid fa-circle-check mr-2"></i>
                            Announcement successfully broadcast to **{sentMessage.target}**!
                            <div className="text-xs mt-1 text-gray-600">Time: {sentMessage.timestamp}</div>
                        </div>
                    )}
                </div>

                {/* Announcement History/Status */}
                <div className="lg:col-span-1 bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Recent History</h2>
                    <ul className="space-y-3 text-sm text-gray-700">
                        <li className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <span className="font-semibold block">System Maintenance Alert</span>
                            <span className="text-xs text-gray-500">Sent to All Users, 5 hours ago.</span>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <span className="font-semibold block">Internship Fair Date Change</span>
                            <span className="text-xs text-gray-500">Sent to Only Students, 1 day ago.</span>
                        </li>
                        <li className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <span className="font-semibold block">New Policy: Vetting Guidelines</span>
                            <span className="text-xs text-gray-500">Sent to Only Employers, 3 days ago.</span>
                        </li>
                    </ul>
                    <button className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        View Full Announcement Log
                    </button>
                </div>
            </div>
        </div>
    );
};

const SystemSettingsView = () => {
    // Re-using full implementation from previous step
    const [emailNotification, setEmailNotification] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [defaultRole, setDefaultRole] = useState('student');

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">System Settings ⚙️</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Configure core application settings, user permissions, and maintenance status.
            </p>

            <div className="space-y-6">
                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">General Configuration</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <label className="text-gray-700 font-medium">Email Notifications</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={emailNotification} onChange={() => setEmailNotification(!emailNotification)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{emailNotification ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b">
                            <label className="text-gray-700 font-medium">Portal Maintenance Mode</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                <span className={`ml-3 text-sm font-medium ${maintenanceMode ? 'text-red-600' : 'text-gray-900'}`}>{maintenanceMode ? 'ACTIVE' : 'OFF'}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">User Access & Defaults</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="default-role" className="text-gray-700 font-medium">Default New User Role</label>
                            <select
                                id="default-role"
                                value={defaultRole}
                                onChange={(e) => setDefaultRole(e.target.value)}
                                className="px-4 py-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow w-48"
                            >
                                <option value="student">Student</option>
                                <option value="employer">Employer</option>
                                <option value="officer">Admin Officer</option>
                            </select>
                        </div>
                        <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                            Save Configuration Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ⭐ New View: RBAC and User Management (🚀 1)
const RbacAndUsersView = () => {
    const [roles, setRoles] = useState(mockRoles);
    // permissionsList is not needed here as we use mockRoles structure

    const getPermissionsBadge = (permission) => {
        const color = permission.startsWith('APPROVE') ? 'bg-green-100 text-green-800' : 
                      permission.startsWith('VIEW') ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 text-xs font-semibold rounded ${color} mr-1 my-0.5 inline-block`}>{permission.replace('_', ' ')}</span>;
    };

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">RBAC & User Management 🔐</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Define and manage security roles for all administrative staff and sub-admins.
            </p>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">Defined Roles ({roles.length})</h2>
                <div className="space-y-4">
                    {roles.map(role => (
                        <div key={role.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                            <div>
                                <span className="text-xl font-bold text-gray-900 block">{role.name}</span>
                                <div className="mt-2 text-sm">
                                    {role.permissions.map(p => getPermissionsBadge(p))}
                                </div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit Role</button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                 <h2 className="text-2xl font-bold text-green-800 mb-4 border-b pb-2">Quick Action: Add New Sub-Admin</h2>
                 <p className="text-gray-600 mb-4">Assign a new user to a defined role.</p>
                 {/* Mock form elements for adding a new user */}
                 <div className="flex flex-wrap gap-4">
                    <input type="text" placeholder="Sub-Admin Email" className="flex-1 min-w-[200px] p-2 border rounded-lg" />
                    <select className="p-2 border rounded-lg">
                         <option>Select Role</option>
                         {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">Create User</button>
                 </div>
            </div>
        </div>
    );
};

// ⭐ New View: Activity and Audit Logs (🚀 7 & 8)
const AuditLogsView = () => {
    const [logs, setLogs] = useState(mockActivityLogs);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Success': return 'bg-green-100 text-green-800 border-green-500';
            case 'Warning': return 'bg-red-100 text-red-800 border-red-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    return (
        <div className="animate-content-fade-in">
            <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">Activity & Audit Logs 📋</h1>
            <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
            <p className="mb-6 text-lg text-gray-600 font-medium">
                Comprehensive, tamper-proof record of every action taken within the portal.
            </p>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Timestamp', 'User', 'Action Type', 'Details', 'Status'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {log.action.replace('_', ' ')}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{log.details}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PlaceholderView = ({ title }) => (
    <div className="animate-content-fade-in">
        <h1 className="text-3xl lg:text-4xl text-gray-800 font-extrabold tracking-tight mb-2">{title}</h1>
        <hr className="w-full h-0.5 bg-blue-100 my-4 border-none" />
        <div className="p-8 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-800 font-medium text-lg shadow-inner">
            <i className="fa-solid fa-screwdriver-wrench mr-3 animate-spin-slow"></i>
            This is the dedicated management page for <span className="font-bold">{title}</span>. Full features will be integrated here soon.
        </div>
    </div>
);

const LogoutModal = ({ show, onConfirm, onCancel }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl p-8 w-11/12 max-w-md shadow-2xl transform transition-all duration-300 scale-100 animate-pop-in">
                <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                    <i className="fa-solid fa-sign-out-alt mr-3"></i> Confirm Logout
                </h3>
                <p className="text-gray-700 mb-6">
                    Are you sure you want to log out of the SkillBridge Admin Portal?
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-500/50"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const AdminPortal = () => {
    const [activeView, setActiveView] = useState('audit-logs'); // Setting to a new view for showcasing
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(initialMetrics);
    const [isCollapsed, setIsCollapsed] = useState(false); 

    // Mock User Data for the new profile section
    const userProfile = {
        name: "Praveen K.",
        role: "Administrator",
        initials: "PK", // Used for the mock profile picture
    };

    // Simulate dynamic data fetching for the dashboard metrics
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            const fetchedMetrics = [
                { label: "Total Students", value: "1,480", color: "blue-500", icon: "fa-solid fa-user-group", trend: { value: '12%', up: true, period: 'this month' } },
                { label: "Registered Employers", value: "215", color: "green-500", icon: "fa-solid fa-user-tie", trend: { value: '8%', up: false, period: 'last month' } },
                { label: "Active Job Postings", value: "450", color: "yellow-500", icon: "fa-solid fa-magnifying-glass", trend: { value: '25', up: true, period: 'last week' } },
                { label: "Pending Approvals", value: "12", color: "red-500", icon: "fa-solid fa-exclamation-triangle", trend: { value: '3', up: false, period: 'yesterday' } },
            ];
            setMetrics(fetchedMetrics);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [activeView]);

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView loading={loading} metrics={metrics} approvals={mockApprovalData} />;
            case 'students':
                return <ManageStudentsView />;
            case 'employers':
                return <ManageEmployersView />;
            case 'jobs':
                return <JobPostingsView />;
            case 'reports':
                return <AnalyticsReportsView />;
            case 'announcements':
                return <NotificationsAnnouncementsView />;
            case 'rbac':
                 return <RbacAndUsersView />; // ⭐ RBAC View
            case 'audit-logs':
                 return <AuditLogsView />; // ⭐ Audit Logs View
            case 'settings':
                return <SystemSettingsView />;
            default:
                return <DashboardView loading={loading} metrics={metrics} approvals={mockApprovalData} />;
        }
    };

    const handleLogout = () => {
        console.log("Admin Logged Out successfully!");
        setShowLogoutModal(false);
    };
    
    // Group links by section
    const groupedLinks = useMemo(() => {
        const groups = {};
        sidebarLinks.forEach(link => {
            const sectionName = link.section || 'General';
            if (!groups[sectionName]) {
                groups[sectionName] = [];
            }
            groups[sectionName].push(link);
        });
        return groups;
    }, []);


    return (
        <>
            {/* CSS Fix: Including Tailwind and Font Awesome CDN links for styling to work */}
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

            {/* Custom CSS and enhanced animations */}
            <style>{`
                /* Softening shadows and ensuring color classes are recognized for JIT/CDN */
                .shadow-lg { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06); }
                .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
                
                .hover\\:shadow-blue-500\\/20:hover { box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.05); }
                .hover\\:shadow-green-500\\/20:hover { box-shadow: 0 10px 20px rgba(16, 185, 129, 0.15), 0 4px 6px -2px rgba(16, 185, 129, 0.05); }
                .hover\\:shadow-yellow-500\\/20:hover { box-shadow: 0 10px 20px rgba(245, 158, 11, 0.15), 0 4px 6px -2px rgba(245, 158, 11, 0.05); }
                .hover\\:shadow-red-500\\/20:hover { box-shadow: 0 10px 20px rgba(239, 68, 68, 0.15), 0 4px 6px -2px rgba(239, 68, 68, 0.05); }
                
                /* Input Focus Rings */
                .focus\\:ring-2:focus { 
                    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); 
                    box-shadow: var(--tw-ring-shadow); 
                }

                /* Custom Toggle Switch Styles */
                input:checked + div {
                    border-color: #3b82f6;
                }

                /* Advanced Animations */
                .animate-content-fade-in {
                    animation: fadeIn 0.8s ease-out;
                }
                .animate-pop-in {
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .animate-spin-slow {
                    animation: spin 6s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="min-h-screen w-full bg-gray-50 flex font-['Inter',_sans-serif]">

                {/* Sidebar (Navigation) ⭐ Collapsible Sidebar Structure ⭐ */}
                <aside className={`bg-blue-800 text-white flex flex-col min-h-screen shadow-xl transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-full sm:w-72'}`}>
                    
                    {/* Header & Collapse Button */}
                    <div className="p-6 pb-0 flex items-center justify-between relative">
                        {!isCollapsed && (
                            <div className="font-extrabold text-2xl tracking-wider text-white truncate">
                                Skill<span className="text-blue-400">Bridge</span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`p-2 rounded-full bg-blue-700 hover:bg-blue-600 transition-colors absolute ${isCollapsed ? 'left-1/2 transform -translate-x-1/2' : 'right-4'}`}
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <i className={`fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'} text-white text-base`}></i>
                        </button>
                    </div>

                    {!isCollapsed && (
                         <div className="text-base font-medium text-blue-200 text-center mt-1 mb-6">Admin Portal</div>
                    )}
                    
                    {/* Navigation Links (Grouped) */}
                    <nav className="w-full mt-4 flex-grow space-y-4 px-4 overflow-y-auto">
                        {Object.entries(groupedLinks).map(([section, links]) => (
                            <div key={section} className="space-y-1">
                                {!isCollapsed && (
                                    <h3 className="text-xs uppercase font-bold text-blue-400 ml-3 tracking-widest pt-2 pb-1 border-t border-blue-700/50">{section}</h3>
                                )}
                                {links.map((link) => {
                                    const isActive = activeView === link.id;
                                    return (
                                        <div
                                            key={link.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setActiveView(link.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && setActiveView(link.id)}
                                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'p-3.5 gap-4'} cursor-pointer rounded-xl font-semibold text-lg transition-all duration-300 
                                            ${isActive
                                                ? 'bg-white text-blue-800 shadow-lg ring-4 ring-blue-500/20' // Enhanced active link style
                                                : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`
                                            }
                                            title={link.label}
                                        >
                                            <i className={`${link.icon} text-xl ${isCollapsed ? 'w-auto' : 'w-6 text-center'}`}></i>
                                            {!isCollapsed && <span className="truncate">{link.label}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* Profile and Log Out Button at the bottom */}
                    <div className={`p-4 pt-0 mt-auto transition-all duration-300 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                        
                        {/* Profile Info */}
                        <div className={`flex items-center mb-4 p-3 rounded-xl bg-blue-700/70 ${isCollapsed ? 'flex-col p-2' : 'w-full'}`}>
                             {/* Profile Picture / Initials */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-blue-400 text-blue-900 font-bold ${isCollapsed ? 'text-xl mb-2 w-8 h-8' : 'mr-3'}`}>
                                {userProfile.initials}
                            </div>
                            
                            {/* User Role and Name */}
                            {!isCollapsed && (
                                <div className="flex flex-col text-sm truncate">
                                    <span className="font-bold text-white truncate">{userProfile.role}</span>
                                    <span className="text-xs text-blue-200 truncate">{userProfile.name}</span>
                                </div>
                            )}
                        </div>

                        {/* Log Out Button */}
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'w-full p-3.5 gap-4'} cursor-pointer rounded-xl font-semibold text-lg text-blue-200 bg-blue-900/50 transition-colors duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg`}
                            title="Log Out"
                        >
                            <i className={`fa-solid fa-arrow-right-from-bracket text-xl ${isCollapsed ? 'w-auto' : 'w-6 text-center'}`}></i>
                            {!isCollapsed && <span>Log Out</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area: FIXED CLASS FOR BACKGROUND ISSUE */}
                <main className="flex-1 min-h-screen overflow-y-auto bg-gray-50 p-4 md:p-8 lg:p-12">
                    <div className="w-full bg-white rounded-2xl p-6 lg:p-10 shadow-xl border border-gray-100">
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutModal
                show={showLogoutModal}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </>
    );
};

export default AdminPortal;