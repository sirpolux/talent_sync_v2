import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Menu,
    X,
    Home,
    LayoutGrid,
    Briefcase,
    Info,
    LogIn,
    LayoutDashboard,
    LogOut,
    UserPlus
} from "lucide-react";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const { auth } = usePage().props;
    const user = auth?.user;

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Features", href: "/features", icon: LayoutGrid },
        { name: "Solutions", href: "/solutions", icon: Briefcase },
        { name: "About", href: "/about", icon: Info },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">

            <div className="max-w-7xl mx-auto px-6">

                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <img src="/images/logo.svg" className="h-8" />
                        TalentSync
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">

                        {navLinks.map((link, index) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}

                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">

                        {!user && (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                                >
                                    <LogIn size={18} />
                                    Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    <UserPlus size={18} />
                                    Get Started
                                </Link>
                            </>
                        )}

                        {user && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>

                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </Link>
                            </>
                        )}

                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X size={24} /> : <Menu size={24} />}
                    </button>

                </div>

            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden border-t bg-white">

                    <div className="px-6 py-4 space-y-4">

                        {navLinks.map((link, index) => {
                            const Icon = link.icon;

                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 text-gray-700"
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}

                        <div className="pt-4 border-t space-y-4">

                            {!user && (
                                <>
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-3 text-gray-700"
                                    >
                                        <LogIn size={18} />
                                        Login
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="flex items-center gap-3 text-indigo-600"
                                    >
                                        <UserPlus size={18} />
                                        Get Started
                                    </Link>
                                </>
                            )}

                            {user && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 text-gray-700"
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>

                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-3 text-red-600"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </Link>
                                </>
                            )}

                        </div>

                    </div>

                </div>
            )}
        </header>
    );
}