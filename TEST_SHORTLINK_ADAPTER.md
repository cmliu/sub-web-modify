# Short-Link Adapter Testing Guide

## Overview
This document describes the new short-link adapter system and how to test it.

## What Changed

### 1. New Adapter Module (`src/utils/shortlink-adapter.js`)
- **Provider Configuration**: Defines methods, parameters, and response parsing for each provider
- **Multi-Method Retry**: Each provider can have multiple method configurations (url-encoded, JSON, form-data)
- **Error Classification**: Categorizes errors (CORS, Auth, Rate Limit, Server, Timeout, etc.)
- **Diagnostic Logging**: Structured logging for debugging (dev mode only)

### 2. Updated Component (`src/views/Subconverter.vue`)
- **Import Adapter**: Uses the new `generateShortUrl` function
- **Enhanced Error Handling**: Provides specific error messages based on error type
- **Better UI Feedback**: Shows helper text explaining fallback behavior

## Supported Providers

### v1.mk
- **Primary Method**: POST with `application/x-www-form-urlencoded`, parameter `url`
- **Fallback 1**: POST with `application/json`, parameter `url`
- **Fallback 2**: POST with `multipart/form-data`, parameter `longUrl`

### d1.mk, dlj.tf, suo.yt
- **Primary Method**: POST with `application/x-www-form-urlencoded`, parameter `url`
- **Fallback**: POST with `multipart/form-data`, parameter `longUrl`

## Error Handling

### Error Types and User Messages

| Error Type | HTTP Status | User Message |
|------------|-------------|--------------|
| CORS | Network Error | 服务跨域受限，请尝试其他短链服务 |
| PARAMETER | 400, 422 | URL编码或参数无效，已改为复制原始链接 |
| AUTH | 401, 403 | 服务需要凭证或访问受限，请尝试其他服务 |
| RATE_LIMIT | 429 | 已达频率限制，请稍后重试或更换服务 |
| SERVER | 5xx | 短链服务暂时不可用，已改为复制原始链接 |
| TIMEOUT | ECONNABORTED | 请求超时，服务响应过慢 |
| NETWORK | No Response | 网络连接失败，请检查网络或尝试其他服务 |

### Fallback Behavior
- All errors trigger automatic fallback to copying the original long URL
- User is notified with a specific error message
- The long URL is displayed in the result field
- Copy button remains functional

## Testing Procedure

### 1. Test Successful Generation
1. Enter a valid subscription URL
2. Select client type
3. Click "生成订阅链接"
4. Select a short-link provider (e.g., v1.mk)
5. Click "生成短链接"
6. **Expected**: Short URL generated and copied to clipboard

### 2. Test CORS Error
1. If v1.mk blocks CORS requests from the browser
2. **Expected**: Message "服务跨域受限，请尝试其他短链服务"
3. Original long URL is displayed and copied

### 3. Test Rate Limiting
1. Generate many short links in quick succession
2. **Expected**: Message "已达频率限制，稍后重试或更换服务"
3. Original long URL is displayed and copied

### 4. Test Parameter Errors
1. If server returns 400 or 422
2. **Expected**: Message "URL编码或参数无效，已改为复制原始链接"
3. Original long URL is displayed and copied

### 5. Test Timeout
1. If network is slow or service unresponsive
2. **Expected**: Message "请求超时，服务响应过慢" after 10 seconds
3. Original long URL is displayed and copied

### 6. Test Method Fallback
1. Open browser DevTools Console (F12)
2. Generate a short link
3. Check console for diagnostic logs showing method attempts
4. **Expected**: Logs show "Attempt 1/3", "Attempt 2/3", etc. if first method fails

## Diagnostic Logging

### Enable Logging
Diagnostic logs are automatically shown in development mode. Check browser console (F12) to see:

```
[ShortLink] Provider Configuration - 2025-01-05T17:54:44.369Z
  {
    provider: "v1.mk",
    endpoint: "https://v1.mk/short",
    methodsCount: 3
  }

[ShortLink] Attempt 1/3 - 2025-01-05T17:54:44.400Z
  {
    type: "POST",
    contentType: "application/x-www-form-urlencoded",
    paramName: "url"
  }

[ShortLink] Response Received - 2025-01-05T17:54:45.123Z
  {
    status: 200,
    dataType: "object",
    data: { ShortUrl: "https://v1.mk/abc123" }
  }

[ShortLink] Success - 2025-01-05T17:54:45.150Z
  {
    shortUrl: "https://v1.mk/abc123",
    originalLength: 456,
    shortenedLength: 20,
    compressionRatio: "95.6%"
  }
```

### Production Mode
In production, diagnostic logs are disabled. Only user-facing messages are shown.

## Configuration

### Add New Provider
To add a new short-link provider, edit `src/utils/shortlink-adapter.js`:

```javascript
export const SHORT_LINK_PROVIDERS = {
  'newprovider.com': {
    name: 'NewProvider',
    endpoint: 'https://newprovider.com/api/shorten',
    methods: [
      {
        type: 'POST',
        contentType: 'application/json',
        paramName: 'long_url',
        buildPayload: (longUrl) => JSON.stringify({ long_url: longUrl })
      }
    ],
    parseResponse: (data) => {
      return data?.result?.short_url || null;
    }
  }
};
```

Then update `options.shortTypes` in `Subconverter.vue`:

```javascript
shortTypes: {
  "v1.mk": "https://v1.mk/short",
  "d1.mk": "https://d1.mk/short",
  "dlj.tf": "https://dlj.tf/short",
  "suo.yt": "https://suo.yt/short",
  "NewProvider": "https://newprovider.com/api/shorten"  // Add here
}
```

## Acceptance Criteria Checklist

- [x] v1.mk adapter with proper parameter encoding (encodeURIComponent)
- [x] Multiple method fallback (url-encoded → JSON → form-data)
- [x] CORS error detection and user-friendly message
- [x] Rate limiting (429) detection and message
- [x] Auth error (401/403) detection and message
- [x] Parameter error (400/422) detection and message
- [x] Server error (5xx) detection and message
- [x] Timeout detection and message
- [x] Structured diagnostic logging (dev mode only)
- [x] Automatic fallback to long URL with copy to clipboard
- [x] UI helper text explaining fallback behavior
- [x] Build passes without errors
- [x] No impact on other short-link services
- [x] Clear success/failure messages for all scenarios

## Known Issues and Workarounds

### CORS Issues
Some short-link providers may block cross-origin requests from browsers. This is a server-side restriction and cannot be fixed client-side.

**Workaround**: The adapter automatically falls back to copying the long URL. Users are advised to try alternative providers.

### Rate Limiting
Some providers implement aggressive rate limiting. 

**Workaround**: The adapter detects 429 responses and advises users to wait or switch providers.

## Future Improvements

1. **Provider Health Check**: Pre-check provider availability before attempting
2. **Provider Preferences**: Remember last successful provider per user
3. **Retry with Backoff**: Implement exponential backoff for transient failures
4. **Custom Provider UI**: Allow users to add their own short-link services
5. **Caching**: Cache recent short links to avoid duplicate requests
