<script setup lang="ts">
import { SampleData } from '@/local-government/master-editor/sample-data'
import { stubGroupCheckService } from '@/local-government/master-editor/stub-service'
import { useMasterEditor } from '@/local-government/master-editor/useMasterEditor'
import GroupListTable from '@/local-government/master-editor/GroupListTable.vue'
import CreateGroupDialog from '@/local-government/master-editor/CreateGroupDialog.vue'
import EditGroupDialog from '@/local-government/master-editor/EditGroupDialog.vue'

// サンプルなので DI せずスタブを直接使う。差し替えたいときはここだけ変える
const service = stubGroupCheckService
// 金融機関マスタの出どころはこの画面に集める（下位は props / 引数で受け取るだけ）
const banks = SampleData.banks
const editor = useMasterEditor(service, banks[0].bankCode)
</script>

<template>
  <v-container>
    <h1 class="text-2xl font-bold">地公体グループ</h1>

    <GroupListTable
      v-model:bank-code="editor.list.bankCode.value"
      v-model:query="editor.list.query.value"
      class="mt-4"
      :banks="banks"
      :groups="editor.list.filteredGroups.value"
      :loading="editor.list.loading.value"
      @create="editor.openCreateDialog()"
      @edit="editor.openEditDialog($event)"
    />

    <!-- 選択中の金融機関がそのまま登録先になる -->
    <CreateGroupDialog
      v-model="editor.createDialogOpen.value"
      :service="service"
      :bank-code="editor.list.bankCode.value"
      @created="editor.handleCreated()"
    />

    <EditGroupDialog
      v-model="editor.editTarget.value"
      :service="service"
      @saved="editor.handleEditDone()"
      @deleted="editor.handleEditDone()"
    />
  </v-container>
</template>
