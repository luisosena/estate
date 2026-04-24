import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<Badge label="Active" status="active" />);
    expect(getByText('Active')).toBeTruthy();
  });

  it('applies correct styles for active status', () => {
    const { getByText } = render(<Badge label="Active" status="active" />);
    const text = getByText('Active');
    expect(text.props.style).toContainEqual(expect.objectContaining({ color: expect.any(String) }));
  });

  it('applies correct styles for pending status', () => {
    const { getByText } = render(<Badge label="Pending" status="pending" />);
    const text = getByText('Pending');
    expect(text.props.style).toContainEqual(expect.objectContaining({ color: expect.any(String) }));
  });

  it('renders icon when provided', () => {
    const { getByText } = render(
      <View>
        <Badge label="Icon" icon="checkmark" />
      </View>
    );
    expect(getByText('Icon')).toBeTruthy();
  });
});
