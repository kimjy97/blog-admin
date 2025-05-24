import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiErrorData {
  message?: string;
  error?: string;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorData>) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      const errorMessage = error.response.data?.error || error.response.data?.message || error.message;
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('네트워크 오류가 발생했습니다. 연결을 확인해주세요.'));
    } else {
      console.error('Error:', error.message);
      return Promise.reject(new Error(error.message));
    }
  }
);

/**
 * API 요청을 위한 Wrapper 함수
 */
const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.get<T>(url, config),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.post<T>(url, data, config),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.put<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.delete<T>(url, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    apiClient.patch<T>(url, data, config),
};

export default api;
