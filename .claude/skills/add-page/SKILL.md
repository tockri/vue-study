---
name: add-page
description: このプロジェクトに新しい画面（ページ）やルートを追加するときの手順。「〜ページを作って」「〜画面を追加」「ルートを追加」「/foo でアクセスできるようにして」といった依頼で適用。ファイルの置き場所、router への登録、Vuetify のレイアウト、テストの最小形をまとめてある。
---

# ページの追加手順

## 1. 置き場所を決める

機能ごとのディレクトリを `src/` 直下に作り、その中に `<Name>View.vue` を置く。
`src/components/` や `src/views/` にまとめない（既存は `src/home/HomeView.vue`）。

```
src/settings/SettingsView.vue      # /settings
src/users/UsersView.vue            # /users
src/users/UserDetailView.vue       # /users/:id
src/users/UserCard.vue             # そのページ専用の部品も同じディレクトリに
```

複数ページで使い回す部品が出てきたら、その時点で `src/components/` に出す。先に作らない。

## 2. コンポーネントを書く

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <VContainer>
    <h1 class="text-2xl font-bold">タイトル</h1>
  </VContainer>
</template>
```

- `<script setup lang="ts">` 必須。
- Vuetify コンポーネントは PascalCase（`<VContainer>`）。`autoImport: true` なので import しない。
- ページの最外殻は `VContainer`（全幅にしたいときは `<VContainer fluid>`）。`VApp` / `VMain` は `App.vue` にあるので重ねない。
- 余白・文字サイズ・色は Tailwind のクラスで書く。詳しくは `.claude/skills/styling/SKILL.md`。

## 3. router に登録する

`src/router/index.ts` の `routes` 配列に追記する。

```ts
import SettingsView from '@/settings/SettingsView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/settings', name: 'Settings', component: SettingsView },
]
```

- `name` は PascalCase。
- import は常に `@/` エイリアスで書く（相対パスは使わない。`src/` 配下は統一済み）。
- ページが増えてきたら遅延ロードに切り替える: `component: () => import('@/settings/SettingsView.vue')`。

## 4. ナビゲーションを足す（必要なら）

リンクは `RouterLink` を使う。Vuetify のボタンから飛ばすなら `<VBtn :to="{ name: 'Settings' }">`
（`to` を渡すと VBtn が内部で RouterLink になる）。

## 5. テスト

ページ単位のテストは任意だが、書くなら対象ファイルの隣に `<Name>View.spec.ts` を置く。
Vuetify コンポーネントを含むため、マウント時に vuetify プラグインが必要。

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import vuetify from '@/plugins/vuetify'
import SettingsView from './SettingsView.vue'

describe('SettingsView', () => {
  it('タイトルを表示する', () => {
    const wrapper = mount(SettingsView, { global: { plugins: [vuetify] } })
    expect(wrapper.text()).toContain('タイトル')
  })
})
```

router に依存するページ（`useRoute` / `useRouter` を使う）は `createRouter` をテスト内で組むか、
`global.mocks` でモックする。

## 6. 確認

```sh
bun run type-check
bun test:unit --run
bun lint
```

見た目の確認が必要なら `bun dev` を立ち上げて該当パスを開く。
