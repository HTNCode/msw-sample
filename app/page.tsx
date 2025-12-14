import ServerFetchTest from "@/components/ServerFetchTest";
import ClientFetchTest from "@/components/ClientFetchTest";
import MSWProvider from "@/components/MSWProvider";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">MSW Handler Test</h1>

      {/* SSR: server-handlers.ts が使われる */}
      <ServerFetchTest />

      {/* ブラウザ: browser-handlers.ts が使われる */}
      <MSWProvider>
        <ClientFetchTest />
      </MSWProvider>
    </main>
  );
}
