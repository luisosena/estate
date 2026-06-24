import { Building2 } from 'lucide-react';

/**
 * Sidebar brand mark.
 * Icon + serif wordmark, in a column that collapses when the sidebar collapses to icons-only.
 */
export function AppLogo() {
    return (
        <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-serif text-base font-normal tracking-tight text-sidebar-foreground">
                    Estate Practice
                </span>
            </div>
        </div>
    );
}

export default AppLogo;