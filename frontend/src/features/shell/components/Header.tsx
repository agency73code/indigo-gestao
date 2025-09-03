import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Header() {
    
  return (
    <header className="bg-gray-100 p-4 border-b flex items-center gap-2">
      <SidebarTrigger />
      <h1>Header</h1>
    </header>
  )
}