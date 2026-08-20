import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import ModalAssociation from '../Modal/ModalAssociation';

import { 
    FaSearch, 
    FaPlus, 
    FaChevronRight, 
    FaBuilding, 
    FaMapMarkerAlt, 
    FaUsers, 
    FaFilter,
    FaThLarge,
    FaList,
    FaCheckCircle,
    FaStore,
    FaChartLine,
    FaEye
} from 'react-icons/fa';

export default function Association({ associations = [], filters = {} }) {
    // --- Mock Initial Data following the SLP Lifecycle ---
    const initialAssociations = useMemo(() => {
        if (associations && associations.length > 0) return associations;
        return [
            {
                id: 1,
                name: 'Kapatagan Agrarian Reform Farmers Association',
                lgu: 'Kapatagan',
                barangay: 'Barangay Poblacion',
                dateOrganized: '2024-03-15',
                yearImplemented: '2024',
                officers: {
                    president: 'Maria Santos',
                    vicePresident: 'Juan Dela Cruz',
                    secretary: 'Elena Ramos',
                    treasurer: 'Roberto Gomez'
                },
                members: [
                    { id: 101, name: 'Clara Torres', gender: 'Female', contact: '09171234567', status: 'Active' },
                    { id: 102, name: 'Pedro Penduko', gender: 'Male', contact: '09187654321', status: 'Active' },
                    { id: 103, name: 'Ana Batungbakal', gender: 'Female', contact: '09191112223', status: 'Active' }
                ],
                enterprise: {
                    name: 'Kapatagan Organic High-Crop Farming',
                    type: 'Agriculture Processing & Trading',
                    startDate: '2024-06-01'
                },
                lifecycleStep: 5,
                statusAssessment: 'Mainstreaming',
                seedCapitalReleased: true,
                created_at: '2024-03-15'
            },
            {
                id: 2,
                name: 'Baroy Coastal Fisherfolk SLP Association',
                lgu: 'Baroy',
                barangay: 'Barangay Riverside',
                dateOrganized: '2025-01-20',
                yearImplemented: '2025',
                officers: {
                    president: 'Danilo Reyes',
                    vicePresident: 'Simeon Cruz',
                    secretary: 'Grace Poe',
                    treasurer: 'Maricar Diaz'
                },
                members: [
                    { id: 201, name: 'Gabriel Concepcion', gender: 'Male', contact: '09203334445', status: 'Active' },
                    { id: 202, name: 'Vilma Santos', gender: 'Female', contact: '09215556667', status: 'Active' }
                ],
                enterprise: {
                    name: 'Baroy Smoked Fish & Aquatic Processing Enterprise',
                    type: 'Agri-Fishery Processing',
                    startDate: '2025-03-10'
                },
                lifecycleStep: 3,
                statusAssessment: 'Pending',
                seedCapitalReleased: false,
                created_at: '2025-01-20'
            }
        ];
    }, [associations]);

    // --- State Management ---
    const [associationList, setAssociationList] = useState(initialAssociations);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedLgu, setSelectedLgu] = useState('All');

    // Modals state
    const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewingAssociation, setViewingAssociation] = useState(null);

    // --- Calculations / Metrics ---
    const metrics = useMemo(() => {
        const total = associationList.length;
        const totalMembers = associationList.reduce((acc, a) => acc + (a.members?.length || 0), 0);
        const mainstreamed = associationList.filter(a => a.statusAssessment === 'Mainstreaming').length;
        const activeEnterprises = associationList.filter(a => a.enterprise?.name).length;
        return { total, totalMembers, mainstreamed, activeEnterprises };
    }, [associationList]);

    // --- Filtering ---
    const filteredAssociations = useMemo(() => {
        return associationList.filter(item => {
            const matchesSearch = 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.lgu.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.barangay.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLgu = selectedLgu === 'All' || item.lgu === selectedLgu;
            return matchesSearch && matchesLgu;
        });
    }, [associationList, searchQuery, selectedLgu]);

    // Submission Handler called by ModalAssociation
    const handleCreateAssociation = (wizardData) => {
        const newAssoc = {
            id: Date.now(),
            ...wizardData,
            lifecycleStep: 3,
            statusAssessment: 'Pending',
            seedCapitalReleased: false,
            created_at: new Date().toISOString().split('T')[0]
        };

        setAssociationList(prev => [newAssoc, ...prev]);
    };

    // Lifecycle Progression Handler
    const handleAdvanceLifecycle = (assocId, currentStep) => {
        setAssociationList(prev => prev.map(item => {
            if (item.id === assocId) {
                const nextStep = Math.min(currentStep + 1, 8);
                let seedReleased = item.seedCapitalReleased;
                if (nextStep >= 5) seedReleased = true;
                return { ...item, lifecycleStep: nextStep, seedCapitalReleased: seedReleased };
            }
            return item;
        }));
    };

    // --- Detailed View Modal ---
    const handleOpenDetailModal = (assoc) => {
        setViewingAssociation(assoc);
        setIsDetailModalOpen(true);
    };

    return (
        <Layout>
            <Head title="SLP Associations & Enterprise Workflow" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Modern Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">Manage</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">SLP</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">Associations (MD Modality)</span>
                </nav>

                {/* Banner / Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-xl">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                <FaStore className="text-[10px]" /> Micro-Enterprise Development (MD)
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">SLP Association & Enterprise Lifecycle</h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                            Register participant associations, onboard officers and members, establish community enterprises, release seed capital, and track M&E status assessments.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsWizardModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <FaPlus className="text-xs" />
                        <span>Register New Association</span>
                    </button>
                </div>

                {/* Metrics Ribbon */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <FaBuilding className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Associations</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.total} Registered</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FaUsers className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Active Participants</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.totalMembers} Members</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <FaStore className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Created Enterprises</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.activeEnterprises} Operational</h4>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <FaChartLine className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Mainstreamed Status</p>
                            <h4 className="text-xl font-bold text-slate-800">{metrics.mainstreamed} High Performing</h4>
                        </div>
                    </div>
                </div>

                {/* Controls Bar: Search & Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search association, LGU, or barangay..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-slate-400 text-xs" />
                            <select
                                value={selectedLgu}
                                onChange={(e) => setSelectedLgu(e.target.value)}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                                <option value="All">All LGUs / Municipalities</option>
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
                        {filteredAssociations.map((assoc) => (
                            <div 
                                key={assoc.id}
                                className="bg-white border border-slate-200/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <FaBuilding className="text-[10px]" />
                                            Assoc #{assoc.id}
                                        </span>

                                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                            assoc.statusAssessment === 'Mainstreaming' 
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : assoc.statusAssessment === 'Rehabilitation'
                                                ? 'bg-amber-100 text-amber-800'
                                                : assoc.statusAssessment === 'Closure'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {assoc.statusAssessment || 'Pending Assessment'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 
                                        onClick={() => handleOpenDetailModal(assoc)}
                                        className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-1 line-clamp-2 cursor-pointer"
                                    >
                                        {assoc.name}
                                    </h3>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                        <FaMapMarkerAlt className="text-slate-400" />
                                        <span>{assoc.barangay}, {assoc.lgu}</span>
                                    </div>

                                    {/* Officers Snippet */}
                                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5 border border-slate-100 mb-4">
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span className="text-[11px] text-slate-400 font-medium">President:</span>
                                            <span className="font-semibold text-slate-800">{assoc.officers?.president || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-slate-600">
                                            <span className="text-[11px] text-slate-400 font-medium">Members Onboarded:</span>
                                            <span className="font-semibold text-emerald-700">{assoc.members?.length || 0} Registered</span>
                                        </div>
                                    </div>

                                    {/* Enterprise Status Block */}
                                    {assoc.enterprise?.name ? (
                                        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs mb-4 space-y-1">
                                            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                                                <FaStore className="text-emerald-600" /> {assoc.enterprise.name}
                                            </p>
                                            <p className="text-[11px] text-emerald-800">{assoc.enterprise.type}</p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 mb-4 text-center">
                                            Enterprise Pending Creation
                                        </div>
                                    )}

                                    {/* Mini SLP Flow Progress */}
                                    <div className="space-y-1 mb-4">
                                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase">
                                            <span>SLP Workflow Progress</span>
                                            <span>Step {assoc.lifecycleStep || 1} / 8</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                                                style={{ width: `${((assoc.lifecycleStep || 1) / 8) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Actions & Lifecycle Advance */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        onClick={() => handleOpenDetailModal(assoc)}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 cursor-pointer"
                                    >
                                        <FaEye /> Full View
                                    </button>

                                    {assoc.lifecycleStep < 8 ? (
                                        <button
                                            onClick={() => handleAdvanceLifecycle(assoc.id, assoc.lifecycleStep)}
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
                                        <th className="px-4 py-3">Association / Location</th>
                                        <th className="px-4 py-3">President</th>
                                        <th className="px-4 py-3">Members</th>
                                        <th className="px-4 py-3">Community Enterprise</th>
                                        <th className="px-4 py-3">Seed Capital</th>
                                        <th className="px-4 py-3">M&E Assessment</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredAssociations.map((assoc) => (
                                        <tr key={assoc.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800">{assoc.name}</div>
                                                <div className="text-[10px] text-slate-400">{assoc.barangay}, {assoc.lgu}</div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {assoc.officers?.president || 'Unassigned'}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-emerald-700">
                                                {assoc.members?.length || 0} pax
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-slate-800">
                                                    {assoc.enterprise?.name || 'Not Created'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    assoc.seedCapitalReleased 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {assoc.seedCapitalReleased ? 'Released' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                                    assoc.statusAssessment === 'Mainstreaming' ? 'bg-emerald-100 text-emerald-800' :
                                                    assoc.statusAssessment === 'Rehabilitation' ? 'bg-amber-100 text-amber-800' :
                                                    assoc.statusAssessment === 'Closure' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {assoc.statusAssessment}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-1">
                                                <button 
                                                    onClick={() => handleOpenDetailModal(assoc)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Standalone Modal Component --- */}
            <ModalAssociation 
                isOpen={isWizardModalOpen}
                onClose={() => setIsWizardModalOpen(false)}
                onSubmit={handleCreateAssociation}
            />

        </Layout>
    );
}