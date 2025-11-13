<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'user_id',
        'order_type', // walk_in, pre_order
        'status', // pending, preparing, ready, completed, cancelled
        'total_amount',
        'discount_amount',
        'final_amount',
        'payment_method', // cash, transfer, credit_card, qr_code
        'payment_status', // pending, paid, refunded
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
    ];

    /**
     * Get the customer that owns the order.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the user that created the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the promotions for the order.
     */
    public function orderPromotions()
    {
        return $this->hasMany(OrderPromotion::class);
    }
}
