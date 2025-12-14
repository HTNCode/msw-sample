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
