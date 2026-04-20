# POS — Sistema de Punto de Venta para Restaurantes

Un sistema de Punto de Venta (POS) rápido, moderno y generalizado, diseñado para cualquier tipo de restaurante o negocio de comida. Construido con Vanilla JavaScript, HTML5 y CSS3 puro — sin dependencias externas.

## 🚀 Características

- **Menú Dinámico**: Agrega, edita y elimina productos desde la interfaz. Personaliza nombres y precios.
- **Logo Personalizable**: Sube tu propio logo desde el panel de configuración.
- **Gestión de Pedidos**: Agrega productos con un toque, ajusta cantidades y elimina ítems fácilmente.
- **Pantalla de Cocina** (`/cocina`): Los pedidos cobrados aparecen en tiempo real en una pantalla dedicada para la cocina, con botón "Entregado" para despachar.
- **Control de Gastos** (`/gastos`): Registra y categoriza todos los gastos operativos del negocio (materia prima, nómina, servicios, limpieza, mermas, mantenimiento, etc.).
- **Dashboard de Ventas**: Visualiza ingresos diarios, semanales y número de ventas.
- **Exportación**: Descarga el historial de ventas en CSV o imprime reportes en PDF.
- **Persistencia Local**: Toda la información se guarda en el navegador (`localStorage`).
- **Diseño Responsivo**: Optimizado para tablets y laptops con interfaz dividida.
- **Estética Moderna**: Modo oscuro con acentos ámbar y micro-animaciones suaves.

## 🛠️ Tecnologías

- HTML5 (Estructura Semántica)
- CSS3 (Variables, Flexbox, Grid, Animaciones)
- JavaScript (Lógica de negocio, LocalStorage API)

## 📂 Estructura del Proyecto

```
POS/
├── index.html          # Punto de Venta principal
├── app.js              # Lógica del POS
├── styles.css          # Estilos globales
├── uploads/            # Logo personalizado
├── cocina/
│   └── index.html      # Pantalla de cocina (pedidos pendientes)
└── gastos/
    └── index.html      # Control de gastos operativos
```

## 🖥️ Cómo usar

1. Clona este repositorio o descarga los archivos.
2. Abre `index.html` en cualquier navegador web moderno para el punto de venta.
3. Abre `cocina/index.html` en la tablet o pantalla de cocina para ver los pedidos.
4. Abre `gastos/index.html` para registrar y consultar los gastos del negocio.
5. ¡Empieza a vender!

## 📌 Versión

**v0.1** — Menú dinámico, cocina en tiempo real, reportes básicos y control de gastos.

---
Desarrollado con ❤️ para el sector restaurantero.
