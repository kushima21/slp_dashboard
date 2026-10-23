
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import Layout from "../Layouts/Layout";

import {
    FaSearch,
    FaPlus,
    FaChevronRight,
    FaBuilding,
    FaUsers,
    FaFilter,
    FaThLarge,
    FaList,
    FaEye,
    FaUser,
    FaCalendarAlt,
    FaTimes,
    FaEnvelope,
    FaShieldAlt,
    FaUserCheck,
    FaUserTimes,
    FaEdit,
    FaTrash,
    FaKey,
    FaSave,
    FaMapMarkerAlt,
    FaPhone,
    FaLock,
    FaCheckCircle,
    FaUserCog,
    FaSyncAlt,
    FaVenusMars,
    FaChevronDown,
    FaMapMarkedAlt,
} from "react-icons/fa";

const ROLE_OPTIONS = ["lgu", "MPDOs", "dswd", "admin"];

const LGU_OPTIONS = Array.from(
    { length: 12 },
    (_, index) => `LGU ${index + 1}`
);

const DISTRICT_OPTIONS = Array.from(
    { length: 12 },
    (_, index) =>
        `${index + 1}${["st", "nd", "rd"][index] || "th"} District`
);

const EMPTY_FORM = {
    firstname: "",
    middlename: "",
    lastname: "",
    contact_number: "",
    gender: "",
    address: "",
    email: "",
    password: "",
    password_confirmation: "",
    lgu: "",
    municipality: "",
    district: "1st District",
    status: "Active",
    roles: [],
};

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

const labelClass =
    "mb-2 block text-xs font-extrabold text-slate-700";

export default function Users({
    auth,
    users = [],
    filters = {},
    municipalities = [],
    districts = DISTRICT_OPTIONS,
}) {
    const [search, setSearch] = useState(filters.search || "");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [lguFilter, setLguFilter] = useState("all");
    const [municipalityFilter, setMunicipalityFilter] = useState("all");

    const [viewMode, setViewMode] = useState("table");
    const [showFilters, setShowFilters] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const userList = Array.isArray(users)
        ? users
        : users?.data || [];

    // Municipality choices come from the Laravel controller.
    const municipalityList = useMemo(() => {
        const source = Array.isArray(municipalities)
            ? municipalities
            : municipalities?.data || [];

        const normalized = source
            .map((item) => {
                if (typeof item === "string") {
                    return {
                        value: item,
                        label: item,
                    };
                }

                const name =
                    item.municipality ??
                    item.municipality_name ??
                    item.name ??
                    "";

                return {
                    value: String(name),
                    label: String(name),
                };
            })
            .filter((item) => item.value);

        return Array.from(
            new Map(
                normalized.map((item) => [item.value, item])
            ).values()
        ).sort((a, b) => a.label.localeCompare(b.label));
    }, [municipalities]);

    const districtList = useMemo(() => {
        if (!Array.isArray(districts) || !districts.length) {
            return DISTRICT_OPTIONS;
        }

        return districts
            .map((item) =>
                typeof item === "string"
                    ? item
                    : item.district_name ?? item.name ?? ""
            )
            .filter(Boolean);
    }, [districts]);

    const getUserId = (user) =>
        user?.id ?? user?.user_id ?? user?.register_id;

    const getFullName = (user) => {
        if (user?.firstname || user?.lastname) {
            return [
                user.firstname,
                user.middlename,
                user.lastname,
            ]
                .filter(Boolean)
                .join(" ");
        }

        return user?.name ?? user?.full_name ?? "Unnamed User";
    };

    const getRoles = (user) => {
        let roles = user?.roles ?? [];

        if (typeof roles === "string") {
            try {
                roles = JSON.parse(roles);
            } catch {
                roles = [roles];
            }
        }

        if (!Array.isArray(roles)) {
            roles = roles?.name ? [roles.name] : [];
        }

        return roles
            .map((role) =>
                typeof role === "string" ? role : role?.name
            )
            .filter(Boolean);
    };

    const getStatus = (user) =>
        user?.status ??
        user?.account_status ??
        (user?.is_active === false ? "Inactive" : "Active");

    const getMunicipality = (user) =>
        user?.municipality ??
        user?.municipality_name ??
        "";

    const formatDate = (value) => {
        if (!value) return "Not available";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return userList.filter((user) => {
            const roles = getRoles(user);

            const searchValues = [
                getFullName(user),
                user.email,
                user.contact_number,
                user.lgu,
                getMunicipality(user),
                user.district,
                user.address,
                ...roles,
            ];

            const matchesSearch =
                !query ||
                searchValues.some((value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(query)
                );

            const matchesRole =
                roleFilter === "all" ||
                roles.some(
                    (role) =>
                        role.toLowerCase() ===
                        roleFilter.toLowerCase()
                );

            const matchesStatus =
                statusFilter === "all" ||
                getStatus(user).toLowerCase() ===
                    statusFilter.toLowerCase();

            const matchesLgu =
                lguFilter === "all" ||
                user.lgu === lguFilter;

            const matchesMunicipality =
                municipalityFilter === "all" ||
                getMunicipality(user) === municipalityFilter;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus &&
                matchesLgu &&
                matchesMunicipality
            );
        });
    }, [
        userList,
        search,
        roleFilter,
        statusFilter,
        lguFilter,
        municipalityFilter,
    ]);

    const totalUsers = userList.length;

    const activeUsers = userList.filter(
        (user) => getStatus(user).toLowerCase() === "active"
    ).length;

    const inactiveUsers = userList.filter(
        (user) => getStatus(user).toLowerCase() === "inactive"
    ).length;

    const adminUsers = userList.filter((user) =>
        getRoles(user).some(
            (role) => role.toLowerCase() === "admin"
        )
    ).length;

    const openCreateModal = () => {
        setEditingUser(null);
        setForm({
            ...EMPTY_FORM,
            roles: [],
        });
        setErrors({});
        setShowDetails(false);
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setErrors({});

        setForm({
            firstname: user.firstname ?? "",
            middlename: user.middlename ?? "",
            lastname: user.lastname ?? "",
            contact_number: user.contact_number ?? "",
            gender: user.gender ?? "",
            address: user.address ?? "",
            email: user.email ?? "",
            password: "",
            password_confirmation: "",
            lgu: user.lgu ?? "",
            municipality: getMunicipality(user),
            district: user.district ?? "1st District",
            status: getStatus(user),
            roles: getRoles(user),
        });

        setShowDetails(false);
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) return;

        setShowModal(false);
        setEditingUser(null);
        setErrors({});
    };

    const updateField = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: undefined,
        }));
    };

    const toggleRole = (role) => {
        setForm((previous) => ({
            ...previous,
            roles: previous.roles.includes(role)
                ? previous.roles.filter((item) => item !== role)
                : [...previous.roles, role],
        }));

        setErrors((previous) => ({
            ...previous,
            roles: undefined,
        }));
    };

    const submitUser = (event) => {
        event.preventDefault();

        setProcessing(true);
        setErrors({});

        const payload = {
            firstname: form.firstname,
            middlename: form.middlename || null,
            lastname: form.lastname,
            contact_number: form.contact_number,
            gender: form.gender,
            address: form.address,
            email: form.email,
            lgu: form.lgu,
            municipality: form.municipality,
            district: form.district,
            status: form.status,
            roles: form.roles,
        };

        if (!editingUser || form.password) {
            payload.password = form.password;
            payload.password_confirmation =
                form.password_confirmation;
        }

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                setShowModal(false);
                setEditingUser(null);
                setForm({ ...EMPTY_FORM, roles: [] });
                setErrors({});
            },

            onError: (validationErrors) => {
                setErrors(validationErrors);
            },

            onFinish: () => {
                setProcessing(false);
            },
        };

        if (editingUser) {
            router.put(
                `/users/${getUserId(editingUser)}`,
                payload,
                options
            );
        } else {
            router.post("/users", payload, options);
        }
    };

    const deleteUser = (user) => {
        const id = getUserId(user);

        if (!id) {
            window.alert("Unable to identify this user.");
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to delete ${getFullName(user)}?`
            )
        ) {
            return;
        }

        router.delete(`/users/${id}`, {
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearch("");
        setRoleFilter("all");
        setStatusFilter("all");
        setLguFilter("all");
        setMunicipalityFilter("all");
    };

    const statusClass = (status) => {
        const value = String(status).toLowerCase();

        if (value === "active") {
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
        }

        if (value === "inactive") {
            return "bg-rose-50 text-rose-700 ring-rose-600/10";
        }

        if (value === "pending") {
            return "bg-amber-50 text-amber-700 ring-amber-600/10";
        }

        return "bg-slate-100 text-slate-600 ring-slate-500/10";
    };

    const roleClass = (role) => {
        switch (String(role).toLowerCase()) {
            case "admin":
                return "bg-violet-50 text-violet-700";
            case "dswd":
                return "bg-blue-50 text-blue-700";
            case "mpdos":
                return "bg-amber-50 text-amber-700";
            default:
                return "bg-emerald-50 text-emerald-700";
        }
    };

    return (
        <Layout>
            <Head title="User Management" />

            <div className="min-h-screen bg-[#f6f8fb]">
                <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Admin</span>
                        <FaChevronRight className="text-[8px]" />
                        <span>Manage</span>
                        <FaChevronRight className="text-[8px]" />
                        <span>SLP</span>
                        <FaChevronRight className="text-[8px]" />
                        <span className="font-bold text-emerald-600">
                            Users
                        </span>
                    </nav>

                    {/* Header */}
                    <section className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
                        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-32 right-48 h-64 w-64 rounded-full bg-emerald-400/5 blur-2xl" />

                        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                                    <FaShieldAlt />
                                    SLP Administration
                                </div>

                                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                    User Management
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                                    Manage user accounts, assign LGU
                                    numbers, select municipalities, set
                                    districts, and configure system roles.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <FaBuilding className="text-emerald-400" />
                                        SLP Enterprise System
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FaUsers className="text-emerald-400" />
                                        {totalUsers} registered users
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
                            >
                                <FaPlus />
                                Add New User
                            </button>
                        </div>
                    </section>

                    {/* Statistics */}
                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="Total Users"
                            value={totalUsers}
                            description="All registered accounts"
                            icon={<FaUsers />}
                            iconClass="bg-blue-50 text-blue-600"
                            accent="bg-blue-500"
                        />
                        <SummaryCard
                            title="Active Users"
                            value={activeUsers}
                            description="Active system accounts"
                            icon={<FaUserCheck />}
                            iconClass="bg-emerald-50 text-emerald-600"
                            accent="bg-emerald-500"
                        />
                        <SummaryCard
                            title="Inactive Users"
                            value={inactiveUsers}
                            description="Inactive system accounts"
                            icon={<FaUserTimes />}
                            iconClass="bg-rose-50 text-rose-600"
                            accent="bg-rose-500"
                        />
                        <SummaryCard
                            title="Administrators"
                            value={adminUsers}
                            description="Accounts with admin role"
                            icon={<FaUserCog />}
                            iconClass="bg-violet-50 text-violet-600"
                            accent="bg-violet-500"
                        />
                    </section>

                    {/* Directory */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">
                                    User Directory
                                </h2>
                                <p className="mt-1 text-xs text-slate-400">
                                    Search, filter, view, and manage user accounts.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative sm:w-72">
                                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search name, email, LGU..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowFilters((value) => !value)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    <FaFilter />
                                    Filters
                                    <FaChevronDown className="text-[10px]" />
                                </button>

                                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("table")}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            viewMode === "table"
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-slate-400"
                                        }`}
                                        aria-label="Table view"
                                    >
                                        <FaList />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            viewMode === "grid"
                                                ? "bg-white text-emerald-600 shadow-sm"
                                                : "text-slate-400"
                                        }`}
                                        aria-label="Grid view"
                                    >
                                        <FaThLarge />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2 xl:grid-cols-4">
                                <FilterSelect
                                    label="Filter by Role"
                                    value={roleFilter}
                                    onChange={setRoleFilter}
                                    options={[
                                        { value: "all", label: "All Roles" },
                                        ...ROLE_OPTIONS.map((role) => ({
                                            value: role,
                                            label: role.toUpperCase(),
                                        })),
                                    ]}
                                />

                                <FilterSelect
                                    label="Filter by Status"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={[
                                        { value: "all", label: "All Statuses" },
                                        { value: "Active", label: "Active" },
                                        { value: "Inactive", label: "Inactive" },
                                        { value: "Pending", label: "Pending" },
                                    ]}
                                />

                                <FilterSelect
                                    label="Filter by LGU"
                                    value={lguFilter}
                                    onChange={setLguFilter}
                                    options={[
                                        { value: "all", label: "All LGUs" },
                                        ...LGU_OPTIONS.map((lgu) => ({
                                            value: lgu,
                                            label: lgu,
                                        })),
                                    ]}
                                />

                                <FilterSelect
                                    label="Filter by Municipality"
                                    value={municipalityFilter}
                                    onChange={setMunicipalityFilter}
                                    options={[
                                        {
                                            value: "all",
                                            label: "All Municipalities",
                                        },
                                        ...municipalityList,
                                    ]}
                                />

                                <div className="sm:col-span-2 xl:col-span-4">
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="text-xs font-bold text-emerald-700 hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <strong className="text-slate-800">
                                    {filteredUsers.length}
                                </strong>{" "}
                                of {totalUsers} users
                            </p>

                            {(search ||
                                roleFilter !== "all" ||
                                statusFilter !== "all" ||
                                lguFilter !== "all" ||
                                municipalityFilter !== "all") && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-bold text-emerald-700"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* Table View */}
                        {viewMode === "table" && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1250px] text-left">
                                    <thead>
                                        <tr className="border-y border-slate-100 bg-slate-50/80">
                                            {[
                                                "User",
                                                "Contact",
                                                "LGU",
                                                "Municipality",
                                                "District",
                                                "Roles",
                                                "Status",
                                                "Date Created",
                                                "Actions",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((user) => {
                                            const name = getFullName(user);
                                            const roles = getRoles(user);
                                            const status = getStatus(user);

                                            return (
                                                <tr
                                                    key={getUserId(user) ?? user.email}
                                                    className="transition hover:bg-slate-50/80"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar name={name} />
                                                            <div>
                                                                <p className="text-sm font-extrabold text-slate-800">
                                                                    {name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    {user.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="flex items-center gap-2 text-xs text-slate-600">
                                                            <FaPhone className="text-slate-300" />
                                                            {user.contact_number || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                                                            {user.lgu || "—"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-xs font-bold text-slate-700">
                                                            {getMunicipality(user) || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-xs text-slate-600">
                                                            {user.district || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex max-w-[230px] flex-wrap gap-1.5">
                                                            {roles.length ? roles.map((role) => (
                                                                <span
                                                                    key={role}
                                                                    className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${roleClass(role)}`}
                                                                >
                                                                    {role.toUpperCase()}
                                                                </span>
                                                            )) : (
                                                                <span className="text-xs text-slate-400">
                                                                    No roles
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold ring-1 ring-inset ${statusClass(status)}`}>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-xs text-slate-500">
                                                        {formatDate(user.created_at)}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <ActionButton
                                                                title="View user"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowDetails(true);
                                                                }}
                                                                className="hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <FaEye />
                                                            </ActionButton>
                                                            <ActionButton
                                                                title="Edit user"
                                                                onClick={() => openEditModal(user)}
                                                                className="hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                                            >
                                                                <FaEdit />
                                                            </ActionButton>
                                                            <ActionButton
                                                                title="Delete user"
                                                                onClick={() => deleteUser(user)}
                                                                className="hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                            >
                                                                <FaTrash />
                                                            </ActionButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Grid View */}
                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredUsers.map((user) => {
                                    const name = getFullName(user);
                                    const roles = getRoles(user);

                                    return (
                                        <article
                                            key={getUserId(user) ?? user.email}
                                            className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:shadow-lg"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <Avatar name={name} large />
                                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusClass(getStatus(user))}`}>
                                                    {getStatus(user)}
                                                </span>
                                            </div>

                                            <h3 className="mt-4 text-base font-extrabold text-slate-800">
                                                {name}
                                            </h3>

                                            <p className="mt-1 break-all text-xs text-slate-400">
                                                {user.email}
                                            </p>

                                            <div className="mt-4 space-y-3 text-xs text-slate-500">
                                                <AssignmentRow
                                                    icon={<FaPhone />}
                                                    label="Contact"
                                                    value={user.contact_number || "Not provided"}
                                                />
                                                <AssignmentRow
                                                    icon={<FaBuilding />}
                                                    label="LGU"
                                                    value={user.lgu || "Not assigned"}
                                                />
                                                <AssignmentRow
                                                    icon={<FaMapMarkedAlt />}
                                                    label="Municipality"
                                                    value={getMunicipality(user) || "Not assigned"}
                                                />
                                                <AssignmentRow
                                                    icon={<FaMapMarkerAlt />}
                                                    label="District"
                                                    value={user.district || "Not assigned"}
                                                />
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`rounded-lg px-2 py-1 text-[10px] font-bold ${roleClass(role)}`}
                                                    >
                                                        {role.toUpperCase()}
                                                    </span>
                                                ))}
                                                {!roles.length && (
                                                    <span className="text-xs text-slate-400">
                                                        No roles assigned
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                                                <ActionButton
                                                    title="View user"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowDetails(true);
                                                    }}
                                                >
                                                    <FaEye />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Edit user"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <FaEdit />
                                                </ActionButton>
                                                <ActionButton
                                                    title="Delete user"
                                                    onClick={() => deleteUser(user)}
                                                >
                                                    <FaTrash />
                                                </ActionButton>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredUsers.length === 0 && (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                                    <FaUsers />
                                </div>
                                <h3 className="mt-5 font-extrabold text-slate-800">
                                    No users found
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Try changing your search or filters,
                                    or create a new user account.
                                </p>
                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                                >
                                    <FaPlus />
                                    Add New User
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-slate-400">
                                SLP Enterprise System · User Directory
                            </p>
                            <p className="flex items-center gap-2 text-[11px] text-slate-500">
                                <FaLock className="text-emerald-600" />
                                Authorized administration workspace
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="relative overflow-hidden bg-slate-950 px-6 py-6 sm:px-8">
                            <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                                        {editingUser ? <FaEdit /> : <FaUserCog />}
                                    </div>
                                    <h2 className="text-xl font-black text-white">
                                        {editingUser
                                            ? "Edit User Account"
                                            : "Register New User"}
                                    </h2>
                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Complete the user information, select
                                        an LGU and municipality, and assign
                                        system roles.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Close modal"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={submitUser}>
                            <div className="max-h-[65vh] space-y-7 overflow-y-auto p-5 sm:p-8">

                                {/* 01 Personal Information */}
                                <FormSection
                                    number="01"
                                    title="Personal Information"
                                    description="Enter the user's basic information."
                                    icon={<FaUser />}
                                >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <FormField label="First Name" required error={errors.firstname}>
                                            <input
                                                required
                                                value={form.firstname}
                                                onChange={(e) => updateField("firstname", e.target.value)}
                                                placeholder="First name"
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <FormField label="Middle Name" error={errors.middlename}>
                                            <input
                                                value={form.middlename}
                                                onChange={(e) => updateField("middlename", e.target.value)}
                                                placeholder="Middle name"
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <FormField label="Last Name" required error={errors.lastname}>
                                            <input
                                                required
                                                value={form.lastname}
                                                onChange={(e) => updateField("lastname", e.target.value)}
                                                placeholder="Last name"
                                                className={inputClass}
                                            />
                                        </FormField>

                                        <FormField label="Contact Number" required error={errors.contact_number}>
                                            <div className="relative">
                                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                                <input
                                                    required
                                                    type="tel"
                                                    value={form.contact_number}
                                                    onChange={(e) => updateField("contact_number", e.target.value)}
                                                    placeholder="09XXXXXXXXX"
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </FormField>

                                        <FormField label="Gender" required error={errors.gender}>
                                            <select
                                                required
                                                value={form.gender}
                                                onChange={(e) => updateField("gender", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </FormField>

                                        <FormField label="Email Address" required error={errors.email}>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                                <input
                                                    required
                                                    type="email"
                                                    value={form.email}
                                                    onChange={(e) => updateField("email", e.target.value)}
                                                    placeholder="user@example.com"
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </FormField>

                                        <div className="md:col-span-3">
                                            <FormField label="Complete Address" required error={errors.address}>
                                                <textarea
                                                    required
                                                    rows={2}
                                                    value={form.address}
                                                    onChange={(e) => updateField("address", e.target.value)}
                                                    placeholder="House number, street, barangay, municipality..."
                                                    className={`${inputClass} resize-y`}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </FormSection>

                                {/* 02 LGU, Municipality and District */}
                                <FormSection
                                    number="02"
                                    title="LGU & Location Assignment"
                                    description="Select the LGU number independently from the municipality and district."
                                    icon={<FaMapMarkedAlt />}
                                >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormField label="LGU Number" required error={errors.lgu}>
                                            <select
                                                required
                                                value={form.lgu}
                                                onChange={(e) => updateField("lgu", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select LGU</option>
                                                {LGU_OPTIONS.map((lgu) => (
                                                    <option key={lgu} value={lgu}>
                                                        {lgu}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="mt-1.5 text-[11px] text-slate-400">
                                                Example: LGU 1, LGU 2, LGU 3.
                                            </p>
                                        </FormField>

                                        <FormField label="Municipality" required error={errors.municipality}>
                                            <select
                                                required
                                                value={form.municipality}
                                                onChange={(e) => updateField("municipality", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select municipality</option>
                                                {municipalityList.map((item) => (
                                                    <option
                                                        key={item.value}
                                                        value={item.value}
                                                    >
                                                        {item.label}
                                                    </option>
                                                ))}
                                                {form.municipality &&
                                                    !municipalityList.some(
                                                        (item) => item.value === form.municipality
                                                    ) && (
                                                        <option value={form.municipality}>
                                                            {form.municipality} (existing assignment)
                                                        </option>
                                                    )}
                                            </select>
                                            {municipalityList.length === 0 && (
                                                <p className="mt-1.5 text-[11px] text-amber-600">
                                                    No municipalities were supplied by the controller.
                                                </p>
                                            )}
                                        </FormField>

                                        <FormField label="District" required error={errors.district}>
                                            <select
                                                required
                                                value={form.district}
                                                onChange={(e) => updateField("district", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select district</option>
                                                {districtList.map((district) => (
                                                    <option key={district} value={district}>
                                                        {district}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                                            <FaBuilding className="mt-0.5 shrink-0 text-blue-500" />
                                            <p className="text-xs leading-5 text-blue-800">
                                                LGU and municipality are separate
                                                values. Selecting a municipality
                                                does not automatically change the
                                                selected LGU number.
                                            </p>
                                        </div>
                                    </div>
                                </FormSection>

                                {/* 03 Roles */}
                                <FormSection
                                    number="03"
                                    title="System Roles & Permissions"
                                    description="Select every role that applies. Multiple selections are allowed."
                                    icon={<FaShieldAlt />}
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-500">
                                            Available roles
                                        </p>
                                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                                            {form.roles.length} selected
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {ROLE_OPTIONS.map((role) => {
                                            const selected = form.roles.includes(role);

                                            const descriptions = {
                                                lgu: "Local Government Unit access",
                                                MPDOs: "Municipal Planning and Development Office",
                                                dswd: "Department of Social Welfare and Development",
                                                admin: "System administration access",
                                            };

                                            return (
                                                <label
                                                    key={role}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                                                        selected
                                                            ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-500/10"
                                                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => toggleRole(role)}
                                                        className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-sm font-extrabold text-slate-800">
                                                                {role === "MPDOs" ? "MPDOs" : role.toUpperCase()}
                                                            </span>
                                                            {selected && (
                                                                <FaCheckCircle className="shrink-0 text-emerald-600" />
                                                            )}
                                                        </div>
                                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                                            {descriptions[role]}
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {form.roles.length > 0 && (
                                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                Selected roles
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {form.roles.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${roleClass(role)}`}
                                                    >
                                                        {role.toUpperCase()}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRole(role)}
                                                            className="opacity-70 hover:opacity-100"
                                                            aria-label={`Remove ${role} role`}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {errors.roles && (
                                        <p className="mt-2 text-xs font-medium text-rose-600">
                                            {errors.roles}
                                        </p>
                                    )}

                                    {Object.keys(errors)
                                        .filter((key) => key.startsWith("roles."))
                                        .map((key) => (
                                            <p key={key} className="mt-2 text-xs text-rose-600">
                                                {errors[key]}
                                            </p>
                                        ))}
                                </FormSection>

                                {/* 04 Account Settings */}
                                <FormSection
                                    number="04"
                                    title="Account Settings"
                                    description="Set the account status and login password."
                                    icon={<FaLock />}
                                >
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField label="Account Status" required error={errors.status}>
                                            <select
                                                required
                                                value={form.status}
                                                onChange={(e) => updateField("status", e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                                <option value="Pending">Pending</option>
                                            </select>
                                        </FormField>

                                        <div className="hidden sm:block" />

                                        <FormField
                                            label={editingUser ? "New Password" : "Password"}
                                            required={!editingUser}
                                            error={errors.password}
                                        >
                                            <div className="relative">
                                                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                                <input
                                                    required={!editingUser}
                                                    type="password"
                                                    minLength={8}
                                                    autoComplete="new-password"
                                                    value={form.password}
                                                    onChange={(e) => updateField("password", e.target.value)}
                                                    placeholder={editingUser ? "Leave blank to keep current password" : "At least 8 characters"}
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </FormField>

                                        <FormField
                                            label="Confirm Password"
                                            required={!editingUser || Boolean(form.password)}
                                            error={errors.password_confirmation}
                                        >
                                            <div className="relative">
                                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                                                <input
                                                    required={!editingUser || Boolean(form.password)}
                                                    type="password"
                                                    autoComplete="new-password"
                                                    value={form.password_confirmation}
                                                    onChange={(e) => updateField("password_confirmation", e.target.value)}
                                                    placeholder="Re-enter password"
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </FormField>
                                    </div>

                                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                                        <FaLock className="mt-0.5 shrink-0 text-blue-500" />
                                        <p className="text-xs leading-5 text-blue-800">
                                            Laravel must hash passwords before
                                            storing them. Never store plain-text
                                            passwords in the database.
                                        </p>
                                    </div>
                                </FormSection>

                                {errors.general && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                                        {errors.general}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={processing}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? (
                                        <FaSyncAlt className="animate-spin" />
                                    ) : (
                                        <FaSave />
                                    )}
                                    {processing
                                        ? "Saving..."
                                        : editingUser
                                          ? "Save Changes"
                                          : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* USER DETAILS MODAL */}
            {showDetails && selectedUser && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowDetails(false);
                        }
                    }}
                >
                    <div className="my-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="relative bg-slate-950 p-7">
                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/10"
                                aria-label="Close details"
                            >
                                <FaTimes />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <Avatar name={getFullName(selectedUser)} large />
                                <h2 className="mt-4 text-xl font-black text-white">
                                    {getFullName(selectedUser)}
                                </h2>
                                <p className="mt-2 break-all text-sm text-slate-400">
                                    {selectedUser.email}
                                </p>
                                <span className={`mt-4 rounded-full px-3 py-1.5 text-[10px] font-extrabold ${statusClass(getStatus(selectedUser))}`}>
                                    {getStatus(selectedUser)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 p-6">
                            <DetailRow
                                icon={<FaPhone />}
                                label="Contact Number"
                                value={selectedUser.contact_number || "—"}
                            />
                            <DetailRow
                                icon={<FaVenusMars />}
                                label="Gender"
                                value={selectedUser.gender || "—"}
                            />
                            <DetailRow
                                icon={<FaMapMarkerAlt />}
                                label="Address"
                                value={selectedUser.address || "—"}
                            />
                            <DetailRow
                                icon={<FaBuilding />}
                                label="LGU Number"
                                value={selectedUser.lgu || "—"}
                            />
                            <DetailRow
                                icon={<FaMapMarkedAlt />}
                                label="Municipality"
                                value={getMunicipality(selectedUser) || "—"}
                            />
                            <DetailRow
                                icon={<FaMapMarkerAlt />}
                                label="District"
                                value={selectedUser.district || "—"}
                            />

                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                    Assigned Roles
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {getRoles(selectedUser).length ? (
                                        getRoles(selectedUser).map((role) => (
                                            <span
                                                key={role}
                                                className={`rounded-lg px-3 py-2 text-xs font-bold ${roleClass(role)}`}
                                            >
                                                {role.toUpperCase()}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                            No roles assigned
                                        </span>
                                    )}
                                </div>
                            </div>

                            <DetailRow
                                icon={<FaCalendarAlt />}
                                label="Date Created"
                                value={formatDate(selectedUser.created_at)}
                            />

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(selectedUser)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
                                >
                                    <FaEdit />
                                    Edit User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDetails(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

/* Reusable summary card */
function SummaryCard({
    title,
    value,
    description,
    icon,
    iconClass,
    accent,
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                        {value}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400">{description}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg ${iconClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* Reusable form section */
function FormSection({ number, title, description, icon, children }) {
    return (
        <section>
            <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    {icon}
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold tracking-widest text-emerald-600">
                            SECTION {number}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-800">
                            {title}
                        </h3>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

/* Reusable form field */
function FormField({ label, required = false, error, children }) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>
                {label}
                {required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">
                    {error}
                </p>
            )}
        </div>
    );
}

/* Reusable filter select */
function FilterSelect({ label, value, onChange, options }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* User avatar */
function Avatar({ name, large = false }) {
    const initials =
        String(name || "User")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase() || "U";

    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 font-black text-emerald-700 ring-1 ring-emerald-100 ${
                large ? "h-20 w-20 text-2xl" : "h-11 w-11 text-sm"
            }`}
        >
            {initials}
        </div>
    );
}

/* Action button */
function ActionButton({ title, onClick, className = "", children }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition ${className}`}
        >
            {children}
        </button>
    );
}

/* User assignment row */
function AssignmentRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-600">{icon}</span>
            <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
                <p className="break-words font-semibold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* User details row */
function DetailRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm text-emerald-600 shadow-sm">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-extrabold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}
