import AdminLayout from "@/Layouts/AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout
      headerTitle="Admin Dashboard"
      tabName="Overview"
      openedMenu="overview"
      activeSubmenu={null}
    >
      <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800">Home</h3>
        <p className="mt-2 text-sm text-slate-600">
          This page is intentionally empty for now. Stats and key metrics will
          appear here as we progress.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Staff seats</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">—</div>
            <div className="mt-2 text-xs text-slate-500">
              Trial/quota summary will be shown here.
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Training requests</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">—</div>
            <div className="mt-2 text-xs text-slate-500">
              Pending/approved counts will be shown here.
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <div className="text-xs text-slate-500">Skill gap</div>
            <div className="mt-1 text-2xl font-semibold text-slate-800">—</div>
            <div className="mt-2 text-xs text-slate-500">
              Department-level overview will be shown here.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
