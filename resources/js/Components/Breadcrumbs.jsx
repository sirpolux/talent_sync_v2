import { Link } from "@inertiajs/react";

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="text-sm text-slate-600" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
              {idx > 0 ? <span className="text-slate-300">/</span> : null}

              {item.href && !isLast ? (
                <Link
                  href={route(item.href, item.params)}
                  className="hover:text-[#1E3A8A] hover:underline font-semibold"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-900 font-semibold" : ""}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}