import { createContext } from "react";
import type { AuthContextValue } from "./auth.types";

/**
 * Kept in its own module (no components) so hot-reloading AuthProvider never
 * creates a second context instance, which would make useAuth read null.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
