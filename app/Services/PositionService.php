<?php

namespace App\Services;

use App\Contracts\PositionServiceInterface;
use App\Models\Position;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * PositionService - Handles all position-related business logic
 * Follows Single Responsibility and DRY principles
 */
class PositionService implements PositionServiceInterface
{
    /**
     * Get all positions for an organization with optional search
     *
     * @param int $organizationId
     * @param string|null $search
     * @param int $perPage
     * @return Collection
     */
    public function getPositions(int $organizationId, ?string $search = null, int $perPage = 10): Collection
    {
        $query = Position::query()->where('organization_id', $organizationId);

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        return $query
            ->orderBy('name')
            ->get([
                'id',
                'organization_id',
                'department_id',
                'name',
                'slug',
                'min_months_in_role',
                'responsibilities',
                'level',
                'role_id',
                'duration_before_promotion',
                'duration_before_promotion_type',
                'reports_to',
                'added_by',
                'created_at',
            ]);
    }

    /**
     * Get positions with loaded relations for display
     *
     * @param int $organizationId
     * @param string|null $search
     * @param int $perPage
     * @return Collection
     */
    public function getPositionsWithRelations(int $organizationId, ?string $search = null, int $perPage = 15): Collection
    {
        $query = Position::query()
            ->where('organization_id', $organizationId)
            ->with(['department', 'organization']);

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        return $query
            ->orderBy('name')
            ->get([
                'id',
                'organization_id',
                'department_id',
                'name',
                'slug',
                'min_months_in_role',
                'responsibilities',
                'level',
                'role_id',
                'duration_before_promotion',
                'duration_before_promotion_type',
                'reports_to',
                'added_by',
                'created_at',
            ]);
    }

    /**
     * Get a specific position with authorization check
     *
     * @param int $organizationId
     * @param int $positionId
     * @return Position
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getPosition(int $organizationId, int $positionId): Position
    {
        return Position::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($positionId);
    }

    /**
     * Create a new position
     *
     * @param int $organizationId
     * @param array $data
     * @param int $userId
     * @return Position
     * @throws \Exception
     */
    public function createPosition(int $organizationId, array $data, int $userId): Position
    {
        $slug = Str::slug($data['name']);

        if ($this->positionExists($organizationId, $slug)) {
            throw new \Exception('A position with this name already exists in this organization.');
        }

        try {
            return Position::create([
                'organization_id' => $organizationId,
                'department_id' => $data['department_id'] ?? null,
                'name' => $data['name'],
                'slug' => $slug,
                'min_months_in_role' => $data['min_months_in_role'] ?? null,
                'responsibilities' => $data['responsibilities'] ?? null,
                'level' => $data['level'] ?? null,
                'role_id' => $data['role_id'] ?? null,
                'duration_before_promotion' => $data['duration_before_promotion'] ?? null,
                'duration_before_promotion_type' => $data['duration_before_promotion_type'] ?? null,
                'reports_to' => $data['reports_to'] ?? null,
                'added_by' => $userId,
            ]);
        } catch (QueryException $e) {
            // Handle race condition where two requests create the same slug simultaneously
            if (str_contains((string) $e->getMessage(), 'positions_organization_id_slug_unique')) {
                throw new \Exception('A position with this name already exists in this organization.');
            }

            throw $e;
        }
    }

    /**
     * Update an existing position
     *
     * @param int $organizationId
     * @param int $positionId
     * @param array $data
     * @param int $userId
     * @return Position
     * @throws \Exception
     */
    public function updatePosition(int $organizationId, int $positionId, array $data, int $userId): Position
    {
        $position = $this->getPosition($organizationId, $positionId);

        // Check slug uniqueness if name is being updated
        if (isset($data['name']) && $data['name'] !== $position->name) {
            $newSlug = Str::slug($data['name']);
            if ($this->positionExists($organizationId, $newSlug, $positionId)) {
                throw new \Exception('A position with this name already exists in this organization.');
            }
            $data['slug'] = $newSlug;
        }

        try {
            $position->update(array_filter($data, fn($value) => $value !== null));
            return $position->refresh();
        } catch (QueryException $e) {
            if (str_contains((string) $e->getMessage(), 'positions_organization_id_slug_unique')) {
                throw new \Exception('A position with this name already exists in this organization.');
            }

            throw $e;
        }
    }

    /**
     * Delete a position from an organization
     *
     * @param int $organizationId
     * @param int $positionId
     * @return bool
     * @throws \Exception
     */
    public function deletePosition(int $organizationId, int $positionId): bool
    {
        $position = $this->getPosition($organizationId, $positionId);

        // Check if position has any related data that prevents deletion
        // This can be extended based on business rules
        $hasActiveUsers = $position->users()->exists();

        if ($hasActiveUsers) {
            throw new \Exception('Cannot delete a position that has active users assigned.');
        }

        return (bool) $position->delete();
    }

    /**
     * Check if a position slug exists in organization
     *
     * @param int $organizationId
     * @param string $slug
     * @param int|null $excludeId
     * @return bool
     */
    public function positionExists(int $organizationId, string $slug, ?int $excludeId = null): bool
    {
        $query = Position::query()
            ->where('organization_id', $organizationId)
            ->where('slug', $slug);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get paginated positions for listing views
     *
     * @param int $organizationId
     * @param string|null $search
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function getPaginatedPositions(int $organizationId, ?string $search = null, int $page = 1, int $perPage = 15): array
    {
        $query = Position::query()
            ->where('organization_id', $organizationId)
            ->with(['department', 'organization']);

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        $paginated = $query
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
                'has_more' => $paginated->hasMorePages(),
            ],
        ];
    }
}
