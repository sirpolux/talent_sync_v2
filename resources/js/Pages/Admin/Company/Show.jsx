import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-slate-100 last:border-b-0">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="text-sm font-medium text-slate-900 text-right whitespace-pre-wrap">
        {value ?? <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}

export default function Show({ organization }) {
  return (
    <AdminLayout
      headerTitle="Company"
      tabName="Company"
      openedMenu="company"
      activeSubmenu="company.overview"
    >
      <Head title="Company" />

      <div className="max-w-3xl space-y-4">
        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#1E3A8A]">
              {organization.company_name}
            </h1>
            <div className="mt-1 text-sm text-slate-600">
              {organization.company_email ?? "No company email set"}
            </div>
          </div>

          <Link
            href={route("admin.company.edit")}
            className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-white font-semibold hover:opacity-95"
          >
            Edit
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Organization details
          </h2>

          <Row label="Company type" value={organization.company_type} />
          <Row label="Address" value={organization.company_address} />
          <Row label="Contact number" value={organization.contact_number} />
          <Row label="Country" value={organization.country} />
          <Row label="State" value={organization.state} />
          <Row label="LGA" value={organization.local_government} />
          <Row label="Province" value={organization.province} />
          <Row label="Employee range" value={organization.employee_range} />
          <Row label="Company size" value={organization.company_size} />
          <Row
            label="Self registration"
            value={organization.allow_self_registration ? "Enabled" : "Disabled"}
          />
          <Row label="Onboarding stage" value={organization.onboarding_stage} />
          <Row
            label="Onboarding complete"
            value={organization.onboarding_complete ? "Yes" : "No"}
          />

          <div className="pt-4">
            <div className="text-sm font-semibold text-slate-900 mb-2">
              Description
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {organization.company_description ?? (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
