// クライアントコンポーネント側のモックを担当
import { setupWorker } from "msw/browser";
import { handlers } from "../handlers/browser-handlers";

export const worker = setupWorker(...handlers);
