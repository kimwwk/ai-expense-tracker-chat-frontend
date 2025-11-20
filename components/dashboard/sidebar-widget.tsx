'use client'

import { useExternalViews } from '@/lib/store/external-views'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

/**
 * Sidebar Widget Component
 * Controlled by the LangGraph agent via 'update_sidebar' tool
 */

export function SidebarWidget() {
  const { sidebar, updateSidebar } = useExternalViews()

  return (
    <Sheet 
      open={sidebar.visible} 
      onOpenChange={(open) => updateSidebar({ visible: open })}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{sidebar.title || 'Agent Sidebar'}</SheetTitle>
          <SheetDescription>
            Content pushed from LangGraph agent
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {sidebar.content ? (
            <div className="prose dark:prose-invert">
              {typeof sidebar.content === 'string' ? (
                <p>{sidebar.content}</p>
              ) : (
                <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(sidebar.content, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No content available</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
