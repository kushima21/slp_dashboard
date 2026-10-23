import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaLeaf,
    FaChartLine,
    FaUsers,
    FaShieldAlt,
    FaCheckCircle,
} from 'react-icons/fa';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (event) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign In | SLP Enterprise" />

            <div className="relative min-h-screen overflow-hidden bg-slate-50">
                {/* Background decorations */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-100/60 blur-3xl" />

                <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
                    {/* Left branding panel */}
                    <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-800 via-green-800 to-teal-900 px-6 py-8 text-white sm:px-10 sm:py-10 lg:min-h-screen lg:w-[52%] lg:px-14 lg:py-12 xl:px-20">
                        {/* Decorative circles */}
                        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
                        <div className="pointer-events-none absolute -right-12 top-32 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />
                        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl" />

                        {/* Brand */}
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
                                <FaLeaf className="text-2xl text-emerald-300" />
                            </div>

                            <div>
                                <h1 className="text-lg font-extrabold tracking-wide sm:text-xl">
                                    SLP ENTERPRISE
                                </h1>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200 sm:text-xs">
                                    Sustainable Livelihood Program
                                </p>
                            </div>
                        </div>

                        {/* Main message */}
                        <div className="relative z-10 mx-auto my-12 w-full max-w-xl lg:my-0 lg:py-16">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-4 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-sm sm:text-sm">
                                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                                Enterprise Monitoring & Analytics
                            </div>

                            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl xl:text-6xl">
                                Empowering
                                <span className="mt-1 block text-emerald-300">
                                    communities.
                                </span>
                                Transforming
                                <span className="mt-1 block text-emerald-300">
                                    livelihoods.
                                </span>
                            </h2>

                            <p className="mt-6 max-w-lg text-sm leading-7 text-emerald-50/80 sm:text-base sm:leading-8">
                                Manage livelihood enterprises, monitor
                                participant progress, and turn program data
                                into meaningful insights for better
                                decision-making.
                            </p>

                            {/* Feature highlights */}
                            <div className="mt-9 grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                                        <FaChartLine className="text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">
                                            Data-Driven Insights
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-emerald-50/65">
                                            Track performance and enterprise
                                            progress.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
                                        <FaUsers className="text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">
                                            Community Impact
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-emerald-50/65">
                                            Support individuals and
                                            associations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="relative z-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-emerald-50/60 sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                Sustainable Livelihood Program
                            </p>
                            <p className="flex items-center gap-2">
                                <FaShieldAlt className="text-emerald-300" />
                                Secure account access
                            </p>
                        </div>
                    </section>

                    {/* Right sign-in panel */}
                    <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14 lg:px-10 xl:px-16">
                        <div className="w-full max-w-md">
                            {/* Mobile logo */}
                            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15">
                                    <FaLeaf className="text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-base font-extrabold tracking-wide text-slate-800">
                                        SLP ENTERPRISE
                                    </h1>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Sustainable Livelihood Program
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
                                {/* Heading */}
                                <div className="mb-8">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                        <FaLock className="text-xl" />
                                    </div>

                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                                        Welcome back
                                    </p>

                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                        Sign in to your account
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Enter your account credentials to
                                        access your SLP workspace.
                                    </p>
                                </div>

                                {/* Login form */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email address
                                        </label>

                                        <div
                                            className={`flex items-center rounded-xl border bg-white transition-all duration-200 ${
                                                errors.email
                                                    ? 'border-red-400 ring-4 ring-red-50'
                                                    : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50'
                                            }`}
                                        >
                                            <span className="pl-4 text-slate-400">
                                                <FaEnvelope />
                                            </span>

                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="you@example.com"
                                                autoComplete="username"
                                                required
                                                autoFocus
                                                className="w-full rounded-xl border-0 bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-2 text-xs font-medium text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor="password"
                                                className="block text-sm font-semibold text-slate-700"
                                            >
                                                Password
                                            </label>
                                        </div>

                                        <div
                                            className={`flex items-center rounded-xl border bg-white transition-all duration-200 ${
                                                errors.password
                                                    ? 'border-red-400 ring-4 ring-red-50'
                                                    : 'border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50'
                                            }`}
                                        >
                                            <span className="pl-4 text-slate-400">
                                                <FaLock />
                                            </span>

                                            <input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                id="password"
                                                name="password"
                                                value={data.password}
                                                onChange={(event) =>
                                                    setData(
                                                        'password',
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                required
                                                className="w-full rounded-xl border-0 bg-transparent px-3 py-3.5 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                                className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                {showPassword ? (
                                                    <FaEyeSlash />
                                                ) : (
                                                    <FaEye />
                                                )}
                                            </button>
                                        </div>

                                        {errors.password && (
                                            <p className="mt-2 text-xs font-medium text-red-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Remember me */}
                                    <div className="flex items-center justify-between gap-3">
                                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(event) =>
                                                    setData(
                                                        'remember',
                                                        event.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            Remember me
                                        </label>
                                    </div>

                                    {/* General login error */}
                                    {errors.email && !errors.password && (
                                        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                                            <span className="mt-0.5">
                                                <FaShieldAlt />
                                            </span>
                                            <p>
                                                Please check your credentials
                                                and try again.
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/20 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign In
                                                <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Security note */}
                                <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                                    <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />
                                    <p className="text-xs leading-5 text-slate-500">
                                        Your account is protected. Please keep
                                        your login credentials confidential
                                        and sign out when using a shared device.
                                    </p>
                                </div>
                            </div>

                            {/* Bottom text */}
                            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                                © {new Date().getFullYear()} Sustainable
                                Livelihood Program. All rights reserved.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}