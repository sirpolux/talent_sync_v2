import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  MonitorCog,
  Users,
  X,
} from "lucide-react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const s = String(nameOrEmail).trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export default function AdminLayout({
  headerTitle = "Admin",
  tabName = "",
  openedMenu = "overview",
  activeSubmenu = null,
  children,
}) {
  const { auth } = usePage().props;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(openedMenu);

  const toggleSubmenu = (key) => {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  const menuItems = useMemo(
    () => [
      {
        key: "overview",
        icon: <Home className="w-5 h-5" />,
        label: "Overview",
        href: "admin.dashboard",
      },
      {
        key: "company",
        icon: <BriefcaseBusiness className="w-5 h-5" />,
        label: "Company",
        children: [
          {
            key: "company.overview",
            label: "Overview",
            href: "admin.company.show",
          },
          {
            key: "company.profile",
            label: "Edit Profile",
            href: "admin.company.edit",
          },
        ],
      },
      {
        key: "account",
        icon: <MonitorCog className="w-5 h-5" />,
        label: "Account",
        children: [
          { key: "profile", label: "Manage Profile", href: "profile.edit" },
          { key: "password", label: "Change Password", href: "admin.account.password" },
        ],
      },
      {
        key: "org",
        icon: <Users className="w-5 h-5" />,
        label: "Organization",
        children: [
          {
            key: "org.departments",
            label: "Departments",
            href: "admin.departments.index",
          },
        ],
      },
    ],
    []
  );

  const displayName = auth?.user?.name || auth?.user?.email;
  const initials = getInitials(displayName);

  return (
    <div>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-emerald-50 overflow-hidden font-sans relative">
        {sidebarOpen && (
          <>
            {/* Background Overlay (mobile) */}
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className="fixed md:relative z-40 flex flex-col w-72 h-full bg-white/90 backdrop-blur-md shadow-lg border-r border-white/30">
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <img
                      src="/img/logo.svg"
                      alt="TalentSync"
                      className="w-10 h-auto object-contain"
                    />
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-[#1E3A8A]">
                        TalentSync
                      </div>
                      <div className="text-xs text-gray-500">Admin</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-red-600 md:hidden"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-2 overflow-auto">
                  {menuItems.map((item) => {
                    const hasChildren =
                      Array.isArray(item.children) && item.children.length > 0;
                    const isOpen = openSubmenu === item.key;

                    return (
                      <div key={item.key} className="space-y-1">
                        <div
                          className={cn(
                            "flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer text-gray-700 transition-all",
                            "hover:bg-gradient-to-r hover:from-[#1E3A8A]/6 hover:to-[#059669]/6",
                            openedMenu === item.key &&
                              "bg-gradient-to-r from-[#1E3A8A]/6 to-[#059669]/6"
                          )}
                          onClick={() =>
                            hasChildren ? toggleSubmenu(item.key) : null
                          }
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-[#1E3A8A]">{item.icon}</span>
                            {hasChildren ? (
                              <span className="font-medium">{item.label}</span>
                            ) : (
                              <Link
                                href={route(item.href)}
                                className="font-medium text-sm"
                              >
                                {item.label}
                              </Link>
                            )}
                          </div>

                          {hasChildren && (
                            <button
                              type="button"
                              className="flex items-center text-gray-500"
                              onClick={() => toggleSubmenu(item.key)}
                              aria-expanded={isOpen}
                              aria-label="Toggle submenu"
                            >
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {hasChildren && isOpen && (
                          <motion.div
                            key={`${item.key}-submenu`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-12 pr-3"
                          >
                            <div className="flex flex-col gap-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.key}
                                  href={route(child.href)}
                                  className={cn(
                                    "text-sm px-3 py-2 rounded-md text-gray-600 transition hover:bg-gray-100",
                                    activeSubmenu === child.key &&
                                      "bg-gradient-to-r from-[#1E3A8A]/6 to-[#059669]/6"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <div className="px-6 py-4 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSubmenu(null);
                      setSidebarOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white font-semibold"
                  >
                    Collapse & Focus
                  </button>
                </div>
            </aside>
          </>
        )}

        {/* Content */}
        <div className="flex-1 relative flex flex-col">
          <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="flex flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 transition"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="w-5 h-5 text-[#1E3A8A]" />
                </button>
                {/* {tabName ? <span className="text-gray-500">{tabName}</span> : null} */}
              </div>

              <h2 className="text-lg font-semibold text-[#1E3A8A]">
                {headerTitle}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative p-2 rounded-md hover:bg-gray-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 hover:text-[#1E3A8A]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>

              <Link
                as="button"
                method="post"
                href={route("logout")}
                className="p-2 rounded-md hover:bg-gray-100 transition"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600 transition" />
              </Link>

              <div
                className="w-9 h-9 bg-gradient-to-br from-[#1E3A8A] to-[#059669] text-white flex items-center justify-center rounded-full font-semibold"
                title={displayName}
              >
                {initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative bg-[url('/img/dashboard_bg.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
