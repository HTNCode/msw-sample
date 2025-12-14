// サーバーコンポーネント（SSR）からfetchを実行
// → server-handlers.ts のレスポンスが返る

async function fetchUser() {
  const res = await fetch("http://localhost:3000/api/user");
  return res.text();
}

export default async function ServerFetchTest() {
  const data = await fetchUser();

  return (
    <div className="p-4 border border-blue-500 rounded mb-4">
      <h2 className="font-bold text-blue-500">Server Component (SSR)</h2>
      <p>Response: {data}</p>
    </div>
  );
}
