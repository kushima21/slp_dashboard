import { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import { 
    FaSearch, 
    FaPlus, 
    FaChevronRight, 
    FaEdit, 
    FaTrash,
    FaTimes,
    FaStore,
    FaBriefcase,
    FaTag,
    FaCheckCircle
} from 'react-icons/fa';

export default function Track({ categories = [] }) {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Inertia Form Hook bound strictly to Database field names
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        category_name: '',
        category_code: '',
        track_type: 'MD', // MD or EF
        default_modalities: '',
        description: '',
        status: 'Active'
    });

    const handleOpenCreateModal = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setEditingCategory(category);
        clearErrors();
        setData({
            category_name: category.category_name || '',
            category_code: category.category_code || '',
            track_type: category.track_type || 'MD',
            default_modalities: category.default_modalities || '',
            description: category.description || '',
            status: category.status || 'Active'
        });
        setIsFormModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsFormModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(`/slp/track-categories/${editingCategory.id}`, {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post('/slp/track-categories', {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this track category?')) {
            router.delete(`/slp/track-categories/${id}`);
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter((cat) => {
            return (
                cat.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cat.category_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cat.track_type?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [categories, searchQuery]);

    return (
        <Layout>
            <Head title="SLP Track Categories" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span>Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span>SLP Setup</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">Track Categories</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
                    <div>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            Category Management
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight mt-1">SLP Track Categories</h1>
                        <p className="text-xs text-slate-300 mt-1">
                            Define and configure core category tracks for program allocation.
                        </p>
                    </div>

                    <button
                        onClick={handleOpenCreateModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Category</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search category name, code, or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Track Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCategories.map((category) => {
                        const isMD = category.track_type === 'MD';
                        return (
                            <div 
                                key={category.id} 
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                            isMD 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {isMD ? <FaStore className="text-[10px]" /> : <FaBriefcase className="text-[10px]" />}
                                            {isMD ? 'Micro-enterprise (MD)' : 'Employment Facilitation (EF)'}
                                        </span>

                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            <FaCheckCircle className="text-[10px]" />
                                            {category.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                                        {category.category_name}
                                    </h3>
                                    
                                    <div className="text-xs font-mono text-slate-400 mb-3">
                                        CODE: {category.category_code}
                                    </div>

                                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                                        {category.description || 'No description provided for this track category.'}
                                    </p>

                                    {category.default_modalities && (
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs mb-4">
                                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                                                <FaTag className="text-slate-400 text-[10px]" />
                                                <span>Associated Modalities:</span>
                                            </div>
                                            <p className="text-slate-500 text-[11px]">
                                                {category.default_modalities}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenEditModal(category)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <FaEdit />
                                        <span>Edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <FaTrash />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={handleCloseModal} />

                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">
                                        {editingCategory ? 'Edit Track Category' : 'Create Track Category'}
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Set category attributes for SLP project classification.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.category_name}
                                        onChange={(e) => setData('category_name', e.target.value)}
                                        placeholder="e.g. Micro-enterprise Development"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        required
                                    />
                                    {errors.category_name && <p className="text-xs text-rose-500 mt-1">{errors.category_name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Category Code *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.category_code}
                                            onChange={(e) => setData('category_code', e.target.value)}
                                            placeholder="e.g. SLP-CAT-MD"
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            required
                                        />
                                        {errors.category_code && <p className="text-xs text-rose-500 mt-1">{errors.category_code}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Track Type *
                                        </label>
                                        <select
                                            value={data.track_type}
                                            onChange={(e) => setData('track_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="MD">Micro-enterprise Development (MD)</option>
                                            <option value="EF">Employment Facilitation (EF)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Default Modalities
                                    </label>
                                    <input
                                        type="text"
                                        value={data.default_modalities}
                                        onChange={(e) => setData('default_modalities', e.target.value)}
                                        placeholder="e.g. Seed Capital Fund (SCF), Skills Training"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief summary of what this category entails..."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}