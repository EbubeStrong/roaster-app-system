"use client";
import React, { createContext, useContext } from "react";

type User = {
  id: string;
  name: string;
  role?: string;
};

const demoUsers: User[] = [
  { id: "haico", name: "Haico de Gast" },
  { id: "diane", name: "Diane Lane" },
  { id: "elijah", name: "Elijah Oyin" },
  { id: "paul", name: "Paul Cornelius" },
];

const DemoAuthContext = createContext({
  users: demoUsers,
  currentUser: demoUsers[0],
});

export const useDemoAuth = () => useContext(DemoAuthContext);

export default function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <DemoAuthContext.Provider value={{ users: demoUsers, currentUser: demoUsers[0] }}>
      {children}
    </DemoAuthContext.Provider>
  );
}
