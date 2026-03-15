import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import PrimaryButton from "@/Components/PrimaryButton";
import DangerButton from "@/Components/DangerButton";
import Modal from "@/Components/Modal";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Show({ path, steps = [] }) {
    const { flash } = usePage().props;
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const grouped = useMemo(() => {
        const map = new Map();
        (steps || []).forEach((s) => {
            const key = s.track || "Default";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(s);
        });

        for (const [k, arr] of map.entries()) {
            arr.sort((a, b) => {
                const ao = a.order ?? Number.MAX_SAFE_INTEGER;
                const bo = b.order ?? Number.MAX_SAFE_INTEGER;
                if (ao !== bo) return ao - bo;
                return String(a.from_position_name || "").localeCompare(
                    String(b.from_position_name || "")
                );
            });
            map.set(k, arr);
        }

        return Array.from(map.entries()).map(([track, items]) => ({
            track,
            items,
        }));
    }, [steps]);

    const onDelete = () => {
        router.delete(route("admin.career-paths.destroy", path.id), {
            onFinish: () => setConfirmingDelete(false),
        });
    };

    return (
        <AdminLayout
            headerTitle="Career Path"
            tabName="Career Management"
            openedMenu="careers"
            activeSubmenu="careers.paths"
        >
            <Head title={`Career Path • ${path?.name ?? ""}`} />

            <div className="max-w-6xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Breadcrumbs
                            items={[
                                { label: "Admin", href: "admin.dashboard" },
                                { label: "Career Paths", href: "admin.career-paths.index" },
                                { label: path?.name ?? "Path" },
                            ]}
                        />

                        <div>
                            <h1 className="text-xl font-semibold text-[#1E3A8A]">
                                {path?.name}
                            </h1>
                            <div className="mt-1 text-sm text-slate-600">
                                {path?.description || "—"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                                Status:{" "}
                                {path?.is_active ? (
                                    <span className="font-semibold text-emerald-700">Active</span>
                                ) : (
                                    <span className="font-semibold text-slate-600">Inactive</span>
                                )}
                            </div>

                            {flash?.status ? (
                                <div className="mt-2 text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route("admin.career-paths.edit", path.id)}>
                            <PrimaryButton type="button">Edit</PrimaryButton>
                        </Link>
                        <DangerButton type="button" onClick={() => setConfirmingDelete(true)}>
                            Delete
                        </DangerButton>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Transitions
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Each transition represents an allowed move from one position to another within this path.
                    </p>

                    {steps.length === 0 ? (
                        <div className="mt-4 text-sm text-slate-600">
                            No transitions yet.
                        </div>
                    ) : (
                        <div className="mt-4 space-y-6">
                            {grouped.map((group) => (
                                <div key={group.track} className="rounded-xl border border-slate-200">
                                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                                        <div className="font-semibold text-slate-900">
                                            Track: {group.track}
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100">
                                        {group.items.map((s) => (
                                            <div key={s.id} className="px-4 py-3 flex items-center justify-between gap-4">
                                                <div className="text-sm text-slate-800">
                                                    <span className="font-semibold">{s.from_position_name ?? "—"}</span>{" "}
                                                    <span className="text-slate-400">→</span>{" "}
                                                    <span className="font-semibold">{s.to_position_name ?? "—"}</span>
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Order: {s.order ?? "—"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Delete career path?
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        This will permanently delete <span className="font-semibold">{path?.name}</span> and its transitions.
                    </p>

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
                            onClick={() => setConfirmingDelete(false)}
                        >
                            Cancel
                        </button>
                        <DangerButton type="button" onClick={onDelete}>
                            Delete
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
