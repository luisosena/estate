import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { Card } from '../Card';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Test Content</Text>
      </Card>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies padding by default', () => {
    const { getByTestId } = render(
      <Card testID="card-component">
        <Text>Content</Text>
      </Card>
    );
    
    const card = getByTestId('card-component');
    expect(card.props.style).toContainEqual({ padding: 16 });
  });

  it('removes padding when noPadding prop is true', () => {
    const { getByTestId } = render(
      <Card testID="card-component" noPadding>
        <Text>Content</Text>
      </Card>
    );
    
    const card = getByTestId('card-component');
    // withPadding is styles.withPadding which is { padding: 16 }
    // We expect it NOT to have padding 16
    expect(card.props.style).not.toContainEqual({ padding: 16 });
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Card testID="card-component" style={customStyle}>
        <Text>Content</Text>
      </Card>
    );
    
    const card = getByTestId('card-component');
    expect(card.props.style).toContainEqual(customStyle);
  });
});
