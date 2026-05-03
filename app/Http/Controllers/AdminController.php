<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use App\Models\EmployeeSkillAllocation;
use App\Models\EmployeeSkillEvidence;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getMetrics()
    {
        $totalStaff = EmployeeSkillAllocation::count();
        $activeStaff = EmployeeSkillAllocation::where('status', 'active')->count();
        $pendingTrainingRequests = EmployeeSkillEvidence::where('status', 'pending')->count();
        $pendingLeaveApplications = LeaveRequest::where('status', 'pending')->count();

        return response()->json([
            'totalStaff' => $totalStaff,
            'activeStaff' => $activeStaff,
            'pendingTrainingRequests' => $pendingTrainingRequests,
            'pendingLeaveApplications' => $pendingLeaveApplications,
        ]);
    }

    public function getRecentActivities()
    {
        $recentActivities = [
            'John Doe applied for leave on 27 April 2026.',
            'Training session "Leadership 101" completed on 26 April 2026.',
            'Jane Smith applied for promotion on 25 April 2026.'
        ];

        return response()->json($recentActivities);
    }
}