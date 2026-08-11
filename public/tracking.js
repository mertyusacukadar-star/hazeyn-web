(function () {
    'use strict';

    var CONSENT_KEY = 'hazeynTrackingConsent';
    var ATTRIBUTION_KEY = 'hazeynAttribution';
    var VISIT_EVENT_KEY = 'hazeynVisitEventSent';
    var MAX_ATTR_LENGTH = 160;
    var eventQueue = [];
    var settings = {};
    var initialized = false;
    var vendorsReady = false;
    var pageViewSent = false;

    function safeStorage(storage, method, key, value) {
        try {
            if (!storage || typeof storage[method] !== 'function') return null;
            return value === undefined ? storage[method](key) : storage[method](key, value);
        } catch (_) {
            return null;
        }
    }

    function cleanText(value, maxLength) {
        return String(value == null ? '' : value)
            .replace(/[<>\u0000-\u001f\u007f]/g, '')
            .trim()
            .slice(0, maxLength || MAX_ATTR_LENGTH);
    }

    function cleanEventValue(value) {
        if (typeof value === 'number' || typeof value === 'boolean') return value;
        if (Array.isArray(value)) return value.slice(0, 20).map(cleanEventValue);
        if (value && typeof value === 'object') {
            var output = {};
            Object.keys(value).slice(0, 30).forEach(function (key) {
                output[cleanText(key, 40)] = cleanEventValue(value[key]);
            });
            return output;
        }
        return cleanText(value, 300);
    }

    function readConsent() {
        var value = safeStorage(window.localStorage, 'getItem', CONSENT_KEY);
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null;
    }

    function validGaId(value) {
        value = cleanText(value, 40).toUpperCase();
        return /^G-[A-Z0-9]{5,20}$/.test(value) ? value : '';
    }

    function validAdsId(value) {
        value = cleanText(value, 40).toUpperCase();
        return /^AW-\d{5,20}$/.test(value) ? value : '';
    }

    function validMetaId(value) {
        value = cleanText(value, 40);
        return /^\d{5,25}$/.test(value) ? value : '';
    }

    function normalizedSettings(raw) {
        raw = raw && typeof raw === 'object' ? raw : {};
        return {
            ga4MeasurementId: validGaId(raw.ga4MeasurementId || raw.gaMeasurementId || raw.googleAnalyticsId),
            metaPixelId: validMetaId(raw.metaPixelId || raw.facebookPixelId),
            googleAdsId: validAdsId(raw.googleAdsId || raw.googleAdsConversionId),
            googleAdsWhatsappLabel: cleanText(raw.googleAdsWhatsappLabel || raw.googleAdsWhatsAppLabel || raw.whatsappConversionLabel, 120),
            googleAdsPhoneLabel: cleanText(raw.googleAdsPhoneLabel || raw.phoneConversionLabel, 120),
            googleAdsFormLabel: cleanText(raw.googleAdsFormLabel || raw.formConversionLabel || raw.contactConversionLabel, 120)
        };
    }

    function hasVendorIds(config) {
        return !!(config.ga4MeasurementId || config.metaPixelId || config.googleAdsId);
    }

    function captureAttribution() {
        var params;
        try {
            params = new URLSearchParams(window.location.search || '');
        } catch (_) {
            params = null;
        }

        var previous = {};
        try {
            previous = JSON.parse(safeStorage(window.sessionStorage, 'getItem', ATTRIBUTION_KEY) || '{}');
        } catch (_) {
            previous = {};
        }

        var attribution = {
            utm_source: cleanText(params && params.get('utm_source'), MAX_ATTR_LENGTH) || previous.utm_source || '',
            utm_medium: cleanText(params && params.get('utm_medium'), MAX_ATTR_LENGTH) || previous.utm_medium || '',
            utm_campaign: cleanText(params && params.get('utm_campaign'), MAX_ATTR_LENGTH) || previous.utm_campaign || '',
            utm_term: cleanText(params && params.get('utm_term'), MAX_ATTR_LENGTH) || previous.utm_term || '',
            utm_content: cleanText(params && params.get('utm_content'), MAX_ATTR_LENGTH) || previous.utm_content || '',
            landing_path: previous.landing_path || cleanText(window.location.pathname, 240),
            referrer_host: previous.referrer_host || ''
        };

        if (!attribution.referrer_host && document.referrer) {
            try {
                attribution.referrer_host = cleanText(new URL(document.referrer).hostname, 160);
            } catch (_) {
                attribution.referrer_host = '';
            }
        }

        safeStorage(window.sessionStorage, 'setItem', ATTRIBUTION_KEY, JSON.stringify(attribution));
        return attribution;
    }

    function getAttribution() {
        try {
            return JSON.parse(safeStorage(window.sessionStorage, 'getItem', ATTRIBUTION_KEY) || '{}');
        } catch (_) {
            return {};
        }
    }

    function loadScript(src, id) {
        return new Promise(function (resolve) {
            if (!src) return resolve(false);
            var existing = id ? document.getElementById(id) : null;
            if (existing) return resolve(true);
            var script = document.createElement('script');
            if (id) script.id = id;
            script.async = true;
            script.src = src;
            script.referrerPolicy = 'strict-origin-when-cross-origin';
            script.onload = function () { resolve(true); };
            script.onerror = function () { resolve(false); };
            (document.head || document.documentElement).appendChild(script);
        });
    }

    function setupGoogleTag(config) {
        var tagId = config.ga4MeasurementId || config.googleAdsId;
        if (!tagId) return Promise.resolve(false);

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: config.googleAdsId ? 'granted' : 'denied',
            ad_user_data: config.googleAdsId ? 'granted' : 'denied',
            ad_personalization: config.googleAdsId ? 'granted' : 'denied'
        });
        if (config.ga4MeasurementId) {
            window.gtag('config', config.ga4MeasurementId, {
                anonymize_ip: true,
                send_page_view: true
            });
        }
        if (config.googleAdsId) window.gtag('config', config.googleAdsId);

        return loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(tagId), 'hazeyn-google-tag');
    }

    function setupMetaPixel(config) {
        if (!config.metaPixelId) return Promise.resolve(false);
        if (!window.fbq) {
            var fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
            fbq.push = fbq;
            fbq.loaded = true;
            fbq.version = '2.0';
            fbq.queue = [];
            window.fbq = fbq;
            window._fbq = fbq;
        }
        window.fbq('init', config.metaPixelId);
        window.fbq('track', 'PageView');
        return loadScript('https://connect.facebook.net/en_US/fbevents.js', 'hazeyn-meta-pixel');
    }

    function adsDestination(label) {
        if (!settings.googleAdsId || !label) return '';
        var value = cleanText(label, 120);
        if (/^AW-\d+\/.+/.test(value)) return value;
        return settings.googleAdsId + '/' + value.replace(/^\/+/, '');
    }

    function sendAdsConversion(label, params) {
        var sendTo = adsDestination(label);
        if (!sendTo || typeof window.gtag !== 'function') return;
        var conversion = { send_to: sendTo };
        if (params && params.value != null) conversion.value = params.value;
        if (params && params.currency) conversion.currency = params.currency;
        window.gtag('event', 'conversion', conversion);
    }

    function dispatchEvent(name, rawParams) {
        var consent = readConsent();
        if (consent === false) return;
        if (!vendorsReady || consent !== true) {
            eventQueue.push([name, rawParams]);
            return;
        }

        var params = cleanEventValue(rawParams || {});
        params = Object.assign({}, getAttribution(), params);

        if (settings.ga4MeasurementId && typeof window.gtag === 'function') {
            window.gtag('event', name, params);
        }

        if (settings.metaPixelId && typeof window.fbq === 'function') {
            if (name === 'program_view') {
                window.fbq('track', 'ViewContent', {
                    content_name: params.program_name || document.title,
                    content_ids: params.program_id ? [params.program_id] : undefined,
                    content_type: 'product'
                });
            } else if (name === 'whatsapp_click' || name === 'phone_call' || name === 'contact_submit') {
                window.fbq('track', 'Contact', { content_name: params.program_name || name });
            }
        }

        if (name === 'whatsapp_click') sendAdsConversion(settings.googleAdsWhatsappLabel, params);
        if (name === 'phone_call') sendAdsConversion(settings.googleAdsPhoneLabel, params);
        if (name === 'contact_submit') sendAdsConversion(settings.googleAdsFormLabel, params);
    }

    function flushQueue() {
        var pending = eventQueue.slice();
        eventQueue.length = 0;
        pending.forEach(function (entry) { dispatchEvent(entry[0], entry[1]); });
    }

    function startVendors() {
        if (!hasVendorIds(settings) || readConsent() !== true || vendorsReady) return Promise.resolve(false);
        vendorsReady = true;
        return Promise.all([setupGoogleTag(settings), setupMetaPixel(settings)])
            .catch(function () { return []; })
            .then(function () {
                flushQueue();
                trackEntrySource();
                trackProgramView();
                return true;
            });
    }

    function removeConsentBar() {
        var bar = document.getElementById('hazeynTrackingConsent');
        if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    }

    function setConsent(value) {
        safeStorage(window.localStorage, 'setItem', CONSENT_KEY, value ? 'true' : 'false');
        removeConsentBar();
        if (value) startVendors();
        else eventQueue.length = 0;
    }

    function showConsentBar() {
        if (document.getElementById('hazeynTrackingConsent')) return;

        var style = document.createElement('style');
        style.id = 'hazeynTrackingConsentStyle';
        style.textContent =
            '#hazeynTrackingConsent{position:fixed;z-index:2147483000;left:50%;bottom:18px;transform:translateX(-50%);width:min(680px,calc(100% - 28px));box-sizing:border-box;display:flex;align-items:center;gap:18px;padding:16px 18px;border:1px solid rgba(214,163,56,.38);border-radius:18px;background:rgba(18,17,15,.96);box-shadow:0 18px 50px rgba(0,0,0,.28);color:#fff;font:500 13px/1.5 Arial,sans-serif;backdrop-filter:blur(14px)}' +
            '#hazeynTrackingConsent p{margin:0;flex:1;color:rgba(255,255,255,.82)}#hazeynTrackingConsent strong{display:block;margin-bottom:2px;color:#fff;font-size:14px}' +
            '#hazeynTrackingConsent .htc-actions{display:flex;gap:8px;flex:0 0 auto}#hazeynTrackingConsent button{min-height:38px;padding:0 15px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#fff;font:700 12px Arial,sans-serif;cursor:pointer}' +
            '#hazeynTrackingConsent button[data-consent="accept"]{border-color:#d6a338;background:linear-gradient(135deg,#c99224,#e4b852);color:#17130c}' +
            '@media(max-width:600px){#hazeynTrackingConsent{align-items:stretch;flex-direction:column;gap:12px;bottom:12px;padding:15px}.htc-actions{width:100%}.htc-actions button{flex:1}}';
        (document.head || document.documentElement).appendChild(style);

        var bar = document.createElement('aside');
        bar.id = 'hazeynTrackingConsent';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-live', 'polite');
        bar.setAttribute('aria-label', 'Çerez tercihleri');
        bar.innerHTML = '<p><strong>Gizlilik tercihiniz</strong>Site kullanımını ölçmek ve size daha iyi hizmet sunmak için isteğe bağlı analiz çerezleri kullanıyoruz.</p>' +
            '<div class="htc-actions"><button type="button" data-consent="reject">Reddet</button><button type="button" data-consent="accept">Kabul Et</button></div>';
        bar.addEventListener('click', function (event) {
            var button = event.target.closest('[data-consent]');
            if (!button) return;
            setConsent(button.getAttribute('data-consent') === 'accept');
        });
        document.body.appendChild(bar);
    }

    function pageProgramData() {
        var data = window.HAZEYN_PAGE_DATA && typeof window.HAZEYN_PAGE_DATA === 'object' ? window.HAZEYN_PAGE_DATA : {};
        return {
            program_id: cleanText(data.id || data.programId || document.body.getAttribute('data-program-id'), 100),
            program_name: cleanText(data.title || data.programTitle || document.body.getAttribute('data-program-title'), 240),
            program_slug: cleanText(data.slug || document.body.getAttribute('data-program-slug'), 180),
            page_location: cleanText(window.location.origin + window.location.pathname, 500)
        };
    }

    function trackProgramView() {
        if (pageViewSent) return;
        var data = pageProgramData();
        if (!data.program_name && !data.program_id && !data.program_slug) return;
        pageViewSent = true;
        dispatchEvent('program_view', data);
    }

    function trackEntrySource() {
        if (safeStorage(window.sessionStorage, 'getItem', VISIT_EVENT_KEY) === 'true') return;
        var attribution = getAttribution();
        var source = String(attribution.utm_source || '').toLowerCase();
        var referrer = String(attribution.referrer_host || '').toLowerCase();
        var eventName = '';
        if (source.indexOf('instagram') !== -1 || referrer.indexOf('instagram.') !== -1 || referrer.indexOf('l.instagram.') !== -1) {
            eventName = 'instagram_visit';
        } else if (source === 'google' || /(^|\.)google\./.test(referrer)) {
            eventName = 'google_visit';
        }
        if (!eventName) return;
        safeStorage(window.sessionStorage, 'setItem', VISIT_EVENT_KEY, 'true');
        dispatchEvent(eventName, { traffic_source: source || referrer });
    }

    function nearestProgramData(element) {
        var holder = element && element.closest ? (element.closest('[data-program-id],[data-program-title],[data-tour]') || element.closest('[data-program-link]')) : null;
        var globalData = pageProgramData();
        var hrefPath = '';
        try { hrefPath = element && element.href ? new URL(element.href, window.location.href).pathname.replace(/^\/+|\/+$/g, '') : ''; } catch (_error) { /* ignore malformed URL */ }
        return {
            program_id: cleanText(holder && (holder.getAttribute('data-program-id') || holder.getAttribute('data-tour')), 100) || globalData.program_id,
            program_name: cleanText(holder && (holder.getAttribute('data-program-title') || holder.getAttribute('aria-label')), 240) || globalData.program_name,
            program_slug: cleanText(holder && holder.getAttribute('data-program-slug'), 180) || cleanText(hrefPath, 180) || globalData.program_slug,
            destination_url: cleanText(element && element.href, 500)
        };
    }

    function bindDelegatedEvents() {
        document.addEventListener('click', function (event) {
            var target = event.target && event.target.closest ? event.target.closest('a,button,[data-track]') : null;
            if (!target) return;

            if (target.matches('.whatsapp-link,.tour-whatsapp-cta,[data-track="whatsapp"],[data-track="whatsapp_click"]')) {
                dispatchEvent('whatsapp_click', nearestProgramData(target));
                return;
            }
            if (target.matches('.phone-link,[data-track="phone"],[data-track="phone_call"]') || (target.tagName === 'A' && /^tel:/i.test(target.getAttribute('href') || ''))) {
                dispatchEvent('phone_call', { destination_url: cleanText(target.href, 500) });
                return;
            }
            if (target.matches('[data-program-link],[data-track="program"],[data-track="program_click"]')) {
                dispatchEvent('program_click', nearestProgramData(target));
            }
        }, true);

        document.addEventListener('submit', function (event) {
            var form = event.target;
            if (!form || form.tagName !== 'FORM') return;
            var id = String(form.id || '').toLowerCase();
            var name = String(form.getAttribute('name') || '').toLowerCase();
            var track = String(form.getAttribute('data-track') || '').toLowerCase();
            if (track === 'contact' || /contact|iletisim|newsletter|bulten/.test(id + ' ' + name)) {
                dispatchEvent('contact_submit', { form_id: cleanText(form.id || form.getAttribute('name') || 'contact', 100) });
            }
        }, true);
    }

    function fetchSettings() {
        if (window.HAZEYN_TRACKING_SETTINGS && typeof window.HAZEYN_TRACKING_SETTINGS === 'object') {
            return Promise.resolve(window.HAZEYN_TRACKING_SETTINGS);
        }
        if (typeof window.fetch !== 'function') return Promise.resolve({});
        return window.fetch('/api/data', { method: 'GET', credentials: 'same-origin', headers: { Accept: 'application/json' } })
            .then(function (response) { return response.ok ? response.json() : {}; })
            .then(function (payload) {
                if (payload && payload.data && payload.data.settings) return payload.data.settings;
                return payload && payload.settings ? payload.settings : {};
            })
            .catch(function () { return {}; });
    }

    function init() {
        if (initialized) return;
        initialized = true;
        captureAttribution();
        bindDelegatedEvents();

        fetchSettings().then(function (rawSettings) {
            settings = normalizedSettings(rawSettings);
            if (!hasVendorIds(settings)) return;
            var consent = readConsent();
            if (consent === true) startVendors();
            else if (consent === null) showConsentBar();
        });
    }

    window.HazeynTracking = {
        track: dispatchEvent,
        getAttribution: getAttribution,
        setConsent: setConsent,
        getConsent: readConsent
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
}());
