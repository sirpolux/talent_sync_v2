import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, usePage } from "@inertiajs/react";
import PositionsTable from "./PositionsTable";

export default function Index({ positions, search, pagination }) {
    const { flash } = usePage().props;

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

                <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
                    <PositionsTable positions={positions} search={search} pagination={pagination} />
                </div>
            </div>
        </AdminLayout>
    );
}