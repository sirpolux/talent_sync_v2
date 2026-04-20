<?php

namespace App\Http\Controllers;

use App\Models\SkillRecommendation;
use App\Services\SelectedCareerPathRecommendationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminSkillRecommendationController extends Controller
{
    public function __construct(
        protected SelectedCareerPathRecommendationService $selectedCareerPathRecommendationService
    ) {
    }

    public function generateFromSelectedCareerPath(Request $request, SkillRecommendation $skillRecommendation = null): RedirectResponse
    {
        $user = $request->user();

        $this->selectedCareerPathRecommendationService->generateForUser($user);

        return back()->with('success', 'Career path recommendations generated.');
    }
}