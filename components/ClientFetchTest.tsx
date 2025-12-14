// クライアントコンポーネントからfetchを実行
// → browser-handlers.ts のレスポンスが返るはず
"use client";

import { useEffect, useState } from "react";

export default function ClientFetchTest() {
  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("http://localhost:3000/api/user");
      const text = await res.text();
      setData(text);
    }

    fetchUser();
  }, []);

  return (
    <div className="p-4 border border-green-500 rounded mb-4">
      <h2 className="font-bold text-green-500">Client Component (Browser)</h2>
      <p>Response: {data}</p>
    </div>
  );
}
