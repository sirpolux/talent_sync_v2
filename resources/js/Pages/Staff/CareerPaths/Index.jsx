import React from 'react';
import { Head, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

function CareerPathCard({ careerPath, selected = false, actionLabel = 'View details', actionHref }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{careerPath.name}</h2>
          {careerPath.description ? (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{careerPath.description}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">No description available.</p>
          )}
        </div>

        {selected ? (
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
          href={actionHref}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

export default function Index({
  careerPaths = [],
  availableCareerPaths = [],
  otherCareerPaths = [],
  department = null,
  activeSelection = null,
}) {
  const hasActiveSelection = Boolean(activeSelection);
  const activeCareerPathId = activeSelection?.career_path_id;

  const selectedCareerPath = activeSelection?.careerPath ?? null;
  const selectedSteps = selectedCareerPath?.steps ?? [];

  const activeCards = hasActiveSelection
    ? availableCareerPaths
    : careerPaths.filter((careerPath) => activeCareerPathId === careerPath.id);

  const remainingCareerPaths = hasActiveSelection
    ? otherCareerPaths
    : careerPaths.filter((careerPath) => activeCareerPathId !== careerPath.id);

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

        {hasActiveSelection ? (
          <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-green-900">Your selected career path</h2>
                <p className="mt-1 text-sm text-green-800">
                  This selection is locked for staff. Only an administrator can change it.
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Active
              </span>
            </div>

            {selectedCareerPath ? (
              <div className="mt-4">
                <CareerPathCard
                  careerPath={selectedCareerPath}
                  selected
                  actionLabel="View details"
                  actionHref={route('staff.career-paths.show', selectedCareerPath.id)}
                />

                {selectedSteps.length > 0 ? (
                  <div className="mt-4 rounded-md bg-white p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Path steps</h3>
                    <ul className="mt-3 space-y-2 text-sm text-gray-700">
                      {selectedSteps.map((step, index) => (
                        <li key={step.id} className="flex items-start gap-3">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800">
                            {index + 1}
                          </span>
                          <span>
                            {step.from_position_name ? `${step.from_position_name} → ` : ''}
                            {step.to_position_name || 'Next step'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {hasActiveSelection ? 'Other available career paths' : 'Available career paths'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {hasActiveSelection
              ? 'These paths match your department, but cannot be selected while your current path remains active.'
              : 'These paths match your department and are available for selection.'}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeCards.map((careerPath) => (
            <CareerPathCard
              key={careerPath.id}
              careerPath={careerPath}
              selected={activeCareerPathId === careerPath.id}
              actionHref={route('staff.career-paths.show', careerPath.id)}
            />
          ))}
        </div>

        {remainingCareerPaths.length > 0 ? (
          <>
            <div className="mb-6 mt-10">
              <h2 className="text-lg font-semibold text-gray-900">Other career paths</h2>
              <p className="mt-1 text-sm text-gray-600">
                Paths in your department that are not currently active.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {remainingCareerPaths.map((careerPath) => (
                <CareerPathCard
                  key={careerPath.id}
                  careerPath={careerPath}
                  actionHref={route('staff.career-paths.show', careerPath.id)}
                />
              ))}
            </div>
          </>
        ) : null}

        {careerPaths.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No career paths are available for your department yet.
          </div>
        ) : null}
      </div>
    </StaffLayout>
  );
}
