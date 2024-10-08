import request from '@/config/axios'

// CTI 分机 VO
export interface ExtensionVO {
  id: number // 主键
  extension: string // 分机号
  password: string // 分机密码
  domain: string // 域
  ownerUserId: number // 所属用户ID
  tenantId: number // 租户编号
  active: boolean // 是否启用
}

// CTI 分机 API
export const ExtensionApi = {
  // 查询CTI 分机分页
  getExtensionPage: async (params: any) => {
    return await request.get({ url: `/callcenter/extension/page`, params })
  },

  // 查询CTI 分机详情
  getExtension: async (id: number) => {
    return await request.get({ url: `/callcenter/extension/get?id=` + id })
  },

  // 新增CTI 分机
  createExtension: async (data: ExtensionVO) => {
    return await request.post({ url: `/callcenter/extension/create`, data })
  },

  // 修改CTI 分机
  updateExtension: async (data: ExtensionVO) => {
    return await request.put({ url: `/callcenter/extension/update`, data })
  },

  // 删除CTI 分机
  deleteExtension: async (id: number) => {
    return await request.delete({ url: `/callcenter/extension/delete?id=` + id })
  },

  // 导出CTI 分机 Excel
  exportExtension: async (params) => {
    return await request.download({ url: `/callcenter/extension/export-excel`, params })
  }
}