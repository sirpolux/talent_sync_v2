import AdminLayout from "@/Layouts/AdminLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";

export default function Edit({ organization, status }) {
  const { data, setData, patch, processing, errors } = useForm({
    company_name: organization?.company_name ?? "",
    company_email: organization?.company_email ?? "",
    company_type: organization?.company_type ?? "",
    company_address: organization?.company_address ?? "",
    contact_number: organization?.contact_number ?? "",
    company_description: organization?.company_description ?? "",
    allow_self_registration: Boolean(organization?.allow_self_registration),
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route("admin.company.update"));
  };

  return (
    <AdminLayout
      headerTitle="Company Profile"
      tabName="Company"
      openedMenu="company"
      activeSubmenu="company.profile"
    >
      <Head title="Company Profile" />

      <div className="max-w-3xl">
        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1E3A8A]">
              Update company profile
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              This information is used across your organization workspace.
            </p>

            {status ? (
              <div className="mt-4 text-sm font-medium text-emerald-700">
                {status}
              </div>
            ) : null}
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div>
              <InputLabel value="Company name" />
              <TextInput
                className="mt-1 block w-full"
                value={data.company_name}
                onChange={(e) => setData("company_name", e.target.value)}
                required
              />
              <InputError message={errors.company_name} className="mt-2" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Company email" />
                <TextInput
                  type="email"
                  className="mt-1 block w-full"
                  value={data.company_email}
                  onChange={(e) => setData("company_email", e.target.value)}
                />
                <InputError message={errors.company_email} className="mt-2" />
              </div>

              <div>
                <InputLabel value="Contact number" />
                <TextInput
                  className="mt-1 block w-full"
                  value={data.contact_number}
                  onChange={(e) => setData("contact_number", e.target.value)}
                />
                <InputError message={errors.contact_number} className="mt-2" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <InputLabel value="Company type" />
                <TextInput
                  className="mt-1 block w-full"
                  value={data.company_type}
                  onChange={(e) => setData("company_type", e.target.value)}
                />
                <InputError message={errors.company_type} className="mt-2" />
              </div>

              <div>
                <InputLabel value="Company address" />
                <TextInput
                  className="mt-1 block w-full"
                  value={data.company_address}
                  onChange={(e) => setData("company_address", e.target.value)}
                />
                <InputError message={errors.company_address} className="mt-2" />
              </div>
            </div>

            <div>
              <InputLabel value="Company description" />
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                value={data.company_description}
                onChange={(e) => setData("company_description", e.target.value)}
              />
              <InputError message={errors.company_description} className="mt-2" />
            </div>

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
                checked={data.allow_self_registration}
                onChange={(e) =>
                  setData("allow_self_registration", e.target.checked)
                }
              />
            </div>

            <div className="flex justify-end">
              <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
