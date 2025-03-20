/**
 * 路由拦截器
 * 检查用户是否已登录，未登录则跳转到登录页
 */

// 不需要登录就可以访问的页面
const whiteList = [
  '/pages/auth/login',
  '/pages/auth/forgot-password'
];

// 页面跳转前拦截
function hasPermission(url) {
  // 获取token
  const token = uni.getStorageSync('token');
  
  // 在白名单中的页面，直接放行
  if (whiteList.some(path => url.indexOf(path) !== -1)) {
    return true;
  }
  
  // 未登录，跳转到登录页
  if (!token) {
    uni.navigateTo({
      url: '/pages/auth/login'
    });
    return false;
  }
  
  return true;
}

// 注册拦截器
export function setupPermissionGuard() {
  // 页面跳转拦截
  const list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'];
  list.forEach(method => {
    uni.addInterceptor(method, {
      invoke(e) {
        if (!hasPermission(e.url)) {
          return false;
        }
        return e;
      },
      fail(err) {
        console.log(err);
      }
    });
  });
}