import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import { 
    FaSearch, 
    FaChevronRight, 
    FaMapMarkerAlt, 
    FaBuilding, 
    FaUsers, 
    FaFilter,
    FaCalendarAlt,
    FaSync,
    FaChartLine,
    FaProjectDiagram,
    FaHandHoldingHeart,
    FaDownload,
    FaPlus,
    FaEdit,
    FaTrash
} from 'react-icons/fa';

// Chart.js registration
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Dashboard() {
    // Filter States
    const [filters, setFilters] = useState({
        year: '2026',
        lgu: 'all',
        barangay: 'all',
        participant: 'all',
        search: ''
    });

    // Sample Recent Projects Data
    const projects = [
        {
            id: 'PRJ-2026-001',
            title: 'Poblacion Sustainable Micro-Enterprise',
            lgu: 'Kapatagan',
            barangay: 'Poblacion',
            track: 'Micro-Enterprise (Individual)',
            participants: 45,
            status: 'Ongoing',
            budget: '₱450,000'
        },
        {
            id: 'PRJ-2026-002',
            title: 'San Jose Weavers Association Project',
            lgu: 'Lala',
            barangay: 'San Jose',
            track: 'Association Enterprise',
            participants: 120,
            status: 'Completed',
            budget: '₱1,200,000'
        },
        {
            id: 'PRJ-2026-003',
            title: 'Tubod Coastal Employment Facilitation',
            lgu: 'Tubod',
            barangay: 'Santa Maria',
            track: 'Employment Facilitation',
            participants: 85,
            status: 'Ongoing',
            budget: '₱680,000'
        },
        {
            id: 'PRJ-2026-004',
            title: 'Lala Agricultural Livelihood Grant',
            lgu: 'Lala',
            barangay: 'Poblacion',
            track: 'Micro-Enterprise (Individual)',
            participants: 30,
            status: 'Pending',
            budget: '₱300,000'
        }
    ];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({
            year: '2026',
            lgu: 'all',
            barangay: 'all',
            participant: 'all',
            search: ''
        });
    };

    // Chart Data: Line Graph (Project Performance Trends)
    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Individual Modality',
                data: [65, 78, 90, 81, 95, 110, 125, 130, 142, 150, 165, 180],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            },
            {
                label: 'Association Track',
                data: [40, 48, 52, 60, 75, 88, 94, 99, 105, 112, 120, 135],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.04)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 8,
                    usePointStyle: true,
                    font: { size: 11, family: 'Inter, sans-serif' },
                    color: '#64748b'
                }
            },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, color: '#94a3b8' }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: { font: { size: 11 }, color: '#94a3b8' },
                border: { dash: [4, 4] }
            }
        }
    };

    // Chart Data: Pie / Doughnut (Modalities & Beneficiary Split)
    const pieChartData = {
        labels: ['Micro-Enterprise (Individual)', 'Employment Facilitation', 'Association Enterprise'],
        datasets: [
            {
                data: [45, 30, 25],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                hoverOffset: 6,
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        ]
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    font: { size: 11, family: 'Inter, sans-serif' },
                    color: '#64748b',
                    padding: 15
                }
            }
        },
        cutout: '70%'
    };

    return (
        <Layout>
            <Head title="Analytics Dashboard" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Navigation Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">Analytics</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">SLP Overview</span>
                </nav>

                {/* Dashboard Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            SLP Analytics Dashboard
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Real-time tracking of project distributions, beneficiary numbers, and regional metrics.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                    >
                        <FaDownload className="text-xs text-slate-400" />
                        <span>Export Report</span>
                    </button>
                </div>

                {/* Key Performance Indicators (KPI Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard 
                        title="Total Projects" 
                        value="1,420" 
                        badge="+12.5%" 
                        isPositive={true}
                        icon={FaProjectDiagram} 
                    />
                    <KpiCard 
                        title="Active Participants" 
                        value="28,450" 
                        badge="+8.2%" 
                        isPositive={true}
                        icon={FaUsers} 
                    />
                    <KpiCard 
                        title="Covered LGUs" 
                        value="24" 
                        badge="100% Target" 
                        isPositive={true}
                        icon={FaBuilding} 
                    />
                    <KpiCard 
                        title="Barangay Reach" 
                        value="312" 
                        badge="Active Coverage" 
                        isPositive={true}
                        icon={FaMapMarkerAlt} 
                    />
                </div>

                {/* Project Filtering Control Bar */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <FaFilter className="text-emerald-600" />
                            <span>Project Filter Panel</span>
                        </div>
                        <button
                            onClick={resetFilters}
                            className="text-[11px] font-medium text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer"
                        >
                            <FaSync className="text-[10px]" /> Reset Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Year Filter */}
                        <div className="relative">
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                            >
                                <option value="2026">Year: 2026</option>
                                <option value="2025">Year: 2025</option>
                                <option value="2024">Year: 2024</option>
                            </select>
                            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* LGU Filter */}
                        <div className="relative">
                            <select
                                name="lgu"
                                value={filters.lgu}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                            >
                                <option value="all">All LGUs / Municipalities</option>
                                <option value="kapatagan">Kapatagan</option>
                                <option value="lala">Lala</option>
                                <option value="tubod">Tubod</option>
                            </select>
                            <FaBuilding className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Barangay Filter */}
                        <div className="relative">
                            <select
                                name="barangay"
                                value={filters.barangay}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                            >
                                <option value="all">All Barangays</option>
                                <option value="poblacion">Poblacion</option>
                                <option value="san_jose">San Jose</option>
                                <option value="santa_maria">Santa Maria</option>
                            </select>
                            <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Participant Filter */}
                        <div className="relative">
                            <select
                                name="participant"
                                value={filters.participant}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-pointer"
                            >
                                <option value="all">All Participants</option>
                                <option value="individual">Individual Enrollees</option>
                                <option value="association">Association Members</option>
                                <option value="pantawid">4Ps Beneficiaries</option>
                            </select>
                            <FaUsers className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search keyword..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Project Growth Line Graph */}
                    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <FaChartLine className="text-emerald-600" />
                                    <span>Project Implementation Trends</span>
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Monthly progress tracking for Individual vs Association modalities
                                </p>
                            </div>
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                Year {filters.year}
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Right: Modalities Pie/Doughnut Chart */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <FaHandHoldingHeart className="text-emerald-600" />
                                <span>Modality Distribution</span>
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Proportion by active project categories
                            </p>
                        </div>

                        <div className="h-64 w-full my-auto flex items-center justify-center">
                            <Doughnut data={pieChartData} options={pieChartOptions} />
                        </div>
                    </div>

                </div>

                {/* Detailed Projects Data Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">
                                Recent Project Implementations
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Detailed breakdown of active and completed community projects
                            </p>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer self-start sm:self-auto"
                        >
                            <FaPlus className="text-[10px]" />
                            <span>New Project</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">Project Details</th>
                                    <th className="px-5 py-3.5">Location</th>
                                    <th className="px-5 py-3.5">Track / Modality</th>
                                    <th className="px-5 py-3.5">Participants</th>
                                    <th className="px-5 py-3.5">Allocated Budget</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/60 transition">
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-slate-800">{project.title}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{project.id}</div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="text-slate-700">{project.barangay}</div>
                                            <div className="text-[10px] text-slate-400">{project.lgu}</div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="text-slate-600">{project.track}</span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {project.participants} Beneficiaries
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                                            {project.budget}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                project.status === 'Completed'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : project.status === 'Ongoing'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                                    title="Edit Project"
                                                >
                                                    <FaEdit className="text-xs" />
                                                </button>
                                                <button 
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                                    title="Delete Project"
                                                >
                                                    <FaTrash className="text-xs" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Layout>
    );
}

// KPI Card Helper Component
function KpiCard({ title, value, badge, isPositive, icon: Icon }) {
    return (
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                    {badge}
                </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 text-base">
                <Icon className="text-emerald-600" />
            </div>
        </div>
    );
}