<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'เครื่องดื่ม',
                'description' => 'เครื่องดื่มต่างๆ เช่น กาแฟ ชา น้ำผลไม้',
                'is_active' => true,
            ],
            [
                'name' => 'ของว่าง',
                'description' => 'ขนมขบเคี้ยวและของว่างต่างๆ',
                'is_active' => true,
            ],
            [
                'name' => 'อาหารหลัก',
                'description' => 'อาหารหลักและมื้ออาหารต่างๆ',
                'is_active' => true,
            ],
            [
                'name' => 'ของหวาน',
                'description' => 'ขนมหวานและของโปรดต่างๆ',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
