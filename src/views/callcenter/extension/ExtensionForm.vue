<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="租户编号" prop="tenantId">
        <el-select v-model="formData.tenantId" placeholder="请选择绑定租户" filterable>
          <el-option
            v-for="item in tenantList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分机号" prop="extension">
        <el-input v-model="formData.extension" placeholder="请输入分机号" />
      </el-form-item>
      <el-form-item label="分机密码" prop="password">
        <el-input type="password" show-password v-model="formData.password" placeholder="请输入分机密码" />
      </el-form-item>
      <el-form-item label="域" prop="domain">
        <el-input v-model="formData.domain" placeholder="请输入域" />
      </el-form-item>
      <el-form-item label="绑定用户" prop="ownerUserId">
        <el-select v-model="formData.ownerUserId" placeholder="请选择绑定用户" class="w-1/1">
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用" prop="active">
        <el-radio-group v-model="formData.active">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ExtensionApi, ExtensionVO } from '@/api/callcenter/extension'
import * as TenantApi from "@/api/system/tenant";
import {TenantVO} from "@/api/system/tenant";
import * as UserApi from '@/api/system/user'

/** CTI 分机 表单 */
defineOptions({ name: 'ExtensionForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  extension: undefined,
  password: undefined,
  domain: undefined,
  ownerUserId: undefined,
  tenantId: undefined,
  active: undefined
})
const formRules = reactive({
  extension: [{ required: true, message: '分机号不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '分机密码不能为空', trigger: 'blur' }],
  active: [{ required: true, message: '是否启用不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const tenantList = ref<TenantVO[]>([]) // 租户列表
const userOptions = ref<UserApi.UserVO[]>([]) // 用户列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ExtensionApi.getExtension(id)
    } finally {
      formLoading.value = false
    }
  }

  // 加载租户列表
  tenantList.value = await TenantApi.getTenantList()

  // 获得用户列表
  userOptions.value = await UserApi.getSimpleUserList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ExtensionVO
    if (formType.value === 'create') {
      await ExtensionApi.createExtension(data)
      message.success(t('common.createSuccess'))
    } else {
      await ExtensionApi.updateExtension(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    extension: undefined,
    password: undefined,
    domain: undefined,
    ownerUserId: undefined,
    tenantId: undefined,
    active: undefined
  }
  formRef.value?.resetFields()
}
</script>
