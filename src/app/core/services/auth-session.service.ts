import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  // Survives page refresh (F5) via tab-isolated sessionStorage.
  // The token is STRICTLY NEVER written to localStorage.
  // When the browser tab or window is closed, sessionStorage is automatically cleared.
  private readonly SESSION_KEY = 'apex_session_token';
  private inMemoryToken: string | null = null;

  constructor() {
    this.purgeLocalStorageCredentials();
    this.restoreSession();
  }

  private restoreSession(): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(this.SESSION_KEY);
        if (stored) {
          this.inMemoryToken = stored;
        }
      } catch (e) {
        // Storage restricted
      }
    }
  }

  setToken(token: string | null): void {
    this.inMemoryToken = token;
    this.purgeLocalStorageCredentials();

    if (typeof sessionStorage !== 'undefined') {
      try {
        if (token) {
          sessionStorage.setItem(this.SESSION_KEY, token);
        } else {
          sessionStorage.removeItem(this.SESSION_KEY);
        }
      } catch (e) {
        // Storage restricted
      }
    }
  }

  getToken(): string | null {
    if (!this.inMemoryToken && typeof sessionStorage !== 'undefined') {
      this.restoreSession();
    }
    return this.inMemoryToken;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  clear(): void {
    this.inMemoryToken = null;
    this.purgeLocalStorageCredentials();
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(this.SESSION_KEY);
      } catch (e) {
        // Storage restricted
      }
    }
  }

  // Explicit security purge guaranteeing localStorage never stores auth credentials
  private purgeLocalStorageCredentials(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        localStorage.removeItem(this.SESSION_KEY);
      } catch (e) {
        // Storage restricted
      }
    }
  }
}
