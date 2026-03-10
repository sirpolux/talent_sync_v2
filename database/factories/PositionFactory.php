<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position>
 */
class PositionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->jobTitle();

        return [
            'organization_id' => Organization::factory(),
            'department_id' => Department::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'min_months_in_role' => $this->faker->randomElement([0, 6, 12, 24]),
            'responsibilities' => $this->faker->paragraph(),
            'level' => $this->faker->numberBetween(1, 5),
            'role_id' => $this->faker->optional()->word(),
            'duration_before_promotion' => $this->faker->optional()->numberBetween(6, 36),
            'duration_before_promotion_type' => $this->faker->optional()->randomElement(['DAYS', 'MONTHS', 'YEARS']),
            'reports_to' => $this->faker->optional()->word(),
            'added_by' => $this->faker->optional()->uuid(),
        ];
    }
}
