
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../Layouts/Layout";

import {
    FaSearch,
    FaChevronRight,
    FaBuilding,
    FaMapMarkerAlt,
    FaFilter,
    FaThLarge,
    FaList,
    FaStore,
    FaChartLine,
    FaEye,
    FaCalendarAlt,
    FaClipboardCheck,
    FaTimes,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaFileExcel,
    FaFilePdf,
    FaSyncAlt,
    FaChevronDown,
    FaCheckCircle,
    FaUserTie,
    FaFileAlt,
} from "react-icons/fa";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const statusStyles = {
    Mainstreaming: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Rehabilitation: "bg-amber-50 text-amber-700 ring-amber-600/15",
    Closure: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

const formatMoney = (value) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
          });
};

const normalizeRoles = (roles) => {
    const normalize = (items) =>
        items
            .map((role) =>
                String(
                    typeof role === "object" && role !== null
                        ? role.name ?? role.slug ?? ""
                        : role ?? ""
                )
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

    if (Array.isArray(roles)) return normalize(roles);

    if (typeof roles === "string") {
        try {
            const parsed = JSON.parse(roles);

            if (Array.isArray(parsed)) return normalize(parsed);
            if (parsed && typeof parsed === "object") {
                return normalize([parsed]);
            }
        } catch {
            // Handle plain strings such as "admin,lgu".
        }

        return roles
            .split(",")
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean);
    }

    if (roles && typeof roles === "object") {
        return normalize([roles]);
    }

    return [];
};

function StatusBadge({ status }) {
    const styles =
        statusStyles[status] ||
        "bg-slate-100 text-slate-600 ring-slate-500/10";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${styles}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status || "Not assessed"}
        </span>
    );
}

function StatCard({ title, value, description, icon: Icon, accent }) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>
                    <p className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-900">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
                >
                    <Icon className="text-lg" />
                </div>
            </div>
        </article>
    );
}

function RecordActions({ record }) {
    const beneficiaryId = record.beneficiaries_id;

    return beneficiaryId ? (
        <Link
            href={`/slp-monitoring/${encodeURIComponent(beneficiaryId)}/graph`}
            title="View evaluation"
            aria-label={`View ${
                record.name_of_slpa_slp_participant || "evaluation"
            }`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
        >
            <FaEye />
        </Link>
    ) : (
        <span
            title="No beneficiary link available"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400"
        >
            <FaEye />
        </span>
    );
}

function RecordCard({ record }) {
    return (
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <FaStore className="text-lg" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="break-words font-bold text-slate-900">
                            {record.name_of_slpa_slp_participant ||
                                "Unnamed participant"}
                        </h3>
                        <p className="mt-1 break-words text-sm text-slate-500">
                            {record.name_of_project || "No project name"}
                        </p>
                    </div>
                </div>

                <RecordActions record={record} />
            </div>

            <div className="mt-4">
                <StatusBadge status={record.enterprises_status} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex min-w-0 items-start gap-2.5">
                    <FaMapMarkerAlt className="mt-1 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            LGU / Municipality
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                            {record.lgu || record.municipality || "—"}
                        </p>
                        <p className="mt-1 break-words text-xs text-slate-400">
                            {record.barangay || "Barangay not specified"}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 items-start gap-2.5">
                    <FaCalendarAlt className="mt-1 shrink-0 text-slate-400" />
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Evaluation year
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                            {record.evaluation_year || "—"}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 items-start gap-2.5">
                    <FaBuilding className="mt-1 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Enterprise / Track
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-700">
                            {record.type_of_enterprise || record.track || "—"}
                        </p>
                    </div>
                </div>

                <div className="flex min-w-0 items-start gap-2.5">
                    <FaMoneyBillWave className="mt-1 shrink-0 text-slate-400" />
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Grant received
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {formatMoney(record.total_grant_received)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                    <FaUserTie />
                    {record.mpdos || "Evaluator not recorded"}
                </span>
                <span className="flex items-center gap-1.5">
                    <FaCalendarAlt />
                    {formatDate(record.date_provided)}
                </span>
            </div>
        </article>
    );
}

function getOptionValue(item, keys = []) {
    if (typeof item === "string" || typeof item === "number") {
        return String(item);
    }

    if (!item || typeof item !== "object") return "";

    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null) {
            return String(item[key]);
        }
    }

    return "";
}

function FilterSelect({
    label,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    optionKeys = [],
}) {
    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {label}
            </label>

            <select
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            >
                <option value="">{placeholder}</option>

                {options.map((item, index) => {
                    const optionValue = getOptionValue(item, optionKeys);
                    const optionLabel =
                        typeof item === "object" && item !== null
                            ? String(
                                  item.label ??
                                      item.municipality ??
                                      item.barangay ??
                                      item.type_of_enterprise ??
                                      item.value ??
                                      optionValue
                              )
                            : optionValue;

                    if (!optionValue) return null;

                    return (
                        <option
                            key={`${optionValue}-${index}`}
                            value={optionValue}
                        >
                            {optionLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default function Summary({
    auth,
    summary,
    filters = {},
    options = {},
    stats = {},
    access = {},
}) {
    const { props: pageProps } = usePage();

    const currentUser = auth?.user ?? pageProps?.auth?.user ?? {};
    const roles = normalizeRoles(currentUser.roles);

    const isLguUser =
        access.isLguUser !== undefined
            ? Boolean(access.isLguUser)
            : roles.includes("lgu");

    const isAdmin =
        access.isAdmin !== undefined
            ? Boolean(access.isAdmin)
            : roles.includes("admin");

    // An LGU user's assigned LGU is authoritative.
    const assignedLgu = String(
        access.lgu ?? currentUser.lgu ?? ""
    ).trim();

    const records = Array.isArray(summary?.data) ? summary.data : [];
    const paginationLinks = summary?.links || [];

    const [search, setSearch] = useState(filters.search || "");
    const [year, setYear] = useState(filters.evaluation_year || "");
    const [track, setTrack] = useState(filters.track || "");
    const [lgu, setLgu] = useState(
        isLguUser ? assignedLgu : filters.lgu || ""
    );
    const [municipality, setMunicipality] = useState(
        filters.municipality || ""
    );
    const [barangay, setBarangay] = useState(filters.barangay || "");
    const [typeOfEnterprise, setTypeOfEnterprise] = useState(
        filters.type_of_enterprise || ""
    );
    const [status, setStatus] = useState(
        filters.enterprises_status || ""
    );

    const [view, setView] = useState("list");
    const [showFilters, setShowFilters] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Never let server-provided filter values override the LGU account scope.
    useEffect(() => {
        setSearch(filters.search || "");
        setYear(filters.evaluation_year || "");
        setTrack(filters.track || "");
        setLgu(isLguUser ? assignedLgu : filters.lgu || "");
        setMunicipality(filters.municipality || "");
        setBarangay(filters.barangay || "");
        setTypeOfEnterprise(filters.type_of_enterprise || "");
        setStatus(filters.enterprises_status || "");
    }, [
        filters.search,
        filters.evaluation_year,
        filters.track,
        filters.lgu,
        filters.municipality,
        filters.barangay,
        filters.type_of_enterprise,
        filters.enterprises_status,
        isLguUser,
        assignedLgu,
    ]);

    const effectiveLgu = isLguUser ? assignedLgu : lgu;

    const activeFilterCount = useMemo(
        () =>
            [
                year,
                track,
                isLguUser ? "" : lgu,
                municipality,
                barangay,
                typeOfEnterprise,
                status,
            ].filter(Boolean).length,
        [
            year,
            track,
            lgu,
            municipality,
            barangay,
            typeOfEnterprise,
            status,
            isLguUser,
        ]
    );

    const hasFilters = Boolean(
        search ||
            year ||
            track ||
            (isLguUser ? false : lgu) ||
            municipality ||
            barangay ||
            typeOfEnterprise ||
            status
    );

    const buildFilterParams = useCallback(
        (overrides = {}) => {
            const params = {
                search,
                evaluation_year: year,
                track,
                lgu: effectiveLgu,
                municipality,
                barangay,
                type_of_enterprise: typeOfEnterprise,
                enterprises_status: status,
                ...overrides,
            };

            // Do this after overrides so an LGU account cannot override its LGU.
            if (isLguUser) {
                params.lgu = assignedLgu;
            }

            Object.keys(params).forEach((key) => {
                if (
                    params[key] === undefined ||
                    params[key] === null ||
                    String(params[key]).trim() === ""
                ) {
                    delete params[key];
                }
            });

            return params;
        },
        [
            search,
            year,
            track,
            effectiveLgu,
            municipality,
            barangay,
            typeOfEnterprise,
            status,
            isLguUser,
            assignedLgu,
        ]
    );

    const applyFilters = useCallback(
        (overrides = {}) => {
            router.get("/summary", buildFilterParams(overrides), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [buildFilterParams]
    );

    const clearFilters = () => {
        setSearch("");
        setYear("");
        setTrack("");
        setLgu(isLguUser ? assignedLgu : "");
        setMunicipality("");
        setBarangay("");
        setTypeOfEnterprise("");
        setStatus("");

        const params = {};

        if (isLguUser && assignedLgu) {
            params.lgu = assignedLgu;
        }

        router.get("/summary", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounced search; other filters remain intact.
    useEffect(() => {
        if (search === (filters.search || "")) return undefined;

        const timer = setTimeout(() => {
            applyFilters({ search });
        }, 450);

        return () => clearTimeout(timer);
    }, [search, filters.search, applyFilters]);

    const getFilterQuery = () => {
        const params = new URLSearchParams();

        Object.entries(buildFilterParams()).forEach(([key, value]) => {
            params.set(key, String(value));
        });

        return params.toString();
    };

    const exportExcel = () => {
        const query = getFilterQuery();

        window.location.href = `/summary/export-excel${
            query ? `?${query}` : ""
        }`;
    };

    const escapeHtml = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (character) => {
            const replacements = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            };

            return replacements[character];
        });

    const exportPdf = async () => {
        setIsExporting(true);

        try {
            const query = getFilterQuery();

            const response = await fetch(
                `/summary/print-data${query ? `?${query}` : ""}`,
                {
                    headers: { Accept: "application/json" },
                    credentials: "same-origin",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load filtered summary records for printing."
                );
            }

            const payload = await response.json();

            // The controller returns { generated_at, records }.
            const rows = Array.isArray(payload)
                ? payload
                : payload.records || payload.data || [];

            if (!Array.isArray(rows)) {
                throw new Error("The print endpoint returned invalid records.");
            }

            const printWindow = window.open(
                "",
                "_blank",
                "width=1200,height=800"
            );

            if (!printWindow) {
                window.alert(
                    "Please allow pop-ups to print or save the report as PDF."
                );
                return;
            }

            const tableRows = rows
                .map(
                    (record) => `
                    <tr>
                        <td>${escapeHtml(
                            record.monitoring_record_id ??
                                record.beneficiaries_id ??
                                "—"
                        )}</td>
                        <td>${escapeHtml(record.evaluation_year || "—")}</td>
                        <td>${escapeHtml(
                            record.date_provided
                                ? String(record.date_provided).slice(0, 10)
                                : "—"
                        )}</td>
                        <td>${escapeHtml(record.mpdos || "—")}</td>
                        <td>${escapeHtml(record.track || "—")}</td>
                        <td>${escapeHtml(record.lgu || "—")}</td>
                        <td>${escapeHtml(record.municipality || "—")}</td>
                        <td>${escapeHtml(record.barangay || "—")}</td>
                        <td>${escapeHtml(
                            record.name_of_slpa_slp_participant ||
                                record.name_of_project ||
                                "—"
                        )}</td>
                        <td>${escapeHtml(record.name_of_project || "—")}</td>
                        <td>${escapeHtml(
                            record.type_of_enterprise || "—"
                        )}</td>
                        <td>${escapeHtml(
                            record.enterprises_status || "Not assessed"
                        )}</td>
                        <td style="text-align:right">${escapeHtml(
                            formatMoney(record.total_grant_received)
                        )}</td>
                    </tr>
                `
                )
                .join("");

            printWindow.document.open();
            printWindow.document.write(`<!doctype html>
                <html>
                <head>
                    <meta charset="utf-8" />
                    <title>SLP Summary Records</title>
                    <style>
                        * { box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; color: #1e293b; margin: 24px; }
                        h1 { margin: 0 0 6px; font-size: 22px; }
                        p { margin: 0 0 18px; color: #64748b; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; font-size: 9px; }
                        th { background: #e2e8f0; text-align: left; }
                        th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; }
                        tr { break-inside: avoid; }
                        @page { size: landscape; margin: 10mm; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <h1>SLP Summary Records</h1>
                    <p>Monitoring &amp; Evaluation · Generated ${escapeHtml(
                        new Date().toLocaleString()
                    )} · ${rows.length} record(s)</p>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Year</th><th>Date Provided</th>
                                <th>MPDO</th><th>Track</th><th>LGU</th>
                                <th>Municipality</th><th>Barangay</th>
                                <th>Participant</th><th>Project</th>
                                <th>Enterprise Type</th><th>Status</th>
                                <th>Grant Received</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                tableRows ||
                                '<tr><td colspan="13">No records found for the selected filters.</td></tr>'
                            }
                        </tbody>
                    </table>
                    <script>window.onload = () => window.print();<\/script>
                </body>
                </html>`);
            printWindow.document.close();
        } catch (error) {
            window.alert(
                error.message || "Unable to prepare the PDF print report."
            );
        } finally {
            setIsExporting(false);
        }
    };

    const changeFilter = (setter, key, value, extra = {}) => {
        setter(value);
        applyFilters({ [key]: value, ...extra });
    };

    return (
        <Layout>
            <Head title="SLP Summary Records" />

            <div className="min-h-screen bg-slate-50/80 px-2 py-2 sm:px-2 lg:px-2">
                <div className="mx-auto max-w-[1600px] space-y-6">
                    {/* Breadcrumb and exports */}
                    <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                            <span>Admin</span>
                            <FaChevronRight className="text-[8px]" />
                            <span>Manage</span>
                            <FaChevronRight className="text-[8px]" />
                            <span>SLP</span>
                            <FaChevronRight className="text-[8px]" />
                            <span className="font-bold text-emerald-700">
                                Summary Records
                            </span>
                        </nav>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={exportExcel}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
                            >
                                <FaFileExcel />
                                Export Excel
                            </button>

                            <button
                                type="button"
                                onClick={exportPdf}
                                disabled={isExporting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-60"
                            >
                                <FaFilePdf />
                                {isExporting
                                    ? "Preparing report..."
                                    : "Print / Save PDF"}
                            </button>
                        </div>
                    </div>

                    {/* Heading */}
                    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                                <FaChartLine />
                                Monitoring &amp; Evaluation
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                SLP Summary Records
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Review and monitor livelihood enterprise
                                evaluations, grant records, and implementation
                                outcomes.
                            </p>

                            {isLguUser && (
                                <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                                    <FaMapMarkerAlt />
                                    LGU access: {assignedLgu || "Not assigned"}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <FaClipboardCheck />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400">
                                    Records matching filters
                                </p>
                                <p className="text-lg font-extrabold text-slate-900">
                                    {summary?.total ?? records.length}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Statistics */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <StatCard
                            title="Total Records"
                            value={stats.total ?? 0}
                            description="Matching evaluation records"
                            icon={FaClipboardCheck}
                            accent="bg-sky-50 text-sky-700"
                        />
                        <StatCard
                            title="Mainstreaming"
                            value={stats.mainstreaming ?? 0}
                            description="Enterprises progressing"
                            icon={FaCheckCircle}
                            accent="bg-emerald-50 text-emerald-700"
                        />
                        <StatCard
                            title="Rehabilitation"
                            value={stats.rehabilitation ?? 0}
                            description="Needing further support"
                            icon={FaSyncAlt}
                            accent="bg-amber-50 text-amber-700"
                        />
                        <StatCard
                            title="Closure"
                            value={stats.closure ?? 0}
                            description="Assessed for closure"
                            icon={FaExclamationTriangle}
                            accent="bg-rose-50 text-rose-700"
                        />
                        <StatCard
                            title="Total Grant Received"
                            value={formatMoney(stats.totalGrant)}
                            description="For matching records"
                            icon={FaMoneyBillWave}
                            accent="bg-violet-50 text-violet-700"
                        />
                    </section>

                    {/* Search and filters */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="space-y-4 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search participant, project, LGU, barangay, evaluator..."
                                        className={`${inputClass} pl-11`}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowFilters((current) => !current)
                                        }
                                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                            showFilters
                                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <FaFilter />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] text-white">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                        <FaChevronDown
                                            className={`text-[10px] transition ${
                                                showFilters ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setView("list")}
                                            title="List view"
                                            aria-label="List view"
                                            className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                                                view === "list"
                                                    ? "bg-white text-emerald-700 shadow-sm"
                                                    : "text-slate-400 hover:text-slate-700"
                                            }`}
                                        >
                                            <FaList />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setView("card")}
                                            title="Card view"
                                            aria-label="Card view"
                                            className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${
                                                view === "card"
                                                    ? "bg-white text-emerald-700 shadow-sm"
                                                    : "text-slate-400 hover:text-slate-700"
                                            }`}
                                        >
                                            <FaThLarge />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => applyFilters()}
                                        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
                                    >
                                        Apply filters
                                    </button>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <FilterSelect
                                        label="Evaluation Year"
                                        value={year}
                                        placeholder="All years"
                                        options={options.years || []}
                                        onChange={(value) =>
                                            changeFilter(
                                                setYear,
                                                "evaluation_year",
                                                value
                                            )
                                        }
                                    />

                                    <FilterSelect
                                        label="Track"
                                        value={track}
                                        placeholder="All tracks"
                                        options={options.tracks || []}
                                        onChange={(value) =>
                                            changeFilter(
                                                setTrack,
                                                "track",
                                                value
                                            )
                                        }
                                    />

                                    <FilterSelect
                                        label={
                                            isLguUser
                                                ? "Assigned LGU"
                                                : "LGU"
                                        }
                                        value={effectiveLgu}
                                        placeholder={
                                            isLguUser
                                                ? assignedLgu || "No LGU assigned"
                                                : "All LGUs"
                                        }
                                        options={
                                            isLguUser
                                                ? assignedLgu
                                                    ? [assignedLgu]
                                                    : []
                                                : options.lgus || []
                                        }
                                        disabled={isLguUser}
                                        onChange={(value) =>
                                            changeFilter(setLgu, "lgu", value)
                                        }
                                    />

                                    <FilterSelect
                                        label="Municipality"
                                        value={municipality}
                                        placeholder="All municipalities"
                                        options={options.municipalities || []}
                                        optionKeys={[
                                            "value",
                                            "municipality",
                                            "label",
                                        ]}
                                        onChange={(value) => {
                                            setMunicipality(value);
                                            setBarangay("");
                                            applyFilters({
                                                municipality: value,
                                                barangay: "",
                                            });
                                        }}
                                    />

                                    <FilterSelect
                                        label="Barangay"
                                        value={barangay}
                                        placeholder="All barangays"
                                        options={options.barangays || []}
                                        optionKeys={[
                                            "value",
                                            "barangay",
                                            "barangay_name",
                                            "label",
                                        ]}
                                        onChange={(value) =>
                                            changeFilter(
                                                setBarangay,
                                                "barangay",
                                                value
                                            )
                                        }
                                    />

                                    <FilterSelect
                                        label="Type of Enterprise"
                                        value={typeOfEnterprise}
                                        placeholder="All enterprise types"
                                        options={options.enterpriseTypes || []}
                                        optionKeys={[
                                            "value",
                                            "type_of_enterprise",
                                            "label",
                                        ]}
                                        onChange={(value) =>
                                            changeFilter(
                                                setTypeOfEnterprise,
                                                "type_of_enterprise",
                                                value
                                            )
                                        }
                                    />

                                    <FilterSelect
                                        label="Enterprise Status"
                                        value={status}
                                        placeholder="All statuses"
                                        options={[
                                            "Mainstreaming",
                                            "Rehabilitation",
                                            "Closure",
                                        ]}
                                        onChange={(value) =>
                                            changeFilter(
                                                setStatus,
                                                "enterprises_status",
                                                value
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {hasFilters && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                    <p className="text-xs text-slate-500">
                                        Filters are applied to the server-side
                                        record list.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                                    >
                                        <FaTimes />
                                        Clear filters
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-bold text-slate-800">
                                    {summary?.from ?? (records.length ? 1 : 0)}
                                </span>
                                {"–"}
                                <span className="font-bold text-slate-800">
                                    {summary?.to ?? records.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-slate-800">
                                    {summary?.total ?? records.length}
                                </span>{" "}
                                records
                            </p>

                            <p className="text-xs font-medium text-slate-400">
                                Monitoring records
                            </p>
                        </div>
                    </section>

                    {/* Results */}
                    <section className="space-y-4">
                        {records.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                                    <FaFileAlt />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-800">
                                    No summary records found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    No records match your search and filters.
                                    Try changing the selected filters or
                                    clearing the search.
                                </p>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        ) : view === "card" ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {records.map((record, index) => (
                                    <RecordCard
                                        key={
                                            record.monitoring_record_id ??
                                            record.beneficiaries_id ??
                                            index
                                        }
                                        record={record}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1150px] border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/90">
                                                {[
                                                    "Participant / Project",
                                                    "Location",
                                                    "Year / Track",
                                                    "Grant Received",
                                                    "Enterprise Status",
                                                    "Date Provided",
                                                    "View",
                                                ].map((heading) => (
                                                    <th
                                                        key={heading}
                                                        className={`px-5 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 ${
                                                            heading === "View"
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
                                            {records.map((record, index) => (
                                                <tr
                                                    key={
                                                        record.monitoring_record_id ??
                                                        record.beneficiaries_id ??
                                                        index
                                                    }
                                                    className="transition hover:bg-emerald-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                                                <FaStore />
                                                            </div>

                                                            <div className="max-w-xs">
                                                                <p className="break-words text-sm font-bold text-slate-800">
                                                                    {record.name_of_slpa_slp_participant ||
                                                                        "Unnamed participant"}
                                                                </p>
                                                                <p className="mt-1 break-words text-xs text-slate-500">
                                                                    {record.name_of_project ||
                                                                        "No project name"}
                                                                </p>
                                                                <p className="mt-1 break-words text-xs text-slate-400">
                                                                    {record.type_of_enterprise ||
                                                                        "Enterprise not specified"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {record.lgu ||
                                                                record.municipality ||
                                                                "—"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {record.barangay ||
                                                                "Barangay not specified"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {record.evaluation_year ||
                                                                "—"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {record.track ||
                                                                "Track not specified"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm font-bold tabular-nums text-slate-800">
                                                        {formatMoney(
                                                            record.total_grant_received
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                record.enterprises_status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                record.date_provided
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {record.mpdos ||
                                                                "Evaluator not recorded"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <div className="flex justify-end">
                                                            <RecordActions
                                                                record={record}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
                                    Select the eye icon to open the linked
                                    beneficiary monitoring page.
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {paginationLinks.length > 3 && (
                            <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-500">
                                    Page{" "}
                                    <span className="font-bold text-slate-800">
                                        {summary?.current_page ?? 1}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-bold text-slate-800">
                                        {summary?.last_page ?? 1}
                                    </span>
                                </p>

                                <div className="flex flex-wrap items-center gap-1.5">
                                    {paginationLinks.map((item, index) => {
                                        const label = String(item.label || "")
                                            .replace("&laquo;", "«")
                                            .replace("&raquo;", "»")
                                            .replace("Previous", "‹ Previous")
                                            .replace("Next", "Next ›");

                                        return item.url ? (
                                            <Link
                                                key={`${label}-${index}`}
                                                href={item.url}
                                                preserveScroll
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
                                                    item.active
                                                        ? "bg-emerald-700 text-white"
                                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                }`}
                                            >
                                                {label}
                                            </Link>
                                        ) : (
                                            <span
                                                key={`${label}-${index}`}
                                                className="flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs text-slate-300"
                                            >
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    <footer className="no-print flex flex-col gap-1 border-t border-slate-200/80 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>SLP Enterprise Monitoring &amp; Evaluation</p>
                        <p>
                            Summary Records ·{" "}
                            {isLguUser ? "LGU Dashboard" : "Administrative Dashboard"}
                        </p>
                    </footer>
                </div>
            </div>

            <style>{`
                @media print {
                    body {
                        background: white !important;
                    }

                    aside,
                    nav,
                    .no-print {
                        display: none !important;
                    }

                    main,
                    #app,
                    body {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    table {
                        width: 100% !important;
                        font-size: 9px !important;
                    }

                    th, td {
                        padding: 6px !important;
                    }

                    article {
                        break-inside: avoid;
                    }

                    @page {
                        size: landscape;
                        margin: 12mm;
                    }
                }
            `}</style>
        </Layout>
    );
}
