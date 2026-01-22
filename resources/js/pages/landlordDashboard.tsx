import { TextAnimate } from "@/components/ui/text-animate"
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar"

export default function Mypage() {
  return (
    <>
      <div>Hello World!!</div>
      <TextAnimate
        animation="slideLeft"
        by="character"
        className="text-center"
      >
        Slide left by character
      </TextAnimate>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div>HEADER</div>
          </SidebarHeader>
          <SidebarContent>
            <div>Hello WOrld</div>
          </SidebarContent>
          <SidebarFooter>
            <div>FOOTER</div>
          </SidebarFooter>
        </Sidebar>
        <SidebarTrigger />
      </SidebarProvider>
    </>
  )
}