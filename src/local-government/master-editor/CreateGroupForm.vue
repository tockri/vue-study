<script setup lang="ts">
import type { GroupCheckService } from '@/local-government/master-editor/types'
import { useCreateGroupForm } from '@/local-government/master-editor/useCreateGroupForm'

const props = defineProps<{
  service: GroupCheckService
  // 登録先の金融機関。一覧で選択中のものがそのまま登録先になる
  bankCode: string
}>()

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const form = useCreateGroupForm(props.service, props.bankCode)

const submit = async () => {
  if (await form.submit()) {
    emit('created')
  }
}
</script>

<template>
  <!-- v-form は使わない。検証ルールと「送信できるか」は composable 側に置いてテストしやすくしている -->
  <form id="createForm" @submit.prevent="submit">
    <div class="flex flex-col gap-2">
      <v-text-field
        v-model="form.groupId.model.value"
        label="グループID"
        class="groupIdField"
        :error-messages="[...form.groupId.errorMessages.value]"
      />
      <v-text-field
        v-model="form.localGovernmentName.model.value"
        label="市町村名"
        class="localGovernmentNameField"
        :error-messages="[...form.localGovernmentName.errorMessages.value]"
      />
      <!--
        組織IDの入力欄は編集フォームにも同じものがあるが、画面ごとに案内文が変わるので共通部品にしていない。
        共通なのは挙動（形式チェックとサーバーチェック）のほうで、それは useOrganizationCheck に寄せてある
      -->
      <div>
        <v-text-field
          v-model="form.organization.organizationId.value"
          class="organizationIdField"
          label="組織ID"
          placeholder="空のままでも登録できます。入力する場合はUUID形式"
          :loading="form.organization.checking.value"
          :error-messages="[...form.organization.errorMessages.value]"
        />
        <!-- チェック済みであることが分かるように組織名を出す。未チェックのまま登録はできない -->
        <p v-if="form.organization.organizationName.value" class="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          {{ form.organization.organizationName.value }}
        </p>
      </div>
      <v-alert v-if="form.errorMessage.value" type="error" density="compact" class="mt-2">
        {{ form.errorMessage.value }}
      </v-alert>
    </div>
    <div class="mt-4 flex justify-end gap-2">
      <v-btn variant="text" @click="emit('cancel')">キャンセル</v-btn>
      <v-btn type="submit" color="primary" :disabled="!form.canSubmit.value" :loading="form.submitting.value">
        登録
      </v-btn>
    </div>
  </form>
</template>
