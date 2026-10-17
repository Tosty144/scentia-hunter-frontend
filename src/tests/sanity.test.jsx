import { render, screen } from '@testing-library/react';

function Saludo() {
  return <h1>Scentia Hunter</h1>;
}

describe('configuración de pruebas', () => {
  it('renderiza un componente', () => {
    render(<Saludo />);
    expect(screen.getByText('Scentia Hunter')).toBeInTheDocument();
  });
});