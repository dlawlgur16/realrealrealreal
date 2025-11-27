/**
 * API URL 자동 설정 스크립트
 * 컴퓨터의 로컬 IP 주소를 자동으로 감지하여 API URL을 설정합니다.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 네트워크 인터페이스에서 로컬 IP 주소 찾기
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4이고 내부 IP인 경우 (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (iface.family === 'IPv4' && !iface.internal) {
        const addr = iface.address;
        if (
          addr.startsWith('192.168.') ||
          addr.startsWith('10.') ||
          addr.startsWith('172.16.') ||
          addr.startsWith('172.17.') ||
          addr.startsWith('172.18.') ||
          addr.startsWith('172.19.') ||
          addr.startsWith('172.20.') ||
          addr.startsWith('172.21.') ||
          addr.startsWith('172.22.') ||
          addr.startsWith('172.23.') ||
          addr.startsWith('172.24.') ||
          addr.startsWith('172.25.') ||
          addr.startsWith('172.26.') ||
          addr.startsWith('172.27.') ||
          addr.startsWith('172.28.') ||
          addr.startsWith('172.29.') ||
          addr.startsWith('172.30.') ||
          addr.startsWith('172.31.')
        ) {
          return addr;
        }
      }
    }
  }
  
  return 'localhost';
}

// API 파일 경로
const apiFilePath = path.join(__dirname, '..', 'src', 'services', 'api.js');

// 현재 IP 주소 가져오기
const localIP = getLocalIP();
const apiUrl = `http://${localIP}:8000`;

console.log('🔍 로컬 IP 주소 감지:', localIP);
console.log('📝 API URL 설정:', apiUrl);

// API 파일 읽기
let apiContent = fs.readFileSync(apiFilePath, 'utf8');

// API_BASE_URL 찾아서 교체
const urlPattern = /const API_BASE_URL = ['"](.*?)['"];?/;
const newUrlLine = `const API_BASE_URL = '${apiUrl}';`;

if (urlPattern.test(apiContent)) {
  apiContent = apiContent.replace(urlPattern, newUrlLine);
  fs.writeFileSync(apiFilePath, apiContent, 'utf8');
  console.log('✅ API URL이 자동으로 설정되었습니다!');
  console.log(`   ${apiFilePath}`);
} else {
  console.log('⚠️  API_BASE_URL을 찾을 수 없습니다. 수동으로 설정해주세요.');
}

console.log('\n💡 팁:');
console.log('   - 실제 디바이스에서 테스트할 때는 이 스크립트를 실행하세요');
console.log('   - 에뮬레이터/시뮬레이터에서는 localhost를 사용하세요');

