# تشغيل المشروع كخدمة على Windows

## الطريقة الأولى: استخدام PM2 (الأسهل والأكثر شيوعاً)

### 1. تثبيت PM2
```bash
npm install -g pm2
```

### 2. تشغيل الخدمة
```bash
# تشغيل الخدمة
npm run service:start

# أو مباشرة
pm2 start ecosystem.config.js --env production
```

### 3. إدارة الخدمة
```bash
# عرض حالة الخدمة
npm run service:status

# إيقاف الخدمة
npm run service:stop

# إعادة تشغيل الخدمة
npm run service:restart

# عرض السجلات
npm run service:logs

# حفظ الإعدادات
npm run service:save

# تشغيل الخدمة عند بدء Windows
npm run service:startup
```

### 4. استخدام ملفات Batch
```bash
# تشغيل الخدمة
start-service.bat

# إيقاف الخدمة
stop-service.bat
```

## الطريقة الثانية: استخدام Windows Task Scheduler

### 1. تشغيل PowerShell script
```powershell
powershell.exe -ExecutionPolicy Bypass -File "start-service.ps1"
```

### 2. إعداد Task Scheduler
1. افتح Task Scheduler
2. أنشئ Basic Task جديد
3. اختر Trigger: At startup
4. اختر Action: Start a program
5. أدخل: `powershell.exe`
6. أدخل Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\your\project\start-service.ps1"`

## الطريقة الثالثة: استخدام Windows Service (NSSM)

### 1. تثبيت NSSM
- حمل NSSM من: https://nssm.cc/download
- ضعه في مجلد في PATH

### 2. تثبيت الخدمة
```bash
install-windows-service.bat
```

### 3. إدارة الخدمة
```bash
# تشغيل الخدمة
net start AttendanceDashboard

# إيقاف الخدمة
net stop AttendanceDashboard

# إزالة الخدمة
nssm remove AttendanceDashboard confirm
```

## مراقبة الخدمة

### PM2 Dashboard
```bash
pm2 monit
```

### عرض السجلات
```bash
# PM2 logs
pm2 logs attendance-dashboard

# Windows Event Viewer
eventvwr.msc
```

## استكشاف الأخطاء

### 1. فحص حالة الخدمة
```bash
npm run service:status
```

### 2. عرض السجلات
```bash
npm run service:logs
```

### 3. فحص المنفذ
```bash
netstat -ano | findstr :3000
```

### 4. إعادة تشغيل الخدمة
```bash
npm run service:restart
```

## ملاحظات مهمة

1. **تأكد من تثبيت Node.js** على النظام
2. **تأكد من إعداد قاعدة البيانات** بشكل صحيح
3. **تحقق من متغيرات البيئة** (DATABASE_URL, etc.)
4. **افتح المنفذ 3000** في Firewall إذا لزم الأمر
5. **استخدم HTTPS** في الإنتاج

## الوصول للتطبيق

بعد تشغيل الخدمة، يمكن الوصول للتطبيق على:
- http://localhost:3000
- http://your-server-ip:3000 