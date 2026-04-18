export const APPLICATION_STAGES = [
  '待投递',
  '已投递',
  '笔试 / OA',
  '面试中',
  'Offer',
  '已结束',
] as const

export type ApplicationStage = (typeof APPLICATION_STAGES)[number]
