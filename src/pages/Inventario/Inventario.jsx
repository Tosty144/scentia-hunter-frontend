import { useEffect, useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { esenciasApi, inventarioApi } from '../../services/api'

function formatCOP(n) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function MovimientoForm({ tipo, esencias, onClose, onSaved }) {
  const [esenciaId, setEsenciaId] = useState(esencias[0]?._id || '')
  const [varianteId, setVarianteId] = useState(esencias[0]?.variantes[0]?._id || '')
  const [cantidad, setCantidad] = useState(1)
  const [motivo, setMotivo] = useState(tipo === 'entrada' ? 'Compra a proveedor' : 'Pérdida o daño')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const esencia = esencias.find((e) => e._id === esenciaId)

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const payload = { esenciaId, varianteId, cantidad: Number(cantidad), motivo }
      if (tipo === 'entrada') await inventarioApi.registrarEntrada(payload)
      else await inventarioApi.registrarSalida(payload)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className="sh-card sh-card--sealed sh-panel sh-essence-form" onSubmit={handleSubmit}>
      <div className="sh-panel__head">
        <h2 className="sh-panel__title">{tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}</h2>
        <span className="sh-eyebrow">{tipo === 'entrada' ? 'HU06' : 'HU07'}</span>
      </div>
      <div className="sh-essence-form__row">
        <div className="sh-field">
          <label>Esencia</label>
          <select className="sh-select" value={esenciaId} onChange={(e) => {
            setEsenciaId(e.target.value)
            const found = esencias.find((x) => x._id === e.target.value)
            setVarianteId(found?.variantes[0]?._id || '')
          }}>
            {esencias.map((e) => <option key={e._id} value={e._id}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="sh-field">
          <label>Variante</label>
          <select className="sh-select" value={varianteId} onChange={(e) => setVarianteId(e.target.value)}>
            {esencia?.variantes.map((v) => (
              <option key={v._id} value={v._id}>{v.tipo} — {v.presentacion} ({v.stock} und.)</option>
            ))}
          </select>
        </div>
        <div className="sh-field">
          <label>Cantidad</label>
          <input className="sh-input" type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
        </div>
      </div>
      <div className="sh-field" style={{ marginTop: 14 }}>
        <label>Motivo</label>
        <input className="sh-input" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      {error && <p className="sh-form-error">{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button type="submit" className="sh-btn sh-btn--gold" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Confirmar'}
        </button>
        <button type="button" className="sh-btn sh-btn--ghost" onClick={onClose}>Cancelar</button>
      </div>
    </form>
  )
}

function Inventario() {
  const [esencias, setEsencias] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formTipo, setFormTipo] = useState(null) // 'entrada' | 'salida' | null

  function cargar() {
    setLoading(true)
    setError(null)
    Promise.all([esenciasApi.listar(), inventarioApi.movimientos(), inventarioApi.inversion(), inventarioApi.bajoStock()])
      .then(([e, m, inv, bajo]) => {
        setEsencias(e)
        setMovimientos(m)
        setResumen({ ...inv, enBajoStock: bajo.alertas.length })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  function handleSaved() {
    setFormTipo(null)
    cargar()
  }

  return (
    <div className="sh-page">
      <div className="sh-page__header">
        <div>
          <h1 className="sh-page__title">Inventario</h1>
          <p className="sh-page__subtitle">Entradas, salidas e inversión total del stock disponible.</p>
        </div>
        <div className="sh-inv__actions">
          <button className="sh-btn sh-btn--ghost" onClick={() => setFormTipo(formTipo === 'salida' ? null : 'salida')}>
            ↓ Registrar salida
          </button>
          <button className="sh-btn sh-btn--gold" onClick={() => setFormTipo(formTipo === 'entrada' ? null : 'entrada')}>
            ↑ Registrar entrada
          </button>
        </div>
      </div>

      {loading && <Loading label="Cargando inventario…" />}
      {error && <ErrorState message={error} onRetry={cargar} />}

      {!loading && !error && (
        <>
          {formTipo && esencias.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <MovimientoForm tipo={formTipo} esencias={esencias} onClose={() => setFormTipo(null)} onSaved={handleSaved} />
            </div>
          )}

          <div className="sh-grid sh-grid--stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <StatCard label="Unidades en stock" value={resumen?.unidadesTotales ?? 0} />
            <StatCard label="Inversión total" value={formatCOP(resumen?.inversionTotal ?? 0)} />
            <StatCard
              label="Variantes en bajo stock"
              value={resumen?.enBajoStock ?? 0}
              deltaTone={resumen?.enBajoStock ? 'down' : 'up'}
              delta={resumen?.enBajoStock ? 'Revisar reposición' : 'Todo en orden'}
            />
          </div>

          <div className="sh-card sh-card--sealed sh-panel" style={{ marginTop: 18 }}>
            <div className="sh-panel__head">
              <h2 className="sh-panel__title">Movimientos recientes</h2>
              <span className="sh-eyebrow">HU06 · HU07</span>
            </div>
            <DataTable
              columns={[
                { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.fecha).toLocaleDateString('es-CO') },
                {
                  key: 'tipo', label: 'Tipo',
                  render: (r) => <Badge tone={r.tipo === 'entrada' ? 'success' : 'danger'}>{r.tipo === 'entrada' ? 'Entrada' : 'Salida'}</Badge>,
                },
                { key: 'nombreProducto', label: 'Producto' },
                { key: 'nombreVariante', label: 'Variante' },
                { key: 'cantidad', label: 'Cantidad', align: 'right' },
                { key: 'motivo', label: 'Motivo' },
              ]}
              rows={movimientos}
              emptyText="Aún no hay movimientos registrados."
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Inventario
