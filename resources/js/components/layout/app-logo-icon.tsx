import { SVGAttributes } from 'react';

/**
 * Estate Practice logo icon — building/roof mark.
 * Renders as a pure SVG; color is inherited via `currentColor` / `fill`.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            <path d="M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3V10.5Z" />
        </svg>
    );
}