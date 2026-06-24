interface HeadingProps {
    title: string;
    description?: string;
}

/**
 * Page-level heading (§5.1).
 * Serif display title + sans description.
 */
export default function Heading({ title, description }: HeadingProps) {
    return (
        <div className="space-y-1.5">
            <h1 className="font-display text-display text-foreground leading-[1.05] tracking-[-0.02em]">
                {title}
            </h1>
            {description ? (
                <p className="text-md text-muted-foreground">{description}</p>
            ) : null}
        </div>
    );
}
