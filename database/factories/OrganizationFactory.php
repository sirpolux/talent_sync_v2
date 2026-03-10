<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    public function definition(): array
    {

    return [

    ];
        // $companyName = $this->faker->unique()->company();

        // return [
        //     'company_name' => $companyName,
        //     'slug' => Str::slug($companyName) . '-' . $this->faker->unique()->numerify('####'),
        //     'company_type' => $this->faker->randomElement(['Startup', 'SME', 'Enterprise']),
        //     'company_address' => $this->faker->address(),
        //     'company_email' => $this->faker->unique()->companyEmail(),
        //     'company_description' => $this->faker->optional()->paragraph(),
        //     'date_of_incoporation' => $this->faker->optional()->date(),
        //     'rn_number' => $this->faker->optional()->numerify('RN#####'),
        //     'tax_number' => $this->faker->optional()->numerify('TAX#####'),
        //     'employee_range' => $this->faker->randomElement(['1-10', '11-50', '51-200', '201-500', '500+']),
        //     'company_size' => $this->faker->randomElement(['Small', 'Medium', 'Large']),
        //     'country' => $this->faker->country(),
        //     'state' => $this->faker->state(),
        //     'local_government' => $this->faker->optional()->city(),
        //     'province' => $this->faker->optional()->state(),
        //     'logo_url' => $this->faker->optional()->imageUrl(),
        //     'contact_number' => $this->faker->optional()->phoneNumber(),

        //     'created_by' => (string) 1,

        //     'onboarding_stage' => 0,
        //     'onboarding_complete' => false,
        //     'allow_self_registration' => false,
        // ];
    }
}
