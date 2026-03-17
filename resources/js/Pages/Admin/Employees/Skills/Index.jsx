import { useForm } from "@inertiajs/react";

export default function Index({ employee, allocations = [], availableSkills = [] }) {
  const addForm = useForm({
    skill_id: "",
  });

  const uploadForms = {};
  allocations.forEach((a) => {
    uploadForms[a.id] = useForm({
      document: null,
    });
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-lg font-semibold">Employee Skills</h1>
        <p className="text-sm text-gray-600">
          Add skills to this employee and manage verification of uploaded evidence.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 md:flex-row md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            addForm.post(route("admin.employees.skills.store", employee.id), {
              preserveScroll: true,
            });
          }}
        >
          <div className="flex-1">
            <label className="block text-sm font-medium">Skill</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={addForm.data.skill_id}
              onChange={(e) => addForm.setData("skill_id", e.target.value)}
              required
            >
              <option value="">Select a skill</option>
              {availableSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {addForm.errors.skill_id && (
              <div className="mt-1 text-sm text-red-600">{addForm.errors.skill_id}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={addForm.processing}
            className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            Add Skill
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {allocations.map((a) => {
          const latestEvidence = a.evidences?.[0] ?? null;
          const uploadForm = uploadForms[a.id];

          return (
            <div key={a.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{a.skill?.name}</div>
                  <div className="text-sm text-gray-600">
                    Status: <span className="font-medium">{a.status ?? "pending"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Latest Evidence</div>
                {latestEvidence ? (
                  <div className="mt-1 text-sm text-gray-700">
                    <a
                      href={latestEvidence.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline"
                    >
                      View Document
                    </a>
                    <div className="text-xs text-gray-500">
                      Verification: {latestEvidence.verification_status}
                    </div>

                    {latestEvidence.verification_status !== "verified" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm text-white"
                          onClick={() =>
                            uploadForm.patch(
                              route("admin.employees.skills.evidence.verify", [
                                employee.id,
                                latestEvidence.id,
                              ]),
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
                              route("admin.employees.skills.evidence.reject", [
                                employee.id,
                                latestEvidence.id,
                              ]),
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
                className="mt-4 flex flex-col gap-3 md:flex-row md:items-end"
                onSubmit={(e) => {
                  e.preventDefault();
                  uploadForm.post(
                    route("admin.employees.skills.evidence.upload", [employee.id, a.id]),
                    {
                      preserveScroll: true,
                      forceFormData: true,
                    }
                  );
                }}
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium">Upload evidence (admin)</label>
                  <input
                    type="file"
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    onChange={(e) =>
                      uploadForm.setData("document", e.target.files?.[0] ?? null)
                    }
                    required
                  />
                  {uploadForm.errors.document && (
                    <div className="mt-1 text-sm text-red-600">{uploadForm.errors.document}</div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadForm.processing}
                  className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
                >
                  Upload & Verify
                </button>
              </form>
            </div>
          );
        })}

        {allocations.length === 0 && (
          <div className="rounded-lg border bg-white p-5 text-sm text-gray-600">
            No skills allocated yet.
          </div>
        )}
      </div>
    </div>
  );
}
