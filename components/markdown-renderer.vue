<template>
    <view class="markdown-content" v-if="renderedContent" v-html="renderedContent"></view>
    <view class="markdown-content" v-else>
        <slot></slot>
    </view>
</template>

<script>
/**
 * markdown-renderer 组件
 * 用于渲染Markdown格式的内容，支持代码高亮、数学公式等
 */
export default {
    name: 'markdown-renderer',
    props: {
        /**
         * Markdown格式的内容
         */
        content: {
            type: String,
            default: ''
        },
        /**
         * 是否渲染数学公式
         */
        renderMath: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            renderedContent: ''
        }
    },
    watch: {
        content: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.renderMarkdown()
                }
            }
        }
    },
    methods: {
        /**
         * 渲染Markdown内容
         */
        renderMarkdown() {
            // 由于小程序环境限制，我们使用一个简单的方法来处理基本的Markdown语法
            let html = this.content

            if (!html) {
                this.renderedContent = ''
                return
            }

            // 处理标题
            html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')

            // 处理加粗
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')

            // 处理斜体
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
            html = html.replace(/_(.*?)_/g, '<em>$1</em>')

            // 处理分隔线
            html = html.replace(/^\-\-\-$/gm, '<hr />')

            // 处理有序列表
            html = html.replace(/^(\d+)\. (.*?)$/gm, '<div class="list-item">$1. $2</div>')

            // 处理无序列表
            html = html.replace(/^- (.*?)$/gm, '<div class="list-item">• $1</div>')

            // 处理代码块
            html = html.replace(/```(.*?)\n([\s\S]*?)```/gm, (match, language, code) => {
                language = language.trim();

                // 根据语言添加不同的样式类
                const langClass = language ? ` language-${language}` : '';

                // 简化的语法高亮 - 为不同编程元素添加基本样式
                let highlightedCode = code;

                if (language) {
                    // 处理注释
                    if (['js', 'javascript', 'typescript', 'ts', 'java', 'c', 'cpp', 'csharp', 'c#', 'php'].includes(language)) {
                        // 单行注释
                        highlightedCode = highlightedCode.replace(/(\/\/.*?)($|\n)/g, '<span class="code-comment">$1</span>$2');
                        // 多行注释
                        highlightedCode = highlightedCode.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
                    } else if (['python', 'py', 'ruby', 'rb'].includes(language)) {
                        // Python和Ruby风格注释
                        highlightedCode = highlightedCode.replace(/(#.*?)($|\n)/g, '<span class="code-comment">$1</span>$2');
                    }

                    // 处理字符串
                    highlightedCode = highlightedCode.replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="code-string">$1</span>');

                    // 处理关键词（简单示例）
                    const keywords = [
                        'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return',
                        'class', 'import', 'export', 'from', 'try', 'catch', 'async', 'await',
                        'def', 'import', 'from', 'as', 'try', 'except', 'finally', 'class'
                    ];

                    keywords.forEach(keyword => {
                        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                        highlightedCode = highlightedCode.replace(regex, `<span class="code-keyword">${keyword}</span>`);
                    });
                }

                return `<pre class="code-block${langClass}"><code>${highlightedCode}</code></pre>`;
            });

            // 处理行内代码
            html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')

            // 处理链接
            html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="markdown-link" href="$2">$1</a>')

            // 处理简单表格 - 行分隔
            html = html.replace(/\|\s*-+\s*\|/g, '|<hr class="table-separator">|')

            // 处理表格行
            html = html.replace(/\|(.*?)\|/g, function (match, content) {
                // 分割单元格内容
                const cells = content.split('|').map(cell => cell.trim());
                let result = '<div class="table-row">';

                // 遍历各单元格
                cells.forEach(cell => {
                    if (cell) {
                        result += `<div class="table-cell">${cell}</div>`;
                    }
                });

                result += '</div>';
                return result;
            });

            // 处理数学公式 (简单替换，实际需要专门的库)
            if (this.renderMath) {
                // 行内公式
                html = html.replace(/\\\((.*?)\\\)/g, '<span class="math-inline">$1</span>')
                // 块级公式
                html = html.replace(/\\\[(.*?)\\\]/g, '<div class="math-block">$1</div>')

                // 常见数学符号替换
                const mathSymbols = {
                    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
                    '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
                    '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
                    '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
                    '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
                    '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
                    '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
                    '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
                    '\\Psi': 'Ψ', '\\Omega': 'Ω',
                    '\\infty': '∞', '\\approx': '≈', '\\neq': '≠', '\\leq': '≤',
                    '\\geq': '≥', '\\times': '×', '\\div': '÷', '\\pm': '±',
                    '\\cdot': '·', '\\ldots': '…', '\\rightarrow': '→', '\\leftarrow': '←',
                    '\\sum': '∑', '\\prod': '∏', '\\int': '∫', '\\partial': '∂',
                    '\\nabla': '∇', '\\forall': '∀', '\\exists': '∃', '\\in': '∈',
                    '\\subset': '⊂', '\\cup': '∪', '\\cap': '∩'
                };

                // 应用数学符号替换
                for (const [symbol, unicode] of Object.entries(mathSymbols)) {
                    const regex = new RegExp(symbol.replace(/\\/g, '\\\\'), 'g');
                    html = html.replace(regex, unicode);
                }

                // 处理上标和下标
                html = html.replace(/\^{([^}]*)}/g, '<sup>$1</sup>');
                html = html.replace(/\_{([^}]*)}/g, '<sub>$1</sub>');
                html = html.replace(/\^(\d)/g, '<sup>$1</sup>');
                html = html.replace(/\_(\d)/g, '<sub>$1</sub>');
            }

            // 处理换行
            html = html.replace(/\n/g, '<br />')

            this.renderedContent = html
        }
    }
}
</script>

<style>
.markdown-content {
    font-size: 28rpx;
    line-height: 1.6;
    color: #333;
    word-break: break-word;
}

.markdown-content h1 {
    font-size: 40rpx;
    margin: 24rpx 0;
    font-weight: bold;
}

.markdown-content h2 {
    font-size: 36rpx;
    margin: 22rpx 0;
    font-weight: bold;
}

.markdown-content h3 {
    font-size: 32rpx;
    margin: 20rpx 0;
    font-weight: bold;
}

.markdown-content p {
    margin: 16rpx 0;
}

.markdown-content strong {
    font-weight: bold;
}

.markdown-content em {
    font-style: italic;
}

.markdown-content hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 24rpx 0;
}

.markdown-content .list-item {
    margin: 8rpx 0;
    padding-left: 16rpx;
}

.markdown-content .code-block {
    background-color: #f8f8f8;
    border-radius: 8rpx;
    padding: 16rpx;
    margin: 16rpx 0;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 24rpx;
    line-height: 1.4;
    border-left: 4rpx solid #ddd;
}

.markdown-content .inline-code {
    background-color: #f0f0f0;
    border-radius: 4rpx;
    padding: 0 8rpx;
    font-family: monospace;
    color: #d56161;
}

.markdown-content .code-comment {
    color: #6a9955;
}

.markdown-content .code-string {
    color: #ce9178;
}

.markdown-content .code-keyword {
    color: #569cd6;
    font-weight: bold;
}

.markdown-content .math-inline {
    font-family: serif;
    font-style: italic;
}

.markdown-content .math-block {
    font-family: serif;
    font-style: italic;
    display: block;
    text-align: center;
    margin: 16rpx 0;
}

.markdown-content .markdown-link {
    color: #3b82f6;
    text-decoration: underline;
}

.markdown-content .table-row {
    display: flex;
    border-bottom: 1px solid #eee;
    padding: 8rpx 0;
}

.markdown-content .table-cell {
    flex: 1;
    padding: 8rpx 16rpx;
}

.markdown-content .table-separator {
    margin: 0;
    border-top: 1px solid #ccc;
}
</style>