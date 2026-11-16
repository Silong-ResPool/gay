/**
 * 代理请求鉴权模块
 * 为代理请求添加基于 PASSWORD 的鉴权机制
 */

// 从全局配置获取密码哈希（如果存在）
let cachedPasswordHash = null;

/**
 * 获取当前会话的密码哈希
 */
async function getPasswordHash() {
    if (cachedPasswordHash) {
        return cachedPasswordHash;
    }
    
    // 1. 优先从主配置获取密码哈希
    if (window.getPasswordHash && typeof window.getPasswordHash === 'function') {
        try {
            const hash = await window.getPasswordHash();
            if (hash) {
                cachedPasswordHash = hash;
                console.log('📡 代理认证：从主配置获取到密码哈希', hash.substring(0, 16) + '...');
                return hash;
            }
        } catch (error) {
            console.error('❌ 代理认证：从主配置获取密码哈希失败:', error);
        }
    } else {
        console.warn('⚠️ 代理认证：window.getPasswordHash函数不存在');
    }
    
    // 2. 尝试从已存储的代理鉴权哈希获取
    const storedHash = localStorage.getItem('proxyAuthHash');
    if (storedHash) {
        cachedPasswordHash = storedHash;
        console.log('📡 代理认证：从localStorage获取到密码哈希');
        return storedHash;
    }
    
    // 3. 尝试从密码验证状态获取（password.js 验证后存储的哈希）
    const authSessionKey = window.AUTH_CONFIG?.localStorageKey || 'authSession';
    const storedSession = localStorage.getItem(authSessionKey);
    if (storedSession) {
        try {
            const sessionData = JSON.parse(storedSession);
            if (sessionData.passwordHash) {
                localStorage.setItem('proxyAuthHash', sessionData.passwordHash);
                cachedPasswordHash = sessionData.passwordHash;
                console.log('📡 代理认证：从认证会话获取到密码哈希');
                return sessionData.passwordHash;
            }
        } catch (error) {
            console.error('解析认证会话数据失败:', error);
        }
    }
    
    // 4. 尝试从用户输入的密码生成哈希（后备方案）
    const userPassword = localStorage.getItem('userPassword');
    if (userPassword) {
        try {
            // 使用内置的sha256函数
            const encoder = new TextEncoder();
            const data = encoder.encode(userPassword);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            localStorage.setItem('proxyAuthHash', hash);
            cachedPasswordHash = hash;
            console.log('📡 代理认证：从用户密码生成哈希');
            return hash;
        } catch (error) {
            console.error('生成密码哈希失败:', error);
        }
    }
    
    console.error('❌ 代理认证：无法获取任何密码哈希');
    return null;
}

/**
 * 为代理请求URL添加鉴权参数
 */
async function addAuthToProxyUrl(url) {
    try {
        console.log('🔐 开始为代理URL添加认证参数...');
        
        // 等待主配置加载完成
        let attempts = 0;
        while ((!window.MASTER_CONFIG || !window.MASTER_CONFIG_READY) && attempts < 20) {
            console.log('⏳ 等待主配置加载...', attempts);
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
        }
        
        // 如果仍然没有加载完成，尝试强制使用现有配置
        if (!window.MASTER_CONFIG || !window.MASTER_CONFIG_READY) {
            console.warn('⚠️ 主配置加载超时，尝试使用当前配置');
        }
        
        const hash = await getPasswordHash();
        if (!hash) {
            console.error('❌ 无法获取密码哈希，代理请求将失败');
            throw new Error('代理访问未授权：无法获取密码哈希');
        }
        
        // 添加时间戳防止重放攻击
        const timestamp = Date.now();
        
        // 检查URL是否已包含查询参数
        const separator = url.includes('?') ? '&' : '?';
        
        const authUrl = `${url}${separator}auth=${encodeURIComponent(hash)}&t=${timestamp}`;
        console.log('✅ 代理认证URL生成成功');
        return authUrl;
    } catch (error) {
        console.error('❌ 添加代理鉴权失败:', error);
        throw error;
    }
}

/**
 * 验证代理请求的鉴权
 */
function validateProxyAuth(authHash, serverPasswordHash, timestamp) {
    if (!authHash || !serverPasswordHash) {
        return false;
    }
    
    // 验证哈希是否匹配
    if (authHash !== serverPasswordHash) {
        return false;
    }
    
    // 验证时间戳（10分钟有效期）
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10分钟
    
    if (timestamp && (now - parseInt(timestamp)) > maxAge) {
        console.warn('代理请求时间戳过期');
        return false;
    }
    
    return true;
}

/**
 * 清除缓存的鉴权信息
 */
function clearAuthCache() {
    cachedPasswordHash = null;
    localStorage.removeItem('proxyAuthHash');
}

// 监听密码变化，清除缓存
window.addEventListener('storage', (e) => {
    if (e.key === 'userPassword' || (window.PASSWORD_CONFIG && e.key === window.PASSWORD_CONFIG.localStorageKey)) {
        clearAuthCache();
    }
});

// 导出函数
window.ProxyAuth = {
    addAuthToProxyUrl,
    validateProxyAuth,
    clearAuthCache,
    getPasswordHash
};
