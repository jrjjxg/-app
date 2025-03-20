import { request } from './request';

// 关注/取消关注
export const toggleFollow = (targetUserId) => {
  return request({
    url: `/api/community/follow/${targetUserId}`,
    method: 'POST'
  });
};

// 检查是否关注
export const checkFollowed = (targetUserId) => {
  return request({
    url: `/api/community/follow/check/${targetUserId}`,
    method: 'GET'
  });
};

// 获取关注列表
export const getFollowingList = (userId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/follow/following/${userId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
};

// 获取粉丝列表
export const getFollowerList = (userId, pageNum = 1, pageSize = 10) => {
  return request({
    url: `/api/community/follow/followers/${userId}`,
    method: 'GET',
    params: { pageNum, pageSize }
  });
}; 