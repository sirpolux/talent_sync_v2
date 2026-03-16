import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Dashboard() {
  return (
    <AuthenticatedLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Trainer Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome. Your trainer dashboard modules will appear here.
        </p>
      </div>
    </AuthenticatedLayout>
  );
}
