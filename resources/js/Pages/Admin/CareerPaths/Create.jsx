import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

function emptyStep() {
    return { from_position_id: "", to_position_id: "", track: "", order: "" };
}

export default function Create({ positions = [] }) {
    const { errors } = usePage().props;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [steps, setSteps] = useState([emptyStep()]);
    const [saving, setSaving] = useState(false);

    const positionOptions = useMemo(
        () =>
            (positions || [])
                .map((p) => ({ id: p.id, name: p.name }))
                .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
        [positions]
    );

    const addStep = () => setSteps((prev) => [...prev, emptyStep()]);
    const removeStep = (idx) =>
        setSteps((prev) => prev.filter((_, i) => i !== idx));

    const updateStep = (idx, key, value) =>
        setSteps((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s))
        );

    const submit = (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            name,
            description: description || null,
            is_active: isActive,
            steps: (steps || [])
                .filter((s) => s.from_position_id && s.to_position_id)
                .map((s) => ({
                    from_position_id: Number(s.from_position_id),
                    to_position_id: Number(s.to_position_id),
                    track: s.track || null,
                    order: s.order === "" ? null : Number(s.order),
                })),
        };

        router.post(route("admin.career-paths.store"), payload, {
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AdminLayout
            headerTitle="Create Career Path"
            tabName="Career Management"
            openedMenu="careers"
            activeSubmenu="careers.paths"
        >
            <Head title="Create Career Path" />

            <div className="max-w-4xl space-y-4">
                <Breadcrumbs
                    items={[
                        { label: "Admin", href: "admin.dashboard" },
                        { label: "Career Paths", href: "admin.career-paths.index" },
                        { label: "Create" },
                    ]}
                />

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
                    <h1 className="text-xl font-semibold text-[#1E3A8A]">
                        Create Career Path
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Name your path and add role-to-role transitions (edges). You can create branches by adding multiple steps.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <InputLabel value="Name" />
                                <input
                                    className="mt-1 w-full rounded-lg border-slate-200"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Backend Engineering"
                                />
                                <InputError message={errors?.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel value="Description" />
                                <textarea
                                    className="mt-1 w-full rounded-lg border-slate-200"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional"
                                />
                                <InputError message={errors?.description} className="mt-2" />
                            </div>

                            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                Active
                            </label>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-slate-900">
                                    Transitions (Steps)
                                </div>
                                <button
                                    type="button"
                                    onClick={addStep}
                                    className="text-sm font-semibold text-[#1E3A8A] hover:underline"
                                >
                                    + Add step
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {steps.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end rounded-xl bg-slate-50 p-4 border border-slate-100"
                                    >
                                        <div className="md:col-span-4">
                                            <InputLabel value="From position" />
                                            <select
                                                className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                                                value={s.from_position_id}
                                                onChange={(e) =>
                                                    updateStep(idx, "from_position_id", e.target.value)
                                                }
                                            >
                                                <option value="">— Select —</option>
                                                {positionOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-4">
                                            <InputLabel value="To position" />
                                            <select
                                                className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                                                value={s.to_position_id}
                                                onChange={(e) =>
                                                    updateStep(idx, "to_position_id", e.target.value)
                                                }
                                            >
                                                <option value="">— Select —</option>
                                                {positionOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="md:col-span-2">
                                            <InputLabel value="Track" />
                                            <input
                                                className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                                                value={s.track}
                                                onChange={(e) => updateStep(idx, "track", e.target.value)}
                                                placeholder="Optional"
                                            />
                                        </div>

                                        <div className="md:col-span-1">
                                            <InputLabel value="Order" />
                                            <input
                                                type="number"
                                                className="mt-1 w-full rounded-lg border-slate-200 text-sm"
                                                value={s.order}
                                                onChange={(e) => updateStep(idx, "order", e.target.value)}
                                                placeholder="—"
                                                min={0}
                                            />
                                        </div>

                                        <div className="md:col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeStep(idx)}
                                                className="text-sm font-semibold text-red-600 hover:underline"
                                                disabled={steps.length === 1}
                                                title={steps.length === 1 ? "Keep at least one row" : "Remove"}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <InputError message={errors?.steps} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <PrimaryButton type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Create"}
                            </PrimaryButton>

                            <button
                                type="button"
                                className="text-sm font-semibold text-slate-700 hover:underline"
                                onClick={() => router.visit(route("admin.career-paths.index"))}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
