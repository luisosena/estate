import { usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { UserMenuContent } from '@/components/shared/user-menu-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Sticky top bar (h-14) for the application shell.
 * Layout: [Breadcrumb]  [Search trigger (centered)]  [User menu]
 * Mobile: breadcrumb collapses, search becomes icon-only.
 */
export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
            {/* Left: breadcrumbs */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {breadcrumbs.length > 0 ? (
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                ) : (
                    <span className="text-sm text-muted-foreground truncate">
                        {/* placeholder when no breadcrumb supplied */}
                    </span>
                )}
            </div>

            {/* Center/Right: search trigger (placeholder — wire to cmdk in Phase 1.7) */}
            <div className="hidden md:flex items-center">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 px-3 text-muted-foreground font-normal"
                >
                    <Search className="h-3.5 w-3.5" />
                    <span className="text-sm">Search</span>
                    <kbd className="ml-2 hidden h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
                        ⌘K
                    </kbd>
                </Button>
            </div>

            {/* Right: user menu */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                    aria-label="Search"
                >
                    <Search className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-9 gap-2 rounded-md px-2"
                        >
                            <Avatar size="sm" className="h-7 w-7">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="text-[10px]">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden text-sm font-medium md:inline-flex truncate max-w-[120px]">
                                {auth.user.name}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" sideOffset={6}>
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}