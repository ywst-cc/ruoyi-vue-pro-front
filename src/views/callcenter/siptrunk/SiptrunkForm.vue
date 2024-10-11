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
      <el-form-item label="线路名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入线路名称" />
      </el-form-item>
      <el-form-item label="线路号码" prop="no">
        <el-input v-model="formData.no" placeholder="请输入线路号码" />
      </el-form-item>
      <el-form-item label="前缀" prop="prefix">
        <el-input v-model="formData.prefix" placeholder="请输入前缀" />
      </el-form-item>
      <el-form-item label="呼叫地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入呼叫地址,例如: 12.34.56.78:5060" />
      </el-form-item>
      <el-form-item label="费率(单位:元)" prop="fee">
        <el-input v-model="formData.fee" placeholder="请输入费率" />
      </el-form-item>
      <el-form-item label="自动加0" prop="autoZero">
        <el-radio-group v-model="formData.autoZero">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="线路归属地" prop="areaCode">
        <el-input v-model="formData.areaCode" placeholder="请输入线路归属地" />
      </el-form-item>
      <el-form-item label="是否启用" prop="active">
        <el-radio-group v-model="formData.active">
          <el-radio :value="true">启用</el-radio>
          <el-radio :value="false">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { SiptrunkApi, SiptrunkVO } from '@/api/callcenter/siptrunk'
import * as TenantApi from "@/api/system/tenant";
import {TenantVO} from "@/api/system/tenant";

/** 外呼线路 表单 */
defineOptions({ name: 'SiptrunkForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const tenantList = ref<TenantVO[]>([]) // 租户列表

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  no: undefined,
  prefix: undefined,
  address: undefined,
  fee: undefined,
  autoZero: undefined,
  areaCode: undefined,
  active: undefined,
  tenantId: undefined,
  remark: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '线路名称不能为空', trigger: 'blur' }],
  no: [{ required: true, message: '线路号码不能为空', trigger: 'blur' }],
  autoZero: [{ required: true, message: '自动加0不能为空', trigger: 'blur' }],
  active: [{ required: true, message: '是否启用不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

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
      formData.value = await SiptrunkApi.getSiptrunk(id)
    } finally {
      formLoading.value = false
    }
  }

  // 加载租户列表
  tenantList.value = await TenantApi.getTenantList()

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
    const data = formData.value as unknown as SiptrunkVO
    if (formType.value === 'create') {
      await SiptrunkApi.createSiptrunk(data)
      message.success(t('common.createSuccess'))
    } else {
      await SiptrunkApi.updateSiptrunk(data)
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
    name: undefined,
    no: undefined,
    prefix: undefined,
    address: undefined,
    fee: undefined,
    autoZero: undefined,
    areaCode: undefined,
    active: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
