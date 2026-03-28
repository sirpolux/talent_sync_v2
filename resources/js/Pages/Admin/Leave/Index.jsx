import React, { useMemo, useState } from "react";
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tone
      )}
    >
      {status}
    </span>
  );
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function Pagination({ links = [] }) {
  if (!Array.isArray(links) || links.length <= 3) return null;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 py-3">
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

function FilterSelect({ id, label, value, onChange, children, className = "" }) {
  return (
    <div className={className}>
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

export default function Index({ leaveRequests, filters = {}, statuses = [] }) {
  const { flash } = usePage().props;

  const initialQ = filters?.q ?? "";
  const initialStatus = filters?.status ?? "all";
  const initialPerPage = String(filters?.per_page ?? 10);

  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [perPage, setPerPage] = useState(initialPerPage);

  React.useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  React.useEffect(() => {
    setPerPage(initialPerPage);
  }, [initialPerPage]);

  const debouncedQ = useDebouncedValue(q, 350);

  const queryParams = useMemo(
    () => ({
      q: debouncedQ || undefined,
      status: status !== "all" ? status : undefined,
      per_page: perPage !== "10" ? perPage : undefined,
    }),
    [debouncedQ, status, perPage]
  );

  React.useEffect(() => {
    router.get(route("admin.leave-requests.index"), queryParams, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    });
  }, [debouncedQ, status, perPage, queryParams]);

  const data = leaveRequests?.data ?? leaveRequests ?? [];
  const links = leaveRequests?.links ?? [];
  const total = leaveRequests?.total;
  const from = leaveRequests?.from;
  const to = leaveRequests?.to;

  const showMeta =
    typeof total === "number" && typeof from === "number" && typeof to === "number";

  const statusOptions = Array.isArray(statuses) && statuses.length
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

      {flash?.success ? (
        <div className="mb-6 max-w-3xl rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {flash.success}
        </div>
      ) : null}

      {flash?.error ? (
        <div className="mb-6 max-w-3xl rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {flash.error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_140px]">
            <div>
              <label className="sr-only" htmlFor="q">
                Search leave requests
              </label>
              <input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search employee name or reason…"
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

            <FilterSelect id="per_page" label="Per page" value={perPage} onChange={setPerPage}>
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </FilterSelect>
          </div>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setStatus("all");
              setPerPage("10");
            }}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Clear
          </button>
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
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                data.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {request.user?.name ?? request.employee_name ?? "Employee"}
                        </span>
                        <span className="text-xs text-slate-600">
                          {request.user?.email ?? request.employee_email ?? ""}
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
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={route("admin.leave-requests.show", request.id)}
                          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          Review
                        </Link>
                      </div>
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
    </AdminLayout>
  );
}