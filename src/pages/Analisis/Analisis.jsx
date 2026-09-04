import { useEffect, useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { analisisApi } from '../../services/api'

function formatCOP(n) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function Analisis() {
  const [ranking, setRanking] = useState([])
  const [rentabilidad, setRentabilidad] = useState([])
  const [sinMovimiento, setSinMovimiento] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function cargar() {
    setLoading(true)
    setError(null)
    Promise.all([analisisApi.ranking(), analisisApi.rentabilidad(), analisisApi.sinMovimiento()])
      .then(([r, rent, sin]) => {
        setRanking(r)
        setRentabilidad(rent)
        setSinMovimiento(sin)
      })
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
          <h1 className="sh-page__title">Análisis de ventas</h1>
          <p className="sh-page__subtitle">
            Rotación de productos, rentabilidad y productos sin movimiento en el periodo.
          </p>
        </div>
      </div>

      {loading && <Loading label="Calculando estadísticas…" />}
      {error && <ErrorState message={error} onRetry={cargar} />}

      {!loading && !error && (
        <>
          <div className="sh-grid sh-grid--2">
            <div className="sh-card sh-card--sealed sh-panel">
              <div className="sh-panel__head">
                <h2 className="sh-panel__title">Ranking por unidades vendidas</h2>
                <span className="sh-eyebrow">HU16</span>
              </div>
              <DataTable
                columns={[
                  { key: 'nombreProducto', label: 'Producto' },
                  { key: 'nombreVariante', label: 'Variante' },
                  { key: 'cantidad', label: 'Unidades', align: 'right' },
                ]}
                rows={ranking}
                emptyText="Aún no hay ventas registradas."
              />
            </div>

            <div className="sh-card sh-card--sealed sh-panel">
              <div className="sh-panel__head">
                <h2 className="sh-panel__title">Rentabilidad por producto</h2>
                <span className="sh-eyebrow">HU18</span>
              </div>
              <DataTable
                columns={[
                  { key: 'producto', label: 'Producto' },
                  { key: 'variante', label: 'Variante' },
                  { key: 'ganancia', label: 'Ganancia', align: 'right', render: (r) => formatCOP(r.ganancia) },
                ]}
                rows={rentabilidad}
                emptyText="Aún no hay ventas registradas."
              />
            </div>
          </div>

          <div className="sh-card sh-card--sealed sh-panel" style={{ marginTop: 18 }}>
            <div className="sh-panel__head">
              <h2 className="sh-panel__title">Esencias sin movimiento en el periodo</h2>
              <span className="sh-eyebrow">HU17</span>
            </div>
            <DataTable
              columns={[
                { key: 'nombre', label: 'Esencia' },
                { key: 'familia', label: 'Familia olfativa' },
                { key: 'estado', label: 'Estado', align: 'right', render: () => <Badge tone="danger">Sin ventas registradas</Badge> },
              ]}
              rows={sinMovimiento}
              emptyText="Todas las esencias tuvieron ventas en el periodo seleccionado."
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Analisis
