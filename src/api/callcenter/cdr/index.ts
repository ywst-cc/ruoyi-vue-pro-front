import request from '@/config/axios'

// 话务数据 VO
export interface CdrVO {
  id: number // 主键
  callId: string // 话单ID
  callerUuid: string // 主叫uuid
  calleeUuid: string // 被叫uuid
  caller: string // 主叫号码
  callee: string // 被叫号码
  pstn: string // 线路号码
  otherPstn: string // 备用线路号码
  direction: string // 呼叫方向
  calltype: string // 呼叫类型
  startTime: Date // 呼叫开始时间
  ringTime: Date // 被叫振铃时间
  answerTime: Date // 被叫应答时间
  endTime: Date // 被叫挂机时间
  ivrTime: Date // 进入IVR时间
  acdTime: Date // 进入ACD时间
  billSec: number // 通话时长(秒)
  billMin: number // 通话时长（分）
  ringSec: number // 振铃时长
  duration: number // 持续时长
  answered: boolean // 是否接通
  userId: number // 呼叫坐席
  recordFile: string // 录音文件
  areaCode: string // 被叫归属地
  extra: string // 业务透传字段
  fee: number // 计费费率
  price: number // 计费金额
  siptrunkId: number // 线路ID
  tenantId: number // 租户ID
}

// 话务数据 API
export const CdrApi = {
  // 查询话务数据分页
  getCdrPage: async (params: any) => {
    return await request.get({ url: `/callcenter/cdr/page`, params })
  },

  // 导出话务数据 Excel
  exportCdr: async (params) => {
    return await request.download({ url: `/callcenter/cdr/export-excel`, params })
  }
}
