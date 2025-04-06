// 获取心情颜色
export function getMoodColor(score) {
    // 根据心情分数返回不同颜色
    const colors = {
        1: '#ff5252', // 红色 - 非常糟糕
        2: '#ff7043', // 橙红色 - 很糟糕
        3: '#ff9800', // 橙色 - 糟糕
        4: '#ffb74d', // 浅橙色 - 不太好
        5: '#ffeb3b', // 黄色 - 一般
        6: '#c0ca33', // 黄绿色 - 还行
        7: '#8bc34a', // 浅绿色 - 良好
        8: '#4caf50', // 绿色 - 很好
        9: '#26a69a', // 青绿色 - 非常好
        10: '#00bcd4' // 蓝色 - 极佳
    };
    
    return colors[score] || '#9e9e9e';
}

// 拆分标签
export function splitTags(tagsString) {
    if (!tagsString) return [];
    return tagsString.split(',').filter(tag => tag.trim());
}

// 格式化预览内容 (移除HTML标签)
export function formatPreview(html, maxLength = 100) {
    if (!html) return '';
    
    // 移除HTML标签
    const text = html.replace(/<[^>]*>/g, '');
    
    // 移除多余空格并截断
    const trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length <= maxLength) return trimmed;
    
    return trimmed.substring(0, maxLength) + '...';
} 