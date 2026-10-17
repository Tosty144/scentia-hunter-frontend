import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from '../pages/Login/Login'

function renderizarLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<p>Panel principal</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Login', () => {
  it('muestra el logo, el título y los campos con valores de ejemplo', () => {
    renderizarLogin()
    expect(screen.getByRole('heading', { name: 'Panel de Inventario' })).toBeInTheDocument()
    expect(screen.getByAltText('Scentia Hunter')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('admin@scentiahunter.com')
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
  })

  it('avisa que es una maqueta sin autenticación real', () => {
    renderizarLogin()
    expect(screen.getByText('Maqueta de frontend — sin autenticación real todavía')).toBeInTheDocument()
  })

  it('al ingresar redirige al panel principal', () => {
    renderizarLogin()
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar al panel' }))
    expect(screen.getByText('Panel principal')).toBeInTheDocument()
    expect(screen.queryByText('Panel de Inventario')).not.toBeInTheDocument()
  })
})
