<script setup lang="ts">
import { stubGroupCheckService } from '@/local-government/master-editor/stub-service'
import { useMasterEditor } from '@/local-government/master-editor/useMasterEditor'
import GroupListTable from '@/local-government/master-editor/GroupListTable.vue'
import CreateGroupDialog from '@/local-government/master-editor/CreateGroupDialog.vue'
import EditGroupDialog from '@/local-government/master-editor/EditGroupDialog.vue'

// サンプルなので DI せずスタブを直接使う。差し替えたいときはここだけ変える
const service = stubGroupCheckService
const editor = useMasterEditor(service)
</script>

<template>
  <v-container>
    <h1 class="text-2xl font-bold">地公体グループ</h1>

    <GroupListTable
      class="mt-4"
      :groups="editor.list.filteredGroups.value"
      :loading="editor.list.loading.value"
      :condition="editor.list.condition.value"
      @update:condition="editor.list.condition.value = $event"
      @create="editor.openCreateDialog()"
      @edit="editor.openEditDialog($event)"
    />

    <CreateGroupDialog v-model="editor.createDialogOpen.value" :service="service" @created="editor.handleCreated()" />

    <EditGroupDialog
      :group="editor.editTarget.value"
      :service="service"
      @close="editor.closeEditDialog()"
      @saved="editor.handleSaved()"
      @deleted="editor.handleDeleted()"
    />
  </v-container>
</template>
