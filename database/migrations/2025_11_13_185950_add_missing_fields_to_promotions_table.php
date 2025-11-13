<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            // Change 'type' to 'promotion_type' to match controller
            $table->renameColumn('type', 'promotion_type');

            // Add missing fields that the controller expects
            $table->decimal('min_order_amount', 10, 2)->nullable()->after('discount_value');
            $table->decimal('max_discount_amount', 10, 2)->nullable()->after('min_order_amount');
            $table->integer('usage_limit')->nullable()->after('is_active');
            $table->integer('usage_count')->default(0)->after('usage_limit');
            $table->integer('required_points')->nullable()->after('usage_count');
            $table->decimal('points_multiplier', 8, 2)->nullable()->after('required_points');
            $table->foreignId('free_product_id')->nullable()->after('points_multiplier')->constrained('products')->onDelete('set null');
            $table->integer('buy_quantity')->nullable()->after('free_product_id');
            $table->integer('get_quantity')->nullable()->after('buy_quantity');

            // Update the enum values to match controller
            $table->enum('promotion_type', ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_item', 'points_multiplier'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            // Drop the added columns
            $table->dropColumn([
                'min_order_amount',
                'max_discount_amount',
                'usage_limit',
                'usage_count',
                'required_points',
                'points_multiplier',
                'free_product_id',
                'buy_quantity',
                'get_quantity'
            ]);

            // Rename back to original
            $table->renameColumn('promotion_type', 'type');

            // Revert enum to original values
            $table->enum('type', ['percentage', 'fixed_amount', 'buy_one_get_one', 'buy_x_get_y'])->change();
        });
    }
};
