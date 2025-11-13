<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Product;

echo "Checking products with images:\n";
echo "=============================\n";

$products = Product::whereNotNull('image')->get(['id', 'name', 'image']);

foreach ($products as $product) {
    echo "ID: {$product->id}\n";
    echo "Name: {$product->name}\n";
    echo "Image Path: {$product->image}\n";
    echo "Image URL: {$product->image_url}\n";
    echo "Full Image URL: " . asset('storage/' . $product->image) . "\n";
    echo "----------------------------\n";
}

echo "\nChecking products with image_url:\n";
echo "================================\n";

$productsWithUrl = Product::whereNotNull('image_url')->get(['id', 'name', 'image_url']);

foreach ($productsWithUrl as $product) {
    echo "ID: {$product->id}\n";
    echo "Name: {$product->name}\n";
    echo "Image URL: {$product->image_url}\n";
    echo "----------------------------\n";
}
