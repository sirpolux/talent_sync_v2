import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, usePage } from "@inertiajs/react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  MonitorCog,
  Users,
  X,
  Target,
  TrendingUp,
  BookOpen,
  BarChart3,
  User2,
  CalendarRange,
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

// Recursive menu item renderer for nested menus
function MenuItemRenderer({
  item,
  openMenus,
  toggleSubmenu,
  activeSubmenu,
  ensureOpen,
  ancestors = [],
  level = 0,
}) {
  const hasChildren =
    Array.isArray(item.children) && item.children.length > 0;
  const isOpen = openMenus.has(item.key);

  const handleLeafItemClick = () => {
    // Ensure this item and all ancestors stay open when navigating to a leaf item
    if (!hasChildren && item.href) {
      ensureOpen([...ancestors, item.key]);
    }
  };

  return (
    <div key={item.key} className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer text-gray-700 transition-all",
          level === 0 && "hover:bg-gradient-to-r hover:from-[#1E3A8A]/6 hover:to-[#059669]/6",
          level > 0 && "hover:bg-gray-100",
          level === 0 && openMenus.has(item.key) && "bg-gradient-to-r from-[#1E3A8A]/6 to-[#059669]/6"
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
              onClick={handleLeafItemClick}
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
                activeSubmenu={activeSubmenu}
                ensureOpen={ensureOpen}
                ancestors={[...ancestors, item.key]}
                level={level + 1}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AdminLayout({
  headerTitle = "Admin",
  tabName = "",
  openedMenu = "overview",
  activeSubmenu = null,
  children,
}) {
  const { auth, url } = usePage().props;
  const currentUrl = usePage().url;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Helper to find ancestor menu keys for a given route name
  const findMenuAncestors = useCallback((items, targetRoute, ancestors = []) => {
    for (const item of items) {
      if (item.href && route(item.href) === currentUrl) {
        return [...ancestors, item.key];
      }
      if (Array.isArray(item.children)) {
        const found = findMenuAncestors(item.children, targetRoute, [...ancestors, item.key]);
        if (found) return found;
      }
    }
    return null;
  }, [currentUrl]);

  // Initialize open menus based on current route
  const getInitialOpenMenus = useCallback(() => {
    // Try to find which menus should be open based on current URL
    // We'll call this after menuItems is created
    return new Set([openedMenu]);
  }, [openedMenu]);

  const [openMenus, setOpenMenus] = useState(getInitialOpenMenus());

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const ensureOpen = (keys) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (Array.isArray(keys)) {
        keys.forEach(key => newSet.add(key));
      } else {
        newSet.add(keys);
      }
      return newSet;
    });
  };

  const menuItems = useMemo(
    () => [
      // ============================================
      // OVERVIEW & QUICK ACCESS
      // ============================================
      {
        key: "overview",
        icon: <Home className="w-5 h-5" />,
        label: "Overview",
        href: "admin.dashboard",
      },

      // ============================================
      // ORGANIZATION SETUP
      // ============================================
      {
        key: "setup",
        icon: <MonitorCog className="w-5 h-5" />,
        label: "Setup",
        children: [
          {
            key: "setup.company",
            label: "Company Profile",
            href: "admin.company.show",
          },
          {
            key: "setup.structure",
            label: "Organization Structure",
            children: [
              { key: "setup.departments", label: "Departments", href: "admin.departments.index" },
              { key: "setup.positions", label: "Positions", href: "admin.positions.index" },
              // { key: "setup.roles", label: "Roles", href: "admin.roles.index" },
            ],
          },
          {
            key: "setup.admins",
            label: "Admins & Permissions",
            href: "admin.admins.index",
          },
        ],
      },

      // ============================================
      // STAFF MANAGEMENT
      // ============================================
      {
        key: "staff",
        icon: <Users className="w-5 h-5" />,
        label: "Staff Management",
        children: [
          {
            key: "staff.employees",
            label: "Employees",
            href: "admin.employees.index",
          },
          {
            key: "staff.add",
            label: "Add Employee",
            href: "admin.employees.create",
          },
          {
            key: "staff.assignments",
            label: "Position Assignments",
            href: "admin.staff.assignments.index",
          },
          {
            key: "staff.leave",
            label: "Leave",
            children: [
              {
                key: "staff.leave.index",
                label: "Leave Requests",
                href: "admin.leave-requests.index",
              },
              // {
              //   key: "staff.leave.review",
              //   label: "Review Leave",
              //   href: "admin.leave-requests.show",
              // },
            ],
          },
        ],
      },

      // ============================================
      // TALENT DEVELOPMENT
      // ============================================
      {
        key: "talent",
        icon: <Target className="w-5 h-5" />,
        label: "Talent Development",
        children: [
          {
            key: "talent.skills",
            label: "Skills",
            href: "admin.skills.index",
          },
          {
            key: "talent.competencies",
            label: "Competency Mapping",
            href: "admin.competencies.index",
          },
          {
            key: "talent.grading",
            label: "Grading Systems",
            href: "admin.grading.index",
          },
          {
            key: "talent.assessments",
            label: "Assessments",
            href: "admin.assessments.index",
          },
        ],
      },

      // ============================================
      // CAREER MANAGEMENT
      // ============================================
      {
        key: "careers",
        icon: <TrendingUp className="w-5 h-5" />,
        label: "Career Management",
        children: [
          {
            key: "careers.paths",
            label: "Career Paths",
            href: "admin.career-paths.index",
          },
          {
            key: "careers.hierarchies",
            label: "Position Hierarchies",
            href: "admin.hierarchies.index",
          },
          {
            key: "careers.promotions",
            label: "Promotions",
            children: [
              {
                key: "careers.promotions.eligible",
                label: "Eligible Candidates",
                href: "admin.promotions.eligible",
              },
              {
                key: "careers.promotions.pending",
                label: "Pending Approvals",
                href: "admin.promotions.pending",
              },
              {
                key: "careers.promotions.history",
                label: "History",
                href: "admin.promotions.history",
              },
            ],
          },
          {
            key: "careers.gap",
            label: "Skills Gap Analysis",
            href: "admin.skills-gap.index",
          },
        ],
      },

      // ============================================
      // TRAINING & DEVELOPMENT
      // ============================================
      {
        key: "training",
        icon: <BookOpen className="w-5 h-5" />,
        label: "Training & Development",
        children: [
          {
            key: "training.programs",
            label: "Training Programs",
            href: "admin.training.programs.index",
          },
          {
            key: "training.requests",
            label: "Training Requests",
            children: [
              {
                key: "training.requests.pending",
                label: "Pending",
                href: "admin.training.requests.pending",
              },
              {
                key: "training.requests.all",
                label: "All Requests",
                href: "admin.training.requests.index",
              },
            ],
          },
          {
            key: "training.tutors",
            label: "Trainers/Tutors",
            href: "admin.trainers.index",
          },
        ],
      },

      // ============================================
      // REPORTING & ANALYTICS
      // ============================================
      {
        key: "reporting",
        icon: <BarChart3 className="w-5 h-5" />,
        label: "Reporting & Analytics",
        children: [
          {
            key: "reporting.dashboards",
            label: "Dashboards",
            href: "admin.reporting.dashboard",
          },
          {
            key: "reporting.promotions",
            label: "Promotion Analytics",
            href: "admin.reporting.promotions",
          },
          {
            key: "reporting.skills",
            label: "Skills Analytics",
            href: "admin.reporting.skills",
          },
          {
            key: "reporting.staff",
            label: "Staff Analysis",
            href: "admin.reporting.staff",
          },
          {
            key: "reporting.exports",
            label: "Reports & Exports",
            href: "admin.reporting.exports",
          },
        ],
      },

      // ============================================
      // ACCOUNT & SETTINGS
      // ============================================
      {
        key: "account",
        icon: <User2 className="w-5 h-5" />,
        label: "Account",
        children: [
          { key: "account.profile", label: "My Profile", href: "profile.edit" },
          { key: "account.security", label: "Security", href: "admin.account.password" },
          {
            key: "account.settings",
            label: "Settings",
            href: "admin.settings.index",
          },
        ],
      },
    ],
    []
  );

  // Update open menus when the current route changes
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
                  {menuItems.map((item) => (
                    <MenuItemRenderer
                      key={item.key}
                      item={item}
                      openMenus={openMenus}
                      toggleSubmenu={toggleSubmenu}
                      activeSubmenu={activeSubmenu}
                      ensureOpen={ensureOpen}
                      level={0}
                    />
                  ))}
                </nav>

                <div className="px-6 py-4 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={() => {
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

          {/* <main className="flex-1 overflow-y-scroll h-screen p-4 sm:p-6 relative bg-[url('/img/talent_sync_hero_img.sv')] bg-cover bg-center"> */}
          <main className="flex-1 overflow-y-scroll h-screen p-4 sm:p-6 relative bg-gray-50 bg-cover bg-center">
           
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm"></div>
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
