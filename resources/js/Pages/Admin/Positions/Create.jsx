import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Create({ departments, positions, levels, durationTypes }) {
    const { flash } = usePage().props;

    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedReportsTo, setSelectedReportsTo] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        department_id: "",
        responsibilities: "",
        level: "",
        min_months_in_role: "",
        duration_before_promotion: "",
        duration_before_promotion_type: "",
        reports_to: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("admin.positions.store"));
    };

    return (
        <AdminLayout
            headerTitle="Add Position"
            tabName="Organization"
            openedMenu="org"
            activeSubmenu="org.positions"
        >
            <Head title="Add Position" />

            <div className="max-w-4xl space-y-4">
                <div className="space-y-2">
                    <Breadcrumbs
                        items={[
                            { label: "Admin", href: "admin.dashboard" },
                            { label: "Positions", href: "admin.positions.index" },
                            { label: "Create" },
                        ]}
                    />

                    <div>
                        <h1 className="text-xl font-semibold text-[#1E3A8A]">
                            Create position
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Positions are scoped to the current organization.
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
                            Define the position requirements and responsibilities.
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
                                    onChange={(e) => setData("department_id", e.target.value)}
                                >
                                    <option value="">Select department</option>
                                    {departments?.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name} {dept.department_code && `(${dept.department_code})`}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.department_id} className="mt-2" />
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
                                    {levels?.map((level) => (
                                        <option key={level} value={level}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.level} className="mt-2" />
                            </div>

                            {/* Min Months in Role */}
                            <div>
                                <InputLabel value="Minimum months in role" />
                                <TextInput
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.min_months_in_role}
                                    onChange={(e) => setData("min_months_in_role", e.target.value)}
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
                                onChange={(e) => setData("responsibilities", e.target.value)}
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
                                        onChange={(e) => setData("duration_before_promotion", e.target.value)}
                                        min="1"
                                        placeholder="e.g. 18"
                                    />
                                    <InputError message={errors.duration_before_promotion} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Duration type" />
                                    <select
                                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.duration_before_promotion_type}
                                        onChange={(e) => setData("duration_before_promotion_type", e.target.value)}
                                    >
                                        <option value="">Select type</option>
                                        {durationTypes?.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.duration_before_promotion_type} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* Reports To - Optional */}
                        <div>
                            <InputLabel value="Reports to (optional)" />
                            <select
                                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.reports_to}
                                onChange={(e) => setData("reports_to", e.target.value)}
                            >
                                <option value="">Select reporting position</option>
                                {positions?.map((position) => (
                                    <option key={position.id} value={position.id}>
                                        {position.name} ({position.level})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.reports_to} className="mt-2" />
                            <div className="mt-1 text-xs text-slate-500">
                                Select the position this role reports to
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
                                {processing ? "Creating..." : "Create position"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}