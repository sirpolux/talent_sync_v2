import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';

export default function Show({
  careerPath,
  activeSelection = null,
  currentPosition = null,
  promotionEligibility = null,
  currentStepIndex = null,
}) {
  const { post, processing } = useForm();

  const handleSelect = (e) => {
    e.preventDefault();
    post(route('staff.career-paths.store', careerPath.id));
  };

  const isSelected = activeSelection?.career_path_id === careerPath.id;
  const steps = Array.isArray(careerPath.steps) ? careerPath.steps : [];

  return (
    <StaffLayout headerTitle="Career Paths">
      <Head title={careerPath.name} />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: 'staff.dashboard' },
            { label: 'Career Paths', href: 'staff.career-paths.index' },
            { label: careerPath.name },
          ]}
        />

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{careerPath.name}</h1>
                {careerPath.department ? (
                  <p className="mt-1 text-sm text-gray-500">Department: {careerPath.department.name}</p>
                ) : null}
                {currentPosition ? (
                  <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Current Position: {currentPosition.name}
                  </p>
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
        </div>

        {promotionEligibility ? (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Promotion eligibility</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review your current readiness against your selected career path.
              </p>
            </div>

            <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Current position skills</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {promotionEligibility.current_skill_percentage ?? 0}%
                </p>
                <p className="mt-1 text-sm text-gray-600">Minimum required: 80%</p>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Next position skills</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {promotionEligibility.next_skill_percentage ?? 0}%
                </p>
                <p className="mt-1 text-sm text-gray-600">Minimum required: 60%</p>
              </div>

              <div className="rounded-md bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Tenure</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {promotionEligibility.tenure?.eligible ? 'Met' : 'Not met'}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {promotionEligibility.tenure?.required_value != null && promotionEligibility.tenure?.required_type
                    ? `Requires ${promotionEligibility.tenure.required_value} ${promotionEligibility.tenure.required_type}`
                    : 'No duration requirement set'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-4">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  promotionEligibility.eligible ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {promotionEligibility.eligible ? 'Eligible for promotion' : 'Not yet eligible'}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Current position gaps</h3>
                  {promotionEligibility.missing_skills?.current_position?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                      {promotionEligibility.missing_skills.current_position.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">No missing skills for the current position.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Next position gaps</h3>
                  {promotionEligibility.missing_skills?.next_position?.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                      {promotionEligibility.missing_skills.next_position.map((skill) => (
                        <li key={skill.id}>{skill.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">No missing skills for the next position.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Duration gap</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {promotionEligibility.tenure?.eligible
                      ? 'Tenure requirement has been met.'
                      : promotionEligibility.missing_skills?.tenure || 'Tenure requirement is not met.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Path steps</h2>
            <p className="mt-1 text-sm text-gray-500">Review the position transitions in this career path.</p>
          </div>

          <div className="divide-y divide-gray-200">
            {steps.map((step, index) => {
              const fromPositionName = step.from_position_name || 'Unknown position';
              const toPositionName = step.to_position_name || 'Unknown position';
              const transitionLabel = `${fromPositionName} → ${toPositionName}`;
              const isCurrentStep = currentStepIndex !== null && currentStepIndex === index;

              return (
                <div
                  key={step.id}
                  className={`px-5 py-4 transition-colors ${
                    isCurrentStep ? 'border-l-4 border-indigo-500 bg-indigo-50/70' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        isCurrentStep ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{transitionLabel}</h3>
                        {isCurrentStep ? (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                            Current step
                          </span>
                        ) : null}
                      </div>
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
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No steps have been defined for this career path.
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
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
