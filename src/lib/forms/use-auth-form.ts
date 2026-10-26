"use client";

import {
  useActionState,
  useEffect,
  useTransition,
  type FormEvent,
} from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormProps,
} from "react-hook-form";

import { initialAuthState, type AuthState } from "@/app/server/auth/types";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function useAuthForm<TValues extends FieldValues>(
  action: AuthAction,
  options: UseFormProps<TValues>,
) {
  const form = useForm<TValues>(options);
  const [state, formAction, actionPending] = useActionState(
    action,
    initialAuthState,
  );
  const [transitionPending, startTransition] = useTransition();

  useEffect(() => {
    if (!state.fieldErrors) return;

    for (const [field, messages] of Object.entries(state.fieldErrors)) {
      const message = messages[0];
      if (!message || field === "form") continue;

      form.setError(field as Path<TValues>, {
        type: "server",
        message,
      });
    }
  }, [state, form]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formElement = event.currentTarget;

    void form.handleSubmit(() => {
      form.clearErrors();

      const formData = new FormData(formElement);
      startTransition(() => formAction(formData));
    })(event);
  };

  return {
    form,
    state,
    onSubmit,
    pending: actionPending || transitionPending,
  };
}
