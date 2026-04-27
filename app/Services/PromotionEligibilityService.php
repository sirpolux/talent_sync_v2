<?php

namespace App\Services;

use App\Models\CareerPath;
use App\Models\DepartmentSkillRequirement;
use App\Models\EmployeeSkillAllocation;
use App\Models\OrganizationUser;
use App\Models\Position;
use App\Models\PositionSkill;
use Carbon\Carbon;

class PromotionEligibilityService
{
    public function evaluate(OrganizationUser $organizationUser, CareerPath $careerPath): array
    {
        $currentPosition = $organizationUser->position;

        if (! $currentPosition) {
            return [
                'eligible' => false,
                'current_position_id' => null,
                'next_position_id' => $this->resolveNextPosition($careerPath, null)?->id,
                'department_requirements_met' => false,
                'position_requirements_met' => false,
                'tenure' => [
                    'eligible' => false,
                    'required_value' => null,
                    'required_type' => null,
                    'elapsed_days' => null,
                    'missing_days' => null,
                    'message' => 'Employee does not have a current position assigned.',
                ],
                'department_skill_gaps' => [],
                'position_skill_gaps' => [],
                'current_position_skill_gaps' => [],
                'next_position_skill_gaps' => [],
                'missing_skills' => [
                    'current_position' => [],
                    'next_position' => [],
                    'tenure' => 'Employee does not have a current position assigned.',
                ],
            ];
        }

        $nextPosition = $this->resolveNextPosition($careerPath, $currentPosition);
        $departmentSkills = $this->departmentSkills($organizationUser);
        $departmentRequirements = $this->departmentRequiredSkills($organizationUser);
        $currentPositionSkills = $this->positionSkills($currentPosition);
        $currentPositionRequirements = $this->positionRequiredSkills($currentPosition);
        $nextPositionSkills = $nextPosition ? $this->positionSkills($nextPosition) : collect();
        $nextPositionRequirements = $nextPosition ? $this->positionRequiredSkills($nextPosition) : collect();
        $employeeSkillIds = $this->employeeSkillIds($organizationUser);
        $tenure = $this->calculateTenure($organizationUser, $currentPosition);

        $departmentSkillGaps = $this->missingRequirementSkills($departmentRequirements, $employeeSkillIds);
        $currentPositionSkillGaps = $this->missingRequirementSkills($currentPositionRequirements, $employeeSkillIds);
        $nextPositionSkillGaps = $nextPosition ? $this->missingRequirementSkills($nextPositionRequirements, $employeeSkillIds) : [];

        $departmentSkillSummary = $this->buildSkillSummary($departmentSkills, $employeeSkillIds);
        $currentPositionSkillSummary = $this->buildSkillSummary($currentPositionSkills, $employeeSkillIds);
        $nextPositionSkillSummary = $nextPosition ? $this->buildSkillSummary($nextPositionSkills, $employeeSkillIds) : null;

        $departmentRequirementsMet = empty($departmentSkillGaps);
        $positionRequirementsMet = empty($currentPositionSkillGaps) && ($nextPosition ? empty($nextPositionSkillGaps) : true);

        $eligible = $departmentRequirementsMet && empty($currentPositionSkillGaps) && $tenure['eligible'];

        return [
            'eligible' => $eligible,
            'current_position_id' => $currentPosition->id,
            'next_position_id' => $nextPosition?->id,
            'department_requirements_met' => $departmentRequirementsMet,
            'position_requirements_met' => $positionRequirementsMet,
            'tenure' => $tenure,
            'department_skill_summary' => $departmentSkillSummary,
            'current_position_skill_summary' => $currentPositionSkillSummary,
            'next_position_skill_summary' => $nextPositionSkillSummary,
            'department_skill_gaps' => $departmentSkillGaps,
            'position_skill_gaps' => $currentPositionSkillGaps,
            'current_position_skill_gaps' => $currentPositionSkillGaps,
            'next_position_skill_gaps' => $nextPositionSkillGaps,
            'missing_skills' => [
                'current_position' => $currentPositionSkillGaps,
                'next_position' => $nextPositionSkillGaps,
                'tenure' => $tenure['eligible'] ? null : $tenure['message'],
            ],
        ];
    }

    public function resolveCurrentStepIndex(CareerPath $careerPath, ?Position $currentPosition): ?int
    {
        if (! $currentPosition) {
            return null;
        }

        $steps = $careerPath->steps->sortBy('order')->values();

        foreach ($steps as $index => $step) {
            if ((int) $step->from_position_id === (int) $currentPosition->id) {
                return $index;
            }
        }

        return null;
    }

    private function resolveNextPosition(CareerPath $careerPath, ?Position $currentPosition): ?Position
    {
        $steps = $careerPath->steps->sortBy('order')->values();

        if ($steps->isEmpty()) {
            return null;
        }

        if (! $currentPosition) {
            return $steps->first()?->toPosition;
        }

        $step = $steps->firstWhere('from_position_id', $currentPosition->id);

        return $step?->toPosition;
    }

    private function departmentSkills(OrganizationUser $organizationUser)
    {
        return DepartmentSkillRequirement::query()
            ->with('skill')
            ->where('organization_id', $organizationUser->organization_id)
            ->where('department_id', $organizationUser->department_id)
            ->where('active', true)
            ->get();
    }

    private function departmentRequiredSkills(OrganizationUser $organizationUser)
    {
        return DepartmentSkillRequirement::query()
            ->with('skill')
            ->where('organization_id', $organizationUser->organization_id)
            ->where('department_id', $organizationUser->department_id)
            ->where('active', true)
            ->where('must_have', true)
            ->get();
    }

    private function positionSkills(Position $position)
    {
        return PositionSkill::query()
            ->with('skill')
            ->where('position_id', $position->id)
            ->get();
    }

    private function positionRequiredSkills(Position $position)
    {
        return PositionSkill::query()
            ->with('skill')
            ->where('position_id', $position->id)
            ->where('is_required', true)
            ->get();
    }

    private function employeeSkillIds(OrganizationUser $organizationUser): array
    {
        return EmployeeSkillAllocation::query()
            ->where('organization_user_id', $organizationUser->id)
            ->where('status', 'approved')
            ->pluck('skill_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function missingRequirementSkills($requirements, array $employeeSkillIds): array
    {
        return $requirements
            ->filter(fn ($requirement) => ! in_array((int) $requirement->skill_id, $employeeSkillIds, true))
            ->map(function ($requirement) {
                return [
                    'id' => $requirement->skill_id,
                    'name' => $requirement->skill?->name,
                ];
            })
            ->values()
            ->all();
    }

    private function buildSkillSummary($skills, array $employeeSkillIds): array
    {
        $requiredCount = $skills->count();
        $matchedCount = $skills->filter(fn ($skill) => in_array((int) $skill->skill_id, $employeeSkillIds, true))->count();

        return [
            'required_count' => $requiredCount,
            'matched_count' => $matchedCount,
            'missing_count' => max($requiredCount - $matchedCount, 0),
            'percentage' => $requiredCount > 0 ? round(($matchedCount / $requiredCount) * 100, 2) : 100.0,
        ];
    }

    private function calculateTenure(OrganizationUser $organizationUser, Position $currentPosition): array
    {
        $requiredValue = $currentPosition->duration_before_promotion;
        $requiredType = $currentPosition->duration_before_promotion_type;

        if ($requiredValue === null || $requiredType === null) {
            return [
                'eligible' => true,
                'required_value' => $requiredValue,
                'required_type' => $requiredType,
                'elapsed_days' => null,
                'missing_days' => null,
                'message' => null,
            ];
        }

        $startDate = $organizationUser->date_started_current_position;

        if (! $startDate) {
            return [
                'eligible' => false,
                'required_value' => $requiredValue,
                'required_type' => $requiredType,
                'elapsed_days' => null,
                'missing_days' => null,
                'message' => 'Current position start date is missing.',
            ];
        }

        $start = Carbon::parse($startDate);
        $now = now();
        $elapsedDays = $start->diffInDays($now);
        $requiredDays = $this->convertDurationToDays((int) $requiredValue, (string) $requiredType);

        return [
            'eligible' => $elapsedDays >= $requiredDays,
            'required_value' => $requiredValue,
            'required_type' => $requiredType,
            'elapsed_days' => $elapsedDays,
            'missing_days' => max($requiredDays - $elapsedDays, 0),
            'message' => $elapsedDays >= $requiredDays ? null : 'Employee has not met the required duration in current position.',
        ];
    }

    private function convertDurationToDays(int $value, string $type): int
    {
        return match (strtolower($type)) {
            'day', 'days' => $value,
            'week', 'weeks' => $value * 7,
            'month', 'months' => $value * 30,
            'year', 'years' => $value * 365,
            default => $value,
        };
    }
}
