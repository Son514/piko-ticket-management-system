"use client";

import { useActionState, useTransition, type FormEvent } from "react";

import { initialAuthState, type AuthState } from "@/app/server/auth/types";

type ServerFormAction = (
  state: AuthState,
  formData: FormData,
) => Promise<AuthState>;

/**
 * Calls a server action from a normally submitted form while preventing
 * React 19's automatic form reset. The reset is what makes uncontrolled
 * selects jump back to their original value after a successful action.
 */
export function useNativeFormAction(action: ServerFormAction) {
  const [state, formAction, actionPending] = useActionState(
    action,
    initialAuthState,
  );
  const [transitionPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  return {
    state,
    onSubmit,
    pending: actionPending || transitionPending,
  };
}
