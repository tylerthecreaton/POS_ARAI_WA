<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'ingredient_id',
        'transaction_type', // in, out
        'quantity',
        'unit_cost',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_cost' => 'decimal:2',
    ];

    /**
     * Get the ingredient that owns the stock transaction.
     */
    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}
