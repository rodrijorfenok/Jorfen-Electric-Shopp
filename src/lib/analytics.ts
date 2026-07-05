// Centralized CRO Tracking and Analytics Instrumentation

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface FiredEvent {
  id: string;
  eventName: 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'AddPaymentInfo' | 'Purchase' | 'CustomEvent';
  platform: 'MetaPixel' | 'GA4' | 'GTM' | 'ConversionAPI' | 'GoogleAds';
  payload: any;
  timestamp: string;
}

// Extract UTM parameters from URL and persist in sessionStorage/localStorage
export function getAndPersistUTMParams(): UTMParams {
  const params: UTMParams = {};
  if (typeof window === 'undefined') return params;

  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys: (keyof UTMParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  let hasParams = false;
  utmKeys.forEach((key) => {
    const val = urlParams.get(key);
    if (val) {
      params[key] = val;
      hasParams = true;
    }
  });

  if (hasParams) {
    localStorage.setItem('baw_utm_params', JSON.stringify(params));
  } else {
    // Attempt to recover from localStorage
    const saved = localStorage.getItem('baw_utm_params');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore
      }
    }
  }

  return params;
}

// Log a fired event locally so it can be reviewed in the Admin Panel Event Debugger
function logEventLocally(
  eventName: FiredEvent['eventName'],
  platform: FiredEvent['platform'],
  payload: any
) {
  if (typeof window === 'undefined') return;

  const newEvent: FiredEvent = {
    id: `EV-${Math.floor(100000 + Math.random() * 900000)}`,
    eventName,
    platform,
    payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const existingStr = localStorage.getItem('baw_fired_events') || '[]';
    const existing: FiredEvent[] = JSON.parse(existingStr);
    existing.unshift(newEvent); // Add to beginning
    // Keep only the last 100 events to save space
    localStorage.setItem('baw_fired_events', JSON.stringify(existing.slice(0, 100)));
    
    // Dispatch custom event to notify listeners (e.g., AdminPanel)
    window.dispatchEvent(new CustomEvent('baw_event_logged', { detail: newEvent }));
  } catch (e) {
    console.error('Failed to log event locally:', e);
  }
}

// Trigger Meta Pixel tracking
export function trackMetaPixel(eventName: string, data?: any) {
  const payload = {
    ...data,
    currency: 'ARS',
    utm: getAndPersistUTMParams(),
  };

  // 1. Call real FB Pixel if installed
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', eventName, payload);
  }

  // 2. Log in console
  console.log(`%c✨ [Meta Pixel] ${eventName} Fired:`, 'color: #10b981; font-weight: bold;', payload);

  // 3. Log locally
  logEventLocally(
    eventName as any,
    'MetaPixel',
    payload
  );
}

// Trigger GA4 (Google Analytics) tracking
export function trackGA4(eventName: string, data?: any) {
  const payload = {
    ...data,
    currency: 'ARS',
    ...getAndPersistUTMParams(),
  };

  // 1. Call real gtag if installed
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, payload);
  }

  // 2. Log in console
  console.log(`%c📊 [GA4] ${eventName} Fired:`, 'color: #3b82f6; font-weight: bold;', payload);

  // 3. Log locally
  logEventLocally(
    eventName as any,
    'GA4',
    payload
  );
}

// Trigger Google Tag Manager dataLayer push
export function trackGTM(eventName: string, data?: any) {
  const payload = {
    event: eventName,
    ecommerce: data,
    utm: getAndPersistUTMParams(),
  };

  // 1. Push to real dataLayer if exists
  if (typeof (window as any).dataLayer !== 'undefined' && Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push(payload);
  }

  // 2. Log in console
  console.log(`%c⚙️ [GTM] ${eventName} Pushed to dataLayer:`, 'color: #f59e0b; font-weight: bold;', payload);

  // 3. Log locally
  logEventLocally(
    eventName as any,
    'GTM',
    payload
  );
}

// Trigger Simulated Conversion API (CAPI) - Crucial for iOS 14+ Meta campaign tracking
export function trackConversionAPI(eventName: string, data?: any) {
  const payload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    user_data: {
      client_ip_address: '181.16.12.94', // Simulated real IP
      client_user_agent: navigator.userAgent,
      fbc: `fb.1.${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000000)}`,
      fbp: `fb.1.${Math.floor(Date.now() / 1000 - 86400)}.${Math.floor(Math.random() * 1000000)}`,
    },
    custom_data: {
      ...data,
      currency: 'ARS',
    },
    utm: getAndPersistUTMParams(),
  };

  // Log in console
  console.log(`%c🌐 [Conversion API] Firing Server-Side Event: ${eventName}`, 'color: #ec4899; font-weight: bold;', payload);

  // Log locally
  logEventLocally(
    eventName as any,
    'ConversionAPI',
    payload
  );
}

// High level tracking helper functions for Ecommerce Funnel

export function trackViewContent(item: { id: string; name: string; price: number }) {
  const data = {
    content_type: 'product',
    content_name: item.name,
    content_ids: [item.id],
    value: item.price,
  };
  trackMetaPixel('ViewContent', data);
  trackGA4('view_item', data);
  trackGTM('view_item', data);
  trackConversionAPI('ViewContent', data);
}

export function trackAddToCart(item: { id: string; name: string; price: number; quantity: number }) {
  const data = {
    content_type: 'product',
    content_name: item.name,
    content_ids: [item.id],
    value: item.price * item.quantity,
    quantity: item.quantity,
  };
  trackMetaPixel('AddToCart', data);
  trackGA4('add_to_cart', data);
  trackGTM('add_to_cart', data);
  trackConversionAPI('AddToCart', data);
}

export function trackInitiateCheckout(item: { id: string; name: string; price: number; quantity: number }) {
  const data = {
    content_type: 'product',
    content_name: item.name,
    content_ids: [item.id],
    value: item.price * item.quantity,
    quantity: item.quantity,
  };
  trackMetaPixel('InitiateCheckout', data);
  trackGA4('begin_checkout', data);
  trackGTM('begin_checkout', data);
  trackConversionAPI('InitiateCheckout', data);
}

export function trackAddPaymentInfo(paymentMethod: string, value: number) {
  const data = {
    payment_info_method: paymentMethod,
    value: value,
  };
  trackMetaPixel('AddPaymentInfo', data);
  trackGA4('add_payment_info', data);
  trackGTM('add_payment_info', data);
  trackConversionAPI('AddPaymentInfo', data);
}

export function trackPurchase(order: {
  id: string;
  value: number;
  items: { id: string; name: string; price: number; quantity: number }[];
  fullName: string;
  phone: string;
  paymentMethod: string;
}) {
  const data = {
    transaction_id: order.id,
    value: order.value,
    content_name: order.items[0]?.name,
    content_ids: order.items.map(i => i.id),
    payment_method: order.paymentMethod,
    items: order.items.map(i => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  };
  
  // Track across Meta Pixel, GA4, GTM, and Server CAPI
  trackMetaPixel('Purchase', data);
  trackGA4('purchase', data);
  trackGTM('purchase', data);
  trackConversionAPI('Purchase', data);

  // Trigger Google Ads conversion simulation
  console.log(`%c🎯 [Google Ads] conversion G-12345 fired for purchase: ${order.id}`, 'color: #84cc16; font-weight: bold;', {
    send_to: 'AW-123456789/abcXYZ',
    value: order.value,
    currency: 'ARS',
    transaction_id: order.id,
  });
  logEventLocally('Purchase', 'GoogleAds', { ...data, google_ads_conversion_id: 'AW-123456789/abcXYZ' });
}
