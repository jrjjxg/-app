import { request } from './request';

/**
 * 上传并分析语音文件
 * @param {Object} data - FormData对象，包含文件和相关参数
 * @returns {Promise} - 返回语音分析任务信息
 */
export function uploadAndAnalyzeVoice(data) {
    return request({
        url: '/api/voice/analyzeByUrl',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 上传音频文件到云存储
 * @param {File} file - 音频文件对象
 * @returns {Promise} - 返回上传后的文件URL
 */
export function uploadAudioFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return request({
        url: '/api/upload/audio',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 获取语音分析结果
 * @param {string} taskId - 任务ID
 * @returns {Promise} - 返回语音分析结果
 */
export function getVoiceAnalysisResult(taskId) {
    return request({
        url: `/api/voice/result/${taskId}`,
        method: 'get'
    });
}

/**
 * 获取日记关联的语音分析结果
 * @param {string} journalId - 日记ID
 * @returns {Promise} - 返回语音分析结果列表
 */
export function getVoiceAnalysisByJournalId(journalId) {
    return request({
        url: `/api/voice/journal/${journalId}`,
        method: 'get'
    });
}

/**
 * 获取情绪记录关联的语音分析结果
 * @param {string} moodId - 情绪记录ID
 * @returns {Promise} - 返回语音分析结果列表
 */
export function getVoiceAnalysisByMoodId(moodId) {
    return request({
        url: `/api/voice/mood/${moodId}`,
        method: 'get'
    });
} 