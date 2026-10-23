import { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Layout from "../Layouts/Layout";
import ModalSLPBeneficiaries from "../Modal/ModalSLPBeneficiaries";

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
    FaUsers,
    FaCoins,
    FaDownload,
    FaSyncAlt,
    FaMapMarkerAlt,
    FaFileAlt,
    FaTimes,
    FaExclamationTriangle,
    FaChartLine,
    FaCheckCircle,
    FaFileUpload,
    FaFileCsv,
    FaEye,
} from "react-icons/fa";

/*
|--------------------------------------------------------------------------
| SLP BENEFICIARIES CONFIGURATION
|--------------------------------------------------------------------------
| Ensure the Laravel route named slp-beneficiaries.manage exists.
| It should accept the beneficiary's beneficiaries_id.
*/

const CSV_HEADERS = [
    "year_implemented",
    "track",
    "modality",
    "district",
    "lgu",
    "city_municipality",
    "barangay",
    "total_grant_received",
    "name_of_project",
    "type_of_enterprise",
    "name_of_slpa_slp_participant",
    "enterprise_status",
];

const DISTRICTS = Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;

    const suffix =
        number % 100 >= 11 && number % 100 <= 13
            ? "th"
            : number % 10 === 1
              ? "st"
              : number % 10 === 2
                ? "nd"
                : number % 10 === 3
                  ? "rd"
                  : "th";

    return `${number}${suffix} District`;
});

const LGUS = Array.from(
    { length: 12 },
    (_, index) => `LGU ${index + 1}`
);

const STATUSES = [
    "Mainstreaming",
    "Rehabilitation",
    "Closure",
];

const money = (value) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const number = (value) =>
    new Intl.NumberFormat("en-PH").format(Number(value || 0));

const statusStyle = {
    Mainstreaming:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Rehabilitation:
        "bg-amber-50 text-amber-700 ring-amber-200",
    Closure:
        "bg-rose-50 text-rose-700 ring-rose-200",
};

/*
|--------------------------------------------------------------------------
| REUSABLE STATISTIC CARD
|--------------------------------------------------------------------------
*/

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
}) {
    const colors = {
        emerald:
            "bg-emerald-50 text-emerald-700 ring-emerald-100",
        blue:
            "bg-blue-50 text-blue-700 ring-blue-100",
        violet:
            "bg-violet-50 text-violet-700 ring-violet-100",
        amber:
            "bg-amber-50 text-amber-700 ring-amber-100",
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
            <div className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-slate-50 transition group-hover:scale-125" />

            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {title}
                    </p>

                    <h3 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                        {value}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500">
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${colors[color] || colors.emerald}`}
                >
                    <Icon className="text-lg" />
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| REUSABLE FILTER SELECT
|--------------------------------------------------------------------------
*/

function FilterSelect({
    label,
    value,
    onChange,
    options = [],
    placeholder,
}) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {label}
            </span>

            <select
                value={value || ""}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
                <option value="">
                    {placeholder || `All ${label}`}
                </option>

                {options.map((option) => {
                    const item =
                        typeof option === "object"
                            ? option.value
                            : option;

                    const text =
                        typeof option === "object"
                            ? option.label
                            : option;

                    return (
                        <option key={item} value={item}>
                            {text}
                        </option>
                    );
                })}
            </select>
        </label>
    );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({ onAdd, hasFilters }) {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                <FaFileAlt />
            </div>

            <h3 className="mt-5 text-base font-extrabold text-slate-800">
                {hasFilters
                    ? "No matching beneficiaries"
                    : "No beneficiaries yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {hasFilters
                    ? "Try changing your search or filter selections."
                    : "Add a beneficiary or import multiple records to get started."}
            </p>

            {!hasFilters && (
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                    <FaPlus />
                    Add Beneficiary
                </button>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| CSV IMPORT MODAL
|--------------------------------------------------------------------------
*/

function ImportModal({ onClose }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const downloadTemplate = () => {
        const csv = CSV_HEADERS.join(",") + "\r\n";

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "slp-beneficiaries-template.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    const submitImport = (event) => {
        event.preventDefault();

        if (!file) {
            setError("Please select a CSV file before importing.");
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {
            setError("Please select a CSV file.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("The selected file exceeds the 10 MB limit.");
            return;
        }

        setError("");
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        router.post(
            route("slp-beneficiaries.bulk-import"),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    setFile(null);
                    onClose();
                },

                onError: (errors) => {
                    setError(
                        errors.file ||
                        Object.values(errors)[0] ||
                        "Unable to import the selected file."
                    );
                },

                onFinish: () => setUploading(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
                            <FaFileCsv />
                        </div>

                        <div>
                            <h2 className="text-lg font-extrabold text-slate-800">
                                Bulk Import Beneficiaries
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Import multiple SLP beneficiary records using CSV.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={uploading}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                        aria-label="Close import modal"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form
                    onSubmit={submitImport}
                    className="space-y-5 p-5 sm:p-6"
                >
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                        <h3 className="text-sm font-extrabold text-emerald-900">
                            Step 1. Download the CSV template
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-emerald-800">
                            Use the exact column names in the template.
                            Required columns must not be deleted or renamed.
                        </p>

                        <button
                            type="button"
                            onClick={downloadTemplate}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100"
                        >
                            <FaDownload />
                            Download CSV Template
                        </button>
                    </div>

                    <div>
                        <h3 className="text-sm font-extrabold text-slate-800">
                            Step 2. Select your completed CSV
                        </h3>

                        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                            <FaFileUpload className="text-3xl text-emerald-600" />

                            <span className="mt-3 break-all text-sm font-bold text-slate-700">
                                {file
                                    ? file.name
                                    : "Choose a CSV file"}
                            </span>

                            <span className="mt-1 text-xs text-slate-500">
                                CSV files only · Maximum file size 10 MB
                            </span>

                            <input
                                type="file"
                                accept=".csv,text/csv"
                                className="sr-only"
                                disabled={uploading}
                                onChange={(event) => {
                                    setFile(
                                        event.target.files?.[0] || null
                                    );
                                    setError("");
                                }}
                            />
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            <p className="break-words">{error}</p>
                        </div>
                    )}

                    <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                        <strong>Important:</strong> Your backend should validate
                        imported data and report invalid rows. Only the columns
                        supported by your import controller will be saved.
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaFileUpload />
                            {uploading ? "Importing..." : "Import CSV"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MAIN SLP BENEFICIARIES PAGE
|--------------------------------------------------------------------------
*/

export default function SLPBeneficiaries({
    beneficiaries,
    summary = {},
    filters = {},
    years = [],
    tracks = [],
    municipalities = [],
    barangays = [],
}) {
    const { flash = {}, errors = {} } = usePage().props;

    const [modalOpen, setModalOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [search, setSearch] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [activeFilters, setActiveFilters] = useState({
        year_implemented: filters.year_implemented || "",
        track: filters.track || "",
        modality: filters.modality || "",
        district: filters.district || "",
        lgu: filters.lgu || "",
        type_of_enterprise: filters.type_of_enterprise || "",
        enterprise_status: filters.enterprise_status || "",
    });

    const rows = beneficiaries?.data || [];
    const pagination = beneficiaries || { links: [] };

    /*
    |--------------------------------------------------------------------------
    | FILTER OPTIONS
    |--------------------------------------------------------------------------
    */

    const trackOptions = useMemo(() => {
        const values = tracks.map((item) => ({
            value:
                item.track_type ||
                item.category_code ||
                item.category_name,

            label:
                item.category_name ||
                item.track_type ||
                item.category_code,
        }));

        return values.filter(
            (item, index, array) =>
                item.value &&
                array.findIndex(
                    (entry) => entry.value === item.value
                ) === index
        );
    }, [tracks]);

    const municipalityOptions = useMemo(
        () => [
            ...new Set(
                municipalities
                    .map((item) => item.municipality)
                    .filter(Boolean)
            ),
        ],
        [municipalities]
    );

    /*
    |--------------------------------------------------------------------------
    | SEARCH AND FILTER ACTIONS
    |--------------------------------------------------------------------------
    */

    const applyFilters = (overrides = {}) => {
        router.get(
            route("slp-beneficiaries.index"),
            {
                search,
                ...activeFilters,
                ...overrides,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const updateFilter = (key, value) => {
        const updated = {
            ...activeFilters,
            [key]: value,
        };

        setActiveFilters(updated);

        router.get(
            route("slp-beneficiaries.index"),
            {
                search,
                ...updated,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch("");

        setActiveFilters({
            year_implemented: "",
            track: "",
            modality: "",
            district: "",
            lgu: "",
            type_of_enterprise: "",
            enterprise_status: "",
        });

        router.get(
            route("slp-beneficiaries.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const clearSearch = () => {
        setSearch("");

        router.get(
            route("slp-beneficiaries.index"),
            {
                ...activeFilters,
                search: "",
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE AND EDIT
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {
        setSelectedBeneficiary(null);
        setModalOpen(true);
    };

    const openEdit = (beneficiary) => {
        setSelectedBeneficiary(beneficiary);
        setModalOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        setDeleting(true);

        router.delete(
            route(
                "slp-beneficiaries.destroy",
                deleteTarget.beneficiaries_id
            ),
            {
                preserveScroll: true,

                onSuccess: () => setDeleteTarget(null),

                onFinish: () => setDeleting(false),
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | MANAGE LINK
    |--------------------------------------------------------------------------
    | Every beneficiary's eye icon opens its management page.
    */

    const manageUrl = (beneficiary) =>
        route(
            "slp-beneficiaries.manage",
            beneficiary.beneficiaries_id
        );

    /*
    |--------------------------------------------------------------------------
    | CSV EXPORT
    |--------------------------------------------------------------------------
    */

    const exportCurrentPage = () => {
        if (!rows.length) return;

        const headers = [
            "beneficiaries_id",
            ...CSV_HEADERS,
        ];

        const csvCell = (value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const csv = [
            headers.map(csvCell).join(","),

            ...rows.map((row) =>
                headers
                    .map((key) => csvCell(row[key]))
                    .join(",")
            ),
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "slp-beneficiaries-current-page.csv";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    const activeFilterCount = Object.values(
        activeFilters
    ).filter(Boolean).length;

    const hasFilters = Boolean(search || activeFilterCount);

    /*
    |--------------------------------------------------------------------------
    | PAGE UI
    |--------------------------------------------------------------------------
    */

    return (
        <Layout>
            <Head title="SLP Beneficiaries" />

            <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
                {/* BREADCRUMB */}

                <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                    <span>Admin</span>
                    <FaChevronRight className="text-[9px]" />
                    <span>Manage</span>
                    <FaChevronRight className="text-[9px]" />
                    <span>SLP</span>
                    <FaChevronRight className="text-[9px]" />

                    <span className="font-bold text-emerald-700">
                        SLP Beneficiaries
                    </span>
                </nav>

                {/* PAGE HEADER */}

                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
                    <div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[35px] border-white/[0.04]" />

                    <div className="absolute -bottom-28 right-48 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                                <FaChartLine />
                                SLP Monitoring &amp; Management
                            </div>

                            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                                SLP Beneficiaries
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
                                A centralized workspace for tracking SLP
                                participants, enterprise implementation,
                                grant assistance and status across your LGUs.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-emerald-900 shadow-lg transition hover:bg-emerald-50"
                            >
                                <FaPlus />
                                Add Beneficiary
                            </button>

                            <button
                                type="button"
                                onClick={() => setImportOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
                            >
                                <FaFileUpload />
                                Bulk Import
                            </button>
                        </div>
                    </div>
                </section>

                {/* FLASH MESSAGES */}

                {flash.success && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800">
                        <FaCheckCircle className="mt-0.5 shrink-0" />
                        <p>{flash.success}</p>
                    </div>
                )}

                {errors.file && !importOpen && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700">
                        <FaExclamationTriangle className="mt-0.5 shrink-0" />
                        <p className="break-words">{errors.file}</p>
                    </div>
                )}

                {/* STATISTICS */}

                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total beneficiaries"
                        value={number(summary.total)}
                        subtitle="All registered beneficiary records"
                        icon={FaUsers}
                        color="emerald"
                    />

                    <StatCard
                        title="Individual projects"
                        value={number(summary.individual)}
                        subtitle="Individual enterprise records"
                        icon={FaStore}
                        color="blue"
                    />

                    <StatCard
                        title="Association projects"
                        value={number(summary.association)}
                        subtitle="Association enterprise records"
                        icon={FaLayerGroup}
                        color="violet"
                    />

                    <StatCard
                        title="Total grant received"
                        value={money(summary.grant)}
                        subtitle="Combined recorded grant assistance"
                        icon={FaCoins}
                        color="amber"
                    />
                </section>

                {/* ENTERPRISE STATUS OVERVIEW */}

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-800">
                                Enterprise status overview
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current status distribution across beneficiary records.
                            </p>
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                            {number(summary.total)} total records
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {[
                            {
                                label: "Mainstreaming",
                                value: summary.mainstreaming,
                                bar: "bg-emerald-500",
                                badge: "bg-emerald-50 text-emerald-700",
                            },
                            {
                                label: "Rehabilitation",
                                value: summary.rehabilitation,
                                bar: "bg-amber-500",
                                badge: "bg-amber-50 text-amber-700",
                            },
                            {
                                label: "Closure",
                                value: summary.closure,
                                bar: "bg-rose-500",
                                badge: "bg-rose-50 text-rose-700",
                            },
                        ].map((item) => {
                            const total = Number(summary.total || 0);
                            const count = Number(item.value || 0);

                            const percentage = total
                                ? Math.round((count / total) * 100)
                                : 0;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-600">
                                            {item.label}
                                        </span>

                                        <span
                                            className={`rounded-lg px-2 py-1 text-xs font-extrabold ${item.badge}`}
                                        >
                                            {percentage}%
                                        </span>
                                    </div>

                                    <p className="mt-3 text-2xl font-black text-slate-800">
                                        {number(count)}
                                    </p>

                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className={`h-full rounded-full transition-all ${item.bar}`}
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* BENEFICIARY DIRECTORY */}

                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    {/* DIRECTORY HEADER AND SEARCH */}

                    <div className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                            <div>
                                <h2 className="text-lg font-extrabold tracking-tight text-slate-800">
                                    Beneficiary directory
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Search, review and manage your beneficiary records.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative min-w-0 sm:w-72">
                                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                applyFilters();
                                            }
                                        }}
                                        placeholder="Search name, project, LGU..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                            aria-label="Clear search"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => applyFilters()}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                                >
                                    <FaSearch />
                                    Search
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFilters((value) => !value)
                                    }
                                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                        showFilters || activeFilterCount
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <FaFilter />
                                    Filters

                                    {activeFilterCount > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* FILTER PANEL */}

                        {showFilters && (
                            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                                        <FaFilter className="text-emerald-600" />
                                        Refine records
                                    </div>

                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-emerald-700"
                                    >
                                        <FaSyncAlt />
                                        Reset all
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    <FilterSelect
                                        label="Year"
                                        value={activeFilters.year_implemented}
                                        onChange={(value) =>
                                            updateFilter("year_implemented", value)
                                        }
                                        options={years.map(String)}
                                    />

                                    <FilterSelect
                                        label="Track"
                                        value={activeFilters.track}
                                        onChange={(value) =>
                                            updateFilter("track", value)
                                        }
                                        options={
                                            trackOptions.length
                                                ? trackOptions
                                                : ["MD", "EF"]
                                        }
                                    />

                                    <FilterSelect
                                        label="Modality"
                                        value={activeFilters.modality}
                                        onChange={(value) =>
                                            updateFilter("modality", value)
                                        }
                                        options={["SFC", "PEAF", "ST"]}
                                    />

                                    <FilterSelect
                                        label="District"
                                        value={activeFilters.district}
                                        onChange={(value) =>
                                            updateFilter("district", value)
                                        }
                                        options={DISTRICTS}
                                    />

                                    <FilterSelect
                                        label="LGU"
                                        value={activeFilters.lgu}
                                        onChange={(value) =>
                                            updateFilter("lgu", value)
                                        }
                                        options={LGUS}
                                    />

                                    <FilterSelect
                                        label="Enterprise type"
                                        value={activeFilters.type_of_enterprise}
                                        onChange={(value) =>
                                            updateFilter(
                                                "type_of_enterprise",
                                                value
                                            )
                                        }
                                        options={[
                                            "INDIVIDUAL",
                                            "ASSOCIATION",
                                        ]}
                                    />

                                    <FilterSelect
                                        label="Enterprise status"
                                        value={activeFilters.enterprise_status}
                                        onChange={(value) =>
                                            updateFilter(
                                                "enterprise_status",
                                                value
                                            )
                                        }
                                        options={STATUSES}
                                    />
                                </div>

                                {municipalityOptions.length > 0 && (
                                    <p className="mt-3 text-xs text-slate-400">
                                        Municipality records available:{" "}
                                        {municipalityOptions.length}. Municipality
                                        and barangay values are displayed in each
                                        beneficiary record.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RECORD COUNT AND EXPORT */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-extrabold text-slate-800">
                                {number(pagination.from || 0)}–
                                {number(pagination.to || 0)}
                            </span>{" "}
                            of{" "}
                            <span className="font-extrabold text-slate-800">
                                {number(pagination.total || 0)}
                            </span>{" "}
                            records
                        </p>

                        <button
                            type="button"
                            onClick={exportCurrentPage}
                            disabled={!rows.length}
                            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                        >
                            <FaDownload />
                            Export Current Page
                        </button>
                    </div>

                    {/* RECORDS */}

                    {rows.length === 0 ? (
                        <EmptyState
                            onAdd={openCreate}
                            hasFilters={hasFilters}
                        />
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1300px] text-left">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                            <th className="px-6 py-4">
                                                Beneficiary / Project
                                            </th>
                                            <th className="px-4 py-4">
                                                Year / Track
                                            </th>
                                            <th className="px-4 py-4">
                                                Modality / Type
                                            </th>
                                            <th className="px-4 py-4">
                                                Location
                                            </th>
                                            <th className="px-4 py-4">
                                                Grant received
                                            </th>
                                            <th className="px-4 py-4">
                                                Enterprise status
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {rows.map((item) => (
                                            <tr
                                                key={item.beneficiaries_id}
                                                className="group transition hover:bg-emerald-50/30"
                                            >
                                                {/* BENEFICIARY */}

                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
                                                            <FaBuilding />
                                                        </div>

                                                        <div className="min-w-0 max-w-[280px]">
                                                            <p className="truncate text-sm font-extrabold text-slate-800">
                                                                {item.name_of_slpa_slp_participant ||
                                                                    "Unnamed participant"}
                                                            </p>

                                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                                {item.name_of_project ||
                                                                    "No project name"}
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-400">
                                                                ID:{" "}
                                                                {item.beneficiaries_id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* YEAR AND TRACK */}

                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-slate-700">
                                                        {item.year_implemented || "—"}
                                                    </p>

                                                    <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">
                                                        {item.track || "—"}
                                                    </span>
                                                </td>

                                                {/* MODALITY AND TYPE */}

                                                <td className="px-4 py-4">
                                                    <span className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                                                        {item.modality || "—"}
                                                    </span>

                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        {item.type_of_enterprise ||
                                                            "No type specified"}
                                                    </p>
                                                </td>

                                                {/* LOCATION */}

                                                <td className="px-4 py-4">
                                                    <div className="flex items-start gap-2">
                                                        <FaMapMarkerAlt className="mt-1 shrink-0 text-xs text-emerald-600" />

                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">
                                                                {item.lgu || "—"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {item.city_municipality ||
                                                                    "—"}
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-400">
                                                                {item.barangay || "—"}
                                                                {item.district
                                                                    ? ` · ${item.district}`
                                                                    : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* GRANT */}

                                                <td className="px-4 py-4">
                                                    <p className="whitespace-nowrap text-sm font-extrabold text-slate-800">
                                                        {money(
                                                            item.total_grant_received
                                                        )}
                                                    </p>
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ring-1 ring-inset ${
                                                            statusStyle[
                                                                item.enterprise_status
                                                            ] ||
                                                            "bg-slate-100 text-slate-600 ring-slate-200"
                                                        }`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                                        {item.enterprise_status ||
                                                            "Not assessed"}
                                                    </span>
                                                </td>

                                                {/* ACTIONS: MANAGE, EDIT, DELETE */}

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route(
                                                            'slp-beneficiaries.manage',
                                                            item.beneficiaries_id
                                                        )}
                                                        title="Manage beneficiary"
                                                        aria-label={`Manage beneficiary ${
                                                            item.name_of_slpa_slp_participant ||
                                                            item.beneficiaries_id
                                                        }`}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                                                    >
                                                        <FaEye className="text-sm" />
                                                        <span>Manage</span>
                                                    </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                            title="Edit beneficiary"
                                                            aria-label="Edit beneficiary"
                                                            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <FaEdit />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDeleteTarget(item)
                                                            }
                                                            title="Delete beneficiary"
                                                            aria-label="Delete beneficiary"
                                                            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE AND TABLET CARDS */}

                            <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-4 sm:grid-cols-2 lg:hidden">
                                {rows.map((item) => (
                                    <article
                                        key={item.beneficiaries_id}
                                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                    >
                                        {/* CARD HEADER */}

                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                    <FaBuilding />
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="break-words text-sm font-extrabold text-slate-800">
                                                        {item.name_of_slpa_slp_participant ||
                                                            "Unnamed participant"}
                                                    </h3>

                                                    <p className="mt-1 break-words text-xs text-slate-500">
                                                        {item.name_of_project ||
                                                            "No project name"}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        Record #{
                                                            item.beneficiaries_id
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${
                                                    statusStyle[
                                                        item.enterprise_status
                                                    ] ||
                                                    "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {item.enterprise_status ||
                                                    "Not assessed"}
                                            </span>
                                        </div>

                                        {/* CARD DETAILS */}

                                        <div className="my-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Year / Track
                                                </p>

                                                <p className="mt-1 text-xs font-bold text-slate-700">
                                                    {item.year_implemented || "—"}
                                                    {" · "}
                                                    {item.track || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Grant
                                                </p>

                                                <p className="mt-1 text-xs font-extrabold text-emerald-700">
                                                    {money(
                                                        item.total_grant_received
                                                    )}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 text-xs text-slate-700">
                                                    {[
                                                        item.lgu,
                                                        item.city_municipality,
                                                        item.barangay,
                                                        item.district,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ") ||
                                                        "No location"}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                                    Modality / Enterprise
                                                </p>

                                                <p className="mt-1 text-xs text-slate-700">
                                                    {item.modality || "—"}
                                                    {" · "}
                                                    {item.type_of_enterprise ||
                                                        "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* CARD ACTIONS */}

                                        <div className="grid grid-cols-3 gap-2">
                                            <Link
                                                href={manageUrl(item)}
                                                title="Manage beneficiary"
                                                aria-label={`Manage beneficiary ${item.name_of_slpa_slp_participant || item.beneficiaries_id}`}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-2.5 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                                            >
                                                <FaEye />
                                                Manage
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <FaEdit />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteTarget(item)
                                                }
                                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-100 px-2 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                                            >
                                                <FaTrash />
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                    {/* PAGINATION */}

                    {rows.length > 0 && pagination.links?.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-xs text-slate-500">
                                Page{" "}
                                <span className="font-bold text-slate-800">
                                    {pagination.current_page}
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-slate-800">
                                    {pagination.last_page}
                                </span>
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {pagination.links.map((link, index) => {
                                    const label = String(link.label || "")
                                        .replace(/&laquo;/g, "Previous")
                                        .replace(/&raquo;/g, "Next")
                                        .replace(/<[^>]+>/g, "");

                                    return (
                                        <button
                                            key={`${label}-${index}`}
                                            type="button"
                                            disabled={!link.url || link.active}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.visit(link.url, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                    });
                                                }
                                            }}
                                            className={`min-w-9 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                                link.active
                                                    ? "bg-emerald-600 text-white shadow-sm"
                                                    : link.url
                                                      ? "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                                      : "cursor-not-allowed bg-slate-50 text-slate-300"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* CREATE / EDIT MODAL */}

            <ModalSLPBeneficiaries
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                beneficiary={selectedBeneficiary}
                tracks={tracks}
                municipalities={municipalities}
                barangays={barangays}
            />

            {/* CSV IMPORT MODAL */}

            {importOpen && (
                <ImportModal
                    onClose={() => setImportOpen(false)}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}

            {deleteTarget && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
                            <FaExclamationTriangle />
                        </div>

                        <h3 className="mt-5 text-xl font-extrabold text-slate-800">
                            Delete beneficiary?
                        </h3>

                        <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                            You are about to delete{" "}
                            <span className="font-bold text-slate-700">
                                {deleteTarget.name_of_slpa_slp_participant ||
                                    "this beneficiary"}
                            </span>
                            . This action cannot be undone.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaTrash />
                                {deleting ? "Deleting..." : "Delete Record"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
