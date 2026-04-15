import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ShieldCheck, LockKeyhole, KeyRound, AlertTriangle, Clock3, Sparkles } from "lucide-react";
import UpdatePasswordForm from "@/Pages/Profile/Partials/UpdatePasswordForm";

const bestPractices = [
  {
    title: "Use a unique password",
    description: "Avoid reusing passwords from personal accounts, email, or other admin systems.",
    icon: KeyRound,
  },
  {
    title: "Prefer a long passphrase",
    description: "Aim for at least 12 characters with a mix of words, symbols, and numbers.",
    icon: ShieldCheck,
  },
  {
    title: "Update after any exposure",
    description: "If your password may have been shared or used elsewhere, change it immediately.",
    icon: AlertTriangle,
  },
  {
    title: "Review access regularly",
    description: "Check active devices and account permissions whenever you update credentials.",
    icon: Clock3,
  },
];

const securityNotes = [
  "Do not share this password with other administrators.",
  "Use a password manager to generate and store strong credentials.",
  "Log out of shared devices after finishing your admin session.",
  "If available, enable two-factor authentication for added protection.",
];

function GuidanceItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A8A]/10 to-[#059669]/10 text-[#1E3A8A]">
        <Icon className="h-5 w-5" />
      </div>

      <div className="space-y-1">
        <div className="font-medium text-slate-900">{title}</div>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

export default function Password() {
  return (
    <AdminLayout
      headerTitle="Change Password"
      tabName="Account"
      openedMenu="account"
      activeSubmenu="password"
    >
      <Head title="Change Password" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#059669]/5" />
              <div className="relative space-y-5">
                <Breadcrumbs
                  items={[
                    { label: "Admin", href: "admin.dashboard" },
                    { label: "Account" },
                    { label: "Password" },
                  ]}
                />

                <div className="space-y-3">
                  <Badge variant="outline" className="border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A]">
                    Admin security
                  </Badge>

                  <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      Protect your admin account with a stronger password
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                      Update your password anytime to keep the admin panel secure. Use a unique, strong password and
                      follow the recommended security practices below to reduce the risk of unauthorized access.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm">
                    <LockKeyhole className="h-4 w-4" />
                    Secure account settings
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Recommended for admins
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-8 sm:px-8 lg:border-t-0 lg:border-l">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#059669] text-white shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Security status</div>
                    <div className="text-lg font-semibold text-slate-900">Password controls active</div>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {securityNotes.map((note) => (
                    <div key={note} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="leading-6">{note}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium text-amber-900">Admin reminder</div>
                      <p className="text-sm leading-6 text-amber-800">
                        Change your password immediately if you suspect any unusual sign-in activity or if you have
                        used the same password on other services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-white/60 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <LockKeyhole className="h-5 w-5 text-[#1E3A8A]" />
                Update password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <UpdatePasswordForm />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-white/60 bg-white/90 shadow-sm">
              <CardHeader className="border-b border-slate-200/80 bg-slate-50/80">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Password best practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {bestPractices.map((item) => (
                  <GuidanceItem
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/60 bg-gradient-to-br from-[#1E3A8A]/5 via-white to-[#059669]/5 shadow-sm">
              <CardHeader className="border-b border-slate-200/80">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Clock3 className="h-5 w-5 text-[#1E3A8A]" />
                  Quick checklist before saving
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  Make sure your new password is not tied to your name, role, or company details.
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  Confirm you can access your password manager or recovery method before signing out of any device.
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  Keep this page open until the password update is complete and you see the success confirmation.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}