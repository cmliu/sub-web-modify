/**
 * Short-link Provider Adapter
 * Handles different short-link services with their specific configurations
 */

// Provider configuration with endpoint, method, parameter names, and response parsing
export const SHORT_LINK_PROVIDERS = {
  'v1.mk': {
    name: 'v1.mk',
    endpoint: 'https://v1.mk/short',
    // Try POST first with url-encoded, fallback to form-data
    methods: [
      {
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        paramName: 'url',
        buildPayload: (longUrl) => {
          const params = new URLSearchParams();
          params.append('url', longUrl);
          return params.toString();
        }
      },
      {
        type: 'POST',
        contentType: 'application/json',
        paramName: 'url',
        buildPayload: (longUrl) => JSON.stringify({ url: longUrl })
      },
      {
        type: 'POST',
        contentType: 'multipart/form-data',
        paramName: 'longUrl',
        buildPayload: (longUrl) => {
          const formData = new FormData();
          formData.append('longUrl', longUrl);
          return formData;
        }
      }
    ],
    parseResponse: (data) => {
      if (!data) return null;
      // Try various response formats
      if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return data.ShortUrl || data.shortUrl || data.short_url || 
               data.url || data.short || data.link || 
               (data.data && (data.data.url || data.data.short || data.data));
      }
      return null;
    }
  },
  'd1.mk': {
    name: 'd1.mk',
    endpoint: 'https://d1.mk/short',
    methods: [
      {
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        paramName: 'url',
        buildPayload: (longUrl) => {
          const params = new URLSearchParams();
          params.append('url', longUrl);
          return params.toString();
        }
      },
      {
        type: 'POST',
        contentType: 'multipart/form-data',
        paramName: 'longUrl',
        buildPayload: (longUrl) => {
          const formData = new FormData();
          formData.append('longUrl', longUrl);
          return formData;
        }
      }
    ],
    parseResponse: (data) => {
      if (!data) return null;
      if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return data.ShortUrl || data.shortUrl || data.short_url || 
               data.url || data.short || data.link || 
               (data.data && (data.data.url || data.data.short || data.data));
      }
      return null;
    }
  },
  'dlj.tf': {
    name: 'dlj.tf',
    endpoint: 'https://dlj.tf/short',
    methods: [
      {
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        paramName: 'url',
        buildPayload: (longUrl) => {
          const params = new URLSearchParams();
          params.append('url', longUrl);
          return params.toString();
        }
      },
      {
        type: 'POST',
        contentType: 'multipart/form-data',
        paramName: 'longUrl',
        buildPayload: (longUrl) => {
          const formData = new FormData();
          formData.append('longUrl', longUrl);
          return formData;
        }
      }
    ],
    parseResponse: (data) => {
      if (!data) return null;
      if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return data.ShortUrl || data.shortUrl || data.short_url || 
               data.url || data.short || data.link || 
               (data.data && (data.data.url || data.data.short || data.data));
      }
      return null;
    }
  },
  'suo.yt': {
    name: 'suo.yt',
    endpoint: 'https://suo.yt/short',
    methods: [
      {
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        paramName: 'url',
        buildPayload: (longUrl) => {
          const params = new URLSearchParams();
          params.append('url', longUrl);
          return params.toString();
        }
      },
      {
        type: 'POST',
        contentType: 'multipart/form-data',
        paramName: 'longUrl',
        buildPayload: (longUrl) => {
          const formData = new FormData();
          formData.append('longUrl', longUrl);
          return formData;
        }
      }
    ],
    parseResponse: (data) => {
      if (!data) return null;
      if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return data.ShortUrl || data.shortUrl || data.short_url || 
               data.url || data.short || data.link || 
               (data.data && (data.data.url || data.data.short || data.data));
      }
      return null;
    }
  }
};

/**
 * Get provider configuration by endpoint URL
 */
export function getProviderByEndpoint(endpoint) {
  if (!endpoint) return null;
  
  // Match by endpoint URL
  for (const [key, config] of Object.entries(SHORT_LINK_PROVIDERS)) {
    if (endpoint.includes(key) || endpoint === config.endpoint) {
      return config;
    }
  }
  
  // Default fallback configuration
  return {
    name: 'custom',
    endpoint: endpoint,
    methods: [
      {
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        paramName: 'url',
        buildPayload: (longUrl) => {
          const params = new URLSearchParams();
          params.append('url', longUrl);
          return params.toString();
        }
      },
      {
        type: 'POST',
        contentType: 'multipart/form-data',
        paramName: 'longUrl',
        buildPayload: (longUrl) => {
          const formData = new FormData();
          formData.append('longUrl', longUrl);
          return formData;
        }
      }
    ],
    parseResponse: (data) => {
      if (!data) return null;
      if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return data.ShortUrl || data.shortUrl || data.short_url || 
               data.url || data.short || data.link || 
               (data.data && (data.data.url || data.data.short || data.data));
      }
      return null;
    }
  };
}

/**
 * Error types for better error handling
 */
export const ShortLinkErrorType = {
  CORS: 'CORS',
  PARAMETER: 'PARAMETER',
  AUTH: 'AUTH',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER: 'SERVER',
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
  PARSE: 'PARSE',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Classify error for proper user messaging
 */
export function classifyError(error) {
  if (!error) {
    return { type: ShortLinkErrorType.UNKNOWN, message: '未知错误' };
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return { 
      type: ShortLinkErrorType.TIMEOUT, 
      message: '请求超时，服务响应过慢' 
    };
  }

  // Network error (no response)
  if (!error.response) {
    // Check if it's a CORS issue
    if (error.message?.includes('Network Error') || error.message?.includes('CORS')) {
      return { 
        type: ShortLinkErrorType.CORS, 
        message: '服务跨域受限，请尝试其他短链服务' 
      };
    }
    return { 
      type: ShortLinkErrorType.NETWORK, 
      message: '网络连接失败，请检查网络或尝试其他服务' 
    };
  }

  const status = error.response.status;
  
  // Parameter errors
  if (status === 400 || status === 422) {
    return { 
      type: ShortLinkErrorType.PARAMETER, 
      message: 'URL编码或参数无效，已改为复制原始链接' 
    };
  }

  // Authentication errors
  if (status === 401 || status === 403) {
    return { 
      type: ShortLinkErrorType.AUTH, 
      message: '服务需要凭证或访问受限，请尝试其他服务' 
    };
  }

  // Rate limiting
  if (status === 429) {
    return { 
      type: ShortLinkErrorType.RATE_LIMIT, 
      message: '已达频率限制，请稍后重试或更换服务' 
    };
  }

  // Server errors
  if (status >= 500) {
    return { 
      type: ShortLinkErrorType.SERVER, 
      message: '短链服务暂时不可用，已改为复制原始链接' 
    };
  }

  return { 
    type: ShortLinkErrorType.UNKNOWN, 
    message: '短链接生成失败' 
  };
}

/**
 * Log diagnostic information (dev only)
 */
export function logDiagnostics(context, data) {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.group(`[ShortLink] ${context} - ${timestamp}`);
    console.log(data);
    console.groupEnd();
  }
}

/**
 * Generate short URL with provider adapter and retry logic
 * @param {Object} axios - Axios instance
 * @param {string} longUrl - Long URL to shorten
 * @param {string} providerEndpoint - Provider endpoint URL
 * @param {number} timeout - Request timeout in ms
 * @returns {Promise<string|null>} - Short URL or null
 */
export async function generateShortUrl(axios, longUrl, providerEndpoint, timeout = 10000) {
  const provider = getProviderByEndpoint(providerEndpoint);
  
  logDiagnostics('Provider Configuration', {
    provider: provider.name,
    endpoint: provider.endpoint,
    methodsCount: provider.methods.length
  });

  // Try each method configuration
  for (let i = 0; i < provider.methods.length; i++) {
    const method = provider.methods[i];
    
    try {
      logDiagnostics(`Attempt ${i + 1}/${provider.methods.length}`, {
        type: method.type,
        contentType: method.contentType,
        paramName: method.paramName
      });

      const payload = method.buildPayload(longUrl);
      const headers = {};
      
      // Set Content-Type header (FormData will set it automatically with boundary)
      if (method.contentType !== 'multipart/form-data') {
        headers['Content-Type'] = method.contentType;
      }

      const response = await axios.post(provider.endpoint, payload, {
        headers,
        timeout
      });

      logDiagnostics('Response Received', {
        status: response.status,
        dataType: typeof response.data,
        data: response.data
      });

      const shortUrl = provider.parseResponse(response.data);
      
      if (shortUrl && /^https?:\/\//i.test(shortUrl)) {
        logDiagnostics('Success', { shortUrl });
        return shortUrl;
      } else {
        logDiagnostics('Parse Failed', { 
          parsedResult: shortUrl,
          rawData: response.data 
        });
      }
    } catch (error) {
      const errorInfo = classifyError(error);
      
      logDiagnostics(`Attempt ${i + 1} Failed`, {
        errorType: errorInfo.type,
        errorMessage: errorInfo.message,
        status: error.response?.status,
        data: error.response?.data,
        errorDetails: error.message
      });

      // If it's a CORS, auth, or rate limit error, don't retry other methods
      if ([ShortLinkErrorType.CORS, ShortLinkErrorType.AUTH, ShortLinkErrorType.RATE_LIMIT].includes(errorInfo.type)) {
        throw error;
      }
      
      // If this is the last method, throw the error
      if (i === provider.methods.length - 1) {
        throw error;
      }
      
      // Otherwise, continue to next method
      continue;
    }
  }

  // All methods failed to produce valid short URL
  return null;
}
