import * as React from "react"

// Implementação temporária sem hooks para resolver problemas de hook call
export function ThemeProvider({ 
  children, 
  defaultTheme = "dark",
  storageKey = "theme",
  ...props 
}: { 
  children: React.ReactNode; 
  defaultTheme?: string;
  storageKey?: string;
  [key: string]: any;
}) {
  // Por enquanto, apenas renderiza os filhos sem funcionalidade de tema
  // TODO: Implementar funcionalidade completa quando hooks estiverem funcionando
  return <div data-theme-provider data-theme={defaultTheme}>{children}</div>
}