import { request } from './request';

// 获取所有测试
//前端的 fetchAllTests 函数调用了后端的 /api/tests 接口
export const fetchAllTests = () => {
  return request({
    url: '/api/tests',
    method: 'GET'
  });
};

// 获取测试详情
//获取单个测试详情
export const fetchTestById = (id) => {
  return request({
    url: `/api/tests/${id}`,
    method: 'GET'
  });
};

// 获取测试问题
export const fetchTestQuestions = (testId) => {
  return request({
    url: `/api/tests/${testId}/questions`,
    method: 'GET'
  });
};

// 提交测试答案
export const submitTestAnswers = (testId, answers) => {
  return request({
    url: `/api/tests/${testId}/submit`,
    method: 'POST',
    data: answers,
    header: {
      'userId': uni.getStorageSync('userId') || '1' // 临时使用固定用户ID，实际应从登录状态获取
    }
  });
};

// 获取用户测试历史
export const fetchUserTestHistory = (testTypeId = '') => {
  return request({
    url: `/api/tests/history${testTypeId ? `?testTypeId=${testTypeId}` : ''}`,
    method: 'GET',
    header: {
      'userId': uni.getStorageSync('userId') || '1'
    }
  });
};

// 获取测试结果详情
export const fetchTestResultDetail = (resultId) => {
  return request({
    url: `/api/tests/results/${resultId}`,
    method: 'GET'
  });
};

// 获取所有测试类型
export function getAllTestTypes() {
  return request({
    url: '/api/tests',
    method: 'GET'
  });
}

// 获取测试完成人数
export function getTestCompletionCounts(testIds) {
  return request({
    url: '/api/tests/completion-counts',
    method: 'GET',
    params: {
      testTypeId: testIds
    }
  });
}

// 搜索测试
export function searchTests(keyword, sortBy) {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (sortBy) params.sortBy = sortBy;
  
  return request({
    url: '/api/tests/search',
    method: 'GET',
    params
  });
}

// 获取所有测试分类
export function getCategories() {
  return request({
    url: '/api/tests/categories/list',
    method: 'GET'
  });
}