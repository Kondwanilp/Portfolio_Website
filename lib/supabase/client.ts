
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    global: {
      fetch(input, init) {
        const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
        const timeout = AbortSignal.timeout(15_000);
        return fetch(input, { ...init, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
      },
    },
  }
);
