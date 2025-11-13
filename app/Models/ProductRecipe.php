<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductRecipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'ingredient_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    /**
     * Get the product that owns the recipe.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the ingredient that owns the recipe.
     */
    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
