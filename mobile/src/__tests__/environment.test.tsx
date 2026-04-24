import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Simplified mock of the component to verify Jest is working with custom components
const MockComponent = ({ message }: { message: string }) => {
  return (
    <Text>
      {message}
    </Text>
  );
};

describe('Test Environment Check', () => {
  it('renders a mock component with message', () => {
    const { getByText } = render(<MockComponent message="Environment is stable" />);
    expect(getByText('Environment is stable')).toBeTruthy();
  });
});
