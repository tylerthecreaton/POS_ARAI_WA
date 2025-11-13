<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'cost',
        'image_url',
        'image',
        'is_available',
        'is_active',
        'sku',
        'barcode',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the image URL for display.
     * Returns the uploaded image URL if available, otherwise returns the external image_url.
     */
    public function getDisplayImageUrl(): ?string
    {
        if ($this->image) {
            return Storage::url($this->image);
        }

        return $this->image_url;
    }

    /**
     * Get the category that owns the product.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the product recipes for the product.
     */
    public function productRecipes()
    {
        return $this->hasMany(ProductRecipe::class);
    }

    /**
     * Alias for productRecipes (used by controller).
     */
    public function recipe()
    {
        return $this->hasMany(ProductRecipe::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
