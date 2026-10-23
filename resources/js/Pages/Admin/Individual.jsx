import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import ModalIndividual from '../Modal/ModalIndividual';

import { 
    FaSearch, 
    FaPlus, 
    FaChevronRight, 
    FaMapMarkerAlt, 
    FaStore, 
    FaBriefcase,
    FaEye, 
    FaHandHoldingUsd, 
    FaChartLine, 
    FaCheckCircle, 
    FaFilter, 
    FaThLarge, 
    FaList, 
    FaUser, 
    FaGraduationCap
} from 'react-icons/fa';

export default function Individual({
    individual = [],
    associations = [],
    enterprises = [],
    tracks = [],
    municipalities = [],
    barangays = []
}) {
    const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
    // Lifecycle steps definition matching SLP specifications
    const LIFECYCLE_STEPS = [
        { id: 1, label: 'Registration' },
        { id: 2, label: 'Assessment & Validation' },
        { id: 3, label: 'Track Planning & Profiling' },
        { id: 4, label: 'Project / Training Approval' },
        { id: 5, label: 'Fund Release (SCF / EAF)' },
        { id: 6, label: 'Establishment / Training' },
        { id: 7, label: 'Operation / Employment' },
        { id: 8, label: 'Monitoring & Evaluation' },
        { id: 9, label: 'Status Assessment' }
    ];

    // --- Initial Data with Track Support (MD & EF) ---
    const initialParticipants = useMemo(() => {
        if (individual && individual.length > 0) return individual;
        return [
            {
                id: 1,
                fullName: 'Juana Dela Cruz',
                sex: 'Female',
                track: 'MD', // Micro-Enterprise Development
                address: 'Purok 3, Lower Poblacion',
                contactNumber: '09179876543',
                municipality: 'Kapatagan',
                barangay: 'Barangay Poblacion',
                lifecycleStep: 7, // Business Operation
                statusAssessment: 'Mainstreaming',
                fundReleased: true,
                fundAmount: 15000,
                enterprise: {
                    name: 'Juana Sari-Sari & Rice Trading',
                    type: 'Consumer Retail & Trading',
                    businessLocation: 'Purok 3, Barangay Poblacion, Kapatagan'
                },
                created_at: '2026-01-10'
            },
            {
                id: 2,
                fullName: 'Rolando Catubig',
                sex: 'Male',
                track: 'EF', // Employment Facilitation
                address: 'Sitio Seaside, Zone 1',
                contactNumber: '09281234567',
                municipality: 'Baroy',
                barangay: 'Barangay Riverside',
                lifecycleStep: 4, // Project Approval
                statusAssessment: 'Pending',
                fundReleased: false,
                fundAmount: 10000,
                employment: {
                    targetJob: 'Heavy Equipment Operator',
                    skillsTraining: 'TESDA NC II Driving & Heavy Machinery',
                    preferredEmployer: 'Local Infrastructure Corp'
                },
                created_at: '2026-02-01'
            }
        ];
    }, [individual]);

    // --- Component State ---
    const [participantList, setParticipantList] = useState(initialParticipants);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMunicipality, setSelectedMunicipality] = useState('All');
    const [selectedTrackFilter, setSelectedTrackFilter] = useState('All'); // 'All' | 'MD' | 'EF'

    // Lifecycle Progression Handler
    const handleAdvanceLifecycle = (id, currentStep) => {
        if (currentStep >= 9) return;
        
        setParticipantList(prevList =>
            prevList.map(item => {
                if (item.id === id) {
                    const nextStep = item.lifecycleStep + 1;
                    let nextStatus = item.statusAssessment;
                    
                    // Auto-update status upon reaching key milestones
                    if (nextStep >= 7 && item.statusAssessment === 'Pending') {
                        nextStatus = 'Mainstreaming';
                    }
                    if (nextStep === 5) {
                        item.fundReleased = true;
                    }

                    return {
                        ...item,
                        lifecycleStep: nextStep,
                        statusAssessment: nextStatus
                    };
                }
                return item;
            })
        );
    };

    // --- Metrics Calculation ---
    const metrics = useMemo(() => {
        const total = participantList.length;
        const mdCount = participantList.filter(p => p.track === 'MD').length;
        const efCount = participantList.filter(p => p.track === 'EF').length;
        const fundCount = participantList.filter(p => p.fundReleased).length;
        const mainstreamed = participantList.filter(p => p.statusAssessment === 'Mainstreaming').length;
        return { total, mdCount, efCount, fundCount, mainstreamed };
    }, [participantList]);

    // --- Search & Filter Logic ---
    const filteredParticipants = useMemo(() => {
        return participantList.filter(item => {
            const matchesSearch = 
                item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.barangay.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.enterprise?.name && item.enterprise.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.employment?.targetJob && item.employment.targetJob.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesMunicipality = selectedMunicipality === 'All' || item.municipality === selectedMunicipality;
            const matchesTrack = selectedTrackFilter === 'All' || item.track === selectedTrackFilter;

            return matchesSearch && matchesMunicipality && matchesTrack;
        });
    }, [participantList, searchQuery, selectedMunicipality, selectedTrackFilter]);

    return (
        <Layout>
            <Head title="SLP Individual Participant Workflow" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Modern Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">Manage</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">SLP</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">Individual Participants (MD / EF)</span>
                </nav>

                {/* Banner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-xl">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                <FaStore className="text-[10px]" /> Micro-Enterprise Development (MD)
                            </span>
                            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                                <FaBriefcase className="text-[10px]" /> Employment Facilitation (EF)
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Individual Participant Lifecycle</h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                            Register individual SLP participants under MD (Seed Capital) or EF (Employment Assistance), track their multi-step lifecycle, and monitor sustainability.
                        </p>
                    </div>


                <button
                type="button"
                onClick={() => setIsIndividualModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-500/20 hover:bg-green-500 hover:shadow-md hover:shadow-green-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 active:scale-[0.98] transition-all duration-200"
                >
                <FaPlus className="h-4 w-4 shrink-0" />
                <span>Register Participant</span>
                </button>
                </div>

                {/* Track Selector Tabs / Quick Filter */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                        onClick={() => setSelectedTrackFilter('All')}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            selectedTrackFilter === 'All'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All Tracks ({metrics.total})
                    </button>
                    <button
                        onClick={() => setSelectedTrackFilter('MD')}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedTrackFilter === 'MD'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                    >
                        <FaStore className="text-[11px]" /> Micro-Enterprise (MD) ({metrics.mdCount})
                    </button>
                    <button
                        onClick={() => setSelectedTrackFilter('EF')}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            selectedTrackFilter === 'EF'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                    >
                        <FaBriefcase className="text-[11px]" /> Employment Facilitation (EF) ({metrics.efCount})
                    </button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <FaUser className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Participants</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.total} Registered</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FaHandHoldingUsd className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Funds Disbursed</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.fundCount} Beneficiaries</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FaBriefcase className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">EF Participants</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.efCount} Employment</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <FaChartLine className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Mainstreamed</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.mainstreamed} Sustainable</h4>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search name, barangay, or project/job..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-slate-400 text-xs" />
                            <select
                                value={selectedMunicipality}
                                onChange={(e) => setSelectedMunicipality(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                                <option value="All">All Municipalities</option>
                                <option value="Kapatagan">Kapatagan</option>
                                <option value="Baroy">Baroy</option>
                            </select>
                        </div>

                        {/* View Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <FaThLarge />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white text-emerald-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <FaList />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- GRID VIEW --- */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredParticipants.map((item) => (
                            <div 
                                key={item.id}
                                className="bg-white border border-slate-200/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Top Metadata & Track Badge */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            {item.track === 'MD' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <FaStore className="text-[10px]" /> MD Track
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                    <FaBriefcase className="text-[10px]" /> EF Track
                                                </span>
                                            )}
                                        </div>

                                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                            item.statusAssessment === 'Mainstreaming' 
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : item.statusAssessment === 'Rehabilitation'
                                                ? 'bg-amber-100 text-amber-800'
                                                : item.statusAssessment === 'Closure'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {item.statusAssessment || 'Pending Evaluation'}
                                        </span>
                                    </div>

                                    {/* Participant Name & Location */}
                                    <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">
                                        {item.fullName} <span className="text-xs font-normal text-slate-400">({item.sex})</span>
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                        <FaMapMarkerAlt className="text-slate-400" />
                                        <span>{item.barangay}, {item.municipality}</span>
                                    </div>

                                    {/* Track Specific Info Block */}
                                    {item.track === 'MD' ? (
                                        item.enterprise?.name ? (
                                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs mb-4 space-y-1">
                                                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                                                    <FaStore className="text-emerald-600" /> {item.enterprise.name}
                                                </p>
                                                <p className="text-[11px] text-emerald-800">{item.enterprise.type}</p>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 mb-4 text-center">
                                                Enterprise Plan Pending
                                            </div>
                                        )
                                    ) : (
                                        item.employment?.targetJob ? (
                                            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs mb-4 space-y-1">
                                                <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                                                    <FaBriefcase className="text-indigo-600" /> {item.employment.targetJob}
                                                </p>
                                                <p className="text-[11px] text-indigo-800 flex items-center gap-1">
                                                    <FaGraduationCap className="text-indigo-500" /> {item.employment.skillsTraining}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 mb-4 text-center">
                                                Employment Plan Pending
                                            </div>
                                        )
                                    )}

                                    {/* Lifecycle Progress Bar */}
                                    <div className="space-y-1 mb-4">
                                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase">
                                            <span>Stage: {LIFECYCLE_STEPS.find(s => s.id === item.lifecycleStep)?.label}</span>
                                            <span>{item.lifecycleStep} / 9</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-300 ${item.track === 'MD' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${(item.lifecycleStep / 9) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Controls */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 cursor-pointer">
                                        <FaEye /> Dossier
                                    </button>

                                    {item.lifecycleStep < 9 ? (
                                        <button
                                            onClick={() => handleAdvanceLifecycle(item.id, item.lifecycleStep)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            <span>Advance Stage</span>
                                            <FaChevronRight className="text-[10px]" />
                                        </button>
                                    ) : (
                                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                            <FaCheckCircle /> Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- TABLE VIEW --- */}
                {viewMode === 'table' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Participant Name</th>
                                        <th className="px-4 py-3">Track</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3">Project / Target Job</th>
                                        <th className="px-4 py-3">Fund Status</th>
                                        <th className="px-4 py-3">Lifecycle Stage</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredParticipants.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800">{item.fullName}</div>
                                                <div className="text-[10px] text-slate-400">{item.sex} • {item.contactNumber}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    item.track === 'MD' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {item.track}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-700">{item.barangay}</div>
                                                <div className="text-[10px] text-slate-400">{item.municipality}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-800">
                                                {item.track === 'MD' ? (item.enterprise?.name || 'Pending Plan') : (item.employment?.targetJob || 'Pending Target')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    item.fundReleased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {item.fundReleased ? `Released (₱${item.fundAmount?.toLocaleString()})` : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-600">
                                                Step {item.lifecycleStep}: {LIFECYCLE_STEPS.find(s => s.id === item.lifecycleStep)?.label}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                    item.statusAssessment === 'Mainstreaming' 
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : item.statusAssessment === 'Rehabilitation'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : item.statusAssessment === 'Closure'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.statusAssessment || 'Pending Evaluation'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-md transition-colors">
                                                        <FaEye />
                                                    </button>
                                                    {item.lifecycleStep < 9 ? (
                                                        <button
                                                            onClick={() => handleAdvanceLifecycle(item.id, item.lifecycleStep)}
                                                            className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600 text-white rounded-md text-[11px] font-medium transition-colors"
                                                        >
                                                            Advance
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                                                            <FaCheckCircle /> Done
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
<ModalIndividual
    isOpen={isIndividualModalOpen}
    onClose={() => setIsIndividualModalOpen(false)}
    individualData={null}
    municipalities={municipalities}
    barangays={barangays}
    onAddParticipant={(newParticipant) => {
        setParticipantList(prev => [newParticipant, ...prev]);
    }}
/>
        </Layout>
    );
}