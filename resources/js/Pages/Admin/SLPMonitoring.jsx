
import { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import {
    FaBuilding,
    FaUsers,
    FaFileAlt,
    FaSearch,
    FaFilter,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
    FaCoins,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaThLarge,
    FaList,
    FaClipboardCheck,
    FaEye,
    FaArrowRight,
    FaUpload,
    FaDownload,
    FaFileExcel,
    FaCheckCircle,
    FaExclamationCircle,
    FaSpinner,
} from "react-icons/fa";

const PAGE_SIZE = 9;

// This URL must have a Laravel POST route for processing the uploaded file.
const BULK_EVALUATION_URL = "/slp-monitoring/bulk-evaluation";

const money = (value) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const number = (value) =>
    new Intl.NumberFormat("en-PH").format(Number(value || 0));

const enterpriseStyle = {
    Mainstreaming: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Rehabilitation: "bg-amber-50 text-amber-700 ring-amber-100",
    Closure: "bg-rose-50 text-rose-700 ring-rose-100",
};

const getYear = (item) =>
    item.year_implemented ?? item.evaluation_year;

const getStatus = (item) =>
    item.enterprise_status ?? item.enterprises_status;

const isClosedEnterprise = (item) =>
    String(getStatus(item) ?? "").trim().toLowerCase() === "closure";

const getParticipant = (item) =>
    item.name_of_slpa_slp_participant ??
    item.name_of_slp_participant ??
    item.participant_name ??
    "Unnamed participant";

const getMunicipality = (item) =>
    item.city_municipality ?? item.municipality ?? "—";

const uniqueOptions = (rows, getter) =>
    [
        ...new Set(
            rows
                .map(getter)
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        String(value).trim() !== ""
                )
        ),
    ].sort((a, b) =>
        String(a).localeCompare(String(b), undefined, {
            numeric: true,
        })
    );

function FilterSelect({ label, value, onChange, options }) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-xs font-bold text-slate-600">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
                <option value="">All {label}</option>

                {options.map((option) => (
                    <option key={String(option)} value={String(option)}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                {value || "—"}
            </p>
        </div>
    );
}

function MonitoringButton({ item, fullWidth = false }) {
    const beneficiaryId = item?.beneficiaries_id;

    return (
        <Link
            href={
                beneficiaryId
                    ? route("slp-monitoring.graph", {
                          beneficiaries_id: beneficiaryId,
                      })
                    : "#"
            }
            aria-disabled={!beneficiaryId}
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 ${
                fullWidth ? "w-full" : ""
            } ${
                !beneficiaryId
                    ? "pointer-events-none cursor-not-allowed opacity-50"
                    : ""
            }`}
        >
            <FaEye />
            Monitoring
            <FaArrowRight className="text-[10px]" />
        </Link>
    );
}

function BeneficiaryCard({ item }) {
    const status = getStatus(item);

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
            <div className="border-b border-slate-100 p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700 transition group-hover:bg-emerald-100">
                        <FaBuilding />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-extrabold leading-5 text-slate-800">
                            {getParticipant(item)}
                        </h3>

                        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                            {item.name_of_project || "No project name"}
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                            Beneficiary ID: {item.beneficiaries_id ?? "—"}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                        {item.track || "No track"}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
                        {item.modality || "No modality"}
                    </span>

                    <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ring-1 ring-inset ${
                            enterpriseStyle[status] ||
                            "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                    >
                        {status || "Not assessed"}
                    </span>
                </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-5 p-5">
                <InfoItem
                    label="Implementation Year"
                    value={getYear(item)}
                />

                <InfoItem label="District" value={item.district} />
                <InfoItem label="LGU" value={item.lgu} />

                <InfoItem
                    label="Municipality"
                    value={getMunicipality(item)}
                />

                <InfoItem label="Barangay" value={item.barangay} />

                <InfoItem
                    label="Enterprise Type"
                    value={item.type_of_enterprise}
                />

                <div className="col-span-2 mt-1 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <FaCoins className="text-sm" />

                        <p className="text-[10px] font-bold uppercase tracking-wider">
                            Total Grant Received
                        </p>
                    </div>

                    <p className="mt-2 text-xl font-black tracking-tight text-emerald-900">
                        {money(item.total_grant_received)}
                    </p>
                </div>

                {item.intervention_support && (
                    <div className="col-span-2">
                        <InfoItem
                            label="Intervention Support"
                            value={item.intervention_support}
                        />
                    </div>
                )}

                {item.evaluation_recommendation && (
                    <div className="col-span-2">
                        <InfoItem
                            label="Evaluation Recommendation"
                            value={item.evaluation_recommendation}
                        />
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 p-4">
                <MonitoringButton item={item} fullWidth />
            </div>
        </article>
    );
}

function Pagination({
    currentPage,
    totalPages,
    firstRecord,
    lastRecord,
    totalRecords,
    onPageChange,
}) {
    if (totalRecords === 0) return null;

    const visiblePages = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    ).filter(
        (pageNumber) =>
            pageNumber === 1 ||
            pageNumber === totalPages ||
            Math.abs(pageNumber - currentPage) <= 1
    );

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-800">
                    {number(firstRecord)}–{number(lastRecord)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                    {number(totalRecords)}
                </span>{" "}
                records
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <FaChevronLeft />
                    Previous
                </button>

                <div className="flex items-center gap-1">
                    {visiblePages.map((pageNumber, index) => (
                        <span key={pageNumber} className="flex items-center gap-1">
                            {index > 0 &&
                                pageNumber - visiblePages[index - 1] > 1 && (
                                    <span className="px-1 text-xs text-slate-400">
                                        …
                                    </span>
                                )}

                            <button
                                type="button"
                                onClick={() => onPageChange(pageNumber)}
                                aria-current={
                                    currentPage === pageNumber
                                        ? "page"
                                        : undefined
                                }
                                className={`h-9 min-w-9 rounded-xl px-3 text-xs font-bold transition ${
                                    currentPage === pageNumber
                                        ? "bg-emerald-700 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                                }`}
                            >
                                {pageNumber}
                            </button>
                        </span>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
}

/**
 * Bulk evaluation import modal.
 * The CSV template can be opened and edited in Microsoft Excel.
 */
function BulkEvaluationModal({ onClose }) {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [dragging, setDragging] = useState(false);

    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const maxFileSize = 10 * 1024 * 1024;

    const validateFile = (file) => {
        setError("");
        setValidationErrors({});

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const extension = file.name
            .substring(file.name.lastIndexOf("."))
            .toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            setSelectedFile(null);
            setError("Please select an Excel (.xlsx, .xls) or CSV (.csv) file.");
            return;
        }

        if (file.size > maxFileSize) {
            setSelectedFile(null);
            setError("The selected file exceeds the 10 MB limit.");
            return;
        }

        setSelectedFile(file);
    };

    
const downloadTemplate = () => {
    const headers = [
        "evaluation_year",
        "track",
        "modality",
        "district",
        "lgu",
        "municipality",
        "barangay",
        "total_grant_received",
        "name_of_project",
        "type_of_enterpris",
        "name_of_slpa_slp_participant",
        "enterprises_status",
        "intervention_support",
        "evaluation_recommendation",
        "remarks",
    ];

    // Sample row follows the exact same order as the headers.
    const sampleRow = [
        new Date().getFullYear(),
        "MD",
        "SCF",
        "1st District",
        "Kapatagan",
        "Kapatagan",
        "Lapinig",
        "15000.00",
        "Sample Livelihood Project",
        "Consumer Retail & Trading",
        "Juan Dela Cruz",
        "Mainstreaming",
        "Financial Management Training",
        "Continue monitoring and provide appropriate intervention.",
        "Sample evaluation record. Replace with actual beneficiary data.",
    ];

    const csvEscape = (value) =>
        `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
        headers.map(csvEscape).join(","),
        sampleRow.map(csvEscape).join(","),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "SLP_Summary_Evaluation_Template.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
};


    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");
        setValidationErrors({});

        if (!selectedFile) {
            setError("Please select an Excel or CSV file before uploading.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        router.post(BULK_EVALUATION_URL, formData, {
            forceFormData: true,
            preserveScroll: true,

            onStart: () => setUploading(true),

            onSuccess: () => {
                setSelectedFile(null);
                setError("");
                setValidationErrors({});

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                onClose();
            },

            onError: (errors) => {
                setValidationErrors(errors || {});

                const firstError = Object.values(errors || {}).find(
                    (value) => typeof value === "string"
                );

                setError(
                    firstError ||
                        "The file could not be imported. Check the file format and required columns."
                );
            },

            onFinish: () => setUploading(false),
        });
    };

    const fieldErrors = Object.values(validationErrors).filter(
        (value) => typeof value === "string"
    );

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !uploading) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="bulk-evaluation-title"
                className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-6 text-white sm:px-8">
                    <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/5" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/10">
                                <FaFileExcel />
                            </div>

                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                                    SLP Enterprise Monitoring
                                </p>

                                <h2
                                    id="bulk-evaluation-title"
                                    className="mt-1 text-xl font-black sm:text-2xl"
                                >
                                    Bulk Evaluation Import
                                </h2>

                                <p className="mt-2 max-w-md text-sm leading-6 text-emerald-100/80">
                                    Upload an evaluation spreadsheet to process
                                    multiple beneficiary records.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            aria-label="Close bulk evaluation modal"
                            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
                    
<div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <FaDownload />
        </div>

        <div>
            <h3 className="text-sm font-extrabold text-slate-800">
                Download the SLP Summary Template
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-600">
                Includes evaluation year, track, modality, district,
                LGU, municipality, barangay, grant received, project
                details, enterprise status, intervention, recommendation,
                and remarks.
            </p>
        </div>
    </div>

    <button
        type="button"
        onClick={downloadTemplate}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100"
    >
        <FaFileExcel />
        Download Template
    </button>
</div>


                    <div>
                        <label className="mb-2 block text-xs font-bold text-slate-700">
                            Evaluation File
                        </label>

                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDragging(true);
                            }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDragging(false);

                                if (!uploading) {
                                    validateFile(event.dataTransfer.files?.[0]);
                                }
                            }}
                            className={`rounded-2xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
                                dragging
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                disabled={uploading}
                                onChange={(event) =>
                                    validateFile(event.target.files?.[0])
                                }
                                className="hidden"
                                id="bulk-evaluation-file"
                            />

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-emerald-700 shadow-sm">
                                <FaUpload />
                            </div>

                            <p className="mt-4 text-sm font-extrabold text-slate-800">
                                Drag and drop your file here
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                or browse your computer
                            </p>

                            <label
                                htmlFor="bulk-evaluation-file"
                                className={`mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 ${
                                    uploading
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                            >
                                <FaSearch />
                                Choose File
                            </label>

                            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                Excel .xlsx / .xls or CSV · Maximum 10 MB
                            </p>
                        </div>
                    </div>

                    {selectedFile && (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-emerald-700">
                                <FaFileExcel />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="break-all text-sm font-bold text-slate-800">
                                    {selectedFile.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                    · Ready to upload
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);

                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                                disabled={uploading}
                                aria-label="Remove selected file"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                        >
                            <FaExclamationCircle className="mt-0.5 shrink-0" />

                            <div className="min-w-0">
                                <p className="font-bold">
                                    Import could not be completed
                                </p>

                                <p className="mt-1 break-words text-xs leading-5">
                                    {error}
                                </p>

                                {fieldErrors.length > 1 && (
                                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                                        {fieldErrors.slice(1).map((message, index) => (
                                            <li key={`${message}-${index}`}>
                                                {message}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <FaExclamationCircle className="mt-0.5 shrink-0 text-amber-600" />

                            <div>
                                <p className="text-xs font-extrabold text-amber-900">
                                    Before importing
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-800">
                                    Make sure each row contains the correct
                                    beneficiary ID and valid evaluation data.
                                    Your Laravel controller must validate the
                                    file and its columns before saving records.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!selectedFile || uploading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Uploading File...
                                </>
                            ) : (
                                <>
                                    <FaUpload />
                                    Import Evaluations
                                    <FaArrowRight className="text-xs" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default function SLPMonitoring({
    slpBeneficiaries = [],
}) {
    const sourceRows = Array.isArray(slpBeneficiaries)
        ? slpBeneficiaries
        : slpBeneficiaries?.data || [];

    // Automatically exclude Closure enterprises from the entire page.
    // This also removes them from search results, filter options and counts.
    const rows = useMemo(
        () => sourceRows.filter((item) => !isClosedEnterprise(item)),
        [sourceRows]
    );

    const [search, setSearch] = useState("");
    const [year, setYear] = useState("");
    const [track, setTrack] = useState("");
    const [modality, setModality] = useState("");
    const [status, setStatus] = useState("");
    const [district, setDistrict] = useState("");
    const [lgu, setLgu] = useState("");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState("cards");
    const [showBulkModal, setShowBulkModal] = useState(false);

    const years = useMemo(
        () =>
            uniqueOptions(rows, getYear).sort(
                (a, b) => Number(b) - Number(a)
            ),
        [rows]
    );

    const tracks = useMemo(
        () => uniqueOptions(rows, (item) => item.track),
        [rows]
    );

    const modalities = useMemo(
        () => uniqueOptions(rows, (item) => item.modality),
        [rows]
    );

    const districts = useMemo(
        () => uniqueOptions(rows, (item) => item.district),
        [rows]
    );

    const lgus = useMemo(
        () => uniqueOptions(rows, (item) => item.lgu),
        [rows]
    );

    const statuses = useMemo(
        () => uniqueOptions(rows, getStatus),
        [rows]
    );

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        return rows.filter((item) => {
            const searchableText = [
                item.beneficiaries_id,
                getParticipant(item),
                item.name_of_project,
                item.type_of_enterprise,
                item.track,
                item.modality,
                item.district,
                item.lgu,
                getMunicipality(item),
                item.barangay,
                getStatus(item),
                item.intervention_support,
                item.evaluation_recommendation,
                item.remarks,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                (!query || searchableText.includes(query)) &&
                (!year || String(getYear(item)) === String(year)) &&
                (!track || item.track === track) &&
                (!modality || item.modality === modality) &&
                (!status || getStatus(item) === status) &&
                (!district || item.district === district) &&
                (!lgu || item.lgu === lgu)
            );
        });
    }, [
        rows,
        search,
        year,
        track,
        modality,
        status,
        district,
        lgu,
    ]);

    useEffect(() => {
        setPage(1);
    }, [search, year, track, modality, status, district, lgu]);

    // Keep the modal from scrolling the page behind it.
    useEffect(() => {
        if (!showBulkModal) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowBulkModal(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showBulkModal]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRows.length / PAGE_SIZE)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedRows = filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const hasActiveFilters = Boolean(
        search || year || track || modality || status || district || lgu
    );

    const clearFilters = () => {
        setSearch("");
        setYear("");
        setTrack("");
        setModality("");
        setStatus("");
        setDistrict("");
        setLgu("");
        setPage(1);
    };

    const firstRecord =
        filteredRows.length === 0
            ? 0
            : (currentPage - 1) * PAGE_SIZE + 1;

    const lastRecord = Math.min(
        currentPage * PAGE_SIZE,
        filteredRows.length
    );

    return (
        <Layout>
            <Head title="SLP Beneficiaries Monitoring" />

            <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
                {/* Page header */}
                <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Admin</span>
                        <span>/</span>
                        <span>SLP</span>
                        <span>/</span>
                        <span className="font-bold text-emerald-700">
                            Monitoring
                        </span>
                    </div>

                    <div className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-lg sm:p-8">
                        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[35px] border-white/5" />
                        <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl ring-1 ring-white/10">
                                        <FaUsers />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                                            Sustainable Livelihood Program
                                        </p>

                                        <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                                            SLP Beneficiaries Monitoring
                                        </h1>
                                    </div>
                                </div>

                                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100/80">
                                    Manage beneficiary records, project
                                    implementation, locations, enterprise
                                    status, grants, and evaluations.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
                                    <FaFileAlt className="text-xl text-emerald-200" />

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                                            Active Records
                                        </p>

                                        <p className="text-2xl font-black">
                                            {number(filteredRows.length)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowBulkModal(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-emerald-900 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-white/30"
                                >
                                    <FaClipboardCheck />
                                    Bulk Evaluation
                                    <FaArrowRight className="text-xs" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and filters */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <FaFilter />
                            </div>

                            <div>
                                <h2 className="font-extrabold text-slate-800">
                                    Search & Filters
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    Find beneficiaries using project and
                                    location details.
                                </p>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                            >
                                <FaTimes />
                                Clear all filters
                            </button>
                        )}
                    </div>

                    <div className="space-y-5 p-5">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search participant, project, LGU, barangay, ID..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <FilterSelect
                                label="Implementation Year"
                                value={year}
                                onChange={setYear}
                                options={years.map(String)}
                            />

                            <FilterSelect
                                label="Track"
                                value={track}
                                onChange={setTrack}
                                options={tracks}
                            />

                            <FilterSelect
                                label="Modality"
                                value={modality}
                                onChange={setModality}
                                options={modalities}
                            />

                            <FilterSelect
                                label="Enterprise Status"
                                value={status}
                                onChange={setStatus}
                                options={statuses}
                            />

                            <FilterSelect
                                label="District"
                                value={district}
                                onChange={setDistrict}
                                options={districts}
                            />

                            <FilterSelect
                                label="LGU"
                                value={lgu}
                                onChange={setLgu}
                                options={lgus}
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                            <p className="text-xs text-slate-500">
                                <span className="font-bold text-slate-800">
                                    {number(filteredRows.length)}
                                </span>{" "}
                                matching record(s)
                            </p>

                            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                                {year && (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                                        Year: {year}
                                    </span>
                                )}

                                {track && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                        Track: {track}
                                    </span>
                                )}

                                {modality && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                                        Modality: {modality}
                                    </span>
                                )}

                                {status && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">
                                        Status: {status}
                                    </span>
                                )}

                                {district && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                        District: {district}
                                    </span>
                                )}

                                {lgu && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                                        LGU: {lgu}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Records heading and view toggle */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">
                            Beneficiary Records
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Closed enterprises are excluded from this monitoring
                            directory.
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                            {number(filteredRows.length)} records
                        </span>

                        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setViewMode("cards")}
                                aria-pressed={viewMode === "cards"}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    viewMode === "cards"
                                        ? "bg-emerald-700 text-white shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <FaThLarge />
                                Cards
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                aria-pressed={viewMode === "list"}
                                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    viewMode === "list"
                                        ? "bg-emerald-700 text-white shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                            >
                                <FaList />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {paginatedRows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                            <FaSearch />
                        </div>

                        <h3 className="mt-5 text-base font-extrabold text-slate-800">
                            No matching records found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Try another search term or adjust your filters.
                            Closed enterprises are not displayed in this page.
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                            >
                                <FaTimes />
                                Reset search and filters
                            </button>
                        )}
                    </div>
                ) : viewMode === "cards" ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {paginatedRows.map((item, index) => (
                            <BeneficiaryCard
                                key={
                                    item.beneficiaries_id ??
                                    `${item.name_of_project}-${index}`
                                }
                                item={item}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1450px] border-collapse text-left">
                                <thead>
                                    <tr className="bg-slate-50">
                                        {[
                                            "Beneficiary / Project",
                                            "Year",
                                            "Track / Modality",
                                            "District / LGU",
                                            "Municipality / Barangay",
                                            "Enterprise Type",
                                            "Enterprise Status",
                                            "Grant Received",
                                            "Action",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className={`px-4 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${
                                                    heading === "Grant Received"
                                                        ? "text-right"
                                                        : ""
                                                }`}
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedRows.map((item, index) => {
                                        const itemStatus = getStatus(item);

                                        return (
                                            <tr
                                                key={
                                                    item.beneficiaries_id ??
                                                    `${item.name_of_project}-${index}`
                                                }
                                                className="transition hover:bg-emerald-50/40"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                            <FaBuilding />
                                                        </div>

                                                        <div className="min-w-0 max-w-[250px]">
                                                            <p className="break-words text-sm font-bold text-slate-800">
                                                                {getParticipant(item)}
                                                            </p>

                                                            <p className="mt-1 break-words text-xs text-slate-500">
                                                                {item.name_of_project ||
                                                                    "No project name"}
                                                            </p>

                                                            <p className="mt-1 text-[10px] text-slate-400">
                                                                ID:{" "}
                                                                {item.beneficiaries_id ??
                                                                    "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                                    {getYear(item) ?? "—"}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-start gap-1.5">
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                                                            {item.track || "—"}
                                                        </span>

                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                                            {item.modality || "—"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {item.district || "—"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {item.lgu || "—"}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm text-slate-700">
                                                        {getMunicipality(item)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {item.barangay || "—"}
                                                    </p>
                                                </td>

                                                <td className="max-w-[180px] px-4 py-4 text-sm text-slate-600">
                                                    <p className="break-words">
                                                        {item.type_of_enterprise ||
                                                            "—"}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ring-inset ${
                                                            enterpriseStyle[itemStatus] ||
                                                            "bg-slate-100 text-slate-600 ring-slate-200"
                                                        }`}
                                                    >
                                                        {itemStatus || "Not assessed"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-right">
                                                    <span className="whitespace-nowrap text-sm font-extrabold text-emerald-800">
                                                        {money(item.total_grant_received)}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <MonitoringButton item={item} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">
                            <FaFileAlt className="text-emerald-600" />
                            Scroll horizontally to view all columns.
                        </div>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    firstRecord={firstRecord}
                    lastRecord={lastRecord}
                    totalRecords={filteredRows.length}
                    onPageChange={(nextPage) =>
                        setPage(Math.max(1, Math.min(totalPages, nextPage)))
                    }
                />

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-slate-200 pt-5 text-center text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    <FaMapMarkerAlt className="text-emerald-600" />
                    SLP Enterprise Monitoring
                    <span>•</span>
                    <FaCalendarAlt className="text-emerald-600" />
                    Beneficiary and Project Records
                </div>
            </div>

            {/* Bulk Evaluation Modal */}
            {showBulkModal && (
                <BulkEvaluationModal
                    onClose={() => setShowBulkModal(false)}
                />
            )}
        </Layout>
    );
}
