import Dashboard from "@/components/dashboard";
import { getState } from "@/server/engine";
import type { StateResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialState: StateResponse | null = null;
  try {
    initialState = await getState();
  } catch {
    initialState = null;
  }

  return <Dashboard initialState={initialState} />;
}
