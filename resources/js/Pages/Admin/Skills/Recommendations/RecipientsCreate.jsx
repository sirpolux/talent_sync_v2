import React, { useMemo, useState } from "react";
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

function Pagination({ employees, filters, onPageChange, label = "employees" }) {
  const currentPage = employees?.current_page ?? 1;
  const lastPage = employees?.last_page ?? 1;
  const from = employees?.from ?? 0;
  const to = employees?.to ?? 0;
  const total = employees?.total ?? employees?.data?.length ?? 0;
  const perPage = filters?.per_page ?? employees?.per_page ?? 10;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        Showing {from && to ? `${from}-${to}` : employees?.data?.length ?? 0} of {total} {label}.
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {currentPage} of {lastPage}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function RecipientsCreate({ skill, recommendation, employees, filters, status }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const employeeData = employees?.data ?? [];
  const currentPage = employees?.current_page ?? 1;
  const perPage = filters?.per_page ?? employees?.per_page ?? 10;

  const recommendationId = recommendation?.id;
  const recommendationDate = recommendation?.recommended_at ?? recommendation?.created_at ?? "—";
  const recommendationReason = recommendation?.reason ?? "—";
  const recommendedBy = recommendation?.recommended_by ?? "—";

  const selectedCount = selectedIds.length;

  const allVisibleSelected = useMemo(
    () => employeeData.length > 0 && employeeData.every((employee) => selectedIds.includes(employee.organization_user_id)),
    [employeeData, selectedIds]
  );

  const toggleEmployee = (organizationUserId) => {
    setSelectedIds((current) =>
      current.includes(organizationUserId)
        ? current.filter((id) => id !== organizationUserId)
        : [...current, organizationUserId]
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !employeeData.some((employee) => employee.organization_user_id === id));
      }

      const visibleIds = employeeData.map((employee) => employee.organization_user_id);
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const goToPage = (page) => {
    router.get(
      route("admin.skills.recommend.recipients.create", {
        skill: skill?.id,
        recommendation: recommendationId,
        page,
        per_page: perPage,
      }),
      {},
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    router.post(
      route("admin.skills.recommend.recipients.store", {
        skill: skill?.id,
        recommendation: recommendationId,
      }),
      {
        organization_user_ids: selectedIds,
      },
      {
        preserveScroll: true,
        onSuccess: () => setSelectedIds([]),
      }
    );
  };

  return (
    <AdminLayout headerTitle="Skill Recommendations" tabName="Talent" openedMenu="talent" activeSubmenu="talent.skills">
      <Head title={`Add employees to ${skill?.name ?? "skill recommendation"}`} />

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
                {
                  label: "Recommendations",
                  href: "admin.skills.recommend.index",
                  params: skill?.id,
                },
                { label: "Add employees" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">Add employees to existing recommendation</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select employees to append to recommendation #{recommendationId ?? "—"} for {skill?.name ?? "this skill"}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route("admin.skills.recommend.index", skill?.id)}>Back to recommendations</Link>
            </Button>
          </div>
        </div>

        {status ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        ) : null}

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
              <CardTitle className="text-sm font-medium text-muted-foreground">Recommendation ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">#{recommendationId ?? "—"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge value={recommendation?.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recipient count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-slate-900">{recommendation?.recipient_count ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-slate-900">Recommendation details</CardTitle>
              <p className="text-sm text-muted-foreground">Context for the selected recommendation.</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Created date</span>
                  <span className="font-medium text-slate-900">{recommendationDate}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Recommended by</span>
                  <span className="font-medium text-slate-900">{recommendedBy}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge value={recommendation?.status} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Total participants</span>
                  <span className="font-medium text-slate-900">{recommendation?.recipient_count ?? 0}</span>
                </div>
              </div>

              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</div>
                <div className="mt-2 text-sm text-slate-700">{recommendationReason}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base text-slate-900">Already tied to recommendation</CardTitle>
              <p className="text-sm text-muted-foreground">Employees already included on this recommendation.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendation?.recipients?.length > 0 ? (
                recommendation.recipients.map((recipient) => (
                  <div key={recipient.id} className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{recipient.name ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">{recipient.email ?? "—"}</div>
                      </div>
                      <Badge variant="outline">{recipient.registration_status ?? "—"}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between gap-3">
                        <span>Department</span>
                        <span>{recipient.department_name ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Position</span>
                        <span>{recipient.position_name ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-white px-4 py-6 text-center text-sm text-muted-foreground">
                  No employees are currently tied to this recommendation.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base text-slate-900">Can be added</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose one or more employees to add to this existing recommendation.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={toggleAllVisible} disabled={employeeData.length === 0}>
                {allVisibleSelected ? "Unselect visible" : "Select visible"}
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="overflow-hidden rounded-lg border">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Select</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {employeeData.length > 0 ? (
                        employeeData.map((employee) => {
                          const checked = selectedIds.includes(employee.organization_user_id);

                          return (
                            <tr key={employee.organization_user_id} className="text-sm text-slate-700">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                  checked={checked}
                                  onChange={() => toggleEmployee(employee.organization_user_id)}
                                />
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-900">{employee.name ?? "—"}</td>
                              <td className="px-4 py-3">{employee.email ?? "—"}</td>
                              <td className="px-4 py-3">{employee.department_name ?? "—"}</td>
                              <td className="px-4 py-3">{employee.position_name ?? "—"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                            No employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedCount > 0 ? (
                      <span>
                        {selectedCount} employee{selectedCount === 1 ? "" : "s"} selected.
                      </span>
                    ) : (
                      <span>No employees selected.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedIds([])} disabled={selectedCount === 0}>
                      Clear
                    </Button>
                    <Button type="submit" disabled={selectedCount === 0}>
                      Add selected employees
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Pagination employees={employees} filters={filters} onPageChange={goToPage} label="employees available to add" />
      </div>
    </AdminLayout>
  );
}