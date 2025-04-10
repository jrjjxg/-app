import { request } from './request';
import { CATEGORY_IDS } from '@/constants/categories';

// 获取所有音频分类
export const getAudioCategories = () => {
  return request({
    url: '/api/videos/categories', // 新增的后端接口
    method: 'GET'
  });
};

// 根据分类获取媒体资源
export const getMediaByCategory = (categoryId, pageNum = 1, pageSize = 10) => {
  return request({
    url: '/api/videos/category',
    method: 'GET',
    params: { categoryId, pageNum, pageSize }
  });
};

// 获取媒体详情
export const getMediaDetail = (id) => {
  return request({
    url: `/api/videos/${id}`,
    method: 'GET'
  });
};

// 深呼吸专用API
export const getBreathingResources = (pageNum = 1, pageSize = 10) => {
  return getMediaByCategory(CATEGORY_IDS.BREATHING, pageNum, pageSize);
};

// 冥想音频专用API
export const getMeditationResources = (pageNum = 1, pageSize = 10) => {
  return getMediaByCategory(CATEGORY_IDS.MEDITATION, pageNum, pageSize);
};

// 心理科普专用API
export const getPsychologyResources = (pageNum = 1, pageSize = 10) => {
  return getMediaByCategory(CATEGORY_IDS.PSYCHOLOGY, pageNum, pageSize);
};

// 添加保存进度的方法
export const saveProgress = (data) => {
  return request({
    url: '/api/videos/progress',
    method: 'POST',
    data
  });
};
