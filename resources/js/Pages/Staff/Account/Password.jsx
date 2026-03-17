import React from "react";
import StaffLayout from "@/Layouts/StaffLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head } from "@inertiajs/react";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";

export default function Password() {
  return (
    <StaffLayout
      headerTitle="Change Password"
      tabName="Account"
      openedMenu="account"
    >
      <Head title="Change Password" />

      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <Breadcrumbs
            items={[
              { label: "Staff", href: "staff.dashboard" },
              { label: "Account" },
              { label: "Change Password" },
            ]}
          />
          <h1 className="text-2xl font-bold text-brand-primary">
            Change password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update your password for this account.
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </StaffLayout>
  );
}
