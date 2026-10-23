import { useEffect, useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Layout from "../Layouts/Layout";

import {
    FaArrowLeft,
    FaBuilding,
    FaCalendarAlt,
    FaChartBar,
    FaChartLine,
    FaCheckCircle,
    FaClipboardCheck,
    FaExclamationCircle,
    FaFileAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaSave,
    FaSearch,
    FaUniversity,
    FaUsers,
    FaWallet,
} from "react-icons/fa";

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const number = (value) =>
    new Intl.NumberFormat("en-PH").format(Number(value || 0));

const getParticipant = (item = {}) =>
    item.name_of_slpa_slp_participant ??
    item.name_of_slp_participant ??
    item.participant_name ??
    item.name ??
    "Unnamed participant";

const getMunicipality = (item = {}) =>
    item.city_municipality ?? item.municipality ?? "—";

const getEnterpriseType = (item = {}) =>
    String(item.type_of_enterprise ?? "").trim();

const isAssociation = (item = {}) =>
    getEnterpriseType(item).toUpperCase().includes("ASSOCIATION");

const getBeneficiaryId = (item = {}) =>
    item.beneficiaries_id ?? item.beneficiary_id ?? item.id ?? "";

const getMemberKey = (member = {}) =>
    String(member.member_id ?? member.id ?? "");

const getMemberStatus = (member = {}) =>
    String(member.status ?? "").trim().toLowerCase() === "inactive"
        ? "Inactive"
        : "Active";

const getMemberList = (value) =>
    Array.isArray(value) ? value : value?.data ?? [];

/*
 * Supports roles stored as an array, a JSON string, or a
 * single plain-text role.
 */
const getUserRoles = (roles) => {
    if (Array.isArray(roles)) {
        return roles.map((role) =>
            String(role).trim().toLowerCase()
        );
    }

    if (typeof roles === "string" && roles.trim() !== "") {
        try {
            const parsed = JSON.parse(roles);

            if (Array.isArray(parsed)) {
                return parsed.map((role) =>
                    String(role).trim().toLowerCase()
                );
            }

            if (typeof parsed === "string") {
                return [parsed.trim().toLowerCase()];
            }
        } catch {
            return [roles.trim().toLowerCase()];
        }
    }

    return [];
};

const getEvaluationValues = (evaluation = {}) => ({
    evaluation_year:
        evaluation.evaluation_year ?? new Date().getFullYear(),

    date_provided: evaluation.date_provided ?? "",

    quarter_gross_sales:
        evaluation.quarter_gross_sales ?? "",

    quarter_cost_of_sales:
        evaluation.quarter_cost_of_sales ??
        evaluation.quarterly_cost_of_sales ??
        "",

    quarter_gross_profit:
        evaluation.quarter_gross_profit ?? "",

    operating_expenses:
        evaluation.operating_expenses ?? "",

    total_quarterly_net_income:
        evaluation.total_quarterly_net_income ?? "",

    cash_in_bank:
        evaluation.cash_in_bank ?? "",

    cash_on_hand:
        evaluation.cash_on_hand ?? "",

    total_saving:
        evaluation.total_saving ??
        evaluation.total_savings ??
        "",

    intervention_support:
        evaluation.intervention_support ?? "",

    enterprises_status:
        evaluation.enterprises_status ??
        evaluation.enterprise_status ??
        evaluation.status_assessment ??
        "",

    additional_assessment_fund:
        evaluation.additional_assessment_fund ?? "",

    additional_fund_amount:
        evaluation.additional_fund_amount ?? "",

    evaluation_recommendation:
        evaluation.evaluation_recommendation ?? "",

    remarks:
        evaluation.remarks ?? "",
});

/* =========================================================
   REUSABLE UI COMPONENTS
========================================================= */

function SectionHeading({
    icon: Icon,
    title,
    description,
    action,
}) {
    return (
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="text-lg" />
                </div>

                <div className="min-w-0">
                    <h2 className="font-extrabold text-slate-800">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {action}
        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    color = "emerald",
    note,
}) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        violet: "bg-violet-50 text-violet-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">
                        {label}
                    </p>

                    <p className="mt-3 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        {value}
                    </p>

                    {note && (
                        <p className="mt-2 text-[11px] leading-5 text-slate-400">
                            {note}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        colors[color] || colors.emerald
                    }`}
                >
                    <Icon className="text-lg" />
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    readOnly = false,
    placeholder = "",
    min,
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={name}
                className="mb-2 block text-xs font-bold text-slate-600"
            >
                {label}
                {required && (
                    <span className="ml-1 text-rose-500">*</span>
                )}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                placeholder={placeholder}
                min={min ?? (type === "number" ? "0" : undefined)}
                step={type === "number" ? "0.01" : undefined}
                className={`w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
                    readOnly
                        ? "border-slate-100 bg-slate-50 font-bold text-slate-700"
                        : "border-slate-200 bg-white text-slate-700"
                }`}
            />
        </div>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={name}
                className="mb-2 block text-xs font-bold text-slate-600"
            >
                {label}
                {required && (
                    <span className="ml-1 text-rose-500">*</span>
                )}
            </label>

            <select
                id={name}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            >
                <option value="">Select {label}</option>

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextAreaField({
    label,
    name,
    value,
    onChange,
    rows = 3,
}) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={name}
                className="mb-2 block text-xs font-bold text-slate-600"
            >
                {label}
            </label>

            <textarea
                id={name}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                rows={rows}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
        </div>
    );
}

function StatusBadge({ status }) {
    const active = status === "Active";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ring-inset ${
                active
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-emerald-500" : "bg-amber-500"
                }`}
            />
            {status}
        </span>
    );
}

/* =========================================================
   FINANCIAL GRAPH
========================================================= */

function FinancialBarChart({ evaluation }) {
    const items = [
        {
            label: "Gross Sales",
            value: Number(evaluation.quarter_gross_sales || 0),
            color: "bg-emerald-500",
        },
        {
            label: "Cost of Sales",
            value: Number(evaluation.quarter_cost_of_sales || 0),
            color: "bg-amber-500",
        },
        {
            label: "Gross Profit",
            value: Number(evaluation.quarter_gross_profit || 0),
            color: "bg-blue-500",
        },
        {
            label: "Operating Expenses",
            value: Number(evaluation.operating_expenses || 0),
            color: "bg-violet-500",
        },
        {
            label: "Net Income",
            value: Number(
                evaluation.total_quarterly_net_income || 0
            ),
            color: "bg-teal-500",
        },
    ];

    const maxValue = Math.max(
        ...items.map((entry) => Math.max(entry.value, 0)),
        1
    );

    return (
        <div className="space-y-5">
            {items.map((entry) => (
                <div key={entry.label}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                            {entry.label}
                        </span>

                        <span className="text-xs font-extrabold text-slate-800">
                            {money(entry.value)}
                        </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${entry.color}`}
                            style={{
                                width: `${
                                    (Math.max(entry.value, 0) /
                                        maxValue) *
                                    100
                                }%`,
                            }}
                        />
                    </div>
                </div>
            ))}

            <p className="border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-400">
                Values come from the selected evaluation. Negative
                values remain visible in the figures but do not
                produce positive bar widths.
            </p>
        </div>
    );
}

/* =========================================================
   EVALUATION DETAILS
========================================================= */

function EvaluationDetails({ evaluation }) {
    const details = [
        {
            title: "Intervention Support",
            value: evaluation.intervention_support,
            fallback: "No intervention support recorded.",
            icon: FaUniversity,
            style: "border-emerald-100 bg-emerald-50/60",
            iconStyle: "bg-emerald-100 text-emerald-700",
            titleStyle: "text-emerald-950",
            textStyle: "text-emerald-900",
        },
        {
            title: "Evaluation Recommendation",
            value: evaluation.evaluation_recommendation,
            fallback: "No evaluation recommendation recorded.",
            icon: FaFileAlt,
            style: "border-blue-100 bg-blue-50/60",
            iconStyle: "bg-blue-100 text-blue-700",
            titleStyle: "text-blue-950",
            textStyle: "text-blue-900",
        },
        {
            title: "Remarks",
            value: evaluation.remarks,
            fallback: "No remarks recorded.",
            icon: FaExclamationCircle,
            style: "border-amber-100 bg-amber-50/60",
            iconStyle: "bg-amber-100 text-amber-700",
            titleStyle: "text-amber-950",
            textStyle: "text-amber-900",
        },
    ];

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
                icon={FaClipboardCheck}
                title="Evaluation Details"
                description="Intervention support, evaluation recommendation, and remarks recorded during the latest evaluation."
            />

            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
                {details.map((detail) => {
                    const Icon = detail.icon;

                    return (
                        <div
                            key={detail.title}
                            className={`rounded-2xl border p-5 ${detail.style}`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${detail.iconStyle}`}
                                >
                                    <Icon />
                                </div>

                                <h3
                                    className={`text-sm font-extrabold ${detail.titleStyle}`}
                                >
                                    {detail.title}
                                </h3>
                            </div>

                            <p
                                className={`mt-4 whitespace-pre-wrap break-words text-sm leading-6 ${detail.textStyle}`}
                            >
                                {detail.value || detail.fallback}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                <p className="text-xs text-slate-500">
                    Evaluation date:{" "}
                    <span className="font-bold text-slate-700">
                        {evaluation.date_provided || "Not provided"}
                    </span>

                    <span className="mx-2">•</span>

                    Evaluation year:{" "}
                    <span className="font-bold text-slate-700">
                        {evaluation.evaluation_year || "—"}
                    </span>
                </p>
            </div>
        </section>
    );
}

/* =========================================================
   ASSOCIATION MEMBER DIRECTORY
========================================================= */

function MembersPanel({ members, beneficiary }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return members.filter((member) => {
            const text = [
                member.member_id,
                member.member_name,
                member.role,
                member.gender,
                member.contact_number,
                member.municipality,
                member.city_municipality,
                member.barangay,
                member.purok,
                member.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                (!query || text.includes(query)) &&
                (statusFilter === "All" ||
                    getMemberStatus(member) === statusFilter)
            );
        });
    }, [members, search, statusFilter]);

    const activeCount = members.filter(
        (member) => getMemberStatus(member) === "Active"
    ).length;

    const inactiveCount = members.length - activeCount;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
                icon={FaUsers}
                title="Association Member Directory"
                description={`Registered members under ${getParticipant(beneficiary)}.`}
                action={
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            {number(activeCount)} active
                        </span>

                        <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                            {number(inactiveCount)} inactive
                        </span>
                    </div>
                }
            />

            <div className="space-y-4 p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_210px]">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search member, role, contact or barangay..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All member statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                {filteredMembers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
                        <FaUsers className="mx-auto text-3xl text-slate-300" />

                        <h3 className="mt-4 font-extrabold text-slate-800">
                            {members.length === 0
                                ? "No members registered yet"
                                : "No matching members"}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Change the search or status filter to find
                            member records.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    {[
                                        "Member",
                                        "Role",
                                        "Gender",
                                        "Birthdate",
                                        "Contact Number",
                                        "Municipality",
                                        "Barangay / Purok",
                                        "Status",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredMembers.map((member, index) => (
                                    <tr
                                        key={getMemberKey(member) || index}
                                        className="transition hover:bg-emerald-50/40"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-bold text-slate-800">
                                                {member.member_name ||
                                                    "Unnamed member"}
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-400">
                                                {member.member_id ||
                                                    "No member ID"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {member.role || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {member.gender || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {member.birthdate
                                                ? String(
                                                      member.birthdate
                                                  ).slice(0, 10)
                                                : "—"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {member.contact_number || "—"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {member.city_municipality ??
                                                member.municipality ??
                                                "—"}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            <p>{member.barangay || "—"}</p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {member.purok || "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <StatusBadge
                                                status={getMemberStatus(member)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p className="text-xs text-slate-400">
                    Showing {number(filteredMembers.length)} of{" "}
                    {number(members.length)} member records.
                </p>
            </div>
        </section>
    );
}

/* =========================================================
   MEMBER STATUS ASSESSMENT
========================================================= */

function MemberStatusAssessment({
    members,
    memberStatuses,
    onStatusChange,
}) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const activeCount = members.filter((member) => {
        const id = getMemberKey(member);

        return (
            (memberStatuses[id] ?? getMemberStatus(member)) === "Active"
        );
    }).length;

    const inactiveCount = members.length - activeCount;

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return members.filter((member) => {
            const id = getMemberKey(member);
            const status =
                memberStatuses[id] ?? getMemberStatus(member);

            const text = [
                member.member_id,
                member.member_name,
                member.role,
                member.contact_number,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                (!query || text.includes(query)) &&
                (statusFilter === "All" || status === statusFilter)
            );
        });
    }, [members, memberStatuses, search, statusFilter]);

    return (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <SectionHeading
                icon={FaUsers}
                title="Association Member Assessment"
                description="Change each member's status to Active or Inactive. Changes are submitted with this evaluation."
                action={
                    <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                        {number(members.length)} members
                    </span>
                }
            />

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                <MetricCard
                    label="Total Members"
                    value={number(members.length)}
                    icon={FaUsers}
                    color="blue"
                />

                <MetricCard
                    label="Assessed Active"
                    value={number(activeCount)}
                    icon={FaCheckCircle}
                    color="emerald"
                />

                <MetricCard
                    label="Assessed Inactive"
                    value={number(inactiveCount)}
                    icon={FaExclamationCircle}
                    color="amber"
                />
            </div>

            <div className="space-y-4 px-5 pb-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_210px]">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search members to assess..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                        <option value="All">All assessed statuses</option>
                        <option value="Active">Assessed Active</option>
                        <option value="Inactive">Assessed Inactive</option>
                    </select>
                </div>

                {members.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                        <FaUsers className="mx-auto text-3xl text-slate-300" />

                        <p className="mt-3 font-bold text-slate-700">
                            No association members found
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Register or link members to this beneficiary
                            before evaluating their status.
                        </p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                        No members match your search or status filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full min-w-[680px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    {[
                                        "Member",
                                        "Role",
                                        "Current Status",
                                        "Evaluation Status",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-4 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredMembers.map((member, index) => {
                                    const id = getMemberKey(member);
                                    const currentStatus =
                                        getMemberStatus(member);
                                    const assessedStatus =
                                        memberStatuses[id] ?? currentStatus;

                                    return (
                                        <tr
                                            key={id || index}
                                            className="transition hover:bg-emerald-50/40"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {member.member_name ||
                                                        "Unnamed member"}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {member.member_id ||
                                                        "No member ID"}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-slate-600">
                                                {member.role || "—"}
                                            </td>

                                            <td className="px-4 py-4">
                                                <StatusBadge
                                                    status={currentStatus}
                                                />
                                            </td>

                                            <td className="px-4 py-4">
                                                <select
                                                    value={assessedStatus}
                                                    onChange={(event) =>
                                                        onStatusChange(
                                                            id,
                                                            event.target.value
                                                        )
                                                    }
                                                    aria-label={`Evaluation status for ${member.member_name || "member"}`}
                                                    className={`w-full rounded-xl border px-3 py-3 text-sm font-bold outline-none transition focus:ring-4 focus:ring-emerald-500/10 ${
                                                        assessedStatus ===
                                                        "Active"
                                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                            : "border-amber-200 bg-amber-50 text-amber-800"
                                                    }`}
                                                >
                                                    <option value="Active">
                                                        Active
                                                    </option>

                                                    <option value="Inactive">
                                                        Inactive
                                                    </option>
                                                </select>

                                                {assessedStatus !==
                                                    currentStatus && (
                                                    <p className="mt-2 text-[10px] font-bold text-blue-600">
                                                        Status changed — save
                                                        evaluation to apply
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs leading-5 text-blue-800">
                        <strong>Reminder:</strong> Current Status shows
                        the saved database value. Evaluation Status shows
                        your selection. The actual member status changes
                        only after the evaluation is successfully saved.
                    </p>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function SLPGraph({
    beneficiary = null,
    monitoringRecord = null,
    members: initialMembers = [],
    evaluation = null,
    evaluations = [],
    evaluationStoreUrl = null,
    flash = {},
    errors = {},
}) {
    /* -----------------------------------------------------
       AUTHENTICATED USER AND ROLE PERMISSIONS
    ----------------------------------------------------- */

    const { auth = {} } = usePage().props;
    const user = auth?.user ?? {};

    const userRoles = getUserRoles(user.roles);
    const isLguUser = userRoles.includes("lgu");

    /*
     * LGU users may view the dashboard but cannot evaluate.
     * The Laravel controller must enforce this restriction too.
     */
    const canEvaluate = !isLguUser;

    /* -----------------------------------------------------
       BENEFICIARY INFORMATION
    ----------------------------------------------------- */

    const item = beneficiary || {};
    const beneficiaryId = getBeneficiaryId(item);
    const association = isAssociation(item);

    /*
     * Use the saved enterprise status, not the unsaved form value.
     * Selecting Closure in the form should not hide the form before
     * the evaluation has been submitted.
     */
    const enterpriseStatus =
        item.enterprises_status ??
        item.enterprise_status ??
        item.status_assessment ??
        evaluation?.enterprises_status ??
        evaluation?.enterprise_status ??
        evaluation?.status_assessment ??
        "Not assessed";

    const isClosed =
        String(enterpriseStatus).trim().toLowerCase() === "closure";

    /* -----------------------------------------------------
       STATE
    ----------------------------------------------------- */

    const [activeTab, setActiveTab] = useState("graph");

    const [members, setMembers] = useState(() =>
        getMemberList(initialMembers)
    );

    const [memberStatuses, setMemberStatuses] = useState({});

    const [form, setForm] = useState(() =>
        getEvaluationValues(evaluation || {})
    );

    const [processing, setProcessing] = useState(false);
    const [pageError, setPageError] = useState("");

    const [
        memberAssessmentResetKey,
        setMemberAssessmentResetKey,
    ] = useState(0);

    /* -----------------------------------------------------
       SYNCHRONIZE INCOMING MEMBER RECORDS
    ----------------------------------------------------- */

    useEffect(() => {
        const list = getMemberList(initialMembers);

        setMembers(list);

        setMemberStatuses(
            Object.fromEntries(
                list
                    .map((member) => [
                        getMemberKey(member),
                        getMemberStatus(member),
                    ])
                    .filter(([id]) => id)
            )
        );
    }, [initialMembers]);

    /* -----------------------------------------------------
       PROTECT RESTRICTED EVALUATION TAB
    ----------------------------------------------------- */

    useEffect(() => {
        if (
            (!canEvaluate || isClosed) &&
            activeTab === "evaluate"
        ) {
            setActiveTab("graph");
        }
    }, [canEvaluate, isClosed, activeTab]);

    /* -----------------------------------------------------
       FORM CHANGES AND AUTOMATIC CALCULATIONS
    ----------------------------------------------------- */

    const setField = (event) => {
        const { name, value } = event.target;

        setForm((current) => {
            const next = {
                ...current,
                [name]: value,
            };

            /*
             * Gross Profit = Gross Sales - Cost of Sales
             * Net Income = Gross Profit - Operating Expenses
             */
            if (
                name === "quarter_gross_sales" ||
                name === "quarter_cost_of_sales"
            ) {
                const sales = Number(
                    name === "quarter_gross_sales"
                        ? value || 0
                        : next.quarter_gross_sales || 0
                );

                const cost = Number(
                    name === "quarter_cost_of_sales"
                        ? value || 0
                        : next.quarter_cost_of_sales || 0
                );

                next.quarter_gross_profit = (
                    sales - cost
                ).toFixed(2);

                next.total_quarterly_net_income = (
                    sales -
                    cost -
                    Number(next.operating_expenses || 0)
                ).toFixed(2);
            }

            if (name === "operating_expenses") {
                next.total_quarterly_net_income = (
                    Number(next.quarter_gross_profit || 0) -
                    Number(value || 0)
                ).toFixed(2);
            }

            /*
             * Total Savings = Cash in Bank + Cash on Hand
             */
            if (
                name === "cash_in_bank" ||
                name === "cash_on_hand"
            ) {
                const bank = Number(
                    name === "cash_in_bank"
                        ? value || 0
                        : next.cash_in_bank || 0
                );

                const hand = Number(
                    name === "cash_on_hand"
                        ? value || 0
                        : next.cash_on_hand || 0
                );

                next.total_saving = (bank + hand).toFixed(2);
            }

            /*
             * Clear the amount if the user changes the funding
             * selection away from Input Funds.
             */
            if (
                name === "additional_assessment_fund" &&
                value !== "Input Funds"
            ) {
                next.additional_fund_amount = "";
            }

            return next;
        });
    };

    const handleMemberStatusChange = (memberId, status) => {
        if (!memberId) return;

        setMemberStatuses((current) => ({
            ...current,
            [memberId]: status,
        }));
    };

    /* -----------------------------------------------------
       OVERVIEW CALCULATIONS
    ----------------------------------------------------- */

    const currentEvaluation = useMemo(
        () => getEvaluationValues(evaluation || {}),
        [evaluation]
    );

    const totalMembers = members.length;

    const activeMembers = members.filter(
        (member) => getMemberStatus(member) === "Active"
    ).length;

    const inactiveMembers = totalMembers - activeMembers;

    const assessedActiveMembers = members.filter((member) => {
        const id = getMemberKey(member);

        return (
            (memberStatuses[id] ?? getMemberStatus(member)) === "Active"
        );
    }).length;

    const assessedInactiveMembers =
        totalMembers - assessedActiveMembers;

    /* -----------------------------------------------------
       SUBMIT EVALUATION AND MEMBER STATUS UPDATES
    ----------------------------------------------------- */

    const handleEvaluationSubmit = (event) => {
        event.preventDefault();

        if (processing) return;

        setPageError("");

        /*
         * Client-side role protection.
         * Server-side authorization is still required.
         */
        if (!canEvaluate) {
            setPageError(
                "Your LGU account does not have permission to evaluate this beneficiary."
            );

            setActiveTab("graph");
            return;
        }

        if (isClosed) {
            setPageError(
                "Evaluation is unavailable because this enterprise is marked as Closure."
            );

            setActiveTab("graph");
            return;
        }

        if (!beneficiaryId) {
            setPageError("The beneficiary ID is missing.");
            return;
        }

        if (!evaluationStoreUrl) {
            setPageError(
                "The evaluation save URL is not configured. Pass evaluationStoreUrl from your Laravel controller."
            );
            return;
        }

        if (
            form.additional_assessment_fund === "Input Funds" &&
            (
                form.additional_fund_amount === "" ||
                !Number.isFinite(
                    Number(form.additional_fund_amount)
                ) ||
                Number(form.additional_fund_amount) < 0
            )
        ) {
            setPageError(
                "Enter a valid additional fund amount before saving."
            );
            return;
        }

        if (
            association &&
            members.some((member) => !getMemberKey(member))
        ) {
            setPageError(
                "One or more members are missing a member ID. Refresh the member records before saving."
            );
            return;
        }

        const payload = {
            ...form,

            beneficiaries_id: beneficiaryId,

            quarter_gross_sales: Number(
                form.quarter_gross_sales || 0
            ),

            quarter_cost_of_sales: Number(
                form.quarter_cost_of_sales || 0
            ),

            quarter_gross_profit: Number(
                form.quarter_gross_profit || 0
            ),

            operating_expenses: Number(
                form.operating_expenses || 0
            ),

            total_quarterly_net_income: Number(
                form.total_quarterly_net_income || 0
            ),

            cash_in_bank: Number(form.cash_in_bank || 0),

            cash_on_hand: Number(form.cash_on_hand || 0),

            total_saving: Number(form.total_saving || 0),

            intervention_support:
                form.intervention_support || "",

            evaluation_recommendation:
                form.evaluation_recommendation || "",

            remarks: form.remarks || "",

            additional_fund_amount:
                form.additional_assessment_fund === "Input Funds"
                    ? Number(form.additional_fund_amount)
                    : null,

            member_statuses: association
                ? members.map((member) => {
                      const id = getMemberKey(member);

                      return {
                          member_id:
                              member.member_id ?? member.id,
                          status:
                              memberStatuses[id] ??
                              getMemberStatus(member),
                      };
                  })
                : [],
        };

        setProcessing(true);

        router.post(evaluationStoreUrl, payload, {
            preserveScroll: true,

            onSuccess: () => {
                setPageError("");

                /*
                 * Reset the form after a successful save.
                 * The evaluation year returns to the current year.
                 */
                setForm(getEvaluationValues({}));

                if (association) {
                    const savedStatuses = Object.fromEntries(
                        payload.member_statuses.map((row) => [
                            String(row.member_id),
                            row.status,
                        ])
                    );

                    setMemberStatuses(savedStatuses);

                    setMembers((currentMembers) =>
                        currentMembers.map((member) => {
                            const id = getMemberKey(member);
                            const savedStatus = savedStatuses[id];

                            if (!savedStatus) return member;

                            return {
                                ...member,
                                status: savedStatus,
                            };
                        })
                    );

                    setMemberAssessmentResetKey(
                        (current) => current + 1
                    );
                }
            },

            onError: (serverErrors) => {
                setPageError(
                    "The evaluation could not be saved. Review the validation messages and try again."
                );

                console.error(
                    "SLP evaluation validation errors:",
                    serverErrors
                );
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    /* -----------------------------------------------------
       NAVIGATION TABS
    ----------------------------------------------------- */

    const tabs = [
        {
            id: "graph",
            label: "Graph & Overview",
            icon: FaChartLine,
        },

        ...(association
            ? [
                  {
                      id: "members",
                      label: "Members",
                      icon: FaUsers,
                  },
              ]
            : []),

        ...(!isClosed && canEvaluate
            ? [
                  {
                      id: "evaluate",
                      label: "Evaluate",
                      icon: FaClipboardCheck,
                  },
              ]
            : []),
    ];

    /* =====================================================
       RENDER PAGE
    ===================================================== */

    return (
        <Layout>
            <Head title={`SLP Monitoring - ${getParticipant(item)}`} />

            <div className="min-h-screen bg-slate-50/80 px-3 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-[1600px] space-y-6 pb-10">
                    {/* =========================================
                        BREADCRUMB
                    ========================================= */}

                    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <span>Admin</span>
                        <span>/</span>
                        <span>SLP</span>
                        <span>/</span>

                        {!isLguUser && (
                            <>
                                <Link
                                    href="/slp-monitoring"
                                    className="transition hover:text-emerald-700"
                                >
                                    Monitoring
                                </Link>
                                <span>/</span>
                            </>
                        )}

                        <span className="text-emerald-700">
                            Beneficiary Details
                        </span>
                    </nav>

                    {/* =========================================
                        PAGE NAVIGATION
                    ========================================= */}

                    <div className="flex flex-wrap items-center gap-3">
                        {!isLguUser && (
                            <Link
                                href="/slp-monitoring"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                            >
                                <FaArrowLeft />
                                Back to Monitoring
                            </Link>
                        )}

                        {isLguUser && (
                            <Link
                                href="/summary"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100"
                            >
                                <FaFileAlt />
                                SLP Summary
                            </Link>
                        )}
                    </div>

                    {/* =========================================
                        BENEFICIARY HEADER
                    ========================================= */}

                    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-5 text-white shadow-lg sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[40px] border-white/5" />

                        <div className="pointer-events-none absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

                        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/10">
                                        {association ? (
                                            <FaUsers />
                                        ) : (
                                            <FaBuilding />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                                            Sustainable Livelihood Program
                                        </p>

                                        <h1 className="mt-2 break-words text-2xl font-black sm:text-3xl">
                                            {getParticipant(item)}
                                        </h1>

                                        <p className="mt-2 text-sm text-emerald-100/80">
                                            {item.name_of_project ||
                                                "SLP Beneficiary Monitoring"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {[
                                        `ID: ${beneficiaryId || "—"}`,
                                        item.track || "Track not set",
                                        item.modality || "Modality not set",
                                        getEnterpriseType(item) ||
                                            "Enterprise type not set",
                                    ].map((label) => (
                                        <span
                                            key={label}
                                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                    <FaCalendarAlt className="text-emerald-200" />

                                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                                        Year Implemented
                                    </p>

                                    <p className="mt-1 text-xl font-black">
                                        {item.year_implemented ??
                                            item.evaluation_year ??
                                            "—"}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                    <FaMapMarkerAlt className="text-emerald-200" />

                                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                                        Municipality
                                    </p>

                                    <p className="mt-1 break-words text-sm font-extrabold">
                                        {getMunicipality(item)}
                                    </p>
                                </div>

                                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:col-span-1">
                                    <FaBuilding className="text-emerald-200" />

                                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                                        Enterprise Status
                                    </p>

                                    <p className="mt-1 text-sm font-extrabold">
                                        {enterpriseStatus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =========================================
                        TABS
                    ========================================= */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                        <div
                            className={`grid grid-cols-1 gap-2 ${
                                tabs.length === 3
                                    ? "sm:grid-cols-3"
                                    : tabs.length === 2
                                      ? "sm:grid-cols-2"
                                      : "sm:grid-cols-1"
                            }`}
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const selected = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        aria-pressed={selected}
                                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-extrabold transition ${
                                            selected
                                                ? "bg-emerald-700 text-white shadow-sm"
                                                : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"
                                        }`}
                                    >
                                        <Icon />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* =========================================
                        GRAPH & OVERVIEW
                    ========================================= */}

                    {activeTab === "graph" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCard
                                    label="Quarterly Gross Sales"
                                    value={money(
                                        currentEvaluation.quarter_gross_sales
                                    )}
                                    icon={FaMoneyBillWave}
                                    color="emerald"
                                />

                                <MetricCard
                                    label="Quarterly Gross Profit"
                                    value={money(
                                        currentEvaluation.quarter_gross_profit
                                    )}
                                    icon={FaChartLine}
                                    color="blue"
                                />

                                <MetricCard
                                    label="Quarterly Net Income"
                                    value={money(
                                        currentEvaluation.total_quarterly_net_income
                                    )}
                                    icon={FaWallet}
                                    color="violet"
                                />

                                <MetricCard
                                    label="Total Savings"
                                    value={money(
                                        currentEvaluation.total_saving
                                    )}
                                    icon={FaUniversity}
                                    color="amber"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeading
                                        icon={FaChartBar}
                                        title="Quarterly Financial Performance"
                                        description="Compare sales, costs, profit, expenses, and net income."
                                    />

                                    <div className="p-5 sm:p-6">
                                        <FinancialBarChart
                                            evaluation={currentEvaluation}
                                        />
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeading
                                        icon={FaFileAlt}
                                        title="Financial Breakdown"
                                        description="Financial details from the selected evaluation."
                                    />

                                    <div className="divide-y divide-slate-100 px-5">
                                        {[
                                            [
                                                "Quarterly Cost of Sales",
                                                currentEvaluation.quarter_cost_of_sales,
                                            ],
                                            [
                                                "Operating Expenses",
                                                currentEvaluation.operating_expenses,
                                            ],
                                            [
                                                "Cash in Bank",
                                                currentEvaluation.cash_in_bank,
                                            ],
                                            [
                                                "Cash on Hand",
                                                currentEvaluation.cash_on_hand,
                                            ],
                                            [
                                                "Total Savings",
                                                currentEvaluation.total_saving,
                                            ],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between gap-4 py-4"
                                            >
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {label}
                                                </span>

                                                <span className="text-sm font-extrabold text-slate-800">
                                                    {money(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="m-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                            Evaluation Date
                                        </p>

                                        <p className="mt-2 text-sm font-bold text-blue-950">
                                            {currentEvaluation.date_provided ||
                                                "No evaluation date"}
                                        </p>

                                        <p className="mt-1 text-xs text-blue-800/70">
                                            Evaluation Year:{" "}
                                            {currentEvaluation.evaluation_year ||
                                                "—"}
                                        </p>
                                    </div>
                                </section>
                            </div>

                            <EvaluationDetails
                                evaluation={currentEvaluation}
                            />

                            {/* ASSOCIATION MEMBER SUMMARY */}

                            {association && (
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeading
                                        icon={FaUsers}
                                        title="Association Member Summary"
                                        description="View saved member statuses and prepare the next evaluation."
                                        action={
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("members")
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
                                            >
                                                <FaUsers />
                                                View Member List
                                            </button>
                                        }
                                    />

                                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                                        <MetricCard
                                            label="Total Members"
                                            value={number(totalMembers)}
                                            icon={FaUsers}
                                            color="blue"
                                        />

                                        <MetricCard
                                            label="Currently Active"
                                            value={number(activeMembers)}
                                            icon={FaCheckCircle}
                                            color="emerald"
                                        />

                                        <MetricCard
                                            label="Currently Inactive"
                                            value={number(inactiveMembers)}
                                            icon={FaExclamationCircle}
                                            color="amber"
                                        />

                                        <MetricCard
                                            label="Assessed Active"
                                            value={number(
                                                assessedActiveMembers
                                            )}
                                            icon={FaClipboardCheck}
                                            color="violet"
                                            note={`${number(
                                                assessedInactiveMembers
                                            )} assessed inactive`}
                                        />
                                    </div>

                                    <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                                        {!canEvaluate ? (
                                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                <p className="text-sm font-extrabold text-slate-700">
                                                    Evaluation Access Restricted
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                    Your LGU account can view
                                                    association members and
                                                    beneficiary details, but
                                                    evaluation actions are
                                                    unavailable for your role.
                                                </p>
                                            </div>
                                        ) : isClosed ? (
                                            <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center">
                                                <FaExclamationCircle className="shrink-0 text-rose-600" />

                                                <div>
                                                    <p className="text-sm font-extrabold text-rose-800">
                                                        Evaluation Unavailable
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-rose-700">
                                                        This enterprise is
                                                        marked as Closure.
                                                        The evaluation form
                                                        is unavailable for
                                                        this beneficiary.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveTab("evaluate")
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800"
                                            >
                                                <FaClipboardCheck />
                                                Evaluate Association & Members
                                            </button>
                                        )}
                                    </div>
                                </section>
                            )}

                            {flash?.success && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                                    {flash.success}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =========================================
                        MEMBER DIRECTORY
                    ========================================= */}

                    {activeTab === "members" && association && (
                        <MembersPanel
                            members={members}
                            beneficiary={item}
                        />
                    )}

                    {/* =========================================
                        EVALUATION FORM
                        Hidden for LGU users and Closure records.
                    ========================================= */}

                    {activeTab === "evaluate" &&
                        canEvaluate &&
                        !isClosed && (
                            <form
                                onSubmit={handleEvaluationSubmit}
                                className="space-y-6"
                            >
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <SectionHeading
                                        icon={FaClipboardCheck}
                                        title="Quarterly Evaluation"
                                        description="Record financial performance, savings, enterprise status, intervention support, recommendations, and remarks."
                                    />

                                    <div className="space-y-8 p-5 sm:p-6">
                                        {pageError && (
                                            <div
                                                role="alert"
                                                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                                            >
                                                {pageError}
                                            </div>
                                        )}

                                        {flash?.success && (
                                            <div
                                                role="status"
                                                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <FaCheckCircle className="mt-0.5 shrink-0" />
                                                    <span>{flash.success}</span>
                                                </div>
                                            </div>
                                        )}

                                        {Object.keys(errors || {}).length > 0 && (
                                            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                                                <p className="text-sm font-bold text-rose-800">
                                                    Please review the following:
                                                </p>

                                                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-rose-700">
                                                    {Object.entries(errors).map(
                                                        ([key, message]) => (
                                                            <li key={key}>
                                                                {Array.isArray(message)
                                                                    ? message.join(", ")
                                                                    : message}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {/* 01. EVALUATION INFORMATION */}

                                        <div>
                                            <h3 className="mb-4 text-sm font-extrabold text-slate-800">
                                                01. Evaluation Information
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <Field
                                                    label="Evaluation Year"
                                                    name="evaluation_year"
                                                    type="number"
                                                    value={form.evaluation_year}
                                                    onChange={setField}
                                                    required
                                                    min="2000"
                                                />

                                                <Field
                                                    label="Date Provided"
                                                    name="date_provided"
                                                    type="date"
                                                    value={form.date_provided}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Beneficiary ID"
                                                    name="beneficiaries_id"
                                                    value={beneficiaryId}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* 02. FINANCIAL DATA */}

                                        <div className="border-t border-slate-100 pt-7">
                                            <h3 className="text-sm font-extrabold text-slate-800">
                                                02. Quarterly Financial Data
                                            </h3>

                                            <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                                                Gross profit is gross sales
                                                minus cost of sales. Net income
                                                is gross profit minus operating
                                                expenses. Both calculated fields
                                                update automatically.
                                            </p>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <Field
                                                    label="Quarter Gross Sales (₱)"
                                                    name="quarter_gross_sales"
                                                    type="number"
                                                    value={form.quarter_gross_sales}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Quarter Cost of Sales (₱)"
                                                    name="quarter_cost_of_sales"
                                                    type="number"
                                                    value={form.quarter_cost_of_sales}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Quarter Gross Profit (₱)"
                                                    name="quarter_gross_profit"
                                                    type="number"
                                                    value={form.quarter_gross_profit}
                                                    onChange={setField}
                                                    readOnly
                                                />

                                                <Field
                                                    label="Operating Expenses (₱)"
                                                    name="operating_expenses"
                                                    type="number"
                                                    value={form.operating_expenses}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Total Quarterly Net Income (₱)"
                                                    name="total_quarterly_net_income"
                                                    type="number"
                                                    value={
                                                        form.total_quarterly_net_income
                                                    }
                                                    onChange={setField}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* 03. SAVINGS */}

                                        <div className="border-t border-slate-100 pt-7">
                                            <h3 className="mb-4 text-sm font-extrabold text-slate-800">
                                                03. Savings and Cash Position
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <Field
                                                    label="Cash in Bank (₱)"
                                                    name="cash_in_bank"
                                                    type="number"
                                                    value={form.cash_in_bank}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Cash on Hand (₱)"
                                                    name="cash_on_hand"
                                                    type="number"
                                                    value={form.cash_on_hand}
                                                    onChange={setField}
                                                    required
                                                />

                                                <Field
                                                    label="Total Savings (₱)"
                                                    name="total_saving"
                                                    type="number"
                                                    value={form.total_saving}
                                                    onChange={setField}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        {/* 04. MEMBER ASSESSMENT */}

                                        {association && (
                                            <div className="border-t border-slate-100 pt-7">
                                                <h3 className="mb-4 text-sm font-extrabold text-slate-800">
                                                    04. Association Member Assessment
                                                </h3>

                                                <MemberStatusAssessment
                                                    key={memberAssessmentResetKey}
                                                    members={members}
                                                    memberStatuses={memberStatuses}
                                                    onStatusChange={
                                                        handleMemberStatusChange
                                                    }
                                                />
                                            </div>
                                        )}

                                        {/* ENTERPRISE ASSESSMENT */}

                                        <div className="border-t border-slate-100 pt-7">
                                            <h3 className="text-sm font-extrabold text-slate-800">
                                                {association
                                                    ? "05. Enterprise Assessment"
                                                    : "04. Enterprise Assessment"}
                                            </h3>

                                            <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                                                Assess the enterprise status
                                                and record intervention support,
                                                recommendations, remarks, and
                                                additional funding.
                                            </p>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                <SelectField
                                                    label="Enterprise Status"
                                                    name="enterprises_status"
                                                    value={form.enterprises_status}
                                                    onChange={setField}
                                                    required
                                                    options={[
                                                        {
                                                            value: "Mainstreaming",
                                                            label: "Mainstreaming",
                                                        },
                                                        {
                                                            value: "Rehabilitation",
                                                            label: "Rehabilitation",
                                                        },
                                                        {
                                                            value: "Closure",
                                                            label: "Closure",
                                                        },
                                                    ]}
                                                />

                                                <SelectField
                                                    label="Intervention Support"
                                                    name="intervention_support"
                                                    value={form.intervention_support}
                                                    onChange={setField}
                                                    options={[
                                                        {
                                                            value: "Financial Management Training",
                                                            label: "Financial Management Training",
                                                        },
                                                        {
                                                            value: "Financial Assistance",
                                                            label: "Financial Assistance",
                                                        },
                                                        {
                                                            value: "Other",
                                                            label: "Other",
                                                        },
                                                        {
                                                            value: "None",
                                                            label: "None",
                                                        },
                                                    ]}
                                                />

                                                <SelectField
                                                    label="Additional Assessment Fund"
                                                    name="additional_assessment_fund"
                                                    value={
                                                        form.additional_assessment_fund
                                                    }
                                                    onChange={setField}
                                                    options={[
                                                        {
                                                            value: "N/A",
                                                            label: "N/A",
                                                        },
                                                        {
                                                            value: "Input Funds",
                                                            label: "Input Funds",
                                                        },
                                                        {
                                                            value: "Financial Assistance",
                                                            label: "Financial Assistance",
                                                        },
                                                        {
                                                            value: "Other",
                                                            label: "Other",
                                                        },
                                                    ]}
                                                />
                                            </div>

                                            {form.additional_assessment_fund ===
                                                "Input Funds" && (
                                                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                                                    <div className="mb-4 flex items-start gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                            <FaMoneyBillWave className="text-lg" />
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-extrabold text-emerald-900">
                                                                Additional Fund Details
                                                            </h4>

                                                            <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                                                                Enter the
                                                                additional
                                                                amount identified
                                                                or recommended
                                                                during this
                                                                assessment.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="max-w-md">
                                                        <Field
                                                            label="Additional Fund Amount (₱)"
                                                            name="additional_fund_amount"
                                                            type="number"
                                                            value={
                                                                form.additional_fund_amount
                                                            }
                                                            onChange={setField}
                                                            required
                                                            min="0"
                                                            placeholder="Enter additional fund amount"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-5 space-y-4">
                                                <TextAreaField
                                                    label="Evaluation Recommendation"
                                                    name="evaluation_recommendation"
                                                    value={
                                                        form.evaluation_recommendation
                                                    }
                                                    onChange={setField}
                                                    rows={4}
                                                />

                                                <TextAreaField
                                                    label="Remarks"
                                                    name="remarks"
                                                    value={form.remarks}
                                                    onChange={setField}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        {/* SUBMISSION */}

                                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="max-w-2xl">
                                                <p className="text-xs leading-5 text-slate-500">
                                                    Review all figures,
                                                    enterprise assessment
                                                    details, additional funding,
                                                    recommendations, remarks,
                                                    and member statuses before
                                                    saving.
                                                </p>

                                                {association && (
                                                    <p className="mt-2 text-xs font-semibold text-emerald-700">
                                                        {number(members.length)}{" "}
                                                        members will be included
                                                        in this evaluation.
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    isClosed ||
                                                    !canEvaluate
                                                }
                                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <FaSave />

                                                {processing
                                                    ? "Saving Evaluation..."
                                                    : "Save Evaluation"}
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </form>
                        )}

                    {/* =========================================
                        EVALUATION ACCESS / CLOSURE FALLBACK
                    ========================================= */}

                    {activeTab === "evaluate" &&
                        (!canEvaluate || isClosed) && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                                <div className="flex items-start gap-3">
                                    <FaExclamationCircle className="mt-1 shrink-0 text-rose-600" />

                                    <div>
                                        <h2 className="font-extrabold text-rose-800">
                                            {!canEvaluate
                                                ? "Evaluation Access Restricted"
                                                : "Evaluation Unavailable"}
                                        </h2>

                                        <p className="mt-2 text-sm leading-6 text-rose-700">
                                            {!canEvaluate
                                                ? "Your LGU account can view beneficiary details, financial information, association members, and the SLP Summary, but cannot access the evaluation form."
                                                : "This enterprise is marked as Closure. The evaluation form is unavailable for this beneficiary."}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("graph")
                                            }
                                            className="mt-4 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-800"
                                        >
                                            Return to Overview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </Layout>
    );
}