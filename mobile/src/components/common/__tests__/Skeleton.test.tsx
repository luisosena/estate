import React from 'react';
import { render } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';



describe('Skeleton', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<Skeleton testID="skeleton-component" />);
    const skeleton = getByTestId('skeleton-component');
    
    // Default width is 100%
    expect(skeleton.props.style).toContainEqual(expect.objectContaining({ width: '100%' }));
  });

  it('renders with custom dimensions', () => {
    const { getByTestId } = render(
      <Skeleton testID="skeleton-component" width={100} height={50} />
    );
    const skeleton = getByTestId('skeleton-component');
    
    expect(skeleton.props.style).toContainEqual(expect.objectContaining({ width: 100, height: 50 }));
  });

  it('applies circle variant correctly', () => {
    const { getByTestId } = render(
      <Skeleton testID="skeleton-component" height={50} variant="circle" />
    );
    const skeleton = getByTestId('skeleton-component');
    
    expect(skeleton.props.style).toContainEqual(expect.objectContaining({ borderRadius: 25 }));
  });
});
