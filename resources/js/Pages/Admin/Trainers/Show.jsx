import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link } from "@inertiajs/react";

function DetailCard({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-sm text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Show({ trainer }) {
  return (
    <AdminLayout>
      <Head title={`Trainer: ${trainer?.name ?? ""}`} />

      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "admin.dashboard" },
            { label: "Trainers", href: "admin.trainers.index" },
            { label: trainer?.name ?? "Trainer" },
          ]}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{trainer?.name ?? "-"}</h1>
            <p className="text-sm text-slate-600">{trainer?.email ?? "-"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={route("admin.trainers.index")} className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Back
            </Link>

            <Link href={route("admin.trainers.skills", trainer.id)} className="inline-flex items-center rounded-md bg-[#1E3A8A] px-4 py-2 text-sm font-medium text-white hover:bg-[#1E3A8A]/90">
              Skills
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard title="Membership Status" value={trainer?.membership_status ?? "-"} />
          <DetailCard title="Department" value={trainer?.department_name ?? "-"} />
          <DetailCard title="Position" value={trainer?.position_name ?? "-"} />
        </div>

        <Section title="Trainer Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailCard title="Profile Status" value={trainer?.profile?.status ?? "-"} />
            <DetailCard title="Headline" value={trainer?.profile?.headline ?? "-"} />
          </div>
        </Section>

        <Section title="Specialties">
          {trainer?.profile?.specialties?.length ? (
            <div className="space-y-4">
              {trainer.profile.specialties.map((specialty) => (
                <div key={specialty.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{specialty.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{specialty.description ?? "No description"}</div>

                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certifications</div>
                    {specialty.certifications?.length ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {specialty.certifications.map((cert) => (
                          <div key={cert.id} className="rounded-md border border-slate-200 bg-white p-3">
                            <div className="font-medium text-slate-900">{cert.name}</div>
                            <div className="text-sm text-slate-600">{cert.issuer ?? "Issuer not specified"}</div>
                            <div className="mt-2 text-xs text-slate-500">
                              {cert.credential_id ? <div>Credential ID: {cert.credential_id}</div> : null}
                              {cert.credential_url ? <div>Credential URL: {cert.credential_url}</div> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">No certifications added yet.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No specialties added yet.</div>
          )}
        </Section>
      </div>
    </AdminLayout>
  );
}
