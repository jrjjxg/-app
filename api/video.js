import { request } from './request';

// 视频相关的API接口
export const videoApi = {
    
    // 获取所有视频
  getVideos(params) {
    return request({
      url: '/api/videos',
      method: 'GET',
      params
    })
  },
  // 获取视频分类列表
  getVideoCategories() {
    return request({
      url: '/api/videos/categories',
      method: 'GET'
    })
  },
  
  // 根据分类获取视频列表
  getVideosByCategory(categoryId) {
    return request({
      url: `/api/videos/category/${categoryId}`,
      method: 'GET'
    })
  },
  
  // 获取视频详情
  getVideoDetail(videoId) {
    return request({
      url: `/api/videos/${videoId}`,
      method: 'GET'
    })
  },
  
  // 获取视频播放地址
  getVideoUrl(videoId) {
    return request({
      url: `/api/videos/url/${videoId}`,
      method: 'GET'
    })
  },
  
  // 保存观看进度
  saveProgress(data) {
    return request({
      url: '/api/videos/progress',
      method: 'POST',
      data
    })
  },
  
  // 获取用户观看历史
  getUserHistory(userId) {
    return request({
      url: `/api/videos/history/${userId}`,
      method: 'GET'
    })
  }
}