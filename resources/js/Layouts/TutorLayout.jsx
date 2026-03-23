import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  PanelLeft,
  Presentation,
  Settings2,
  ShieldCheck,
  FileText,
  FolderKanban,
  UserCog,
  X,
} from "lucide-react";

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

function MenuItemRenderer({ item, openMenus, toggleSubmenu, level = 0 }) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const isOpen = openMenus.has(item.key);

  return (
    <div className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer text-gray-700 transition-all",
          level === 0 && "hover:bg-gradient-to-r hover:from-[#1E3A8A]/6 hover:to-[#059669]/6",
          level > 0 && "hover:bg-gray-100",
          level === 0 && isOpen && "bg-gradient-to-r from-[#1E3A8A]/6 to-[#059669]/6"
        )}
        onClick={() => (hasChildren ? toggleSubmenu(item.key) : null)}
        style={{ paddingLeft: level > 0 ? `${level * 12 + 12}px` : undefined }}
      >
        <div className="flex items-center gap-3 text-sm">
          {level === 0 && <span className="text-[#1E3A8A]">{item.icon}</span>}
          {hasChildren ? (
            <span className={cn(level > 0 && "text-sm text-gray-600", level === 0 && "font-medium")}>
              {item.label}
            </span>
          ) : (
            <Link
              href={route(item.href)}
              className={cn(
                level > 0 && "text-sm text-gray-600",
                level === 0 && "font-medium"
              )}
            >
              {item.label}
            </Link>
          )}
        </div>

        {hasChildren && (
          <button type="button" className="flex items-center text-gray-500">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
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
                level={level + 1}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function TutorLayout({
  headerTitle = "Trainer Dashboard",
  children,
}) {
  const { auth, organization } = usePage().props;
  const currentUrl = usePage().url;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState(new Set(["overview", "training"]));

  const menuItems = useMemo(
    () => [
      {
        key: "overview",
        icon: <LayoutDashboard className="w-5 h-5" />,
        label: "Overview",
        href: "trainer.dashboard",
      },
      {
        key: "skills",
        icon: <GraduationCap className="w-5 h-5" />,
        label: "Skills & Certifications",
        href: "trainer.skills.index",
      },
      {
        key: "training",
        icon: <BookOpen className="w-5 h-5" />,
        label: "Training",
        children: [
          { key: "training.requests", label: "Requests", href: "trainer.requests.index" },
          { key: "training.sessions", label: "Sessions", href: "trainer.sessions.index" },
          { key: "training.progress", label: "Progress", href: "trainer.progress.index" },
          { key: "training.assessments", label: "Assessments", href: "trainer.assessments.index" },
        ],
      },
      {
        key: "messages",
        icon: <MessageSquare className="w-5 h-5" />,
        label: "Messages",
        href: "trainer.messages.index",
      },
      {
        key: "notifications",
        icon: <Bell className="w-5 h-5" />,
        label: "Notifications",
        href: "trainer.notifications.index",
      },
      {
        key: "settings",
        icon: <Settings2 className="w-5 h-5" />,
        label: "Settings",
        children: [
          { key: "settings.profile", label: "Profile", href: "profile.edit" },
        ],
      },
    ],
    []
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

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const displayName = auth?.user?.name || auth?.user?.email;
  const initials = getInitials(displayName);
  const currentOrganizationName =
    organization?.current?.name ||
    organization?.current?.company_name ||
    organization?.current?.organization_name ||
    "No active organization";

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-emerald-50 overflow-hidden font-sans relative">
      {sidebarOpen && (
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
                  <div className="text-xs text-gray-500">Trainer</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {currentOrganizationName}
                  </div>
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
                  level={0}
                />
              ))}
            </nav>

            <div className="px-6 py-4 border-t border-gray-200/50">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Multi-organization aware
              </div>
              <button
                type="button"
                className="w-full px-3 py-2 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white font-semibold"
                onClick={() => setSidebarOpen(false)}
              >
                Collapse & Focus
              </button>
            </div>
          </aside>
        </>
      )}

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
                <PanelLeft className="w-5 h-5 text-[#1E3A8A]" />
              </button>
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
  );
}
