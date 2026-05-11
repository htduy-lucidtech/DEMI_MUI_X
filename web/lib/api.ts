/**
 * UNIFIED API UTILITY (Native Fetch)
 * Sử dụng một hàm duy nhất cho cả Client và Server.
 */

export async function api_fetch(url: string, options: any = {}) {
  const isServer = typeof window === 'undefined';
  let token: string | undefined;

  // 1. Lấy Token dựa trên môi trường
  if (isServer) {
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        if (cookieStore) {
            token = cookieStore.get("token")?.value;
        }
    } catch (e) {
        // Fallback for non-request context if any
    }
  } else {
    try {
        const Cookies = (await import("js-cookie")).default;
        if (Cookies) {
            token = Cookies.get("token");
        }
        if (!token) {
            token = localStorage.getItem("token") || undefined;
        }
    } catch (e) {}
  }

  // 2. Xác định Base URL linh hoạt cho Docker
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5181/api";

  if (isServer) {
    // Nếu chạy bên trong Docker (Production), sử dụng tên service 'hrm-api'
    // Nếu chạy ở máy thật (Development), vẫn dùng localhost
    const isDocker = process.env.NODE_ENV === 'production';
    if (isDocker) {
      baseUrl = "http://hrm-api:8080/api";
    }
  }
  
  // 2. Thiết lập Headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 3. Xử lý Params (nếu có)
  let finalUrl = `${baseUrl}${url}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 4. Thực hiện Fetch
  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  // 5. Xử lý lỗi tập trung
  if (!response.ok) {
    if (response.status === 401 && !isServer) {
      window.location.href = "/login";
    }
    
    // Đọc nội dung lỗi
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API error: ${response.status}`;
    throw new Error(errorMessage);
  }

  // 6. Trả về dữ liệu dựa trên responseType
  if (options.responseType === 'blob') {
    return { data: await response.blob() };
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return { data: await response.json() };
  }
  
  return { data: response }; 
}

export const api = {
  get: <T = any>(url: string, options?: any): Promise<{ data: T }> => 
    api_fetch(url, { ...options, method: 'GET' }),
  post: <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => 
    api_fetch(url, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  put: <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => 
    api_fetch(url, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  patch: <T = any>(url: string, body?: any, options?: any): Promise<{ data: T }> => 
    api_fetch(url, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    }),
  delete: <T = any>(url: string, options?: any): Promise<{ data: T }> => 
    api_fetch(url, { ...options, method: 'DELETE' }),
};

export default api;

// Alias cho Server Components
export const fetchServer = (url: string, options?: RequestInit) => api_fetch(url, options).then(res => res.data);
