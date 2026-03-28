import StaffLayout from "@/Layouts/StaffLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { CalendarDays, FileText, ArrowLeft, Send } from "lucide-react";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Create({ flash = {} }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    start_date: "",
    end_date: "",
    reason: "",
  });

  const submit = (e) => {
    e.preventDefault();

    post(route("staff.leave.store"), {
      preserveScroll: true,
      onSuccess: () => reset("start_date", "end_date", "reason"),
    });
  };

  return (
    <StaffLayout headerTitle="Apply for Leave" openedMenu="leave">
      <Head title="Apply for Leave" />

      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90">
              <CalendarDays className="h-4 w-4" />
              Submit request
            </div>
            <h1 className="mt-3 text-3xl font-bold">Apply for Leave</h1>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Submit your leave request with the dates and reason for your
              absence. Your request will be reviewed by your organization admin.
            </p>
          </div>
        </div>

        {flash?.success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {flash.success}
          </div>
        ) : null}

        {flash?.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {flash.error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Leave request form
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Fill in the dates and reason for your leave request.
                </p>
              </div>

              <Link
                href={route("staff.leave.index")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Start date
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  {errors.start_date ? (
                    <p className="mt-1 text-sm text-rose-600">{errors.start_date}</p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-slate-700"
                  >
                    End date
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                  {errors.end_date ? (
                    <p className="mt-1 text-sm text-rose-600">{errors.end_date}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-slate-700"
                >
                  Reason
                </label>
                <div className="relative mt-1">
                  <FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    id="reason"
                    rows="6"
                    value={data.reason}
                    onChange={(e) => setData("reason", e.target.value)}
                    placeholder="Explain the reason for your leave request"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>
                {errors.reason ? (
                  <p className="mt-1 text-sm text-rose-600">{errors.reason}</p>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Submitted requests will be recorded under your staff profile.
                </p>

                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {processing ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Before you submit
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="rounded-xl bg-slate-50 p-3">
                  Make sure your start date is not after your end date.
                </li>
                <li className="rounded-xl bg-slate-50 p-3">
                  Provide a clear reason so your approver can review it quickly.
                </li>
                <li className="rounded-xl bg-slate-50 p-3">
                  You can review the status of your request after submission.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">
                Recent date preview
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>Start date</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(data.start_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>End date</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(data.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}