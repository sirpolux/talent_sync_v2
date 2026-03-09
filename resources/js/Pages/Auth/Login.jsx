import { useMemo } from "react";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import Base from "../Home/Base";

import { BarChart3, GraduationCap, Lock, LogIn, Mail, Users } from "lucide-react";

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const highlights = useMemo(
    () => [
      {
        icon: <GraduationCap />,
        title: "Training-Driven HR",
        text: "Manage employee learning and development from one powerful platform.",
      },
      {
        icon: <BarChart3 />,
        title: "Skill Gap Insights",
        text: "Identify workforce capability gaps and close them through structured training.",
      },
      {
        icon: <Users />,
        title: "Promotion Readiness",
        text: "Promote employees based on verified competency and training data.",
      },
    ],
    []
  );

  const submit = (e) => {
    e.preventDefault();

    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <Base>
      <Head title="Log in" />

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT PANEL (Branding / Messaging) */}
        <div className="hidden lg:flex flex-col justify-center bg-indigo-600 text-white px-16">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome back
            <span className="block mt-2">to TalentSync</span>
          </h1>

          <p className="mt-6 text-indigo-100 text-lg">
            Continue managing skill development, training, and promotion readiness
            across your organization.
          </p>

          <div className="mt-10 space-y-6">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                {h.icon}
                <div>
                  <h3 className="font-semibold">{h.title}</h3>
                  <p className="text-indigo-200 text-sm">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL (FORM) */}
        <div className="flex items-center justify-center px-6 py-16 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Log in</h2>
              <p className="text-gray-600 mt-2">
                Access your dashboard and continue where you left off.
              </p>
            </div>

            {status ? (
              <div className="mb-4 text-sm font-medium text-green-600">
                {status}
              </div>
            ) : null}

            <form
              onSubmit={submit}
              className="bg-white p-8 rounded-xl border shadow-sm"
            >
              <div className="space-y-6">
                <div>
                  <InputLabel htmlFor="email" value="Work Email" />
                  <div className="relative mt-1">
                    <Mail
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <TextInput
                      id="email"
                      type="email"
                      name="email"
                      value={data.email}
                      className="pl-10 w-full"
                      autoComplete="username"
                      isFocused={true}
                      onChange={(e) => setData("email", e.target.value)}
                    />
                  </div>
                  <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                  <InputLabel htmlFor="password" value="Password" />
                  <div className="relative mt-1">
                    <Lock
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <TextInput
                      id="password"
                      type="password"
                      name="password"
                      value={data.password}
                      className="pl-10 w-full"
                      autoComplete="current-password"
                      onChange={(e) => setData("password", e.target.value)}
                    />
                  </div>
                  <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <Checkbox
                      name="remember"
                      checked={data.remember}
                      onChange={(e) => setData("remember", e.target.checked)}
                    />
                    <span className="ms-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>

                  {canResetPassword ? (
                    <Link
                      href={route("password.request")}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  ) : null}
                </div>

                <PrimaryButton disabled={processing} className="w-full justify-center">
                  <LogIn size={16} className="mr-2" />
                  Log in
                </PrimaryButton>

                <div className="text-center text-sm text-gray-600">
                  New to TalentSync?{" "}
                  <Link
                    href={route("register")}
                    className="text-indigo-600 hover:underline"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Base>
  );
}
