import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { AnimatedIconComponent } from "@/components/sidebar/animated-icons"

// Tipo que aceita tanto LucideIcon quanto AnimatedIconComponent
type SidebarIconType = LucideIcon | AnimatedIconComponent;

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: SidebarIconType
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url} className="[&_svg]:h-4 [&_svg]:w-4">
                  <item.icon size={16} />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
