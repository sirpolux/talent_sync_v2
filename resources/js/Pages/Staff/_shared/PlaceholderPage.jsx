import AdminLayout from "@/Layouts/AdminLayout";
import StaffLayout from "@/Layouts/StaffLayout";

export default function PlaceholderPage({ title, description }) {
  return (
    <AdminLayout
      title={title}
      actions={
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          Coming soon
        </span>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <p className="mt-2 text-sm text-slate-600">
          {description || "This section is being built."}
        </p>
      </div>
    </AdminLayout>
  );
}
