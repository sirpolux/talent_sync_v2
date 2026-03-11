<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class GlobalSkillsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates system-wide/global skills (organization_id = null).
     * Idempotent via updateOrCreate on (organization_id, name).
     */
    public function run(): void
    {
        $skills = [
            // Soft Skills
            [
                'name' => 'Communication',
                'description' => 'Clear written and verbal communication with stakeholders.',
                'type' => 'skill',
                'category' => 'Soft Skills',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Teamwork',
                'description' => 'Collaboration and effective participation in teams.',
                'type' => 'skill',
                'category' => 'Soft Skills',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Problem Solving',
                'description' => 'Structured problem analysis and solution development.',
                'type' => 'skill',
                'category' => 'Soft Skills',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Time Management',
                'description' => 'Prioritization and effective use of time to meet deadlines.',
                'type' => 'skill',
                'category' => 'Soft Skills',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Leadership',
                'description' => 'Ability to lead, influence, and develop others.',
                'type' => 'skill',
                'category' => 'Soft Skills',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],

            // Technical (generic)
            [
                'name' => 'Microsoft Excel',
                'description' => 'Spreadsheets, formulas, pivot tables, and basic data analysis.',
                'type' => 'skill',
                'category' => 'Technical',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Data Analysis',
                'description' => 'Collecting, cleaning, and analyzing data to support decisions.',
                'type' => 'skill',
                'category' => 'Technical',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Project Management',
                'description' => 'Planning and executing projects with scope, time, and resource controls.',
                'type' => 'skill',
                'category' => 'Technical',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'Stakeholder Management',
                'description' => 'Managing expectations and communication with key stakeholders.',
                'type' => 'skill',
                'category' => 'Technical',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],

            // Educational (examples)
            [
                'name' => 'BSc (Relevant Field)',
                'description' => 'Bachelor degree in a relevant discipline.',
                'type' => 'degree',
                'category' => 'Educational',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
            [
                'name' => 'MSc (Relevant Field)',
                'description' => 'Master degree in a relevant discipline.',
                'type' => 'degree',
                'category' => 'Educational',
                'applies_to_all_departments' => true,
                'department_id' => null,
                'is_active' => true,
            ],
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(
                [
                    'organization_id' => null,
                    'name' => $skill['name'],
                ],
                [
                    'description' => $skill['description'] ?? null,
                    'type' => $skill['type'],
                    'category' => $skill['category'],
                    'applies_to_all_departments' => $skill['applies_to_all_departments'] ?? true,
                    'department_id' => $skill['department_id'] ?? null,
                    'added_by' => null,
                    'is_active' => $skill['is_active'] ?? true,
                ]
            );
        }
    }
}
