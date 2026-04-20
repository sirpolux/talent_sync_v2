import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

export default function Index({ careerPaths = [], department = null, activeSelection = null }) {
  const activeCareerPathId = activeSelection?.career_path_id;

  return (
    <StaffLayout>
      <Head title="Career Paths" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Career Paths</h1>
          <p className="mt-1 text-sm text-gray-600">
            Explore career paths available in your department and select one to guide your development.
          </p>
          {department ? (
            <p className="mt-2 text-sm text-gray-500">
              Department: <span className="font-medium text-gray-700">{department.name}</span>
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {careerPaths.map((careerPath) => {
            const isActive = activeCareerPathId === careerPath.id;

            return (
              <div key={careerPath.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{careerPath.name}</h2>
                    {careerPath.description ? (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">{careerPath.description}</p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No description available.</p>
                    )}
                  </div>

                  {isActive ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      Selected
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  {Array.isArray(careerPath.steps) ? careerPath.steps.length : 0} steps
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href={route('staff.career-paths.show', careerPath.id)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {careerPaths.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No career paths are available for your department yet.
          </div>
        ) : null}
      </div>
    </StaffLayout>
  );
}