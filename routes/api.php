<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public API routes (no authentication required)
Route::get('/categories/active', [CategoryController::class, 'active']);
Route::get('/products/active', [ProductController::class, 'active']);
Route::get('/promotions/active', [PromotionController::class, 'active']);

// Authenticated API routes
Route::middleware(['auth:web'])->group(function () {
    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Products - specific API endpoints only
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/products/{id}/recipe', [ProductController::class, 'recipe']);
    Route::put('/products/{id}/recipe', [ProductController::class, 'updateRecipe']);
    Route::get('/products/{id}/availability', [ProductController::class, 'checkAvailability']);

    // Orders
    Route::apiResource('orders', OrderController::class);
    Route::post('/orders/{id}/payment', [OrderController::class, 'processPayment']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/statistics', [OrderController::class, 'statistics']);

    // Customers - specific API endpoints only
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::post('/customers/{id}/points/add', [CustomerController::class, 'addPoints']);
    Route::post('/customers/{id}/points/redeem', [CustomerController::class, 'redeemPoints']);
    Route::get('/customers/{id}/statistics', [CustomerController::class, 'statistics']);
    Route::get('/customers/{id}/orders', [CustomerController::class, 'orders']);
    Route::put('/customers/{id}/tier', [CustomerController::class, 'upgradeTier']);

    // Promotions
    Route::apiResource('promotions', PromotionController::class);
    Route::post('/promotions/apply', [PromotionController::class, 'apply']);
    Route::post('/promotions/remove', [PromotionController::class, 'remove']);
    Route::get('/promotions/{id}/analytics', [PromotionController::class, 'analytics']);
    Route::post('/promotions/preview', [PromotionController::class, 'preview']);

    // Ingredients
    Route::apiResource('ingredients', IngredientController::class);
    Route::get('/ingredients/{id}/stock', [IngredientController::class, 'stock']);
    Route::put('/ingredients/{id}/stock', [IngredientController::class, 'updateStock']);

    // Stock Transactions
    Route::get('/stock-transactions/summary', [StockTransactionController::class, 'summary']);
    Route::apiResource('stock-transactions', StockTransactionController::class);

    // Dashboard
    Route::get('/dashboard/overview', [DashboardController::class, 'overview']);
    Route::get('/dashboard/sales', [DashboardController::class, 'salesData']);
    Route::get('/dashboard/inventory', [DashboardController::class, 'inventoryData']);
    Route::get('/dashboard/customers', [DashboardController::class, 'customerData']);
    Route::get('/dashboard/orders', [DashboardController::class, 'orderStats']);
});
