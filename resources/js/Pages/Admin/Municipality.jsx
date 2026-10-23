import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import ModalMunicipality from '../Modal/ModalMunicipality';
import { 
    FaSearch, 
    FaPlus, 
    FaChevronRight, 
    FaBuilding, 
    FaMapMarkerAlt, 
    FaUsers, 
    FaEdit, 
    FaTrash,
    FaFilter
} from 'react-icons/fa';

export default function Municipality({ municipalities, filters, stats }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        router.get(
            route('municipality.index'), 
            { search: val }, 
            { preserveState: true, replace: true }
        );
    };

    const handleOpenAddModal = () => {
        setSelectedMunicipality(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (data) => {
        setSelectedMunicipality(data);
        setIsModalOpen(true);
    };

    const handleDelete = (municipality_id) => {
        if (confirm('Are you sure you want to delete this municipality?')) {
            router.delete(route('municipality.destroy', municipality_id));
        }
    };

    return (
        <Layout>
            <Head title="Municipality" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* Modern Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">Manage</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="hover:text-slate-600 transition cursor-pointer">SLP</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">Municipality</span>
                </nav>

                {/* Header & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Municipality Management
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Overview and configuration of local municipal locations and records.
                        </p>
                    </div>

                        {/* Toolbar: Search & Primary Action */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-72">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search municipality..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
                            />
                        </div>

                        <button 
                            type="button" 
                            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 text-xs transition flex items-center justify-center cursor-pointer"
                            title="Filter"
                        >
                            <FaFilter className="text-xs" />
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition cursor-pointer shrink-0"
                        >
                            <FaPlus className="text-xs" />
                            <span>Add Municipality</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard 
                        icon={FaBuilding} 
                        label="Total Municipalities" 
                        value={stats?.total ?? 0} 
                        trend="Total Registered"
                    />
                    <StatCard 
                        icon={FaMapMarkerAlt} 
                        label="Active Locations" 
                        value={stats?.active ?? 0} 
                        trend="Currently Active"
                    />
                    <StatCard 
                        icon={FaUsers} 
                        label="Inactive Locations" 
                        value={stats?.inactive ?? 0} 
                        trend="Requires Attention"
                    />
                </div>

                {/* Data Table Wrapper */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Registered Municipalities
                        </h2>
                        <span className="text-xs text-slate-400">
                            Showing {municipalities?.from ?? 0}-{municipalities?.to ?? 0} of {municipalities?.total ?? 0}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/60 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3.5">Municipality Name</th>
                                    <th className="px-6 py-3.5">Province / Region</th>
                                    <th className="px-6 py-3.5">Zip Code</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {municipalities?.data?.length > 0 ? (
                                    municipalities.data.map((item) => (
                                        <TableRow 
                                            key={item.municipality_id}
                                            data={item}
                                            onEdit={() => handleOpenEditModal(item)}
                                            onDelete={() => handleDelete(item.municipality_id)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-400">
                                            No municipalities found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {municipalities?.links?.length > 3 && (
                        <div className="px-6 py-3 border-t border-slate-100 flex justify-end gap-1">
                            {municipalities.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-xs rounded-lg transition ${
                                        link.active 
                                            ? 'bg-emerald-600 text-white font-semibold' 
                                            : 'text-slate-600 hover:bg-slate-100'
                                    } ${!link.url && 'opacity-50 pointer-events-none'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Modal Component */}
            <ModalMunicipality
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedMunicipality}
            />
        </Layout>
    );
}

function StatCard({ icon: Icon, label, value, trend }) {
    return (
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                <Icon />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{value}</h3>
                <span className="text-[10px] text-emerald-600 font-medium">{trend}</span>
            </div>
        </div>
    );
}

function TableRow({ data, onEdit, onDelete }) {
    const isActive = (data.status || 'Active') === 'Active';
    return (
        <tr className="hover:bg-slate-50/50 transition duration-150">
            <td className="px-6 py-4 font-semibold text-slate-800">{data.municipality}</td>
            <td className="px-6 py-4 text-slate-500">{data.province}, {data.region}</td>
            <td className="px-6 py-4 font-mono text-slate-500">{data.zipcode}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                    {data.status || 'Active'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button 
                        onClick={onEdit} 
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit"
                    >
                        <FaEdit className="text-xs" />
                    </button>
                    <button 
                        onClick={onDelete}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete"
                    >
                        <FaTrash className="text-xs" />
                    </button>
                </div>
            </td>
        </tr>
    );
}