import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import { Loading, ErrorState } from '../../components/ui/AsyncState'
import { esenciasApi } from '../../services/api'
import './Probadores.css'

function Probadores() {
  const [filtro, setFiltro] = useState('todos')
  const [listado, setListado] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function cargar(f) {
    setLoading(true)
    setError(null)
    const estado = f === 'todos' ? undefined : f
    esenciasApi
      .probadores(estado)
      .then(setListado)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargar(filtro)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  return (
    <div className="sh-page">
      <div className="sh-page__header">
        <div>
          <h1 className="sh-page__title">Probadores</h1>
          <p className="sh-page__subtitle">
            Consulta qué esencias tienen probador disponible para mostrar a los clientes.
          </p>
        </div>
        <div className="sh-testers__filters">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'disponibles', label: 'Disponibles' },
            { key: 'faltantes', label: 'Sin probador' },
          ].map((f) => (
            <button
              key={f.key}
              className={'sh-testers__chip' + (filtro === f.key ? ' sh-testers__chip--active' : '')}
              onClick={() => setFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading label="Cargando probadores…" />}
      {error && <ErrorState message={error} onRetry={() => cargar(filtro)} />}

      {!loading && !error && (
        <div className="sh-testers__grid">
          {listado.map((e) => (
            <div key={e._id} className="sh-card sh-card--sealed sh-testers__card">
              <div className="sh-testers__card-top">
                <span className={'sh-testers__dot' + (e.probador ? ' sh-testers__dot--on' : '')} />
                <Badge tone={e.probador ? 'gold' : 'danger'}>
                  {e.probador ? 'Probador disponible' : 'Falta probador'}
                </Badge>
              </div>
              <h3 className="sh-testers__name">{e.nombre}</h3>
              <p className="sh-testers__family">{e.familia}</p>
            </div>
          ))}
          {listado.length === 0 && (
            <p style={{ color: 'var(--sh-ash)', fontSize: 13.5 }}>No hay esencias en este filtro.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Probadores
