<?php

use App\Http\Controllers\AdminDepartmentController;
use App\Http\Controllers\AdminOrganizationController;
use App\Http\Controllers\AdminPositionController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'org.context', 'org.admin'])->group(function () {
    Route::get('/admin', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    Route::get('/admin/company', [AdminOrganizationController::class, 'show'])->name('admin.company.show');
    Route::get('/admin/company/edit', [AdminOrganizationController::class, 'edit'])->name('admin.company.edit');
    Route::patch('/admin/company/edit', [AdminOrganizationController::class, 'update'])->name('admin.company.update');

    Route::get('/admin/departments', [AdminDepartmentController::class, 'index'])->name('admin.departments.index');
    Route::get('/admin/departments/create', [AdminDepartmentController::class, 'create'])->name('admin.departments.create');
    Route::post('/admin/departments', [AdminDepartmentController::class, 'store'])->name('admin.departments.store');
    Route::get('/admin/departments/{department}/edit', [AdminDepartmentController::class, 'edit'])->name('admin.departments.edit');
    Route::patch('/admin/departments/{department}', [AdminDepartmentController::class, 'update'])->name('admin.departments.update');
    Route::delete('/admin/departments/{department}', [AdminDepartmentController::class, 'destroy'])->name('admin.departments.destroy');

    Route::resource('/admin/positions', AdminPositionController::class);
    Route::get('/admin/account/password', function () {
        return Inertia::render('Admin/Account/Password');
    })->name('admin.account.password');
});

Route::middleware('auth')->group(function () {
    Route::get('/org/select', [OrganizationSelectionController::class, 'index'])->name('org.select');
    Route::post('/org/set-current', [OrganizationSelectionController::class, 'setCurrent'])->name('org.set-current');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
