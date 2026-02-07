# Firebase 設定（全参加者のカウントを反映する場合）

別の端末・別の人がタップした数をダッシュボードの累計グラフに反映するには、**Firebase Realtime Database** を有効にし、環境変数を設定します。

---

## 1. Firebase プロジェクトを作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. **「プロジェクトを追加」** でプロジェクト名を入力（例: `ycm-resonance-logger`）して作成
3. プロジェクトの **「ビルド」→「Realtime Database」** を開く
4. **「データベースを作成」** をクリック
   - ロケーションを選択（例: `asia-northeast1`）
   - **本番モードで開始** を選ぶ（あとでルールを変更します）
5. 作成後、**「ルール」** タブを開き、次のように設定（誰でも読み書き可能・イベント用のため短時間利用を想定）:

```json
{
  "rules": {
    "resonance": {
      "taps": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**「公開する」** をクリック。

---

## 2. ウェブアプリを登録して設定を取得

1. Firebase コンソールの **「プロジェクトの設定」**（歯車アイコン）を開く
2. **「マイアプリ」** で **「</>」（ウェブ）** をクリック
3. アプリのニックネームを入力（例: `resonance-logger-web`）→ **「アプリを登録」**
4. 表示される **firebaseConfig** の値をメモする（後で使います）
5. **「Realtime Database」** の URL をメモする（例: `https://xxxx-default-rtdb.asia-northeast1.firebasedatabase.app`）

---

## 3. 環境変数を設定

1. プロジェクトのルートで `.env.example` をコピーして `.env` を作成
2. `.env` を開き、Firebase の値を埋める:

```env
VITE_FIREBASE_API_KEY=あなたのapiKey
VITE_FIREBASE_AUTH_DOMAIN=あなたのauthDomain
VITE_FIREBASE_DATABASE_URL=https://xxxx-default-rtdb.asia-northeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=あなたのprojectId
VITE_FIREBASE_STORAGE_BUCKET=あなたのstorageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=あなたのmessagingSenderId
VITE_FIREBASE_APP_ID=あなたのappId
```

3. 保存してから、開発サーバーを再起動: `npm run dev`

---

## 4. Vercel にデプロイする場合（必須）

本番で全参加者のカウントを反映するには、**Vercel に環境変数を設定する必要があります**。

1. Vercel のプロジェクトを開く → **「Settings」** → **「Environment Variables」**
2. 次の 7 つを **すべて** 追加する（名前は一字違いも不可）:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`（Realtime Database の URL）
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. **「Deployments」** に戻り、最新のデプロイの **「⋯」→「Redeploy」** を実行する。  
   ※ Vite はビルド時に環境変数を埋め込むため、**変数を追加・変更したあとは必ず Redeploy が必要**です。
4. ダッシュボードで **「現在の熱量」「累計」の横に「(全員)」** と表示されていれば、Firebase 接続済みです。「(デモ)」のままなら環境変数が未設定かビルド前の設定です。

---

## 動作の流れ

- **参加者画面**: ボタンを押すと、その端末のログ（localStorage）に加え、**Firebase の `resonance/taps` に 1 件追加**されます。
- **ダッシュボード**: **Firebase の `resonance/taps` をリアルタイム購読**し、全タップを時間で集計してグラフに表示します。  
  Firebase が未設定の場合は、これまでどおりデモ用モックまたはローカル保存データのみ表示されます。
