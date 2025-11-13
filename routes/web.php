<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Sales routes
    Route::get('/orders', function () {
        return Inertia::render('orders/index');
    })->name('orders.index');

    Route::get('/orders/create', function () {
        return Inertia::render('orders/create');
    })->name('orders.create');

    // Product routes
    Route::get('/products', function () {
        return Inertia::render('products/index');
    })->name('products.index');

    Route::get('/products/create', function () {
        return Inertia::render('products/create');
    })->name('products.create');

    Route::post('/products', [ProductController::class, 'storeWeb'])->name('products.store');

    Route::get('/products/{id}', function ($id) {
        return Inertia::render('products/show', ['id' => $id]);
    })->name('products.show');

    Route::get('/products/{id}/edit', function ($id) {
        return Inertia::render('products/edit', ['id' => $id]);
    })->name('products.edit');

    Route::put('/products/{id}', [ProductController::class, 'updateWeb'])->name('products.update');

    Route::delete('/products/{id}', [ProductController::class, 'destroyWeb'])->name('products.destroy');

    // Category routes
    Route::get('/categories', function () {
        return Inertia::render('categories/index');
    })->name('categories.index');

    Route::get('/categories/create', function () {
        return Inertia::render('categories/create');
    })->name('categories.create');

    Route::get('/categories/{id}/edit', function ($id) {
        return Inertia::render('categories/edit', ['id' => $id]);
    })->name('categories.edit');

    // Customer routes
    Route::get('/customers', [CustomerController::class, 'indexWeb'])->name('customers.index');
    Route::get('/customers/create', [CustomerController::class, 'createWeb'])->name('customers.create');
    Route::post('/customers', [CustomerController::class, 'storeWeb'])->name('customers.store');
    Route::get('/customers/{id}', [CustomerController::class, 'showWeb'])->name('customers.show');
    Route::get('/customers/{id}/edit', [CustomerController::class, 'editWeb'])->name('customers.edit');
    Route::put('/customers/{id}', [CustomerController::class, 'updateWeb'])->name('customers.update');
    Route::delete('/customers/{id}', [CustomerController::class, 'destroyWeb'])->name('customers.destroy');

    // Inventory routes
    Route::get('/inventory', function () {
        return Inertia::render('inventory/index');
    })->name('inventory.index');

    Route::get('/inventory/transactions', function () {
        return Inertia::render('inventory/transactions');
    })->name('inventory.transactions');

    Route::get('/inventory/transactions/create', function () {
        return Inertia::render('inventory/transactions/create');
    })->name('inventory.transactions.create');

    // Promotion routes
    Route::get('/promotions', function () {
        return Inertia::render('promotions/index');
    })->name('promotions.index');

    Route::get('/promotions/create', function () {
        return Inertia::render('promotions/create');
    })->name('promotions.create');

    // Report routes
    Route::get('/reports/sales', function () {
        return Inertia::render('reports/sales');
    })->name('reports.sales');

    Route::get('/reports/inventory', function () {
        return Inertia::render('reports/inventory');
    })->name('reports.inventory');

    // Settings routes
    Route::get('/settings', function () {
        return Inertia::render('settings/index');
    })->name('settings.index');

    Route::get('/settings/users', function () {
        return Inertia::render('settings/users');
    })->name('settings.users');
});

require __DIR__ . '/settings.php';
