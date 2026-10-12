<script setup lang="ts">
import { ref } from 'vue'
import type { Group, GroupCheckService } from '@/local-government/master-editor/types'
import { useEditGroupForm } from '@/local-government/master-editor/useEditGroupForm'
import ConfirmDeleteDialog from '@/local-government/master-editor/ConfirmDeleteDialog.vue'

const props = defineProps<{
  group: Group
  service: GroupCheckService
  // 重複チェックに使う、ダイアログを開いた時点の一覧
  existingGroups: ReadonlyArray<Group>
}>()

const emit = defineEmits<{
  saved: []
  deleted: []
  cancel: []
}>()

// group は親から渡された時点で固定したいので、composable には props.group をそのまま渡す
// （親側で :key を付けて対象が変わったらマウントし直している）
const form = useEditGroupForm(props.service, props.group, props.existingGroups)

const confirmDeleteOpen = ref(false)

const openConfirmDelete = () => {
  form.clearDeleteError()
  confirmDeleteOpen.value = true
}

const submit = async () => {
  if (await form.submit()) {
    emit('saved')
  }
}

// 失敗したときは閉じない。エラーは確認ダイアログの中に出るのでそのまま見せる
const remove = async () => {
  if (await form.remove()) {
    confirmDeleteOpen.value = false
    emit('deleted')
  }
}
</script>

<template>
  <form id="editForm" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <!-- グループIDと市町村名は EditGroupPayload に含まれないので表示のみ -->
      <v-text-field :model-value="group.groupId" label="グループID" readonly disabled />
      <v-text-field :model-value="group.localGovernmentName" label="市町村名" readonly disabled />
      <!--
        組織IDの入力欄は新規登録フォームにも同じものがあるが、画面ごとに案内文が変わるので共通部品にしていない。
        共通なのは挙動（形式チェックとサーバーチェック）のほうで、それは useOrganizationCheck に寄せてある
      -->
      <div>
        <v-text-field
          v-model="form.organization.organizationId.value"
          class="organizationIdField"
          label="組織ID"
          placeholder="空にすると未設定に戻ります。入力する場合はUUID形式"
          :loading="form.organization.checking.value"
          :error-messages="[...form.organization.errorMessages.value]"
        />
        <!-- チェック済みであることが分かるように組織名を出す。未チェックのまま保存はできない -->
        <p v-if="form.organization.organizationName.value" class="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          {{ form.organization.organizationName.value }}
        </p>
      </div>
      <v-alert v-if="form.saveError.value" type="error" density="compact" class="mt-2">
        {{ form.saveError.value }}
      </v-alert>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <v-btn id="confirmDeleteButton" color="error" variant="outlined" @click="openConfirmDelete()">削除</v-btn>
      <div class="flex gap-2">
        <v-btn variant="text" @click="emit('cancel')">キャンセル</v-btn>
        <v-btn type="submit" color="primary" :disabled="!form.canSubmit.value" :loading="form.submitting.value">
          保存
        </v-btn>
      </div>
    </div>

    <ConfirmDeleteDialog
      v-model="confirmDeleteOpen"
      :group="group"
      :deleting="form.deleting.value"
      :error-message="form.deleteError.value"
      @confirm="remove"
    />
  </form>
</template>
