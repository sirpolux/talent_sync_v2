import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, usePage } from "@inertiajs/react";

export default function Index({ paths = [] }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout
            headerTitle="Career Paths"
            tabName="Career Management"
            openedMenu="careers"
            activeSubmenu="careers.paths"
        >
            <Head title="Career Paths" />

            <div className="max-w-6xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Breadcrumbs
                            items={[
                                { label: "Admin", href: "admin.dashboard" },
                                { label: "Career Paths" },
                            ]}
                        />

                        <div>
                            <h1 className="text-xl font-semibold text-[#1E3A8A]">
                                Career Paths
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Create named career paths (tracks) and define allowed role-to-role moves within each path.
                            </p>

                            {flash?.status ? (
                                <div className="mt-2 text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link href={route("admin.career-paths.create")}>
                            <PrimaryButton type="button">Create Career Path</PrimaryButton>
                        </Link>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl">
                    <div className="p-6">
                        {paths.length === 0 ? (
                            <div className="text-sm text-slate-600">
                                No career paths yet. Create your first one.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {paths.map((p) => (
                                    <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                                        <div>
                                            <div className="font-semibold text-slate-900">
                                                {p.name}{" "}
                                                {!p.is_active ? (
                                                    <span className="ml-2 text-xs font-semibold text-slate-500">
                                                        (Inactive)
                                                    </span>
                                                ) : null}
                                            </div>
                                            {p.description ? (
                                                <div className="mt-1 text-sm text-slate-600">
                                                    {p.description}
                                                </div>
                                            ) : null}
                                            <div className="mt-1 text-xs text-slate-500">
                                                Steps: {p.steps_count ?? 0}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                className="text-sm font-semibold text-[#1E3A8A] hover:underline"
                                                href={route("admin.career-paths.show", p.id)}
                                            >
                                                View
                                            </Link>
                                            <Link
                                                className="text-sm font-semibold text-slate-700 hover:underline"
                                                href={route("admin.career-paths.edit", p.id)}
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
