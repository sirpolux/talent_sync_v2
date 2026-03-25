import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link } from "@inertiajs/react";
import { Award, BadgeCheck, BookOpenCheck, Clock3, PlusCircle, Sparkles } from "lucide-react";
import StatCard from "./Components/StatCard";
import SectionCard from "./Components/SectionCard";
import SkillCard from "./Components/SkillCard";
import CertificationCard from "./Components/CertificationCard";

export default function Index({
  trainer = null,
  assignedSkills = [],
  pendingSkills = [],
  availableSkills = [],
  certificationsBySpecialty = {},
}) {
  const groupedCertifications = Object.entries(certificationsBySpecialty || {}).map(([specialty, items]) => ({
    specialty,
    items: Array.isArray(items) ? items : [],
  }));

  const stats = [
    {
      title: "Assigned Skills",
      value: assignedSkills.length,
      hint: "Skills approved for teaching",
      icon: <BookOpenCheck className="h-5 w-5" />,
      tone: "emerald",
    },
    {
      title: "Pending Requests",
      value: pendingSkills.length,
      hint: "Awaiting review",
      icon: <Clock3 className="h-5 w-5" />,
      tone: "amber",
    },
    {
      title: "Available Skills",
      value: availableSkills.length,
      hint: "Requestable from your org",
      icon: <Sparkles className="h-5 w-5" />,
      tone: "indigo",
    },
    {
      title: "Certification Groups",
      value: groupedCertifications.length,
      hint: "Grouped by specialty",
      icon: <BadgeCheck className="h-5 w-5" />,
      tone: "slate",
    },
  ];

  return (
    <TutorLayout headerTitle="Skills & Certifications">
      <Head title="Skills & Certifications" />

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
                <Award className="h-4 w-4" />
                Trainer profile
              </div>
              <h1 className="mt-3 text-3xl font-bold">Skills & Certifications</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Review your assigned skills, track pending requests, and manage certifications from separate pages.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
              <div className="font-medium">{trainer?.name ?? "Trainer"}</div>
              <div className="mt-1 text-white/75">{trainer?.email ?? trainer?.user_email ?? "Current trainer profile"}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <SectionCard
          title="Assigned Skills"
          description="Skills approved for your trainer profile."
          action={
            <Link
              href={route("trainer.skills.create")}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
            >
              <PlusCircle className="h-4 w-4" />
              Request Skill
            </Link>
          }
          emptyState={
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No assigned skills yet.
            </div>
          }
        >
          <div className="grid gap-3">
            {assignedSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                status={skill.status ?? "approved"}
                actionHref={route("trainer.skills.show", skill.id)}
                actionLabel="View"
              />
            ))}
          </div>
        </SectionCard>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Certifications</h2>
            <p className="mt-1 text-sm text-slate-600">
              Certifications are grouped by specialty and available on the certifications pages.
            </p>
          </div>

          <div className="p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {groupedCertifications.slice(0, 4).map((group) => (
                <div key={group.specialty} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">{group.specialty}</h3>
                    <span className="text-xs text-slate-500">{group.items.length} item{group.items.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="space-y-3">
                    {group.items.slice(0, 2).map((certification, index) => (
                      <CertificationCard key={certification.id ?? `${group.specialty}-${index}`} certification={certification} />
                    ))}
                    {!group.items.length ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                        No certifications in this specialty yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}