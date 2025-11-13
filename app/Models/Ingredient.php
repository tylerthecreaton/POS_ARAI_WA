<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit',
        'current_stock',
        'min_stock',
        'cost_per_unit',
    ];

    protected $casts = [
        'current_stock' => 'decimal:2',
        'min_stock' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
    ];

    /**
     * Get the product recipes for the ingredient.
     */
    public function productRecipes()
    {
        return $this->hasMany(ProductRecipe::class);
    }

    /**
     * Get the stock transactions for the ingredient.
     */
    public function stockTransactions()
    {
        return $this->hasMany(StockTransaction::class);
    }
}
