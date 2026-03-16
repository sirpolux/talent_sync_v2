import React from "react";

/**
 * CompanyLogo
 * - If src is provided, renders the image.
 * - Otherwise, renders a colored circle with initials.
 */
export default function CompanyLogo({
  name,
  src = null,
  size = 40,
  className = "",
}) {
  const initials = getInitials(name);

  return (
    <div
      className={[
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-[#1E3A8A]/10 text-[#1E3A8A]",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label={name ? `${name} logo` : "Company logo"}
      title={name ?? ""}
    >
      {src ? (
        <img
          src={src}
          alt={name ? `${name} logo` : "Company logo"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-semibold">{initials}</span>
      )}
    </div>
  );
}

function getInitials(name) {
  if (!name) return "CO";

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[1][0]).toUpperCase();
}
