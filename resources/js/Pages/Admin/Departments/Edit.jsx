import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({ department, status }) {
  const { flash } = usePage().props;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data, setData, patch, delete: destroy, processing, errors } = useForm({
    name: department?.name ?? "",
    department_code: department?.department_code ?? "",
    description: department?.description ?? "",
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route("admin.departments.update", department.id));
  };

  const onDelete = (e) => {
    e.preventDefault();
    destroy(route("admin.departments.destroy", department.id), {
      preserveScroll: true,
      onFinish: () => setConfirmingDelete(false),
    });
  };

  return (
    <AdminLayout
      headerTitle="Edit Department"
      tabName="Organization"
      openedMenu="org"
      activeSubmenu="org.departments"
    >
      <Head title="Edit Department" />

      <div className="max-w-3xl space-y-4">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Admin", href: "admin.dashboard" },
              { label: "Departments", href: "admin.departments.index" },
              { label: department?.name ?? "Edit" },
            ]}
          />

          <div>
            <h1 className="text-xl font-semibold text-[#1E3A8A]">
              Edit department
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Update department details.
            </p>

            {status ? (
              <div className="mt-2 text-sm font-medium text-emerald-700">
                {status}
              </div>
            ) : null}

            {flash?.status ? (
              <div className="mt-2 text-sm font-medium text-emerald-700">
                {flash.status}
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6 space-y-6">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <InputLabel value="Department name" />
              <TextInput
                className="mt-1 block w-full"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                required
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <InputLabel value="Department code (optional)" />
              <TextInput
                className="mt-1 block w-full"
                value={data.department_code}
                onChange={(e) => setData("department_code", e.target.value)}
                maxLength={20}
              />
              <InputError message={errors.department_code} className="mt-2" />
            </div>

            <div>
              <InputLabel value="Description" />
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
              />
              <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={route("admin.departments.index")}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-800 font-semibold hover:bg-slate-50"
              >
                Cancel
              </Link>
              <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Delete department
              </div>
              <div className="text-xs text-slate-600">
                This action cannot be undone.
              </div>
            </div>

            <DangerButton type="button" onClick={() => setConfirmingDelete(true)}>
              Delete
            </DangerButton>
          </div>
        </div>
      </div>

      <Modal show={confirmingDelete} onClose={() => setConfirmingDelete(false)}>
        <form onSubmit={onDelete} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Delete this department?
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            This will permanently delete <span className="font-semibold">{department.name}</span>.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton type="button" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </SecondaryButton>

            <DangerButton disabled={processing}>Delete</DangerButton>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
