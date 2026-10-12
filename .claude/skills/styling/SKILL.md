---
name: styling
description: このプロジェクトで CSS / クラス / テーマ / レスポンシブに関わる変更をするときに読む。Vuetify 3 と Tailwind v4 を併用しているため役割分担とカスケードレイヤーの決まりがあり、知らずに書くと「クラスが効かない」「ダークモードが切り替わらない」が起きる。styles/ 配下、settings.scss、tailwind.css、public/layers.css、vuetify.ts の theme / display を触るとき、またブレークポイント・テーマ色・ユーティリティクラスを追加するときに適用。
---

# Vuetify + Tailwind 併用のルール

この組み合わせはクラス名とリセット CSS が衝突する。それを避けるための設定が各所に入っているので、
以下の役割分担を崩さないこと。

## 役割分担

| 用途 | 担当 | 例 |
|---|---|---|
| コンポーネント | Vuetify | `<VBtn>`, `<VContainer>`, `<VDialog>` |
| ユーティリティ（余白・文字・flex・角丸） | **Tailwind** | `mt-4`, `text-2xl`, `rounded-full` |
| 色パレット | **Tailwind** | `text-sky-700`, `bg-slate-100` |
| テーマ色（primary 等） | Vuetify | `color="primary"` prop、`bg-primary` クラス |

Vuetify 側はこれに合わせて `src/styles/settings.scss` で無効化してある:

- `$utilities: false` — Vuetify のユーティリティを出力しない（`rounded` / `text-center` 等の重複回避）
- `$color-pack: false` — Vuetify の色クラスを出力しない

**この 2 つを true に戻さない。** 戻すと Tailwind のクラスと名前が衝突して、どちらが勝つかが読み込み順依存になる。

## カスケードレイヤー

優先順位は `public/layers.css` で宣言済み（後ろが強い）:

```css
@layer tailwind-theme, vuetify, tailwind-utilities;
```

- Vuetify のコンポーネント CSS は JS から動的に読まれるため読み込み順が安定しない。だから順序をこのファイルで固定している。
- そのため `public/layers.css` は `index.html` で**他のどのスタイルより先に** `<link>` する。この行を動かさない。
- `tailwind.css` では `tailwindcss/theme` → `layer(tailwind-theme)`、`tailwindcss/utilities` → `layer(tailwind-utilities)` に割り当てている。
- Vuetify 側は `settings.scss` / `vuetify.ts` の `layers: true` で `vuetify.*` レイヤーに出力される。
- **Tailwind の preflight は入れていない。** Vuetify が自前のリセットを持っており二重に当たるため。追加しないこと。

新しいグローバル CSS を足すときは、どのレイヤーに入るかを決めてから書く。レイヤー無指定の CSS は全レイヤーより強くなるので、安易に使わない。

## ダークモード

Vuetify はテーマ切り替えに `.dark` ではなく `.v-theme--dark` / `.v-theme--light` を使う。
`tailwind.css` でこれを Tailwind の variant に橋渡ししてある:

```css
@custom-variant light (&:where(.v-theme--light, .v-theme--light *));
@custom-variant dark  (&:where(.v-theme--dark,  .v-theme--dark  *));
```

→ テンプレートでは通常どおり `dark:bg-slate-900` と書けばよい。`class="dark"` を自前で付けない。
テーマの切り替えは Vuetify の `useTheme()` 経由で行う。

## ブレークポイント

**3 箇所に同じ値が書かれている。変えるときは必ず全部揃える。**

1. `src/styles/settings.scss` の `$grid-breakpoints`
2. `src/plugins/vuetify.ts` の `display.thresholds`
3. `src/styles/tailwind.css` の `@theme` 内 `--breakpoint-*`

値: `xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920, xxl: 2560`（Vuetify の既定に合わせている）

`tailwind.css` では `--breakpoint-*: initial;` で Tailwind の既定ブレークポイント（sm:640px 等）を消してから再定義している。この行を消すと Tailwind と Vuetify の `md:` がズレる。

また `vuetify.ts` の `display.mobileBreakpoint: 'md'` は Vuetify コンポーネントがモバイル表示に切り替わる閾値。これはブレークポイント値とは別の設定。

## 確認

スタイルを変えたら `bun dev` で実際の描画を確認する。型チェックやテストではレイヤー順の崩れは検出できない。
