interface HeadingSmallProps {
    title: string;
    description?: string;
}

/**
 * Section / field-group heading (§5.5).
 * Sans, medium weight, tight tracking.
 */
export default function HeadingSmall({
    title,
    description,
}: HeadingSmallProps) {
    return (
        <header className="space-y-1">
            <h2 className="text-lg font-medium tracking-tight text-foreground">
                {title}
            </h2>
            {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
        </header>
    );
}
