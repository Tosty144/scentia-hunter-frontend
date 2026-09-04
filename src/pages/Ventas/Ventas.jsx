import { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/ui/DataTable'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { esenciasApi, ventasApi } from '../../services/api'
import './Ventas.css'

function formatCOP(n) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function Ventas() {
  const [ventas, setVentas] = useState([])
  const [esencias, setEsencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [formError, setFormError] = useState(null)
  const [mensajeOk, setMensajeOk] = useState(null)

  const [esenciaId, setEsenciaId] = useState('')
  const [varianteId, setVarianteId] = useState('')
  const [cantidad, setCantidad] = useState(1)

  function cargar() {
    setLoading(true)
    setError(null)
    Promise.all([ventasApi.listar(), esenciasApi.listar()])
      .then(([v, e]) => {
        setVentas(v)
        setEsencias(e)
        if (e[0]) {
          setEsenciaId(e[0]._id)
          setVarianteId(e[0].variantes[0]?._id || '')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  const esenciaSeleccionada = esencias.find((e) => e._id === esenciaId)
  const varianteSeleccionada = esenciaSeleccionada?.variantes.find((v) => v._id === varianteId)

  const preview = useMemo(() => {
    if (!varianteSeleccionada || !cantidad) return { ingreso: 0, ganancia: 0 }
    const ingreso = varianteSeleccionada.precio * Number(cantidad)
    const costo = varianteSeleccionada.costo * Number(cantidad)
    return { ingreso, ganancia: ingreso - costo }
  }, [varianteSeleccionada, cantidad])

  function handleEsenciaChange(id) {
    setEsenciaId(id)
    const e = esencias.find((x) => x._id === id)
    setVarianteId(e?.variantes[0]?._id || '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setMensajeOk(null)

    if (!varianteSeleccionada) {
      setFormError('Selecciona una esencia y variante válidas.')
      return
    }
    if (Number(cantidad) > varianteSeleccionada.stock) {
      setFormError(`Stock insuficiente. Disponible: ${varianteSeleccionada.stock} unidades.`)
      return
    }

    setEnviando(true)
    try {
      await ventasApi.registrar({ esenciaId, varianteId, cantidad: Number(cantidad) })
      setMensajeOk('Venta registrada correctamente.')
      setCantidad(1)
      cargar()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const ingresoTotal = ventas.reduce((sum, v) => sum + v.ingreso, 0)
  const gananciaTotal = ventas.reduce((sum, v) => sum + v.ganancia, 0)

  return (
    <div className="sh-page">
      <div className="sh-page__header">
        <div>
          <h1 className="sh-page__title">Ventas</h1>
          <p className="sh-page__subtitle">
            Registra una venta y consulta el historial con ingreso y ganancia calculados automáticamente.
          </p>
        </div>
      </div>

      {loading && <Loading label="Cargando ventas…" />}
      {error && <ErrorState message={error} onRetry={cargar} />}

      {!loading && !error && (
        <div className="sh-grid sh-grid--2">
          <div className="sh-card sh-card--sealed sh-panel">
            <div className="sh-panel__head">
              <h2 className="sh-panel__title">Historial de ventas</h2>
              <span className="sh-eyebrow">HU12</span>
            </div>
            <DataTable
              columns={[
                { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.fecha).toLocaleDateString('es-CO') },
                { key: 'nombreProducto', label: 'Producto' },
                { key: 'nombreVariante', label: 'Variante' },
                { key: 'cantidad', label: 'Cant.', align: 'right' },
                { key: 'ingreso', label: 'Ingreso', align: 'right', render: (r) => formatCOP(r.ingreso) },
                { key: 'ganancia', label: 'Ganancia', align: 'right', render: (r) => formatCOP(r.ganancia) },
              ]}
              rows={ventas}
              emptyText="Aún no hay ventas registradas."
            />
            <div className="sh-sales__totals">
              <span>Ingreso total: <strong>{formatCOP(ingresoTotal)}</strong></span>
              <span>Ganancia total: <strong className="sh-sales__gain">{formatCOP(gananciaTotal)}</strong></span>
            </div>
          </div>

          <div className="sh-card sh-card--sealed sh-panel">
            <div className="sh-panel__head">
              <h2 className="sh-panel__title">Registrar venta</h2>
              <span className="sh-eyebrow">HU10 · HU11</span>
            </div>

            {esencias.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--sh-ash)' }}>
                Registra primero una esencia en el catálogo para poder vender.
              </p>
            ) : (
              <form className="sh-sales__form" onSubmit={handleSubmit}>
                <div className="sh-field">
                  <label>Esencia</label>
                  <select className="sh-select" value={esenciaId} onChange={(e) => handleEsenciaChange(e.target.value)}>
                    {esencias.map((e) => (
                      <option key={e._id} value={e._id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="sh-field">
                  <label>Variante</label>
                  <select className="sh-select" value={varianteId} onChange={(e) => setVarianteId(e.target.value)}>
                    {esenciaSeleccionada?.variantes.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.tipo} — {v.presentacion} ({v.stock} und.)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sh-field">
                  <label>Cantidad</label>
                  <input
                    className="sh-input"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>

                <div className="sh-sales__preview">
                  <div>
                    <p className="sh-eyebrow">Ingreso estimado</p>
                    <p className="sh-sales__preview-value">{formatCOP(preview.ingreso)}</p>
                  </div>
                  <div>
                    <p className="sh-eyebrow">Ganancia estimada</p>
                    <p className="sh-sales__preview-value sh-sales__gain">{formatCOP(preview.ganancia)}</p>
                  </div>
                </div>

                {formError && <p className="sh-form-error">{formError}</p>}
                {mensajeOk && <p className="sh-sales__ok">{mensajeOk}</p>}

                <button type="submit" className="sh-btn sh-btn--gold" disabled={enviando} style={{ width: '100%', marginTop: 6 }}>
                  {enviando ? 'Registrando…' : 'Confirmar venta'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Ventas
