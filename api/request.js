// 封装请求方法
const BASE_URL = 'http://localhost:9000'; // 替换为你的后端API地址
//移动端开发时，前端api和后端yml文件都要修改address

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
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