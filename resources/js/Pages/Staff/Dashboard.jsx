import StaffLayout from "@/Layouts/StaffLayout";

function StatCard({ title, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-700">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {helper ? (
        <div className="mt-1 text-xs text-slate-500">{helper}</div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, children, right }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right ? <div className="text-sm">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <StaffLayout headerTitle="Overview">
      <div>
        <p className="text-sm text-slate-600">
          Here’s a quick snapshot of your activity in this organization.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="My trainings" value="—" helper="Coming soon" />
          <StatCard title="Skills uploaded" value="—" helper="Coming soon" />
          <StatCard title="Promotion eligibility" value="—" helper="Coming soon" />
          <StatCard title="Pending requests" value="—" helper="Coming soon" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard
              title="My trainings"
              right={
                <a
                  href={route("staff.training.index")}
                  className="font-semibold text-[#1E3A8A] hover:underline"
                >
                  View all
                </a>
              }
            >
              <div className="text-sm text-slate-600">
                Training modules will appear here (upcoming, in-progress, and
                completed).
              </div>
            </SectionCard>

            <SectionCard
              title="Skills & certifications"
              right={
                <a
                  href={route("staff.skills.index")}
                  className="font-semibold text-[#1E3A8A] hover:underline"
                >
                  View all
                </a>
              }
            >
              <div className="text-sm text-slate-600">
                Your proficiencies and uploaded evidence will appear here.
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              title="Notifications"
              right={
                <a
                  href={route("staff.notifications.index")}
                  className="font-semibold text-[#1E3A8A] hover:underline"
                >
                  View all
                </a>
              }
            >
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="rounded-lg bg-slate-50 p-3">
                  <div className="font-medium text-slate-900">No alerts yet</div>
                  <div className="text-xs text-slate-600">
                    You’ll see system and training notifications here.
                  </div>
                </li>
              </ul>
            </SectionCard>

            <SectionCard title="Requests & feedback">
              <div className="text-sm text-slate-600">
                Pending training, promotion, and leave requests will show here.
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
