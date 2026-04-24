import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('renders title and message correctly', () => {
    const { getByText } = render(
      <ErrorState title="Error" message="Something went wrong" onRetry={() => {}} />
    );
    
    expect(getByText('Error')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('calls onRetry when Try Again button is pressed', () => {
    const onRetryMock = jest.fn();
    const { getByText } = render(
      <ErrorState message="Error" onRetry={onRetryMock} />
    );
    
    fireEvent.press(getByText('Try Again'));
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
