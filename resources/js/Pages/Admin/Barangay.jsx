import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import { 
    FaSearch, 
    FaPlus, 
    FaChevronRight, 
    FaMapMarkerAlt, 
    FaBuilding, 
    FaEdit, 
    FaTrash,
    FaFilter,
    FaHome,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';

export default function Barangay({ barangays = [], municipalities = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMunicipalityFilter, setSelectedMunicipalityFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBarangay, setEditingBarangay] = useState(null);
    const [deletingBarangay, setDeletingBarangay] = useState(null);

    // Form Hook
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        barangay_name: '',
        purok: '',
        municipality_id: '',
        status: 'Active',
    });

    // Modal Control Handlers
    const openCreateModal = () => {
        setEditingBarangay(null);
        clearErrors();
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (barangay) => {
        setEditingBarangay(barangay);
        clearErrors();
        setData({
            barangay_name: barangay.barangay_name || '',
            purok: barangay.purok || '',
            municipality_id: barangay.municipality_id || '',
            status: barangay.status || 'Active',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBarangay(null);
        reset();
    };

    // Auto-populate Municipality details when dropdown changes inside form
    const handleMunicipalityChange = (e) => {
        const id = e.target.value;
        setData('municipality_id', id);
    };

    // Form Submit (Create or Update)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingBarangay) {
            put(route('barangay.update', editingBarangay.barangay_id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('barangay.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    // Delete Handler
    const handleDelete = () => {
        if (!deletingBarangay) return;
        router.delete(route('barangay.destroy', deletingBarangay.barangay_id), {
            onSuccess: () => setDeletingBarangay(null),
        });
    };

    // Filtered Barangays
    const filteredBarangays = barangays.filter((b) => {
        const matchesSearch = b.barangay_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              b.purok?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMun = selectedMunicipalityFilter 
            ? String(b.municipality_id) === String(selectedMunicipalityFilter)
            : true;
        return matchesSearch && matchesMun;
    });

    const activeBarangaysCount = barangays.filter(b => b.status === 'Active').length;

    return (
        <Layout>
            <Head title="Barangay Management" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Modern Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">Manage</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">SLP</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">Barangay</span>
                </nav>

                {/* Header & Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Barangay Management
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Manage local barangays, assigned municipalities, and community coverage.
                        </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Municipality Quick Filter Dropdown */}
                        <div className="relative">
                            <select 
                                value={selectedMunicipalityFilter}
                                onChange={(e) => setSelectedMunicipalityFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs appearance-none cursor-pointer"
                            >
                                <option value="">All Municipalities</option>
                                {municipalities.map((mun) => (
                                    <option key={mun.id} value={mun.id}>{mun.municipality}</option>
                                ))}
                            </select>
                            <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1 sm:w-64">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search barangay..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
                            />
                        </div>

                        {/* Primary Action */}
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition cursor-pointer shrink-0"
                        >
                            <FaPlus className="text-xs" />
                            <span>Add Barangay</span>
                        </button>
                    </div>
                </div>

                {/* Quick Barangay Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard 
                        icon={FaMapMarkerAlt} 
                        label="Total Barangays" 
                        value={barangays.length} 
                        subtext="Registered in database"
                    />
                    <StatCard 
                        icon={FaBuilding} 
                        label="Active Barangays" 
                        value={activeBarangaysCount} 
                        subtext="Currently active coverage"
                    />
                    <StatCard 
                        icon={FaHome} 
                        label="Covered Municipalities" 
                        value={municipalities.length} 
                        subtext="Fully mapped locations"
                    />
                </div>

                {/* Table Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Barangay Directory
                        </h2>
                        <span className="text-xs text-slate-400">
                            Showing {filteredBarangays.length} of {barangays.length} entries
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/60 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Barangay Name</th>
                                    <th className="px-6 py-3.5">Purok</th>
                                    <th className="px-6 py-3.5">Municipality</th>
                                    <th className="px-6 py-3.5">Province & Region</th>
                                    <th className="px-6 py-3.5">Zipcode</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBarangays.length > 0 ? (
                                    filteredBarangays.map((item) => (
                                        <TableRow 
                                            key={item.barangay_id}
                                            item={item}
                                            onEdit={() => openEditModal(item)}
                                            onDelete={() => setDeletingBarangay(item)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                                            No barangays found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800">
                                {editingBarangay ? 'Edit Barangay' : 'Add New Barangay'}
                            </h3>
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Barangay Name <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={data.barangay_name}
                                    onChange={(e) => setData('barangay_name', e.target.value)}
                                    placeholder="Enter barangay name"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {errors.barangay_name && (
                                    <p className="text-rose-500 text-[10px] mt-1">{errors.barangay_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Purok / Zone
                                </label>
                                <input 
                                    type="text" 
                                    value={data.purok}
                                    onChange={(e) => setData('purok', e.target.value)}
                                    placeholder="e.g. Purok 1"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                                {errors.purok && (
                                    <p className="text-rose-500 text-[10px] mt-1">{errors.purok}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Select Municipality <span className="text-rose-500">*</span>
                                </label>
                                <select 
                                    value={data.municipality_id}
                                    onChange={handleMunicipalityChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Select Municipality --</option>
                                    {municipalities.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.municipality} ({m.province})
                                        </option>
                                    ))}
                                </select>
                                {errors.municipality_id && (
                                    <p className="text-rose-500 text-[10px] mt-1">{errors.municipality_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Status
                                </label>
                                <select 
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingBarangay ? 'Update Barangay' : 'Save Barangay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingBarangay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                            <FaExclamationTriangle />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">Delete Barangay</h3>
                        <p className="text-xs text-slate-500 mb-6">
                            Are you sure you want to delete <span className="font-semibold text-slate-700">{deletingBarangay.barangay_name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingBarangay(null)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

// Sub-component: Stat Card
function StatCard({ icon: Icon, label, value, subtext }) {
    return (
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                <Icon />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{value}</h3>
                <span className="text-[10px] text-slate-400 font-medium">{subtext}</span>
            </div>
        </div>
    );
}

// Sub-component: Table Row
function TableRow({ item, onEdit, onDelete }) {
    const isActive = item.status === 'Active';
    return (
        <tr className="hover:bg-slate-50/50 transition duration-150">
            <td className="px-6 py-4 font-semibold text-slate-800">{item.barangay_name}</td>
            <td className="px-6 py-4 text-slate-600">{item.purok || 'N/A'}</td>
            <td className="px-6 py-4 text-slate-600">{item.municipality}</td>
            <td className="px-6 py-4 text-slate-500">{item.province}, {item.region}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{item.zipcode || 'N/A'}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                    {item.status}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button 
                        type="button" 
                        onClick={onEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                    >
                        <FaEdit className="text-xs" />
                    </button>
                    <button 
                        type="button" 
                        onClick={onDelete}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                    >
                        <FaTrash className="text-xs" />
                    </button>
                </div>
            </td>
        </tr>
    );
}