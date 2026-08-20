import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    FaThLarge,
    FaUsers,
    FaClipboardList,
    FaChartPie,
    FaFileAlt,
    FaMapMarkerAlt,
    FaUserCog,
    FaUser,
    FaSignOutAlt,
    FaChevronDown,
    FaStore,
    FaBuilding
} from 'react-icons/fa';

export default function Layout({ children, auth }) {
    const { url } = usePage();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close profile dropdown when clicking anywhere outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check active nav route
    const isActive = (path) => url === path || url.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased">

            {/* Modern Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col z-20 shadow-xs">

                {/* Logo & Brand Header */}
                <div className="h-[50px] flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                            SLP
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 leading-tight">
                                Dashboard
                            </h1>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                                Management Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            Overview
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/dashboard" icon={FaThLarge} active={isActive('/Dashboard')}>
                                Dashboard
                            </NavItem>
                            <NavItem href="/summary" icon={FaThLarge} active={isActive('/Summary')}>
                                Summary
                            </NavItem>
                        </div>
                    </div>
                    {/* Section: SLP Monitoring */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            SLP Monitoring
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/dashboard" icon={FaThLarge} active={isActive('/Dashboard')}>
                                Individual Monitoring
                            </NavItem>
                            <NavItem href="/summary" icon={FaThLarge} active={isActive('/Summary')}>
                                Association Monitoring
                            </NavItem>
                        </div>
                    </div>
                    {/* Section: SLP Modalities */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            SLP Beneficiaries
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/individual" icon={FaThLarge} active={isActive('/individual')}>
                                Individual
                            </NavItem>
                            <NavItem href="/association" icon={FaClipboardList} active={isActive('/association')}>
                                Association
                            </NavItem>
                        </div>
                    </div>

                    {/* Section: SLP Track */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            SLP Track / Modalities
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/track" icon={FaUsers} active={isActive('/track')}>
                                Track
                            </NavItem>
                        </div>
                    </div>

                    {/* Section: Analytics */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            Analytics
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/analytics" icon={FaChartPie} active={isActive('/analytics')}>
                                Analytics Dashboard
                            </NavItem>
                            <NavItem href="/reports" icon={FaFileAlt} active={isActive('/reports')}>
                                Reports
                            </NavItem>
                        </div>
                    </div>

                    {/* Section: Location Management */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            Location Management
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/municipality" icon={FaBuilding} active={isActive('/municipality')}>
                                Municipality
                            </NavItem>
                            <NavItem href="/barangay" icon={FaMapMarkerAlt} active={isActive('/barangay')}>
                                Barangay
                            </NavItem>
                        </div>
                    </div>

                    {/* Section: Users Management */}
                    <div>
                        <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2">
                            Users Management
                        </span>
                        <div className="space-y-1">
                            <NavItem href="/users" icon={FaUserCog} active={isActive('/users')}>
                                Users
                            </NavItem>
                        </div>
                    </div>

                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-[50px] bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10">
                    <h2 className="text-slate-800 font-semibold text-base">
                        Dashboard
                    </h2>

                    {/* Profile Dropdown Container */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                                {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="hidden sm:block text-left pr-1">
                                <p className="text-xs font-semibold text-slate-700 leading-tight">
                                    {auth?.user?.name || 'User Profile'}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-tight">
                                    {auth?.user?.email || 'user@example.com'}
                                </p>
                            </div>
                            <FaChevronDown className={`text-slate-400 text-xs transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu Popup */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                                
                                {/* User Info Header */}
                                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                    <p className="text-xs font-semibold text-slate-800 truncate">
                                        {auth?.user?.name || 'User Profile'}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {auth?.user?.email || 'user@example.com'}
                                    </p>
                                </div>

                                {/* Link: Profile Settings */}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <FaUser className="text-slate-400 text-xs" />
                                    <span>Profile Modification</span>
                                </Link>

                                <div className="my-1 border-t border-slate-100" />

                                {/* Link: Logout */}
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50/50 transition text-left cursor-pointer"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <FaSignOutAlt className="text-rose-500 text-xs" />
                                    <span>Log Out</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Body */}
                <main className="flex-1 p-2 overflow-y-auto bg-white">
                    {children}
                </main>

            </div>
        </div>
    );
}

// Reusable Navigation Link Component
function NavItem({ href, icon: Icon, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                active
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
        >
            <Icon className={`text-sm ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{children}</span>
        </Link>
    );
}