

# 修复 request.js 中的 URLSearchParams 问题

找到问题根源了！问题出在 `request.js` 文件中使用了 `URLSearchParams`。让我们修复这个问题：

```javascript:MyAi/api/request.js
// 封装请求方法
const BASE_URL = 'http://192.168.2.103:9000'; // 替换为你的后端API地址
//移动端开发时，前端api和后端yml文件都要修改address

/**
 * 构建查询字符串的辅助函数，替代 URLSearchParams
 * @param {Object} params - 参数对象
 * @returns {string} 格式化后的查询字符串
 */
function buildQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

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
    
    // 处理查询参数 - 使用自定义函数替代 URLSearchParams
    if (options.params) {
      const queryString = buildQueryString(options.params);
      if (queryString) {
        options.url += (options.url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
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
```

## 解决方案说明

1. **问题根源**：
   - 在 `request.js` 中使用了 `URLSearchParams` 来构建查询字符串
   - 这是所有 API 调用的基础，所以会影响所有使用参数的请求

2. **解决方法**：
   - 添加了 `buildQueryString` 辅助函数，完全替代 `URLSearchParams`
   - 这个函数使用基本的 JavaScript 方法构建查询字符串
   - 保留了原有的过滤逻辑，只处理非空值

3. **优势**：
   - 兼容所有平台，包括 App 和小程序
   - 功能与原来的 `URLSearchParams` 完全相同
   - 性能可能更好，因为避免了创建额外的对象

4. **注意事项**：
   - 这个修改不会影响任何现有的 API 调用
   - 所有使用 `params` 的请求都会自动使用新的方法
   - 不需要修改其他文件

这个修改应该能解决所有与 `URLSearchParams` 相关的问题。请更新 `request.js` 文件并测试您的应用，看看问题是否已经解决。
