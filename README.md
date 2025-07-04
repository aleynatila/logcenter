# LogCenter – Remote Nginx Access Log Viewer

**LogCenter**, çok sayıda Linux sunucuda çaWeb arayüzü: `http://sunucu-ip:5000`

## Deployment (Production)

### 1. Systemd Service Oluşturma

```bash
sudo nano /etc/systemd/system/logcenter.service
```

```ini
[Unit]
Description=LogCenter - Nginx Log Viewer
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/logcenter/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Service'i Etkinleştirme

```bash
sudo systemctl daemon-reload
sudo systemctl enable logcenter
sudo systemctl start logcenter
sudo systemctl status logcenter
```

### 3. Nginx Reverse Proxy (Opsiyonel)

```bash
sudo nano /etc/nginx/sites-available/logcenter
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/logcenter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Sertifikası (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 5. Firewall Ayarları

```bash
sudo ufw allow 5000/tcp  # LogCenter portu
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

### 6. Otomatik Güncellemeler

```bash
# Update script oluştur
nano /root/update-logcenter.sh
```

```bash
#!/bin/bash
cd /root/logcenter

# Yedek al
tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" backend/hosts.json

# Güncellemeleri çek
git pull origin main

# Frontend'i yeniden build et
cd frontend
npm install
npm run build

# Backend'e kopyal
cd ..
cp -r frontend/dist/* backend/public/

# Backend bağımlılıklarını güncelle
cd backend
npm install

# Service'i yeniden başlat
sudo systemctl restart logcenter

echo "LogCenter güncellendi!"
```

```bash
chmod +x /root/update-logcenter.sh
```ışan NGINX `access.log` dosyasını anlık olarak izleyebileceğiniz ve filtreleyebileceğiniz bir web arayüzüdür.  
SSH anahtarıyla parolasız bağlantı kurarak, her sunucuda `tail -f` ve `grep` gibi işlemleri hızlıca yapmanızı sağlar.

## Özellikler

- SSH üzerinden şifresiz bağlantı (RSA key ile)
- `tail -f` ile canlı log takibi
- Tek tıkla `grep apk`, `grep manifest` gibi filtreler
- Web arayüzü (React + xterm.js terminal emülatörü)
- Çoklu sunucu desteği (hosts.json ile)
- **Per-host Sync/Reboot** - Seçili cihaz için sync ve reboot
- **Sync All** - Tüm cihazlar için sync işlemi
- UDP Broadcast ile cihaz yönetimi
- Renkli log görünümü
- Responsive tasarım

## Kurulum

### 1. Gereksinimler

| Ana Sunucu (Control Panel) | Uzak Hostlar        |
|----------------------------|---------------------|
| Ubuntu/Debian, Node.js ≥ 20 | Linux + SSH (RSA key eklenmiş) |
| Git, curl, socat          | `/var/log/nginx/access.log` mevcut olmalı |

### 2. Ana Sunucuya Kurulum

```bash
# Node kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git socat

# Proje klonlama
git clone <repository-url>
cd logcenter

# Backend bağımlılıkları
cd backend
npm install

# Frontend bağımlılıkları ve build
cd ../frontend
npm install
npm run build

# Frontend'i backend'e kopyala
cd ..
cp -r frontend/dist/* backend/public/
```

### 3. Yapılandırma

`backend/hosts.json` dosyasını düzenleyin:

```json
[
  { 
    "id": "server-1",
    "name": "sunucu1", 
    "host": "192.168.1.100",
    "broadcast": "192.168.1.255"
  },
  { 
    "id": "server-2",
    "name": "sunucu2", 
    "host": "192.168.1.101",
    "broadcast": "192.168.1.255"
  }
]
```

> **Not:** Her host için benzersiz `id` gereklidir.

### 4. SSH Anahtarı Kurulumu

```bash
# RSA anahtarı oluştur (zaten varsa atla)
ssh-keygen -t rsa -b 4096

# Uzak sunuculara kopyala
ssh-copy-id root@192.168.1.100
ssh-copy-id root@192.168.1.101
```

### 5. Çalıştırma

```bash
cd backend
npm start
```

Web arayüzü: `http://sunucu-ip:5000`

## Kullanım

1. **Sol sidebar'dan** sunucu seçin
2. **Nginx Logs** - Canlı log takibi
3. **grep apk** - APK isteklerini filtrele
4. **grep manifest** - Manifest isteklerini filtrele
5. **Sync All** - Tüm sunuculara sync komutu gönder
6. **Reboot All** - Tüm sunucuları yeniden başlat

## Teknolojiler

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **WebSocket (ws)** - Gerçek zamanlı iletişim
- **SSH2** - SSH bağlantıları
- **socat** - UDP broadcast

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **xterm.js** - Terminal emülatörü
- **Vanilla CSS** - Styling

## Proje Yapısı

```
logcenter/
├── backend/
│   ├── server.js          # Ana server dosyası
│   ├── hosts.json         # Sunucu listesi
│   ├── package.json       # Backend bağımlılıkları
│   └── public/            # Frontend build dosyaları
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Ana React bileşeni
│   │   ├── TailPane.jsx   # Terminal bileşeni
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # CSS stilleri
│   ├── package.json       # Frontend bağımlılıkları
│   └── vite.config.js     # Vite yapılandırması
└── README.md
```

## API Endpoints

- `GET /hosts` - Sunucu listesi
- `POST /sync/:hostId` - Belirtilen cihaza sync gönder
- `POST /reboot/:hostId` - Belirtilen cihazı yeniden başlat
- `POST /sync-all` - Tüm cihazlara sync gönder
- `WebSocket :5000` - Terminal bağlantısı

## Kullanım

1. **Sol sidebar'dan** sunucu seçin
2. **Nginx Logs** - Canlı log takibi
3. **grep apk** - APK isteklerini filtrele
4. **grep manifest** - Manifest isteklerini filtrele

### Buton İşlevleri

- **Sync** - Seçili cihaz için sync komutu
- **Reboot** - Seçili cihazı yeniden başlat (onay gerektirir)
- **Sync All** - Tüm cihazlara sync komutu gönder

## UDP Broadcast Komutları

### Per-Host Sync
```bash
echo -n '{"key":"sync"}' | socat -d -v - UDP-DATAGRAM:broadcast-ip:4000,broadcast
```

### Per-Host Reboot
```bash
echo -n '{"key":"reboot"}' | socat -d -v - UDP-DATAGRAM:broadcast-ip:4000,broadcast
```

### Sync All
```bash
# Tüm cihazlarda aynı broadcast IP kullanılarak
echo -n '{"key":"sync"}' | socat -d -v - UDP-DATAGRAM:broadcast-ip:4000,broadcast
```

## Troubleshooting

### Service Logları
```bash
sudo journalctl -u logcenter -f
```

### Manuel Test
```bash
# Backend test
cd /root/logcenter/backend
node server.js

# Endpoint test
curl http://localhost:5000/hosts
```

### Port Kontrolü
```bash
sudo netstat -tulpn | grep :5000
```

## Lisans

MIT License
