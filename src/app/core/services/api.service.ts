import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /**
   * Automatically determine baseUrl based on current hostname.
   * - If accessing via http://localhost:4200 -> API will be http://localhost:8080
   * - If accessing via http://192.168.x.x:4200 -> API will be http://192.168.x.x:8080
   */
  get baseUrl(): string {
    const hostname = window.location.hostname;
    const port = '8080'; // Default Backend port
    return `http://${hostname}:${port}`;
  }

  apiUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}