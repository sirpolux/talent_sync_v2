import { useForm } from "@inertiajs/react";
import CompanyLogo from "@/Components/CompanyLogo";
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
        <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Select organization
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            You belong to multiple organizations. Choose where you want to work
            right now.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {organizations.map((org) => {
                  const selected = String(data.organization_id) === String(org.id);

                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setData("organization_id", String(org.id))}
                      className={[
                        "w-full text-left rounded-xl border bg-white p-4 transition",
                        "hover:border-slate-300 hover:shadow-sm",
                        selected
                          ? "border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20"
                          : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo
                          name={org.company_name}
                          // Future-proof: if backend starts sending a logo URL, wire it here
                          src={org.logo_url ?? null}
                          size={40}
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {org.company_name}
                          </div>
                          <div className="text-xs text-slate-600">
                            Click to select
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

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
