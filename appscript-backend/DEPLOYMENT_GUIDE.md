# Guía de despliegue Apps Script

1. Crear un Google Sheet llamado `PachaEats_DB`.
2. Abrir Extensiones > Apps Script.
3. Crear archivos `Code.gs`, `Schema.gs` y `Seed.gs`.
4. Copiar el contenido de esta carpeta.
5. Ejecutar `setupDatabase()` una vez.
6. Ejecutar `seedDemoData()` opcionalmente.
7. Ir a Implementar > Nueva implementación > Aplicación web.
8. Ejecutar como: `Yo`.
9. Acceso: según pruebas, `Cualquier usuario` o `Cualquier usuario con el enlace`.
10. Copiar la URL del Web App.
11. Pegar esa URL en `assets/js/api-appscript.js`, constante `APP_SCRIPT_URL`.

## Recomendación de seguridad

Para pruebas puedes permitir acceso público al Web App, pero valida siempre tokens, roles y estados desde Apps Script. No confíes en datos enviados por el navegador.
