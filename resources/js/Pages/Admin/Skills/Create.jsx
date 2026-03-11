import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";

export default function Create({ departments = [], breadcrumbs = [] }) {
  const form = useForm({
    name: "",
    description: "",
    type: "skill",
    category: "Technical",
    applies_to_all_departments: true,
    department_id: "",
    is_active: true,
  });

  const submit = (e) => {
    e.preventDefault();
    form.post(route("admin.skills.store"), {
      preserveScroll: true,
      onSuccess: () => {},
    });
  };

  const showDepartmentSelect = !form.data.applies_to_all_departments;

  return (
    <AdminLayout
      headerTitle="Create Skill"
      tabName="Organization"
      openedMenu="talent"
      activeSubmenu="talent.skills"
    >
      <Head title="Create Skill" />

      <div className="max-w-6xl space-y-6">
        <Breadcrumbs
          items={
            breadcrumbs.length
              ? breadcrumbs
              : [
                  { label: "Admin", href: "admin.dashboard" },
                  { label: "Skills", href: "admin.skills.index" },
                  { label: "Create" },
                ]
          }
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Create Skill
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a skill/training/degree/course within the current organization.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={route("admin.skills.index")}>Back</Link>
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                placeholder="e.g. Computer literacy"
              />
              {form.errors.name ? (
                <div className="text-sm text-red-600">{form.errors.name}</div>
              ) : null}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={form.data.description}
                onChange={(e) => form.setData("description", e.target.value)}
                placeholder="Short description..."
              />
              {form.errors.description ? (
                <div className="text-sm text-red-600">
                  {form.errors.description}
                </div>
              ) : null}
            </div>

            {/* Type + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.data.type}
                  onValueChange={(v) => form.setData("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                  </SelectContent>
                </Select>
                {form.errors.type ? (
                  <div className="text-sm text-red-600">{form.errors.type}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.data.category}
                  onValueChange={(v) => form.setData("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                  </SelectContent>
                </Select>
                {form.errors.category ? (
                  <div className="text-sm text-red-600">
                    {form.errors.category}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Applies to all departments */}
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <div className="font-medium">Applies to all departments</div>
                <div className="text-sm text-muted-foreground">
                  Turn off to scope this skill to a specific department.
                </div>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 accent-[hsl(var(--primary))]"
                checked={!!form.data.applies_to_all_departments}
                onChange={(e) => {
                  const checked = e.target.checked;
                  form.setData("applies_to_all_departments", checked);
                  if (checked) form.setData("department_id", "");
                }}
              />
            </div>

            {/* Department */}
            {showDepartmentSelect ? (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={String(form.data.department_id || "")}
                  onValueChange={(v) => form.setData("department_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.department_id ? (
                  <div className="text-sm text-red-600">
                    {form.errors.department_id}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Active */}
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <div className="font-medium">Active</div>
                <div className="text-sm text-muted-foreground">
                  Inactive skills won’t show up in most pickers.
                </div>
              </div>

              <input
                type="checkbox"
                className="h-5 w-5 accent-[hsl(var(--primary))]"
                checked={!!form.data.is_active}
                onChange={(e) => form.setData("is_active", e.target.checked)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="submit"
                disabled={form.processing}
                className="bg-brand-primary text-brand-primary-foreground hover:opacity-95"
              >
                Create Skill
              </Button>
            </div>
            </div>

            <aside className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Tips
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep names consistent for easier reporting (e.g. “Computer Literacy”, “Excel Basics”).
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 border p-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Scope logic
                </div>
                <ul className="mt-2 text-sm text-slate-700 space-y-1 list-disc pl-4">
                  <li>System-wide skills are seeded and appear here as read-only items.</li>
                  <li>Skills you create are scoped to the current organization.</li>
                  <li>If not “all departments”, you must pick a department.</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Preview
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-medium text-slate-900">
                    {form.data.name || "Skill name..."}
                  </div>
                  <div className="text-muted-foreground">
                    {form.data.type} • {form.data.category}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    {form.data.applies_to_all_departments
                      ? "Applies to all departments"
                      : `Department scoped (ID: ${form.data.department_id || "—"})`}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
