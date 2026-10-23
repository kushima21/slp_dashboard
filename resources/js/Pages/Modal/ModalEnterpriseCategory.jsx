import { useEffect, useState } from 'react';

import {
    FaTimes,
    FaLayerGroup,
    FaStore,
    FaAlignLeft,
    FaCheckCircle,
} from 'react-icons/fa';

export default function ModalEnterpriseCategory({
    isOpen,
    onClose,
    onSubmit,
    initialData = null,
}) {
    const [formData, setFormData] = useState({
        category_name: '',
        enterprise_type: '',
        description: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ---------------------------------------------------------
    // LOAD INITIAL DATA
    // ---------------------------------------------------------
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (initialData) {
            setFormData({
                category_name:
                    initialData.category_name ||
                    initialData.name ||
                    '',

                enterprise_type:
                    initialData.enterprise_type ||
                    initialData.type ||
                    '',

                description:
                    initialData.description ||
                    '',
            });
        } else {
            setFormData({
                category_name: '',
                enterprise_type: '',
                description: '',
            });
        }
    }, [isOpen, initialData]);

    // ---------------------------------------------------------
    // HANDLE INPUT
    // ---------------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ---------------------------------------------------------
    // SUBMIT
    // ---------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            return;
        }

        if (!formData.enterprise_type.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit({
                category_name: formData.category_name.trim(),
                enterprise_type: formData.enterprise_type.trim(),
                description: formData.description.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------------------------------------------------------
    // CLOSE
    // ---------------------------------------------------------
    const handleClose = () => {
        if (isSubmitting) {
            return;
        }

        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const isEdit = Boolean(initialData);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* MODAL */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* -------------------------------------------------
                    HEADER
                ------------------------------------------------- */}
                <div className="bg-slate-900 px-6 py-5">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                                <FaLayerGroup />
                            </div>

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    {isEdit
                                        ? 'Edit Enterprise Category'
                                        : 'Add Enterprise Category'}
                                </h2>

                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Configure the enterprise category and
                                    specific type.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <FaTimes className="text-sm" />
                        </button>

                    </div>

                </div>

                {/* -------------------------------------------------
                    FORM
                ------------------------------------------------- */}
                <form onSubmit={handleSubmit}>

                    <div className="p-6 space-y-5">

                        {/* CATEGORY */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Enterprise Category
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <div className="relative">

                                <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />

                                <input
                                    type="text"
                                    name="category_name"
                                    value={formData.category_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Retail Store"
                                    required
                                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />

                            </div>

                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Example: Retail Store, Agriculture,
                                Services, Food & Beverage
                            </p>
                        </div>

                        {/* ENTERPRISE TYPE */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Specific Enterprise Type
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <div className="relative">

                                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />

                                <input
                                    type="text"
                                    name="enterprise_type"
                                    value={formData.enterprise_type}
                                    onChange={handleChange}
                                    placeholder="e.g. Sari-Sari Store"
                                    required
                                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />

                            </div>

                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Example: Sari-Sari Store, Carinderia,
                                Vegetable Farming
                            </p>
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Description
                            </label>

                            <div className="relative">

                                <FaAlignLeft className="absolute left-3 top-3.5 text-slate-400 text-xs" />

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Enter a short description of this enterprise type..."
                                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                                />

                            </div>
                        </div>

                        {/* EXAMPLE */}
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">

                            <div className="flex items-start gap-3">

                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <FaCheckCircle className="text-xs" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-emerald-800">
                                        Example
                                    </p>

                                    <p className="text-[11px] text-emerald-700 mt-1">
                                        Category:
                                        <span className="font-semibold ml-1">
                                            Retail Store
                                        </span>
                                    </p>

                                    <p className="text-[11px] text-emerald-700">
                                        Enterprise Type:
                                        <span className="font-semibold ml-1">
                                            Sari-Sari Store
                                        </span>
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* -------------------------------------------------
                        FOOTER
                    ------------------------------------------------- */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                isSubmitting ||
                                !formData.category_name.trim() ||
                                !formData.enterprise_type.trim()
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaCheckCircle className="text-xs" />

                            {isSubmitting
                                ? 'Saving...'
                                : isEdit
                                ? 'Update Category'
                                : 'Save Category'}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}