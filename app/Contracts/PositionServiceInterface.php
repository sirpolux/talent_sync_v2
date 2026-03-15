<?php

namespace App\Contracts;

use App\Models\Position;
use Illuminate\Support\Collection;

/**
 * PositionServiceInterface - Contract for Position management operations
 * Follows Dependency Inversion Principle SOLID
 */
interface PositionServiceInterface
{
    /**
     * Get all positions for an organization with optional search and pagination
     */
    public function getPositions(int $organizationId, ?string $search = null, int $perPage = 10): Collection;

    /**
     * Get a position by ID with organization verification
     */
    public function getPosition(int $organizationId, int $positionId): Position;

    /**
     * Create a new position for an organization
     */
    public function createPosition(int $organizationId, array $data, int $userId): Position;

    /**
     * Update an existing position
     */
    public function updatePosition(int $organizationId, int $positionId, array $data, int $userId): Position;

    /**
     * Delete a position from an organization
     */
    public function deletePosition(int $organizationId, int $positionId): bool;

    /**
     * Check if position name/slug exists in organization
     */
    public function positionExists(int $organizationId, string $slug, ?int $excludeId = null): bool;

    /**
     * Get positions with related data for display
     */
    public function getPositionsWithRelations(int $organizationId, ?string $search = null, int $perPage = 15): Collection;

    /**
     * Get paginated positions for display
     */
    public function getPaginatedPositions(
        int $organizationId,
        ?string $search = null,
        int $page = 1,
        int $perPage = 15,
        int|string|null $departmentId = null
    ): array;
}
