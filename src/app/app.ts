import { Component, signal, computed, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';

interface QRConfig {
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  colorDark: string;
  colorLight: string;
  margin: number;
}

interface QRPreset {
  label: string;
  icon: string;
  placeholder: string;
  prefix: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, QRCodeComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  @ViewChild('qrCodeElement') qrCodeElement!: ElementRef;

  // QR Config
  qrText = signal('https://example.com');
  qrSize = signal(280);
  errorCorrectionLevel = signal<'L' | 'M' | 'Q' | 'H'>('M');
  colorDark = signal('#1a0533');
  colorLight = signal('#ffffff');
  qrMargin = signal(2);

  // UI State
  activeTab = signal<'url' | 'text' | 'email' | 'phone' | 'wifi'>('url');
  inputValue = signal('https://example.com');
  isDownloading = signal(false);
  isCopied = signal(false);
  showAdvanced = signal(false);

  // Input fields for special types
  emailAddress = signal('');
  emailSubject = signal('');
  emailBody = signal('');
  phoneNumber = signal('');
  wifiSsid = signal('');
  wifiPassword = signal('');
  wifiSecurity = signal<'WPA' | 'WEP' | 'nopass'>('WPA');

  // Computed QR text based on tab
  computedQrText = computed(() => {
    const tab = this.activeTab();
    switch (tab) {
      case 'url':
        return this.inputValue() || 'https://example.com';
      case 'text':
        return this.inputValue() || 'Your text here';
      case 'email':
        const emailParts = [];
        if (this.emailSubject()) emailParts.push(`subject=${encodeURIComponent(this.emailSubject())}`);
        if (this.emailBody()) emailParts.push(`body=${encodeURIComponent(this.emailBody())}`);
        return `mailto:${this.emailAddress()}${emailParts.length ? '?' + emailParts.join('&') : ''}`;
      case 'phone':
        return `tel:${this.phoneNumber()}`;
      case 'wifi':
        return `WIFI:T:${this.wifiSecurity()};S:${this.wifiSsid()};P:${this.wifiPassword()};;`;
      default:
        return this.inputValue();
    }
  });

  errorLevels = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'High (25%)' },
    { value: 'H', label: 'Max (30%)' },
  ] as const;

  tabs: { id: 'url' | 'text' | 'email' | 'phone' | 'wifi'; label: string; icon: string }[] = [
    { id: 'url', label: 'URL', icon: '🔗' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'email', label: 'Email', icon: '✉️' },
    { id: 'phone', label: 'Phone', icon: '📱' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
  ];

  colorPresets = [
    { dark: '#1a0533', light: '#ffffff', label: 'Purple Night' },
    { dark: '#0f172a', light: '#f8fafc', label: 'Midnight' },
    { dark: '#064e3b', light: '#ecfdf5', label: 'Forest' },
    { dark: '#1e3a5f', light: '#eff6ff', label: 'Ocean' },
    { dark: '#450a0a', light: '#fff1f2', label: 'Crimson' },
    { dark: '#1c1917', light: '#fafaf9', label: 'Obsidian' },
  ];

  setTab(tab: 'url' | 'text' | 'email' | 'phone' | 'wifi') {
    this.activeTab.set(tab);
    this.inputValue.set('');
  }

  applyColorPreset(preset: { dark: string; light: string }) {
    this.colorDark.set(preset.dark);
    this.colorLight.set(preset.light);
  }

  async downloadQR(format: 'png' | 'svg' = 'png') {
    this.isDownloading.set(true);
    try {
      const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.${format}`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } finally {
      setTimeout(() => this.isDownloading.set(false), 1000);
    }
  }

  async copyToClipboard() {
    const canvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            this.isCopied.set(true);
            setTimeout(() => this.isCopied.set(false), 2000);
          } catch {
            // Fallback
          }
        }
      });
    }
  }

  getQrTextLength() {
    return this.computedQrText().length;
  }

  toggleAdvanced() {
    this.showAdvanced.update(v => !v);
  }
}
