# Fugazii POS - ระบบขายหน้าร้านสำหรับร้านเครื่องดื่มชากาแฟ

โปรเจคนี้เป็นระบบ POS (Point of Sale) ที่พัฒนาด้วย Laravel (Backend) และ React (Frontend) สำหรับร้านเครื่องดื่มชากาแฟ

## โครงสร้างโปรเจค

### Backend (Laravel)
- **Framework**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful API

### Frontend (React)
- **Framework**: React 18
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios

## ฟีเจอร์หลัก

### 1. จัดการสินค้าและสูตรเครื่องดื่ม
- จัดการหมวดหมู่สินค้า
- เพิ่ม/แก้ไข/ลบสินค้า
- จัดการสูตรเครื่องดื่ม (วัตถุดิบที่ใช้)
- ตรวจสอบสต็อกวัตถุดิบสำหรับทำเครื่องดื่ม

### 2. จัดการสต็อกวัตถุดิบ
- จัดการข้อมูลวัตถุดิบ
- ติดตามปริมาณสต็อกคงเหลือ
- แจ้งเตือนเมื่อสต็อกใกล้หมด
- บันทึกประวัติการเคลื่อนไหวของสต็อก

### 3. จัดการสั่งซื้อ (POS และ Pre-order)
- สร้างออเดอร์ใหม่
- เลือกสินค้าและจำนวน
- คำนวณราคาและภาษี
- จัดการโปรโมชั่น
- ชำระเงินหลายรูปแบบ

### 4. จัดการชำระเงิน
- รองรับการชำระเงินหลายรูปแบบ (เงินสด, บัตรเครดิต, Mobile Banking, Wallet)
- คำนวณเงินทอน
- บันทึกประวัติการชำระเงิน

### 5. จัดการสมาชิกและสะสมแต้ม
- ลงทะเบียนสมาชิก
- สะสมแต้มจากการซื้อสินค้า
- แลกรับของรางวัลด้วยแต้ม
- จัดการระดับสมาชิก (Bronze, Silver, Gold, Platinum)

### 6. จัดการโปรโมชั่น
- สร้างโปรโมชั่นหลายประเภท (ส่วนลด %, ส่วนลดตามจำนวนเงิน, Buy 1 Get 1, ฯลฯ)
- กำหนดระยะเวลาโปรโมชั่น
- จำกัดจำนวนการใช้งาน

### 7. จัดการรายงาน
- รายงานยอดขายรายวัน/เดือน/ปี
- รายงานสินค้าขายดี
- รายงานสต็อกวัตถุดิบ
- รายงานลูกค้า
- กราฟและแผนภูมิแสดงข้อมูล

## โครงสร้างฐานข้อมูล

### ตารางหลัก
- `users` - ข้อมูลผู้ใช้งานระบบ
- `categories` - หมวดหมู่สินค้า
- `products` - ข้อมูลสินค้า
- `ingredients` - วัตถุดิบ
- `product_recipes` - สูตรเครื่องดื่ม
- `customers` - ข้อมูลลูกค้า
- `orders` - ข้อมูลออเดอร์
- `order_items` - รายการสินค้าในออเดอร์
- `promotions` - โปรโมชั่น
- `order_promotions` - โปรโมชั่นที่ใช้ในออเดอร์
- `stock_transactions` - ประวัติสต็อกวัตถุดิบ

## API Endpoints

### Public Routes (ไม่ต้อง Authentication)
- `GET /api/categories/active` - ดึงข้อมูลหมวดหมู่ที่ใช้งานอยู่
- `GET /api/products/active` - ดึงข้อมูลสินค้าที่ขายอยู่
- `GET /api/promotions/active` - ดึงข้อมูลโปรโมชั่นที่ใช้งานอยู่

### Authenticated Routes (ต้อง Authentication)
- **Categories**: `GET/POST/PUT/DELETE /api/categories`
- **Products**: `GET/POST/PUT/DELETE /api/products`
  - `GET /api/products/{id}/recipe` - ดูสูตรสินค้า
  - `PUT /api/products/{id}/recipe` - อัปเดตสูตรสินค้า
  - `GET /api/products/{id}/availability` - ตรวจสอบว่ามีวัตถุดิบพอหรือไม่
- **Orders**: `GET/POST/PUT/DELETE /api/orders`
  - `POST /api/orders/{id}/payment` - ชำระเงินออเดอร์
  - `POST /api/orders/{id}/cancel` - ยกเลิกออเดอร์
  - `GET /api/orders/statistics` - สถิติออเดอร์
- **Customers**: `GET/POST/PUT/DELETE /api/customers`
  - `POST /api/customers/{id}/points/add` - เพิ่มแต้ม
  - `POST /api/customers/{id}/points/redeem` - ใช้แต้ม
  - `GET /api/customers/{id}/statistics` - สถิติลูกค้า
  - `GET /api/customers/{id}/orders` - ประวัติการสั่งซื้อ
  - `PUT /api/customers/{id}/tier` - อัปเกรดระดับสมาชิก
- **Promotions**: `GET/POST/PUT/DELETE /api/promotions`
  - `POST /api/promotions/apply` - ใช้โปรโมชั่น
  - `POST /api/promotions/remove` - ยกเลิกโปรโมชั่น
- **Ingredients**: `GET/POST/PUT/DELETE /api/ingredients`
  - `GET /api/ingredients/{id}/stock` - ดูข้อมูลสต็อก
  - `PUT /api/ingredients/{id}/stock` - อัปเดตสต็อก
- **Stock Transactions**: `GET/POST/PUT/DELETE /api/stock-transactions`
  - `GET /api/stock-transactions/summary` - สรุปสต็อกทั้งหมด
- **Dashboard**:
  - `GET /api/dashboard/overview` - ภาพรวมระบบ
  - `GET /api/dashboard/sales` - ข้อมูลยอดขาย
  - `GET /api/dashboard/inventory` - ข้อมูลสต็อก
  - `GET /api/dashboard/customers` - ข้อมูลลูกค้า
  - `GET /api/dashboard/orders` - ข้อมูลออเดอร์

## การติดตั้งและใช้งาน

### 1. ติดตั้ง Backend
```bash
# Clone repository
git clone <repository-url>
cd fugazii_pos

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fugazii_pos
DB_USERNAME=root
DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start development server
php artisan serve
```

### 2. ติดตั้ง Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## การใช้งานระบบ

1. เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ
2. ตั้งค่าข้อมูลพื้นฐาน:
   - หมวดหมู่สินค้า
   - วัตถุดิบ
   - สินค้าและสูตร
   - โปรโมชั่น
3. เริ่มใช้งานระบบ POS:
   - สร้างออเดอร์ใหม่
   - เลือกสินค้า
   - คำนวณราคา
   - ชำระเงิน
4. ตรวจสอบรายงานและสถิติ

## บทบาทผู้ใช้ (User Roles)

- **Admin**: มีสิทธิ์ทุกฟังก์ชันในระบบ
- **Manager**: จัดการสินค้า, ออเดอร์, ลูกค้า, รายงาน
- **Cashier**: สร้างออเดอร์, ชำระเงิน, จัดการลูกค้า
- **Staff**: ดูข้อมูลสินค้า, สร้างออเดอร์

## การปรับแต่ง

- ปรับแต่งธีมและสีสันในไฟล์ `resources/css/app.css`
- แก้ไขโลโก้และข้อมูลร้านในไฟล์ `resources/views/app.blade.php`
- ปรับแต่งฟีเจอร์เพิ่มเติมตามความต้องการ

## ใบอนุญาต

โปรเจคนี้ใช้ใบอนุญาต MIT License

## ติดต่อ

สำหรับข้อมูลเพิ่มเติม กรุณาติดต่อ:
- Email: info@fugazii.com
- Website: www.fugazii.com
