import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { esenciasApi } from '../../services/api'
import './Esencias.css'

const UMBRAL_BAJO_STOCK = 3

function formatCOP(n) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

const VARIANTE_VACIA = { tipo: 'Genérico', presentacion: '', costo: '', precio: '', stock: '' }

function Esencias() {
  const [esencias, setEsencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [abierta, setAbierta] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({ nombre: '', familia: '', probador: false, variantes: [{ ...VARIANTE_VACIA }] })

  function cargar() {
    setLoading(true)
    setError(null)
    esenciasApi
      .listar()
      .then((data) => {
        setEsencias(data)
        if (data[0]) setAbierta(data[0]._id)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar()
  }, [])

  function actualizarVariante(i, campo, valor) {
    setForm((f) => {
      const variantes = [...f.variantes]
      variantes[i] = { ...variantes[i], [campo]: valor }
      return { ...f, variantes }
    })
  }

  function agregarFilaVariante() {
    setForm((f) => ({ ...f, variantes: [...f.variantes, { ...VARIANTE_VACIA }] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      const payload = {
        nombre: form.nombre,
        familia: form.familia,
        probador: form.probador,
        variantes: form.variantes
          .filter((v) => v.presentacion && v.costo && v.precio)
          .map((v) => ({
            tipo: v.tipo,
            presentacion: v.presentacion,
            costo: Number(v.costo),
            precio: Number(v.precio),
            stock: Number(v.stock || 0),
          })),
      }
      await esenciasApi.crear(payload)
      setMostrarForm(false)
      setForm({ nombre: '', familia: '', probador: false, variantes: [{ ...VARIANTE_VACIA }] })
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="sh-page">
      <div className="sh-page__header">
        <div>
          <h1 className="sh-page__title">Catálogo de esencias</h1>
          <p className="sh-page__subtitle">
            Cada esencia agrupa sus variantes por tipo y presentación, con costo, precio y stock propios.
          </p>
        </div>
        <button className="sh-btn sh-btn--gold" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Registrar esencia'}
        </button>
      </div>

      {mostrarForm && (
        <form className="sh-card sh-card--sealed sh-panel sh-essence-form" onSubmit={handleSubmit}>
          <div className="sh-panel__head">
            <h2 className="sh-panel__title">Nueva esencia</h2>
            <span className="sh-eyebrow">HU01</span>
          </div>

          <div className="sh-essence-form__row">
            <div className="sh-field">
              <label>Nombre</label>
              <input
                className="sh-input"
                required
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Dior Sauvage"
              />
            </div>
            <div className="sh-field">
              <label>Familia olfativa</label>
              <input
                className="sh-input"
                value={form.familia}
                onChange={(e) => setForm((f) => ({ ...f, familia: e.target.value }))}
                placeholder="Ej. Amaderada / Fresca"
              />
            </div>
            <label className="sh-essence-form__check">
              <input
                type="checkbox"
                checked={form.probador}
                onChange={(e) => setForm((f) => ({ ...f, probador: e.target.checked }))}
              />
              Tiene probador
            </label>
          </div>

          <p className="sh-eyebrow" style={{ margin: '18px 0 10px' }}>Variantes</p>
          {form.variantes.map((v, i) => (
            <div key={i} className="sh-essence-form__variant">
              <select className="sh-select" value={v.tipo} onChange={(e) => actualizarVariante(i, 'tipo', e.target.value)}>
                <option>Genérico</option>
                <option>Triple A</option>
                <option>Original</option>
              </select>
              <input
                className="sh-input"
                placeholder="Presentación (ej. 100ml)"
                value={v.presentacion}
                onChange={(e) => actualizarVariante(i, 'presentacion', e.target.value)}
              />
              <input
                className="sh-input"
                type="number"
                placeholder="Costo"
                value={v.costo}
                onChange={(e) => actualizarVariante(i, 'costo', e.target.value)}
              />
              <input
                className="sh-input"
                type="number"
                placeholder="Precio venta"
                value={v.precio}
                onChange={(e) => actualizarVariante(i, 'precio', e.target.value)}
              />
              <input
                className="sh-input"
                type="number"
                placeholder="Stock inicial"
                value={v.stock}
                onChange={(e) => actualizarVariante(i, 'stock', e.target.value)}
              />
            </div>
          ))}
          <button type="button" className="sh-btn sh-btn--ghost" onClick={agregarFilaVariante} style={{ marginTop: 6 }}>
            + Agregar variante
          </button>

          {error && <p className="sh-form-error">{error}</p>}

          <button type="submit" className="sh-btn sh-btn--gold" disabled={guardando} style={{ marginTop: 18 }}>
            {guardando ? 'Guardando…' : 'Guardar esencia'}
          </button>
        </form>
      )}

      {loading && <Loading label="Cargando catálogo…" />}
      {error && !mostrarForm && <ErrorState message={error} onRetry={cargar} />}

      <div className="sh-essence-list">
        {esencias.map((esencia) => {
          const isOpen = abierta === esencia._id
          return (
            <div key={esencia._id} className="sh-card sh-card--sealed sh-essence">
              <button className="sh-essence__head" onClick={() => setAbierta(isOpen ? null : esencia._id)}>
                <div className="sh-essence__head-left">
                  <span className={'sh-essence__chevron' + (isOpen ? ' sh-essence__chevron--open' : '')}>›</span>
                  <div>
                    <h2 className="sh-essence__name">{esencia.nombre}</h2>
                    <p className="sh-essence__family">{esencia.familia}</p>
                  </div>
                </div>
                <div className="sh-essence__head-right">
                  <Badge tone={esencia.probador ? 'gold' : 'neutral'}>
                    {esencia.probador ? 'Con probador' : 'Sin probador'}
                  </Badge>
                  <span className="sh-essence__count">{esencia.variantes.length} variantes</span>
                </div>
              </button>

              {isOpen && (
                <div className="sh-table-wrap sh-essence__table">
                  <table className="sh-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Presentación</th>
                        <th style={{ textAlign: 'right' }}>Costo</th>
                        <th style={{ textAlign: 'right' }}>Precio venta</th>
                        <th style={{ textAlign: 'right' }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {esencia.variantes.map((v) => (
                        <tr key={v._id}>
                          <td>{v.tipo}</td>
                          <td>{v.presentacion}</td>
                          <td style={{ textAlign: 'right' }} className="sh-mono">{formatCOP(v.costo)}</td>
                          <td style={{ textAlign: 'right' }} className="sh-mono">{formatCOP(v.precio)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <Badge tone={v.stock === 0 ? 'danger' : v.stock <= UMBRAL_BAJO_STOCK ? 'gold' : 'success'}>
                              {v.stock} und.
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Esencias
