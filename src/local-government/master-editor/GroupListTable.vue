<script setup lang="ts">
import type { Bank, Group, SearchCondition } from '@/local-government/master-editor/types'

defineProps<{
  // 金融機関の選択肢は本来サーバー由来のマスタなので、ここでは受け取るだけにする
  banks: ReadonlyArray<Bank>
  groups: ReadonlyArray<Group>
  loading: boolean
}>()

const emit = defineEmits<{
  create: []
  edit: [group: Group]
}>()

// 検索条件は親と双方向に持つ（親は v-model:condition で渡す）。
// defineModel が返す ref は書き換えてよいので、props のときのような emit し直しが要らない
const condition = defineModel<SearchCondition>('condition', { required: true })

// 条件は 1 つのオブジェクトなので、変えた項目だけ差し替える
const updateCondition = (patch: Partial<SearchCondition>) => {
  condition.value = { ...condition.value, ...patch }
}

const headers = [
  { title: 'グループID', key: 'groupId' },
  { title: '市町村名', key: 'localGovernmentName' },
  { title: '組織ID', key: 'organizationId' },
]
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="flex flex-wrap items-center gap-4">
        <v-btn id="createButton" color="primary" prepend-icon="mdi-plus" @click="emit('create')">新規登録</v-btn>
        <v-select
          id="bankCodeSelect"
          :model-value="condition.bankCode"
          :items="banks"
          item-title="name"
          item-value="bankCode"
          label="金融機関"
          density="compact"
          hide-details
          class="max-w-60"
          @update:model-value="updateCondition({ bankCode: $event })"
        />
        <v-text-field
          id="queryField"
          :model-value="condition.query"
          label="絞り込み"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          clearable
          hide-details
          class="max-w-80"
          @update:model-value="updateCondition({ query: $event ?? '' })"
        />
      </div>
    </v-card-text>

    <v-data-table
      id="listTable"
      :headers="headers"
      :items="groups"
      :loading="loading"
      item-value="groupId"
      no-data-text="該当するグループがありません"
    >
      <template #[`item.groupId`]="{ item }">
        <!-- 編集はグループID列のリンク風ボタンから開く。見た目はリンクでも押せる要素なので v-btn で作る -->
        <v-btn
          class="editButton px-0 underline"
          variant="text"
          color="primary"
          density="comfortable"
          :data-test-id="`editButton-${item.groupId}`"
          @click="emit('edit', item)"
        >
          {{ item.groupId }}
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>
