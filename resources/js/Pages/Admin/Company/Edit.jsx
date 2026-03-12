import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";

const COMPANY_TYPES = [
  "Production",
  "IT",
  "Trading",
  "Manufacturing",
  "Construction",
  "Finance",
  "Banking",
  "Insurance",
  "Healthcare",
  "Education",
  "Logistics",
  "Transportation",
  "Hospitality",
  "Retail",
  "Agriculture",
  "Energy",
  "Telecommunications",
  "Government",
  "Non-profit",
];

function normalizeType(value) {
  return String(value ?? "").trim().toLowerCase();
}

function SectionCard({ title, description, children }) {
  return (
    <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function Edit({ organization, status }) {
  const companyForm = useForm({
    company_name: organization?.company_name ?? "",
    company_email: organization?.company_email ?? "",
    company_type: organization?.company_type ?? "",
    contact_number: organization?.contact_number ?? "",
    company_description: organization?.company_description ?? "",
  });

  const initialCompanyType = String(organization?.company_type ?? "").trim();
  const initialCompanyTypeKnown = useMemo(() => {
    const current = normalizeType(initialCompanyType);
    if (!current) return true; // empty behaves like "choose from list"
    return COMPANY_TYPES.some((t) => normalizeType(t) === current);
  }, [initialCompanyType]);

  const [companyTypeQuery, setCompanyTypeQuery] = useState("");
  const [companyTypeOpen, setCompanyTypeOpen] = useState(false);
  const [companyTypeMode, setCompanyTypeMode] = useState(
    initialCompanyType && !initialCompanyTypeKnown ? "custom" : "preset"
  );
  const [customCompanyType, setCustomCompanyType] = useState(
    initialCompanyType && !initialCompanyTypeKnown ? initialCompanyType : ""
  );
  const companyTypeWrapRef = useRef(null);

  const filteredCompanyTypes = useMemo(() => {
    const q = normalizeType(companyTypeQuery);
    if (!q) return COMPANY_TYPES;
    return COMPANY_TYPES.filter((t) => normalizeType(t).includes(q));
  }, [companyTypeQuery]);

  const selectedCompanyTypeLabel = useMemo(() => {
    const v = String(companyForm.data.company_type ?? "").trim();
    if (!v) return "";
    const match = COMPANY_TYPES.find((t) => normalizeType(t) === normalizeType(v));
    return match ?? v;
  }, [companyForm.data.company_type]);

  const applyPresetCompanyType = (value) => {
    setCompanyTypeMode("preset");
    setCompanyTypeOpen(false);
    setCompanyTypeQuery("");
    setCustomCompanyType("");
    companyForm.setData("company_type", value);
  };

  const applyOtherCompanyType = () => {
    setCompanyTypeMode("custom");
    setCompanyTypeOpen(false);
    setCompanyTypeQuery("");
    const current = String(companyForm.data.company_type ?? "").trim();
    const currentIsKnown = COMPANY_TYPES.some(
      (t) => normalizeType(t) === normalizeType(current)
    );
    if (currentIsKnown) {
      companyForm.setData("company_type", "");
    }
  };

  const onCustomCompanyTypeChange = (value) => {
    setCustomCompanyType(value);
    companyForm.setData("company_type", value);
  };

  const addressForm = useForm({
    company_address: organization?.company_address ?? "",
    country: organization?.country ?? "",
    state: organization?.state ?? "",
    local_government: organization?.local_government ?? "",
    province: organization?.province ?? "",
  });

  const statsForm = useForm({
    employee_range: organization?.employee_range ?? "",
    company_size: organization?.company_size ?? "",
  });

  const accessForm = useForm({
    allow_self_registration: Boolean(organization?.allow_self_registration),
  });

  const complianceForm = useForm({
    rn_number: organization?.rn_number ?? "",
    tax_number: organization?.tax_number ?? "",
    date_of_incoporation: organization?.date_of_incoporation ?? "",
  });

  const logoForm = useForm({
    logo: null,
  });

  const complianceLocked = {
    rn_number: Boolean(organization?.rn_number),
    tax_number: Boolean(organization?.tax_number),
    date_of_incoporation: Boolean(organization?.date_of_incoporation),
  };

  const companyNameLocked = Boolean(organization?.company_name);

  return (
    <AdminLayout
      headerTitle="Company Profile"
      tabName="Company"
      openedMenu="company"
      activeSubmenu="company.profile"
    >
      <Head title="Company Profile" />

      <div className="max-w-6xl space-y-4 ">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard"},
            { label: "Company", href: "admin.company.show" },
            { label: "Edit" },
          ]}
        />

        <div className="bg-white/90   backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
          <div className="mb-2">
            <h1 className="text-xl font-semibold text-[#1E3A8A]">
              Update company profile
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your organization details in sections.
            </p>

            {status ? (
              <div className="mt-4 text-sm font-medium text-emerald-700">
                {status}
              </div>
            ) : null}
          </div>
        </div>

        <SectionCard
          title="Company data"
          description="Basic information used across your workspace."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              companyForm.patch(route("admin.company.update.company"), {
                preserveScroll: true,
              });
            }}
            className="space-y-4"
          >
            <div>
              <InputLabel value="Company name" />
              <TextInput
                className="mt-1 block w-full"
                value={companyForm.data.company_name}
                disabled={companyNameLocked}
                onChange={(e) =>
                  companyForm.setData("company_name", e.target.value)
                }
                required
              />
              <InputError
                message={companyForm.errors.company_name}
                className="mt-2"
              />
              {companyNameLocked ? (
                <div className="mt-1 text-xs text-slate-500">
                  Company name is locked once set.
                </div>
              ) : null}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Company email" />
                <TextInput
                  type="email"
                  className="mt-1 block w-full"
                  value={companyForm.data.company_email}
                  onChange={(e) =>
                    companyForm.setData("company_email", e.target.value)
                  }
                />
                <InputError message={companyForm.errors.company_email} className="mt-2" />
              </div>

              <div>
                <InputLabel value="Contact number" />
                <TextInput
                  className="mt-1 block w-full"
                  value={companyForm.data.contact_number}
                  onChange={(e) =>
                    companyForm.setData("contact_number", e.target.value)
                  }
                />
                <InputError message={companyForm.errors.contact_number} className="mt-2" />
              </div>
            </div>

            <div ref={companyTypeWrapRef}>
              <InputLabel value="Company type" />

              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setCompanyTypeOpen((v) => !v)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={selectedCompanyTypeLabel ? "text-slate-900" : "text-slate-400"}>
                      {selectedCompanyTypeLabel || "Select company type"}
                    </span>
                    <span className="text-slate-400">▾</span>
                  </div>
                </button>

                {companyTypeOpen ? (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg ">
                    <div className="p-2 border-b border-slate-100">
                      <input
                        autoFocus
                        value={companyTypeQuery}
                        onChange={(e) => setCompanyTypeQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="max-h-36 overflow-auto p-2">
                      {filteredCompanyTypes.length ? (
                        <div className="space-y-1">
                          {filteredCompanyTypes.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => applyPresetCompanyType(t)}
                              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          No matches.
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={applyOtherCompanyType}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
                        >
                          Other (type manually)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {companyTypeMode === "custom" ? (
                <div className="mt-3">
                  <InputLabel value="Custom company type" />
                  <TextInput
                    className="mt-1 block w-full"
                    value={customCompanyType}
                    onChange={(e) => onCustomCompanyTypeChange(e.target.value)}
                    placeholder="e.g. Consulting"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Type a custom value. This will be saved as your company type.
                  </div>
                </div>
              ) : null}

              <InputError message={companyForm.errors.company_type} className="mt-2" />
            </div>

            <div>
              <InputLabel value="Company description" />
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                value={companyForm.data.company_description}
                onChange={(e) =>
                  companyForm.setData("company_description", e.target.value)
                }
              />
              <InputError
                message={companyForm.errors.company_description}
                className="mt-2"
              />
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled={companyForm.processing}>
                Save company data
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Company address"
          description="Location and address details."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addressForm.patch(route("admin.company.update.address"), {
                preserveScroll: true,
              });
            }}
            className="space-y-4"
          >
            <div>
              <InputLabel value="Company address" />
              <TextInput
                className="mt-1 block w-full"
                value={addressForm.data.company_address}
                onChange={(e) =>
                  addressForm.setData("company_address", e.target.value)
                }
              />
              <InputError message={addressForm.errors.company_address} className="mt-2" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Country" />
                <TextInput
                  className="mt-1 block w-full"
                  value={addressForm.data.country}
                  onChange={(e) => addressForm.setData("country", e.target.value)}
                />
                <InputError message={addressForm.errors.country} className="mt-2" />
              </div>

              <div>
                <InputLabel value="State" />
                <TextInput
                  className="mt-1 block w-full"
                  value={addressForm.data.state}
                  onChange={(e) => addressForm.setData("state", e.target.value)}
                />
                <InputError message={addressForm.errors.state} className="mt-2" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Local government (LGA)" />
                <TextInput
                  className="mt-1 block w-full"
                  value={addressForm.data.local_government}
                  onChange={(e) =>
                    addressForm.setData("local_government", e.target.value)
                  }
                />
                <InputError
                  message={addressForm.errors.local_government}
                  className="mt-2"
                />
              </div>

              <div>
                <InputLabel value="Province" />
                <TextInput
                  className="mt-1 block w-full"
                  value={addressForm.data.province}
                  onChange={(e) =>
                    addressForm.setData("province", e.target.value)
                  }
                />
                <InputError message={addressForm.errors.province} className="mt-2" />
              </div>
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled={addressForm.processing}>
                Save address
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Company stats" description="Workforce information.">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              statsForm.patch(route("admin.company.update.stats"), {
                preserveScroll: true,
              });
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Employee range" />
                <TextInput
                  className="mt-1 block w-full"
                  value={statsForm.data.employee_range}
                  onChange={(e) =>
                    statsForm.setData("employee_range", e.target.value)
                  }
                />
                <InputError
                  message={statsForm.errors.employee_range}
                  className="mt-2"
                />
              </div>

              <div>
                <InputLabel value="Company size" />
                <TextInput
                  className="mt-1 block w-full"
                  value={statsForm.data.company_size}
                  onChange={(e) =>
                    statsForm.setData("company_size", e.target.value)
                  }
                />
                <InputError message={statsForm.errors.company_size} className="mt-2" />
              </div>
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled={statsForm.processing}>
                Save stats
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Compliance"
          description="These fields can only be set once. If already set, they are locked."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              complianceForm.patch(route("admin.company.update.compliance"), {
                preserveScroll: true,
              });
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="RN number" />
                <TextInput
                  className="mt-1 block w-full"
                  value={complianceForm.data.rn_number}
                  disabled={complianceLocked.rn_number}
                  onChange={(e) =>
                    complianceForm.setData("rn_number", e.target.value)
                  }
                />
                <InputError message={complianceForm.errors.rn_number} className="mt-2" />
                {complianceLocked.rn_number ? (
                  <div className="mt-1 text-xs text-slate-500">
                    Already set. Cannot be changed.
                  </div>
                ) : null}
              </div>

              <div>
                <InputLabel value="Tax number" />
                <TextInput
                  className="mt-1 block w-full"
                  value={complianceForm.data.tax_number}
                  disabled={complianceLocked.tax_number}
                  onChange={(e) =>
                    complianceForm.setData("tax_number", e.target.value)
                  }
                />
                <InputError message={complianceForm.errors.tax_number} className="mt-2" />
                {complianceLocked.tax_number ? (
                  <div className="mt-1 text-xs text-slate-500">
                    Already set. Cannot be changed.
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <InputLabel value="Date of incorporation" />
              <TextInput
                type="date"
                className="mt-1 block w-full"
                value={complianceForm.data.date_of_incoporation}
                disabled={complianceLocked.date_of_incoporation}
                onChange={(e) =>
                  complianceForm.setData("date_of_incoporation", e.target.value)
                }
              />
              <InputError
                message={complianceForm.errors.date_of_incoporation}
                className="mt-2"
              />
              {complianceLocked.date_of_incoporation ? (
                <div className="mt-1 text-xs text-slate-500">
                  Already set. Cannot be changed.
                </div>
              ) : null}
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled={complianceForm.processing}>
                Save compliance
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Access"
          description="Control how users can join your organization."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              accessForm.patch(route("admin.company.update.access"), {
                preserveScroll: true,
              });
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  Allow self registration
                </div>
                <div className="text-xs text-slate-600">
                  If enabled, users can join this organization without an invite.
                </div>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={accessForm.data.allow_self_registration}
                onChange={(e) =>
                  accessForm.setData("allow_self_registration", e.target.checked)
                }
              />
            </div>

            <InputError
              message={accessForm.errors.allow_self_registration}
              className="mt-2"
            />

            <div className="flex justify-end">
              <PrimaryButton disabled={accessForm.processing}>
                Save access settings
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Company logo"
          description="UI is ready; backend upload will be added later."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Backend implementation intentionally deferred.
            }}
            className="space-y-4"
          >
            <div>
              <InputLabel value="Logo" />
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(e) => logoForm.setData("logo", e.target.files?.[0] ?? null)}
              />
              <div className="mt-1 text-xs text-slate-500">
                Upload is coming soon. This section is UI-only for now.
              </div>
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled>Save logo (coming soon)</PrimaryButton>
            </div>
          </form>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
