<?php

namespace Database\Seeders;

use App\Models\GradingSystem;
use App\Models\Grade;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GradingSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. University-style (A-F) - System Wide Default
        $university = GradingSystem::create([
            'organization_id' => null, // System-wide
            'name' => 'University Grading System (A-F)',
            'description' => 'Standard academic grading system with letter grades',
            'is_default' => true,
        ]);

        $universityGrades = [
            ['A', 90, 100, 'Excellent', 1],
            ['B', 80, 89, 'Very Good', 2],
            ['C', 70, 79, 'Good', 3],
            ['D', 60, 69, 'Fair', 4],
            ['E', 50, 59, 'Pass', 5],
            ['F', 0, 49, 'Fail', 6],
        ];

        foreach ($universityGrades as [$label, $min, $max, $desc, $order]) {
            Grade::create([
                'grading_system_id' => $university->id,
                'label' => $label,
                'min_value' => $min,
                'max_value' => $max,
                'description' => $desc,
                'order' => $order,
            ]);
        }

        // 2. Numeric Performance Scale (1-5) - System Wide Default
        $numeric = GradingSystem::create([
            'organization_id' => null, // System-wide
            'name' => 'Numeric Performance Scale (1-5)',
            'description' => 'Typical performance rating scale',
            'is_default' => true,
        ]);

        $numericGrades = [
            ['1 - Poor', 1, 1, 'Poor performance, significant improvement needed', 5],
            ['2 - Fair', 2, 2, 'Needs improvement, below expectations', 4],
            ['3 - Good', 3, 3, 'Meets expectations, satisfactory performance', 3],
            ['4 - Very Good', 4, 4, 'Exceeds expectations, strong performance', 2],
            ['5 - Excellent', 5, 5, 'Outstanding performance, exceptional results', 1],
        ];

        foreach ($numericGrades as [$label, $min, $max, $desc, $order]) {
            Grade::create([
                'grading_system_id' => $numeric->id,
                'label' => $label,
                'min_value' => $min,
                'max_value' => $max,
                'description' => $desc,
                'order' => $order,
            ]);
        }

        // 3. Pass/Fail System - System Wide Default
        $passFail = GradingSystem::create([
            'organization_id' => null, // System-wide
            'name' => 'Pass/Fail System',
            'description' => 'Simple binary grading system',
            'is_default' => true,
        ]);

        $passFailGrades = [
            ['Fail', 0, 49, 'Does not meet requirements', 2],
            ['Pass', 50, 100, 'Meets requirements', 1],
        ];

        foreach ($passFailGrades as [$label, $min, $max, $desc, $order]) {
            Grade::create([
                'grading_system_id' => $passFail->id,
                'label' => $label,
                'min_value' => $min,
                'max_value' => $max,
                'description' => $desc,
                'order' => $order,
            ]);
        }

        // 4. Percentage Scale (0-100) - System Wide Default
        $percentage = GradingSystem::create([
            'organization_id' => null, // System-wide
            'name' => 'Percentage Scale (0-100)',
            'description' => 'Detailed 10-point grading scale based on percentages',
            'is_default' => true,
        ]);

        $percentageGrades = [
            ['0-10%', 0, 10, 'Fail - Critical issues', 10],
            ['11-20%', 11, 20, 'Fail - Severe shortcomings', 9],
            ['21-40%', 21, 40, 'Fail - Major gaps', 8],
            ['41-50%', 41, 50, 'Fail - Below minimum', 7],
            ['51-60%', 51, 60, 'Pass - Minimal satisfactory', 6],
            ['61-70%', 61, 70, 'Satisfactory - Meets basic needs', 5],
            ['71-80%', 71, 80, 'Good - Above average', 4],
            ['81-90%', 81, 90, 'Very Good - Well above average', 3],
            ['91-95%', 91, 95, 'Excellent - Outstanding', 2],
            ['96-100%', 96, 100, 'Perfect - Exceptional excellence', 1],
        ];

        foreach ($percentageGrades as [$label, $min, $max, $desc, $order]) {
            Grade::create([
                'grading_system_id' => $percentage->id,
                'label' => $label,
                'min_value' => $min,
                'max_value' => $max,
                'description' => $desc,
                'order' => $order,
            ]);
        }

        // 5. Competency Level (Beginner to Expert) - System Wide Default
        $competency = GradingSystem::create([
            'organization_id' => null, // System-wide
            'name' => 'Competency Levels (Beginner to Expert)',
            'description' => 'Skill proficiency assessment from beginner to expert',
            'is_default' => true,
        ]);

        $competencyGrades = [
            ['Beginner', 1, 20, 'Just starting, requires close supervision', 5],
            ['Novice', 21, 40, 'Learning, needs guidance', 4],
            ['Intermediate', 41, 60, 'Capable, works independently', 3],
            ['Advanced', 61, 80, 'Highly skilled, mentors others', 2],
            ['Expert', 81, 100, 'Master level, sets standards', 1],
        ];

        foreach ($competencyGrades as [$label, $min, $max, $desc, $order]) {
            Grade::create([
                'grading_system_id' => $competency->id,
                'label' => $label,
                'min_value' => $min,
                'max_value' => $max,
                'description' => $desc,
                'order' => $order,
            ]);
        }
    }
}
