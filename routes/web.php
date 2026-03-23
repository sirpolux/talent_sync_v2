<?php

use App\Http\Controllers\AdminDepartmentController;
use App\Http\Controllers\AdminOrganizationController;
use App\Http\Controllers\AdminPositionController;
use App\Http\Controllers\AdminSkillController;
use App\Http\Controllers\AdminCompetencyController;
use App\Http\Controllers\AdminGradingSystemController;
use App\Http\Controllers\AdminAssessmentController;
use App\Http\Controllers\AdminTransitionController;
use App\Http\Controllers\AdminHierarchyController;
use App\Http\Controllers\AdminCareerPathController;
use App\Http\Controllers\AdminPromotionController;
use App\Http\Controllers\AdminSkillGapController;
use App\Http\Controllers\AdminTrainingProgramController;
use App\Http\Controllers\AdminTrainingRequestController;
use App\Http\Controllers\AdminTrainerController;
use App\Http\Controllers\TutorDashboardController;
use App\Http\Controllers\AdminReportingController;
use App\Http\Controllers\AdminEmployeeController;
use App\Http\Controllers\AdminStaffAssignmentController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminAdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationInvitationController;
use App\Http\Controllers\GeoController;
use App\Http\Controllers\OrganizationSelectionController;
use App\Http\Controllers\AdminEmployeeSkillController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StaffSkillController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home/Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

    Route::middleware(['auth', 'verified', 'org.context'])->group(function () {
    Route::prefix('staff')->name('staff.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Staff/Dashboard');
        })->name('dashboard');

        // Account
        Route::get('/account/profile', [\App\Http\Controllers\StaffAccountController::class, 'profile'])
            ->name('account.profile');

        Route::get('/account/password', fn () => Inertia::render('Staff/Account/Password'))
            ->name('account.password');

        // Training
        Route::get('/training', fn () => Inertia::render('Staff/Training/Index'))->name('training.index');
        Route::get('/training/available', fn () => Inertia::render('Staff/Training/Available'))->name('training.available');
        Route::get('/training/requests', fn () => Inertia::render('Staff/Training/Requests'))->name('training.requests');

        // Skills & Evidence
        Route::get('/skills', [StaffSkillController::class, 'index'])->name('skills.index');
        Route::post('/skills', [StaffSkillController::class, 'store'])->name('skills.store');
        Route::get('/skills/{allocation}', [StaffSkillController::class, 'show'])->name('skills.show');

        Route::post('/skills/{allocation}/evidence', [StaffSkillController::class, 'uploadEvidence'])
            ->name('skills.evidence.upload');
        Route::patch('/skills/evidence/{evidence}/verify', [StaffSkillController::class, 'markEvidenceVerified'])
            ->name('skills.evidence.verify');

        Route::get('/skills/upload', fn () => Inertia::render('Staff/Skills/Upload'))->name('skills.upload');

        // Career & Promotion
        Route::get('/promotions/eligibility', fn () => Inertia::render('Staff/Promotions/Eligibility'))->name('promotions.eligibility');
        Route::get('/promotions', fn () => Inertia::render('Staff/Promotions/Index'))->name('promotions.index');
        Route::get('/promotions/apply', fn () => Inertia::render('Staff/Promotions/Create'))->name('promotions.create');

        // Leave
        Route::get('/leave', fn () => Inertia::render('Staff/Leave/Index'))->name('leave.index');
        Route::get('/leave/apply', fn () => Inertia::render('Staff/Leave/Create'))->name('leave.create');

        // Notifications
        Route::get('/notifications', fn () => Inertia::render('Staff/Notifications/Index'))->name('notifications.index');
    });

    Route::prefix('trainer')->name('trainer.')->group(function () {
        Route::get('/', [TutorDashboardController::class, 'index'])->name('dashboard');
        Route::get('/skills', [TutorDashboardController::class, 'skills'])->name('skills.index');
        Route::get('/requests', [TutorDashboardController::class, 'requests'])->name('requests.index');
        Route::get('/sessions', [TutorDashboardController::class, 'sessions'])->name('sessions.index');
        Route::get('/progress', [TutorDashboardController::class, 'progress'])->name('progress.index');
        Route::get('/assessments', [TutorDashboardController::class, 'assessments'])->name('assessments.index');
        Route::get('/messages', [TutorDashboardController::class, 'messages'])->name('messages.index');
        Route::get('/notifications', [TutorDashboardController::class, 'notifications'])->name('notifications.index');
    });
});

Route::middleware(['auth', 'verified', 'org.context', 'org.admin'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // Company & Organization Setup
    Route::get('/admin/company', [AdminOrganizationController::class, 'show'])->name('admin.company.show');
    Route::get('/admin/company/edit', [AdminOrganizationController::class, 'edit'])->name('admin.company.edit');

    // Sectioned updates (split to avoid partial updates missing fields)
    Route::patch('/admin/company/edit/company', [AdminOrganizationController::class, 'updateCompanyData'])
        ->name('admin.company.update.company');

    Route::patch('/admin/company/edit/address', [AdminOrganizationController::class, 'updateCompanyAddress'])
        ->name('admin.company.update.address');

    Route::patch('/admin/company/edit/stats', [AdminOrganizationController::class, 'updateCompanyStats'])
        ->name('admin.company.update.stats');

    Route::patch('/admin/company/edit/access', [AdminOrganizationController::class, 'updateCompanyAccess'])
        ->name('admin.company.update.access');

    Route::patch('/admin/company/edit/compliance', [AdminOrganizationController::class, 'updateCompanyCompliance'])
        ->name('admin.company.update.compliance');

    // Departments
    // Route::get('/admin/departments', [AdminDepartmentController::class, 'index'])->name('admin.departments.index');
    // Route::get('/admin/departments/create', [AdminDepartmentController::class, 'create'])->name('admin.departments.create');
    // Route::post('/admin/departments', [AdminDepartmentController::class, 'store'])->name('admin.departments.store');
    // Route::get('/admin/departments/{department}/edit', [AdminDepartmentController::class, 'edit'])->name('admin.departments.edit');
    // Route::patch('/admin/departments/{department}', [AdminDepartmentController::class, 'update'])->name('admin.departments.update');
    // Route::delete('/admin/departments/{department}', [AdminDepartmentController::class, 'destroy'])->name('admin.departments.destroy');

    // Positions
    Route::name('admin.')->group(function(){
        Route::resource('/admin/positions', AdminPositionController::class);
    });

    Route::get('/admin/account/password', function () {
        return Inertia::render('Admin/Account/Password');
    })->name('admin.account.password');

    // ============================================
    // TALENT DEVELOPMENT ROUTES
    // ============================================
    Route::name('admin.')->prefix('admin')->group(function() {
        Route::resource('skills', AdminSkillController::class);
        Route::resource('competencies', AdminCompetencyController::class)->only(['index']);

        Route::get('competencies/departments/{department}', [AdminCompetencyController::class, 'department'])
            ->name('competencies.department');

        Route::get('competencies/positions/{position}', [AdminCompetencyController::class, 'position'])
            ->name('competencies.position');

        Route::post('competencies/department', [AdminCompetencyController::class, 'storeDepartment'])
            ->name('competencies.department.store');

        Route::patch('competencies/department/{departmentCompetency}', [AdminCompetencyController::class, 'updateDepartment'])
            ->name('competencies.department.update');

        Route::post('competencies/position', [AdminCompetencyController::class, 'storePosition'])
            ->name('competencies.position.store');

        Route::patch('competencies/position/{positionCompetency}', [AdminCompetencyController::class, 'updatePosition'])
            ->name('competencies.position.update');

        Route::resource('grading', AdminGradingSystemController::class);
        Route::resource('assessments', AdminAssessmentController::class);

        Route::resource('departments', AdminDepartmentController::class);
        Route::patch('departments/{department}/activate', [AdminDepartmentController::class, 'activate'])
            ->name('departments.activate');


        // ============================================
        // CAREER MANAGEMENT ROUTES
        // ============================================
        Route::resource('career-paths', AdminCareerPathController::class);
        Route::resource('transitions', AdminTransitionController::class);
        Route::resource('hierarchies', AdminHierarchyController::class);
        Route::prefix('promotions')->name('promotions.')->group(function() {
            Route::get('eligible', [AdminPromotionController::class, 'eligible'])->name('eligible');
            Route::get('pending', [AdminPromotionController::class, 'pending'])->name('pending');
            Route::get('history', [AdminPromotionController::class, 'history'])->name('history');
        });
        Route::get('skills-gap', [AdminSkillGapController::class, '__invoke'])->name('skills-gap.index');

        // ============================================
        // TRAINING & DEVELOPMENT ROUTES
        // ============================================
        Route::prefix('training')->name('training.')->group(function() {
            Route::resource('programs', AdminTrainingProgramController::class);
            Route::prefix('requests')->name('requests.')->group(function() {
                Route::get('/', [AdminTrainingRequestController::class, '__invoke'])->name('index');
                Route::get('pending', [AdminTrainingRequestController::class, 'pending'])->name('pending');
            });
        });
        Route::resource('trainers', AdminTrainerController::class);

        // ============================================
        // REPORTING & ANALYTICS ROUTES
        // ============================================
        Route::prefix('reporting')->name('reporting.')->group(function() {
            Route::get('dashboard', [AdminReportingController::class, 'dashboard'])->name('dashboard');
            Route::get('promotions', [AdminReportingController::class, 'promotions'])->name('promotions');
            Route::get('skills', [AdminReportingController::class, 'skills'])->name('skills');
            Route::get('staff', [AdminReportingController::class, 'staff'])->name('staff');
            Route::get('exports', [AdminReportingController::class, 'exports'])->name('exports');
        });

        // ============================================
        // STAFF MANAGEMENT ROUTES
        // ============================================
        Route::resource('employees', AdminEmployeeController::class);

        // Employee Skills (admin)
        Route::prefix('employees/{employee}')->name('employees.')->group(function () {
            Route::get('skills', [AdminEmployeeSkillController::class, 'index'])->name('skills.index');
            Route::post('skills', [AdminEmployeeSkillController::class, 'store'])->name('skills.store');
            Route::get('skills/{allocation}', [AdminEmployeeSkillController::class, 'show'])->name('skills.show');

            Route::post('skills/{allocation}/evidence', [AdminEmployeeSkillController::class, 'uploadEvidence'])
                ->name('skills.evidence.upload');
            Route::patch('skills/evidence/{evidence}/verify', [AdminEmployeeSkillController::class, 'verifyEvidence'])
                ->name('skills.evidence.verify');
            Route::patch('skills/evidence/{evidence}/reject', [AdminEmployeeSkillController::class, 'rejectEvidence'])
                ->name('skills.evidence.reject');

            Route::patch('skills/{allocation}/verify', [AdminEmployeeSkillController::class, 'verifyAllocation'])
                ->name('skills.verify');
            Route::patch('skills/{allocation}/unverify', [AdminEmployeeSkillController::class, 'unverifyAllocation'])
                ->name('skills.unverify');
        });
        Route::prefix('staff')->name('staff.')->group(function() {
            Route::resource('assignments', AdminStaffAssignmentController::class);
        });

        // ============================================
        // SETUP & ADMINISTRATION ROUTES
        // ============================================
        Route::resource('roles', AdminRoleController::class);
        Route::resource('settings', AdminSettingsController::class);
        Route::resource('admins', AdminAdminController::class);
    });
});

Route::middleware('auth')->group(function () {
    // Geo endpoints for dropdowns (countries + states)
    Route::get('/api/geo/countries', [GeoController::class, 'countries'])->name('api.geo.countries');
    Route::get('/api/geo/states', [GeoController::class, 'states'])->name('api.geo.states');

    Route::get('/org/select', [OrganizationSelectionController::class, 'index'])->name('org.select');
    Route::post('/org/set-current', [OrganizationSelectionController::class, 'setCurrent'])->name('org.set-current');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Accept org invitation (guest reachable; invitee sets password if not logged in)
Route::get('/org/invitations/{token}/accept', [OrganizationInvitationController::class, 'accept'])
    ->name('org.invitations.accept');
Route::post('/org/invitations/{token}/accept', [OrganizationInvitationController::class, 'acceptStore'])
    ->name('org.invitations.accept.store');

require __DIR__.'/auth.php';
