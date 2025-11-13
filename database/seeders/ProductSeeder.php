<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        if ($categories->isEmpty()) {
            $this->command->warn('No categories found. Please run CategorySeeder first.');
            return;
        }

        $products = [
            [
                'category_id' => $categories->where('name', 'เครื่องดื่ม')->first()->id,
                'name' => 'กาแฟอเมริกาโน',
                'description' => 'กาแฟเข้มข้นที่ทำจากเมล็ดกาแฟคุณภาพสูง',
                'price' => 65.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'เครื่องดื่ม')->first()->id,
                'name' => 'ชาเย็น',
                'description' => 'ชาเย็นสดชื่นที่ทำจากใบชาธรรมชาติ',
                'price' => 45.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'เครื่องดื่ม')->first()->id,
                'name' => 'น้ำส้ม',
                'description' => 'น้ำส้มสดจากส้มแท้ 100%',
                'price' => 40.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'ของว่าง')->first()->id,
                'name' => 'คุกกี้ช็อกโกแลต',
                'description' => 'คุกกี้ช็อกโกแลตกรอบอร่อย',
                'price' => 35.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'ของว่าง')->first()->id,
                'name' => 'มันฝรั่งทอด',
                'description' => 'มันฝรั่งทอดกรอบเครื่องเทศ',
                'price' => 50.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'อาหารหลัก')->first()->id,
                'name' => 'ข้าวผัด',
                'description' => 'ข้าวผัดรสเด็ดจากเชฟของเรา',
                'price' => 120.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'อาหารหลัก')->first()->id,
                'name' => 'มั่นหมี่ผัด',
                'description' => 'มั่นหมี่ผัดรสชาติอร่อยถูกปาก',
                'price' => 100.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'ของหวาน')->first()->id,
                'name' => 'ขนมปังปิ้ง',
                'description' => 'ขนมปังปิ้งหวานอร่อย',
                'price' => 25.00,
                'is_available' => true,
            ],
            [
                'category_id' => $categories->where('name', 'ของหวาน')->first()->id,
                'name' => 'ไอศกรีมวนิลา',
                'description' => 'ไอศกรีมวนิลาเนื้อนุ่มละมุน',
                'price' => 55.00,
                'is_available' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
