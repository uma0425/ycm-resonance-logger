# Vercel で Resonance Logger をデプロイする手順

このドキュメントでは、Resonance Logger を **Vercel** に無料でデプロイする方法を、初めての人でも迷わないように順番に説明します。

---

## 事前に用意するもの

- **GitHub アカウント**（まだの場合は [github.com](https://github.com) で無料作成）
- **このプロジェクト**（`resonance-logger` フォルダ）

---

## ステップ 0: Git をインストールする（「git は認識されません」と出た場合）

PowerShell で `git` と打ったときに **「用語 'git' は認識されません」** と出る場合は、PC に Git が入っていません。次の手順でインストールします。

### 0-1. Git for Windows をダウンロード

1. ブラウザで **[https://git-scm.com/download/win](https://git-scm.com/download/win)** を開く
2. ダウンロードが自動で始まります（「64-bit Git for Windows Setup」など）
3. ダウンロードした **.exe** ファイルを実行する

### 0-2. インストール中の設定

- 画面の指示に従って **「Next」** で進めて大丈夫です
- **「Adjusting your PATH environment」** の画面では、  
  **「Git from the command line and also from 3rd-party software」** が選ばれていることを確認して **Next**
- あとは既定のまま **Next** → 最後に **Install** → **Finish**

### 0-3. PowerShell をやり直す

- **いま開いている PowerShell は一度閉じてください**
- **新しい PowerShell**（または「ターミナル」）を開く
- 次のコマンドで、Git が使えるか確認する：

```powershell
git --version
```

`git version 2.x.x` のように表示されれば OK です。ここから **ステップ 1** に進んでください。

---

## ステップ 1: プロジェクトを GitHub に上げる

Vercel は「GitHub のリポジトリ」からデプロイするため、まずこのプロジェクトを GitHub に push します。

### 1-1. GitHub で新しいリポジトリを作る

1. [https://github.com](https://github.com) にログインする
2. 右上の **「+」** → **「New repository」** をクリック
3. 次のように入力する：
   - **Repository name**: `resonance-logger`（任意の名前でOK）
   - **Public** を選択
   - **「Add a README file」** は **チェックしない**（既に README があるため）
4. **「Create repository」** をクリックする
5. 作成後、**「…or push an existing repository from the command line」** と書いてある部分のコマンドをあとで使います（まだ実行しなくてOK）

### 1-2. 自分の PC で Git を初期化して push する

**PowerShell** または **コマンドプロンプト** を開き、次のコマンドを **プロジェクトのフォルダで** 順に実行します。

```powershell
cd "c:\Users\y-kosaku\Documents\Obsidian Vault\.obsidian\MySecondBrain\resonance-logger"
```

まだ Git を使っていない場合：

```powershell
git init
git add .
git commit -m "Initial commit: Resonance Logger"
```

GitHub にリポジトリを作ったときの画面に、次のような 2 行が表示されています（`YOUR_USERNAME` はあなたの GitHub のユーザー名に置き換わります）：

```powershell
git remote add origin https://github.com/YOUR_USERNAME/resonance-logger.git
git branch -M main
git push -u origin main
```

**同じように**、あなたのリポジトリの URL を使って実行します。例：

```powershell
git remote add origin https://github.com/YOUR_USERNAME/resonance-logger.git
git branch -M main
git push -u origin main
```

初回の `git push` で GitHub のユーザー名とパスワード（または Personal Access Token）を聞かれたら入力します。

ここまでで、**GitHub のリポジトリにコードがアップロードされた状態**になります。

---

## ステップ 2: Vercel にサインアップ / ログイン

1. ブラウザで **[https://vercel.com](https://vercel.com)** を開く
2. 右上の **「Sign Up」** または **「Log In」** をクリック
3. **「Continue with GitHub」** を選ぶ
4. 表示に従って GitHub の認証（許可）を行う
5. 初めての場合は「Import Git Repository」などの画面に進みます

---

## ステップ 3: プロジェクトを Vercel にインポートする

1. Vercel のダッシュボードで **「Add New…」** → **「Project」** をクリック
2. **「Import Git Repository」** の一覧に、GitHub のリポジトリが表示されます  
   - 表示されない場合は **「Configure GitHub App」** などで、Vercel にリポジトリへのアクセスを許可する
3. **「resonance-logger」**（または付けた名前）の横の **「Import」** をクリック

---

## ステップ 4: ビルド設定を確認する

次の画面で、設定が次のようになっているか確認します。**多くの場合はそのままで問題ありません。**

| 項目 | 設定値 | 説明 |
|------|--------|------|
| **Framework Preset** | Vite | 自動検出されている場合はそのまま |
| **Build Command** | `npm run build` | そのまま |
| **Output Directory** | `dist` | そのまま |
| **Install Command** | `npm install` | そのまま |

- **Root Directory** は空欄のままでOK（プロジェクトのルートがリポジトリのルート）
- **Environment Variables** は、このアプリでは基本的に不要です（何も追加しなくてOK）

確認できたら、**「Deploy」** をクリックします。

---

## ステップ 5: デプロイが完了するまで待つ

1. 画面上でビルドの進行が表示されます（1〜3 分程度かかることがあります）
2. **「Building」** が **「Ready」** になればデプロイ完了です
3. **「Visit」** または **「Go to Dashboard」** のリンクが表示されます

---

## ステップ 6: 公開 URL を確認する

1. デプロイが完了したら、**「Visit」** をクリックしてサイトを開く
2. アドレスバーの URL が **本番のアドレス** です  
   - 例: `https://resonance-logger-xxxx.vercel.app`
3. 次の 2 つがどちらも開けるか確認してください：
   - **参加者画面**: `https://あなたのURL.vercel.app/`
   - **ダッシュボード**: `https://あなたのURL.vercel.app/dashboard`

---

## よくある質問

### Q. コードを直したあと、再デプロイしたい

GitHub のリポジトリに push すると、Vercel が自動で再ビルド・再デプロイします。

```powershell
cd "c:\Users\y-kosaku\Documents\Obsidian Vault\.obsidian\MySecondBrain\resonance-logger"
git add .
git commit -m "更新内容のメモ"
git push
```

Vercel のダッシュボードの「Deployments」で、新しいデプロイの状態を確認できます。

### Q. 独自ドメイン（自分の URL）を使いたい

Vercel のプロジェクト画面で **「Settings」** → **「Domains」** から、取得したドメインを追加できます（無料プランでも利用可能です）。

### Q. ビルドに失敗する

- Vercel の「Deployments」で失敗したデプロイを開き、**「Building」** のログを確認する
- ログに表示されるエラーに従って、`npm run build` がローカルで成功するか確認する  
  - ローカルで `npm run build` が通れば、多くの場合は Vercel でも通ります

---

## まとめ

1. プロジェクトを **GitHub のリポジトリ** に push する  
2. **Vercel** に GitHub でログインする  
3. **「Add New」→「Project」** でリポジトリを **Import** する  
4. **Build Command**: `npm run build`、**Output Directory**: `dist` を確認して **Deploy**  
5. 表示された **URL** で参加者画面とダッシュボードの両方にアクセスできるか確認する  

ここまでできれば、Resonance Logger のデプロイは完了です。
