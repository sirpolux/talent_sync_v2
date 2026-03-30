import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ value }) {
  const status = value ?? "pending";

  const tone =
    status === "approved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset",
        tone
      )}
    >
      {status}
    </span>
  );
}

function FlashMessage() {
  const { flash } = usePage().props;

  if (!flash?.success && !flash?.error) return null;

  const isSuccess = !!flash?.success;
  const message = flash?.success ?? flash?.error;

  return (
    <div
      className={classNames(
        "rounded-lg border px-4 py-3 text-sm shadow-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-rose-200 bg-rose-50 text-rose-900"
      )}
    >
      {message}
    </div>
  );
}

function Pagination({ links = [] }) {
  if (!Array.isArray(links) || links.length <= 3) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 py-2">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.url || "#"}
          preserveScroll
          className={classNames(
            "min-w-9 rounded-md px-3 py-2 text-sm transition",
            link.active
              ? "bg-slate-900 text-white shadow-sm"
              : link.url
                ? "border bg-white text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border bg-slate-50 text-slate-400"
          )}
          onClick={(e) => {
            if (!link.url) e.preventDefault();
          }}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </nav>
  );
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
      >
        {children}
      </select>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export default function Index({ leaveRequests, filters = {}, statuses = [] }) {
  const initialQ = filters?.q ?? "";
  const initialStatus = filters?.status ?? "all";

  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const debouncedQ = useDebouncedValue(q, 350);

  useEffect(() => {
    router.get(
      route("admin.leave-requests.index"),
      {
        q: debouncedQ || undefined,
        status: status !== "all" ? status : undefined,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
      }
    );
  }, [debouncedQ, status]);

  const data = leaveRequests?.data ?? [];
  const links = leaveRequests?.links ?? [];
  const meta = leaveRequests?.meta ?? leaveRequests ?? {};
  const total = meta?.total;
  const from = meta?.from;
  const to = meta?.to;
  const currentPage = meta?.current_page;
  const lastPage = meta?.last_page;

  const showMeta =
    typeof total === "number" && typeof from === "number" && typeof to === "number";

  const statusOptions =
    Array.isArray(statuses) && statuses.length
      ? statuses
      : [
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ];

  return (
    <AdminLayout>
      <Head title="Leave Requests" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Leave Requests" },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Leave Requests</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review organization leave requests and approve or reject submissions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <FlashMessage />

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <label className="sr-only" htmlFor="q">
                    Search leave requests
                  </label>
                  <input
                    id="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search employee name, email, or reason…"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>

                <FilterSelect id="status" label="Status" value={status} onChange={setStatus}>
                  <option value="all">All statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value ?? option} value={option.value ?? option}>
                      {option.label ?? option}
                    </option>
                  ))}
                </FilterSelect>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  {showMeta ? (
                    <>
                      Showing <span className="font-medium text-slate-900">{from}</span>–
                      <span className="font-medium text-slate-900">{to}</span> of{" "}
                      <span className="font-medium text-slate-900">{total}</span>
                    </>
                  ) : (
                    <span>
                      Page <span className="font-medium text-slate-900">{currentPage ?? 1}</span>
                      {lastPage ? (
                        <>
                          {" "}
                          of <span className="font-medium text-slate-900">{lastPage}</span>
                        </>
                      ) : null}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setStatus("all");
                    router.get(route("admin.leave-requests.index"), {}, { preserveScroll: true, replace: true });
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white">
                <tr className="border-b border-slate-200">
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Employee
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Dates
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Reason
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {data.length === 0 ? (
                  <tr>
                    <td className="px-4 py-10 text-center" colSpan={5}>
                      <EmptyState
                        title="No leave requests found"
                        description="Try adjusting your search or status filter."
                      />
                    </td>
                  </tr>
                ) : (
                  data.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {request.user?.name ?? "Employee"}
                          </span>
                          <span className="text-xs text-slate-600">
                            {request.user?.email ?? ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="flex flex-col">
                          <span>{request.start_date ?? "-"}</span>
                          <span className="text-xs text-slate-500">to {request.end_date ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="line-clamp-2">{request.reason ?? "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill value={request.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={route("admin.leave-requests.show", request.id)}
                          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50/40 px-4">
            <div className="flex flex-col items-center justify-between gap-2 py-3 sm:flex-row">
              {showMeta ? (
                <div className="text-sm text-slate-600">
                  Showing <span className="font-medium text-slate-900">{from}</span>–
                  <span className="font-medium text-slate-900">{to}</span> of{" "}
                  <span className="font-medium text-slate-900">{total}</span>
                </div>
              ) : (
                <div />
              )}

              <Pagination links={links} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}