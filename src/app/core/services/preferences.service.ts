import { Injectable } from '@angular/core';

export interface AppPreferences {
  currency: string;
  theme: string;
  pageSize: number;
  recentCategories: string[];
  recentTags: string[];
  lastSelectedType: string;
  compactTable: boolean;
  lastActiveTab: string;
  rememberedEmailHint?: string;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  currency: 'USD',
  theme: 'white-red',
  pageSize: 15,
  recentCategories: ['Food & Dining', 'Transportation', 'Housing & Rent', 'Utilities & Bills'],
  recentTags: ['groceries', 'utilities', 'salary', 'cloud'],
  lastSelectedType: '',
  compactTable: false,
  lastActiveTab: 'dashboard',
  rememberedEmailHint: '',
};

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly STORAGE_KEY = 'app_preferences';

  getPreferences(): AppPreferences {
    if (typeof localStorage === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  savePreferences(prefs: Partial<AppPreferences>): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save preferences to localStorage', e);
    }
  }

  updateRecentCategory(category: string): void {
    const prefs = this.getPreferences();
    const categories = [category, ...prefs.recentCategories.filter((c) => c !== category)].slice(0, 8);
    this.savePreferences({ recentCategories: categories });
  }

  updateRecentTag(tag: string): void {
    const prefs = this.getPreferences();
    const tags = [tag, ...prefs.recentTags.filter((t) => t !== tag)].slice(0, 10);
    this.savePreferences({ recentTags: tags });
  }
}
