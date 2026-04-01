import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm } from "@inertiajs/react";

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

function DetailRow({ label, value }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{value ?? "-"}</dd>
    </div>
  );
}

export default function Show({ leaveRequest }) {
  const decisionForm = useForm({
    review_notes: leaveRequest?.review_notes ?? "",
  });

  const submitDecision = (action) => {
    decisionForm.post(route(`admin.leave-requests.${action}`, leaveRequest.id), {
      preserveScroll: true,
    });
  };

  if (!leaveRequest) {
    return (
      <AdminLayout>
        <Head title="Leave Request" />
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Leave request not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            The selected leave request could not be loaded.
          </p>
          <div className="mt-6">
            <Link
              href={route("admin.leave-requests.index")}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back to list
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head title={`Leave Request${leaveRequest?.user?.name ? `: ${leaveRequest.user.name}` : ""}`} />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Leave Requests", href: "admin.leave-requests.index" },
            { label: leaveRequest?.user?.name ?? "Leave Request" },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Leave Request</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review the request and approve or reject with optional notes.
            </p>
          </div>

          <Link
            href={route("admin.leave-requests.index")}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to list
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                {leaveRequest?.user?.name ?? "Employee"}
              </h2>
              <StatusPill value={leaveRequest?.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Submitted leave request details and review history.
            </p>
          </div>

          <dl className="divide-y divide-slate-200 px-6">
            <DetailRow label="Employee" value={leaveRequest?.user?.name} />
            <DetailRow label="Email" value={leaveRequest?.user?.email} />
            <DetailRow label="Start Date" value={leaveRequest?.start_date} />
            <DetailRow label="End Date" value={leaveRequest?.end_date} />
            <DetailRow label="Reason" value={leaveRequest?.reason} />
            <DetailRow label="Reviewed By" value={leaveRequest?.reviewed_by?.name ?? "-"} />
            <DetailRow label="Reviewed At" value={leaveRequest?.reviewed_at} />
            <DetailRow label="Review Notes" value={leaveRequest?.review_notes ?? "-"} />
            <DetailRow label="Created At" value={leaveRequest?.created_at} />
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Decision</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add optional notes, then approve or reject the request.
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitDecision("approve");
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="review_notes">
                Review Notes
              </label>
              <textarea
                id="review_notes"
                rows={5}
                value={decisionForm.data.review_notes}
                onChange={(e) => decisionForm.setData("review_notes", e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                placeholder="Optional notes for the employee or HR record"
              />
              {decisionForm.errors.review_notes ? (
                <p className="mt-1 text-xs text-rose-600">{decisionForm.errors.review_notes}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={decisionForm.processing}
                className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {decisionForm.processing ? "Approving..." : "Approve"}
              </button>

              <button
                type="button"
                disabled={decisionForm.processing}
                onClick={() => submitDecision("reject")}
                className="inline-flex items-center justify-center rounded-md bg-rose-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {decisionForm.processing ? "Rejecting..." : "Reject"}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Decisions will update the request status and record the reviewing admin.
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}