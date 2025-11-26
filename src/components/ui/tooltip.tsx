import React from "react";

// Implementação simples sem hooks para evitar erros do React
export const TooltipProvider: React.FC<{ children: React.ReactNode; delayDuration?: number }> = ({ 
  children 
}) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipTrigger: React.FC<{ 
  children: React.ReactNode; 
  asChild?: boolean;
}> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<{ 
  children: React.ReactNode;
  side?: string;
  align?: string;
  hidden?: boolean;
  className?: string;
}> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};