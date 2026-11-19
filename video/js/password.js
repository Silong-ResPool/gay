// 密码保护功能

function isPasswordProtected() {
    if (!window.MASTER_CONFIG || !window.MASTER_CONFIG_READY) return false;
    const pwd = window.AUTH_CONFIG && window.AUTH_CONFIG.password;
    return !!(window.AUTH_CONFIG?.enabled && typeof pwd === 'string' && pwd.length > 0);
}

function isPasswordRequired() { return !isPasswordProtected(); }

function ensurePasswordProtection() {
    if (isPasswordRequired()) { showPasswordModal(); throw new Error('Password protection is required'); }
    if (isPasswordProtected() && !isPasswordVerified()) { showPasswordModal(); throw new Error('Password verification required'); }
    return true;
}

window.isPasswordProtected = isPasswordProtected;
window.isPasswordRequired = isPasswordRequired;

async function verifyPassword(input) {
    try {
        const correctHash = await window.getPasswordHash();
        if (!correctHash) return false;
        let inputHash = (input.length === 64 && /^[a-f0-9]+$/i.test(input)) ? input.toLowerCase() : await sha256(input);
        const isValid = inputHash === correctHash.toLowerCase();
        if (isValid) localStorage.setItem(window.AUTH_CONFIG?.localStorageKey || 'authSession', JSON.stringify({ verified: true, timestamp: Date.now(), passwordHash: correctHash }));
        return isValid;
    } catch (error) { console.error('验证密码时出错:', error); return false; }
}

function isPasswordVerified() {
    try {
        if (!isPasswordProtected()) return true;
        const stored = localStorage.getItem(window.AUTH_CONFIG?.localStorageKey || 'authSession');
        if (!stored) return false;
        const { timestamp, passwordHash } = JSON.parse(stored);
        const verificationTTL = window.AUTH_CONFIG?.sessionDuration || (90 * 24 * 60 * 60 * 1000);
        if (!timestamp || Date.now() - timestamp >= verificationTTL) return false;
        window.getPasswordHash().then(currentHash => {
            if (passwordHash !== currentHash) localStorage.removeItem(window.AUTH_CONFIG?.localStorageKey || 'authSession');
        }).catch(error => console.error('验证密码哈希时出错:', error));
        return true;
    } catch (error) { console.error('检查密码验证状态时出错:', error); return false; }
}

window.isPasswordProtected = isPasswordProtected;
window.isPasswordRequired = isPasswordRequired;
window.isPasswordVerified = isPasswordVerified;
window.verifyPassword = verifyPassword;
window.ensurePasswordProtection = ensurePasswordProtection;

async function sha256(message) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    if (typeof window._jsSha256 === 'function') return window._jsSha256(message);
    throw new Error('No SHA-256 implementation available.');
}

function showPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    if (!passwordModal) return;
    const douban = document.getElementById('doubanArea'); if (douban) douban.classList.add('hidden');
    const cancel = document.getElementById('passwordCancelBtn'); if (cancel) cancel.classList.add('hidden');
    if (isPasswordRequired()) {
        const title = passwordModal.querySelector('h2'); if (title) title.textContent = '配置错误';
        const description = passwordModal.querySelector('p'); if (description) description.textContent = '主配置文件中未正确设置密码';
        const form = passwordModal.querySelector('form'); if (form) form.style.display = 'none';
        const errorMsg = document.getElementById('passwordError');
        if (errorMsg) { errorMsg.textContent = '请检查 config/master-config.js 文件，确保 auth.password 已正确设置。'; errorMsg.classList.remove('hidden'); errorMsg.className = 'text-red-500 mt-2 font-medium'; }
    } else {
        const title = passwordModal.querySelector('h2'); if (title) title.textContent = '访问验证';
        const description = passwordModal.querySelector('p'); if (description) description.textContent = '请输入密码继续访问';
        const form = passwordModal.querySelector('form'); if (form) form.style.display = 'block';
    }
    passwordModal.style.display = 'flex';
    if (!isPasswordRequired()) setTimeout(() => document.getElementById('passwordInput')?.focus(), 100);
}

function hidePasswordModal() {
    const passwordModal = document.getElementById('passwordModal'); if (!passwordModal) return;
    hidePasswordError();
    const passwordInput = document.getElementById('passwordInput'); if (passwordInput) passwordInput.value = '';
    passwordModal.style.display = 'none';
    if (localStorage.getItem('doubanEnabled') === 'true') { document.getElementById('doubanArea')?.classList.remove('hidden'); if (typeof initDouban === 'function') initDouban(); }
}

function showPasswordError() { document.getElementById('passwordError')?.classList.remove('hidden'); }
function hidePasswordError() { document.getElementById('passwordError')?.classList.add('hidden'); }

async function handlePasswordSubmit() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput ? passwordInput.value.trim() : '';
    if (await verifyPassword(password)) {
        hidePasswordModal();
        document.dispatchEvent(new CustomEvent('passwordVerified'));
    } else {
        showPasswordError();
        if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); }
    }
}

function initPasswordProtection() {
    if (isPasswordRequired()) { showPasswordModal(); return; }
    if (isPasswordProtected() && !isPasswordVerified()) { showPasswordModal(); return; }
    // 已有有效会话时不会再次触发 passwordVerified，主动初始化播放器。
    if (typeof initializePageContent === 'function') initializePageContent();
}

document.addEventListener('DOMContentLoaded', function () { initPasswordProtection(); });
