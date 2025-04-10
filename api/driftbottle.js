import { request } from './request';

// 投掷漂流瓶
export const throwBottle = (data) => {
  return request({
    url: '/api/driftbottle/throw',
    method: 'POST',
    data
  });
};

// 捞取漂流瓶
export const pickBottle = () => {
  return request({
    url: '/api/driftbottle/pick',
    method: 'GET'
  });
};

// 回复漂流瓶
export const replyBottle = (data) => {
  return request({
    url: '/api/driftbottle/reply',
    method: 'POST',
    data
  });
};

// 获取漂流瓶详情
export const getBottleDetail = (id) => {
  return request({
    url: `/api/driftbottle/${id}`,
    method: 'GET'
  });
};

// 获取我投掷的漂流瓶
export const getMyThrownBottles = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/driftbottle/my/thrown',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 获取我捞到的漂流瓶
export const getMyPickedBottles = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/driftbottle/my/picked',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 管理员：获取待审核的漂流瓶
export const getPendingAuditBottles = (pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/admin/driftbottle/pending',
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 管理员：审核漂流瓶
export const auditBottle = (data) => {
  return request({
    url: '/api/admin/driftbottle/audit',
    method: 'POST',
    data
  });
};

// 获取我的漂流瓶列表
export const getMyBottles = (params) => {
  return request({
    url: '/api/driftbottle/my',
    method: 'GET',
    params
  });
};

// 删除漂流瓶
export const deleteBottle = (id) => {
  return request({
    url: `/api/driftbottle/${id}`,
    method: 'DELETE'
  });
};

// 举报漂流瓶
export const reportBottle = (data) => {
  return request({
    url: '/api/driftbottle/report',
    method: 'POST',
    data
  });
}; 