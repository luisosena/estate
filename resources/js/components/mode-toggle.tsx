import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppearance } from "@/hooks/use-appearance"

export function ModeToggle() {
  const { updateAppearance } = useAppearance()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-md border-border/50 bg-card text-foreground hover:bg-muted/50 shadow-none">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border/50">
        <DropdownMenuItem onClick={() => updateAppearance("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateAppearance("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateAppearance("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
