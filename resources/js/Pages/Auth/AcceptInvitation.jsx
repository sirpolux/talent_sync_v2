import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function AcceptInvitation({ token, email, organization, expires_at }) {
  const { data, setData, post, processing, errors } = useForm({
    password: "",
    password_confirmation: "",
  });

  function submit(e) {
    e.preventDefault();
    post(route("org.invitations.accept.store", { token }));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Head title="Accept invitation" />

      <div className="w-full max-w-lg bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold text-slate-900">Accept invitation</h1>
          <p className="mt-1 text-sm text-slate-600">
            Set your password to finish joining{" "}
            <span className="font-semibold">{organization?.name ?? "the organization"}</span>.
          </p>
          {expires_at ? (
            <p className="mt-1 text-xs text-slate-500">
              Invite expires: {new Date(expires_at).toLocaleString()}
            </p>
          ) : null}
        </div>

        <form onSubmit={submit} className="px-6 py-6 space-y-5">
          <div>
            <InputLabel value="Email" />
            <TextInput className="mt-1 block w-full" value={email} disabled />
          </div>

          <div>
            <InputLabel value="Create password" />
            <TextInput
              type="password"
              className="mt-1 block w-full"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              autoFocus
              required
            />
            <InputError message={errors.password} className="mt-2" />
          </div>

          <div>
            <InputLabel value="Confirm password" />
            <TextInput
              type="password"
              className="mt-1 block w-full"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link href={route("login")} className="text-sm text-slate-600 hover:text-slate-900">
              Back to login
            </Link>

            <PrimaryButton disabled={processing}>
              {processing ? "Setting up..." : "Set password & continue"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
