import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[] | any; // Flexibility during transition
    className?: string;
}

const Pagination = ({ links, className = "" }: PaginationProps) => {
    // Safety handling for Laravel API Resource structures
    // If 'links' is passed as the top-level pagination object, the array is in 'meta.links'
    // If it's passed as the 'links' object from a Resource, it's actually not the array we want
    const actualLinks = Array.isArray(links) 
        ? links 
        : (links?.meta?.links || links?.links || []); // Handle various Resource structures

    // Validation
    if (!Array.isArray(actualLinks) || actualLinks.length <= 3) {
        if (!Array.isArray(actualLinks) && links) {
            console.warn('Pagination component received invalid links prop. Expected array, received:', typeof links);
        }
        return null;
    }

    return (
        <div className={`flex items-center justify-center space-x-1 ${className}`}>
            {actualLinks.map((link, index) => {
                // Determine if this is a previous or next link
                const isPrev = index === 0;
                const isNext = index === actualLinks.length - 1;
                const isDots = link.label === '...';

                if (isDots) {
                    return (
                        <div key={index} className="flex h-9 w-9 items-center justify-center">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                    );
                }

                const label = link.label
                    .replace('&laquo; Previous', '')
                    .replace('Next &raquo;', '')
                    .trim();

                if (!link.url) {
                    return (
                        <Button
                            key={index}
                            variant="outline"
                            size={isPrev || isNext ? "default" : "icon"}
                            disabled
                            className="opacity-50 h-8 sm:h-9"
                        >
                            {isPrev ? "Previous" : isNext ? "Next" : label}
                        </Button>
                    );
                }

                return (
                    <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size={isPrev || isNext ? "default" : "icon"}
                        asChild
                        className="h-8 sm:h-9"
                    >
                        <Link 
                            href={link.url}
                            preserveState
                            preserveScroll
                        >
                            {isPrev ? (
                                <span className="flex items-center"><ChevronLeft className="h-4 w-4 mr-1" /> Previous</span>
                            ) : isNext ? (
                                <span className="flex items-center">Next <ChevronRight className="h-4 w-4 ml-1" /></span>
                            ) : (
                                label
                            )}
                        </Link>
                    </Button>
                );
            })}
        </div>
    );
};

export default Pagination;
