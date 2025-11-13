<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'promotion_type', // percentage, fixed_amount, buy_one_get_one, free_item, points_multiplier
        'discount_value',
        'min_order_amount',
        'max_discount_amount',
        'start_date',
        'end_date',
        'is_active',
        'usage_limit',
        'usage_count',
        'required_points',
        'points_multiplier',
        'free_product_id',
        'buy_quantity',
        'get_quantity',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'points_multiplier' => 'decimal:2',
    ];

    /**
     * Get order promotions for promotion.
     */
    public function orderPromotions()
    {
        return $this->hasMany(OrderPromotion::class);
    }

    /**
     * Get applicable products for the promotion.
     */
    public function applicableProducts()
    {
        return $this->belongsToMany(Product::class, 'promotion_product');
    }

    /**
     * Get applicable categories for the promotion.
     */
    public function applicableCategories()
    {
        return $this->belongsToMany(Category::class, 'promotion_category');
    }

    /**
     * Get the free product for the promotion.
     */
    public function freeProduct()
    {
        return $this->belongsTo(Product::class, 'free_product_id');
    }

    /**
     * Check if promotion is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->start_date && $now->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return false;
        }

        if ($this->usage_limit && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    /**
     * Get promotion type label in Thai.
     */
    public function getPromotionTypeLabelAttribute(): string
    {
        return match($this->promotion_type) {
            'percentage' => 'ส่วนลดเปอร์เซ็นต์',
            'fixed_amount' => 'ส่วนลดคงที่',
            'buy_one_get_one' => 'ซื้อ 1 แถม 1',
            'free_item' => 'แถมฟรี',
            'points_multiplier' => 'คูณแต้ม',
            default => $this->promotion_type,
        };
    }

    /**
     * Check if promotion has reached its usage limit.
     */
    public function hasReachedUsageLimit(): bool
    {
        return $this->usage_limit && $this->usage_count >= $this->usage_limit;
    }
}
