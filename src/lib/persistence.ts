import { toast } from "@/components/ui/use-toast";

export type WriteResult = {
  ok: boolean;
  persisted: boolean;
  error?: string;
};

export type CreateResult<T> = WriteResult & {
  data: T | null;
};

export const DEMO_WRITE_DESCRIPTION =
  "Demo only — this change is kept in this session and is not saved to the database.";

export const DEMO_BANNER_TEXT =
  "Sample data — edits stay in this browser session and are not written to the database.";

export function demoWriteResult(): WriteResult {
  return { ok: true, persisted: false };
}

export function failedWriteResult(error: string): WriteResult {
  return { ok: false, persisted: false, error };
}

export function demoCreateResult<T>(data: T): CreateResult<T> {
  return { ok: true, persisted: false, data };
}

export function failedCreateResult<T>(error: string): CreateResult<T> {
  return { ok: false, persisted: false, data: null, error };
}

export function toastWriteResult(title: string, result: WriteResult) {
  if (!result.ok) {
    toast({
      title: "Error",
      description: result.error || "Something went wrong.",
      variant: "destructive",
    });
    return;
  }

  if (!result.persisted) {
    toast({
      title: `${title} (demo)`,
      description: DEMO_WRITE_DESCRIPTION,
    });
    return;
  }

  toast({
    title,
    description: "Your changes have been saved.",
  });
}

export function toastDemoAction(title: string, description?: string) {
  toast({
    title: `${title} (demo)`,
    description: description || DEMO_WRITE_DESCRIPTION,
  });
}
