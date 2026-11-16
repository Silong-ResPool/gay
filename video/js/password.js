// 密码保护功能

/**
 * 检查是否设置了密码保护
 * 通过读取页面上嵌入的环境变量来检查
 */
function isPasswordProtected() {
    // 首先检查主配置是否已加载并初始化完成
    if (!window.MASTER_CONFIG || !window.MASTER_CONFIG_READY) {
        console.log('⏳ 主配置尚未加载或初始化完成');
        return false;
    }
    
    const pwd = window.AUTH_CONFIG && window.AUTH_CONFIG.password;
    const result = window.AUTH_CONFIG?.enabled && typeof pwd === 'string' && pwd.length > 0;
    console.log('🔐 密码保护检查:', { 
        enabled: window.AUTH_CONFIG?.enabled, 
        hasPassword: !!pwd, 
        passwordLength: pwd?.length,
        result 
    });
    return result;
}

/**
 * 检查是否强制要求设置密码
 * 如果没有设置有效的 PASSWORD，则认为需要强制设置密码
 * 为了安全考虑，所有部署都必须设置密码
 */
function isPasswordRequired() {
    return !isPasswordProtected();
}

/**
 * 强制密码保护检查 - 防止绕过
 * 在关键操作前都应该调用此函数
 */
function ensurePasswordProtection() {
    if (isPasswordRequired()) {
        showPasswordModal();
        throw new Error('Password protection is required');
    }
    if (isPasswordProtected() && !isPasswordVerified()) {
        showPasswordModal();
        throw new Error('Password verification required');
    }
    return true;
}

window.isPasswordProtected = isPasswordProtected;
window.isPasswordRequired = isPasswordRequired;

/**
 * 验证用户输入的密码是否正确（支持明文密码和哈希值）
 */
async function verifyPassword(input) {
    try {
        // 获取正确的密码哈希（异步获取）
        const correctHash = await window.getPasswordHash();
        if (!correctHash) {
            console.warn('未找到密码配置，请检查 auth-config.js 文件');
            return false;
        }

        let inputHash;
        
        // 判断输入是明文密码还是哈希值
        if (input.length === 64 && /^[a-f0-9]+$/i.test(input)) {
            // 输入看起来是哈希值
            inputHash = input.toLowerCase();
            console.log('🔐 检测到哈希值输入');
        } else {
            // 输入是明文密码，计算哈希
            inputHash = await sha256(input);
            console.log('🔑 检测到明文密码输入');
        }

        const isValid = inputHash === correctHash.toLowerCase();

        if (isValid) {
            localStorage.setItem(window.AUTH_CONFIG?.localStorageKey || 'authSession', JSON.stringify({
                verified: true,
                timestamp: Date.now(),
                passwordHash: correctHash
            }));
        }
        return isValid;
    } catch (error) {
        console.error('验证密码时出错:', error);
        return false;
    }
}

// 验证状态检查
function isPasswordVerified() {
    try {
        if (!isPasswordProtected()) return true;

        const stored = localStorage.getItem(window.AUTH_CONFIG?.localStorageKey || 'authSession');
        if (!stored) return false;

        const { timestamp, passwordHash } = JSON.parse(stored);
        
        // 需要异步获取当前哈希，但这个函数不是异步的
        // 所以我们先检查基本的时间戳验证
        const verificationTTL = window.AUTH_CONFIG?.sessionDuration || (90 * 24 * 60 * 60 * 1000);
        if (!timestamp || Date.now() - timestamp >= verificationTTL) {
            return false;
        }
        
        // 异步验证密码哈希
        window.getPasswordHash().then(currentHash => {
            if (passwordHash !== currentHash) {
                // 如果哈希不匹配，清除存储的验证状态
                localStorage.removeItem(window.AUTH_CONFIG?.localStorageKey || 'authSession');
            }
        }).catch(error => {
            console.error('验证密码哈希时出错:', error);
        });
        
        return true;
    } catch (error) {
        console.error('检查密码验证状态时出错:', error);
        return false;
    }
}

// 更新全局导出
window.isPasswordProtected = isPasswordProtected;
window.isPasswordRequired = isPasswordRequired;
window.isPasswordVerified = isPasswordVerified;
window.verifyPassword = verifyPassword;
window.ensurePasswordProtection = ensurePasswordProtection;

// SHA-256实现，可用Web Crypto API
async function sha256(message) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // HTTP 下调用原始 js‑sha256
    if (typeof window._jsSha256 === 'function') {
        return window._jsSha256(message);
    }
    throw new Error('No SHA-256 implementation available.');
}

/**
 * 显示密码验证弹窗
 */
function showPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        // 防止出现豆瓣区域滚动条
        document.getElementById('doubanArea').classList.add('hidden');
        document.getElementById('passwordCancelBtn').classList.add('hidden');

        // 检查是否需要强制设置密码
        if (isPasswordRequired()) {
            // 修改弹窗内容提示用户需要先设置密码
            const title = passwordModal.querySelector('h2');
            const description = passwordModal.querySelector('p');
            if (title) title.textContent = '配置错误';
            if (description) description.textContent = '主配置文件中未正确设置密码';
            
            // 隐藏密码输入框和提交按钮，只显示提示信息
            const form = passwordModal.querySelector('form');
            const errorMsg = document.getElementById('passwordError');
            if (form) form.style.display = 'none';
            if (errorMsg) {
                errorMsg.textContent = '请检查 config/master-config.js 文件，确保 auth.password 已正确设置。如果是第一次使用，请查阅 README_SIMPLE.md 配置指南。';
                errorMsg.classList.remove('hidden');
                errorMsg.className = 'text-red-500 mt-2 font-medium'; // 改为更醒目的红色
            }
        } else {
            // 正常的密码验证模式
            const title = passwordModal.querySelector('h2');
            const description = passwordModal.querySelector('p');
            if (title) title.textContent = '访问验证';
            if (description) description.textContent = '请输入密码继续访问';
            
            const form = passwordModal.querySelector('form');
            if (form) form.style.display = 'block';
        }

        passwordModal.style.display = 'flex';

        // 只有在非强制设置密码模式下才聚焦输入框
        if (!isPasswordRequired()) {
            // 确保输入框获取焦点
            setTimeout(() => {
                const passwordInput = document.getElementById('passwordInput');
                if (passwordInput) {
                    passwordInput.focus();
                }
            }, 100);
        }
    }
}

/**
 * 隐藏密码验证弹窗
 */
function hidePasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (passwordModal) {
        // 隐藏密码错误提示
        hidePasswordError();

        // 清空密码输入框
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) passwordInput.value = '';

        passwordModal.style.display = 'none';

        // 如果启用豆瓣区域则显示豆瓣区域
        if (localStorage.getItem('doubanEnabled') === 'true') {
            document.getElementById('doubanArea').classList.remove('hidden');
            initDouban();
        }
    }
}

/**
 * 显示密码错误信息
 */
function showPasswordError() {
    const errorElement = document.getElementById('passwordError');
    if (errorElement) {
        errorElement.classList.remove('hidden');
    }
}

/**
 * 隐藏密码错误信息
 */
function hidePasswordError() {
    const errorElement = document.getElementById('passwordError');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

/**
 * 处理密码提交事件（异步）
 */
async function handlePasswordSubmit() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput ? passwordInput.value.trim() : '';
    if (await verifyPassword(password)) {
        hidePasswordModal();

        // 触发密码验证成功事件
        document.dispatchEvent(new CustomEvent('passwordVerified'));
    } else {
        showPasswordError();
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
}

/**
 * 初始化密码验证系统
 */
function initPasswordProtection() {
    // 如果需要强制设置密码，显示警告弹窗
    if (isPasswordRequired()) {
        showPasswordModal();
        return;
    }
    
    // 如果设置了密码但用户未验证，显示密码输入框
    if (isPasswordProtected() && !isPasswordVerified()) {
        showPasswordModal();
        return;
    }
}

// 在页面加载完成后初始化密码保护
document.addEventListener('DOMContentLoaded', function () {
    initPasswordProtection();
});