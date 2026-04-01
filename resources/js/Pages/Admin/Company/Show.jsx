import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link } from "@inertiajs/react";

function Field({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 whitespace-pre-wrap">
        {value ?? <span className="text-slate-400 font-medium">—</span>}
      </div>
    </div>
  );
}

function CompanyLogo({ logoUrl, name }) {
  if (!logoUrl) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {String(name ?? "Company").slice(0, 2)}
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <img
        src={logoUrl}
        alt={`${name ?? "Company"} logo`}
        className="h-full w-full object-contain"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const parent = e.currentTarget.parentElement;
          if (parent && !parent.querySelector("[data-logo-fallback]")) {
            const fallback = document.createElement("div");
            fallback.setAttribute("data-logo-fallback", "true");
            fallback.className =
              "flex h-full w-full items-center justify-center bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400";
            fallback.textContent = String(name ?? "Company").slice(0, 2);
            parent.appendChild(fallback);
          }
        }}
      />
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

      <div className="max-w-6xl space-y-4">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Company" },
          ]}
        />
        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <CompanyLogo
              logoUrl={organization?.logo_url}
              name={organization?.company_name}
            />
            <div>
              <h1 className="text-xl font-semibold text-[#1E3A8A]">
                {organization.company_name}
              </h1>
              <div className="mt-1 text-sm text-slate-600">
                {organization.company_email ?? "No company email set"}
              </div>
            </div>
          </div>

          <Link
            href={route("admin.company.edit")}
            className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-white font-semibold hover:opacity-95"
          >
            Edit
          </Link>
        </div>


        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Organization details
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Company type" value={organization.company_type} />
                <Field label="Contact number" value={organization.contact_number} />
                <Field label="Country" value={organization.country} />
                <Field label="State" value={organization.state} />
                <Field label="LGA" value={organization.local_government} />
                <Field label="Province" value={organization.province} />
                <Field label="Employee range" value={organization.employee_range} />
                <Field label="Company size" value={organization.company_size} />
              </div>

              <div className="mt-3">
                <Field label="Address" value={organization.company_address} />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Description
              </h2>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {organization.company_description ?? (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Access & status
              </h2>
              <div className="grid gap-3">
                <Field
                  label="Self registration"
                  value={organization.allow_self_registration ? "Enabled" : "Disabled"}
                />
                <Field label="Onboarding stage" value={organization.onboarding_stage} />
                <Field
                  label="Onboarding complete"
                  value={organization.onboarding_complete ? "Yes" : "No"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
