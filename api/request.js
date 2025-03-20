// 封装请求方法
const BASE_URL = 'http://localhost:9000'; // 替换为你的后端API地址
//移动端开发时，前端api和后端yml文件都要修改address

export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = uni.getStorageSync('token');
    
    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('添加token到请求头:', token);
    } else {
      console.log('未找到token');
    }
    
    // 打印完整的请求信息
    console.log('请求URL:', BASE_URL + options.url);
    console.log('请求方法:', options.method || 'GET');
    console.log('请求头:', headers);
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，可能是token过期
          uni.removeStorageSync('token');
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          
          // 跳转到登录页
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/auth/login'
            });
          }, 1500);
          
          reject(res);
        } else {
          reject(res);
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        reject(err);
        uni.showToast({
          title: '网络错误，请稍后再试',
          icon: 'none'
        });
      }
    });
  });
};