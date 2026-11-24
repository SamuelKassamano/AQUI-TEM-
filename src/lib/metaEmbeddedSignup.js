/**
 * metaEmbeddedSignup.js
 * Utilitário de Preparação do Fluxo Oficial de Embedded Signup da Meta
 * Projecto: AQUI TEM ANGOLA
 * 
 * Permite associar o número oficial (+244 950 752 933) à WABA via WhatsApp Coexistence
 * preservando a aplicação WhatsApp Business instalada no smartphone.
 */

export const META_APP_ID = '1695258538801599';
export const OFFICIAL_WABA_ID = '1230360799324390';
export const OFFICIAL_PHONE_NUMBER = '+244 950 752 933';
export const TEST_PHONE_NUMBER_ID = '1527292017127020';
export const DEFAULT_CONFIG_ID = '1814605586868556';

let sdkLoadingPromise = null;

/**
 * Carrega e inicializa o Facebook JavaScript SDK de forma assíncrona e segura
 */
export function loadMetaFacebookSdk() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.FB) return Promise.resolve(window.FB);
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    // Configura o callback assíncrono padrão da Meta
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId: META_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v21.0'
        });
        resolve(window.FB);
      } catch (err) {
        console.warn('Erro ao inicializar Facebook SDK:', err);
        resolve(null);
      }
    };

    // Carrega o script da Meta se ainda não existir no DOM
    const scriptId = 'facebook-jssdk';
    if (document.getElementById(scriptId)) {
      if (window.FB) resolve(window.FB);
      return;
    }

    const js = document.createElement('script');
    js.id = scriptId;
    js.src = 'https://connect.facebook.net/pt_PT/sdk.js';
    js.async = true;
    js.defer = true;
    js.onerror = () => {
      console.warn('Não foi possível descarregar o Facebook SDK (possível bloqueador de anúncios ou sem rede).');
      resolve(null);
    };
    document.body.appendChild(js);
  });

  return sdkLoadingPromise;
}

/**
 * Regista o listener de eventos postMessage emitidos pela janela modal da Meta durante o Embedded Signup
 * Retorna uma função de desregisto (cleanup).
 */
export function listenForEmbeddedSignupEvents(onEventReceived) {
  if (typeof window === 'undefined') return () => { };

  const messageHandler = (event) => {
    // A Meta emite mensagens com origem no domínio facebook.com ou meta.com
    if (!event.origin.includes('facebook.com') && !event.origin.includes('meta.com')) {
      return;
    }

    try {
      const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (rawData && (rawData.type === 'WA_EMBEDDED_SIGNUP' || rawData.event === 'FINISH' || rawData.data)) {
        console.log('[Meta Embedded Signup Event Capturado]:', rawData);

        const inner = rawData.data || rawData;
        const normalized = {
          type: rawData.type || 'WA_EMBEDDED_SIGNUP',
          event: rawData.event || 'FINISH',
          wabaId: inner.waba_id || inner.wabaId || null,
          phoneNumberId: inner.phone_number_id || inner.phoneNumberId || null,
          currentStep: inner.current_step || inner.currentStep || null,
          timestamp: new Date().toISOString(),
          raw: rawData
        };

        if (typeof onEventReceived === 'function') {
          onEventReceived(normalized);
        }
      }
    } catch (_e) {
      // Mensagens não-JSON ignoradas
    }
  };

  window.addEventListener('message', messageHandler);
  return () => window.removeEventListener('message', messageHandler);
}

/**
 * Dispara o modal de Embedded Signup da Meta utilizando o FB.login com o Configuration ID
 * Configurado especificamente para WhatsApp Business App Coexistence
 */
export async function launchEmbeddedSignupPopup({ configId = DEFAULT_CONFIG_ID, onError }) {
  const fb = await loadMetaFacebookSdk();
  if (!fb) {
    throw new Error('Facebook SDK não disponível. Verifique bloqueadores de anúncios ou scripts externos.');
  }

  const effectiveConfigId = configId || DEFAULT_CONFIG_ID;
  if (!effectiveConfigId) {
    throw new Error('Configuration ID (config_id) da Meta é obrigatório para iniciar o Embedded Signup.');
  }

  return new Promise((resolve, reject) => {
    fb.login(
      (response) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          resolve({ success: true, code, authResponse: response.authResponse });
        } else {
          const err = new Error(response.status || 'Registo cancelado pelo utilizador ou janela fechada.');
          if (onError) onError(err);
          reject(err);
        }
      },
      {
        config_id: effectiveConfigId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          feature: 'whatsapp_embedded_signup',
          featureType: 'whatsapp_business_app_onboarding',
          version: 2,
          sessionInfoVersion: 2,
          setup: {
            phone_number: OFFICIAL_PHONE_NUMBER
          }
        }
      }
    );
  });
}
