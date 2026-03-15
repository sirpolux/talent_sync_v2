import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Edit({
    position,
    departments,
    positions,
    levels,
    durationTypes,
}) {
    const { flash } = usePage().props;

    const { data, setData, patch, processing, errors } = useForm({
        name: position?.name ?? "",
        department_id: position?.department_id ?? "",
        responsibilities: position?.responsibilities ?? "",
        level: position?.level ?? "",
        min_months_in_role: position?.min_months_in_role ?? "",
        duration_before_promotion: position?.duration_before_promotion ?? "",
        duration_before_promotion_type: position?.duration_before_promotion_type ?? "",
        reports_to_position_id: position?.reports_to_position_id ?? "",
    });

    const departmentSelected = !!data.department_id;

    const managementLevelsAll = new Set(["senior", "lead", "manager", "director"]);
    const managementLevelsNoDept = new Set(["manager", "director"]);

    const allowedLevels = departmentSelected
        ? levels
        : levels?.filter((l) => l === "manager" || l === "director");

    const reportingOptions = (positions ?? []).filter((p) => {
        if (!p?.id) return false;

        // prevent self-reporting option
        if (String(p.id) === String(position?.id)) return false;

        // If no department is selected: only allow Manager/Director positions.
        if (!departmentSelected) {
            return managementLevelsNoDept.has(p.level);
        }

        // If department is selected:
        // - same department, OR
        // - management levels (senior/lead/manager/director) across org.
        const sameDepartment =
            String(p.department_id ?? "") === String(data.department_id);
        const isManagement = managementLevelsAll.has(p.level);

        return sameDepartment || isManagement;
    });

    const onDepartmentChange = (deptId) => {
        setData((prev) => {
            const next = { ...prev, department_id: deptId };

            if (!deptId) {
                // leadership-only levels
                if (
                    next.level &&
                    next.level !== "manager" &&
                    next.level !== "director"
                ) {
                    next.level = "";
                }

                // reports-to must be manager/director (or empty)
                const selected = (positions ?? []).find(
                    (p) => String(p.id) === String(next.reports_to_position_id)
                );
                if (selected && !managementLevelsNoDept.has(selected.level)) {
                    next.reports_to_position_id = "";
                }
            } else {
                // If dept changes, clear reports-to if it becomes invalid.
                const selected = (positions ?? []).find(
                    (p) => String(p.id) === String(next.reports_to_position_id)
                );
                if (selected) {
                    const sameDepartment =
                        String(selected.department_id ?? "") === String(deptId);
                    const isManagement = managementLevelsAll.has(selected.level);
                    if (!sameDepartment && !isManagement) {
                        next.reports_to_position_id = "";
                    }
                }
            }

            return next;
        });
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route("admin.positions.update", position.id));
    };

    return (
        <AdminLayout
            headerTitle="Edit Position"
            tabName="Organization"
            openedMenu="org"
            activeSubmenu="org.positions"
        >
            <Head title="Edit Position" />

            <div className="max-w-4xl space-y-4">
                <div className="space-y-2">
                    <Breadcrumbs
                        items={[
                            { label: "Admin", href: "admin.dashboard" },
                            { label: "Positions", href: "admin.positions.index" },
                            { label: "Edit" },
                        ]}
                    />

                    <div>
                        <h1 className="text-xl font-semibold text-[#1E3A8A]">
                            Edit position
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Update position details for the current organization.
                        </p>
                        {flash?.status ? (
                            <div className="mt-2 text-sm font-medium text-emerald-700">
                                {flash.status}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200/60">
                        <div className="text-sm font-semibold text-slate-900">
                            Position details
                        </div>
                        <div className="text-xs text-slate-600">
                            Edit the position requirements and responsibilities.
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6 p-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Position Name */}
                            <div>
                                <InputLabel value="Position name" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    required
                                    placeholder="e.g. Senior Software Engineer"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Department */}
                            <div>
                                <InputLabel value="Department" />
                                <select
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.department_id}
                                    onChange={(e) => onDepartmentChange(e.target.value)}
                                >
                                    <option value="">Select department</option>
                                    {departments?.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}{" "}
                                            {dept.department_code &&
                                                `(${dept.department_code})`}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.department_id} className="mt-2" />
                                <div className="mt-1 text-xs text-slate-500">
                                    Tip: Leave department empty for organization-wide leadership roles
                                    (Manager/Director only).
                                </div>
                            </div>

                            {/* Level */}
                            <div>
                                <InputLabel value="Level" />
                                <select
                                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.level}
                                    onChange={(e) => setData("level", e.target.value)}
                                >
                                    <option value="">Select level</option>
                                    {allowedLevels?.map((level) => (
                                        <option key={level} value={level}>
                                            {level.charAt(0).toUpperCase() +
                                                level.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.level} className="mt-2" />
                                {!departmentSelected ? (
                                    <div className="mt-1 text-xs text-slate-500">
                                        No department selected: this is treated as an organization-wide
                                        leadership role (Manager/Director only).
                                    </div>
                                ) : (
                                    <div className="mt-1 text-xs text-slate-500">
                                        Tip: Choose the level within the selected department.
                                    </div>
                                )}
                            </div>

                            {/* Min Months in Role */}
                            <div>
                                <InputLabel value="Minimum months in role" />
                                <TextInput
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.min_months_in_role}
                                    onChange={(e) =>
                                        setData("min_months_in_role", e.target.value)
                                    }
                                    min="0"
                                    placeholder="e.g. 12"
                                />
                                <InputError message={errors.min_months_in_role} className="mt-2" />
                                <div className="mt-1 text-xs text-slate-500">
                                    Minimum time required before considering promotion
                                </div>
                            </div>
                        </div>

                        {/* Responsibilities */}
                        <div>
                            <InputLabel value="Responsibilities" />
                            <textarea
                                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                rows={4}
                                value={data.responsibilities}
                                onChange={(e) =>
                                    setData("responsibilities", e.target.value)
                                }
                                placeholder="Describe the main responsibilities and duties for this position..."
                            />
                            <InputError message={errors.responsibilities} className="mt-2" />
                        </div>

                        {/* Promotion Settings */}
                        <div className="space-y-4">
                            <div className="text-sm font-semibold text-slate-900">
                                Promotion settings
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Duration before promotion" />
                                    <TextInput
                                        type="number"
                                        className="mt-1 block w-full"
                                        value={data.duration_before_promotion}
                                        onChange={(e) =>
                                            setData(
                                                "duration_before_promotion",
                                                e.target.value
                                            )
                                        }
                                        min="1"
                                        placeholder="e.g. 18"
                                    />
                                    <InputError
                                        message={errors.duration_before_promotion}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Duration type" />
                                    <select
                                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.duration_before_promotion_type}
                                        onChange={(e) =>
                                            setData(
                                                "duration_before_promotion_type",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">Select type</option>
                                        {durationTypes?.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() +
                                                    type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.duration_before_promotion_type}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reports To - Optional */}
                        <div>
                            <InputLabel value="Reports to (optional)" />
                            <select
                                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.reports_to_position_id}
                                onChange={(e) =>
                                    setData("reports_to_position_id", e.target.value)
                                }
                            >
                                <option value="">
                                    {!departmentSelected
                                        ? "Select a Manager/Director (optional)"
                                        : "Select reporting position (optional)"}
                                </option>
                                {reportingOptions?.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.level})
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={errors.reports_to_position_id || errors.reports_to}
                                className="mt-2"
                            />
                            <div className="mt-1 text-xs text-slate-500">
                                {!departmentSelected
                                    ? "Tip: Without a department, only Manager/Director positions can be selected."
                                    : "Tip: You can report to a role in the same department, or org-wide leadership (Senior/Lead/Manager/Director)."}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-200/60">
                            <Link
                                href={route("admin.positions.index")}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? "Saving..." : "Save changes"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
