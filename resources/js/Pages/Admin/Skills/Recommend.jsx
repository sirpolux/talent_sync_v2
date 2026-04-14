import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  verified: "border-blue-200 bg-blue-50 text-blue-700",
  training: "border-violet-200 bg-violet-50 text-violet-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  default: "border-slate-200 bg-slate-50 text-slate-600",
};

function StatusChip({ label, tone = "default" }) {
  const toneClass = statusStyles[tone] ?? statusStyles.default;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}

function StatusStack({ employee }) {
  const cues = [];

  if (employee?.has_skill) {
    cues.push({ label: "Has skill", tone: "verified" });
  }

  if (employee?.is_in_training) {
    cues.push({ label: "In training", tone: "training" });
  }

  if (employee?.recommendation_status === "pending") {
    cues.push({ label: "Recommendation pending", tone: "pending" });
  }

  if (!cues.length) {
    cues.push({ label: "Available", tone: "default" });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cues.map((cue) => (
        <StatusChip key={cue.label} label={cue.label} tone={cue.tone} />
      ))}
    </div>
  );
}

export default function Recommend({ skill, employees, filters }) {
  const { flash = {} } = usePage().props;
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState(filters?.search ?? "");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const rows = employees?.data ?? [];

  const toggleEmployee = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = rows.map((employee) => employee.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])));
  };

  const selectedCount = selectedIds.length;

  const goSearch = () => {
    router.get(
      route("admin.skills.recommend.create", skill.id),
      { search, per_page: filters?.per_page ?? 10 },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const currentPageIds = useMemo(() => rows.map((employee) => employee.id), [rows]);
  const allVisibleSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

  const handleSubmit = () => {
    if (selectedCount === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    router.post(
      route("admin.skills.recommend.store", skill.id),
      {
        organization_user_ids: selectedIds,
        reason,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedIds([]);
          setReason("");
          setSubmitError("");
          setSubmitSuccess("Skill recommendation sent successfully.");
        },
        onError: (errors) => {
          setSubmitSuccess("");
          setSubmitError(
            errors?.organization_user_ids ||
              errors?.reason ||
              "Unable to send the recommendation. Please review the form and try again."
          );
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <AdminLayout
      headerTitle="Recommend Skill"
      tabName="Talent"
      openedMenu="talent"
      activeSubmenu="talent.skills"
    >
      <Head title={`Recommend ${skill?.name ?? "Skill"}`} />

      <div className="max-w-6xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs
              items={[
                { label: "Admin", href: "admin.dashboard" },
                { label: "Skills", href: "admin.skills.index" },
                {
                  label: skill?.name ?? "Skill",
                  href: "admin.skills.show",
                  params: skill.id,
                },
                { label: "Recommend" },
              ]}
            />

            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                Recommend {skill?.name ?? "Skill"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Search and select staff members to recommend this skill.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route("admin.skills.show", skill.id)}>Back</Link>
            </Button>

            <Button
              type="button"
              disabled={selectedCount === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? "Sending..."
                : `Recommend ${selectedCount > 0 ? `(${selectedCount})` : ""}`}
            </Button>
          </div>
        </div>

        {(flash?.status || submitError || submitSuccess) && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              submitError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {submitError || submitSuccess || flash.status}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-slate-900">Recommendations for this skill</p>
            <p className="text-sm text-muted-foreground">
              Review current recommendations, training progress, and staff who already have this skill.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={route("admin.skills.show", skill.id)}>View skill recommendations</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">Search staff</label>
                <div className="mt-1 flex gap-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        goSearch();
                      }
                    }}
                    placeholder="Search by name, email, department or position"
                  />
                  <Button type="button" variant="outline" onClick={goSearch}>
                    Search
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={toggleAllVisible}>
                  {allVisibleSelected ? "Unselect page" : "Select page"}
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-56">Skill Signals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length > 0 ? (
                    rows.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(employee.id)}
                            onChange={() => toggleEmployee(employee.id)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </TableCell>
                        <TableCell>{employee.position_name ?? "—"}</TableCell>
                        <TableCell>{employee.department_name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.membership_status ?? "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusStack employee={employee} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No staff found for the current search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>Showing {rows.length} staff on this page.</div>
              <div>{employees?.links ? null : null}</div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Recommendation summary</div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Skill</span>
                  <span className="font-medium text-slate-900">{skill?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Selected staff</span>
                  <span className="font-medium text-slate-900">{selectedCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="recommendation-reason">
                  Reason (optional)
                </label>
                <textarea
                  id="recommendation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Add a short note to explain this recommendation"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Suggestion</p>
              <p className="mt-2">
                Consider adding a confirmation step before submission so the admin can review
                the selected staff list and avoid duplicate recommendations.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}