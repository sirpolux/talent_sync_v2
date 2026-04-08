import React, { useMemo, useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";

export default function Recommend({ skill, employees, filters }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState(filters?.search ?? "");

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
                  href: route("admin.skills.show", skill.id),
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
              disabled={selectedCount === 0}
              onClick={() => {
                router.post(
                  route("admin.skills.recommend.store", skill.id),
                  { organization_user_ids: selectedIds },
                  { preserveScroll: true }
                );
              }}
            >
              Recommend {selectedCount > 0 ? `(${selectedCount})` : ""}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No staff found for the current search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {rows.length} staff on this page.
              </div>
              <div>
                {employees?.links ? null : null}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
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
            </div>

            <div className="bg-slate-50 border rounded-xl p-5 text-sm text-slate-700">
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
