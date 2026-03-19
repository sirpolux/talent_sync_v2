import { useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function AllocationCard({
  employeeId,
  allocation,
  isImageUrl,
  isPdfUrl,
  formatBytes,
}) {
  const latestEvidence = allocation.evidences?.[0] ?? null;

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

  return (
    <div className="rounded-lg border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{allocation.skill?.name}</div>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium">{allocation.status ?? "pending"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium">Latest Evidence</div>
        {latestEvidence ? (
          <div className="mt-2 rounded-lg border bg-white p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">Verification</div>
                <div className="text-sm font-medium">{latestEvidence.verification_status}</div>

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
                    className="h-20 w-28 rounded-md border object-cover"
                  />
                ) : isPdfUrl(latestEvidence.document_url) ? (
                  <div className="flex h-20 w-28 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                    PDF
                  </div>
                ) : (
                  <div className="flex h-20 w-28 items-center justify-center rounded-md border bg-gray-50 text-xs font-medium text-gray-600">
                    FILE
                  </div>
                )}
              </div>
            </div>

            {latestEvidence.verification_status !== "verified" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
                  onClick={() =>
                    uploadForm.patch(
                      route("admin.employees.skills.evidence.verify", [employeeId, latestEvidence.id]),
                      { preserveScroll: true }
                    )
                  }
                >
                  Verify
                </button>

                <button
                  type="button"
                  className="rounded-md bg-rose-700 px-3 py-1.5 text-sm text-white"
                  onClick={() =>
                    uploadForm.patch(
                      route("admin.employees.skills.evidence.reject", [employeeId, latestEvidence.id]),
                      { preserveScroll: true }
                    )
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-1 text-sm text-gray-500">No document uploaded yet.</div>
        )}
      </div>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          uploadForm.post(
            route("admin.employees.skills.evidence.upload", [employeeId, allocation.id]),
            {
              preserveScroll: true,
              forceFormData: true,
            }
          );
        }}
      >
        <div>
          <div className="text-sm font-medium">Upload evidence (admin)</div>
          <div className="mt-2 rounded-lg border border-dashed bg-gray-50 p-4">
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

          {uploadForm.errors.document && (
            <div className="mt-2 text-sm text-red-600">{uploadForm.errors.document}</div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploadForm.processing || !uploadForm.data.document}
            className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            Upload & Verify
          </button>
        </div>
      </form>
    </div>
  );
}
