// 消息处理器 - 处理来自background script的调用
(function() {
    'use strict';
    
    // 消息处理器映射
    const messageHandlers = {
        wrapContentForPDF: () => {
            if (typeof wrapContentForPDF === 'function') {
                return wrapContentForPDF();
            }
            throw new Error('wrapContentForPDF function not found');
        },
        
        restoreOriginalContent: (originalContent) => {
            if (typeof restoreOriginalContent === 'function') {
                return restoreOriginalContent(originalContent);
            }
            throw new Error('restoreOriginalContent function not found');
        },
        
        getBrowserInfo: () => {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                url: window.location.href,
                title: document.title
            };
        },
        
        getName: () => {
            // 生成PDF文件名
            const title = document.title || 'webpage';
            const cleanTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 100);
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            return `${cleanTitle}-${timestamp}`;
        },
        
        prescroll: () => {
            // 预滚动功能
            const originalScrollY = window.scrollY;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            
            // 滚动到底部
            window.scrollTo(0, documentHeight);
            
            return { originalScrollY };
        },
        
        postscroll: (scrollData) => {
            // 恢复滚动位置
            if (scrollData && typeof scrollData.originalScrollY === 'number') {
                window.scrollTo(0, scrollData.originalScrollY);
            }
            return true;
        },
        
        applyPatches: (settings) => {
            // 应用页面补丁
            // 这里可以调用现有的applyPatches功能
            return {
                width: window.innerWidth,
                height: Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                )
            };
        },
        
        revertPatches: () => {
            // 恢复页面补丁
            return true;
        },
        
        scaleAndSplitPdf: (pdfData) => {
            // PDF处理 - 这里返回原始数据，因为我们已经在content层面处理了
            const blob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], {
                type: 'application/pdf'
            });
            const url = URL.createObjectURL(blob);
            
            return {
                result: url,
                meta: {
                    pages: 1,
                    size: blob.size
                }
            };
        },
        
        sendFileRefs: (data) => {
            // 发送文件引用
            console.log('PDF generated:', data);
            return true;
        }
    };
    
    // 监听来自background script的消息
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            try {
                const { type, data } = request;
                
                if (messageHandlers[type]) {
                    const result = messageHandlers[type](data);
                    sendResponse({ result });
                } else {
                    sendResponse({ error: `Unknown message type: ${type}` });
                }
            } catch (error) {
                sendResponse({ error: error.message });
            }
            
            return true; // 保持消息通道开放
        });
    }
})();