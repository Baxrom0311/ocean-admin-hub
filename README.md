# ECO COMPANY admin

React + TypeScript + Vite admin panel. Mahsulotlar, kategoriyalar, sertifikatlar, galereya, kontaktlar, Instagram linklari, sozlamalar va adminlarni boshqaradi.

```sh
npm ci
cp .env.example .env
npm run dev
```

Admin `http://localhost:8081` da ochiladi. Backend CORS sozlamasiga shu originni qo‘shing. Production builddan oldin `VITE_API_URL` ni API domeniga sozlang. Faqat `VITE_` bilan boshlangan public qiymatlarni frontendga kiriting; integratsiya kalitlari backendda saqlanadi.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Build typecheck ham bajaradi. `dist/` ni statik hostingga joylang, SPA route lar uchun `index.html` fallback sozlang. Logout akkauntning barcha tokenlarini serverda bekor qiladi va lokal query cache ni tozalaydi.
