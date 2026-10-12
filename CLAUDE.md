# vue-study

Vue 3 + Vite の学習用プロジェクト。UI は **Vuetify 3 + Tailwind CSS v4 の併用**構成。

## コマンド

パッケージマネージャは **bun**（`bun.lock`）。npm / yarn は使わない。

```sh
bun dev            # 開発サーバー
bun run build      # type-check + 本番ビルド
bun test:unit      # Vitest（watch。CI 用途は bun test:unit --run）
bun run type-check # vue-tsc --build
bun lint           # oxlint --fix → eslint --fix
bun format         # prettier --write src/
```

変更後の確認は `bun run type-check` → `bun test:unit --run` → `bun lint` の順。

## 構成

```
src/
├── main.ts            # tailwind.css を最初に import → router → vuetify
├── App.vue            # VApp > VMain > RouterView のみ
├── router/index.ts    # ルート定義（routes 配列に追記していく）
├── plugins/vuetify.ts # createVuetify（theme.layers / display.thresholds）
├── styles/
│   ├── tailwind.css   # Tailwind のレイヤー割り当て・@custom-variant・@theme
│   └── settings.scss  # Vuetify SASS 変数（$utilities: false 等）
└── <feature>/         # 機能ごとのディレクトリ（例: home/HomeView.vue）
public/layers.css      # @layer の優先順位を固定。index.html で最初に読む
```

- ページ/コンポーネントは **機能ごとのディレクトリ**に置く（`src/components/` に集約しない）。例: `src/home/HomeView.vue`。
- `@/` は `src/` のエイリアス（vite.config.ts）。**import は相対パスを使わず常に `@/` で書く。**

## 規約

- SFC は必ず `<script setup lang="ts">`。`<script>` → `<template>` → `<style>` の順。
- scriptのロジックはcomposableとして別ファイル（*.ts）に記述し、単体テストをしやすくする。
- Vuetify コンポーネントは **kebabu-case で参照**（`<VBtn>`ではなく`<v-btn>`）。`vite-plugin-vuetify` の `autoImport: true` が効くので import 不要。
- 各featureディレクトリのView.vueファイルはrouterから参照する大元のコンポーネント。同ディレクトリの別のvueファイルに単一責務になり、凝集度が高くなるように分割して構成する。
- Prettier: セミコロンなし / シングルクォート / `printWidth: 120`。手で整形せず `bun format` に任せる。
- コメントは日本語。「何を」ではなく**なぜそうなっているか**を書く（既存コメントの書き方に合わせる）。
- ライブラリの API を使うときは記憶で書かず context7 で現行ドキュメントを確認する（Vue 3.5 / Vuetify 3 / Tailwind v4 / vue-router 5 と新しめのバージョンを使っている）。

## 注意

- **スタイリングの役割分担には意図がある**。触る前に `.claude/skills/styling/SKILL.md` を読むこと。要点だけ言うと、ユーティリティと色は Tailwind、コンポーネントは Vuetify、レイヤー順は `public/layers.css` 固定。
