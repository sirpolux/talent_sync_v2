import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";

export default function Password() {
  return (
    <AdminLayout
      headerTitle="Change Password"
      tabName="Account"
      openedMenu="account"
      activeSubmenu="password"
    >
      <Head title="Change Password" />

      <div className="max-w-3xl">
        <div className="bg-white/90 backdrop-blur border border-white/30 shadow-sm rounded-2xl p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </AdminLayout>
  );
}
