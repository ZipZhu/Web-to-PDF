// content-injector.js

/**
 * 动态注入content script的函数
 * 使用activeTab权限，只在用户点击扩展图标或右键菜单时注入
 */
export async function injectContentScript(tabId) {
  console.log('Injecting content script into tab:', tabId);
  
  try {
    // 注入CSS
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content-scripts/content.css']
    });
    
    // 注入JS
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/content.js']
    });
    
    console.log('Content script injection successful');
    return true;
  } catch (error) {
    console.error('Failed to inject content script:', error);
    return false;
  }
}

/**
 * 设置扩展图标和右键菜单的点击处理函数
 */
export function setupContentInjection() {
  // 处理扩展图标点击
  chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension icon clicked, tab:', tab.id);
    await injectContentScript(tab.id);
  });
  

  

}
