# Resonance Logger

YCM (Young CPA Meetup) 向けリアルタイム感情共有 Web アプリの MVP。

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

- **参加者画面**: `/` — 中央の RESONATE ボタンで共感を送信。下部に My Log。
- **ダッシュボード（投影用）**: `/dashboard` または画面右下の "Dashboard" リンク。

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React Router

## 構成

- `src/App.jsx` — ルーティング
- `src/pages/ParticipantView.jsx` — 参加者UI
- `src/pages/DashboardView.jsx` — 投影用ダッシュボード
- `src/components/ResonanceButton.jsx` — ボタン・パーティクル・バイブ
- `src/components/MyLog.jsx` — 自分のタップ履歴タイムライン
- `src/components/LiveChart.jsx` — リアルタイム熱量グラフ（モックデータ）

Firebase Realtime Database は未接続。`LiveChart.jsx` 内で `setInterval` によるモックデータで動作。

---

## デプロイ方法

### 1. ビルド（共通）

```bash
npm install
npm run build
```

`dist/` フォルダに静的ファイルが出力されます。SPA のため `/dashboard` などはサーバー側で `index.html` にフォールバックする設定が必要です。

---

### 方法A: Vercel（おすすめ・無料）

**詳しい手順は [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) に記載しています。** 初めての方向けに画面の流れに沿って説明しています。

- [Vercel](https://vercel.com) に GitHub でログイン → 「Add New」→「Project」でリポジトリをインポート
- **Build Command**: `npm run build`、**Output Directory**: `dist` のまま **Deploy**
- デプロイ後は `https://あなたのプロジェクト.vercel.app` で公開されます

---

### 方法B: Netlify（無料）

1. [Netlify](https://www.netlify.com) にアクセスし、GitHub でサインアップ。
2. 「Add new site」→「Import an existing project」でリポジトリを選択。
3. **Build command**: `npm run build`
4. **Publish directory**: `dist`
5. **Deploy** をクリック。

`public/_redirects` がビルド時に `dist/` にコピーされ、SPA 用のリダイレクトが有効になります。

---

### 方法C: 手動で dist をアップロード（静的ホスティング）

- **GitHub Pages**・**Firebase Hosting**・**Cloudflare Pages** など、任意の静的ホスティングに `dist/` の中身をそのままアップロードします。
- **重要**: `/` 以外のパス（例: `/dashboard`）でも `index.html` が返るように、サービス側で「SPA 用フォールバック」や「すべてのパス → index.html」を設定してください。

| サービス | 設定例 |
|----------|--------|
| GitHub Pages | リポジトリの Actions で `peaceiris/actions-gh-pages` 等を使うか、`dist` を `gh-pages` ブランチに push |
| Firebase Hosting | `firebase.json` の `hosting` に `"rewrites": [{"source":"**","destination":"/index.html"}]` を追加 |
| Cloudflare Pages | ビルドコマンド `npm run build`、出力 `dist`。SPA は自動対応のことが多い |

---

### 本番で確認すること

- 参加者用 URL（`/`）とダッシュボード用 URL（`/dashboard`）の両方で表示・遷移ができること。
- スマートフォンで開いて RESONATE ボタンが押せること（必要なら PWA 化も検討）。
