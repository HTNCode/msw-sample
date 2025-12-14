// 起動の出し分けを担当
import { NODE_ENV } from "@/constants/environments";

async function initMocks() {
  if (NODE_ENV !== "development") {
    return;
  }

  if (typeof window === "undefined") {
    const { server } = await import("./node");
    server.listen();
  } else {
    const { worker } = await import("./browser");
    await worker.start();
  }
}

export { initMocks };
