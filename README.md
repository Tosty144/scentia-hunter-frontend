# React + Vite App

Plantilla base para un proyecto de React usando Vite.

## Instalación

```bash
npm install
```

## Scripts disponibles

- `npm run dev` — inicia el servidor de desarrollo con recarga en caliente.
- `npm run build` — genera la versión de producción en la carpeta `dist/`.
- `npm run preview` — sirve localmente el build de producción.
- `npm run lint` — ejecuta ESLint sobre el proyecto.

## Estructura

```
react-vite-app/
├── public/              # Archivos estáticos servidos tal cual
│   └── vite.svg
├── src/
│   ├── assets/          # Imágenes, fuentes, etc. procesados por Vite
│   ├── components/      # Componentes reutilizables
│   ├── App.jsx          # Componente raíz
│   ├── App.css
│   ├── main.jsx         # Punto de entrada de React
│   └── index.css        # Estilos globales
├── index.html           # HTML raíz que Vite usa como entrada
├── vite.config.js        # Configuración de Vite
├── package.json
├── .eslintrc.cjs
└── .gitignore
```
