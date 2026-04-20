<?php

namespace App\Services;

use App\Models\DepartmentSkillRequirement;
use App\Models\EmployeeCareerPathSelection;
use App\Models\Position;
use App\Models\PositionCompetency;
use App\Models\PositionSkill;
use App\Models\SkillRecommendation;
use App\Models\SkillRecommendationRecipient;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SelectedCareerPathRecommendationService
{
    public function generateForUser(User $user, ?EmployeeCareerPathSelection $selection = null): ?SkillRecommendation
    {
        $selection = $selection ?: $this->resolveActiveSelection($user);

        if (! $selection) {
            return null;
        }

        $targetPositions = $this->resolveTargetPositions($selection);

        if ($targetPositions->isEmpty()) {
            return null;
        }

        $recommendedSkills = $this->buildRecommendedSkills($user, $targetPositions);

        if ($recommendedSkills->isEmpty()) {
            return null;
        }

        return DB::transaction(function () use ($user, $selection, $recommendedSkills) {
            $recommendation = SkillRecommendation::create([
                'organization_id' => $selection->organization_id,
                'title' => 'Career Path Recommendations',
                'description' => 'Skills recommended from selected career path',
                'is_active' => true,
            ]);

            SkillRecommendationRecipient::create([
                'organization_id' => $selection->organization_id,
                'skill_recommendation_id' => $recommendation->id,
                'user_id' => $user->id,
                'employee_id' => $user->id,
                'employee_career_path_selection_id' => $selection->id,
                'status' => 'pending',
            ]);

            foreach ($recommendedSkills as $skill) {
                $recommendation->recommendedSkills()->create([
                    'organization_id' => $selection->organization_id,
                    'skill_id' => $skill['skill_id'],
                    'source_type' => $skill['source_type'],
                    'source_id' => $skill['source_id'],
                    'gap_type' => $skill['gap_type'],
                    'missing_level' => $skill['missing_level'],
                ]);
            }

            return $recommendation;
        });
    }

    public function previewForUser(User $user, ?EmployeeCareerPathSelection $selection = null): Collection
    {
        $selection = $selection ?: $this->resolveActiveSelection($user);

        if (! $selection) {
            return collect();
        }

        $targetPositions = $this->resolveTargetPositions($selection);

        if ($targetPositions->isEmpty()) {
            return collect();
        }

        return $this->buildRecommendedSkills($user, $targetPositions);
    }

    protected function resolveActiveSelection(User $user): ?EmployeeCareerPathSelection
    {
        return EmployeeCareerPathSelection::query()
            ->where('organization_id', $user->current_organization_id ?? $user->organization_id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->latest('id')
            ->first();
    }

    protected function resolveTargetPositions(EmployeeCareerPathSelection $selection): Collection
    {
        $careerPath = $selection->careerPath;

        if (! $careerPath) {
            return collect();
        }

        $stepPositions = $careerPath->steps()
            ->with('position')
            ->get()
            ->pluck('position')
            ->filter();

        if ($stepPositions->isNotEmpty()) {
            return $stepPositions->unique('id')->values();
        }

        return Position::query()
            ->where('organization_id', $selection->organization_id)
            ->where('department_id', $careerPath->department_id)
            ->get();
    }

    protected function buildRecommendedSkills(User $user, Collection $targetPositions): Collection
    {
        $currentSkills = $this->resolveCurrentSkillMap($user);

        $recommended = collect();

        foreach ($targetPositions as $position) {
            $positionSkills = PositionSkill::query()
                ->where('position_id', $position->id)
                ->get();

            foreach ($positionSkills as $positionSkill) {
                $currentLevel = (int) ($currentSkills[$positionSkill->skill_id] ?? 0);
                $requiredLevel = (int) ($positionSkill->required_level ?? 1);

                if ($currentLevel >= $requiredLevel) {
                    continue;
                }

                $recommended->push([
                    'skill_id' => $positionSkill->skill_id,
                    'source_type' => PositionSkill::class,
                    'source_id' => $positionSkill->id,
                    'gap_type' => 'position_skill',
                    'missing_level' => $requiredLevel - $currentLevel,
                ]);
            }

            $competencies = PositionCompetency::query()
                ->where('position_id', $position->id)
                ->get();

            foreach ($competencies as $competency) {
                $currentLevel = (int) ($currentSkills[$competency->skill_id] ?? 0);
                $requiredLevel = (int) ($competency->required_level ?? 1);

                if ($currentLevel >= $requiredLevel) {
                    continue;
                }

                $recommended->push([
                    'skill_id' => $competency->skill_id,
                    'source_type' => PositionCompetency::class,
                    'source_id' => $competency->id,
                    'gap_type' => 'position_competency',
                    'missing_level' => $requiredLevel - $currentLevel,
                ]);
            }

            $departmentRequirements = DepartmentSkillRequirement::query()
                ->where('department_id', $position->department_id)
                ->get();

            foreach ($departmentRequirements as $requirement) {
                $currentLevel = (int) ($currentSkills[$requirement->skill_id] ?? 0);
                $requiredLevel = (int) ($requirement->required_level ?? 1);

                if ($currentLevel >= $requiredLevel) {
                    continue;
                }

                $recommended->push([
                    'skill_id' => $requirement->skill_id,
                    'source_type' => DepartmentSkillRequirement::class,
                    'source_id' => $requirement->id,
                    'gap_type' => 'department_requirement',
                    'missing_level' => $requiredLevel - $currentLevel,
                ]);
            }
        }

        return $recommended
            ->unique(fn (array $skill) => $skill['skill_id'].'-'.$skill['source_type'].'-'.$skill['source_id'])
            ->values();
    }

    protected function resolveCurrentSkillMap(User $user): array
    {
        $skills = collect();

        if (method_exists($user, 'skillAllocations')) {
            $skills = $skills->merge(
                $user->skillAllocations()->get()->mapWithKeys(function ($allocation) {
                    return [$allocation->skill_id => (int) ($allocation->level ?? $allocation->proficiency_level ?? 0)];
                })
            );
        }

        if (method_exists($user, 'employeeSkillAllocations')) {
            $skills = $skills->merge(
                $user->employeeSkillAllocations()->get()->mapWithKeys(function ($allocation) {
                    return [$allocation->skill_id => (int) ($allocation->level ?? $allocation->proficiency_level ?? 0)];
                })
            );
        }

        return $skills->toArray();
    }
}