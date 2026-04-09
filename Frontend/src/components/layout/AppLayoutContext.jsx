import { createContext, useContext, useMemo, useState } from 'react'

const AppLayoutContext = createContext(null)

export const AppLayoutProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const value = useMemo(
    () => ({ sidebarCollapsed, setSidebarCollapsed }),
    [sidebarCollapsed],
  )

  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  )
}

export const useAppLayout = () => {
  const ctx = useContext(AppLayoutContext)
  if (!ctx) {
    throw new Error('useAppLayout must be used within AppLayoutProvider')
  }
  return ctx
}
