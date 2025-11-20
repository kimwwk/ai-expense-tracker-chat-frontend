import { create } from 'zustand'

/**
 * Global state store for external views (dashboard, sidebar, widgets)
 * Updated by MCP tool results with ui_target metadata
 */

export interface DashboardState {
  mode: 'default' | 'analytics' | 'settings' | 'custom'
  data: any
  lastUpdated?: Date
}

export interface SidebarState {
  visible: boolean
  content: any
  title?: string
}

export interface WidgetState {
  id: string
  type: string
  data: any
  position?: { x: number; y: number }
}

interface ExternalViewsState {
  // Dashboard state
  dashboard: DashboardState
  
  // Sidebar state
  sidebar: SidebarState
  
  // Dynamic widgets
  widgets: WidgetState[]
  
  // Actions
  updateDashboard: (data: Partial<DashboardState>) => void
  updateSidebar: (data: Partial<SidebarState>) => void
  addWidget: (widget: WidgetState) => void
  removeWidget: (id: string) => void
  clearAll: () => void
}

export const useExternalViews = create<ExternalViewsState>((set) => ({
  // Initial state
  dashboard: {
    mode: 'default',
    data: null,
  },
  
  sidebar: {
    visible: false,
    content: null,
  },
  
  widgets: [],
  
  // Actions
  updateDashboard: (data) =>
    set((state) => ({
      dashboard: {
        ...state.dashboard,
        ...data,
        lastUpdated: new Date(),
      },
    })),
  
  updateSidebar: (data) =>
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        ...data,
      },
    })),
  
  addWidget: (widget) =>
    set((state) => ({
      widgets: [...state.widgets, widget],
    })),
  
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
    })),
  
  clearAll: () =>
    set({
      dashboard: { mode: 'default', data: null },
      sidebar: { visible: false, content: null },
      widgets: [],
    }),
}))
