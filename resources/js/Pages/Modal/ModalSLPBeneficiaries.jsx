
import { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    FaTimes,
    FaSave,
    FaUpload,
    FaFileCsv,
    FaDownload,
    FaUser,
    FaMapMarkerAlt,
    FaBuilding,
    FaClipboardList,
    FaCheckCircle,
    FaExclamationCircle,
    FaPlus,
} from 'react-icons/fa';

const modalities = ['SFC', 'PEAF', 'ST'];

const enterpriseTypes = ['ASSOCIATION', 'INDIVIDUAL'];

// These values must match the Laravel controller validation.
const enterpriseStatuses = [
    'Mainstreaming',
    'Rehabilitation',
    'Closure',
];

const lguOptions = Array.from(
    { length: 12 },
    (_, index) => `LGU ${index + 1}`
);

const districts = Array.from(
    { length: 12 },
    (_, index) =>
        `${index + 1}${['st', 'nd', 'rd'][index] || 'th'} District`
);

const initialValues = {
    year_implemented: new Date().getFullYear(),
    track: 'MD',
    modality: 'SFC',
    district: '1st District',
    lgu: '',
    city_municipality: '',
    barangay: '',
    total_grant_received: '0',
    name_of_project: '',
    type_of_enterprise: 'INDIVIDUAL',
    name_of_slpa_slp_participant: '',
    enterprise_status: 'Mainstreaming',
};

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100';

const labelClass =
    'mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500';

function Field({ label, error, children, required = false }) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>
                {label}{' '}
                {required && <span className="text-rose-500">*</span>}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600">
                    <FaExclamationCircle className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon />
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-800">
                    {title}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function ModalSLPBeneficiaries({
    isOpen,
    onClose,
    beneficiary = null,
    tracks = [],
    municipalities = [],
    barangays = [],
}) {
    // Modal state
    const [mode, setMode] = useState('manual');
    const [selectedFile, setSelectedFile] = useState(null);

    // Separate state for the CSV import process.
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const editing = Boolean(beneficiary);

    // Manual entry form
    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({ ...initialValues });

    // Keep this form for Laravel file validation errors.
    const bulkForm = useForm({
        file: null,
    });

    const busy = processing || uploading;

    /*
    |--------------------------------------------------------------------------
    | Normalize active tracks to MD or EF
    |--------------------------------------------------------------------------
    */
    const activeTracks = useMemo(() => {
        const codes = new Set();

        return tracks.filter((track) => {
            const candidates = [
                track?.track_type,
                track?.category_code,
                track?.category_name,
            ]
                .filter(Boolean)
                .map((value) => String(value).trim().toUpperCase());

            let code = '';

            if (candidates.includes('MD')) {
                code = 'MD';
            } else if (candidates.includes('EF')) {
                code = 'EF';
            } else {
                const text = candidates.join(' ');

                if (
                    text.includes('MICROENTERPRISE') ||
                    text.includes('MICRO ENTERPRISE')
                ) {
                    code = 'MD';
                } else if (text.includes('EMPLOYMENT FACILITATION')) {
                    code = 'EF';
                }
            }

            if (!code || codes.has(code)) {
                return false;
            }

            codes.add(code);
            return true;
        });
    }, [tracks]);

    /*
    |--------------------------------------------------------------------------
    | Filter barangays by selected municipality
    |--------------------------------------------------------------------------
    */
    const availableBarangays = useMemo(() => {
        if (!data.city_municipality) {
            return [];
        }

        const municipality = municipalities.find(
            (item) =>
                item.municipality === data.city_municipality
        );

        if (municipality) {
            return barangays.filter(
                (item) =>
                    Number(item.municipality_id) ===
                    Number(municipality.municipality_id)
            );
        }

        return barangays.filter(
            (item) =>
                item.municipality === data.city_municipality
        );
    }, [
        data.city_municipality,
        municipalities,
        barangays,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Initialize modal forms
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (!isOpen) return;

        clearErrors();
        bulkForm.clearErrors();

        setMode('manual');
        setSelectedFile(null);
        setUploading(false);
        setUploadError('');

        bulkForm.reset();

        if (beneficiary) {
            const values = Object.keys(initialValues).reduce(
                (result, key) => {
                    result[key] =
                        beneficiary[key] ?? initialValues[key];

                    return result;
                },
                {}
            );

            if (!['MD', 'EF'].includes(values.track)) {
                values.track = 'MD';
            }

            if (!modalities.includes(values.modality)) {
                values.modality = 'SFC';
            }

            if (!lguOptions.includes(values.lgu)) {
                values.lgu = '';
            }

            if (!enterpriseTypes.includes(values.type_of_enterprise)) {
                values.type_of_enterprise = 'INDIVIDUAL';
            }

            if (!districts.includes(values.district)) {
                values.district = '1st District';
            }

            if (!enterpriseStatuses.includes(values.enterprise_status)) {
                values.enterprise_status = 'Mainstreaming';
            }

            setData(values);
        } else {
            reset();
            setData({ ...initialValues });
        }
    }, [isOpen, beneficiary]);

    /*
    |--------------------------------------------------------------------------
    | Close modal with Escape key
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape' && !busy) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, busy, onClose]);

    /*
    |--------------------------------------------------------------------------
    | Save manual entry or update an existing beneficiary
    |--------------------------------------------------------------------------
    */
    const submitManual = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                reset();
                onClose();
            },
        };

        if (editing) {
            put(
                route(
                    'slp-beneficiaries.update',
                    beneficiary.beneficiaries_id
                ),
                options
            );
        } else {
            post(
                route('slp-beneficiaries.store'),
                options
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Handle CSV file selection
    |--------------------------------------------------------------------------
    */
    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setSelectedFile(file);
        setUploadError('');

        bulkForm.clearErrors();

        if (file) {
            bulkForm.setData('file', file);
        } else {
            bulkForm.setData('file', null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Import CSV file
    |--------------------------------------------------------------------------
    */
    const submitBulk = (event) => {
        event.preventDefault();

        if (uploading) return;

        if (!selectedFile) {
            setUploadError('Please choose a CSV file first.');
            return;
        }

        const isCsv =
            selectedFile.name.toLowerCase().endsWith('.csv');

        const isTxt =
            selectedFile.name.toLowerCase().endsWith('.txt');

        if (!isCsv && !isTxt) {
            setUploadError(
                'Please select a CSV file exported from Excel.'
            );
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setUploadError(
                'The selected file exceeds the 10 MB upload limit.'
            );
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        setUploadError('');
        bulkForm.clearErrors();

        router.post(
            route('slp-beneficiaries.bulk-import'),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    setSelectedFile(null);
                    setUploadError('');
                    bulkForm.reset();
                    onClose();
                },

                onError: (serverErrors) => {
                    const messages = Object.values(serverErrors)
                        .flat()
                        .filter(Boolean);

                    setUploadError(
                        serverErrors.file ||
                        messages.join(' ') ||
                        'Import failed. Please check your CSV file and try again.'
                    );
                },

                onFinish: () => {
                    setUploading(false);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Download CSV template
    |--------------------------------------------------------------------------
    */
    const downloadTemplate = () => {
        const headers = [
            'year_implemented',
            'track',
            'modality',
            'district',
            'lgu',
            'city_municipality',
            'barangay',
            'total_grant_received',
            'name_of_project',
            'type_of_enterprise',
            'name_of_slpa_slp_participant',
            'enterprise_status',
        ];

        const sample = [
            new Date().getFullYear(),
            'MD',
            'SFC',
            '1st District',
            'LGU 1',
            'Kapatagan',
            'Lapinig',
            '15000',
            'Sample SLP Project',
            'INDIVIDUAL',
            'Sample SLP Participant',
            'Mainstreaming',
        ];

        const csv = [headers, sample]
            .map((row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(',')
            )
            .join('\r\n');

        const blob = new Blob(['\uFEFF' + csv], {
            type: 'text/csv;charset=utf-8;',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'slp-beneficiaries-template.csv';

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    /*
    |--------------------------------------------------------------------------
    | Do not render the modal while closed
    |--------------------------------------------------------------------------
    */
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !busy
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-3xl">
                {/* Header */}
                <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-800 px-5 py-5 text-white sm:px-7">
                    <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/5" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-xl">
                                {mode === 'manual' ? (
                                    <FaUser />
                                ) : (
                                    <FaFileCsv />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
                                    SLP Enterprise Management
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                                    {editing
                                        ? 'Edit Beneficiary'
                                        : 'Manage Beneficiaries'}
                                </h2>

                                <p className="mt-1 text-xs text-emerald-100/80">
                                    {editing
                                        ? `Record #${beneficiary?.beneficiaries_id}`
                                        : 'Add one record or import multiple records'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="rounded-xl border border-white/10 bg-white/10 p-2.5 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Entry mode tabs */}
                {!editing && (
                    <div className="grid shrink-0 grid-cols-2 border-b border-slate-100 bg-slate-50/80 p-3 sm:px-6">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('manual');
                                setUploadError('');
                            }}
                            disabled={busy}
                            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                mode === 'manual'
                                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:bg-white/70'
                            }`}
                        >
                            <FaPlus />
                            Manual Entry
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setMode('bulk');
                                clearErrors();
                            }}
                            disabled={busy}
                            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                                mode === 'bulk'
                                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:bg-white/70'
                            }`}
                        >
                            <FaUpload />
                            Bulk Import
                        </button>
                    </div>
                )}

                {/* =========================================================
                    MANUAL ENTRY FORM
                ========================================================= */}
                {mode === 'manual' ? (
                    <form
                        onSubmit={submitManual}
                        className="min-h-0 flex-1 overflow-y-auto"
                    >
                        <div className="space-y-7 p-5 sm:p-7">
                            {/* Implementation details */}
                            <section>
                                <SectionHeading
                                    icon={FaClipboardList}
                                    title="Implementation details"
                                    description="Project year, track, modality, district and grant information."
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field
                                        label="Year implemented"
                                        required
                                        error={errors.year_implemented}
                                    >
                                        <input
                                            type="number"
                                            min="2000"
                                            max="2100"
                                            className={inputClass}
                                            value={data.year_implemented}
                                            onChange={(e) =>
                                                setData(
                                                    'year_implemented',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </Field>

                                    <Field
                                        label="Track"
                                        required
                                        error={errors.track}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.track}
                                            onChange={(e) =>
                                                setData('track', e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Select track</option>
                                            <option value="MD">MD</option>
                                            <option value="EF">EF</option>
                                        </select>
                                    </Field>

                                    <Field
                                        label="Modality"
                                        required
                                        error={errors.modality}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.modality}
                                            onChange={(e) =>
                                                setData('modality', e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Select modality</option>

                                            {modalities.map((modality) => (
                                                <option
                                                    key={modality}
                                                    value={modality}
                                                >
                                                    {modality}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="District"
                                        required
                                        error={errors.district}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.district}
                                            onChange={(e) =>
                                                setData('district', e.target.value)
                                            }
                                            required
                                        >
                                            {districts.map((district) => (
                                                <option
                                                    key={district}
                                                    value={district}
                                                >
                                                    {district}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="Enterprise status"
                                        required
                                        error={errors.enterprise_status}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.enterprise_status}
                                            onChange={(e) =>
                                                setData(
                                                    'enterprise_status',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >
                                            {enterpriseStatuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="Total grant received (₱)"
                                        required
                                        error={errors.total_grant_received}
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className={inputClass}
                                            value={data.total_grant_received}
                                            onChange={(e) =>
                                                setData(
                                                    'total_grant_received',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </Field>
                                </div>
                            </section>

                            {/* Location information */}
                            <section>
                                <SectionHeading
                                    icon={FaMapMarkerAlt}
                                    title="Location information"
                                    description="Select the LGU, municipality and barangay."
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field
                                        label="LGU"
                                        required
                                        error={errors.lgu}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.lgu}
                                            onChange={(e) =>
                                                setData('lgu', e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Select LGU</option>

                                            {lguOptions.map((lgu) => (
                                                <option key={lgu} value={lgu}>
                                                    {lgu}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="City / Municipality"
                                        required
                                        error={errors.city_municipality}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.city_municipality}
                                            onChange={(e) => {
                                                setData((previous) => ({
                                                    ...previous,
                                                    city_municipality: e.target.value,
                                                    barangay: '',
                                                }));
                                            }}
                                            required
                                        >
                                            <option value="">
                                                Select municipality
                                            </option>

                                            {municipalities.map((item) => (
                                                <option
                                                    key={item.municipality_id}
                                                    value={item.municipality}
                                                >
                                                    {item.municipality}
                                                </option>
                                            ))}

                                            {data.city_municipality &&
                                                !municipalities.some(
                                                    (item) =>
                                                        item.municipality ===
                                                        data.city_municipality
                                                ) && (
                                                    <option
                                                        value={data.city_municipality}
                                                    >
                                                        {data.city_municipality}
                                                    </option>
                                                )}
                                        </select>
                                    </Field>

                                    <Field
                                        label="Barangay"
                                        required
                                        error={errors.barangay}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.barangay}
                                            onChange={(e) =>
                                                setData('barangay', e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select barangay
                                            </option>

                                            {availableBarangays.map((item) => (
                                                <option
                                                    key={item.barangay_id}
                                                    value={item.barangay_name}
                                                >
                                                    {item.barangay_name}
                                                </option>
                                            ))}

                                            {data.barangay &&
                                                !availableBarangays.some(
                                                    (item) =>
                                                        item.barangay_name ===
                                                        data.barangay
                                                ) && (
                                                    <option value={data.barangay}>
                                                        {data.barangay}
                                                    </option>
                                                )}
                                        </select>
                                    </Field>
                                </div>
                            </section>

                            {/* Project and beneficiary */}
                            <section>
                                <SectionHeading
                                    icon={FaBuilding}
                                    title="Project and beneficiary"
                                    description="Enter the project, enterprise classification and participant information."
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Field
                                            label="Name of project"
                                            required
                                            error={errors.name_of_project}
                                        >
                                            <input
                                                className={inputClass}
                                                placeholder="Enter project name"
                                                value={data.name_of_project}
                                                onChange={(e) =>
                                                    setData(
                                                        'name_of_project',
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <Field
                                        label="Type of enterprise"
                                        required
                                        error={errors.type_of_enterprise}
                                    >
                                        <select
                                            className={inputClass}
                                            value={data.type_of_enterprise}
                                            onChange={(e) =>
                                                setData(
                                                    'type_of_enterprise',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select type of enterprise
                                            </option>

                                            {enterpriseTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    <Field
                                        label="SLPA / SLP participant name"
                                        required
                                        error={
                                            errors.name_of_slpa_slp_participant
                                        }
                                    >
                                        <input
                                            className={inputClass}
                                            placeholder="Enter participant or association name"
                                            value={
                                                data.name_of_slpa_slp_participant
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    'name_of_slpa_slp_participant',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </Field>
                                </div>
                            </section>
                        </div>

                        {/* Manual form footer */}
                        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <p className="text-xs text-slate-400">
                                <span className="text-rose-500">*</span>{' '}
                                Required fields
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={busy}
                                    className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing || uploading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                                >
                                    <FaSave />

                                    {processing
                                        ? 'Saving...'
                                        : editing
                                          ? 'Save Changes'
                                          : 'Add Beneficiary'}
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    /* =====================================================
                       BULK CSV IMPORT FORM
                    ===================================================== */
                    <form
                        onSubmit={submitBulk}
                        className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-8"
                    >
                        <div className="mx-auto max-w-2xl space-y-6">
                            {/* Instructions */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl text-white shadow-lg shadow-emerald-600/20">
                                        <FaFileCsv />
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-slate-800">
                                            Import multiple beneficiaries
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Upload a CSV file exported from Excel.
                                            Use the template to keep column names
                                            and allowed values consistent.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={downloadTemplate}
                                            disabled={uploading}
                                            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <FaDownload />
                                            Download CSV Template
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CSV file picker */}
                            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                                <input
                                    type="file"
                                    accept=".csv,.txt,text/csv"
                                    className="hidden"
                                    disabled={uploading}
                                    onChange={handleFileChange}
                                />

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-emerald-600 shadow-sm ring-1 ring-slate-200">
                                    <FaUpload />
                                </div>

                                <p className="mt-4 break-all text-sm font-bold text-slate-700">
                                    {selectedFile
                                        ? selectedFile.name
                                        : 'Choose your CSV file'}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Click to browse · CSV format · Maximum 10 MB
                                </p>

                                {selectedFile && (
                                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                        <FaCheckCircle />
                                        File selected
                                    </span>
                                )}
                            </label>

                            {/* Upload progress */}
                            {uploading && (
                                <div
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />

                                        <div>
                                            <p className="text-sm font-bold text-emerald-800">
                                                Importing records...
                                            </p>

                                            <p className="mt-1 text-xs text-emerald-700">
                                                Please wait. Do not close this
                                                window while the import is running.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload and server validation errors */}
                            {(uploadError || bulkForm.errors.file) && (
                                <div
                                    className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                                    role="alert"
                                >
                                    <FaExclamationCircle className="mt-0.5 shrink-0" />

                                    <p>
                                        {uploadError ||
                                            bulkForm.errors.file}
                                    </p>
                                </div>
                            )}

                            {/* CSV requirements */}
                            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                                <p className="text-xs font-bold text-amber-800">
                                    Before importing
                                </p>

                                <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-amber-800/80">
                                    <li>
                                        Keep the template column names unchanged.
                                    </li>
                                    <li>Track must be MD or EF.</li>
                                    <li>Modality must be SFC, PEAF or ST.</li>
                                    <li>District must be 1st District through 12th District.</li>
                                    <li>LGU must be LGU 1 through LGU 12.</li>
                                    <li>
                                        Type of enterprise must be ASSOCIATION or INDIVIDUAL.
                                    </li>
                                    <li>
                                        Status must be Mainstreaming, Rehabilitation or Closure.
                                    </li>
                                    <li>
                                        Export the Excel file as CSV UTF-8.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bulk import footer */}
                        <div className="sticky bottom-0 mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={uploading}
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!selectedFile || uploading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Importing records...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        Import Records
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
