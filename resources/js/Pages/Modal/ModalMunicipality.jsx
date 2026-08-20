import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    FaTimes, 
    FaBuilding, 
    FaGlobe, 
    FaMapMarkedAlt, 
    FaHashtag,
    FaSave
} from 'react-icons/fa';

export default function ModalMunicipality({ isOpen, onClose, initialData = null }) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        municipality: '',
        region: '',
        province: '',
        zipcode: '',
        status: 'Active',
    });

    useEffect(() => {
        clearErrors();
        if (initialData) {
            setData({
                municipality: initialData.municipality || '',
                region: initialData.region || '',
                province: initialData.province || '',
                zipcode: initialData.zipcode || '',
                status: initialData.status || 'Active',
            });
        } else {
            reset();
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setData(e.target.name, e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (initialData?.id) {
            put(route('municipality.update', initialData.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('municipality.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10 transform transition-all my-8">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-emerald-600">
                            <FaBuilding className="text-base" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                {initialData ? 'Edit Municipality' : 'Add New Municipality'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Enter official location and territorial identification details.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                        <FaTimes className="text-xs" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Municipality Name Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Municipality Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                            <input
                                type="text"
                                name="municipality"
                                value={data.municipality}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Kapatagan"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            />
                        </div>
                        {errors.municipality && (
                            <p className="text-xs text-rose-500 mt-1">{errors.municipality}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Region Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                                Region <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <FaGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                                <input
                                    type="text"
                                    name="region"
                                    value={data.region}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Region X"
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                            </div>
                            {errors.region && (
                                <p className="text-xs text-rose-500 mt-1">{errors.region}</p>
                            )}
                        </div>

                        {/* Province Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                                Province <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <FaMapMarkedAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                                <input
                                    type="text"
                                    name="province"
                                    value={data.province}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Lanao del Norte"
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                            </div>
                            {errors.province && (
                                <p className="text-xs text-rose-500 mt-1">{errors.province}</p>
                            )}
                        </div>
                    </div>

                    {/* Zip Code Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Zip Code <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <FaHashtag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                            <input
                                type="text"
                                name="zipcode"
                                value={data.zipcode}
                                onChange={handleChange}
                                required
                                placeholder="e.g. 9214"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            />
                        </div>
                        {errors.zipcode && (
                            <p className="text-xs text-rose-500 mt-1">{errors.zipcode}</p>
                        )}
                    </div>

                    {/* Status Field */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Status</label>
                        <select
                            name="status"
                            value={data.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-sm shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                        >
                            <FaSave className="text-xs" />
                            <span>{processing ? 'Saving...' : 'Save Municipality'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}