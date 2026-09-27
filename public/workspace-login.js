(function (root) {
    'use strict';
    let installed = false;
    let card, shell, anchor, passwordLabel, message, observer;
    const companies = {
        hazeyn: { name: 'Hazeyn Turizm', logo: 'assets/logo.png' },
        hakikat: { name: 'Hakikat Turizm', logo: 'assets/hakikat-logo-white.png' }
    };

    function refresh(company, modern) {
        if (!installed) return;
        const body = document.body;
        const active = body.classList.contains('desktop-app') &&
            (typeof modern === 'boolean' ? modern : body.classList.contains('workspace-modern'));
        const key = (typeof company === 'string' ? company : company?.id) || body.dataset.company;
        const brand = companies[key] || companies.hazeyn;
        shell.dataset.company = key === 'hakikat' ? 'hakikat' : 'hazeyn';
        const logo = shell.querySelector('.workspace-login-logo');
        if (logo.getAttribute('src') !== brand.logo) logo.setAttribute('src', brand.logo);
        logo.alt = brand.name;
        shell.querySelector('[data-workspace-login-company]').textContent = brand.name;
        if (active && card.parentNode !== shell) {
            anchor.after(shell);
            shell.append(card);
            card.classList.add('workspace-login-card');
            document.getElementById('adminPassword').before(passwordLabel);
        } else if (!active && card.parentNode === shell) {
            anchor.after(card);
            card.classList.remove('workspace-login-card');
            passwordLabel.remove();
            shell.remove();
        }
    }

    function install() {
        if (installed) { refresh(); return api; }
        if (typeof document === 'undefined' || document.body.dataset.page !== 'admin' || !document.body.classList.contains('desktop-app')) return api;
        card = document.querySelector('#loginScreen > .login-card');
        const password = document.getElementById('adminPassword');
        const submit = document.getElementById('loginBtn');
        if (!card || !password || !submit) return api;
        anchor = document.createComment('Original login card position');
        card.before(anchor);
        shell = document.createElement('div');
        shell.className = 'workspace-login-shell';
        const brandPanel = document.createElement('aside');
        brandPanel.className = 'workspace-login-brand';
        brandPanel.setAttribute('aria-label', 'Turizm Muhasebe');
        brandPanel.innerHTML = '<div class="workspace-login-brand-top"><img class="workspace-login-logo" src="assets/logo.png" alt="Hazeyn Turizm"><span class="workspace-login-product">TURİZM MUHASEBE</span></div><div class="workspace-login-story"><span class="workspace-login-eyebrow">BİRLİKTE, DÜZEN İÇİNDE</span><p class="workspace-login-title">Her tur için<br>net bir bakış.</p><p class="workspace-login-description">Yolcularınız, ödemeleriniz ve tur giderleriniz. Günün işlerine tek bir yerden devam edin.</p><div class="workspace-login-topics"><span>Turlar</span><span>Yolcular</span><span>Muhasebe</span></div></div><div class="workspace-login-brand-footer"><span class="workspace-login-brand-dot" aria-hidden="true"></span><span data-workspace-login-company>Hazeyn Turizm</span><span class="workspace-login-footer-label">Çalışma alanınız</span></div>';
        shell.append(brandPanel);
        passwordLabel = document.createElement('label');
        passwordLabel.className = 'workspace-login-password-label';
        passwordLabel.htmlFor = 'adminPassword';
        passwordLabel.textContent = 'Şifre';
        message = document.getElementById('workspaceLoginMessage') || document.createElement('p');
        message.id = 'workspaceLoginMessage';
        message.setAttribute('role', 'alert');
        message.setAttribute('aria-atomic', 'true');
        message.hidden = true;
        submit.before(message);
        installed = true;
        // Only the existing card moves. Its inputs, values and event handlers stay intact.
        observer = new MutationObserver(() => refresh());
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-company'] });
        refresh();
        return api;
    }

    function showError(text) {
        if (!installed) install();
        if (!message) return false;
        message.textContent = String(text || 'Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin.');
        message.hidden = false;
        requestAnimationFrame(() => {
            const password = document.getElementById('adminPassword');
            if (password && !document.getElementById('loginScreen')?.hidden) password.focus({ preventScroll: true });
        });
        return true;
    }

    function clearError() {
        if (!message) return;
        message.hidden = true;
        message.textContent = '';
    }

    const api = { install, refresh, showError, clearError };
    root.TurizmWorkspaceLogin = api;
})(typeof window === 'undefined' ? globalThis : window);
