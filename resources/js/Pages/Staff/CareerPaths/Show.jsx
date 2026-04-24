import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';

export default function Show({ careerPath, activeSelection = null }) {
  const { post, processing } = useForm();

  const handleSelect = (e) => {
    e.preventDefault();
    post(route('staff.career-paths.store', careerPath.id));
  };

  const isSelected = activeSelection?.career_path_id === careerPath.id;
  const steps = Array.isArray(careerPath.steps) ? careerPath.steps : [];

  return (
    <StaffLayout>
      <Head title={careerPath.name} />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={route('staff.career-paths.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            ← Back to career paths
          </Link>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{careerPath.name}</h1>
              {careerPath.department ? (
                <p className="mt-1 text-sm text-gray-500">Department: {careerPath.department.name}</p>
              ) : null}
            </div>

            {isSelected ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Currently selected
              </span>
            ) : null}
          </div>

          {careerPath.description ? (
            <p className="mt-4 text-sm leading-6 text-gray-700">{careerPath.description}</p>
          ) : null}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Path steps</h2>
            <p className="mt-1 text-sm text-gray-500">Review the position transitions in this career path.</p>
          </div>

          <div className="divide-y divide-gray-200">
            {steps.map((step, index) => {
              const fromPositionName = step.from_position_name || step.fromPosition?.name || 'Unknown position';
              const toPositionName = step.to_position_name || step.toPosition?.name || 'Unknown position';
              const transitionLabel = `${fromPositionName} → ${toPositionName}`;

              return (
                <div key={step.id} className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{transitionLabel}</h3>
                      {step.track ? <p className="mt-1 text-sm text-gray-600">{step.track}</p> : null}
                      {step.order !== null && step.order !== undefined ? (
                        <p className="mt-2 text-xs uppercase tracking-wide text-gray-500">Step order: {step.order}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {steps.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">No steps have been defined for this career path.</div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelect}
            disabled={processing || isSelected}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSelected ? 'Selected' : 'Select this path'}
          </button>
        </div>
      </div>
    </StaffLayout>
  );
}
