
import { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";

import {
    FaThLarge,
    FaUsers,
    FaClipboardList,
    FaChartPie,
    FaMapMarkerAlt,
    FaUserCog,
    FaUser,
    FaSignOutAlt,
    FaChevronDown,
    FaBuilding,
    FaChartLine,
    FaBriefcase,
    FaShieldAlt,
} from "react-icons/fa";

export default function Layout({ children }) {
    const { url, props } = usePage();

    const user = props.auth?.user;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --------------------------------------------------
    // USER INFORMATION
    // --------------------------------------------------

    const fullName =
        [
            user?.firstname,
            user?.middlename,
            user?.lastname,
        ]
            .filter((part) => String(part ?? "").trim() !== "")
            .join(" ") ||
        user?.name ||
        "User";

    const userEmail = user?.email || "No email available";

    const initials =
        fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("") || "U";

    // --------------------------------------------------
    // NORMALIZE USER ROLES
    // Supports arrays, JSON strings, and plain strings.
    // --------------------------------------------------

    const normalizedRoles = (() => {
        const roles = user?.roles ?? [];

        const normalize = (items) =>
            items
                .map((role) =>
                    String(
                        typeof role === "object" && role !== null
                            ? role.name ?? ""
                            : role
                    )
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean);

        if (Array.isArray(roles)) {
            return normalize(roles);
        }

        if (typeof roles === "string") {
            try {
                const parsed = JSON.parse(roles);

                if (Array.isArray(parsed)) {
                    return normalize(parsed);
                }

                if (typeof parsed === "string") {
                    return parsed
                        .split(",")
                        .map((role) => role.trim().toLowerCase())
                        .filter(Boolean);
                }
            } catch {
                // Handle plain text role values.
            }

            return roles
                .split(",")
                .map((role) => role.trim().toLowerCase())
                .filter(Boolean);
        }

        return [];
    })();

    const isAdmin = normalizedRoles.includes("admin");
    const isLguUser = normalizedRoles.includes("lgu");

    const userRole = normalizedRoles
        .map((role) => {
            if (role === "mpdos") return "MPDOs";
            return role.toUpperCase();
        })
        .join(", ");

    // --------------------------------------------------
    // NAVIGATION HELPERS
    // --------------------------------------------------

    const isActive = (path) => {
        const currentPath =
            url.split("?")[0].replace(/\/+$/, "") || "/";

        const targetPath =
            path.replace(/\/+$/, "") || "/";

        return (
            currentPath === targetPath ||
            currentPath.startsWith(`${targetPath}/`)
        );
    };

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Close dropdown after navigation.
    useEffect(() => {
        setIsProfileOpen(false);
    }, [url]);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">

            {/* ================================================== */}
            {/* SIDEBAR */}
            {/* ================================================== */}

            <aside className="relative z-20 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">

                {/* Brand Header */}
                <div className="relative overflow-hidden border-b border-slate-100 bg-white px-5 py-5">
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-50/80 blur-2xl" />

                    <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-emerald-700/20">
                            SLP
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                                SLP Dashboard
                            </h1>

                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Management Portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current User Summary */}
                <div className="mx-3 mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">
                                {fullName}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-500">
                                {userRole || "Authorized User"}
                            </p>
                        </div>

                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                                user?.status?.toLowerCase() === "inactive"
                                    ? "bg-rose-500"
                                    : "bg-emerald-500"
                            }`}
                            title={
                                user?.status?.toLowerCase() === "inactive"
                                    ? "Inactive"
                                    : "Active"
                            }
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">

                    {/* OVERVIEW: ALL ROLES */}
                    <NavSection title="Overview">
                        <NavItem
                            href="/dashboard"
                            icon={FaThLarge}
                            active={isActive("/dashboard")}
                        >
                            Dashboard
                        </NavItem>

                        <NavItem
                            href="/summary"
                            icon={FaChartPie}
                            active={isActive("/summary")}
                        >
                            Summary
                        </NavItem>
                    </NavSection>

                    {/* MONITORING: ADMIN, DSWD, MPDOS */}
                    {!isLguUser && (
                        <>
                            <NavSection title="Program Monitoring">
                                <NavItem
                                    href="/slp-monitoring"
                                    icon={FaUsers}
                                    active={isActive("/slp-monitoring")}
                                >
                                    SLPA / Participant Monitoring
                                </NavItem>

                                <NavItem
                                    href="/slp-beneficiaries"
                                    icon={FaClipboardList}
                                    active={isActive("/slp-beneficiaries")}
                                >
                                    SLP Beneficiaries
                                </NavItem>
                            </NavSection>

                            <NavSection title="Reports & Analytics">
                                <NavItem
                                    href="/analytics"
                                    icon={FaChartLine}
                                    active={isActive("/analytics")}
                                >
                                    Analytics Dashboard
                                </NavItem>
                            </NavSection>
                        </>
                    )}

                    {/* ADMIN ONLY */}
                    {isAdmin && (
                        <>
                            <div className="mx-2 border-t border-slate-100" />

                            <div className="flex items-center gap-2 px-3">
                                <FaShieldAlt className="text-[10px] text-emerald-600" />

                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                                    Administration
                                </span>
                            </div>

                            {/* SLP TRACK / MODALITIES */}
                            <NavSection title="SLP Track / Modalities">
                                <NavItem
                                    href="/track"
                                    icon={FaBriefcase}
                                    active={isActive("/track")}
                                >
                                    Track Management
                                </NavItem>
                            </NavSection>

                            {/* ENTERPRISE MANAGEMENT */}
                            <NavSection title="Enterprise Management">
                                <NavItem
                                    href="/enterprisecategory"
                                    icon={FaBuilding}
                                    active={isActive("/enterprisecategory")}
                                >
                                    Enterprise / Product Categories
                                </NavItem>
                            </NavSection>

                            {/* LOCATION MANAGEMENT */}
                            <NavSection title="Location Management">
                                <NavItem
                                    href="/municipality"
                                    icon={FaBuilding}
                                    active={isActive("/municipality")}
                                >
                                    Municipalities
                                </NavItem>

                                <NavItem
                                    href="/barangay"
                                    icon={FaMapMarkerAlt}
                                    active={isActive("/barangay")}
                                >
                                    Barangays
                                </NavItem>
                            </NavSection>

                            {/* USERS MANAGEMENT */}
                            <NavSection title="Users Management">
                                <NavItem
                                    href="/users"
                                    icon={FaUserCog}
                                    active={isActive("/users")}
                                >
                                    User Accounts
                                </NavItem>
                            </NavSection>
                        </>
                    )}
                </nav>

                {/* Sidebar Footer */}
                <div className="border-t border-slate-100 bg-white px-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        <p className="text-[10px] font-medium text-slate-500">
                            SLP Management Portal
                        </p>
                    </div>

                    <p className="mt-1 pl-3.5 text-[9px] text-slate-400">
                        Authorized access only
                    </p>
                </div>
            </aside>

            {/* ================================================== */}
            {/* MAIN CONTENT */}
            {/* ================================================== */}

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                {/* TOP HEADER */}
                <header className="relative z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="hidden h-5 w-1 rounded-full bg-emerald-500 sm:block" />

                            <h2 className="truncate text-sm font-bold tracking-tight text-slate-800 sm:text-base">
                                {getPageTitle(url)}
                            </h2>
                        </div>

                        <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">
                            Sustainable Livelihood Program
                        </p>
                    </div>

                    {/* PROFILE DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() =>
                                setIsProfileOpen((previous) => !previous)
                            }
                            aria-expanded={isProfileOpen}
                            aria-haspopup="true"
                            className="group flex items-center gap-2 rounded-2xl border border-transparent p-1.5 transition hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:gap-3 sm:pl-2"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-bold text-white shadow-sm">
                                {initials}
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="max-w-[180px] truncate text-xs font-bold text-slate-700">
                                    {fullName}
                                </p>

                                <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">
                                    {userEmail}
                                </p>
                            </div>

                            <FaChevronDown
                                className={`mr-1 text-[10px] text-slate-400 transition-transform duration-200 ${
                                    isProfileOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                                {/* Profile Details */}
                                <div className="bg-gradient-to-br from-emerald-50 to-white px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-md shadow-emerald-600/20">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-slate-800">
                                                {fullName}
                                            </p>

                                            <p className="mt-1 truncate text-[11px] text-slate-500">
                                                {userEmail}
                                            </p>
                                        </div>
                                    </div>

                                    {userRole && (
                                        <div className="mt-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                                <FaShieldAlt className="text-[9px]" />
                                                {userRole}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/profile"
                                        onClick={() =>
                                            setIsProfileOpen(false)
                                        }
                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <FaUser />
                                        </span>

                                        <span>Profile Modification</span>
                                    </Link>

                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        type="button"
                                        onClick={() =>
                                            setIsProfileOpen(false)
                                        }
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                                            <FaSignOutAlt />
                                        </span>

                                        <span>Log Out</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Navigation Section
|--------------------------------------------------------------------------
*/
function NavSection({ title, children }) {
    return (
        <section>
            <h3 className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                {title}
            </h3>

            <div className="space-y-1">{children}</div>
        </section>
    );
}

/*
|--------------------------------------------------------------------------
| Navigation Item
|--------------------------------------------------------------------------
*/
function NavItem({ href, icon: Icon, active, children }) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-xs transition-all duration-200 ${
                active
                    ? "bg-emerald-50 font-bold text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
        >
            {active && (
                <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-emerald-600" />
            )}

            <Icon
                className={`ml-0.5 shrink-0 text-sm transition-colors ${
                    active
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-600"
                }`}
            />

            <span className="min-w-0 flex-1 leading-5">
                {children}
            </span>
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| Page Title
|--------------------------------------------------------------------------
*/
function getPageTitle(url) {
    const path = url.split("?")[0].replace(/\/+$/, "") || "/";

    const pageTitles = [
        {
            path: "/individualmonitoring",
            title: "Individual Monitoring",
        },
        {
            path: "/associationmonitoring",
            title: "Association Monitoring",
        },
        {
            path: "/slp-monitoring",
            title: "SLP Monitoring",
        },
        {
            path: "/slp-beneficiaries",
            title: "SLP Beneficiaries",
        },
        {
            path: "/enterprisecategory",
            title: "Enterprise Management",
        },
        {
            path: "/municipality",
            title: "Municipality Management",
        },
        {
            path: "/barangay",
            title: "Barangay Management",
        },
        {
            path: "/dashboard",
            title: "Dashboard",
        },
        {
            path: "/summary",
            title: "SLP Summary Records",
        },
        {
            path: "/individual",
            title: "Individual Beneficiaries",
        },
        {
            path: "/association",
            title: "Association Beneficiaries",
        },
        {
            path: "/track",
            title: "SLP Track / Modalities",
        },
        {
            path: "/analytics",
            title: "Analytics Dashboard",
        },
        {
            path: "/reports",
            title: "Reports",
        },
        {
            path: "/users",
            title: "Users Management",
        },
        {
            path: "/profile",
            title: "Profile Modification",
        },
    ];

    const matchedPage = pageTitles
        .sort((a, b) => b.path.length - a.path.length)
        .find(
            (page) =>
                path === page.path ||
                path.startsWith(`${page.path}/`)
        );

    return matchedPage?.title || "SLP Management Portal";
}
