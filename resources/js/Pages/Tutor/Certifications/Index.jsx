import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link } from "@inertiajs/react";
import { Award, BadgeCheck, ArrowRight } from "lucide-react";
import SectionCard from "../Skills/Components/SectionCard";
import CertificationCard from "../Skills/Components/CertificationCard";

export default function Index({
  trainer = null,
  certificationsBySpecialty = {},
}) {
  const groups = Object.entries(certificationsBySpecialty || {}).map(([specialty, items]) => ({
    specialty,
    items: Array.isArray(items) ? items : [],
  }));

  return (
    <TutorLayout headerTitle="Certifications">
      <Head title="Certifications" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <Award className="h-4 w-4" />
                Trainer certifications
              </div>
              <h1 className="mt-3 text-3xl font-bold">Certifications</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Review all certification records, grouped by specialty for easier management.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("trainer.certifications.create")}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/20"
              >
                <BadgeCheck className="h-4 w-4" />
                Add Certification
              </Link>
            </div>
          </div>
        </div>

        <SectionCard
          title="Certifications by specialty"
          description="Each specialty can contain multiple certification records."
          emptyState={
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No certifications added yet.
            </div>
          }
        >
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.specialty} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{group.specialty}</h2>
                    <p className="text-xs text-slate-500">{group.items.length} certification{group.items.length === 1 ? "" : "s"}</p>
                  </div>

                  <Link
                    href={route("trainer.certifications.create")}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                  >
                    Add more <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid gap-3">
                  {group.items.length ? (
                    group.items.map((certification, index) => (
                      <CertificationCard
                        key={certification.id ?? `${group.specialty}-${index}`}
                        certification={certification}
                      />
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                      No certifications in this specialty yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="text-sm text-slate-500">
          Trainer: {trainer?.name ?? "Current trainer"}
        </div>
      </div>
    </TutorLayout>
  );
}