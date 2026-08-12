"use client";
import * as React from "react";

export type Role = "admin" | "volunteer" | "victim";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>("volunteer");

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
