import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <div className="relative h-full w-full flex items-center justify-center min-h-screen bg-white py-4">
                <div className="w-[30%] h-max px-2 py-4 shadow-lg border rounded-lg ">
                    <h2 className="font-bold text-lg">Sign in SLP Account</h2>
                    <p className="text-sm">Welcome comeback to Sustainabe Livelihood Program.</p>
                    <hr className="border-0 border-t-2 border-dashed border-gray-200 my-4" />
                    <div>
                        <form method="POST" action="/login">
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-bold">Email</label>
                                <input type="email" name="email" id="email" placeholder="Email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-bold">Password</label>
                                <input type="password" name="password" placeholder='Password' id="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-2 px-4 text-xs font-medium rounded-md shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}