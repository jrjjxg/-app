// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('发送请求:', config.url, config.data);
    
    // 如果有token，添加到请求头
    const token = uni.getStorageSync('token');
    if (token) {
      config.header['Authorization'] = 'Bearer ' + token;
    }
    
    return config;
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error);
    return Promise.reject(error);
  }









了解了，JWT 过滤器可能导致页面白屏的问题。让我们采用一种更简单的方法来解决 403 Forbidden 问题，而不会影响页面加载。

我们可以修改 Spring Security 配置，使其更加宽松，同时仍然保护关键 API 端点：

`````java:demo1/src/main/java/com/advisor/config/SecurityConfig.java
package com.advisor.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            // 允许所有用户访问这些端点
            .antMatchers("/api/user/login", "/api/user/register", "/api/user/register/send-code").permitAll()
            // 允许静态资源访问
            .antMatchers("/", "/static/**", "/favicon.ico").permitAll()
            // 允许Swagger相关资源访问
            .antMatchers("/swagger-ui.html", "/swagger-resources/**", "/v2/api-docs", "/webjars/**").permitAll()
            // 临时允许所有API访问，用于测试
            .antMatchers("/api/**").permitAll()
            // 其他所有请求需要认证
            .anyRequest().authenticated();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
`````




这个配置的关键变化是添加了 `.antMatchers("/api/**").permitAll()`，这将允许所有 API 端点的访问，而不需要 JWT 认证。这是一个临时解决方案，用于测试和开发阶段。

在生产环境中，您应该实现适当的 JWT 认证。但是现在，这个简化的配置应该能让您的应用正常工作，而不会出现白屏问题。

如果您仍然希望实现 JWT 认证，但不想使用过滤器，我们可以尝试另一种方法：在控制器层面进行令牌验证。这样，您可以在需要认证的控制器方法中手动验证令牌，而不会影响整个应用的加载。

让我知道您更倾向于哪种方法，我可以提供更详细的实现。
