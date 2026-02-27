# InvoiceApp

ASP.NET Core Web API + React ile geliştirilmiş fatura yönetim uygulaması.

## Teknolojiler
- **Backend:** ASP.NET Core 10, Entity Framework Core, SQL Server
- **Frontend:** React + Vite, Bootstrap 5, React Hook Form
- **Veritabanı:** SQL Server 2022

## Kurulum (Docker ile)

### Gereksinimler
- Docker Desktop

### Çalıştırma
- Terminal ile: `docker compose up --build`
- veya
- Windows için: `start.bat`
- Mac için: `start.command`

Uygulama ayağa kalktıktan sonra:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:5238
- **Swagger:** http://localhost:5238/swagger

### Giriş Bilgileri
- Kullanıcı adı: `admin`
- Şifre: `admin123`

## API Endpoints

| Method | URL | Açıklama |
|--------|-----|----------|
| POST | /api/Auth/login | Giriş yap |
| GET | /api/Invoice | Faturaları listele |
| POST | /api/Invoice | Fatura ekle |
| PUT | /api/Invoice | Fatura güncelle |
| DELETE | /api/Invoice | Fatura sil |
| GET | /api/Customer | Müşterileri listele |
| POST | /api/Customer | Müşteri ekle |
| PUT | /api/Customer | Müşteri güncelle |
| DELETE | /api/Customer/{id} | Müşteri sil |