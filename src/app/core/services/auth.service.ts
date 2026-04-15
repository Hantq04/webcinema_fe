import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly user = signal<string | null>(null);

  readonly isAuthenticated = computed(() => this.user() !== null);

  login(userName: string): void {
    this.user.set(userName);
  }

  logout(): void {
    this.user.set(null);
  }
}