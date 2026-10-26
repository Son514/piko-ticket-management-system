export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
  values?: {
    email?: string;
    name?: string;
    username?: string;
  };
};

export const initialAuthState: AuthState = {};
