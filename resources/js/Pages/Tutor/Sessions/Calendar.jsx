import TutorLayout from "@/Layouts/TutorLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, CalendarDays, Copy, Download, ExternalLink, Plus, Sparkles, Trash2 } from "lucide-react";
import { useMemo } from "react";

const WEEKDAYS = [
  { key: "mon", label: "Monday", index: 1 },
  { key: "tue", label: "Tuesday", index: 2 },
  { key: "wed", label: "Wednesday", index: 3 },
  { key: "thu", label: "Thursday", index: 4 },
  { key: "fri", label: "Friday", index: 5 },
  { key: "sat", label: "Saturday", index: 6 },
  { key: "sun", label: "Sunday", index: 0 },
];

function buildGoogleCalendarUrl({ title, description, location, date, time, durationMinutes }) {
  if (!date) {
    return "";
  }

  const start = time ? new Date(`${date}T${time}`) : new Date(`${date}T09:00:00`);
  if (Number.isNaN(start.getTime())) {
    return "";
  }

  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 60;
  const end = new Date(start.getTime() + duration * 60 * 1000);

  const format = (value) =>
    value
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Talent Sync session",
    details: description || "",
    location: location || "",
    dates: `${format(start)}/${format(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getWeekdayIndex(value) {
  return WEEKDAYS.find((weekday) => weekday.key === value)?.index ?? null;
}

function buildOccurrenceDate(dateValue, timeValue) {
  if (!dateValue || !timeValue) {
    return null;
  }

  const dateTime = new Date(`${dateValue}T${timeValue}`);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

function formatICSDate(date) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function sanitizeFilename(value) {
  return String(value || "talent-sync-schedule")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildScheduleOccurrences({ startDate, endDate, weekdaySlots, durationMinutes, title, description, location }) {
  const occurrences = [];
  const rangeStart = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const rangeEnd = endDate ? new Date(`${endDate}T23:59:59`) : null;

  if (!rangeStart || !rangeEnd || Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    return occurrences;
  }

  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 60;
  const slots = Array.isArray(weekdaySlots) ? weekdaySlots : [];

  const byWeekday = new Map(
    slots
      .map((slot) => ({
        weekday: String(slot.weekday || "").toLowerCase(),
        time: String(slot.time || ""),
      }))
      .filter((slot) => slot.weekday && slot.time)
      .map((slot) => [slot.weekday, slot.time])
  );

  for (let cursor = new Date(rangeStart); cursor <= rangeEnd; cursor.setDate(cursor.getDate() + 1)) {
    const weekdayKey = WEEKDAYS.find((weekday) => weekday.index === cursor.getDay())?.key;
    const timeValue = weekdayKey ? byWeekday.get(weekdayKey) : null;
    if (!timeValue) {
      continue;
    }

    const occurrenceDate = buildOccurrenceDate(cursor.toISOString().slice(0, 10), timeValue);
    if (!occurrenceDate) {
      continue;
    }

    const endDateTime = new Date(occurrenceDate.getTime() + duration * 60 * 1000);

    const eventDetails = [
      description || "",
      "Talent Sync",
      `Company: ${title.companyName || ""}`,
      `Skill: ${title.skill || ""}`,
      `Tutor: ${title.trainerName || ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    occurrences.push({
      date: cursor.toISOString().slice(0, 10),
      time: timeValue,
      start: occurrenceDate,
      end: endDateTime,
      title: title.eventTitle,
      description: eventDetails,
      location,
      googleCalendarUrl: buildGoogleCalendarUrl({
        title: title.eventTitle,
        description: eventDetails,
        location,
        date: cursor.toISOString().slice(0, 10),
        time: timeValue,
        durationMinutes: duration,
      }),
    });
  }

  return occurrences;
}

function buildIcsContent(occurrences) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Talent Sync//Schedule Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  occurrences.forEach((occurrence, index) => {
    const uid = `talent-sync-${index + 1}-${occurrence.start.getTime()}@talentsync`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(occurrence.start)}`,
      `DTEND:${formatICSDate(occurrence.end)}`,
      `SUMMARY:${String(occurrence.title).replace(/\n/g, " ")}`,
      `DESCRIPTION:${String(occurrence.description).replace(/\n/g, "\\n")}`,
      occurrence.location ? `LOCATION:${String(occurrence.location).replace(/\n/g, " ")}` : "",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");

  return lines.filter(Boolean).join("\r\n");
}

function downloadTextFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function Calendar({
  organizationName = "",
  trainerName = "",
  defaultSkill = "",
  defaultTitle = "",
  defaultDescription = "",
  organization,
}) {
  const organizationLabel = organization?.current?.name || organization?.current?.company_name || organization?.current?.organization_name || organizationName || "";
  const selectedSkill = defaultSkill || "";
  const defaultEventTitle = defaultTitle || `Talent Sync session${selectedSkill ? ` - ${selectedSkill}` : ""}`;

  const form = useForm({
    title: defaultEventTitle,
    description:
      defaultDescription ||
      `Talent Sync session scheduled for ${organizationLabel || "the organization"}${selectedSkill ? `, skill: ${selectedSkill}` : ""}${trainerName ? `, tutor: ${trainerName}` : ""}.`,
    company: organization?.current?.company_name || organizationLabel,
    skill: selectedSkill,
    trainer_name: trainerName,
    start_date: "",
    end_date: "",
    duration_minutes: "60",
    location: "",
    weekdaySlots: [
      { weekday: "mon", time: "14:00" },
      { weekday: "fri", time: "17:00" },
    ],
  });

  const scheduleTitle = useMemo(
    () => ({
      eventTitle: form.data.title,
      companyName: form.data.company || organizationLabel,
      skill: form.data.skill || selectedSkill,
      trainerName: form.data.trainer_name || trainerName,
    }),
    [form.data.company, form.data.skill, form.data.title, form.data.trainer_name, organizationLabel, selectedSkill, trainerName]
  );

  const occurrences = useMemo(
    () =>
      buildScheduleOccurrences({
        startDate: form.data.start_date,
        endDate: form.data.end_date,
        weekdaySlots: form.data.weekdaySlots,
        durationMinutes: form.data.duration_minutes,
        title: scheduleTitle,
        description: form.data.description,
        location: form.data.location,
      }),
    [form.data.description, form.data.duration_minutes, form.data.end_date, form.data.location, form.data.start_date, form.data.weekdaySlots, scheduleTitle]
  );

  const calendarUrl = occurrences[0]
    ? occurrences[0].googleCalendarUrl
    : buildGoogleCalendarUrl({
        title: form.data.title,
        description: `${form.data.description}\n\nProduct: Talent Sync\nCompany: ${form.data.company || organizationLabel}\nSkill: ${form.data.skill || selectedSkill}\nTutor: ${form.data.trainer_name || trainerName}`.trim(),
        location: form.data.location,
        date: form.data.start_date,
        time: "09:00",
        durationMinutes: form.data.duration_minutes,
      });

  const exportContent = useMemo(() => {
    const rows = [
      ["date", "time", "title", "company", "skill", "trainer_name", "location", "description", "google_calendar_url"],
      ...occurrences.map((occurrence) => [
        occurrence.date,
        occurrence.time,
        occurrence.title,
        form.data.company || organizationLabel,
        form.data.skill || selectedSkill,
        form.data.trainer_name || trainerName,
        occurrence.location,
        occurrence.description,
        occurrence.googleCalendarUrl,
      ]),
    ];

    return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  }, [form.data.company, form.data.skill, trainerName, organizationLabel, occurrences, selectedSkill]);

  const exportFileName = `${sanitizeFilename(form.data.title || `talent-sync-${selectedSkill || "schedule"}`)}.csv`;

  const copyLink = async () => {
    if (!calendarUrl || !navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(calendarUrl);
  };

  const updateWeekdayTime = (weekday, value) => {
    form.setData(
      "weekdaySlots",
      form.data.weekdaySlots.map((slot) => (slot.weekday === weekday ? { ...slot, time: value } : slot))
    );
  };

  const toggleWeekday = (weekday) => {
    const exists = form.data.weekdaySlots.some((slot) => slot.weekday === weekday);
    if (exists) {
      form.setData("weekdaySlots", form.data.weekdaySlots.filter((slot) => slot.weekday !== weekday));
      return;
    }

    form.setData("weekdaySlots", [...form.data.weekdaySlots, { weekday, time: "09:00" }]);
  };

  const downloadIcs = () => {
    if (!occurrences.length) {
      return;
    }

    downloadTextFile(buildIcsContent(occurrences), `${sanitizeFilename(form.data.title || "talent-sync-schedule")}.ics`, "text/calendar;charset=utf-8");
  };

  const downloadCsv = () => {
    if (!occurrences.length) {
      return;
    }

    downloadTextFile(exportContent, exportFileName, "text/csv;charset=utf-8");
  };

  return (
    <TutorLayout headerTitle="Google Calendar Helper">
      <Head title="Google Calendar Helper" />

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#1E3A8A] to-[#059669] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link
                href={route("trainer.sessions.create", defaultSkill ? { skill: defaultSkill } : {})}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to session create
              </Link>
              <h1 className="mt-4 text-3xl font-bold">Google Calendar Helper</h1>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Create one or more Talent Sync calendar events for {organizationLabel || "your organization"}, then export the schedule or open Google Calendar links for each occurrence.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Talent Sync schedule details
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <CalendarDays className="h-5 w-5 text-[#1E3A8A]" />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Event details</h2>
                <p className="text-sm text-slate-600">Locked fields stay synced with the create page; recurrence is configured here.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={form.data.title}
                  readOnly
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={form.data.description}
                  onChange={(event) => form.setData("description", event.target.value)}
                  className="min-h-[140px] w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Company / organization</label>
                  <input
                    type="text"
                    value={form.data.company}
                    readOnly
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Skill</label>
                  <input
                    type="text"
                    value={form.data.skill}
                    readOnly
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tutor name</label>
                  <input
                    type="text"
                    value={form.data.trainer_name}
                    readOnly
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                  <input
                    type="text"
                    value={form.data.location}
                    onChange={(event) => form.setData("location", event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Start date</label>
                  <input
                    type="date"
                    value={form.data.start_date}
                    onChange={(event) => form.setData("start_date", event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">End date</label>
                  <input
                    type="date"
                    value={form.data.end_date}
                    onChange={(event) => form.setData("end_date", event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.data.duration_minutes}
                    onChange={(event) => form.setData("duration_minutes", event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Weekdays and times</label>
                  <button
                    type="button"
                    onClick={() => form.setData("weekdaySlots", [...form.data.weekdaySlots, { weekday: "mon", time: "09:00" }])}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add time slot
                  </button>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {WEEKDAYS.map((weekday) => {
                    const slot = form.data.weekdaySlots.find((item) => item.weekday === weekday.key);
                    const checked = Boolean(slot);

                    return (
                      <div key={weekday.key} className="grid gap-3 md:grid-cols-[170px_1fr] md:items-center">
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleWeekday(weekday.key)}
                            className="h-4 w-4 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                          />
                          {weekday.label}
                        </label>
                        <input
                          type="time"
                          value={slot?.time || "09:00"}
                          onChange={(event) => updateWeekdayTime(weekday.key, event.target.value)}
                          disabled={!checked}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A] disabled:bg-slate-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Generated outputs</h2>
            <p className="mt-1 text-sm text-slate-600">
              The generated schedule includes Talent Sync, the organization/company name, selected skill, and tutor name in every occurrence.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Preview</div>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                <div><span className="font-medium text-slate-900">Product:</span> Talent Sync</div>
                <div><span className="font-medium text-slate-900">Company:</span> {form.data.company || organizationLabel || "—"}</div>
                <div><span className="font-medium text-slate-900">Skill:</span> {form.data.skill || selectedSkill || "—"}</div>
                <div><span className="font-medium text-slate-900">Tutor:</span> {form.data.trainer_name || trainerName || "—"}</div>
                <div><span className="font-medium text-slate-900">Occurrences:</span> {occurrences.length}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Google Calendar URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    readOnly
                    value={calendarUrl}
                    placeholder="Fill in recurrence details to generate a link"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#1E3A8A]"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    disabled={!calendarUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadIcs}
                  disabled={!occurrences.length}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1E3A8A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Download ICS
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  disabled={!occurrences.length}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </button>
                <a
                  href={calendarUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition ${
                    calendarUrl ? "bg-emerald-600 hover:bg-emerald-700" : "pointer-events-none cursor-not-allowed bg-slate-400"
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open first Google Calendar link
                </a>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Per-occurrence links</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{occurrences.length}</span>
              </div>

              <div className="mt-3 space-y-3">
                {occurrences.length ? (
                  occurrences.map((occurrence, index) => (
                    <div key={`${occurrence.date}-${occurrence.time}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {occurrence.date} at {occurrence.time}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Google Calendar event for {form.data.title || "Talent Sync session"}</div>
                        </div>
                        <a
                          href={occurrence.googleCalendarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#1E3A8A] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#172554]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Open
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    Choose a start date, end date, and at least one weekday/time slot to generate the schedule.
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              After opening Google Calendar, save the event(s) and paste the generated link back into the session form if you want to store it.
            </p>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}