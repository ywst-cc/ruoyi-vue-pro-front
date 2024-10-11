import request from '@/config/axios'

// 外呼线路 VO
export interface SiptrunkVO {
  id: number // 主键
  name: string // 线路名称
  no: string // 线路号码
  prefix: string // 前缀
  address: string // 呼叫地址
  fee: number // 费率
  autoZero: boolean // 自动加0
  areaCode: string // 线路归属地
  active: boolean // 是否启用
  remark: string // 备注
}

// 外呼线路 API
export const SiptrunkApi = {
  // 查询外呼线路分页
  getSiptrunkPage: async (params: any) => {
    return await request.get({ url: `/callcenter/siptrunk/page`, params })
  },

  // 查询外呼线路详情
  getSiptrunk: async (id: number) => {
    return await request.get({ url: `/callcenter/siptrunk/get?id=` + id })
  },

  // 新增外呼线路
  createSiptrunk: async (data: SiptrunkVO) => {
    return await request.post({ url: `/callcenter/siptrunk/create`, data })
  },

  // 修改外呼线路
  updateSiptrunk: async (data: SiptrunkVO) => {
    return await request.put({ url: `/callcenter/siptrunk/update`, data })
  },

  // 修改外呼线路主配置
  updateSiptrunkMaster: async (id: number) => {
    return await request.put({ url: `/callcenter/siptrunk/update-master?id=` + id })
  },

  // 删除外呼线路
  deleteSiptrunk: async (id: number) => {
    return await request.delete({ url: `/callcenter/siptrunk/delete?id=` + id })
  },

  // 导出外呼线路 Excel
  exportSiptrunk: async (params) => {
    return await request.download({ url: `/callcenter/siptrunk/export-excel`, params })
  }
}
