# ノノグラムパズルゲーム (Nonogram Puzzle Game)

A full-stack nonogram (Picross) puzzle game application, built with a modern serverless stack on Cloudflare.

**✨ Live Demo: [https://nono.watahaizian.com](https://nono.watahaizian.com)**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 概要 (Overview)

このプロジェクトは、ノノグラム（お絵かきロジック）を遊べるWebアプリケーションです。ユーザーはパズルを解いてイラストを完成させることができます。また、将来的には自分でパズルを作成・投稿できる機能も目指しています。

モダンなWeb技術（React, Hono, Cloudflare）を駆使し、フロントエンドからバックエンド、データベース、認証、デプロイまで、フルスタックなWebアプリケーション開発の練習として作成しました。

## 主な機能 (Features)

-   🔐 **ユーザー認証**: Clerkを利用した、安全なサインアップ・ログイン機能。
-   🧩 **パズルゲームプレイ**: 用意されたノノグラムパズルをプレイ可能。
-   🎨 **パズルエディタ**: （将来的に）自分でパズルを作成し、投稿する機能。
-   ⚡ **高速な動作**: Cloudflare Workers上で動作するAPIと、Viteでビルドされた高速なフロントエンド。

## 技術スタック (Technology Stack)

| カテゴリ           | 技術                                                                |
| :----------------- | :------------------------------------------------------------------ |
| **フロントエンド** | `React`, `TypeScript`, `Vite`, `Tailwind CSS`, `React Router`       |
| **バックエンド**   | `Cloudflare Workers`, `Hono`, `TypeScript`                          |
| **データベース**   | `Cloudflare D1` (SQL)                                               |
| **認証**           | `Clerk`                                                             |
| **開発ツール**     | `pnpm Workspaces` (モノレポ), `Biome`, `Git`, `GitHub`                |

## ローカル環境での実行 (Getting Started)

### 前提条件
-   Node.js (v18 or later)
-   pnpm

### インストールと実行
1.  **リポジトリをクローン**
    ```bash
    git clone <このリポジトリのURL>
    cd nono-app
    ```

2.  **依存パッケージをインストール**
    ```bash
    pnpm install
    ```

3.  **開発用の環境変数を設定**
    `packages/backend`フォルダに`.dev.vars`という名前のファイルを作成し、Clerkの開発用キーを設定します。
    ```ini
    # packages/backend/.dev.vars
    CLERK_SECRET_KEY="sk_test_..."
    ```
    また、`packages/frontend/.env.local`を作成し、ClerkのPublishable Keyを設定します。
    ```ini
    # packages/frontend/.env.local
    VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
    ```

4.  **ローカルデータベースのセットアップ**
    ```bash
    pnpm --filter backend exec -- wrangler d1 execute puzzle-db --file=./packages/backend/migrations/0001_初回マイグレーション.sql --local
    ```

5.  **開発サーバーを起動**
    ```bash
    pnpm dev
    ```
    -   フロントエンド: `http://localhost:5173`
    -   バックエンド: `http://localhost:8787`

## デプロイ (Deployment)

このプロジェクトは、`pnpm run deploy`コマンド一発で、フロントエンドのビルドからCloudflare Workersへのデプロイまでが自動的に行われます。

デプロイ前に、Cloudflareの管理画面で本番用の環境変数とシークレットが設定されていることを確認してください。

1.  **Secret Keyの設定 (初回のみ)**
    ```bash
    pnpm --filter backend exec -- wrangler secret put CLERK_SECRET_KEY
    ```
    (Clerkの本番用Secret Keyを入力)

2.  **Publishable Keyの設定**
    `wrangler.jsonc`の`vars`に、`CLERK_PUBLISHABLE_KEY`として本番用のキーを設定します。

3.  **デプロイ実行**
    ```bash
    pnpm run deploy
    ```

## ライセンス (License)

This project is licensed under the MIT License.
