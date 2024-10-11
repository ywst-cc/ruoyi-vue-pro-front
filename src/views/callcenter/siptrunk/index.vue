<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="绑定租户" prop="tenantId">
        <el-select
          v-model="queryParams.tenantId"
          placeholder="请选择绑定租户"
          filterable
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in tenantList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="线路名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入线路名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="线路号码" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入线路号码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
<!--      <el-form-item label="是否启用" prop="active">-->
<!--        <el-select-->
<!--          v-model="queryParams.active"-->
<!--          placeholder="请选择是否启用"-->
<!--          clearable-->
<!--          class="!w-240px"-->
<!--        >-->
<!--          <el-option label="请选择字典生成" value="" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['callcenter:siptrunk:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['callcenter:siptrunk:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" >
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="所属租户" align="center" prop="tenantName" />
      <el-table-column label="线路名称" align="center" prop="name" width="150" />
      <el-table-column label="线路号码" align="center" prop="no" width="150" />
      <el-table-column label="前缀" align="center" prop="prefix" />
      <el-table-column label="呼叫地址" align="center" prop="address" width="200" />
      <el-table-column label="费率(元)" align="center" prop="fee" />
      <el-table-column label="自动加0" align="center" prop="autoZero" >
        <template #default="scope">
          <el-tag v-if="scope.row.autoZero" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="归属地" align="center" prop="areaCode" />
      <el-table-column label="主配置" align="center" prop="primary">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.master" />
        </template>
      </el-table-column>
      <el-table-column label="是否启用" align="center" prop="active" >
        <template #default="scope">
          <el-tag v-if="scope.row.active" type="success">启用</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" fixed="right" align="center" width="180px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['callcenter:siptrunk:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="scope.row.master"
            @click="handleMaster(scope.row.id)"
            v-hasPermi="['callcenter:siptrunk:update']"
          >
            主配置
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['callcenter:siptrunk:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <SiptrunkForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { SiptrunkApi, SiptrunkVO } from '@/api/callcenter/siptrunk'
import SiptrunkForm from './SiptrunkForm.vue'
import * as TenantApi from "@/api/system/tenant";
import {TenantVO} from "@/api/system/tenant";
import {DICT_TYPE} from "@/utils/dict";

/** 外呼线路 列表 */
defineOptions({ name: 'Siptrunk' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const tenantList = ref<TenantVO[]>([]) // 租户列表

const loading = ref(true) // 列表的加载中
const list = ref<SiptrunkVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  no: undefined,
  active: undefined,
  createTime: [],
  tenantId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SiptrunkApi.getSiptrunkPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await SiptrunkApi.deleteSiptrunk(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 主配置按钮操作 */
const handleMaster = async (id) => {
  try {
    await message.confirm('是否确认修改配置编号为"' + id + '"的数据项为主配置?')
    await SiptrunkApi.updateSiptrunkMaster(id)
    message.success(t('common.updateSuccess'))
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await SiptrunkApi.exportSiptrunk(queryParams)
    download.excel(data, '外呼线路.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await getList()

  // 加载租户列表
  tenantList.value = await TenantApi.getTenantList()
})
</script>
