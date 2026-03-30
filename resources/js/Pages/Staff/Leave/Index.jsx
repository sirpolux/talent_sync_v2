import { useEffect, useMemo, useState } from "react";
import StaffLayout from "@/Layouts/StaffLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCircle2,
  XCircle,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPersonName(person) {
  if (!person) return "—";
  return person.name || person.full_name || person.email || "—";
}

function getPersonEmail(person) {
  if (!person) return "";
  return person.email || "";
}

function statusStyles(status) {
  const value = String(status || "pending").toLowerCase();

  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return map[value] || "bg-slate-50 text-slate-700 border-slate-200";
}

function StatusPill({ status }) {
  const value = String(status || "pending").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(value)}`}
    >
      {value}
    </span>
  );
}

function PaginationLink({ link }) {
  if (!link) return null;

  const label =
    typeof link.label === "string"
      ? link.label.replace(/&laquo;/g, "«").replace(/&raquo;/g, "»")
      : link.label;

  const className = `rounded-lg border px-3 py-2 text-sm font-medium transition ${
    link.active
      ? "border-slate-900 bg-slate-900 text-white"
      : link.url
        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
  }`;

  if (link.url) {
    return (
      <Link
        href={link.url}
        className={className}
        preserveScroll
        preserveState
        dangerouslySetInnerHTML={{ __html: label }}
      />
    );
  }

  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: label }} />
  );
}

function LeaveRequestCard({ request }) {
  const startDate = request?.start_date || request?.startDate;
  const endDate = request?.end_date || request?.endDate;
  const createdAt = request?.created_at || request?.submitted_at;
  const status = String(request?.status || "pending").toLowerCase();
  const reviewer = request?.reviewer || request?.reviewed_by || null;
  const employee = request?.user || request?.employee || null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {formatDate(startDate)} - {formatDate(endDate)}
            </h3>
            <StatusPill status={status} />
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(startDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
              <Clock3 className="h-4 w-4" />
              {formatDate(endDate)}
            </span>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {request?.reason || "No reason provided."}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Submitted {formatDateTime(createdAt)}</span>
            {employee ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
                <UserCircle2 className="h-4 w-4" />
                {getPersonName(employee)}
              </span>
            ) : null}
            {reviewer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1">
                <BadgeCheck className="h-4 w-4" />
                Reviewed by {getPersonName(reviewer)}
              </span>
            ) : null}
          </div>

          {request?.reviewed_at ? (
            <div className="text-sm text-slate-500">
              Reviewed {formatDateTime(request.reviewed_at)}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {request?.id ? (
            <Link
              href={route("staff.leave.show", request.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-black"
            >
              <FileText className="h-4 w-4" />
              View details
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <BadgeCheck className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {hasFilters ? "No leave requests match your filters" : "No leave requests yet"}
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        {hasFilters
          ? "Try adjusting your search or status filter."
          : "When you submit leave requests, they will appear here with their current review status."}
      </p>
      {!hasFilters ? (
        <div className="mt-6">
          <Link
            href={route("staff.leave.create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            Apply for leave
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function Index({
  leaveRequests = {},
  filters = {},
  statusOptions = [],
  flash = {},
}) {
  const items = leaveRequests?.data ?? [];
  const meta = leaveRequests?.meta ?? {};
  const links = leaveRequests?.links ?? [];
  const total = meta?.total ?? items.length;
  const [search, setSearch] = useState(filters?.search || "");
  const [status, setStatus] = useState(filters?.status || "");

  useEffect(() => {
    setSearch(filters?.search || "");
    setStatus(filters?.status || "");
  }, [filters?.search, filters?.status]);

  const hasFilters = Boolean(search || status);
  const normalizedStatusOptions = useMemo(() => {
    const fallback = [
      { value: "", label: "All statuses" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "cancelled", label: "Cancelled" },
    ];

    if (Array.isArray(statusOptions) && statusOptions.length) {
      return statusOptions;
    }

    return fallback;
  }, [statusOptions]);

  const applyFilters = (nextSearch = search, nextStatus = status) => {
    router.get(
      route("staff.leave.index"),
      {
        search: nextSearch || undefined,
        status: nextStatus || undefined,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters();
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    router.get(
      route("staff.leave.index"),
      {},
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      },
    );
  };

  const refresh = () => {
    router.reload({ preserveScroll: true, preserveState: true });
  };

  return (
    <StaffLayout headerTitle="My Leave" openedMenu="leave">
      <Head title="My Leave" />

      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              <CalendarDays className="h-4 w-4" />
              Leave requests
            </div>
            <h1 className="mt-3 text-3xl font-bold">My Leave</h1>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Review your submitted leave requests, their status, and create a new request when needed.
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
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Leave requests</h2>
              <p className="mt-1 text-sm text-slate-600">
                {total} leave request{total === 1 ? "" : "s"} recorded
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <Link
                href={route("staff.leave.create")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                Apply for leave
              </Link>
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-12"
          >
            <div className="lg:col-span-7">
              <label className="sr-only" htmlFor="leave-search">
                Search leave requests
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-slate-400">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  id="leave-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by reason, dates, or reviewer..."
                  className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="sr-only" htmlFor="leave-status">
                Filter by status
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                <select
                  id="leave-status"
                  value={status}
                  onChange={(event) => {
                    const next = event.target.value;
                    setStatus(next);
                    applyFilters(search, next);
                  }}
                  className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 focus:outline-none focus:ring-0"
                >
                  {normalizedStatusOptions.map((option) => (
                    <option key={option.value || "all"} value={option.value || ""}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 lg:col-span-2 lg:justify-end">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
              >
                Search
              </button>
            </div>
          </form>

          {hasFilters ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                Active filters
              </span>
              {search ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
                  Search: “{search}”
                </span>
              ) : null}
              {status ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 capitalize">
                  Status: {status}
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <XCircle className="h-4 w-4" />
                Clear
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          {items.length ? (
            items.map((request) => (
              <LeaveRequestCard key={request.id} request={request} />
            ))
          ) : (
            <EmptyState hasFilters={hasFilters} />
          )}
        </div>

        {Array.isArray(links) && links.length > 3 ? (
          <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
              <PaginationLink key={`${link.label}-${index}`} link={link} />
            ))}
          </div>
        ) : null}

        {meta?.from !== undefined && meta?.to !== undefined ? (
          <div className="text-sm text-slate-500">
            Showing {meta.from} to {meta.to} of {meta.total ?? total} results
          </div>
        ) : null}
      </div>
    </StaffLayout>
  );
}