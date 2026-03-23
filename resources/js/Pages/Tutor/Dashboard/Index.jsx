import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  MessageSquareMore,
  BellRing,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

function StatCard({ title, value, icon, hint, tone = "blue" }) {
  const toneClasses = {
    blue: "from-[#1E3A8A] to-[#3B82F6]",
    green: "from-[#059669] to-[#10B981]",
    amber: "from-[#D97706] to-[#F59E0B]",
    indigo: "from-[#4338CA] to-[#6366F1]",
  };

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/40 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>

        <div className={`rounded-xl p-3 bg-gradient-to-br ${toneClasses[tone]} text-white shadow`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/40 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Index() {
  const quickStats = [
    {
      title: "Active sessions",
      value: "0",
      icon: <GraduationCap className="h-5 w-5" />,
      hint: "Running sessions within the active organization",
      tone: "blue",
    },
    {
      title: "Pending requests",
      value: "0",
      icon: <ClipboardList className="h-5 w-5" />,
      hint: "Training requests awaiting your review",
      tone: "amber",
    },
    {
      title: "Unread messages",
      value: "0",
      icon: <MessageSquareMore className="h-5 w-5" />,
      hint: "New conversations from employees",
      tone: "indigo",
    },
    {
      title: "Notifications",
      value: "0",
      icon: <BellRing className="h-5 w-5" />,
      hint: "Important updates across your training work",
      tone: "green",
    },
  ];

  return (
    <TutorLayout headerTitle="Trainer Dashboard">
      <Head title="Trainer Dashboard" />

      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#059669] text-white p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/80">
                <BookOpen className="h-4 w-4" />
                Tutor / Trainer Workspace
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">
                Manage skills, requests, sessions, and assessments in one place.
              </h1>
              <p className="text-white/85 max-w-xl">
                Track your assigned skills, monitor active sessions, review training requests,
                and collaborate with employees across organizations from a single dashboard.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-96">
              <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur">
                <p className="text-xs text-white/70">Session limits</p>
                <p className="mt-1 text-lg font-semibold">3 Not Started / 3 Running</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur">
                <p className="text-xs text-white/70">Organization aware</p>
                <p className="mt-1 text-lg font-semibold">Switch contexts safely</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SectionCard
              title="At a glance"
              action={
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Dashboard ready
                </span>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Assigned skills</p>
                      <p className="text-xs text-slate-500">View the courses you are qualified to teach</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Incoming requests</p>
                      <p className="text-xs text-slate-500">Accept, decline, or schedule training requests</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Session tracking</p>
                      <p className="text-xs text-slate-500">Monitor progress and manage status changes</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                      <MessageSquareMore className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Messaging & alerts</p>
                      <p className="text-xs text-slate-500">Stay connected with employees and system updates</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Next steps">
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Review your assigned skills</p>
                <p className="mt-1 text-xs text-slate-500">
                  Start by verifying the skills and certifications linked to your trainer profile.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Check pending requests</p>
                <p className="mt-1 text-xs text-slate-500">
                  Approve new requests and create sessions for the right organization context.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Monitor messages</p>
                <p className="mt-1 text-xs text-slate-500">
                  Reply to employee questions and keep all conversations organized per session.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </TutorLayout>
  );
}
