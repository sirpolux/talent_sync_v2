<?php

namespace App\Services;

use App\Models\CareerPath;
use App\Models\EmployeeSkillAllocation;
use App\Models\OrganizationUser;
use App\Models\Position;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class PromotionEligibilityService
{
    public function evaluate(OrganizationUser $organizationUser, CareerPath $careerPath): array
    {
        $currentPosition = $organizationUser->position;

        if (! $currentPosition) {
            return [
                'eligible' => false,
                'current_position' => null,
                'next_position' => $this->resolveNextPosition($careerPath, null),
                'current_skill_coverage' => null,
                'next_skill_coverage' => null,
                'tenure' => [
                    'eligible' => false,
                    'required_value' => null,
                    'required_type' => null,
                    'elapsed_days' => null,
                    'missing_days' => null,
                    'message' => 'Employee does not have a current position assigned.',
                ],
                'missing_requirements' => [
                    'current_position_skills' => [],
                    'next_position_skills' => [],
                    'tenure' => 'Employee does not have a current position assigned.',
                ],
            ];
        }

        $nextPosition = $this->resolveNextPosition($careerPath, $currentPosition);
        $currentSkillCoverage = $this->calculateSkillCoverage($organizationUser, $currentPosition);
        $nextSkillCoverage = $nextPosition ? $this->calculateSkillCoverage($organizationUser, $nextPosition) : null;
        $tenure = $this->calculateTenure($organizationUser, $currentPosition);

        $currentSkillEligible = $currentSkillCoverage['percentage'] >= 80;
        $nextSkillEligible = $nextPosition ? $nextSkillCoverage['percentage'] >= 60 : false;
        $eligible = $currentSkillEligible && $nextSkillEligible && $tenure['eligible'];

        return [
            'eligible' => $eligible,
            'current_position' => [
                'id' => $currentPosition->id,
                'name' => $currentPosition->name,
            ],
            'next_position' => $nextPosition ? [
                'id' => $nextPosition->id,
                'name' => $nextPosition->name,
            ] : null,
            'current_skill_coverage' => $currentSkillCoverage,
            'next_skill_coverage' => $nextSkillCoverage,
            'tenure' => $tenure,
            'missing_requirements' => [
                'current_position_skills' => $this->missingSkills($currentPosition, $currentSkillCoverage['matched_skill_ids']),
                'next_position_skills' => $nextPosition ? $this->missingSkills($nextPosition, $nextSkillCoverage['matched_skill_ids']) : [],
                'tenure' => $tenure['eligible'] ? null : $tenure['message'],
            ],
        ];
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

    private function calculateSkillCoverage(OrganizationUser $organizationUser, Position $position): array
    {
        $requiredSkills = $position->skills->values();
        $requiredCount = $requiredSkills->count();

        if ($requiredCount === 0) {
            return [
                'percentage' => 100.0,
                'required_count' => 0,
                'matched_count' => 0,
                'matched_skill_ids' => [],
            ];
        }

        $employeeSkillIds = EmployeeSkillAllocation::query()
            ->where('organization_user_id', $organizationUser->id)
            ->where('status', 'approved')
            ->pluck('skill_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $matchedSkills = $requiredSkills->filter(
            fn ($skill) => in_array((int) $skill->id, $employeeSkillIds, true)
        );

        return [
            'percentage' => round(($matchedSkills->count() / $requiredCount) * 100, 2),
            'required_count' => $requiredCount,
            'matched_count' => $matchedSkills->count(),
            'matched_skill_ids' => $matchedSkills->pluck('id')->map(fn ($id) => (int) $id)->all(),
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

    private function missingSkills(Position $position, array $matchedSkillIds): array
    {
        return $position->skills
            ->reject(fn ($skill) => in_array((int) $skill->id, $matchedSkillIds, true))
            ->map(fn ($skill) => [
                'id' => $skill->id,
                'name' => $skill->name,
                'required_proficiency' => $skill->pivot?->required_proficiency,
                'minimum_score' => $skill->pivot?->minimum_score,
                'is_required' => (bool) ($skill->pivot?->is_required ?? false),
            ])
            ->values()
            ->all();
    }
}
