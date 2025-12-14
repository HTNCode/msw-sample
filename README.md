# 概要

- **MSW（Mock Service Worker）は、ブラウザとNode.j用のAPIモックライブラリ。**
- MSWによるAPIモックを設置すると、APIを叩いている部分をAPIモックでキャッチして応答させるようにすることができる。
- 環境やフレームワーク、ツールに依存しないように設計されており、追加の設定なしであらゆるブラウザやNode.jsのプロセスで使用可能。
- ネイティブクライアントだけでなく、window.fetch()やAxios、React Query、Apolloなどのサードパーティライブラリなど、あらゆるリクエストクライアントで動作する。
- テストが可能な限り実稼働環境に近い環境で実行されるようにできる。
- また、APIモックをスタンドアロンレイヤーとして扱うことで、開発時から統合テスト、e2eテストで同じAPIモックを使用して、その後Storybookやライブデモで一貫して使用することが可能。

# 制限事項

## 進行状況・アップロード進行状況イベントのインターセプト

- MSWはService Worker APIを使用してブラウザ内のリクエストをインターセプトする。そして、Service Worker APIはページ上のすべての送信リクエストをFetch APIリクエストに変換する仕様。
- Fetch APIはリクエストの進行状況という概念がないので、関連する進行状況イベントとアップロード進行状況イベントはインターセプトされたXMLHttpRequestには送信されない。
- ただし、XMLHttpRequestInterceptを直接使用することで回避策は講じられる。
  https://mswjs.io/docs/recipes/xmlhttprequest-progress-events

## Firefoxでの利用不可

- FirefoxではXMLHttpRequestがページ上で発生しても、ワーカーに通知しない。なのでMSW側で対応することはできない。別のブラウザでのテスト等を検討すること。

## Node.jsの制限

- 直接的なネットワーク接続を行うnet.connext()やnet.createConnection()呼び出しを介して実行されるリクエストをMSWはインターセプトできない。
- Node.jsのほとんどのリクエストライブラリはhttp.ClientRequestでの実行方法を利用しており、MSWはこれをインターセプトするつくりになっているが、Undiciなどの一部のライブラリはモジュールに直接アクセスしてnode:netリクエストを実行するのでMSW側ではキャッチできない制限がある。

# 使い方

## インストール

```tsx
npm install msw@latest --save-dev

// pnpm
pnpm add --save-dev msw
```

## リクエストハンドラを作成

- クライアント側のfetchをインターセプトした際に利用するハンドラー

```tsx
// /msw/handlers/browser-handlers.ts

// クライアントサイド側（ブラウザからのfetchをインターセプトするAPIモックハンドラー）
import { http, HttpResponse } from "msw";

export const handlers = [
  // サンプル: GET /api/user(定数化するのが普通ですがあくまでサンプルなのでハードコード)
  http.get("http://localhost:3000/api/user", () => {
    return HttpResponse.text("msw/handlers/browser-handlers.ts response");
  }),
  // 必要な分だけここに追加すればよし
  // 1つのリクエストが同時に複数のハンドラーに一致する場合も、処理を担当できるのは1つのみ。
  // 例えば、以下のようなハンドラーを定義すると、Oneとコンソールログに表示され、
  // 次にJSONが返されるがThreeはすでにJSONを返したことでリクエスト処理済みと認識され実行されない。
  // http.get('/user', () => console.log('One')),
  // http.get('/user', () => HttpResponse.json({ name: 'John' })),
  // http.get('/user', () => console.log('Three')),
  //
  // なお、以下のようにしてあいまい「*」なリクエストも判定させることが可能
  http.get("/user/*", () => {
    return HttpResponse.json({ name: "Wildcard User" });
  }),
];
```

- サーバー側のfetchをインターセプトした際に利用するハンドラー

```tsx
// msw/handlers/server-handlers.ts

// サーバー側で実行されるAPIのモックハンドラー
import { http, HttpResponse } from "msw";

export const handlers = [
  // サンプル: GET /api/user(定数化するのが普通ですがあくまでサンプルなのでハードコード)
  http.get("http://localhost:3000/api/user", () => {
    return HttpResponse.text("msw/handlers/server-handlers.ts response");
  }),
  // 必要な分だけここに追加すればよし
  // 1つのリクエストが同時に複数のハンドラーに一致する場合も、処理を担当できるのは1つのみ。
  // 例えば、以下のようなハンドラーを定義すると、Oneとコンソールログに表示され、
  // 次にJSONが返されるがThreeはすでにJSONを返したことでリクエスト処理済みと認識され実行されない。
  // http.get('/user', () => console.log('One')),
  // http.get('/user', () => HttpResponse.json({ name: 'John' })),
  // http.get('/user', () => console.log('Three')),
  //
  // なお、以下のようにしてあいまい「*」なリクエストも判定させることが可能
  http.get("/user/*", () => {
    return HttpResponse.json({ name: "Wildcard User" });
  }),
];
```

※**MSW は、[HTTP](https://mswjs.io/docs/http)、[GraphQL](https://mswjs.io/docs/graphql)、[WebSocket](https://mswjs.io/docs/websocket) API の両方のインターセプトをサポートしている**

※ただし、server.use()を使ってハンドラーをオーバーライドしている記述が存在する場合は、オーバーライドした部分が優先され、その次にハンドラーとして定義した部分が実行される順序になる。https://mswjs.io/docs/defaults#handler-order-sensitivity

## 作成したリクエストハンドラをNode.jsプロセス・ブラウザプロセスへ提供する

```tsx
// msw/setup/node.ts(サーバーコンポーネント側のモックを担当）

import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

export const server = setupServer(...handlers);
```

```tsx
// msw/setup/browser.ts（クライアントコンポーネント側のモックを担当）
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

```tsx
// msw/setup/indes.ts

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
```

## mswコマンドを使ってService Workerの登録を行う

- クライアントコンポーネント側のモックをする場合は必須
- ネットワーク レベルでのリクエストのインターセプトを担当するService Workerを登録する
- これをすることでブラウザを起動した際にMSWのモックを利用することができる

※<PUBLIC_DIR>部分にpublicディレクトリのパスを指定

```tsx
npx msw init <PUBLIC_DIR> --save

// pnpm
pnpm exec msw init <PUBLIC_DIR> --save
```

- これをすると、 `public`ディレクトリに `mockServiceWorker.js`というファイルが作成される。
- また、 `package.json`に以下の記述も増える。

```tsx
  "msw": {
     "workerDirectory": ["public"]
  }
```

## （Next.jsの場合の追加設定）

### Instrumentation.tsをプロジェクトのrootディレクトリ直下に作成

```tsx
// /root/instrumentation.ts(サーバー側のNode.js専用）

export async function register() {
  // "msw/node"がNode.jsランタイムでのみ利用可能（=Edgeランタイムで利用不可）
  // なお、NEXT_RUNTIMEはNext.jsがビルド時に設定する環境変数
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initMocks } = await import("@/msw/setup");
    await initMocks();
  }
}
```

- で、NODE_ENVの定数設定ファイルを作成し、.envファイルで出しわける

```tsx
// /constants/environments.ts
export NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV
```

```bash
# .env*ファイル

# これがdevelopmentの場合にMSWが動作するようになる
NEXT_PUBLIC_NODE_ENV="development"
```

### componentsディレクトリにMSWProvider.tsxを作成

```tsx
// ブラウザ側でのモックテスト用にラップして利用するProvider
// これでラップするのはクライアントコンポーネントに絞ること！！

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
```

- アプリケーションを起動して、ブラウザ側でうまくMSWのモックが動いていれば、コンソールに[MSW] Mocking enabled.と表示される。

※とりあえず動作を確認したいなら、下記のようなサンプルページを用意すればOK

```tsx
// app/page.tsx

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
```

※NEXT*PUBLIC_NODE_ENVがdevelopmentではない場合にapi/*/route.tsが実行されることも確認するならapi/\_/route.tsを作成

```tsx
// api/user/route.ts

export async function GET() {
  return new Response("api/user/route.ts response");
}
```

# 動作確認結果

- .env.developmentのNEXT_PUBLIC_NODE_ENVが未設定の場合

![image.png](/public/nomal.png)

- .env.developmentのNEXT_PUBLIC_NODE_ENVがdevelopmentの場合

![image.png](/public/msw-api-mock.png)
