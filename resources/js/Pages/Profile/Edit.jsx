import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function getDashboardHref(routeName) {
    if (!routeName || typeof route !== 'function') {
        return '/dashboard';
    }

    try {
        return route(routeName);
    } catch (error) {
        return '/dashboard';
    }
}

function ProfileRecommendationCard({ recommendation, index }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1E3A8A] text-sm font-semibold text-white">
                {index + 1}
            </div>
            <h4 className="text-base font-semibold text-slate-900">
                {recommendation.title}
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">
                {recommendation.description}
            </p>
        </div>
    );
}

export default function Edit({
    mustVerifyEmail,
    status,
    profileContext = {},
}) {
    const roleLabel = profileContext.roleLabel || 'Member';
    const roleKey = profileContext.roleKey || 'member';
    const dashboardLabel = profileContext.dashboardLabel || 'Dashboard';
    const dashboardHref = getDashboardHref(profileContext.dashboardRoute);
    const recommendations = Array.isArray(profileContext.recommendations)
        ? profileContext.recommendations
        : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#1E3A8A]">
                            {roleLabel} account
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold leading-tight text-slate-900">
                            Profile settings
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Keep your personal details, security settings, and
                            role-specific recommendations up to date.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            Role: {roleLabel}
                        </span>
                        <Link
                            href={dashboardHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172f6f]"
                        >
                            Go to {dashboardLabel}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            <div className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm sm:p-8">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#1E3A8A]">
                                    Recommended for {roleLabel}
                                </p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                                    Your next best actions
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    These recommendations are tailored to your current
                                    role and current workspace needs.
                                </p>

                                <div className="mt-5 space-y-4">
                                    {recommendations.length > 0 ? (
                                        recommendations.map((recommendation, index) => (
                                            <ProfileRecommendationCard
                                                key={`${roleKey}-${index}`}
                                                recommendation={recommendation}
                                                index={index}
                                            />
                                        ))
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                                            No role recommendations are available right now.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#1E3A8A] to-[#059669] p-5 text-white shadow-sm">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                                    Quick access
                                </p>
                                <h3 className="mt-2 text-xl font-semibold">
                                    Open your dashboard
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-white/85">
                                    Continue from where you left off in the workspace
                                    built for your role.
                                </p>
                                <Link
                                    href={dashboardHref}
                                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1E3A8A] shadow-sm transition hover:bg-slate-100"
                                >
                                    Visit {dashboardLabel}
                                </Link>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#1E3A8A]">
                                    Account tips
                                </p>
                                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                                    <li>
                                        Keep your email address verified to avoid
                                        missing important updates.
                                    </li>
                                    <li>
                                        Review your password regularly and update it if
                                        there is any security concern.
                                    </li>
                                    <li>
                                        Use your role dashboard for daily tasks,
                                        requests, and progress tracking.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
