import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Field({ label, children, hint, error }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function Create({ staff = [] }) {
  const { errors, processing } = usePage().props;

  const [type, setType] = useState("existing_staff"); // existing_staff | new_tutor

  // existing staff
  const [staffQuery, setStaffQuery] = useState("");
  const [userId, setUserId] = useState("");

  // new tutor
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const filteredStaff = useMemo(() => {
    const q = staffQuery.trim().toLowerCase();
    if (!q) return staff;

    return staff.filter((s) => {
      const hay = `${s.name ?? ""} ${s.email ?? ""} ${s.employee_code ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [staff, staffQuery]);

  function submit(e) {
    e.preventDefault();

    const payload =
      type === "existing_staff"
        ? { type, user_id: userId }
        : { type, name, email, phone };

    router.post(route("admin.trainers.store"), payload, {
      preserveScroll: true,
    });
  }

  return (
    <AdminLayout>
      <Head title="Add Trainer" />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Trainers", href: "admin.trainers.index" },
            { label: "Add Trainer" },
          ]}
        />

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add Trainer</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add an existing staff member as a trainer, or invite a new tutor.
            </p>
          </div>

          <Link
            href={route("admin.trainers.index")}
            className="inline-flex items-center rounded-md border bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={submit} className="max-w-3xl">
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b bg-gray-50/60 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Select flow</p>
                <p className="text-xs text-gray-600">
                  Existing staff becomes active trainer immediately. New tutor is invited as pending.
                </p>
              </div>

              <div className="inline-flex rounded-md border bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setType("existing_staff")}
                  className={classNames(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    type === "existing_staff"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  Existing Staff
                </button>
                <button
                  type="button"
                  onClick={() => setType("new_tutor")}
                  className={classNames(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    type === "new_tutor"
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  New Tutor
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-5">
            <input type="hidden" name="type" value={type} />

            {type === "existing_staff" ? (
              <>
                <Field label="Search staff" hint="Name, email, employee code">
                  <input
                    value={staffQuery}
                    onChange={(e) => setStaffQuery(e.target.value)}
                    placeholder="Type to search…"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </Field>

                <Field label="Select staff member" error={errors?.user_id}>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  >
                    <option value="">Choose a staff member…</option>
                    {filteredStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.email}
                        {s.department_name ? ` • ${s.department_name}` : ""}
                        {s.position_name ? ` • ${s.position_name}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="rounded-lg border bg-gray-50 px-4 py-3 text-xs text-gray-700">
                  This will mark the staff member as a trainer in this organization and send them a notification email.
                </div>
              </>
            ) : (
              <>
                <Field label="Full name" error={errors?.name}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ada Lovelace"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </Field>

                <Field label="Email address" error={errors?.email}>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ada@company.com"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </Field>

                <Field label="Phone (optional)" error={errors?.phone}>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234…"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </Field>

                <div className="rounded-lg border bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  This will invite the tutor as <span className="font-semibold">pending</span> and email an
                  invitation link to join the organization.
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t bg-gray-50/40 px-4 py-4">
            <Link
              href={route("admin.trainers.index")}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={processing}
              className={classNames(
                "inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm",
                processing ? "opacity-60 cursor-not-allowed" : "hover:bg-black"
              )}
            >
              {processing ? "Saving…" : "Add Trainer"}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
