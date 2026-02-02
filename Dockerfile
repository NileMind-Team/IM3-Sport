# مرحلة البناء (Build Stage)
FROM node:20-alpine AS build
WORKDIR /app

# نسخ ملفات package.json و package-lock.json فقط لتسريع عملية تثبيت الباكجات
COPY package.json package-lock.json ./

# تثبيت الباكجات
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# بناء المشروع للإنتاج
RUN npm run build

# مرحلة التشغيل (Run Stage)
FROM nginx:alpine
# نسخ ملفات البناء (build) إلى مجلد nginx الافتراضي
COPY --from=build /app/build /usr/share/nginx/html

# فتح البورت 80
EXPOSE 80

# تشغيل nginx في foreground
CMD ["nginx", "-g", "daemon off;"]
