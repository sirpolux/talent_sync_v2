import StaffLayout from "@/Layouts/StaffLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link } from "@inertiajs/react";
import { CalendarDays, Search, Filter, ArrowRight, Layers3, Clock3, FileText } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "paused", label: "Paused" },
];

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusStyles(status) {
  const value = String(status || "scheduled").toLowerCase();

  const map = {
    scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return map[value] || "bg-slate-50 text-slate-700 border-slate-200";
}

function StatusPill({ status }) {
  const value = String(status || "scheduled").toLowerCase();

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(value)}`}>
      {value}
    </span>
  );
}

function SessionCard({ session }) {
  const title = session?.title ?? session?.name ?? "Training Session";
  const skillName = session?.skill?.name ?? session?.skill_name ?? "Skill";
  const description = session?.description ?? session?.overview ?? "No session description provided.";
  const startDate = session?.start_date ?? session?.starts_at;
  const endDate = session?.end_date ?? session?.ends_at;
  const status = String(session?.status || "scheduled").toLowerCase();
  const isScheduled = status === "scheduled";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <StatusPill status={status} />
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <Layers3 className="h-4 w-4" />
              {skillName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(startDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <Clock3 className="h-4 w-4" />
              {formatDate(endDate)}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>

          <div className="text-sm text-slate-500">
            {session?.created_at ? (
              <>
                Created {formatDateTime(session.created_at)}
              </>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-stretch">
          <Link
            href={route("staff.training.sessions.apply", session.id)}
            method="post"
            as="button"
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition ${
              isScheduled
                ? "bg-slate-900 text-white hover:bg-black"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            }`}
            aria-disabled={!isScheduled}
            disabled={!isScheduled}
            preserveScroll
          >
            <ArrowRight className="h-4 w-4" />
            {isScheduled ? "Apply / Register" : "Unavailable"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaginationLinks({ links = [] }) {
  if (!Array.isArray(links) || links.length <= 3) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {links.map((link, index) =>
        link.url ? (
          <Link
            key={`${link.label}-${index}`}
            href={link.url}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              link.active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            dangerouslySetInnerHTML={{ __html: link.label }}
            preserveScroll
          />
        ) : (
          <span
            key={`${link.label}-${index}`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400"
            dangerouslySetInnerHTML={{ __html: link.label }}
          />
        )
      )}
    </div>
  );
}

export default function Index({ sessions = {}, filters = {}, flash = {} }) {
  const items = sessions?.data ?? [];
  const meta = sessions?.meta ?? {};
  const links = sessions?.links ?? [];
  const searchValue = filters?.search ?? "";
  const statusValue = filters?.status ?? "scheduled";

  const submitFilters = (e) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const search = String(form.get("search") || "").trim();
    const status = String(form.get("status") || "scheduled").trim() || "scheduled";

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const query = params.toString();
    const url = query ? `${route("staff.training.sessions.index")}?${query}` : route("staff.training.sessions.index");

    window.location.href = url;
  };

  return (
    <StaffLayout headerTitle="Training Sessions" openedMenu="training">
      <Head title="Training Sessions" />

      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "staff.dashboard" }, { label: "Training Sessions" }]} />

        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              <CalendarDays className="h-4 w-4" />
              Staff sessions
            </div>
            <h1 className="mt-3 text-3xl font-bold">Training Sessions</h1>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Browse available training sessions, filter by status, and apply when a session is scheduled.
            </p>
          </div>
        </div>

        {flash?.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {flash.success}
          </div>
        ) : null}

        {flash?.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {flash.error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={submitFilters} className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchValue}
                  placeholder="Search by title, skill, or description"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <div className="relative mt-1">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="status"
                  defaultValue={statusValue}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
              >
                Apply filters
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
            <p className="mt-1 text-sm text-slate-600">
              {meta?.total ?? items.length} session{(meta?.total ?? items.length) === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="p-5">
            <div className="space-y-4">
              {items.length ? (
                items.map((session) => <SessionCard key={session.id} session={session} />)
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No training sessions found.
                </div>
              )}
            </div>

            <PaginationLinks links={links} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 font-medium text-slate-700">
            <FileText className="h-4 w-4" />
            Note
          </span>
          <p className="mt-1">
            Apply/register is only enabled for sessions in <span className="font-semibold">scheduled</span> status.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
}