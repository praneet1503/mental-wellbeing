"use client";

import { UserProvider } from "./context/user-context";

export default function Providers({ children }) {
  return <UserProvider>{children}</UserProvider>;
}
