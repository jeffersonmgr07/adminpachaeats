# Ficha técnica — Pacha Eats

## Arquitectura inicial
- Frontend: React + TypeScript + Vite.
- Hosting previsto: GitHub Pages.
- Routing: HashRouter para evitar errores 404 en Pages.
- Backend MVP: Google Apps Script Web App.
- Datos MVP: Google Sheets.
- Identidad futura: Firebase Authentication.

## Estado de la Fase 1
La interfaz usa datos mock. Las vistas sirven para validar navegación, identidad visual y jerarquía de información antes de conectar servicios reales.

## Módulos representados
1. Customer marketplace.
2. Merchant operations.
3. Driver operations.
4. Superadmin operations.

## Próxima etapa técnica
- Crear Sheets con Setup.gs.
- Conectar frontend al endpoint de Apps Script.
- Implementar sesión demo y RBAC inicial.
- Sustituir mock data por repositorios/API.
