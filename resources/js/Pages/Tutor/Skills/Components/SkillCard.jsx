import { Link } from "@inertiajs/react";
import { ArrowRight, PlusCircle } from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatusPill({ status }) {
  const value = String(status || "pending").toLowerCase();
  const map = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        map[value] || "bg-slate-50 text-slate-700 border-slate-200"
      )}
    >
      {value}
    </span>
  );
}

export default function SkillCard({
  skill = null,
  status = null,
  actionLabel = null,
  actionHref = null,
  onAction = null,
  processing = false,
  showDescription = true,
  compact = false,
}) {
  const title = skill?.name ?? "Skill";

  const actionButton = actionHref ? (
    <Link
      href={actionHref}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black"
    >
      {actionLabel || "View"}
      <ArrowRight className="h-4 w-4" />
    </Link>
  ) : onAction ? (
    <button
      type="button"
      onClick={onAction}
      disabled={processing}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      <PlusCircle className="h-4 w-4" />
      {actionLabel || "Select"}
    </button>
  ) : null;

  return (
    <div className={classNames("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", compact && "p-3")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {status ? <StatusPill status={status} /> : null}
          </div>

          {showDescription && skill?.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{skill.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {skill?.organization_id ? "Org" : "Global"}
            </span>
            {skill?.type ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {skill.type}
              </span>
            ) : null}
          </div>
        </div>
        {actionButton}
      </div>
    </div>
  );
}