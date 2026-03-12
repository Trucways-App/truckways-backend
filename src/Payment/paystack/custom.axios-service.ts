import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse,AxiosHeaders,InternalAxiosRequestConfig } from 'axios';


@Injectable()
export class CustomAxiosService {
  private readonly axiosInstance: AxiosInstance;
  private headers: Record<string, string> = {};

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
    });

    // Request Interceptor with proper header handling
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Create new headers instance
        const headers = new AxiosHeaders(config.headers);
        
        // Set default Content-Type if not already set
        headers.set('Content-Type', 'application/json');
        
        // Add custom headers
        Object.entries(this.headers).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        // Update config with new headers
        config.headers = headers;
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor remains the same
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          return Promise.resolve(new CustomAxiosResponse(
            error.response.status,
            error.response.statusText,
            error.response.data
          ));
        }
        return Promise.resolve(new CustomAxiosResponse(
          500,
          error.message
        ));
      }
    );
  }

  public init(headers: Record<string, string>) {
    this.headers = headers;
  }

  public async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<CustomAxiosResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data,
        config
      );
      
      return new CustomAxiosResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return new CustomAxiosResponse(
          error.response.status,
          error.response.statusText,
          error.response.data
        );
      }
      return new CustomAxiosResponse(500, 'Internal Server Error');
    }
  }

  public async get<T>(
    url: string,
    queryParams?: Record<string, string | number | any>,
    config?: AxiosRequestConfig
  ): Promise<CustomAxiosResponse<T>> {
    try {
      const queryString = queryParams
        ? '?' + new URLSearchParams(
            Object.entries(queryParams).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
            }, {} as Record<string, string>)
          ).toString()
        : '';

      const response: AxiosResponse<T> = await this.axiosInstance.get(
        url + queryString,
        config
      );
      
      return new CustomAxiosResponse(
        response.status,
        response.statusText,
        response.data
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return new CustomAxiosResponse(
          error.response.status,
          error.response.statusText,
          error.response.data
        );
      }
      return new CustomAxiosResponse(500, 'Internal Server Error');
    }
  }

  public updateConfig(config: AxiosRequestConfig) {
    Object.assign(this.axiosInstance.defaults, config);
  }
}

export class CustomAxiosResponse<T> {
  constructor(
    public readonly status: number,
    public readonly message?: string,
    public readonly data?: T
  ) {}
}