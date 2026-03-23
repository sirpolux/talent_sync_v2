import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { BellRing, ShieldAlert, CalendarCheck2 } from "lucide-react";

function NoticeCard({ title, description, icon }) {
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
    <TutorLayout headerTitle="Notifications">
      <Head title="Notifications" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <BellRing className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="mt-1 text-white/80">
                Track session updates, request changes, assessments, and system alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <NoticeCard
            title="Session reminders"
            description="Get alerts for upcoming or overdue training sessions."
            icon={<CalendarCheck2 className="h-6 w-6" />}
          />
          <NoticeCard
            title="Important updates"
            description="Receive notifications when requests or submissions change status."
            icon={<ShieldAlert className="h-6 w-6" />}
          />
          <NoticeCard
            title="Unread notices"
            description="Keep track of unread notifications across your active organization."
            icon={<BellRing className="h-6 w-6" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
