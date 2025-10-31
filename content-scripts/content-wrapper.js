// 内容重新包装功能 - 类似A扩展的实现
function createContentWrapper() {
    // 创建包装容器，类似A扩展的 .wtp-article
    const wrapper = document.createElement('div');
    wrapper.className = 'cwtp-pdf-wrapper';
    wrapper.style.cssText = `
        width: 750px !important;
        margin: 0 auto !important;
        padding: 20px !important;
        background-color: #fff !important;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Noto Sans, Liberation Sans, Arial, sans-serif !important;
        line-height: 1.6em !important;
        color: #000 !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        min-height: 100vh !important;
    `;

    // 样式化内容元素
    const contentStyles = `
        .cwtp-pdf-wrapper img {
            max-width: 100% !important;
            height: auto !important;
        }
        .cwtp-pdf-wrapper table,
        .cwtp-pdf-wrapper th,
        .cwtp-pdf-wrapper td {
            border: 1px solid #000 !important;
            border-collapse: collapse !important;
            padding: 6px !important;
        }
        .cwtp-pdf-wrapper table {
            width: 100% !important;
            margin-bottom: 20px !important;
            text-align: left !important;
        }
        .cwtp-pdf-wrapper pre,
        .cwtp-pdf-wrapper code {
            white-space: pre-wrap !important;
            word-break: break-word !important;
        }
        .cwtp-pdf-wrapper pre {
            display: block !important;
            overflow: auto !important;
            padding: 20px !important;
            border-radius: 6px !important;
            font-size: 0.875em !important;
            background-color: #f6f6f6 !important;
        }
        .cwtp-pdf-wrapper blockquote {
            padding-left: 1em !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            border-left: 4px solid #000 !important;
            font-style: italic !important;
        }
        .cwtp-pdf-wrapper * {
            max-width: 100% !important;
            box-sizing: border-box !important;
        }
        /* 隐藏不必要的元素 */
        .cwtp-pdf-wrapper nav,
        .cwtp-pdf-wrapper header,
        .cwtp-pdf-wrapper footer,
        .cwtp-pdf-wrapper .sidebar,
        .cwtp-pdf-wrapper .advertisement,
        .cwtp-pdf-wrapper .ads,
        .cwtp-pdf-wrapper .popup,
        .cwtp-pdf-wrapper .modal {
            display: none !important;
        }
    `;

    // 添加样式
    const styleElement = document.createElement('style');
    styleElement.textContent = contentStyles;
    document.head.appendChild(styleElement);

    return wrapper;
}

function extractMainContent() {
    // 尝试找到主要内容区域
    const selectors = [
        'main',
        'article',
        '[role="main"]',
        '.main-content',
        '.content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '#content',
        '#main',
        '.container'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
            return element;
        }
    }

    // 如果没找到，使用body
    return document.body;
}

function wrapContentForPDF() {
    // 保存原始body
    const originalBody = document.body.cloneNode(true);
    
    // 创建新的包装容器
    const wrapper = createContentWrapper();
    
    // 提取主要内容
    const mainContent = extractMainContent();
    
    // 克隆主要内容到包装容器
    const contentClone = mainContent.cloneNode(true);
    wrapper.appendChild(contentClone);
    
    // 替换body内容
    document.body.innerHTML = '';
    document.body.appendChild(wrapper);
    
    // 设置body样式以确保单页显示
    document.body.style.cssText = `
        margin: 0 !important;
        padding: 0 !important;
        background-color: #fff !important;
        width: 750px !important;
        min-height: 100vh !important;
    `;
    
    // 设置html样式
    document.documentElement.style.cssText = `
        margin: 0 !important;
        padding: 0 !important;
        background-color: #fff !important;
        width: 750px !important;
        min-height: 100vh !important;
    `;
    
    return {
        originalBody,
        wrapper
    };
}

function restoreOriginalContent(originalBody) {
    // 恢复原始内容
    document.body.innerHTML = '';
    document.body.appendChild(...Array.from(originalBody.childNodes));
    
    // 恢复原始样式
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
    
    // 移除添加的样式
    const styleElement = document.querySelector('style');
    if (styleElement && styleElement.textContent.includes('.cwtp-pdf-wrapper')) {
        styleElement.remove();
    }
}

// 导出函数供background script调用
if (typeof window !== 'undefined') {
    window.wrapContentForPDF = wrapContentForPDF;
    window.restoreOriginalContent = restoreOriginalContent;
}