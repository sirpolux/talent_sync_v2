import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import Base from "../Home/Base";
import { MailCheck, RefreshCcw } from "lucide-react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <Base>
            <Head title="Verify Email" />

            <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gray-50">

                <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden">

                    {/* LEFT SIDE */}
                    <div className="bg-indigo-600 text-white p-10 flex flex-col justify-center">

                        <div className="max-w-md">

                            <div className="flex items-center mb-6">
                                <MailCheck size={36} />
                            </div>

                            <h1 className="text-3xl font-bold leading-tight mb-4">
                                Verify your email to activate TalentSync
                            </h1>

                            <p className="text-indigo-100 leading-relaxed">
                                You're just one step away from unlocking a smarter
                                approach to workforce development. Verify your
                                email address so we can securely activate your
                                TalentSync workspace.
                            </p>

                            <div className="mt-8 text-sm text-indigo-200">
                                Once verified, you'll be able to:
                                <ul className="mt-3 space-y-2 list-disc list-inside">
                                    <li>Onboard your company</li>
                                    <li>Add departments and teams</li>
                                    <li>Launch employee training programs</li>
                                    <li>Track workforce growth and development</li>
                                </ul>
                            </div>

                        </div>

                    </div>


                    {/* RIGHT SIDE */}
                    <div className="p-10 flex flex-col justify-center">

                        <div className="max-w-md mx-auto w-full">

                            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                                Check your email
                            </h2>

                            <p className="text-gray-600 mb-6">
                                We've sent a verification link to your email
                                address. Click the link in the email to verify
                                your account and continue setting up your
                                TalentSync workspace.
                            </p>


                            {status === "verification-link-sent" && (
                                <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm">
                                    A fresh verification link has been sent to
                                    your email address.
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">

                                <PrimaryButton
                                    disabled={processing}
                                    className="w-full bg-indigo-600 flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={16} />
                                    Resend Verification Email
                                </PrimaryButton>

                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    className="w-full text-sm text-gray-500 hover:text-gray-700 text-center"
                                >
                                    Log Out
                                </Link>

                            </form>

                        </div>

                    </div>

                </div>

            </div>

        </Base>
    );
}