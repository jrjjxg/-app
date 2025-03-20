import { request } from './request';

// 点赞/取消点赞
export const toggleLike = (type, targetId) => {
  // 将字符串类型转换为数字
  const typeCode = type === 'post' ? 1 : type === 'comment' ? 2 : 0;
  
  return request({
    url: `/api/community/like/${typeCode}/${targetId}`,
    method: 'POST'
  });
};

// 检查是否点赞
export const checkUserLiked = (type, targetId) => {
  // 将字符串类型转换为数字
  const typeCode = type === 'post' ? 1 : type === 'comment' ? 2 : 0;
  
  return request({
    url: `/api/community/like/check/${typeCode}/${targetId}`,
    method: 'GET'
  });
};

// 获取点赞用户列表
export const getLikeUsers = (type, targetId, pageNum = 1, pageSize = 10) => {
    // 将字符串类型转换为数字
    const typeCode = type === 'post' ? 1 : type === 'comment' ? 2 : 0;
  return request({
    url: `/api/community/like/users/${typeCode}/${targetId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
}; 