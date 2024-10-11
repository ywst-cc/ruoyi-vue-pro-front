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
      <el-form-item label="话单ID" prop="callId">
        <el-input
          v-model="queryParams.callId"
          placeholder="请输入话单ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="主叫号码" prop="caller">
        <el-input
          v-model="queryParams.caller"
          placeholder="请输入主叫号码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="被叫号码" prop="callee">
        <el-input
          v-model="queryParams.callee"
          placeholder="请输入被叫号码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="呼叫时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
<!--      <el-form-item label="是否接通" prop="answered">-->
<!--        <el-select-->
<!--          v-model="queryParams.answered"-->
<!--          placeholder="请选择是否接通"-->
<!--          clearable-->
<!--          class="!w-240px"-->
<!--        >-->
<!--          <el-option label="请选择字典生成" value="" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['callcenter:cdr:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" >
      <el-table-column label="租户" fixed="left" align="center" prop="tenantName" width="180" />
      <el-table-column label="坐席" fixed="left" align="center" prop="nickname" width="120" />
      <el-table-column label="主叫号码" fixed="left" align="center" prop="caller" width="150" />
      <el-table-column label="被叫号码" fixed="left" align="center" prop="callee" width="150" />
      <el-table-column label="话单ID" align="center" prop="callId" width="300" />
      <el-table-column label="线路号码" align="center" prop="pstn" width="150" />
      <el-table-column label="归属地" align="center" prop="areaCode" />
      <el-table-column
        label="呼叫开始时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="被叫振铃时间"
        align="center"
        prop="ringTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="被叫应答时间"
        align="center"
        prop="answerTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="被叫挂机时间"
        align="center"
        prop="endTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="通话时长(秒)" align="center" prop="billSec" width="120" />
      <el-table-column label="通话时长(分)" align="center" prop="billMin" width="120" />
      <el-table-column label="振铃时长(秒)" align="center" prop="ringSec" width="120" />
<!--      <el-table-column label="持续时长" align="center" prop="duration" />-->
      <el-table-column label="是否接通" align="center" prop="answered" >
        <template #default="scope">
          {{ scope.row.answered ? '接通' : '未接通' }}
        </template>
      </el-table-column>
<!--      <el-table-column label="录音文件" align="center" prop="recordFile" />-->
      <el-table-column label="计费金额(元)" align="center" prop="price" width="120" />
      <el-table-column label="业务透传" align="center" prop="extra" width="100" :show-overflow-tooltip="true" />
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
  <CdrForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { CdrApi, CdrVO } from '@/api/callcenter/cdr'
import {TenantVO} from "@/api/system/tenant";
import * as TenantApi from "@/api/system/tenant";

/** 话务数据 列表 */
defineOptions({ name: 'Cdr' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const tenantList = ref<TenantVO[]>([]) // 租户列表

const loading = ref(true) // 列表的加载中
const list = ref<CdrVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  callId: undefined,
  caller: undefined,
  callee: undefined,
  startTime: [],
  answered: undefined,
  tenantId: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CdrApi.getCdrPage(queryParams)
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

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CdrApi.exportCdr(queryParams)
    download.excel(data, '话务数据.xls')
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
