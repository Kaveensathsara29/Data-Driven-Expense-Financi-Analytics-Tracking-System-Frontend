import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../state/store.service';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card animate-fade-in">
        <div class="auth-brand">
          <div class="brand-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 class="brand-title">MASTER<span class="red-text">EXPENSE</span></h1>
          <p class="brand-tagline">Enterprise Financial Management & Expense Tracking</p>
        </div>

        <!-- Mode Tabs -->
        <div class="auth-tabs">
          <button
            class="tab-btn"
            [class.active]="isLoginMode"
            (click)="isLoginMode = true"
          >
            Sign In
          </button>
          <button
            class="tab-btn"
            [class.active]="!isLoginMode"
            (click)="isLoginMode = false"
          >
            Create Account
          </button>
        </div>

        <!-- Quick Demo Login Button -->
        <div class="demo-box" *ngIf="isLoginMode">
          <div class="demo-info">
            <span class="demo-label">Demo Credentials:</span>
            <span class="demo-code">admin@gmail.com / 123456</span>
          </div>
        </div>

        <!-- Login Form -->
        <form *ngIf="isLoginMode" (ngSubmit)="handleLogin()" class="auth-form">
          <div class="form-group">
            <label>Work Email</label>
            <input
              type="email"
              name="email"
              autocomplete="username"
              [(ngModel)]="loginEmail"
              placeholder=""
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              [(ngModel)]="loginPassword"
              placeholder=""
              required
              class="form-control"
            />
          </div>

          <button type="submit" class="btn-submit" [disabled]="(store.isLoading$ | async) || !loginEmail || !loginPassword">
            <span *ngIf="!(store.isLoading$ | async)">Sign In to Dashboard</span>
            <span *ngIf="store.isLoading$ | async">Authenticating...</span>
          </button>
        </form>

        <!-- Register Form -->
        <form *ngIf="!isLoginMode" (ngSubmit)="handleRegister()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="regName"
              autocomplete="name"
              [(ngModel)]="regName"
              placeholder="Alexander Wright"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Work Email</label>
            <input
              type="email"
              name="regEmail"
              autocomplete="email"
              [(ngModel)]="regEmail"
              placeholder="alex&#64;company.com"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Create Password</label>
            <input
              type="password"
              name="regPassword"
              autocomplete="new-password"
              [(ngModel)]="regPassword"
              placeholder="At least 6 characters"
              required
              minlength="6"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Base Currency</label>
            <select name="regCurrency" [(ngModel)]="regCurrency" class="form-control">
              <option value="USD">USD (Rs) - Sri Lanka Rupee</option>
              <option value="USD">USD ($) - United States Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
            </select>
          </div>

          <button type="submit" class="btn-submit" [disabled]="(store.isLoading$ | async) || !regName || !regEmail || !regPassword">
            <span *ngIf="!(store.isLoading$ | async)">Create My Account</span>
            <span *ngIf="store.isLoading$ | async">Creating Account...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="footer-note">
            🔒 <strong>Zero LocalStorage Token Exposure:</strong> Auth tokens are maintained strictly in-memory. Only non-sensitive display preferences are preserved locally.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at 50% 0%, #FFF1F2 0%, #F8FAFC 70%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      padding: 40px 36px;
      box-shadow: 0 20px 40px -15px rgba(225, 29, 72, 0.12), 0 0 0 1px var(--border-subtle);
      border: 1px solid var(--border-subtle);
    }

    .auth-brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 28px;
    }

    .brand-badge {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(225, 29, 72, 0.3);
      margin-bottom: 12px;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;

      .red-text {
        color: var(--primary-600);
      }
    }

    .brand-tagline {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .auth-tabs {
      display: flex;
      background: var(--bg-subtle);
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      gap: 4px;
    }

    .tab-btn {
      flex: 1;
      padding: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);

      &.active {
        background: #FFFFFF;
        color: var(--primary-600);
        box-shadow: var(--shadow-sm);
      }
    }

    .demo-box {
      margin-bottom: 20px;
      padding: 12px 14px;
      background: var(--primary-50);
      border: 1px dashed var(--primary-300);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .demo-info {
      display: flex;
      flex-direction: column;
    }

    .demo-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--primary-700);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .demo-code {
      font-size: 0.725rem;
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }

    .btn-demo-autofill {
      padding: 6px 12px;
      background: var(--primary-600);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: var(--radius-sm);
      white-space: nowrap;

      &:hover {
        background: var(--primary-700);
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
    }

    .form-control {
      padding: 11px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      font-size: 0.9rem;
      color: var(--text-primary);
      background: #FFFFFF;
      transition: all 0.2s ease;

      &:focus {
        border-color: var(--primary-600);
        box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.15);
      }
    }

    .btn-submit {
      margin-top: 8px;
      padding: 12px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      color: #FFFFFF;
      font-size: 0.95rem;
      font-weight: 700;
      box-shadow: var(--shadow-red);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(225, 29, 72, 0.4);
      }
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 16px;
    }

    .footer-note {
      font-size: 0.725rem;
      color: var(--text-muted);
    }
  `],
})
export class AuthComponent implements OnInit {
  store = inject(StoreService);
  authSession = inject(AuthSessionService);
  router = inject(Router);

  isLoginMode = true;

  loginEmail = this.store.preferences$.getValue().rememberedEmailHint || '';
  loginPassword = '';

  regName = '';
  regEmail = '';
  regPassword = '';
  regCurrency = this.store.preferences$.getValue().currency || 'USD';

  ngOnInit(): void {
    if (this.authSession.hasToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleLogin() {
    if (!this.loginEmail || !this.loginPassword) return;
    this.store.login(this.loginEmail, this.loginPassword).subscribe();
  }

  handleRegister() {
    if (!this.regName || !this.regEmail || !this.regPassword) return;
    this.store.register(this.regName, this.regEmail, this.regPassword, this.regCurrency).subscribe();
  }
}
