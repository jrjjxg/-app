import { request } from './request';

// 获取日记列表
export function getJournalList(params) {
    return request({
        url: '/api/journal/list',
        method: 'get',
        params
    });
}

// 获取日记详情
export function getJournalDetail(journalId) {
    return request({
        url: `/api/journal/get/${journalId}`,
        method: 'get'
    });
}

// 保存日记
export function saveJournal(journalData) {
    return request({
        url: '/api/journal/save',
        method: 'post',
        data: journalData
    });
}

// 更新日记
export function updateJournal(journalData) {
    return request({
        url: '/api/journal/update',
        method: 'put',
        data: journalData
    });
}

// 删除日记
export function deleteJournal(journalId) {
    return request({
        url: `/api/journal/delete/${journalId}`,
        method: 'delete'
    });
}

// 获取日记日期列表
export function getJournalDates(params) {
    return request({
        url: '/api/journal/dates',
        method: 'get',
        params
    });
}

// 收藏/取消收藏日记
export function toggleJournalFavorite(journalId) {
    return request({
        url: `/api/journal/favorite/${journalId}`,
        method: 'put'
    });
}

/**
 * 获取日记关键词云数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} params.endDate - 结束日期 (YYYY-MM-DD)
 * @param {number} params.limit - 关键词数量限制
 * @returns {Promise} - 返回关键词数据
 */
export function getKeywordCloudData(params) {
  return request({
    url: '/api/journal/stats/keyword-cloud',
    method: 'get',
    params
  });
}