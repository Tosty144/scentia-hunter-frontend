// Mismo formato que usan las páginas. Testing Library convierte el espacio especial
// de la moneda en un espacio normal, por eso se hace lo mismo aquí.
export const cop = (n) =>
  Number(n)
    .toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
    .replace(/\s/g, ' ')

export const fecha = (iso) => new Date(iso).toLocaleDateString('es-CO')
