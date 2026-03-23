import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { CalendarDays, Clock3, CircleDot, CircleCheckBig } from "lucide-react";

function SessionCard({ title, description, icon }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/40 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{icon}</div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <TutorLayout headerTitle="Training Sessions">
      <Head title="Training Sessions" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <CalendarDays className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Training Sessions</h1>
              <p className="mt-1 text-white/80">
                Create and manage sessions with status rules, calendar links, and participant tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <SessionCard
            title="Not Started"
            description="You can have up to 3 sessions in this state at any time."
            icon={<CircleDot className="h-6 w-6" />}
          />
          <SessionCard
            title="Running"
            description="You can have up to 3 active running sessions at any time."
            icon={<Clock3 className="h-6 w-6" />}
          />
          <SessionCard
            title="Completed"
            description="Completed sessions remain available for reporting and review."
            icon={<CircleCheckBig className="h-6 w-6" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
