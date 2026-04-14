import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

const statusStyles = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-blue-200 bg-blue-50 text-blue-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  default: "border-slate-200 bg-slate-50 text-slate-600",
};

function StatusBadge({ value }) {
  const tone = statusStyles[value] ?? statusStyles.default;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}>
      {value ?? "—"}
    </span>
  );
}

export default function Index({ skill, recommendations, filters, activeRecommendation = null }) {
  const data = recommendations?.data ?? [];
  const currentPage = recommendations?.current_page ?? 1;
  const lastPage = recommendations?.last_page ?? 1;
  const from = recommendations?.from ?? 0;
  const to = recommendations?.to ?? 0;
  const total = recommendations?.total ?? data.length;
  const perPage = filters?.per_page ?? recommendations?.per_page ?? 10;

  const appendRecipientsHref = (recommendationId) =>
    route("admin.skills.recommend.recipients.store", { skill: skill.id, recommendation: recommendationId });

  const goToPage = (page) => {
    router.get(
      route("admin.skills.recommend.index", skill.id),
      { page, per_page: perPage },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleAddRecipients = (recommendationId) => {
    router.visit(appendRecipientsHref(recommendationId));
  };

  return (
    <AdminLayout headerTitle="Skill Recommendations" tabName="Talent" openedMenu="talent" activeSubmenu="talent.skills">
      <Head title={`${skill?.name ?? "Skill"} Recommendations`} />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Skills", href: "admin.skills.index" },
                {
                  label: skill?.name ?? "Skill",
                  href: "admin.skills.show",
                  params: skill?.id,
                },
                { label: "Recommendations" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                {skill?.name ?? "Skill"} Recommendations
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review recommendations already sent for this skill and add more employees when needed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route("admin.skills.show", skill?.id)}>Back</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">{skill?.name ?? "—"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">{total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">
                {data.filter((item) => item.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">
                {data.reduce(
                  (count, item) =>
                    count + (item.recipients?.filter((recipient) => recipient.registration_status === "pending").length ?? 0),
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((recommendation) => {
              const canAppendRecipients = recommendation.status === "active";

              return (
                <Card key={recommendation.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="space-y-2">
                      <CardTitle className="text-base text-slate-900">Recommendation #{recommendation.id}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>By {recommendation.recommended_by ?? "—"}</span>
                        <span>•</span>
                        <span>{recommendation.recommended_at ?? "—"}</span>
                        <span>•</span>
                        <span>{recommendation.recipient_count} staff</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge value={recommendation.status} />
                      {canAppendRecipients ? (
                        <Button type="button" onClick={() => handleAddRecipients(recommendation.id)}>
                          Add employee
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {recommendation.reason ? (
                      <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                        {recommendation.reason}
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-slate-900">Recipients</div>

                      <div className="overflow-hidden rounded-lg border">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Email</th>
                              <th className="px-4 py-3">Department</th>
                              <th className="px-4 py-3">Position</th>
                              <th className="px-4 py-3">Registration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {recommendation.recipients?.length > 0 ? (
                              recommendation.recipients.map((recipient) => (
                                <tr key={recipient.id} className="text-sm text-slate-700">
                                  <td className="px-4 py-3 font-medium text-slate-900">{recipient.name ?? "—"}</td>
                                  <td className="px-4 py-3">{recipient.email ?? "—"}</td>
                                  <td className="px-4 py-3">{recipient.department_name ?? "—"}</td>
                                  <td className="px-4 py-3">{recipient.position_name ?? "—"}</td>
                                  <td className="px-4 py-3">
                                    <Badge variant="outline">{recipient.registration_status ?? "—"}</Badge>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                                  No recipients found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No recommendations have been created for this skill yet.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {from && to ? `${from}-${to}` : data.length} of {total} recommendations.
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {lastPage}
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={currentPage >= lastPage}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
