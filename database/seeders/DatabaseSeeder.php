<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@fugazii.pos'],
            [
                'name' => 'ผู้ดูแลระบบ',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create manager user
        User::firstOrCreate(
            ['email' => 'manager@fugazii.pos'],
            [
                'name' => 'ผู้จัดการ',
                'password' => Hash::make('manager123'),
                'role' => 'manager',
                'email_verified_at' => now(),
            ]
        );

        // Create cashier user
        User::firstOrCreate(
            ['email' => 'cashier@fugazii.pos'],
            [
                'name' => 'พนักงานแคชเชียร์',
                'password' => Hash::make('cashier123'),
                'role' => 'cashier',
                'email_verified_at' => now(),
            ]
        );

        // Create barista user
        User::firstOrCreate(
            ['email' => 'barista@fugazii.pos'],
            [
                'name' => 'บาริสต้า',
                'password' => Hash::make('barista123'),
                'role' => 'barista',
                'email_verified_at' => now(),
            ]
        );

        // Create test user for development
        User::firstOrCreate(
            ['email' => 'test@fugazii.pos'],
            [
                'name' => 'ผู้ทดสอบระบบ',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Seed categories and products
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        $this->command->info('Users seeded successfully!');
        $this->command->info('Categories and products seeded successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@fugazii.pos / admin123');
        $this->command->info('Manager: manager@fugazii.pos / manager123');
        $this->command->info('Cashier: cashier@fugazii.pos / cashier123');
        $this->command->info('Barista: barista@fugazii.pos / barista123');
        $this->command->info('Test: test@fugazii.pos / password');
    }
}
