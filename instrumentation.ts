import { logInfo } from "@/lib/common/logging";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logInfo("instrumentation_registered", { runtime: "nodejs" });
  }
}
