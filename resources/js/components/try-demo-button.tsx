import { Building2, ChevronDown, Sparkles, UserCog } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TryDemoButtonProps {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    label?: string;
    showIcon?: boolean;
    style?: React.CSSProperties;
    onMouseEnter?: () => void;
}

export function TryDemoButton({
    variant = 'default',
    size = 'default',
    className,
    label = 'Try Demo',
    showIcon = true,
    style,
    onMouseEnter,
}: TryDemoButtonProps) {
    const [open, setOpen] = useState(false);

    const handleLandlord = () => {
        setOpen(false);
        window.location.href = '/demo?role=landlord';
    };

    const handleTenant = () => {
        setOpen(false);
        window.location.href = '/demo?role=tenant';
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    style={style}
                    onMouseEnter={onMouseEnter}
                    onClick={(e) => e.preventDefault()}
                >
                    {showIcon && <Sparkles className="h-4 w-4" />}
                    {label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Explore as
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={handleLandlord}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-3"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">Landlord</span>
                        <span className="text-xs text-muted-foreground">
                            Manage properties, units & tenants
                        </span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleTenant}
                    className="flex cursor-pointer items-start gap-3 rounded-lg p-3"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserCog className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">Tenant</span>
                        <span className="text-xs text-muted-foreground">
                            Pay rent, view bills & tickets
                        </span>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <div className="px-3 py-2 text-xs text-muted-foreground">
                    Read-only access. 30-minute session.
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TryDemoButton;