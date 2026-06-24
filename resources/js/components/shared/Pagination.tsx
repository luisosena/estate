import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[] | any;
    className?: string;
}

const Pagination = ({ links, className = '' }: PaginationProps) => {
    const actualLinks = Array.isArray(links)
        ? links
        : (links?.meta?.links || links?.links || []);

    if (!Array.isArray(actualLinks) || actualLinks.length <= 3) {
        if (!Array.isArray(actualLinks) && links) {
            console.warn(
                'Pagination component received invalid links prop. Expected array, received:',
                typeof links,
            );
        }
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                'flex flex-wrap items-center justify-center gap-1',
                className,
            )}
        >
            {actualLinks.map((link, index) => {
                const isPrev = index === 0;
                const isNext = index === actualLinks.length - 1;
                const isDots = link.label === '...';

                if (isDots) {
                    return (
                        <span
                            key={index}
                            className="text-muted-foreground flex h-8 w-8 items-center justify-center"
                            aria-hidden="true"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </span>
                    );
                }

                const label = link.label
                    .replace('&laquo; Previous', '')
                    .replace('Next &raquo;', '')
                    .trim();

                const pageNumberLabel = isPrev
                    ? 'Previous page'
                    : isNext
                        ? 'Next page'
                        : `Page ${label}`;

                if (!link.url) {
                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            size={isPrev || isNext ? 'sm' : 'icon'}
                            disabled
                            aria-label={pageNumberLabel}
                            className="h-8 min-w-8 opacity-50"
                        >
                            {isPrev ? (
                                <span className="flex items-center gap-1">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Previous
                                    </span>
                                </span>
                            ) : isNext ? (
                                <span className="flex items-center gap-1">
                                    <span className="hidden sm:inline">
                                        Next
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                            ) : (
                                label
                            )}
                        </Button>
                    );
                }

                return (
                    <Button
                        key={index}
                        variant={link.active ? 'default' : 'ghost'}
                        size={isPrev || isNext ? 'sm' : 'icon'}
                        asChild
                        className="h-8 min-w-8"
                    >
                        <Link
                            href={link.url}
                            preserveState
                            preserveScroll
                            aria-label={pageNumberLabel}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            {isPrev ? (
                                <span className="flex items-center gap-1">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Previous
                                    </span>
                                </span>
                            ) : isNext ? (
                                <span className="flex items-center gap-1">
                                    <span className="hidden sm:inline">
                                        Next
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </span>
                            ) : (
                                label
                            )}
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
};

export default Pagination;
