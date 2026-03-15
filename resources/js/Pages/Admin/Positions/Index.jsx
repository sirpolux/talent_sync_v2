import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";
import PositionsTable from "./PositionsTable";

export default function Index({
    positions,
    search,
    pagination,
    departments = [],
    department_id,
}) {
    const { flash } = usePage().props;

    const selectedDepartmentId =
        department_id === null || department_id === undefined ? "" : String(department_id);

    const handleDepartmentChange = (e) => {
        const next = e.target.value; // '' | 'org-wide' | '<id>'
        const url = new URL(window.location);

        if (next) {
            url.searchParams.set("department_id", next);
        } else {
            url.searchParams.delete("department_id");
        }

        // reset page
        url.searchParams.set("page", 1);

        // preserve search (no-op; but ensure empty search isn't kept)
        if (!search) {
            url.searchParams.delete("search");
        }

        window.location.href = url.toString();
    };

    return (
        <AdminLayout
            headerTitle="Positions"
            tabName="Organization"
            openedMenu="org"
            activeSubmenu="org.positions"
        >
            <Head title="Positions" />

            <div className="max-w-6xl space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Breadcrumbs
                            items={[
                                { label: "Admin", href: "admin.dashboard" },
                                { label: "Positions" },
                            ]}
                        />

                        <div>
                            <h1 className="text-xl font-semibold text-[#1E3A8A]">
                                Positions
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Create and manage positions within the current
                                organization.
                            </p>
                            {flash?.status ? (
                                <div className="mt-2 text-sm font-medium text-emerald-700">
                                    {flash.status}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <Link
                        href={route("admin.positions.create")}
                        className="inline-flex items-center justify-center rounded-lg bg-[#1E3A8A] px-4 py-2 text-white font-semibold hover:opacity-95"
                    >
                        Add Position
                    </Link>
                </div>

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-sm font-medium text-slate-700">
                            Department
                        </div>

                        <select
                            value={selectedDepartmentId}
                            onChange={handleDepartmentChange}
                            className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                        >
                            <option value="">All departments</option>
                            <option value="org-wide">
                                Org-wide (No department)
                            </option>
                            {departments.map((d) => (
                                <option key={d.id} value={String(d.id)}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <PositionsTable
                        positions={positions}
                        search={search}
                        pagination={pagination}
                        departmentId={selectedDepartmentId}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
