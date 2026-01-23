/*
import { Sidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SidebarComponent() {
  return(
  <div>
    <SidebarProvider>
      <Sidebar>

      </Sidebar>
      <SidebarInset>
        // Your shadcn/ui card component or div
<div className="relative rounded-xl bg-white/20 p-6 shadow-lg backdrop-blur-3xl">
  <h2 className="text-xl font-bold">Glass Card</h2>
  <p className="mt-2 text-gray-700">This card has a frosted glass effect.</p>
</div>

      </SidebarInset>
    </SidebarProvider>

  </div>
  )
} 
*/
import { ButtonGlass, InputGlass, ThemeProvider } from 'shadcn-glass-ui';
import 'shadcn-glass-ui/dist/styles.css';

function App() {
  return (
    <ThemeProvider defaultTheme="glass">
      <div className="p-8 space-y-4">
        <ButtonGlass variant="primary" size="lg">
          Click me
        </ButtonGlass>
        <InputGlass placeholder="Enter text..." />
      </div>
    </ThemeProvider>
  );
}

export default App;