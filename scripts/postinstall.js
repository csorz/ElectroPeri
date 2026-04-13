const fs = require('fs');
const path = require('path');
const os = require('os');

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
  // 需要 VS Build Tools 的模块 (Windows)
  needsBuildTools: [
    '@abandonware/noble',
    'node-hid',
    'usb'
  ]
};

// Stub 模板
function createStub(moduleName, message) {
  return `// Stub for ${moduleName} - not available on this platform
module.exports = new Proxy({}, {
  get() {
    throw new Error('${message}');
  }
});
`;
}

// 创建 stub 模块
function createStubModule(moduleName, message) {
  const parts = moduleName.split('/');
  let modulePath;

  if (parts.length > 1) {
    // scoped package like @abandonware/noble
    modulePath = path.join(__dirname, '..', 'node_modules', parts[0], parts[1]);
  } else {
    modulePath = path.join(__dirname, '..', 'node_modules', moduleName);
  }

  // 创建目录
  fs.mkdirSync(modulePath, { recursive: true });

  // 写入 stub 文件
  fs.writeFileSync(path.join(modulePath, 'index.js'), createStub(moduleName, message));
  fs.writeFileSync(path.join(modulePath, 'package.json'), JSON.stringify({
    name: moduleName,
    version: '0.0.0-stub',
    main: 'index.js'
  }, null, 2));

  console.log(`  ✓ Created stub for: ${moduleName}`);
}

function checkVisualStudio() {
  const vsPaths = [
    'C:\\Program Files\\Microsoft Visual Studio\\2022',
    'C:\\Program Files\\Microsoft Visual Studio\\2019',
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019',
    'C:\\Program Files\\Microsoft Visual Studio\\2017',
    'C:\\Program Files (x86)\\Microsoft Visual Studio\\2017'
  ];

  for (const p of vsPaths) {
    if (fs.existsSync(p)) {
      console.log(`✓ Found Visual Studio at: ${p}`);
      return true;
    }
  }
  return false;
}

function rebuildNativeModules() {
  const { execSync } = require('child_process');
  console.log('\n=== Rebuilding native modules for Electron ===\n');
  try {
    execSync('electron-builder install-app-deps', { stdio: 'inherit' });
    console.log('\n✓ Native modules rebuilt successfully');
    return true;
  } catch (error) {
    console.error('\n⚠️  Failed to rebuild some native modules');
    return false;
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
      platformModules.needsBuildTools.forEach(mod => {
        createStubModule(mod, `${mod} is not available. Install Visual Studio Build Tools on Windows or run on Linux.`);
      });
      console.log('\n   To enable these modules, install Visual Studio Build Tools:');
      console.log('   https://visualstudio.microsoft.com/visual-cpp-build-tools/');
    } else {
      // 有 VS Build Tools，尝试重建原生模块
      const success = rebuildNativeModules();
      if (!success) {
        console.log('\n   Creating stubs for failed modules...');
        platformModules.needsBuildTools.forEach(mod => {
          createStubModule(mod, `${mod} failed to build. Check the build output for details.`);
        });
      }
    }
  } else if (platform === 'darwin') {
    // macOS - 创建 Linux 专用模块的 stub
    console.log('Creating stubs for Linux-only modules...');
    platformModules.linux.forEach(mod => {
      createStubModule(mod, `${mod} is only available on Raspberry Pi/Linux.`);
    });

    // 尝试重建原生模块
    rebuildNativeModules();
  } else if (platform === 'linux') {
    // Linux 上重建所有原生模块
    rebuildNativeModules();
  }

  console.log('\n=== Postinstall complete ===');
}

main();
