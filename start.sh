#!/bin/bash

echo "⚡️ InvoiceApp başlatılıyor..."

# Docker kurulu mu kontrol et
if ! command -v docker &> /dev/null; then
    echo "📦 Docker bulunamadı. Kuruluyor..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install --cask docker
        echo "✅ Docker kuruldu. Docker Desktop'ı açıp tekrar çalıştırın."
        open -a Docker
        exit 0
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
fi

# Docker çalışıyor mu kontrol et
if ! docker info &> /dev/null; then
    echo "⚠️  Docker çalışmıyor. Lütfen Docker Desktop'ı başlatın ve tekrar deneyin."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open -a Docker
    fi
    exit 1
fi

echo "✅ Docker hazır."
echo "🔨 Uygulama derleniyor ve başlatılıyor..."

docker compose down 2>/dev/null
docker compose up --build -d

echo ""
echo "✅ InvoiceApp başarıyla başlatıldı!"
echo ""
echo "🌐 Uygulama: http://localhost:5173"
echo "📡 API:      http://localhost:5238"
echo "📖 Swagger:  http://localhost:5238/swagger"
echo ""
echo "🔑 Giriş bilgileri:"
echo "   Kullanıcı adı: admin"
echo "   Şifre:         admin123"
echo ""