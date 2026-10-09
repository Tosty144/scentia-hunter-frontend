import { useEffect, useState } from 'react'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { analisisApi } from '../../services/api'

function formatCOP(n) {
  return Number(n || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  function cargar() {
    setLoading(true)
    setError(null)
    analisisApi
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="sh-page">
      <div className="sh-page__header">
        <div>
          <h1 className="sh-page__title">Vista general del negocio</h1>
          <p className="sh-page__subtitle">
            Inventario, inversión, ventas y ganancias de Scentia Hunter en un solo lugar.
          </p>
        </div>
      </div>

      {loading && <Loading label="Cargando indicadores…" />}
      {error && <ErrorState message={error} onRetry={cargar} />}

      {data && (
        <>
          <div className="sh-grid sh-grid--stats">
            <StatCard label="Inventario disponible" value={data.inventarioDisponible} suffix="unidades" />
            <StatCard label="Inversión total" value={formatCOP(data.inversionTotal)} />
            <StatCard
              label="Ingresos"
              value={formatCOP(data.ingresoTotal)}
              deltaTone="up"
              delta={`${data.totalVentas} ventas registradas`}
            />
            <StatCard
              label="Ganancia"
              value={formatCOP(data.gananciaTotal)}
              deltaTone="up"
              delta={
                data.ingresoTotal
                  ? `Margen ${Math.round((data.gananciaTotal / data.ingresoTotal) * 100)}%`
                  : 'Sin ventas aún'
              }
            />
          </div>

          <div className="sh-grid sh-grid--2" style={{ marginTop: 18 }}>
            <div className="sh-card sh-card--sealed sh-panel">
              <div className="sh-panel__head">
                <h2 className="sh-panel__title">Productos más vendidos</h2>
                <span className="sh-eyebrow">HU16</span>
              </div>
              <DataTable
                columns={[
                  { key: 'producto', label: 'Producto' },
                  { key: 'variante', label: 'Variante' },
                  { key: 'cantidad', label: 'Unidades', align: 'right' },
                  { key: 'ganancia', label: 'Ganancia', align: 'right', render: (r) => formatCOP(r.ganancia) },
                ]}
                rows={data.masVendidos}
                emptyText="Aún no hay ventas registradas."
              />
            </div>

            <div className="sh-card sh-card--sealed sh-panel">
              <div className="sh-panel__head">
                <h2 className="sh-panel__title">Alerta de bajo stock</h2>
                <span className="sh-eyebrow">HU08</span>
              </div>
              <DataTable
                columns={[
                  { key: 'esencia', label: 'Esencia' },
                  { key: 'presentacion', label: 'Variante', render: (r) => `${r.tipo} · ${r.presentacion}` },
                  {
                    key: 'stock',
                    label: 'Stock',
                    align: 'right',
                    render: (r) => (
                      <Badge tone={r.stock === 0 ? 'danger' : 'gold'}>
                        {r.stock === 0 ? 'Agotado' : `${r.stock} und.`}
                      </Badge>
                    ),
                  },
                ]}
                rows={data.bajoStock}
                emptyText="Ningún producto está por debajo del umbral de stock."
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
