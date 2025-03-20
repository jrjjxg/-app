<template>
  <view class="min-h-screen bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
    <!-- 背景装饰 -->
    <view class="absolute w-72 h-72 rounded-full bg-white/10 -top-24 -left-24 animate-float-slow"></view>
    <view class="absolute w-64 h-64 rounded-full bg-white/10 -bottom-32 -right-12 animate-float-slow-reverse"></view>

    <!-- 顶部标题 - 文字单独上移 -->
    <view class="absolute top-12 left-0 right-0 flex flex-col items-center z-10 animate-fade-in">
      <image src="/static/images/logo.png"
        class="w-20 h-20 rounded-2xl shadow-lg shadow-purple-700/30 mb-1 animate-pulse-subtle" mode="aspectFit"></image>
      <view class="-mt-10"> <!-- 添加负边距使文字上移 -->
        <text class="text-2xl font-bold text-white mb-0.5 text-shadow block">Uniheart-有你才好</text>
        <text class="text-sm text-white/90 text-shadow-sm block text-center">一款一站式全包的心理健康平台</text>
      </view>
    </view>

    <!-- 内容卡片 -->
    <view
      class="bg-white/95 rounded-t-3xl pt-8 px-5 pb-10 mt-40 relative z-1 shadow-lg min-h-[calc(100vh-160px)] animate-slide-up-fast">
      <!-- 切换标签 -->
      <view class="flex mb-6 relative bg-gray-100 rounded-xl p-1">
        <view class="absolute h-full top-0 left-0 bg-white rounded-xl shadow-sm transition-all duration-300 ease-out"
          :class="[activeTab === 'login' ? 'w-1/2' : 'w-1/2 translate-x-full']"></view>
        <view class="flex-1 py-3 text-center relative z-1 transition-colors duration-300"
          :class="{ 'text-purple-600 font-semibold': activeTab === 'login', 'text-gray-500': activeTab !== 'login' }"
          @click="changeTab('login')">
          <text>登录</text>
        </view>
        <view class="flex-1 py-3 text-center relative z-1 transition-colors duration-300"
          :class="{ 'text-purple-600 font-semibold': activeTab === 'register', 'text-gray-500': activeTab !== 'register' }"
          @click="changeTab('register')">
          <text>注册</text>
        </view>
      </view>

      <!-- 登录表单 -->
      <view v-if="activeTab === 'login'" class="space-y-5 animate-fade-in-fast">
        <view class="space-y-2">
          <text class="text-gray-700 font-medium">用户名</text>
          <input
            class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
            type="text" v-model="loginForm.username" placeholder="请输入用户名" />
        </view>

        <view class="space-y-2">
          <text class="text-gray-700 font-medium">密码</text>
          <view class="relative">
            <input
              class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
              :password="!showPassword" v-model="loginForm.password" placeholder="请输入密码" />
            <text class="absolute right-4 top-3.5 text-sm text-purple-600 font-medium"
              @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="flex justify-between items-center">
          <label class="flex items-center">
            <switch :checked="rememberMe" @change="rememberMe = !rememberMe" color="#8B5CF6"
              style="transform: scale(0.8);" />
            <text class="text-gray-600 text-sm">记住我</text>
          </label>
          <text class="text-purple-600 text-sm font-medium" @click="forgotPassword">忘记密码?</text>
        </view>

        <button
          class="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-md shadow-purple-500/20 active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
          @click="handleLogin" :disabled="isLoading" @touchstart="addRippleEffect">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <!-- 分隔线和测试用户登录选项 -->
        <view class="relative py-2 text-center">
          <view class="absolute inset-0 flex items-center">
            <view class="w-full border-t border-gray-200"></view>
          </view>
          <view class="relative">
            <text class="px-3 bg-white text-sm text-gray-500">或者</text>
          </view>
        </view>

        <button
          class="w-full h-12 bg-white border border-purple-200 text-purple-600 font-medium rounded-xl active:bg-purple-50 transition-colors duration-200"
          @click="loginWithTestUser">
          使用测试账号登录
        </button>
      </view>

      <!-- 注册表单 -->
      <view v-if="activeTab === 'register'" class="space-y-5 animate-fade-in-fast">
        <view class="space-y-2">
          <text class="text-gray-700 font-medium">用户名</text>
          <input
            class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
            type="text" v-model="registerForm.username" placeholder="请输入用户名 (4-16个字符)" />
        </view>

        <view class="space-y-2">
          <text class="text-gray-700 font-medium">邮箱</text>
          <input
            class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
            type="text" v-model="registerForm.email" placeholder="请输入邮箱" />
        </view>

        <view class="space-y-2">
          <text class="text-gray-700 font-medium">密码</text>
          <view class="relative">
            <input
              class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
              :password="!showRegisterPassword" v-model="registerForm.password" placeholder="请输入密码 (至少8位)" />
            <text class="absolute right-4 top-3.5 text-sm text-purple-600 font-medium"
              @click="showRegisterPassword = !showRegisterPassword">
              {{ showRegisterPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="space-y-2">
          <text class="text-gray-700 font-medium">确认密码</text>
          <view class="relative">
            <input
              class="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
              :password="!showConfirmPassword" v-model="registerForm.confirmPassword" placeholder="请再次输入密码" />
            <text class="absolute right-4 top-3.5 text-sm text-purple-600 font-medium"
              @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '隐藏' : '显示' }}
            </text>
          </view>
        </view>

        <view class="space-y-2">
          <text class="text-gray-700 font-medium">验证码</text>
          <view class="flex">
            <input
              class="flex-1 h-12 px-4 bg-gray-50 border border-gray-200 rounded-l-xl focus:border-purple-500 focus:bg-white transition-colors duration-200"
              type="text" v-model="registerForm.code" placeholder="请输入验证码" />
            <button class="w-32 h-12 bg-purple-600 text-white font-medium rounded-r-xl disabled:bg-purple-300"
              @click="sendCode" :disabled="codeSending || codeCountdown > 0">
              <text v-if="codeCountdown > 0">{{ codeCountdown }}秒</text>
              <text v-else-if="codeSending">发送中...</text>
              <text v-else>获取验证码</text>
            </button>
          </view>
        </view>

        <view class="mb-2">
          <label class="flex items-center">
            <switch :checked="agreeTerms" @change="agreeTerms = !agreeTerms" color="#8B5CF6"
              style="transform: scale(0.8);" />
            <text class="text-gray-600 text-sm">
              我已阅读并同意
              <text class="text-purple-600 font-medium">用户协议</text>
              和
              <text class="text-purple-600 font-medium">隐私政策</text>
            </text>
          </label>
        </view>

        <button
          class="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-md shadow-purple-500/20 active:scale-[0.98] transition-transform duration-200 relative overflow-hidden"
          @click="handleRegister" :disabled="isLoading" @touchstart="addRippleEffect">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { login, register, sendVerificationCode } from '@/api/auth';

export default {
  data() {
    return {
      activeTab: 'login',
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        code: ''
      },
      showPassword: false,
      showRegisterPassword: false,
      showConfirmPassword: false,
      rememberMe: false,
      agreeTerms: false,
      isLoading: false,
      codeSending: false,
      codeCountdown: 0
    }
  },
  mounted() {
    // 检查是否有记住的用户名
    try {
      const rememberedUsername = uni.getStorageSync('remembered_username');
      if (rememberedUsername) {
        this.loginForm.username = rememberedUsername;
        this.rememberMe = true;
      }
    } catch (e) {
      console.error('获取存储的用户名失败', e);
    }
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },

    // 添加水波纹效果
    addRippleEffect(event) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.touches[0].clientX - rect.left;
      const y = event.touches[0].clientY - rect.top;

      const ripple = document.createElement('view');
      ripple.className = 'absolute bg-white/30 rounded-full pointer-events-none';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = '5px';
      ripple.style.height = '5px';
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.animation = 'ripple 0.6s linear';

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    },

    async handleLogin() {
      console.log('登录表单数据:', this.loginForm);

      // 表单验证
      if (!this.loginForm.username || !this.loginForm.password) {
        uni.showToast({
          title: '请输入用户名和密码',
          icon: 'none'
        });
        return;
      }

      try {
        this.isLoading = true;

        // 调用登录API
        const result = await login({
          username: this.loginForm.username,
          password: this.loginForm.password
        });

        console.log('登录结果:', result);

        // 解析token并存储用户ID
        try {
          const tokenParts = result.data.token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          const userId = payload.sub || payload.id || payload.userId;

          // 直接存储用户ID，以后可以直接使用
          uni.setStorageSync('userId', userId);
        } catch (error) {
          console.error('解析token出错', error);
        }

        // 保存token
        if (result && result.data && result.data.token) {
          uni.setStorageSync('token', result.data.token);

          // 如果选择了记住我，保存用户名
          if (this.rememberMe) {
            uni.setStorageSync('remembered_username', this.loginForm.username);
          } else {
            uni.removeStorageSync('remembered_username');
          }

          // 登录成功处理
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          throw new Error('登录失败，请稍后再试');
        }
      } catch (error) {
        console.error('登录错误:', error);
        // 登录失败处理
        uni.showToast({
          title: error.message || '登录失败，请稍后再试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleRegister() {
      console.log('注册表单数据:', this.registerForm);

      // 表单验证
      if (!this.registerForm.username || !this.registerForm.email ||
        !this.registerForm.password || !this.registerForm.confirmPassword) {
        uni.showToast({
          title: '请填写完整的注册信息',
          icon: 'none'
        });
        return;
      }

      // 密码一致性验证
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }

      // 用户名长度验证
      if (this.registerForm.username.length < 4 || this.registerForm.username.length > 16) {
        uni.showToast({
          title: '用户名长度应为4-16个字符',
          icon: 'none'
        });
        return;
      }

      // 密码强度验证
      if (this.registerForm.password.length < 8) {
        uni.showToast({
          title: '密码长度至少为8位',
          icon: 'none'
        });
        return;
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.registerForm.email)) {
        uni.showToast({
          title: '请输入有效的邮箱地址',
          icon: 'none'
        });
        return;
      }

      // 添加验证码验证
      if (!this.registerForm.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        });
        return;
      }

      // 用户协议验证
      if (!this.agreeTerms) {
        uni.showToast({
          title: '请阅读并同意用户协议和隐私政策',
          icon: 'none'
        });
        return;
      }

      try {
        this.isLoading = true;

        // 调用注册API
        await register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password,
          code: this.registerForm.code
        });

        // 注册成功处理
        uni.showToast({
          title: '注册成功，请登录',
          icon: 'success'
        });

        // 切换到登录页
        setTimeout(() => {
          this.activeTab = 'login';
          this.loginForm.username = this.registerForm.username;
        }, 1500);
      } catch (error) {
        console.error('注册错误:', error);
        // 注册失败处理
        uni.showToast({
          title: error.message || '注册失败，请稍后再试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async sendCode() {
      console.log('发送验证码到:', this.registerForm.email);

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.registerForm.email)) {
        uni.showToast({
          title: '请输入有效的邮箱地址',
          icon: 'none'
        });
        return;
      }

      try {
        this.codeSending = true;

        // 调用发送验证码API
        await sendVerificationCode(this.registerForm.email);

        // 显示成功提示
        uni.showToast({
          title: '验证码已发送',
          icon: 'success'
        });

        // 开始倒计时
        this.codeCountdown = 60;
        const timer = setInterval(() => {
          this.codeCountdown--;
          if (this.codeCountdown <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      } catch (error) {
        console.error('发送验证码错误:', error);
        // 发送失败处理
        uni.showToast({
          title: error.message || '验证码发送失败',
          icon: 'none'
        });
      } finally {
        this.codeSending = false;
      }
    },

    forgotPassword() {
      uni.navigateTo({
        url: '/pages/auth/forgot-password'
      });
    },

    loginWithTestUser() {
      this.loginForm.username = 'testuser';
      this.loginForm.password = 'password123';
      this.handleLogin();
    }
  }
}
</script>

<style>
/* 自定义动画 */
@keyframes ripple {
  to {
    transform: scale(30);
    opacity: 0;
  }
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 添加Tailwind没有的动画类 */
.animate-float-slow {
  animation: float 8s ease-in-out infinite;
}

.animate-float-slow-reverse {
  animation: float 8s ease-in-out infinite reverse;
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animate-fade-in-fast {
  animation: fade-in 0.5s ease-out forwards;
}

.animate-slide-up-fast {
  animation: slide-up 0.6s ease-out forwards;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@keyframes pulse-subtle {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>