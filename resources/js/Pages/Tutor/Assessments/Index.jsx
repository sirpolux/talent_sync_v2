import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { FileText, Upload, Star } from "lucide-react";

function AssessmentCard({ title, description, icon }) {
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
    <TutorLayout headerTitle="Assessments">
      <Head title="Assessments" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Assessments</h1>
              <p className="mt-1 text-white/80">
                Upload PDF assessments, review submissions, and grade participant work.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <AssessmentCard
            title="Upload assessments"
            description="Upload PDF assessment files linked to each training session."
            icon={<Upload className="h-6 w-6" />}
          />
          <AssessmentCard
            title="Grade submissions"
            description="Review participant submissions and record feedback or scores."
            icon={<Star className="h-6 w-6" />}
          />
          <AssessmentCard
            title="Assessment history"
            description="Keep assessment records organized by organization and session."
            icon={<FileText className="h-6 w-6" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
