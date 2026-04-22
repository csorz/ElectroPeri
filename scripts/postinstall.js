const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// 平台特定的模块配置
const platformModules = {
  // 仅在 Linux 上可用的模块
  linux: [
    'pigpio',
    'onoff',
    'i2c-bus',
    'spi-device',
    'ds18b20'
  ],
  // 需要 native build 的模块
  native: [
    '@abandonware/noble',
    'node-hid',
    'usb',
    'raw-keyboard'
  ]
};

// Stub 模板 (仅用于 Linux-only 模块)
function createStub(moduleName, message) {
  return `// Stub for ${moduleName} - not available on this platform
module.exports = new Proxy({}, {
  get() {
    throw new Error('${message}');
  }
});
`;
}

function createStubModule(moduleName, message) {
  const parts = moduleName.split('/');
  let modulePath;

  if (parts.length > 1) {
    modulePath = path.join(ROOT, 'node_modules', parts[0], parts[1]);
  } else {
    modulePath = path.join(ROOT, 'node_modules', moduleName);
  }

  fs.mkdirSync(modulePath, { recursive: true });
  fs.writeFileSync(path.join(modulePath, 'index.js'), createStub(moduleName, message));
  fs.writeFileSync(path.join(modulePath, 'package.json'), JSON.stringify({
    name: moduleName,
    version: '0.0.0-stub',
    main: 'index.js'
  }, null, 2));

  console.log(`  ✓ Created stub for: ${moduleName}`);
}

// 检查 Visual Studio (包括非标准路径)
function checkVisualStudio() {
  const vsPaths = [
    'C:\\Program Files\\Microsoft Visual Studio\\2022',
    'C:\\Program Files\\Microsoft Visual Studio\\2019',
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019',
    'C:\\Program Files\\Microsoft Visual Studio\\2017',
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017',
    'D:\\MVS\\Microsoft Visual Studio\\18',
    'D:\\MVS\\Microsoft Visual Studio\\2022',
    'D:\\MVS\\Microsoft Visual Studio\\2019',
  ];

  for (const p of vsPaths) {
    if (fs.existsSync(p)) {
      console.log(`✓ Found Visual Studio at: ${p}`);
      return true;
    }
  }

  // Also check via vswhere
  try {
    const output = execSync(
      '"C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe" -latest -property installationPath',
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    if (output && fs.existsSync(output)) {
      console.log(`✓ Found Visual Studio via vswhere: ${output}`);
      return true;
    }
  } catch {
    // vswhere not available
  }

  return false;
}

// Patch node-gyp to support VS 2026 (versionMajor 18)
function patchNodeGyp() {
  const nodeGypPaths = [
    path.join(ROOT, 'node_modules', '.pnpm', 'node-gyp@10.3.1', 'node_modules', 'node-gyp', 'lib', 'find-visualstudio.js'),
    path.join(ROOT, 'node_modules', '.pnpm', 'node-gyp@11.5.0', 'node_modules', 'node-gyp', 'lib', 'find-visualstudio.js'),
  ];

  for (const filePath of nodeGypPaths) {
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // Add VS 2026 to supported years arrays
    if (!content.includes('2026')) {
      content = content.replace(
        /\[2019, 2022\]/g,
        '[2019, 2022, 2026]'
      );
      // Add versionMajor 18 -> versionYear 2026 mapping
      if (!content.includes('versionMajor === 18')) {
        content = content.replace(
          /if \(ret\.versionMajor === 17\) \{\s*ret\.versionYear = 2022\s*return ret\s*\}/,
          `if (ret.versionMajor === 17) {
      ret.versionYear = 2022
      return ret
    }
    if (ret.versionMajor === 18) {
      ret.versionYear = 2026
      return ret
    }`
        );
      }
      // Add toolset for VS 2026 (v145 is the actual PlatformToolset under v180 platform)
      if (!content.includes("versionYear === 2026")) {
        content = content.replace(
          /else if \(versionYear === 2022\) \{\s*return 'v143'\s*\}/g,
          `else if (versionYear === 2022) {
      return 'v143'
    } else if (versionYear === 2026) {
      return 'v145'
    }`
        );
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Patched node-gyp: ${path.basename(path.dirname(path.dirname(filePath)))}`);
    }
  }
}

// Rebuild native modules for Electron
function rebuildNativeModules() {
  console.log('\n=== Rebuilding native modules for Electron ===\n');

  // Patch node-gyp first
  patchNodeGyp();

  // Find actual pnpm paths for native modules
  const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm');
  const modulesToRebuild = [];

  for (const mod of platformModules.native) {
    // Convert @scope/name to @scope+name for pnpm directory prefix
    const modPrefix = '@' + mod.replace('/', '+').replace('@', '');
    try {
      const entries = fs.readdirSync(pnpmDir).filter(e => e.startsWith(modPrefix));
      if (entries.length > 0) {
        const modPath = path.join(pnpmDir, entries[0], 'node_modules', mod);
        if (fs.existsSync(modPath)) {
          modulesToRebuild.push({ name: mod, path: modPath });
        }
      }
    } catch {
      // ignore
    }
  }

  let allSuccess = true;
  for (const { name, path: modPath } of modulesToRebuild) {
    try {
      console.log(`  Rebuilding ${name}...`);
      execSync(`npx electron-rebuild --module-dir "${modPath}"`, {
        cwd: ROOT,
        stdio: 'pipe'
      });
      console.log(`  ✓ ${name} rebuilt successfully`);
    } catch (error) {
      console.log(`  ✖ ${name} rebuild failed`);
      allSuccess = false;
    }
  }

  return allSuccess;
}

// Fix stub package.json files that electron-rebuild/pnpm may have created
function fixNativeModuleStubs() {
  const fixes = [
    {
      // @abandonware/noble - restore index.js and package.json
      name: '@abandonware/noble',
      findPath: (pnpmDir) => {
        const entries = fs.readdirSync(pnpmDir).filter(e => e.startsWith('@abandonware+noble@'));
        return entries.length > 0 ? path.join(pnpmDir, entries[0], 'node_modules', '@abandonware', 'noble') : null;
      },
      fix: (modPath) => {
        const pkgPath = path.join(modPath, 'package.json');
        const indexPath = path.join(modPath, 'index.js');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (pkg.version === '0.0.0-stub') {
          // Restore index.js
          fs.writeFileSync(indexPath, `module.exports = require('./with-bindings')(require('./lib/resolve-bindings')());\n`);
          // Restore package.json
          fs.writeFileSync(pkgPath, JSON.stringify({
            name: '@abandonware/noble',
            version: '1.9.2-26',
            main: 'index.js'
          }, null, 2));
          return true;
        }
        return false;
      }
    },
    {
      // node-hid - fix package.json main to point to nodehid.js
      name: 'node-hid',
      findPath: (pnpmDir) => {
        const entries = fs.readdirSync(pnpmDir).filter(e => e.startsWith('node-hid@'));
        return entries.length > 0 ? path.join(pnpmDir, entries[0], 'node_modules', 'node-hid') : null;
      },
      fix: (modPath) => {
        const pkgPath = path.join(modPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (pkg.version === '0.0.0-stub' || pkg.main !== 'nodehid.js') {
          fs.writeFileSync(pkgPath, JSON.stringify({
            name: 'node-hid',
            version: '3.3.0',
            main: 'nodehid.js'
          }, null, 2));
          return true;
        }
        return false;
      }
    },
    {
      // usb - fix package.json main to point to dist/index.js
      name: 'usb',
      findPath: (pnpmDir) => {
        const entries = fs.readdirSync(pnpmDir).filter(e => e.startsWith('usb@'));
        return entries.length > 0 ? path.join(pnpmDir, entries[0], 'node_modules', 'usb') : null;
      },
      fix: (modPath) => {
        const pkgPath = path.join(modPath, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (pkg.version === '0.0.0-stub' || pkg.main !== 'dist/index.js') {
          fs.writeFileSync(pkgPath, JSON.stringify({
            name: 'usb',
            version: '2.17.0',
            main: 'dist/index.js'
          }, null, 2));
          return true;
        }
        return false;
      }
    }
  ];

  const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm');
  for (const { name, findPath, fix } of fixes) {
    try {
      const modPath = findPath(pnpmDir);
      if (modPath && fs.existsSync(modPath)) {
        const fixed = fix(modPath);
        if (fixed) {
          console.log(`  ✓ Fixed stub for: ${name}`);
        }
      }
    } catch (e) {
      console.log(`  ⚠ Could not fix ${name}: ${e.message}`);
    }
  }
}

function main() {
  const platform = os.platform();
  console.log(`\n=== Postinstall for platform: ${platform} ===\n`);

  if (platform === 'win32') {
    // Linux 专用模块 - 创建 stub
    console.log('Creating stubs for Linux-only modules...');
    platformModules.linux.forEach(mod => {
      createStubModule(mod, `${mod} is only available on Raspberry Pi/Linux.`);
    });

    // 检查 VS Build Tools
    const hasVSTools = checkVisualStudio();
    if (!hasVSTools) {
      console.log('\n⚠️  Visual Studio Build Tools not detected.');
      console.log('   Creating stubs for modules that require VS Build Tools:');
      platformModules.native.forEach(mod => {
        createStubModule(mod, `${mod} is not available. Install Visual Studio Build Tools on Windows or run on Linux.`);
      });
      console.log('\n   To enable these modules, install Visual Studio Build Tools:');
      console.log('   https://visualstudio.microsoft.com/visual-cpp-build-tools/');
    } else {
      // 有 VS Build Tools，重建原生模块
      const success = rebuildNativeModules();
      if (!success) {
        console.log('\n   ⚠️ Some native modules failed to rebuild');
      }
      // 无论重建成功与否，都修复 stub
      fixNativeModuleStubs();
    }
  } else if (platform === 'darwin') {
    console.log('Creating stubs for Linux-only modules...');
    platformModules.linux.forEach(mod => {
      createStubModule(mod, `${mod} is only available on Raspberry Pi/Linux.`);
    });
    rebuildNativeModules();
    fixNativeModuleStubs();
  } else if (platform === 'linux') {
    rebuildNativeModules();
    fixNativeModuleStubs();
  }

  console.log('\n=== Postinstall complete ===');
}

main();
