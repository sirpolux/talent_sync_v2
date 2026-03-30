import { Head, Link, useForm } from "@inertiajs/react";
import Base from "../Home/Base";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

import { Building2, CheckCircle2, Mail, Lock, ArrowRight } from "lucide-react";

export default function AcceptInvitation({
  token,
  email,
  organization,
  expires_at,
}) {
  const { data, setData, post, processing, errors } = useForm({
    password: "",
    password_confirmation: "",
  });

  function submit(e) {
    e.preventDefault();
    post(route("org.invitations.accept.store", { token }));
  }

  return (
    <Base>
      <Head title="Accept invitation" />

      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-emerald-600 text-white px-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
            <CheckCircle2 size={16} />
            Invitation received
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight">
            Welcome to
            <span className="block mt-2">
              {organization?.name ?? "TalentSync"}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-blue-100 text-lg">
            Complete your account setup to join the organization and start
            using your new workspace.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex items-start gap-4">
              <Building2 className="mt-1 text-emerald-300" size={22} />
              <div>
                <h3 className="font-semibold">Branded onboarding</h3>
                <p className="text-blue-100 text-sm">
                  Join a polished, centralized HR experience designed for your
                  team.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Lock className="mt-1 text-emerald-300" size={22} />
              <div>
                <h3 className="font-semibold">Secure account setup</h3>
                <p className="text-blue-100 text-sm">
                  Create a password to secure your account and access your
                  invitation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 text-emerald-300" size={22} />
              <div>
                <h3 className="font-semibold">Quick continuation</h3>
                <p className="text-blue-100 text-sm">
                  Finish setup in just a moment and continue into the
                  application.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-emerald-600 text-white shadow-lg shadow-[#1E3A8A]/20">
                <Building2 size={26} />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Accept invitation
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Set your password to finish joining{" "}
                <span className="font-semibold text-slate-800">
                  {organization?.name ?? "the organization"}
                </span>
                .
              </p>

              {expires_at ? (
                <p className="mt-3 text-xs text-slate-500">
                  Invite expires: {new Date(expires_at).toLocaleString()}
                </p>
              ) : null}
            </div>

            <form
              onSubmit={submit}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60"
            >
              <div className="space-y-6">
                <div>
                  <InputLabel htmlFor="email" value="Email address" />
                  <div className="relative mt-1">
                    <Mail
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <TextInput
                      id="email"
                      type="email"
                      value={email}
                      className="w-full pl-10 bg-slate-50"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <InputLabel htmlFor="password" value="Create password" />
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <TextInput
                      id="password"
                      type="password"
                      name="password"
                      value={data.password}
                      className="w-full pl-10"
                      autoFocus
                      autoComplete="new-password"
                      onChange={(e) => setData("password", e.target.value)}
                    />
                  </div>
                  <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                  <InputLabel
                    htmlFor="password_confirmation"
                    value="Confirm password"
                  />
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-3 text-slate-400"
                      size={18}
                    />
                    <TextInput
                      id="password_confirmation"
                      type="password"
                      name="password_confirmation"
                      value={data.password_confirmation}
                      className="w-full pl-10"
                      autoComplete="new-password"
                      onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                      }
                    />
                  </div>
                  <InputError
                    message={errors.password_confirmation}
                    className="mt-2"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={route("login")}
                    className="text-sm font-medium text-slate-600 transition hover:text-[#1E3A8A]"
                  >
                    Back to login
                  </Link>

                  <PrimaryButton
                    disabled={processing}
                    className="inline-flex w-full justify-center sm:w-auto"
                  >
                    {processing ? "Setting up..." : "Set password & continue"}
                    <ArrowRight size={16} className="ml-2" />
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Base>
  );
}