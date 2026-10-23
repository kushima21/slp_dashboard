
import { useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import {
    FaSearch,
    FaFilter,
    FaSyncAlt,
    FaChartLine,
    FaChartBar,
    FaBuilding,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaChevronRight,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClipboardCheck,
    FaEye,
    FaStore,
    FaShieldAlt,
} from "react-icons/fa";

const number = (value) =>
    new Intl.NumberFormat("en-PH").format(Number(value || 0));

const percent = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

const statusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
        value.includes("mainstream") ||
        value === "active"
    ) {
        return {
            className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
            dot: "bg-emerald-500",
        };
    }

    if (
        value.includes("rehabilitation") ||
        value.includes("pending")
    ) {
        return {
            className: "bg-amber-50 text-amber-700 ring-amber-200",
            dot: "bg-amber-500",
        };
    }

    if (
        value.includes("closure") ||
        value.includes("inactive") ||
        value.includes("closed")
    ) {
        return {
            className: "bg-rose-50 text-rose-700 ring-rose-200",
            dot: "bg-rose-500",
        };
    }

    return {
        className: "bg-slate-100 text-slate-600 ring-slate-200",
        dot: "bg-slate-400",
    };
};

function SectionTitle({ icon: Icon, title, description, action }) {
    return (
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon />
                </div>

                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {action}
        </div>
    );
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon,
    color,
    percentage,
}) {
    const themes = {
        blue: {
            icon: "bg-blue-50 text-blue-700",
            accent: "bg-blue-500",
        },
        green: {
            icon: "bg-emerald-50 text-emerald-700",
            accent: "bg-emerald-500",
        },
        amber: {
            icon: "bg-amber-50 text-amber-700",
            accent: "bg-amber-500",
        },
        red: {
            icon: "bg-rose-50 text-rose-700",
            accent: "bg-rose-500",
        },
        violet: {
            icon: "bg-violet-50 text-violet-700",
            accent: "bg-violet-500",
        },
    };

    const theme = themes[color] || themes.blue;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div
                className={`absolute inset-x-0 top-0 h-1 ${theme.accent}`}
            />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {title}
                    </p>

                    <p className="mt-3 break-words text-3xl font-extrabold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}
                >
                    <Icon size={18} />
                </div>
            </div>

            {percentage !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full ${theme.accent}`}
                            style={{
                                width: `${Math.min(
                                    Math.max(Number(percentage) || 0, 0),
                                    100
                                )}%`,
                            }}
                        />
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                        {percent(percentage)}
                    </span>
                </div>
            )}
        </div>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span className="text-slate-600">{label}</span>
        </div>
    );
}

export default function Analytics({
    summary = {},
    municipalityStats = [],
    priorityMunicipalities = [],
    watchList = [],
    filters: initialFilters = {},
    options = {},
}) {
    const [filters, setFilters] = useState({
        evaluation_year: initialFilters.evaluation_year || "",
        municipality: initialFilters.municipality || "",
        track: initialFilters.track || "",
        enterprises_status: initialFilters.enterprises_status || "",
    });

    const [search, setSearch] = useState("");

    const hasFilters = Object.values(filters).some(Boolean);

    const filteredWatchList = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return watchList;

        return watchList.filter((item) =>
            [
                item.name,
                item.municipality,
                item.barangay,
                item.status,
                item.recommendation,
                item.track,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(term)
                )
        );
    }, [watchList, search]);

    const maxMunicipalityTotal = Math.max(
        1,
        ...municipalityStats.map((item) => Number(item.total || 0))
    );

    const applyFilters = (event) => {
        event.preventDefault();

        router.get("/analytics", filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const cleared = {
            evaluation_year: "",
            municipality: "",
            track: "",
            enterprises_status: "",
        };

        setFilters(cleared);
        setSearch("");

        router.get("/analytics", cleared, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <Layout>
            <Head title="SLP Enterprise Analytics Dashboard" />

            <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
                {/* Breadcrumb */}
                <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                    <span>Admin</span>
                    <FaChevronRight className="text-[9px]" />
                    <span>Manage</span>
                    <FaChevronRight className="text-[9px]" />
                    <span>SLP</span>
                    <FaChevronRight className="text-[9px]" />
                    <span className="font-bold text-emerald-700">
                        Analytics Dashboard
                    </span>
                </nav>

                {/* Dashboard heading */}
                <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9">
                    <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                                <FaChartLine />
                                Monitoring & Evaluation
                            </div>

                            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                SLP Enterprise Analytics
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                                Monitor enterprise performance, compare
                                municipalities, identify priority areas,
                                and review enterprises requiring follow-up.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Reporting year
                                </p>

                                <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                                    <FaCalendarAlt className="text-emerald-400" />
                                    {filters.evaluation_year || "All years"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                <FaSyncAlt />
                                Reset filters
                            </button>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <FaFilter className="text-emerald-600" />

                        <h2 className="text-sm font-bold text-slate-900">
                            Dashboard filters
                        </h2>

                        {hasFilters && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                Filters applied
                            </span>
                        )}
                    </div>

                    <form
                        onSubmit={applyFilters}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
                    >
                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Evaluation year
                            </label>

                            <select
                                value={filters.evaluation_year}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        evaluation_year: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="">All years</option>

                                {(options.years || []).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Municipality
                            </label>

                            <select
                                value={filters.municipality}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        municipality: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="">All municipalities</option>

                                {(options.municipalities || []).map(
                                    (municipality) => (
                                        <option
                                            key={municipality}
                                            value={municipality}
                                        >
                                            {municipality}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Track
                            </label>

                            <select
                                value={filters.track}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        track: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="">All tracks</option>

                                {(options.tracks || []).map((track) => (
                                    <option key={track} value={track}>
                                        {track}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Enterprise status
                            </label>

                            <select
                                value={filters.enterprises_status}
                                onChange={(event) =>
                                    setFilters((previous) => ({
                                        ...previous,
                                        enterprises_status: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            >
                                <option value="">All statuses</option>

                                {(options.statuses || []).map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20"
                            >
                                <FaSearch />
                                Apply filters
                            </button>
                        </div>
                    </form>
                </section>

                {/* Summary cards */}
                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-sm font-bold text-slate-900">
                            Enterprise overview
                        </h2>

                        <p className="text-xs text-slate-500">
                            Based on matching monitoring records
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <MetricCard
                            title="Monitoring records"
                            value={number(summary.total)}
                            description="Records in the selected reporting scope"
                            icon={FaClipboardCheck}
                            color="blue"
                        />

                        <MetricCard
                            title="Active / mainstreaming"
                            value={number(summary.active)}
                            description="Records classified as active"
                            icon={FaCheckCircle}
                            color="green"
                            percentage={summary.activePercentage}
                        />

                        <MetricCard
                            title="At risk"
                            value={number(summary.atRisk)}
                            description="Rehabilitation or pending records"
                            icon={FaExclamationTriangle}
                            color="amber"
                            percentage={summary.atRiskPercentage}
                        />

                        <MetricCard
                            title="Inactive / closure"
                            value={number(summary.inactive)}
                            description="Records classified as inactive or closure"
                            icon={FaTimesCircle}
                            color="red"
                            percentage={summary.inactivePercentage}
                        />

                        <MetricCard
                            title="High-priority municipalities"
                            value={`${number(summary.highPriorityMunicipalities)} / ${number(summary.totalMunicipalities)}`}
                            description="Municipalities classified as high risk"
                            icon={FaMapMarkerAlt}
                            color="violet"
                        />
                    </div>
                </section>

                {/* Municipality graph and risk classification */}
                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionTitle
                            icon={FaChartBar}
                            title="Enterprise status by municipality"
                            description="Compare active, at-risk, and inactive monitoring records."
                        />

                        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-slate-50 p-3">
                            <LegendItem
                                color="bg-emerald-500"
                                label="Active"
                            />
                            <LegendItem
                                color="bg-amber-400"
                                label="At risk"
                            />
                            <LegendItem
                                color="bg-rose-500"
                                label="Inactive"
                            />
                        </div>

                        {municipalityStats.length === 0 ? (
                            <div className="flex min-h-48 flex-col items-center justify-center text-center">
                                <FaChartBar className="mb-3 text-3xl text-slate-300" />

                                <p className="text-sm font-semibold text-slate-600">
                                    No municipality data available
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Try changing your dashboard filters.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {municipalityStats.map((item) => {
                                    const active = Number(item.active || 0);
                                    const atRisk = Number(item.atRisk || 0);
                                    const inactive = Number(item.inactive || 0);
                                    const total = Number(item.total || 0);

                                    return (
                                        <div key={item.municipality}>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <FaMapMarkerAlt className="shrink-0 text-xs text-slate-400" />

                                                    <span
                                                        className="truncate text-xs font-semibold text-slate-700"
                                                        title={item.municipality}
                                                    >
                                                        {item.municipality}
                                                    </span>
                                                </div>

                                                <span className="shrink-0 text-xs font-bold text-slate-500">
                                                    {number(total)} records
                                                </span>
                                            </div>

                                            <div
                                                className="flex h-4 overflow-hidden rounded-full bg-slate-100"
                                                title={`Active: ${active}, At risk: ${atRisk}, Inactive: ${inactive}`}
                                            >
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                    style={{
                                                        width: `${(active / maxMunicipalityTotal) * 100}%`,
                                                    }}
                                                />

                                                <div
                                                    className="h-full bg-amber-400 transition-all duration-500"
                                                    style={{
                                                        width: `${(atRisk / maxMunicipalityTotal) * 100}%`,
                                                    }}
                                                />

                                                <div
                                                    className="h-full bg-rose-500 transition-all duration-500"
                                                    style={{
                                                        width: `${(inactive / maxMunicipalityTotal) * 100}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                                                <span>
                                                    Active:{" "}
                                                    <b className="text-emerald-700">
                                                        {active}
                                                    </b>
                                                </span>

                                                <span>
                                                    At risk:{" "}
                                                    <b className="text-amber-700">
                                                        {atRisk}
                                                    </b>
                                                </span>

                                                <span>
                                                    Inactive:{" "}
                                                    <b className="text-rose-700">
                                                        {inactive}
                                                    </b>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                <p className="border-t border-slate-100 pt-3 text-[10px] leading-5 text-slate-400">
                                    Bars use a common scale based on the
                                    municipality with the most records.
                                    Unknown statuses are included in totals
                                    but not in the colored segments.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <SectionTitle
                            icon={FaShieldAlt}
                            title="Municipality priority classification"
                            description="Rank municipalities using their status-based risk scores."
                        />

                        <div className="mb-4 grid grid-cols-3 gap-2">
                            {[
                                {
                                    label: "High",
                                    color: "bg-rose-500",
                                    count: priorityMunicipalities.filter(
                                        (item) => item.level === "High"
                                    ).length,
                                },
                                {
                                    label: "Medium",
                                    color: "bg-amber-400",
                                    count: priorityMunicipalities.filter(
                                        (item) => item.level === "Medium"
                                    ).length,
                                },
                                {
                                    label: "Low",
                                    color: "bg-emerald-500",
                                    count: priorityMunicipalities.filter(
                                        (item) => item.level === "Low"
                                    ).length,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${item.color}`}
                                        />

                                        <span className="text-[10px] font-medium text-slate-500">
                                            {item.label} priority
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xl font-extrabold text-slate-900">
                                        {item.count}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {priorityMunicipalities.length === 0 ? (
                            <div className="flex min-h-40 flex-col items-center justify-center text-center">
                                <FaShieldAlt className="mb-3 text-3xl text-slate-300" />

                                <p className="text-sm font-semibold text-slate-600">
                                    No priority data available
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {priorityMunicipalities.map((item) => {
                                    const high = item.level === "High";
                                    const medium = item.level === "Medium";

                                    const badge = high
                                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                                        : medium
                                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                                          : "bg-emerald-50 text-emerald-700 ring-emerald-200";

                                    const dot = high
                                        ? "bg-rose-500"
                                        : medium
                                          ? "bg-amber-400"
                                          : "bg-emerald-500";

                                    return (
                                        <div
                                            key={item.municipality}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span
                                                    className={`h-3 w-3 shrink-0 rounded-full ${dot}`}
                                                />

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-bold text-slate-800">
                                                        {item.municipality}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-slate-500">
                                                        {number(item.total)} monitoring records
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="ml-auto flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-800">
                                                        Score{" "}
                                                        {Number(item.score || 0).toFixed(1)}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-slate-400">
                                                        Risk index / 100
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${badge}`}
                                                >
                                                    {item.level}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <p className="mt-4 text-[10px] leading-5 text-slate-400">
                            Risk scores are screening indicators based on
                            recorded enterprise status, not predictions of
                            enterprise failure.
                        </p>
                    </div>
                </section>

                {/* Enterprise watch-list - full width */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <SectionTitle
                        icon={FaEye}
                        title="Enterprise watch-list"
                        description="Review enterprises requiring closer monitoring, rehabilitation, or follow-up."
                        action={
                            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                                {number(filteredWatchList.length)} records
                            </span>
                        }
                    />

                    <div className="relative mb-5 max-w-xl">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search enterprise, municipality, or barangay..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-xs outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    {filteredWatchList.length === 0 ? (
                        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center">
                            <FaStore className="mb-3 text-3xl text-slate-300" />

                            <p className="text-sm font-semibold text-slate-600">
                                No matching watch-list records
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try another search or adjust the dashboard filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                            {filteredWatchList.map((item) => {
                                const style = statusStyle(item.status);

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                <FaBuilding />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                    <h3 className="min-w-0 break-words text-sm font-bold text-slate-900">
                                                        {item.name || "Unnamed enterprise"}
                                                    </h3>

                                                    <span
                                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${style.className}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                                        />

                                                        {item.status || "Unclassified"}
                                                    </span>
                                                </div>

                                                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FaMapMarkerAlt />
                                                        {item.municipality || "No municipality"}
                                                    </span>

                                                    <span>•</span>

                                                    <span>
                                                        {item.barangay || "No barangay"}
                                                    </span>
                                                </p>

                                                {item.recommendation && (
                                                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                                        <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                            Evaluation recommendation / remarks
                                                        </p>

                                                        <p className="whitespace-pre-line text-xs leading-5 text-slate-600">
                                                            {item.recommendation}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        {item.track || "Track not specified"}
                                                        {item.year ? ` • ${item.year}` : ""}
                                                    </span>

                                                    {item.date && (
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Footer */}
                <div className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FaShieldAlt className="shrink-0 text-emerald-600" />

                        <span>
                            SLP decision-support analytics. Original monitoring
                            records remain the source of truth.
                        </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                        Municipality-level monitoring & intervention planning
                    </span>
                </div>
            </div>
        </Layout>
    );
}
