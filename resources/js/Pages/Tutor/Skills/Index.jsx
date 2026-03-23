import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { Award, BookOpenCheck, BadgeCheck } from "lucide-react";

function EmptyState({ title, description, icon }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/40 shadow-sm p-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="rounded-full bg-slate-100 p-4 text-slate-600">
          {icon}
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <TutorLayout headerTitle="Skills & Certifications">
      <Head title="Skills & Certifications" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assigned Skills & Certifications</h1>
              <p className="mt-1 text-white/80">
                Manage the skills you are qualified to teach and keep certifications up to date.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <EmptyState
            title="Assigned skills"
            description="Your qualified teaching skills will appear here once loaded from the active organization."
            icon={<BookOpenCheck className="h-7 w-7" />}
          />
          <EmptyState
            title="Certifications"
            description="Upload, review, and maintain certification records linked to each skill."
            icon={<BadgeCheck className="h-7 w-7" />}
          />
          <EmptyState
            title="Expiry tracking"
            description="Monitor upcoming expirations so you can renew certifications on time."
            icon={<Award className="h-7 w-7" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
