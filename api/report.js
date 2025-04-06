import { request } from './request';
// 获取用户报告列表
export function getUserReports(userId, pageNum = 1, pageSize = 10) {
  return request({
    url: `/api/reports/user/${userId}`,
    method: 'get',
    params: { pageNum, pageSize }
  });
}

// 获取报告详情
export function getReportById(reportId) {
  return request({
    url: `/api/reports/${reportId}`,
    method: 'get'
  });
}

// 创建周报告
export function createWeeklyReport(userId, weekStart) {
  return request({
    url: '/api/reports/weekly',
    method: 'post',
    params: { userId, weekStart }
  });
}

// 创建月报告
export function createMonthlyReport(userId, year, month) {
  return request({
    url: '/api/reports/monthly',
    method: 'post',
    params: { userId, year, month }
  });
}

// 创建年报告
export function createYearlyReport(userId, year) {
  return request({
    url: '/api/reports/yearly',
    method: 'post',
    params: { userId, year }
  });
}

// 标记报告已读
export function markReportAsRead(reportId) {
  return request({
    url: `/api/reports/${reportId}/read`,
    method: 'put'
  });
}

// 创建自定义时间段报告
export function createCustomReport(userId, startDate, endDate) {
  return request({
    url: '/api/reports/custom',
    method: 'POST',
    data: {
      userId,
      startDate,
      endDate
    }
  });
}