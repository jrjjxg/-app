import { request } from './request';

// 用户登录
export const login = (data) => {
  console.log('登录请求数据:', data);
  return request({
    url: '/api/user/login',
    method: 'POST',
    data
  });
};

// 用户注册
export const register = (data) => {
  return request({
    url: '/api/user/register',
    method: 'POST',
    data
  });
};

// 发送验证码
export const sendVerificationCode = (email) => {
  return request({
    url: '/api/user/register/send-code',
    method: 'POST',
    data: { email }
  });
};

// 忘记密码
export const forgotPassword = (email) => {
  return request({
    url: '/api/user/forgot-password',
    method: 'POST',
    data: { email }
  });
};

// 重置密码


// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/api/user/me',
    method: 'GET'
  });
};

// 退出登录
export const logout = () => {
  // 移动端登出只需要清除本地存储的token
  uni.removeStorageSync('token');
  return Promise.resolve();
};