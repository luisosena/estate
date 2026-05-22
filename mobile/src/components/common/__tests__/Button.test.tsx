import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';

import { Button } from '../Button';

describe('Button', () => {
  it('renders label correctly', () => {
    const { getByText } = render(<Button label="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Click Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Click Me" onPress={onPressMock} disabled />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('is disabled when loading prop is true', () => {
    const onPressMock = jest.fn();
    const { queryByText, getByTestId } = render(
      <Button label="Click Me" onPress={onPressMock} loading testID="button-component" />
    );
    
    // Label should not be visible when loading
    expect(queryByText('Click Me')).toBeNull();
    
    // Should be disabled
    const button = getByTestId('button-component');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('shows loading indicator when loading', () => {
    const { UNSAFE_getByType } = render(<Button label="Click Me" loading />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });
});
