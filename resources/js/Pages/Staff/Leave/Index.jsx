import StaffLayout from "@/Layouts/StaffLayout";
import { Head, Link, router } from "@inertiajs/react";
import { CalendarDays, FileText, Plus, RefreshCw, Clock3, BadgeCheck, XCircle } from "lucide-react";

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
  const value = String(status || "pending").toLowerCase();

  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return map[value] || "bg-slate-50 text-slate-700 border-slate-200";
}

function StatusPill({ status }) {
  const value = String(status || "pending").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles(value)}`}
    >
      {value}
    </span>
  );
}

function LeaveRequestCard({ request }) {
  const startDate = request?.start_date;
  const endDate = request?.end_date;
  const createdAt = request?.created_at;
  const status = String(request?.status || "pending").toLowerCase();

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

          <div className="text-sm text-slate-500">
            {createdAt ? <>Submitted {formatDateTime(createdAt)}</> : "—"}
          </div>
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

export default function Index({ leaveRequests = {}, flash = {} }) {
  const items = leaveRequests?.data ?? [];
  const meta = leaveRequests?.meta ?? {};
  const links = leaveRequests?.links ?? [];
  const total = meta?.total ?? items.length;

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
              Review your submitted leave requests, their status, and create a
              new request when needed.
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        <div className="space-y-4">
          {items.length ? (
            items.map((request) => (
              <LeaveRequestCard key={request.id} request={request} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No leave requests yet
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                When you submit leave requests, they will appear here with their
                current review status.
              </p>
              <div className="mt-6">
                <Link
                  href={route("staff.leave.create")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
                >
                  <Plus className="h-4 w-4" />
                  Apply for leave
                </Link>
              </div>
            </div>
          )}
        </div>

        {links.length > 3 ? (
          <div className="flex flex-wrap gap-2">
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
        ) : null}
      </div>
    </StaffLayout>
  );
}