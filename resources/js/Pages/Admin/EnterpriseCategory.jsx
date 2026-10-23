import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import ModalEnterpriseCategory from '../Modal/ModalEnterpriseCategory';

import {
    FaSearch,
    FaPlus,
    FaChevronRight,
    FaBuilding,
    FaEdit,
    FaTrash,
    FaFilter,
    FaLayerGroup,
    FaStore,
} from 'react-icons/fa';

export default function EnterpriseCategory({
    categories = [],
    flash = {},
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEnterpriseCategory, setSelectedEnterpriseCategory] =
        useState(null);

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------
    const filteredCategories = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) {
            return categories;
        }

        return categories.filter((category) => {
            const categoryName = (
                category.category_name ||
                category.name ||
                ''
            ).toLowerCase();

            const enterpriseType = (
                category.enterprise_type ||
                category.type ||
                ''
            ).toLowerCase();

            const description = (
                category.description || ''
            ).toLowerCase();

            return (
                categoryName.includes(search) ||
                enterpriseType.includes(search) ||
                description.includes(search)
            );
        });
    }, [categories, searchTerm]);

    // ---------------------------------------------------------
    // ADD
    // ---------------------------------------------------------
    const handleOpenAddModal = () => {
        setSelectedEnterpriseCategory(null);
        setIsModalOpen(true);
    };

    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------
    const handleEdit = (category) => {
        setSelectedEnterpriseCategory(category);
        setIsModalOpen(true);
    };

    // ---------------------------------------------------------
    // DELETE
    // ---------------------------------------------------------
    const handleDelete = (category) => {
        const id =
            category.id ??
            category.enterprise_category_id ??
            category.category_id;

        if (!id) {
            alert('Enterprise category ID was not found.');
            return;
        }

        const categoryName =
            category.category_name ||
            category.name ||
            'this enterprise category';

        if (
            !confirm(
                `Are you sure you want to delete "${categoryName}"?`
            )
        ) {
            return;
        }

        router.delete(
            route('enterprise-category.destroy', id),
            {
                preserveScroll: true,
            }
        );
    };

    // ---------------------------------------------------------
    // SUBMIT
    // ---------------------------------------------------------
    const handleSubmit = (data) => {
        const id =
            selectedEnterpriseCategory?.id ??
            selectedEnterpriseCategory?.enterprise_category_id ??
            selectedEnterpriseCategory?.category_id;

        if (id) {
            router.put(
                route('enterprise-category.update', id),
                data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsModalOpen(false);
                        setSelectedEnterpriseCategory(null);
                    },
                }
            );

            return;
        }

        router.post(
            route('enterprise-category.store'),
            data,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    setSelectedEnterpriseCategory(null);
                },
            }
        );
    };

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------
    const totalCategories = categories.length;

    const totalTypes = new Set(
        categories
            .map((category) => category.enterprise_type)
            .filter(Boolean)
    ).size;

    const displayedRecords = filteredCategories.length;

    return (
        <Layout>
            <Head title="Enterprise Category" />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* -------------------------------------------------
                    BREADCRUMB
                ------------------------------------------------- */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="hover:text-slate-600 transition cursor-pointer">
                        Admin
                    </span>

                    <FaChevronRight className="text-[10px]" />

                    <span className="hover:text-slate-600 transition cursor-pointer">
                        Manage
                    </span>

                    <FaChevronRight className="text-[10px]" />

                    <span className="hover:text-slate-600 transition cursor-pointer">
                        SLP
                    </span>

                    <FaChevronRight className="text-[10px]" />

                    <span className="text-emerald-600 font-semibold">
                        Enterprise Category
                    </span>
                </nav>

                {/* -------------------------------------------------
                    HEADER
                ------------------------------------------------- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Enterprise Category Management
                        </h1>

                        <p className="text-xs text-slate-500 mt-1">
                            Overview and configuration of enterprise
                            categories and records.
                        </p>
                    </div>
                </div>

                {/* -------------------------------------------------
                    FLASH MESSAGE
                ------------------------------------------------- */}
                {flash?.success && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                        <FaCheckCircle />
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                        {flash.error}
                    </div>
                )}

                {/* -------------------------------------------------
                    SUMMARY CARDS
                ------------------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Total Categories
                                </p>

                                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                                    {totalCategories}
                                </h2>
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <FaLayerGroup />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Enterprise Types
                                </p>

                                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                                    {totalTypes}
                                </h2>
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FaStore />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Displayed Records
                                </p>

                                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                                    {displayedRecords}
                                </h2>
                            </div>

                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                <FaBuilding />
                            </div>
                        </div>
                    </div>

                </div>

                {/* -------------------------------------------------
                    SEARCH / ACTIONS
                ------------------------------------------------- */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">

                    <div className="relative flex-1 md:w-72">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search category or enterprise type..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs transition"
                        />
                    </div>

                    <button
                        type="button"
                        className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 text-xs transition flex items-center justify-center cursor-pointer"
                        title="Filter"
                    >
                        <FaFilter className="text-xs" />
                    </button>

                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition cursor-pointer shrink-0"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Enterprise Category</span>
                    </button>

                </div>

                {/* -------------------------------------------------
                    TABLE
                ------------------------------------------------- */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">

                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        #
                                    </th>

                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Enterprise Category
                                    </th>

                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Enterprise Type
                                    </th>

                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Description
                                    </th>

                                    <th className="px-5 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-right">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(
                                        (category, index) => (
                                            <tr
                                                key={
                                                    category.id ??
                                                    category.enterprise_category_id ??
                                                    category.category_id ??
                                                    index
                                                }
                                                className="hover:bg-slate-50/70 transition"
                                            >

                                                <td className="px-5 py-4 text-xs text-slate-500">
                                                    {index + 1}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">

                                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                            <FaLayerGroup className="text-sm" />
                                                        </div>

                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-800">
                                                                {category.category_name ||
                                                                    category.name ||
                                                                    '—'}
                                                            </p>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                                                        <FaStore className="text-[9px]" />

                                                        {category.enterprise_type ||
                                                            category.type ||
                                                            '—'}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <p className="text-xs text-slate-500 max-w-md">
                                                        {category.description ||
                                                            'No description'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    category
                                                                )
                                                            }
                                                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category
                                                                )
                                                            }
                                                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">

                                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                                                    <FaLayerGroup />
                                                </div>

                                                <h3 className="text-sm font-semibold text-slate-700">
                                                    No enterprise categories found
                                                </h3>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    Add your first enterprise
                                                    category to get started.
                                                </p>

                                            </div>
                                        </td>
                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>
                </div>

            </div>

            {/* -------------------------------------------------
                MODAL
            ------------------------------------------------- */}
            <ModalEnterpriseCategory
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEnterpriseCategory(null);
                }}
                onSubmit={handleSubmit}
                initialData={selectedEnterpriseCategory}
            />

        </Layout>
    );
}