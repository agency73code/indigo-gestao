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
    target?: string
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2 group-data-[collapsible=icon]:gap-0.5">
          {items.map((item, index) => (
            <SidebarMenuItem key={item.title} className={index === items.length - 1 ? 'pb-2' : ''}>
              <SidebarMenuButton asChild size="sm" tooltip={item.title}>
                <a 
                  href={item.url} 
                  target={item.target}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="[&_svg]:h-4 [&_svg]:w-4 group-data-[collapsible=icon]:justify-center"
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-transparent border border-primary/30 shrink-0 [&_svg]:text-primary group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
