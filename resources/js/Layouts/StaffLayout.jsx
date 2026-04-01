import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Target,
  TrendingUp,
  User2,
  X,
} from "lucide-react";

import NotificationBell from "@/Components/NotificationBell";

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

function MenuItemRenderer({
  item,
  openMenus,
  toggleSubmenu,
  ensureOpen,
  ancestors = [],
  level = 0,
  currentUrl,
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isOpen = openMenus.has(item.key);

  const handleLeafItemClick = () => {
    if (!hasChildren && item.href) {
      ensureOpen([...ancestors, item.key]);
    }
  };

  return (
    <div key={item.key} className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer text-gray-700 transition-all",
          level === 0 &&
            "hover:bg-gradient-to-r hover:from-[#1E3A8A]/6 hover:to-[#059669]/6",
          level > 0 && "hover:bg-gray-100",
          level === 0 &&
            openMenus.has(item.key) &&
            "bg-gradient-to-r from-[#1E3A8A]/6 to-[#059669]/6",
        )}
        onClick={() => (hasChildren ? toggleSubmenu(item.key) : null)}
        style={{ paddingLeft: level > 0 ? `${level * 12 + 12}px` : undefined }}
      >
        <div className="flex items-center gap-3 text-sm">
          {level === 0 && item.icon ? (
            <span className="text-[#1E3A8A]">{item.icon}</span>
          ) : null}

          {hasChildren ? (
            <span
              className={cn(
                level > 0 && "text-sm text-gray-600",
                level === 0 && "font-medium",
              )}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={route(item.href)}
              onClick={handleLeafItemClick}
              className={cn(
                level > 0 && "text-sm text-gray-600",
                level === 0 && "font-medium",
                route(item.href) === currentUrl && "text-[#1E3A8A]",
              )}
            >
              {item.label}
            </Link>
          )}
        </div>

        {hasChildren ? (
          <button type="button" className="flex items-center text-gray-500">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : null}
      </div>

      {hasChildren && isOpen ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex flex-col gap-1">
            {item.children.map((child) => (
              <MenuItemRenderer
                key={child.key}
                item={child}
                openMenus={openMenus}
                toggleSubmenu={toggleSubmenu}
                ensureOpen={ensureOpen}
                ancestors={[...ancestors, item.key]}
                level={level + 1}
                currentUrl={currentUrl}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default function StaffLayout({
  headerTitle = "Staff",
  tabName = "",
  openedMenu = "overview",
  children,
}) {
  const { auth } = usePage().props;
  const currentUrl = usePage().url;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState(new Set([openedMenu]));

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const ensureOpen = (keys) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (Array.isArray(keys)) keys.forEach((k) => next.add(k));
      else next.add(keys);
      return next;
    });
  };

  const menuItems = useMemo(
    () => [
      {
        key: "overview",
        icon: <Home className="w-5 h-5" />,
        label: "Overview",
        href: "staff.dashboard",
      },
      {
        key: "training",
        icon: <BookOpen className="w-5 h-5" />,
        label: "Training",
        children: [
          {
            key: "training.sessions",
            label: "Training Sessions",
            href: "staff.training.sessions.index",
          },
          { key: "training.index", label: "My Trainings", href: "staff.training.index" },
          {
            key: "training.available",
            label: "Training Catalog",
            href: "staff.training.available",
          },
          {
            key: "training.requests",
            label: "My Training Requests",
            href: "staff.training.requests",
          },
        ],
      },
      {
        key: "skills",
        icon: <Target className="w-5 h-5" />,
        label: "Skills & Evidence",
        children: [
          {
            key: "skills.index",
            label: "My Skills & Certifications",
            href: "staff.skills.index",
          },
          { key: "skills.upload", label: "Upload Evidence", href: "staff.skills.upload" },
        ],
      },
      {
        key: "career",
        icon: <TrendingUp className="w-5 h-5" />,
        label: "Career & Promotion",
        children: [
          {
            key: "promotions.eligibility",
            label: "Promotion Eligibility",
            href: "staff.promotions.eligibility",
          },
          {
            key: "promotions.index",
            label: "My Promotion Applications",
            href: "staff.promotions.index",
          },
          {
            key: "promotions.create",
            label: "Apply for Promotion",
            href: "staff.promotions.create",
          },
        ],
      },
      {
        key: "leave",
        icon: <User2 className="w-5 h-5" />,
        label: "Leave",
        children: [
          { key: "leave.index", label: "My Leave", href: "staff.leave.index" },
          { key: "leave.create", label: "Apply for Leave", href: "staff.leave.create" },
        ],
      },
      {
        key: "notifications",
        icon: <User2 className="w-5 h-5" />,
        label: "Notifications",
        href: "staff.notifications.index",
      },
      {
        key: "account",
        icon: <User2 className="w-5 h-5" />,
        label: "Account",
        children: [
          {
            key: "account.profile",
            label: "My Profile",
            href: "staff.account.profile",
          },
          {
            key: "account.password",
            label: "Change password",
            href: "staff.account.password",
          },
          { key: "account.org", label: "Switch org", href: "org.select" },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    const findAncestors = (items, ancestors = []) => {
      for (const item of items) {
        if (item.href && route(item.href) === currentUrl) {
          return [...ancestors, item.key];
        }
        if (Array.isArray(item.children)) {
          const found = findAncestors(item.children, [...ancestors, item.key]);
          if (found) return found;
        }
      }
      return null;
    };

    const ancestorKeys = findAncestors(menuItems);
    if (ancestorKeys && ancestorKeys.length > 0) {
      setOpenMenus(new Set(ancestorKeys));
    }
  }, [currentUrl, menuItems]);

  const displayName = auth?.user?.name || auth?.user?.email;
  const initials = getInitials(displayName);

  return (
    <div>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-emerald-50 overflow-hidden font-sans relative">
        {sidebarOpen ? (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <aside className="fixed md:relative z-40 flex flex-col w-72 h-full bg-white/90 backdrop-blur-md shadow-lg border-r border-white/30">
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
                    <div className="text-xs text-gray-500">Staff</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-500 hover:text-red-600 md:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-auto">
                {menuItems.map((item) => (
                  <MenuItemRenderer
                    key={item.key}
                    item={item}
                    openMenus={openMenus}
                    toggleSubmenu={toggleSubmenu}
                    ensureOpen={ensureOpen}
                    level={0}
                    currentUrl={currentUrl}
                  />
                ))}
              </nav>

              <div className="px-6 py-4 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full px-3 py-2 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white font-semibold"
                >
                  Collapse & Focus
                </button>
              </div>
            </aside>
          </>
        ) : null}

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
                {tabName ? <span className="text-gray-500">{tabName}</span> : null}
              </div>

              <h2 className="text-lg font-semibold text-[#1E3A8A]">
                {headerTitle}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell href={route("staff.notifications.index")} label="Notifications" emptyLabel="No staff notifications yet" showDropdown />

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

          <main className="flex-1 overflow-y-scroll h-screen p-4 sm:p-6 relative bg-gray-50 bg-cover bg-center">
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}