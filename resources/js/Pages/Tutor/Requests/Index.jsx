import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { ClipboardList, Hourglass, CheckCircle2, XCircle } from "lucide-react";

function StatusCard({ title, description, icon }) {
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
    <TutorLayout headerTitle="Training Requests">
      <Head title="Training Requests" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Training Requests</h1>
              <p className="mt-1 text-white/80">
                Review incoming requests, accept assignments, and convert them into sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatusCard
            title="Pending requests"
            description="Requests waiting for your approval will appear here."
            icon={<Hourglass className="h-6 w-6" />}
          />
          <StatusCard
            title="Accepted requests"
            description="Accepted requests can be turned into sessions based on skill availability."
            icon={<CheckCircle2 className="h-6 w-6" />}
          />
          <StatusCard
            title="Declined requests"
            description="Rejected requests are kept for reference and audit tracking."
            icon={<XCircle className="h-6 w-6" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
