/**
 * 格式化时间显示
 * @param {string|Date} time 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time) {
  if (!time) return '';

  const date = typeof time === 'string' ? new Date(time) : time;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const now = new Date();
  const diff = now - date;
  
  // 一天内
  if (diff < 86400000 && now.getDate() === date.getDate()) {
    if (diff < 3600000) { // 一小时内
      const minutes = Math.floor(diff / 60000);
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    } else { // 大于一小时
      return `今天 ${hours}:${minutes}`;
    }
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && 
      date.getMonth() === yesterday.getMonth() && 
      date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${hours}:${minutes}`;
  }
  
  // 一周内
  if (diff < 604800000) { // 7天内
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `周${days[date.getDay()]} ${hours}:${minutes}`;
  }
  
  // 超过一周
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 格式化日期范围
 * @param {string|Date} startDate 开始日期
 * @param {string|Date} endDate 结束日期
 * @returns {string} 格式化后的日期范围
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const startYear = start.getFullYear();
  const startMonth = String(start.getMonth() + 1).padStart(2, '0');
  const startDay = String(start.getDate()).padStart(2, '0');
  
  const endYear = end.getFullYear();
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const endDay = String(end.getDate()).padStart(2, '0');
  
  // 同一年
  if (startYear === endYear) {
    // 同一月
    if (startMonth === endMonth) {
      return `${startYear}年${startMonth}月${startDay}日-${endDay}日`;
    }
    return `${startYear}年${startMonth}月${startDay}日-${endMonth}月${endDay}日`;
  }
  
  // 不同年
  return `${startYear}年${startMonth}月${startDay}日-${endYear}年${endMonth}月${endDay}日`;
}

// 日期格式化
export function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}年${month}月${day}日`;
}

// 完整日期时间格式化
export function formatFullDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
} 