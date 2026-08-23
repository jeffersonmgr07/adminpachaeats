# Pacha Eats — Fase 1

Starter del MVP PWA de marketplace de delivery para Pachacámac/Lima.

## Incluye
- React + Vite + TypeScript.
- Diseño responsive mobile-first con identidad roja Pacha Eats.
- Vistas demo: Cliente, Comercio, Repartidor y Superadmin.
- Navegación por HashRouter compatible con GitHub Pages.
- Manifest PWA + service worker básico.
- Base de Google Apps Script con Setup idempotente y API health-check.

## Ejecutar localmente
```bash
cd frontend
npm install
npm run dev
```

## Generar build
```bash
npm run build
```

El contenido de `frontend/dist/` puede publicarse en GitHub Pages.

## Vistas demo
Usa el selector **Vista demo** de la barra superior.
- Cliente: `#/`
- Comercio: `#/merchant`
- Repartidor: `#/driver`
- Superadmin: `#/admin`

> Esta fase usa datos simulados. No hay autenticación real, pagos, geolocalización ni conexión a Sheets todavía.
