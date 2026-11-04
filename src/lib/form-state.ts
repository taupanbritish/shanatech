export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  reference?: string;
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };
