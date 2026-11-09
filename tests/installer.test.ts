import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { generateManifest } from '../scripts/generate-updater-manifest.mjs';
import { checkForAppUpdate } from '../src/services/updaterService';

const rootDir = process.cwd();
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));

describe('Phase 16 - Bundler & Installer Configs', () => {
  it('configures NSIS installer with currentUser mode and branding assets', () => {
    const nsis = tauriConf.bundle?.windows?.nsis;
    expect(nsis).toBeDefined();
    expect(nsis.installMode).toBe('currentUser');
    expect(nsis.languages).toContain('en-US');
    expect(nsis.displayLanguageSelector).toBe(false);
    expect(nsis.installerIcon).toBe('icons/icon.ico');
    expect(nsis.headerImage).toBe('icons/Square150x150Logo.png');
    expect(nsis.sidebarImage).toBe('icons/Square150x150Logo.png');
  });

  it('configures WiX MSI installer with valid upgrade code GUID', () => {
    const wix = tauriConf.bundle?.windows?.wix;
    expect(wix).toBeDefined();
    expect(wix.language).toContain('en-US');
    const guidPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/u;
    expect(wix.upgradeCode).toMatch(guidPattern);
  });

  it('declares nsis and msi in bundle targets', () => {
    const targets = tauriConf.bundle?.targets;
    expect(targets).toContain('nsis');
    expect(targets).toContain('msi');
  });
});

describe('Phase 16 - App Icon Suite Integrity', () => {
  it('verifies icon.ico contains multi-resolution icon frames', () => {
    const icoPath = path.join(rootDir, 'src-tauri', 'icons', 'icon.ico');
    expect(fs.existsSync(icoPath)).toBe(true);
    const buf = fs.readFileSync(icoPath);
    const count = buf.readUInt16LE(4);
    expect(count).toBeGreaterThanOrEqual(5);

    const dimensions: string[] = [];
    for (let i = 0; i < count; i++) {
      const w = buf.readUInt8(6 + i * 16) || 256;
      const h = buf.readUInt8(7 + i * 16) || 256;
      dimensions.push(`${w}x${h}`);
    }

    expect(dimensions).toContain('16x16');
    expect(dimensions).toContain('32x32');
    expect(dimensions).toContain('48x48');
    expect(dimensions).toContain('256x256');
  });

  it('verifies 512x512 master PNG and Windows square tile logos exist', () => {
    const iconPng = path.join(rootDir, 'src-tauri', 'icons', 'icon.png');
    expect(fs.existsSync(iconPng)).toBe(true);
    const buf = fs.readFileSync(iconPng);
    expect(buf.readUInt32BE(16)).toBe(512);
    expect(buf.readUInt32BE(20)).toBe(512);

    const square150 = path.join(rootDir, 'src-tauri', 'icons', 'Square150x150Logo.png');
    expect(fs.existsSync(square150)).toBe(true);
  });
});

describe('Phase 16 - Updater Manifest & Service', () => {
  it('configures updater plugin with GitHub releases endpoint in tauri.conf.json', () => {
    const updater = tauriConf.plugins?.updater;
    expect(updater).toBeDefined();
    expect(updater.endpoints).toBeInstanceOf(Array);
    expect(updater.endpoints[0]).toContain('github.com');
    expect(updater.endpoints[0]).toContain('latest.json');
    expect(updater.pubkey).toBeDefined();
  });

  it('generates valid Tauri v2 updater manifest via generateManifest helper', () => {
    const manifest = generateManifest(
      '0.2.0',
      'Test notes',
      'dGVzdF9zaWduYXR1cmVfYmFzZTY0',
      'https://github.com/nakraku/nakraku-stash/releases/download/v0.2.0/setup.zip'
    );
    expect(manifest.version).toBe('0.2.0');
    expect(manifest.platforms['windows-x86_64'].url).toContain('setup.zip');
    expect(manifest.pub_date).toBeDefined();
  });

  it('safely handles non-Tauri environment in updaterService without throwing', async () => {
    const info = await checkForAppUpdate();
    expect(info.available).toBe(false);
    expect(info.currentVersion).toBe('0.1.0');
    expect(info.version).toBeNull();
  });
});

describe('Phase 16 - Release Workflow & Signing Scripts', () => {
  it('verifies release workflow exists and triggers on tag push', () => {
    const releaseYml = path.join(rootDir, '.github', 'workflows', 'release.yml');
    expect(fs.existsSync(releaseYml)).toBe(true);
    const content = fs.readFileSync(releaseYml, 'utf-8').replace(/\r\n/gu, '\n');
    expect(content).toContain("tags:\n      - 'v*'");
    expect(content).toContain('scripts/sign-release.ps1');
    expect(content).toContain('scripts/generate-checksums.ps1');
    expect(content).toContain('latest.json');
  });

  it('verifies signing and checksum scripts exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'scripts', 'sign.ps1'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'scripts', 'sign-release.ps1'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'scripts', 'generate-checksums.ps1'))).toBe(true);
  });
});
