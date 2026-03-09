import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Select({ organizations }) {
  const { data, setData, post, processing, errors } = useForm({
    organization_id: "",
  });

  const onSubmit = (e) => {
    e.preventDefault();
    post(route("org.set-current"));
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Select organization
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            You belong to multiple organizations. Choose where you want to work
            right now.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Organization
              </label>
              <select
                className="mt-1 block w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={data.organization_id}
                onChange={(e) => setData("organization_id", e.target.value)}
              >
                <option value="">-- select --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.organization_id ? (
                <div className="mt-2 text-sm text-red-600">
                  {errors.organization_id}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={processing || !data.organization_id}
              className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-white font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
