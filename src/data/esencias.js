// Datos de muestra (mock) — se reemplazará por datos reales cuando exista el backend.
// Estructura basada en HU01–HU05: esencia → variantes (tipo + presentación)

const esencias = [
  {
    id: 'e1',
    nombre: 'Dior Sauvage',
    familia: 'Amaderada / Fresca',
    probador: true,
    variantes: [
      { id: 'v1', tipo: 'Genérico', presentacion: '30ml', costo: 18000, precio: 35000, stock: 12 },
      { id: 'v2', tipo: 'Genérico', presentacion: '100ml', costo: 42000, precio: 75000, stock: 6 },
      { id: 'v3', tipo: 'Triple A', presentacion: '100ml', costo: 65000, precio: 110000, stock: 2 },
      { id: 'v4', tipo: 'Original', presentacion: '100ml', costo: 210000, precio: 320000, stock: 1 },
    ],
  },
  {
    id: 'e2',
    nombre: 'Carolina Herrera 212 VIP',
    familia: 'Floral / Especiada',
    probador: true,
    variantes: [
      { id: 'v5', tipo: 'Genérico', presentacion: '30ml', costo: 16000, precio: 32000, stock: 9 },
      { id: 'v6', tipo: 'Genérico', presentacion: '100ml', costo: 39000, precio: 70000, stock: 3 },
    ],
  },
  {
    id: 'e3',
    nombre: 'Bleu de Chanel',
    familia: 'Cítrica / Amaderada',
    probador: false,
    variantes: [
      { id: 'v7', tipo: 'Genérico', presentacion: '30ml', costo: 19000, precio: 36000, stock: 0 },
      { id: 'v8', tipo: 'Triple A', presentacion: '100ml', costo: 68000, precio: 115000, stock: 4 },
    ],
  },
  {
    id: 'e4',
    nombre: 'Good Girl — Carolina Herrera',
    familia: 'Floral / Dulce',
    probador: true,
    variantes: [
      { id: 'v9', tipo: 'Genérico', presentacion: '30ml', costo: 17000, precio: 34000, stock: 14 },
      { id: 'v10', tipo: 'Original', presentacion: '80ml', costo: 230000, precio: 340000, stock: 1 },
    ],
  },
  {
    id: 'e5',
    nombre: 'Invictus — Paco Rabanne',
    familia: 'Acuática / Amaderada',
    probador: false,
    variantes: [
      { id: 'v11', tipo: 'Genérico', presentacion: '100ml', costo: 40000, precio: 72000, stock: 5 },
    ],
  },
]

export default esencias

// Umbral de bajo stock, usado para HU08
export const UMBRAL_BAJO_STOCK = 3
