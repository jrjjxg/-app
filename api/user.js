import { request } from './request';

// 获取当前用户信息
export const getUserInfo = () => {
  return request({
    url: '/api/user/me',
    method: 'GET'
  });
};

// 获取指定用户信息，返回一个对象:UserVo
export const getUserProfile = (userId) => {
  return request({
    url: `/api/user/profile/${userId}`,
    method: 'GET'
  });
};


// 更新用户信息
export const updateUserInfo = (data) => {
  return request({
    url: '/api/user/update',
    method: 'POST',
    data
  });
};

// 更新用户头像
export const updateAvatar = (avatarUrl) => {
  return request({
    url: '/api/user/avatar',
    method: 'POST',
    data: { avatarUrl }
  });
};

// 检查用户名是否可用
export const checkUsername = (username) => {
  return request({
    url: '/api/user/check-username',
    method: 'GET',
    params: { username }
  });
};

// 更新用户密码
export const updatePassword = (data) => {
  return request({
    url: '/api/user/password',
    method: 'POST',
    data
  });
};
