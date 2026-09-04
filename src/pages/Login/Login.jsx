import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo/scentia-hunter-logo.png'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="sh-login">
      <div className="sh-login__glow" />
      <form className="sh-login__card sh-card" onSubmit={handleSubmit}>
        <div className="sh-login__logo-ring">
          <img src={logo} alt="Scentia Hunter" />
        </div>
        <p className="sh-eyebrow sh-login__eyebrow">Scentia Hunter</p>
        <h1 className="sh-login__title">Panel de Inventario</h1>
        <p className="sh-login__subtitle">
          Ingresa tus credenciales para gestionar esencias, inventario y ventas.
        </p>

        <div className="sh-field">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" className="sh-input" type="email" placeholder="admin@scentiahunter.com" defaultValue="admin@scentiahunter.com" />
        </div>

        <div className="sh-field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" className="sh-input" type="password" placeholder="••••••••" defaultValue="••••••••" />
        </div>

        <button type="submit" className="sh-btn sh-btn--gold sh-login__submit">
          Ingresar al panel
        </button>

        <p className="sh-login__footnote">Maqueta de frontend — sin autenticación real todavía</p>
      </form>
    </div>
  )
}

export default Login
