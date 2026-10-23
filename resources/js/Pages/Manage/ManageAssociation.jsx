
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import Layout from '../Layouts/Layout';
import ModalMember from '../Modal/ModalMember';
import {
    FaArrowLeft,
    FaChartBar,
    FaChartLine,
    FaCheckCircle,
    FaChevronRight,
    FaClipboardCheck,
    FaCoins,
    FaMapMarkerAlt,
    FaPlus,
    FaSearch,
    FaStore,
    FaUsers,
    FaUserPlus,
    FaUserSlash,
    FaWallet,
    FaTimes,
    FaUser,
} from 'react-icons/fa';

const CHART_COLORS = ['#059669', '#f59e0b'];
const STATUS_FILTERS = ['All', 'Active', 'Inactive'];

const DEFAULT_BENEFICIARY = { members: [] };

export default function ManageAssociation({
    beneficiary = DEFAULT_BENEFICIARY,
    monitoringData = [],
}) {
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Beneficiary information
    const name =
        beneficiary.name_of_slpa_slp_participant ||
        beneficiary.name_of_slp_participant ||
        beneficiary.participant_name ||
        beneficiary.name ||
        'SLP Beneficiary';

    const beneficiaryId =
        beneficiary.beneficiaries_id ??
        beneficiary.beneficiary_id ??
        beneficiary.id ??
        null;

    const projectName =
        beneficiary.name_of_project ||
        beneficiary.project_name ||
        'Project not specified';

    const enterpriseType =
        beneficiary.type_of_enterprise ||
        beneficiary.enterprise_type ||
        'Not specified';

    const implementationYear =
        beneficiary.implementation_year ??
        beneficiary.year_implemented ??
        beneficiary.project_year ??
        '—';

    const enterpriseStatus =
        beneficiary.enterprise_status ||
        beneficiary.enterprises_status ||
        beneficiary.status_assessment ||
        'Not specified';

    const municipality =
        beneficiary.city_municipality ||
        beneficiary.municipality ||
        '';

    const location = [
        beneficiary.lgu,
        municipality,
        beneficiary.barangay,
    ].filter(Boolean);

    const grantAmount = Number(
        beneficiary.total_grant_received ??
        beneficiary.grant_amount ??
        0,
    );

    // Member data
    const members = useMemo(
        () => Array.isArray(beneficiary?.members) ? beneficiary.members : [],
        [beneficiary?.members],
    );

    const activeMembers = useMemo(
        () =>
            members.filter(
                (member) => getMemberStatus(member) === 'Active',
            ).length,
        [members],
    );

    const inactiveMembers = members.length - activeMembers;

    const activityRate = members.length
        ? Math.round((activeMembers / members.length) * 100)
        : 0;

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return members.filter((member) => {
            const memberName = getMemberName(member).toLowerCase();
            const memberId = String(
                member.member_id ??
                member.participant_id ??
                member.id ??
                '',
            ).toLowerCase();

            const contact = String(
                member.contact_number ?? member.phone ?? '',
            ).toLowerCase();

            const matchesSearch =
                !query ||
                memberName.includes(query) ||
                memberId.includes(query) ||
                contact.includes(query);

            const matchesStatus =
                statusFilter === 'All' ||
                getMemberStatus(member) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [members, search, statusFilter]);

    // Monitoring data
    const records = useMemo(() => {
        if (Array.isArray(monitoringData)) return monitoringData;
        return monitoringData ? [monitoringData] : [];
    }, [monitoringData]);

    const latestRecord = records[0] ?? {};

    const latestMonitoringDate =
        latestRecord.monitoring_date ??
        latestRecord.date_provided ??
        latestRecord.evaluation_date ??
        latestRecord.created_at;

    // Chart data
    const memberChartData = [
        { name: 'Active', value: activeMembers },
        { name: 'Inactive', value: inactiveMembers },
    ];

    const memberBarData = [
        { name: 'Total', members: members.length },
        { name: 'Active', members: activeMembers },
        { name: 'Inactive', members: inactiveMembers },
    ];

    // Actions
    const openMemberModal = () => {
        setShowMemberModal(true);
    };

    const closeMemberModal = () => {
        setShowMemberModal(false);
    };

    const money = (amount) =>
        new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Number(amount) || 0);

    return (
        <Layout>
            <Head title={`Manage ${name}`} />

            <div className="min-h-screen bg-slate-50 pb-10">
                <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
                        <span>Admin</span>
                        <FaChevronRight className="text-[9px]" />
                        <Link
                            href="/slp-beneficiaries"
                            className="transition hover:text-emerald-700"
                        >
                            SLP Beneficiaries
                        </Link>
                        <FaChevronRight className="text-[9px]" />
                        <span className="text-emerald-700">
                            Beneficiary Overview
                        </span>
                    </nav>

                    {/* Page header */}
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                                Sustainable Livelihood Program
                            </p>
                            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Beneficiary Overview
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Manage beneficiary information, member
                                records, grant details, and monitoring
                                information in one place.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/slp-beneficiaries"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                                <FaArrowLeft />
                                Back to Beneficiaries
                            </Link>

                            <button
                                type="button"
                                onClick={openMemberModal}
                                disabled={!beneficiaryId}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaUserPlus />
                                Add Member
                            </button>
                        </div>
                    </header>

                    {/* Beneficiary banner */}
                    <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-xl sm:p-8">
                        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[38px] border-white/[0.06]" />
                        <div className="pointer-events-none absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-teal-400/[0.08] blur-3xl" />

                        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
                            <div className="flex min-w-0 items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl">
                                    <FaStore />
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                                            SLP Participant
                                        </span>
                                        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-100">
                                            ID: {beneficiaryId ?? 'N/A'}
                                        </span>
                                    </div>

                                    <h2 className="mt-3 break-words text-2xl font-black leading-tight sm:text-3xl">
                                        {name}
                                    </h2>
                                    <p className="mt-2 text-sm text-emerald-100/75">
                                        {projectName}
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {location.length ? (
                                            location.map((place, index) => (
                                                <span
                                                    key={`${place}-${index}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/90"
                                                >
                                                    {index === 0 && <FaMapMarkerAlt />}
                                                    {place}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-emerald-100/70">
                                                Location not provided
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 xl:min-w-[320px]">
                                <BannerStat
                                    label="Implementation Year"
                                    value={implementationYear}
                                />
                                <BannerStat
                                    label="Enterprise Status"
                                    value={enterpriseStatus}
                                />
                            </div>
                        </div>
                    </section>

                    {/* KPI cards */}
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Members"
                            value={members.length}
                            description="Registered member records"
                            icon={<FaUsers />}
                            color="emerald"
                        />
                        <StatCard
                            title="Active Members"
                            value={activeMembers}
                            description="Currently marked active"
                            icon={<FaCheckCircle />}
                            color="blue"
                        />
                        <StatCard
                            title="Inactive Members"
                            value={inactiveMembers}
                            description="Currently marked inactive"
                            icon={<FaUserSlash />}
                            color="amber"
                        />
                        <StatCard
                            title="Total Grant Received"
                            value={money(grantAmount)}
                            description="Recorded beneficiary grant"
                            icon={<FaWallet />}
                            color="violet"
                            compact
                        />
                    </section>

                    {/* Analytics heading */}
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                                Data Visualization
                            </p>
                            <h2 className="mt-1 text-xl font-black text-slate-900">
                                Beneficiary Analytics
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Summary of registered members and monitoring records.
                            </p>
                        </div>
                        <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
                            {records.length} monitoring record{records.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {/* Charts */}
                    <section className="grid gap-5 xl:grid-cols-2">
                        <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <PanelHeading
                                icon={<FaChartLine />}
                                title="Member Activity"
                                subtitle="Distribution of active and inactive members"
                            />

                            {members.length ? (
                                <>
                                    <div className="mt-5 h-[260px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={memberChartData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="46%"
                                                    innerRadius={66}
                                                    outerRadius={96}
                                                    paddingAngle={4}
                                                    stroke="none"
                                                >
                                                    {memberChartData.map((entry, index) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={CHART_COLORS[index]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [value, 'Members']}
                                                />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    iconType="circle"
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                                        <MiniMetric label="Total" value={members.length} />
                                        <MiniMetric
                                            label="Active"
                                            value={activeMembers}
                                            color="text-emerald-700"
                                        />
                                        <MiniMetric
                                            label="Inactive"
                                            value={inactiveMembers}
                                            color="text-amber-600"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-500">
                                                Member activity rate
                                            </span>
                                            <span className="font-black text-emerald-700">
                                                {activityRate}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-500 transition-all"
                                                style={{ width: `${activityRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <EmptyChart
                                    icon={<FaUsers />}
                                    title="No member data available"
                                    description="The chart will appear when member records are supplied by the controller."
                                />
                            )}
                        </div>

                        <div className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <PanelHeading
                                icon={<FaChartBar />}
                                title="Member Count Comparison"
                                subtitle="Compare total, active, and inactive members"
                            />

                            {members.length ? (
                                <div className="mt-5 h-[310px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={memberBarData}
                                            margin={{ top: 10, right: 8, left: -18, bottom: 5 }}
                                            barSize={42}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e2e8f0"
                                            />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: '#64748b', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                            <Bar
                                                dataKey="members"
                                                name="Members"
                                                fill="#059669"
                                                radius={[7, 7, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <EmptyChart
                                    icon={<FaChartBar />}
                                    title="Nothing to compare yet"
                                    description="Member counts will appear here when member data is available."
                                />
                            )}
                        </div>
                    </section>

                    {/* Grant and monitoring */}
                    <section className="grid gap-5 xl:grid-cols-3">
                        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <PanelHeading
                                icon={<FaCoins />}
                                title="Grant Overview"
                                subtitle="Recorded financial information"
                            />

                            <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
                                <p className="text-xs font-bold text-emerald-800">
                                    Total Grant Received
                                </p>
                                <p className="mt-3 break-words text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
                                    {money(grantAmount)}
                                </p>
                                <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-600"
                                        style={{ width: grantAmount > 0 ? '100%' : '0%' }}
                                    />
                                </div>
                                <p className="mt-2 text-[11px] text-emerald-800/75">
                                    Recorded grant amount; this does not represent spending or fund utilization.
                                </p>
                            </div>

                            <div className="mt-5 space-y-4">
                                <InfoRow label="Project" value={projectName} />
                                <InfoRow label="Enterprise Type" value={enterpriseType} />
                                <InfoRow label="Implementation Year" value={implementationYear} />
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:col-span-1 sm:p-6 xl:col-span-2">
                            <PanelHeading
                                icon={<FaClipboardCheck />}
                                title="Monitoring Overview"
                                subtitle="Monitoring information supplied by the controller"
                            />

                            {records.length ? (
                                <div className="mt-6">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                            <p className="text-xs font-bold text-slate-500">
                                                Available Records
                                            </p>
                                            <p className="mt-2 text-3xl font-black text-slate-900">
                                                {records.length}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                            <p className="text-xs font-bold text-slate-500">
                                                Latest Monitoring Date
                                            </p>
                                            <p className="mt-3 text-lg font-black text-slate-900">
                                                {formatDate(latestMonitoringDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                <FaCheckCircle />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-900">
                                                    Monitoring data is available
                                                </h4>
                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                    Monitoring information has been supplied for this beneficiary.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6">
                                    <EmptyChart
                                        icon={<FaClipboardCheck />}
                                        title="No monitoring records found"
                                        description="Monitoring information will appear after records are saved and passed to this page."
                                    />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Beneficiary details */}
                    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <PanelHeading
                            icon={<FaStore />}
                            title="Beneficiary Information"
                            subtitle="Implementation, location, and enterprise details"
                        />

                        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailItem label="Beneficiary ID" value={beneficiaryId} />
                            <DetailItem label="Participant Name" value={name} />
                            <DetailItem label="Implementation Year" value={implementationYear} />
                            <DetailItem label="Track" value={beneficiary.track} />
                            <DetailItem label="Modality" value={beneficiary.modality} />
                            <DetailItem label="District" value={beneficiary.district} />
                            <DetailItem label="LGU" value={beneficiary.lgu} />
                            <DetailItem label="Municipality" value={municipality} />
                            <DetailItem label="Barangay" value={beneficiary.barangay} />
                            <DetailItem label="Project Name" value={projectName} />
                            <DetailItem label="Type of Enterprise" value={enterpriseType} />
                            <DetailItem label="Enterprise Status" value={enterpriseStatus} />
                        </div>
                    </section>

                    {/* Member directory */}
                    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                            <PanelHeading
                                icon={<FaUsers />}
                                title="Member Directory"
                                subtitle="Search and filter beneficiary members"
                            />

                            <button
                                type="button"
                                onClick={openMemberModal}
                                disabled={!beneficiaryId}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FaPlus />
                                Add Member
                            </button>
                        </div>

                        {/* Search and status filters */}
                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="relative w-full sm:max-w-md">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search member name, ID, or contact..."
                                    aria-label="Search members"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {STATUS_FILTERS.map((status) => (
                                    <button
                                        type="button"
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        aria-pressed={statusFilter === status}
                                        className={`rounded-lg px-4 py-2.5 text-xs font-extrabold transition ${
                                            statusFilter === status
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                                        }`}
                                    >
                                        {status}
                                        {status === 'All' && (
                                            <span className="ml-2 opacity-70">
                                                {members.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Member table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left">

<thead>
    <tr className="bg-white text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
        <th className="px-5 py-4">Member</th>
        <th className="px-5 py-4">Member ID</th>
        <th className="px-5 py-4">Gender</th>
        <th className="px-5 py-4">Birthdate</th>
        <th className="px-5 py-4">Role</th>
        <th className="px-5 py-4">Contact</th>
        <th className="px-5 py-4">Municipality / Barangay</th>
        <th className="px-5 py-4">Purok</th>
        <th className="px-5 py-4">Year Joined</th>
        <th className="px-5 py-4">Status</th>
    </tr>
</thead>


                                
<tbody className="divide-y divide-slate-100">
    {filteredMembers.map((member, index) => {
        const memberName = getMemberName(member);
        const isActive = getMemberStatus(member) === 'Active';

        return (
            <tr
                key={member.member_id ?? member.id ?? index}
                className="transition hover:bg-emerald-50/30"
            >
                <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-black text-emerald-700">
                            {memberName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-slate-800">
                                {memberName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                {member.participant_name ||
                                    beneficiary.name_of_slpa_slp_participant ||
                                    'SLP Participant'}
                            </p>
                        </div>
                    </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-slate-600">
                    {member.member_id || '—'}
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                    {member.gender || '—'}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                    {formatDate(member.birthdate)}
                </td>

                <td className="px-5 py-4">
                    <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                        {member.role || '—'}
                    </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                    {member.contact_number || '—'}
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                    <p className="font-bold text-slate-700">
                        {member.municipality || '—'}
                    </p>
                    <p className="mt-1 text-slate-400">
                        {member.barangay || '—'}
                    </p>
                </td>

                <td className="px-5 py-4 text-xs text-slate-600">
                    {member.purok || '—'}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                    {member.year_joined || '—'}
                </td>

                <td className="px-5 py-4">
                    <StatusBadge active={isActive} />
                </td>
            </tr>
        );
    })}
</tbody>

                            </table>

                            {filteredMembers.length === 0 && (
                                <div className="px-6 py-14 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                                        <FaUsers />
                                    </div>
                                    <h4 className="mt-4 text-sm font-extrabold text-slate-800">
                                        {members.length
                                            ? 'No matching members'
                                            : 'No members registered'}
                                    </h4>
                                    <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                                        {members.length
                                            ? 'Try another search term or change the status filter.'
                                            : 'There are currently no member records supplied to this page.'}
                                    </p>

                                    {!members.length && (
                                        <button
                                            type="button"
                                            onClick={openMemberModal}
                                            disabled={!beneficiaryId}
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <FaUserPlus />
                                            Add First Member
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Directory footer */}
                        <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
                            <p>
                                Showing{' '}
                                <strong className="text-slate-800">
                                    {filteredMembers.length}
                                </strong>{' '}
                                of{' '}
                                <strong className="text-slate-800">
                                    {members.length}
                                </strong>{' '}
                                members
                            </p>
                            <p>
                                Active: {activeMembers} | Inactive: {inactiveMembers}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Add Member modal — important: use isOpen, not show */}
            <ModalMember
                isOpen={showMemberModal}
                onClose={closeMemberModal}
                beneficiary={beneficiary}
            />
        </Layout>
    );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function getMemberName(member = {}) {
    return (
        member.member_name ||
        member.name ||
        [
            member.firstname,
            member.middlename,
            member.lastname,
        ]
            .filter(Boolean)
            .join(' ') ||
        'Unnamed Member'
    );
}

function getMemberStatus(member = {}) {
    return String(member.status ?? 'Active').trim().toLowerCase() === 'active'
        ? 'Active'
        : 'Inactive';
}

function BannerStat({ label, value }) {
    return (
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
            <p className="text-xs text-emerald-100/70">{label}</p>
            <p className="mt-2 break-words text-lg font-black sm:text-xl">
                {value || '—'}
            </p>
        </div>
    );
}

function StatCard({
    title,
    value,
    description,
    icon,
    color,
    compact = false,
}) {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        violet: 'bg-violet-50 text-violet-700',
    };

    return (
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-500">{title}</p>
                    <p className={`mt-3 break-words font-black tracking-tight text-slate-900 ${compact ? 'text-xl sm:text-2xl' : 'text-3xl'}`}>
                        {value}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-slate-400">
                        {description}
                    </p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${colors[color] || colors.emerald}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function PanelHeading({ icon, title, subtitle }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                {icon}
            </div>
            <div className="min-w-0">
                <h3 className="font-black text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
            </div>
        </div>
    );
}

function MiniMetric({ label, value, color = 'text-slate-900' }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="max-w-[65%] break-words text-right text-xs font-bold text-slate-800">
                {value || '—'}
            </span>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div className="min-w-0 border-b border-slate-100 pb-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-2 break-words text-sm font-bold text-slate-800">
                {value || '—'}
            </p>
        </div>
    );
}

function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

function EmptyChart({ icon, title, description }) {
    return (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-slate-400 shadow-sm">
                {icon}
            </div>
            <h4 className="mt-4 text-sm font-extrabold text-slate-800">{title}</h4>
            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                {description}
            </p>
        </div>
    );
}

function formatDate(value) {
    if (!value) return 'Not recorded';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('en-PH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
