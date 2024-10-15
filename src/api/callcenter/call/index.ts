import request from '@/config/axios'
import {expression} from "vite-plugin-top-level-await";

export interface MakecallVO {
  callee: string // 被叫号码
  extra: string // 业务透传字段
}

export interface HangupVO {
  callId: string // 话单ID
}

export const CallApi = {
  // 执行api外呼
  makecall: async (data: MakecallVO) => {
    return await request.post({url: `/call/makecall`, data })
  },

  // 挂机api
  hangup: async (data: HangupVO) => {
    return await request.post({url: `/call/hangup`, data })
  },
}
