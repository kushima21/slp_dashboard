
import { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import {
    FaSearch,
    FaChevronRight,
    FaMapMarkerAlt,
    FaBuilding,
    FaUsers,
    FaFilter,
    FaCalendarAlt,
    FaSync,
    FaChartLine,
    FaProjectDiagram,
    FaHandHoldingHeart,
    FaDownload,
} from "react-icons/fa";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

const formatNumber = (value) =>
    new Intl.NumberFormat("en-PH").format(Number(value) || 0);

const getParticipantCategory = (record) => {
    const type = normalize(record.type_of_enterprise);
    const modality = normalize(record.modality);
    const track = normalize(record.track);

    // Check enterprise type first so an association on the MD track
    // is not incorrectly counted as an individual participant.
    if (type.includes("association")) return "Association";
    if (type.includes("individual")) return "Individual";

    if (modality.includes("association")) return "Association";
    if (modality.includes("individual")) return "Individual";

    if (track === "md") return "Individual";
    if (track === "ef") return "Employment Facilitation";

    if (track.includes("association")) return "Association";
    if (track.includes("individual")) return "Individual";

    return record.type_of_enterprise || record.modality || record.track || "Other";
};

export default function Dashboard({
    records = [],
    filterOptions = {},
    access = {},
}) {
    const isLguUser = access?.restricted === true;
    const assignedLgu = access?.lgu ?? "";

    const [filters, setFilters] = useState({
        year: "all",
        lgu: assignedLgu || "all",
        barangay: "all",
        participant: "all",
        search: "",
    });

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "lgu" ? { barangay: "all" } : {}),
        }));
    };

    const resetFilters = () => {
        setFilters({
            year: "all",
            lgu: isLguUser ? assignedLgu : "all",
            barangay: "all",
            participant: "all",
            search: "",
        });
    };

    const lguOptions = useMemo(() => {
        if (isLguUser) {
            return assignedLgu ? [assignedLgu] : [];
        }

        return filterOptions.lgus ?? [];
    }, [isLguUser, assignedLgu, filterOptions.lgus]);

    const availableBarangays = useMemo(() => {
        const matchingRecords = records.filter((record) => {
            const matchesLgu =
                filters.lgu === "all" ||
                normalize(record.lgu) === normalize(filters.lgu);

            return matchesLgu;
        });

        return [
            ...new Set(
                matchingRecords
                    .map((record) => record.barangay)
                    .filter(Boolean)
            ),
        ].sort((a, b) => String(a).localeCompare(String(b)));
    }, [records, filters.lgu]);

    const filteredRecords = useMemo(() => {
        const keyword = normalize(filters.search);

        return records.filter((record) => {
            const matchesYear =
                filters.year === "all" ||
                String(record.year ?? "") === filters.year;

            const matchesLgu =
                filters.lgu === "all" ||
                normalize(record.lgu) === normalize(filters.lgu);

            const matchesBarangay =
                filters.barangay === "all" ||
                normalize(record.barangay) === normalize(filters.barangay);

            const matchesParticipant =
                filters.participant === "all" ||
                normalize(getParticipantCategory(record)) ===
                    normalize(filters.participant);

            const searchableText = [
                record.id,
                record.beneficiaries_id,
                record.mpdos,
                record.participant,
                record.name_of_project,
                record.type_of_enterprise,
                record.lgu,
                record.municipality,
                record.barangay,
                record.district,
                record.track,
                record.modality,
                record.status,
                record.intervention_support,
                record.evaluation_recommendation,
                record.remarks,
            ]
                .map(normalize)
                .join(" ");

            const matchesSearch =
                !keyword || searchableText.includes(keyword);

            return (
                matchesYear &&
                matchesLgu &&
                matchesBarangay &&
                matchesParticipant &&
                matchesSearch
            );
        });
    }, [records, filters]);

    const stats = useMemo(() => {
        const beneficiaryIds = new Set(
            filteredRecords
                .map((record) => record.beneficiaries_id)
                .filter((id) => id !== null && id !== undefined && id !== "")
                .map(String)
        );

        const municipalities = new Set(
            filteredRecords
                .map((record) => normalize(record.municipality))
                .filter(Boolean)
        );

        const barangays = new Set(
            filteredRecords
                .map((record) => normalize(record.barangay))
                .filter(Boolean)
        );

        const totalGrant = filteredRecords.reduce(
            (total, record) =>
                total + (Number(record.total_grant_received) || 0),
            0
        );

        return {
            totalRecords: filteredRecords.length,
            beneficiaries: beneficiaryIds.size,
            municipalities: municipalities.size,
            barangays: barangays.size,
            totalGrant,
        };
    }, [filteredRecords]);

    const lineChartData = useMemo(() => {
        const individualCounts = Array(12).fill(0);
        const associationCounts = Array(12).fill(0);
        const employmentCounts = Array(12).fill(0);

        filteredRecords.forEach((record) => {
            if (!record.date_provided) return;

            const date = new Date(`${record.date_provided}T00:00:00`);

            if (Number.isNaN(date.getTime())) return;

            const monthIndex = date.getMonth();
            const category = getParticipantCategory(record);

            if (category === "Association") {
                associationCounts[monthIndex] += 1;
            } else if (category === "Individual") {
                individualCounts[monthIndex] += 1;
            } else if (category === "Employment Facilitation") {
                employmentCounts[monthIndex] += 1;
            }
        });

        return {
            labels: MONTHS,
            datasets: [
                {
                    label: "Individual",
                    data: individualCounts,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
                {
                    label: "Association",
                    data: associationCounts,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.04)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
                {
                    label: "Employment Facilitation",
                    data: employmentCounts,
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.04)",
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
            ],
        };
    }, [filteredRecords]);

    const pieChartData = useMemo(() => {
        const counts = {};

        filteredRecords.forEach((record) => {
            const category = getParticipantCategory(record);
            counts[category] = (counts[category] || 0) + 1;
        });

        const labels = Object.keys(counts);

        return {
            labels: labels.length ? labels : ["No records"],
            datasets: [
                {
                    data: labels.length ? labels.map((label) => counts[label]) : [1],
                    backgroundColor: [
                        "#10b981",
                        "#3b82f6",
                        "#f59e0b",
                        "#8b5cf6",
                        "#64748b",
                    ],
                    hoverOffset: 6,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                },
            ],
        };
    }, [filteredRecords]);

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                align: "end",
                labels: {
                    boxWidth: 8,
                    usePointStyle: true,
                    font: { size: 11, family: "Inter, sans-serif" },
                    color: "#64748b",
                },
            },
            tooltip: {
                backgroundColor: "#0f172a",
                titleFont: { size: 12 },
                bodyFont: { size: 11 },
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, color: "#94a3b8" },
            },
            y: {
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                ticks: {
                    precision: 0,
                    font: { size: 11 },
                    color: "#94a3b8",
                },
            },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    font: { size: 11, family: "Inter, sans-serif" },
                    color: "#64748b",
                    padding: 15,
                },
            },
        },
        cutout: "70%",
    };

    const exportReport = () => {
        const headers = [
            "Monitoring ID",
            "Beneficiary ID",
            "Participant",
            "Project",
            "LGU",
            "Municipality",
            "Barangay",
            "District",
            "Year",
            "Track",
            "Modality",
            "Enterprise Type",
            "Grant Received",
            "Enterprise Status",
            "Evaluation Date",
        ];

        const escapeCsv = (value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
        };

        const rows = filteredRecords.map((record) => [
            record.id,
            record.beneficiaries_id,
            record.participant,
            record.name_of_project,
            record.lgu,
            record.municipality,
            record.barangay,
            record.district,
            record.year,
            record.track,
            record.modality,
            record.type_of_enterprise,
            record.total_grant_received,
            record.status,
            record.date_provided,
        ]);

        const csv = [
            headers.map(escapeCsv).join(","),
            ...rows.map((row) => row.map(escapeCsv).join(",")),
        ].join("\r\n");

        const blob = new Blob(["\uFEFF" + csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `SLP-Dashboard-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const displayStatus = (status) => {
        const value = String(status || "Not Assessed").trim();
        const normalized = normalize(value);

        let classes = "bg-slate-100 text-slate-600";

        if (normalized.includes("mainstream")) {
            classes = "bg-emerald-50 text-emerald-700";
        } else if (normalized.includes("rehabilitation")) {
            classes = "bg-amber-50 text-amber-700";
        } else if (normalized.includes("closure") || normalized.includes("closed")) {
            classes = "bg-rose-50 text-rose-700";
        } else if (normalized.includes("active")) {
            classes = "bg-blue-50 text-blue-700";
        }

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes}`}>
                {value}
            </span>
        );
    };

    return (
        <Layout>
            <Head title="SLP Analytics Dashboard" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span>Admin</span>
                    <FaChevronRight className="text-[10px]" />
                    <span>Analytics</span>
                    <FaChevronRight className="text-[10px]" />
                    <span className="text-emerald-600 font-semibold">
                        SLP Overview
                    </span>
                </nav>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            SLP Analytics Dashboard
                        </h1>

                        <p className="text-xs text-slate-500 mt-1">
                            Monitoring records, beneficiary coverage, grants, and enterprise status.
                        </p>

                        {isLguUser && (
                            <div className="inline-flex items-center gap-2 mt-3 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <FaBuilding />
                                LGU access: {assignedLgu || "Not assigned"}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={exportReport}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl shadow-sm transition shrink-0"
                    >
                        <FaDownload className="text-xs text-slate-400" />
                        <span>Export Filtered Report</span>
                    </button>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Monitoring Records"
                        value={formatNumber(stats.totalRecords)}
                        badge="Filtered records"
                        icon={FaProjectDiagram}
                    />

                    <KpiCard
                        title="Beneficiaries"
                        value={formatNumber(stats.beneficiaries)}
                        badge="Unique beneficiary IDs"
                        icon={FaUsers}
                    />

                    <KpiCard
                        title="Municipalities Covered"
                        value={formatNumber(stats.municipalities)}
                        badge="Based on current filters"
                        icon={FaBuilding}
                    />

                    <KpiCard
                        title="Barangays Covered"
                        value={formatNumber(stats.barangays)}
                        badge="Based on current filters"
                        icon={FaMapMarkerAlt}
                    />
                </div>

                {/* Grant summary */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium text-slate-500">
                            Total Grant Received
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 mt-1">
                            {formatCurrency(stats.totalGrant)}
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Sum of grant values in the filtered monitoring records.
                        </p>
                    </div>

                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <FaHandHoldingHeart className="text-emerald-600 text-lg" />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <FaFilter className="text-emerald-600" />
                            <span>Monitoring Record Filters</span>
                        </div>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="text-[11px] font-medium text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition"
                        >
                            <FaSync className="text-[10px]" />
                            Reset Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Year */}
                        <div className="relative">
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                            >
                                <option value="all">All Evaluation Years</option>
                                {(filterOptions.years ?? []).map((year) => (
                                    <option key={year} value={String(year)}>
                                        Year: {year}
                                    </option>
                                ))}
                            </select>
                            <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* LGU */}
                        <div className="relative">
                            <select
                                name="lgu"
                                value={filters.lgu}
                                onChange={handleFilterChange}
                                disabled={isLguUser}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {!isLguUser && (
                                    <option value="all">All LGUs</option>
                                )}
                                {lguOptions.map((lgu) => (
                                    <option key={lgu} value={lgu}>
                                        {lgu}
                                    </option>
                                ))}
                            </select>
                            <FaBuilding className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Barangay */}
                        <div className="relative">
                            <select
                                name="barangay"
                                value={filters.barangay}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                            >
                                <option value="all">All Barangays</option>
                                {availableBarangays.map((barangay) => (
                                    <option key={barangay} value={barangay}>
                                        {barangay}
                                    </option>
                                ))}
                            </select>
                            <FaMapMarkerAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Participant / enterprise category */}
                        <div className="relative">
                            <select
                                name="participant"
                                value={filters.participant}
                                onChange={handleFilterChange}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                            >
                                <option value="all">All Categories</option>
                                {[...new Set(
                                    records
                                        .map(getParticipantCategory)
                                        .filter(Boolean)
                                )].sort().map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <FaUsers className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search records..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                        Showing {formatNumber(filteredRecords.length)} of{" "}
                        {formatNumber(records.length)} available monitoring records.
                    </p>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <FaChartLine className="text-emerald-600" />
                                    Monitoring Evaluation Trends
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Records grouped by evaluation month and category.
                                </p>
                            </div>

                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                {filters.year === "all" ? "All Years" : `Year ${filters.year}`}
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>

                        {!filteredRecords.some((record) => record.date_provided) && (
                            <p className="text-center text-[11px] text-slate-400 mt-2">
                                No evaluation dates are available for the selected records.
                            </p>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <FaHandHoldingHeart className="text-emerald-600" />
                                Category Distribution
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Number of monitoring records by category.
                            </p>
                        </div>

                        <div className="h-64 w-full my-4 flex items-center justify-center">
                            <Doughnut data={pieChartData} options={pieChartOptions} />
                        </div>

                        <p className="text-center text-xs text-slate-500">
                            {formatNumber(filteredRecords.length)} records included
                        </p>
                    </div>
                </div>

                {/* Monitoring records table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">
                                SLP Monitoring Records
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Actual monitoring and evaluation data from the database.
                            </p>
                        </div>

                        <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            {formatNumber(filteredRecords.length)} records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">Project / Participant</th>
                                    <th className="px-5 py-3.5">LGU / Location</th>
                                    <th className="px-5 py-3.5">Track / Modality</th>
                                    <th className="px-5 py-3.5">Beneficiary / Year</th>
                                    <th className="px-5 py-3.5">Grant Received</th>
                                    <th className="px-5 py-3.5">Enterprise Status</th>
                                    <th className="px-5 py-3.5">Evaluation Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredRecords.length > 0 ? (
                                    filteredRecords.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-slate-50/60 transition"
                                        >
                                            <td className="px-5 py-3.5 min-w-[220px]">
                                                <div className="font-semibold text-slate-800">
                                                    {record.name_of_project || "Unnamed Project"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {record.participant || "Participant not specified"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    Record #{record.id}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="font-semibold text-slate-700">
                                                    {record.lgu || "—"}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {record.municipality || "Municipality not specified"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {record.barangay || "Barangay not specified"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="text-slate-700">
                                                    {record.track || "—"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {record.modality || record.type_of_enterprise || "—"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="text-slate-700">
                                                    {record.beneficiaries_id
                                                        ? `ID: ${record.beneficiaries_id}`
                                                        : "—"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    Year: {record.year || "—"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-800">
                                                {formatCurrency(record.total_grant_received)}
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {displayStatus(record.status)}
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                                                {record.date_provided || "—"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center">
                                                    <FaSearch className="text-slate-300" />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-600">
                                                    No monitoring records found
                                                </p>
                                                <p className="text-xs text-slate-400 max-w-md">
                                                    Try changing the selected filters or search keyword.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={resetFilters}
                                                    className="mt-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                                                >
                                                    Reset filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function KpiCard({ title, value, badge, icon: Icon }) {
    return (
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight break-words">
                    {value}
                </h3>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {badge}
                </span>
            </div>

            <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-base">
                <Icon className="text-emerald-600" />
            </div>
        </div>
    );
}
