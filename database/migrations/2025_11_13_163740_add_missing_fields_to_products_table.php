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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('cost', 10, 2)->nullable()->after('price');
            $table->string('sku', 100)->nullable()->unique()->after('image_url');
            $table->string('barcode', 100)->nullable()->unique()->after('sku');
            $table->boolean('is_active')->default(true)->after('is_available');
            $table->integer('sort_order')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['cost', 'sku', 'barcode', 'is_active', 'sort_order']);
        });
    }
};
