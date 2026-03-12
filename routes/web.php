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
use App\Http\Controllers\AdminPromotionController;
use App\Http\Controllers\AdminSkillGapController;
use App\Http\Controllers\AdminTrainingProgramController;
use App\Http\Controllers\AdminTrainingRequestController;
use App\Http\Controllers\AdminTrainerController;
use App\Http\Controllers\AdminReportingController;
use App\Http\Controllers\AdminEmployeeController;
use App\Http\Controllers\AdminStaffAssignmentController;
use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminAdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationSelectionController;
use App\Http\Controllers\ProfileController;
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

Route::middleware(['auth', 'verified', 'org.context', 'org.admin'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // Company & Organization Setup
    Route::get('/admin/company', [AdminOrganizationController::class, 'show'])->name('admin.company.show');
    Route::get('/admin/company/edit', [AdminOrganizationController::class, 'edit'])->name('admin.company.edit');
    Route::patch('/admin/company/edit', [AdminOrganizationController::class, 'update'])->name('admin.company.update');

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
    Route::get('/org/select', [OrganizationSelectionController::class, 'index'])->name('org.select');
    Route::post('/org/set-current', [OrganizationSelectionController::class, 'setCurrent'])->name('org.set-current');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
