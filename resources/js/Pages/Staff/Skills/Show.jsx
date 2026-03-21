import StaffLayout from "@/Layouts/StaffLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export default function Show({ employee, allocation }) {
  const latestEvidence = allocation?.evidences?.[0] ?? null;

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url.split("?")[0]);
  };

  const isPdfUrl = (url) => {
    if (!url) return false;
    return /\.pdf$/i.test(url.split("?")[0]);
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
  };

  const uploadForm = useForm({
    document: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [previewUrl]);

  const evidenceStatusLabel = useMemo(() => {
    if (!latestEvidence) return "No evidence uploaded";
    if (latestEvidence.verification_status === "verified") return "Evidence verified";
    if (latestEvidence.verification_status === "rejected") return "Evidence rejected";
    return "Evidence pending";
  }, [latestEvidence]);

  return (
    <StaffLayout headerTitle="Skills & Certifications">
      <Head title={`Skill: ${allocation?.skill?.name ?? "Skill"}`} />

      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "staff.dashboard" },
            { label: "Skills", href: "staff.skills.index" },
            { label: allocation?.skill?.name ?? "Skill" },
          ]}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{allocation?.skill?.name ?? "Skill"}</h1>
            <div className="text-sm text-slate-600">
              {employee?.name ?? "-"} • {employee?.email ?? "-"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={route("staff.skills.index")}
              className="inline-flex items-center rounded-md border bg-white px-4 py-2 text-sm"
            >
              Back to Skills
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Skill Status</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs uppercase text-gray-500">Allocation status</div>
              <div className="text-sm font-medium">{allocation?.status ?? "pending"}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Evidence</div>
              <div className="text-sm font-medium">{evidenceStatusLabel}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Created</div>
              <div className="text-sm font-medium">
                {allocation?.created_at ? new Date(allocation.created_at).toLocaleString() : "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Latest Evidence</h2>

          {latestEvidence ? (
            <div className="mt-3 rounded-lg border bg-white p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">Verification</div>
                  <div className="text-sm font-medium">{latestEvidence.verification_status}</div>

                  {latestEvidence.verification_note ? (
                    <div className="mt-2 text-sm text-gray-700">
                      <div className="text-xs uppercase text-gray-500">Note</div>
                      <div className="mt-1 whitespace-pre-wrap">{latestEvidence.verification_note}</div>
                    </div>
                  ) : null}

                  <a
                    href={latestEvidence.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                  >
                    View document
                  </a>
                </div>

                <div className="shrink-0">
                  {isImageUrl(latestEvidence.document_url) ? (
                    <img
                      src={latestEvidence.document_url}
                      alt="Evidence preview"
                      className="h-24 w-36 rounded-md border object-cover"
                    />
                  ) : isPdfUrl(latestEvidence.document_url) ? (
                    <div className="flex h-24 w-36 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                      PDF
                    </div>
                  ) : (
                    <div className="flex h-24 w-36 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                      FILE
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-600">No evidence uploaded yet.</div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Upload Evidence</h2>
          <p className="text-sm text-gray-600">
            Upload a supporting document. Once uploaded, an admin will review and verify it.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              uploadForm.post(route("staff.skills.evidence.upload", allocation.id), {
                preserveScroll: true,
                forceFormData: true,
              });
            }}
          >
            <div className="rounded-lg border border-dashed bg-gray-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm text-gray-700">Choose a file (image/PDF). Max 5MB.</div>

                  {uploadForm.data.document ? (
                    <div className="mt-1 text-xs text-gray-500">
                      {uploadForm.data.document.name}{" "}
                      {uploadForm.data.document.size
                        ? `• ${formatBytes(uploadForm.data.document.size)}`
                        : ""}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-gray-500">No file selected yet.</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-md border bg-white px-3 py-2 text-sm">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        uploadForm.setData("document", file);

                        if (!file) return;

                        setPreviewUrl((prev) => {
                          if (prev) {
                            try {
                              URL.revokeObjectURL(prev);
                            } catch {
                              // ignore
                            }
                          }
                          return URL.createObjectURL(file);
                        });
                      }}
                      required
                    />
                    Select file
                  </label>

                  {uploadForm.data.document ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border bg-white px-3 py-2 text-sm"
                      onClick={() => {
                        uploadForm.setData("document", null);
                        setPreviewUrl((prev) => {
                          if (prev) {
                            try {
                              URL.revokeObjectURL(prev);
                            } catch {
                              // ignore
                            }
                          }
                          return null;
                        });
                      }}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>

              {previewUrl && uploadForm.data.document ? (
                <div className="mt-4">
                  <div className="text-xs font-medium uppercase text-gray-500">Preview</div>

                  {uploadForm.data.document.type?.startsWith("image/") ? (
                    <img
                      src={previewUrl}
                      alt="Selected evidence preview"
                      className="mt-2 max-h-52 w-auto rounded-md border bg-white object-contain"
                    />
                  ) : uploadForm.data.document.type === "application/pdf" ? (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                    >
                      Preview PDF in new tab
                    </a>
                  ) : (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-blue-700 underline"
                    >
                      Preview file in new tab
                    </a>
                  )}
                </div>
              ) : null}
            </div>

            {uploadForm.errors.document ? (
              <div className="text-sm text-red-600">{uploadForm.errors.document}</div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploadForm.processing || !uploadForm.data.document}
                className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                Upload Evidence
              </button>
            </div>
          </form>
        </div>

        {allocation?.evidences?.length ? (
          <div className="rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Evidence History</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Uploaded</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allocation.evidences.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3">{e.verification_status}</td>
                      <td className="px-4 py-3">
                        {e.uploaded_at ? new Date(e.uploaded_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={e.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </StaffLayout>
  );
}
