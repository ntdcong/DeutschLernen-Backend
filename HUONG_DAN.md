# Hướng Dẫn Khởi Tạo Database và Chạy Dự Án

## 📋 Yêu Cầu

- Node.js v16+ đã cài đặt
- npm hoặc yarn
- Tài khoản NeonDB (miễn phí) hoặc PostgreSQL local

---

## 🗄️ BƯỚC 1: Tạo Database trên NeonDB

### Option A: Sử dụng NeonDB (Khuyến nghị - Miễn phí)

1. **Truy cập NeonDB:**
   ```
   https://neon.tech
   ```

2. **Đăng ký/Đăng nhập:**
   - Có thể dùng GitHub, Google, hoặc Email

3. **Tạo Project mới:**
   - Click nút **"Create Project"**
   - Chọn **Region**: Singapore hoặc Tokyo (gần Việt Nam nhất)
   - **Project name**: `deutschlerne` (hoặc tên bạn muốn)
   - Click **"Create Project"**

4. **Lấy Connection String:**
   - Sau khi tạo xong, NeonDB sẽ hiển thị connection string
   - Click **"Copy"** để copy connection string
   - Connection string có dạng:
   ```
   postgresql://username:password@ep-cool-morning-12345678.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

5. **Lưu ý quan trọng:**
   - ✅ NeonDB tự động tạo database tên `neondb`
   - ✅ Không cần chạy migration thủ công
   - ✅ Free tier: 0.5GB storage, đủ cho development

### Option B: Sử dụng PostgreSQL Local

Nếu bạn đã cài PostgreSQL trên máy:

```bash
# Tạo database
createdb deutschlerne

# Connection string
postgresql://postgres:your_password@localhost:5432/deutschlerne
```

---

## ⚙️ BƯỚC 2: Cấu Hình File .env

1. **Mở file `.env`** trong thư mục gốc dự án

2. **Cập nhật `DATABASE_URL`:**
   ```env
   # Paste connection string từ NeonDB vào đây
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

3. **File `.env` hoàn chỉnh:**
   ```env
   # Database Configuration (NeonDB)
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

   # JWT Configuration
   JWT_SECRET=my-super-secret-jwt-key-2024
   JWT_EXPIRES_IN=3600
   REFRESH_TOKEN_SECRET=my-super-secret-refresh-token-2024
   REFRESH_TOKEN_EXPIRES_IN=604800

   # Application
   PORT=3000
   NODE_ENV=development
   ```

4. **Lưu file** (Ctrl+S)

---

## 🚀 BƯỚC 3: Chạy Dự Án

### 1. Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### 2. Chạy development server
```bash
npm run start:dev
```

### 3. Kiểm tra server đã chạy
Bạn sẽ thấy output như sau:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] LOG [InstanceLoader] TypeOrmModule dependencies initialized
...
[Nest] LOG [NestApplication] Nest application successfully started
Application is running on: http://localhost:3000/api
```

✅ **Server đã sẵn sàng tại:** `http://localhost:3000/api`

---

## 🧪 BƯỚC 4: Test API

### Test 1: Đăng ký người dùng Admin

**Sử dụng cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\",\"fullName\":\"Admin User\",\"role\":\"admin\"}"
```

**Hoặc sử dụng PowerShell:**
```powershell
$body = @{
    email = "admin@example.com"
    password = "admin123456"
    fullName = "Admin User"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Response mong đợi:**
```json
{
  "statusCode": 200,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "expiresIn": 3600,
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR...",
    "tokenType": "Bearer",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "admin"
    }
  }
}
```

### Test 2: Đăng nhập

```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"admin123456\"}"
```

### Test 3: Lấy danh sách người dùng (cần token)

```bash
# Thay YOUR_ACCESS_TOKEN bằng token từ response đăng nhập
curl -X GET http://localhost:3000/api/users ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Kiểm Tra Database

### Cách 1: Sử dụng NeonDB Console

1. Vào https://console.neon.tech
2. Chọn project của bạn
3. Click tab **"SQL Editor"**
4. Chạy query:
   ```sql
   SELECT * FROM users;
   ```

### Cách 2: Sử dụng TablePlus/DBeaver

1. Tải TablePlus: https://tableplus.com
2. Tạo connection mới với connection string từ NeonDB
3. Xem bảng `users` đã được tạo tự động

---

## 🔧 Các Lệnh Hữu Ích

```bash
# Chạy development server (hot reload)
npm run start:dev

# Chạy production build
npm run build
npm run start:prod

# Chạy debug mode
npm run start:debug

# Kiểm tra lỗi code
npm run lint
```

---

## ❓ Xử Lý Lỗi Thường Gặp

### Lỗi: "Connection refused" hoặc "ECONNREFUSED"
**Nguyên nhân:** Connection string sai hoặc NeonDB chưa kích hoạt
**Giải pháp:**
- Kiểm tra lại connection string trong `.env`
- Đảm bảo đã copy đúng từ NeonDB console
- Kiểm tra internet connection

### Lỗi: "relation 'users' does not exist"
**Nguyên nhân:** Database chưa được sync
**Giải pháp:**
- Restart server (Ctrl+C rồi `npm run start:dev` lại)
- TypeORM sẽ tự động tạo bảng khi `synchronize: true`

### Lỗi: "JWT secret is not defined"
**Nguyên nhân:** File `.env` chưa được load
**Giải pháp:**
- Kiểm tra file `.env` có trong thư mục gốc
- Restart server

---

## 📝 Ghi Chú

- ✅ Database tables sẽ được tạo **tự động** khi chạy server lần đầu
- ✅ Không cần chạy migration thủ công
- ✅ Mật khẩu được hash tự động bằng bcrypt
- ✅ JWT tokens có thời hạn: Access token 1h, Refresh token 7 ngày

---

## 🎯 Tóm Tắt Nhanh

1. Tạo project trên https://neon.tech
2. Copy connection string
3. Paste vào file `.env`
4. Chạy `npm run start:dev`
5. Test API bằng cURL hoặc Postman

**Xong! 🎉**
