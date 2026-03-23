import TutorLayout from "@/Layouts/TutorLayout";
import { Head } from "@inertiajs/react";
import { MessagesSquare, Reply, UsersRound } from "lucide-react";

function MessageCard({ title, description, icon }) {
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
    <TutorLayout headerTitle="Messages">
      <Head title="Messages" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/15 p-3">
              <MessagesSquare className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Messaging</h1>
              <p className="mt-1 text-white/80">
                Communicate with employees inside session-based conversation threads.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MessageCard
            title="Conversation threads"
            description="Keep messages organized around training sessions and requests."
            icon={<UsersRound className="h-6 w-6" />}
          />
          <MessageCard
            title="Reply quickly"
            description="Send replies and follow-up notes to keep employees informed."
            icon={<Reply className="h-6 w-6" />}
          />
          <MessageCard
            title="Message history"
            description="All messages remain available for reference within the active organization."
            icon={<MessagesSquare className="h-6 w-6" />}
          />
        </div>
      </div>
    </TutorLayout>
  );
}
