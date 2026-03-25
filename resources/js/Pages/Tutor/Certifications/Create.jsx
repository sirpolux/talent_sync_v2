import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, BadgeCheck, HelpCircle, Sparkles } from "lucide-react";
import SectionCard from "../Skills/Components/SectionCard";

export default function Create({ trainer = null, certificationsBySpecialty = {} }) {
  const form = useForm({
    specialty_id: "",
    name: "",
    issuer: "",
    issued_at: "",
    expires_at: "",
    notes: "",
  });

  const specialties = Object.keys(certificationsBySpecialty || []);

  return (
    <TutorLayout headerTitle="Add Certification">
      <Head title="Add Certification" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <Sparkles className="h-4 w-4" />
                Certification record
              </div>
              <h1 className="mt-3 text-3xl font-bold">Add a Certification</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Save certification details and group them by specialty for quick review later.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("trainer.certifications.index")}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Certifications
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Tips"
            description="Helpful guidance for entering certification data."
          >
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                  Use a clear title
                </div>
                <p className="mt-2 leading-6">
                  Include the exact certification name or the name that best matches your official record.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  Match the specialty
                </div>
                <p className="mt-2 leading-6">
                  Pick the specialty that best fits the certification so it appears in the right group.
                </p>
              </div>

              <div className="text-xs text-slate-500">Trainer: {trainer?.name ?? "Current trainer"}</div>
            </div>
          </SectionCard>

          <SectionCard
            title="Certification details"
            description="Fill in the fields below to add a certification."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                form.post(route("trainer.certifications.store"), {
                  preserveScroll: true,
                  onSuccess: () => form.reset(),
                });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">Specialty</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  value={form.data.specialty_id}
                  onChange={(e) => form.setData("specialty_id", e.target.value)}
                  required
                >
                  <option value="">Select specialty</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                {form.errors.specialty_id ? <p className="mt-1 text-xs text-rose-600">{form.errors.specialty_id}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Certification name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  placeholder="e.g. First Aid Trainer"
                  required
                />
                {form.errors.name ? <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p> : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Issuer</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    value={form.data.issuer}
                    onChange={(e) => form.setData("issuer", e.target.value)}
                    placeholder="Organization or board"
                  />
                  {form.errors.issuer ? <p className="mt-1 text-xs text-rose-600">{form.errors.issuer}</p> : null}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                    Draft / active in your profile
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Issued at</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    value={form.data.issued_at}
                    onChange={(e) => form.setData("issued_at", e.target.value)}
                  />
                  {form.errors.issued_at ? <p className="mt-1 text-xs text-rose-600">{form.errors.issued_at}</p> : null}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expires at</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    value={form.data.expires_at}
                    onChange={(e) => form.setData("expires_at", e.target.value)}
                  />
                  {form.errors.expires_at ? <p className="mt-1 text-xs text-rose-600">{form.errors.expires_at}</p> : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <textarea
                  rows="4"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  value={form.data.notes}
                  onChange={(e) => form.setData("notes", e.target.value)}
                  placeholder="Add certificate number, reference, or renewal notes"
                />
                {form.errors.notes ? <p className="mt-1 text-xs text-rose-600">{form.errors.notes}</p> : null}
              </div>

              <button
                type="submit"
                disabled={form.processing}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <BadgeCheck className="h-4 w-4" />
                {form.processing ? "Saving..." : "Add Certification"}
              </button>
            </form>
          </SectionCard>
        </div>
      </div>
    </TutorLayout>
  );
}