import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { render } from '@testing-library/react-native';
import { ScreenContainer } from '../ScreenContainer';

describe('ScreenContainer', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <ScreenContainer>
        <Text>Screen Content</Text>
      </ScreenContainer>
    );
    
    expect(getByText('Screen Content')).toBeTruthy();
  });

  it('renders a ScrollView when scrollable is true', () => {
    const { UNSAFE_getByType } = render(
      <ScreenContainer scrollable>
        <Text>Content</Text>
      </ScreenContainer>
    );
    
    expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
  });

  it('renders a View when scrollable is false', () => {
    const { UNSAFE_queryByType, UNSAFE_getByType } = render(
      <ScreenContainer scrollable={false}>
        <Text>Content</Text>
      </ScreenContainer>
    );
    
    expect(UNSAFE_queryByType(ScrollView)).toBeNull();
  });
});
