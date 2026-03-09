import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import Base from "../Home/Base";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";

import {
    User,
    Building2,
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    GraduationCap,
    BarChart3,
    Users
} from "lucide-react";

export default function Register() {

    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        company_name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <Base>
            <Head title="Create Account" />

            <div className="min-h-screen grid lg:grid-cols-2">

                {/* LEFT PANEL (Branding / Messaging) */}
                <div className="hidden lg:flex flex-col justify-center bg-indigo-600 text-white px-16">

                    <h1 className="text-4xl font-bold leading-tight">
                        Build a workforce that
                        <span className="block mt-2">
                            grows with your organization
                        </span>
                    </h1>

                    <p className="mt-6 text-indigo-100 text-lg">
                        TalentSync HR helps organizations close skill gaps,
                        automate training programs, and make data-driven
                        promotion decisions.
                    </p>

                    {/* Product highlights */}
                    <div className="mt-10 space-y-6">

                        <div className="flex items-start gap-4">
                            <GraduationCap />
                            <div>
                                <h3 className="font-semibold">Training-Driven HR</h3>
                                <p className="text-indigo-200 text-sm">
                                    Manage employee learning and development
                                    from one powerful platform.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <BarChart3 />
                            <div>
                                <h3 className="font-semibold">Skill Gap Insights</h3>
                                <p className="text-indigo-200 text-sm">
                                    Identify workforce capability gaps and
                                    close them through structured training.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Users />
                            <div>
                                <h3 className="font-semibold">Promotion Readiness</h3>
                                <p className="text-indigo-200 text-sm">
                                    Promote employees based on verified
                                    competency and training data.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* RIGHT PANEL (FORM) */}
                <div className="flex items-center justify-center px-6 py-16 bg-gray-50">

                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="text-center mb-10">

                            <h2 className="text-3xl font-bold">
                                Create your account
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Start managing employee growth with TalentSync.
                            </p>

                        </div>

                        {/* Progress */}
                        <div className="flex gap-2 mb-8">
                            {[1,2,3].map((s)=>(
                                <div
                                    key={s}
                                    className={`flex-1 h-2 rounded ${
                                        step >= s
                                            ? "bg-indigo-600"
                                            : "bg-gray-200"
                                    }`}
                                />
                            ))}
                        </div>

                        <form
                            onSubmit={submit}
                            className="bg-white p-8 rounded-xl border shadow-sm"
                        >

                            {/* STEP 1 */}
                            {step === 1 && (
                                <div className="space-y-6">

                                    <div>
                                        <InputLabel value="Your Name" />

                                        <div className="relative mt-1">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                                            <TextInput
                                                className="pl-10 w-full"
                                                value={data.name}
                                                onChange={(e)=>setData("name",e.target.value)}
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.name}/>
                                    </div>

                                    <div>
                                        <InputLabel value="Company Name"/>

                                        <div className="relative mt-1">
                                            <Building2 className="absolute left-3 top-3 text-gray-400" size={18}/>
                                            <TextInput
                                                className="pl-10 w-full"
                                                value={data.company_name}
                                                onChange={(e)=>setData("company_name",e.target.value)}
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.company_name}/>
                                    </div>

                                    <div className="flex justify-end">
                                        <PrimaryButton
                                            type="button"
                                            onClick={nextStep}
                                        >
                                            Next
                                            <ArrowRight size={16} className="ml-2"/>
                                        </PrimaryButton>
                                    </div>

                                </div>
                            )}

                            {/* STEP 2 */}
                            {step === 2 && (
                                <div className="space-y-6">

                                    <div>
                                        <InputLabel value="Work Email"/>

                                        <div className="relative mt-1">
                                            <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                                            <TextInput
                                                type="email"
                                                className="pl-10 w-full"
                                                value={data.email}
                                                onChange={(e)=>setData("email",e.target.value)}
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.email}/>
                                    </div>

                                    <div className="flex justify-between">

                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center text-gray-600"
                                        >
                                            <ArrowLeft size={16} className="mr-2"/>
                                            Back
                                        </button>

                                        <PrimaryButton
                                            type="button"
                                            onClick={nextStep}
                                        >
                                            Next
                                            <ArrowRight size={16} className="ml-2"/>
                                        </PrimaryButton>

                                    </div>

                                </div>
                            )}

                            {/* STEP 3 */}
                            {step === 3 && (
                                <div className="space-y-6">

                                    <div>
                                        <InputLabel value="Password"/>

                                        <div className="relative mt-1">
                                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                                            <TextInput
                                                type="password"
                                                className="pl-10 w-full"
                                                value={data.password}
                                                onChange={(e)=>setData("password",e.target.value)}
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.password}/>
                                    </div>

                                    <div>
                                        <InputLabel value="Confirm Password"/>

                                        <div className="relative mt-1">
                                            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                                            <TextInput
                                                type="password"
                                                className="pl-10 w-full"
                                                value={data.password_confirmation}
                                                onChange={(e)=>setData("password_confirmation",e.target.value)}
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.password_confirmation}/>
                                    </div>

                                    <div className="flex justify-between">

                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex items-center text-gray-600"
                                        >
                                            <ArrowLeft size={16} className="mr-2"/>
                                            Back
                                        </button>

                                        <PrimaryButton disabled={processing}>
                                            Create Account
                                        </PrimaryButton>

                                    </div>

                                </div>
                            )}

                            <div className="text-center mt-8 text-sm text-gray-600">
                                Already registered?{" "}
                                <Link
                                    href={route("login")}
                                    className="text-indigo-600 hover:underline"
                                >
                                    Login
                                </Link>
                            </div>

                        </form>

                    </div>

                </div>

            </div>
        </Base>
    );
}