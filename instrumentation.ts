// サーバー側のNode.js専用
export async function register() {
  // "msw/node"がNode.jsランタイムでのみ利用可能（=Edgeランタイムで利用不可）
  // なお、NEXT_RUNTIMEはNext.jsがビルド時に設定する環境変数
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMocks } = await import("@/msw/setup");
    await initMocks();
  }
}
