/**
 * 日期工具函数集合
 * 确保在所有平台上都能正常工作，包括小程序环境
 */

/**
 * 将日期对象格式化为YYYY-MM-DD格式的字符串
 * 符合后端@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)的要求
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期字符串，格式为YYYY-MM-DD
 */
export function formatDateToISOString(date) {
  // 如果输入为空，返回空字符串
  if (!date) return '';
  
  // 确保date是Date对象
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.error('无效的日期:', date);
    return '';
  }
  
  // 格式化为YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期为中文显示格式
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的日期字符串，格式为YYYY年MM月DD日
 */
export function formatDateToChinese(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('无效的日期:', date);
    return '';
  }
  
  return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
}

/**
 * 格式化日期为相对时间（今天、昨天、MM月DD日）
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @returns {string} 格式化后的相对时间字符串
 */
export function formatRelativeDate(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.error('无效的日期:', date);
    return '';
  }
  
  const dateStr = formatDateToISOString(dateObj);
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const todayStr = formatDateToISOString(today);
  const yesterdayStr = formatDateToISOString(yesterday);
  
  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';
  return `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
}

/**
 * 获取指定天数前的日期
 * @param {number} days - 天数
 * @returns {Date} 指定天数前的日期对象
 */
export function getDateBefore(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 获取当月第一天
 * @returns {Date} 当月第一天的日期对象
 */
export function getFirstDayOfMonth() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 比较两个日期是否是同一天
 * @param {Date|string|number} date1 - 第一个日期
 * @param {Date|string|number} date2 - 第二个日期
 * @returns {boolean} 如果是同一天返回true，否则返回false
 */
export function isSameDay(date1, date2) {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}