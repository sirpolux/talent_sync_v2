import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, BadgeCheck, Search } from "lucide-react";
import SectionCard from "./Components/SectionCard";
import CertificationCard from "./Components/CertificationCard";

function Pagination({ links = [] }) {
  if (!Array.isArray(links) || !links.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link, index) => (
        <Link
          key={`${link.label}-${index}`}
          href={link.url || "#"}
          preserveScroll
          className={[
            "rounded-md border px-3 py-2 text-sm",
            link.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700",
            !link.url ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </div>
  );
}

export default function Show({
  trainer = null,
  skill = null,
  certifications = { data: [], links: [] },
  filters = {},
}) {
  const form = useForm({
    search: filters?.search ?? "",
    status: filters?.status ?? "",
  });

  const submit = (e) => {
    e.preventDefault();
    form.get(route("trainer.skills.show", skill?.id), {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const certificationItems = Array.isArray(certifications?.data) ? certifications.data : [];
  const paginationLinks = Array.isArray(certifications?.links) ? certifications.links : [];

  return (
    <TutorLayout headerTitle="Skill Certifications">
      <Head title={skill?.name ? `${skill.name} Certifications` : "Skill Certifications"} />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <BadgeCheck className="h-4 w-4" />
                Skill details
              </div>
              <h1 className="mt-3 text-3xl font-bold">{skill?.name ?? "Skill Certifications"}</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                View certifications tied to this skill and filter by search or status where available.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={route("trainer.skills.index")}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Skills
              </Link>
            </div>
          </div>
        </div>

        <SectionCard
          title="Filters"
          description="Search certifications connected to this skill."
          action={
            <Link
              href={route("trainer.certifications.create")}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
            >
              <BadgeCheck className="h-4 w-4" />
              Add Certification
            </Link>
          }
        >
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.data.search}
                  onChange={(e) => form.setData("search", e.target.value)}
                  placeholder="Search name, issuer, or notes"
                  className="ml-2 w-full border-0 p-0 text-sm outline-none focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.data.status}
                onChange={(e) => form.setData("status", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
              >
                <option value="">All statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-black"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setData("search", "");
                  form.setData("status", "");
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Certifications"
          description={skill?.description ? skill.description : "All matching certification records."}
          emptyState={
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No certifications found for this skill.
            </div>
          }
        >
          <div className="space-y-4">
            {certificationItems.map((certification) => (
              <CertificationCard key={certification.id} certification={certification} />
            ))}
          </div>

          <div className="mt-5">
            <Pagination links={paginationLinks} />
          </div>
        </SectionCard>

        <div className="text-sm text-slate-500">Trainer: {trainer?.name ?? "Current trainer"}</div>
      </div>
    </TutorLayout>
  );
}