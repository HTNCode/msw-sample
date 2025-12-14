// ブラウザ側でのモックテスト用
"use client";

import { useEffect, useState } from "react";

const MSWProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      const { initMocks } = await import("@/msw/setup");
      await initMocks();
      setIsReady(true);
    }

    enableMocking();
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
};

export default MSWProvider;
