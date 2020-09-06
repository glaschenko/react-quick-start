import React from 'react';
import { render } from '@testing-library/react';
import Game from "./Game";

test('renders Next player', () => {
  const { getByText } = render(<Game />);
  const nextPlayerElement = getByText(/Next player/i);
  expect(nextPlayerElement).toBeInTheDocument();
});
