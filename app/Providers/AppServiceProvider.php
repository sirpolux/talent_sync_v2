<?php

namespace App\Providers;

use App\Contracts\PositionServiceInterface;
use App\Services\PositionService;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind PositionService to PositionServiceInterface
        // Follows Dependency Inversion Principle - allows for easy testing and swapping implementations
        $this->app->bind(PositionServiceInterface::class, PositionService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
