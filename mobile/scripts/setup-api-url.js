/**
 * API URL 자동 설정 스크립트
 * 컴퓨터의 로컬 IP 주소를 자동으로 감지하여 API URL을 설정합니다.
 * 서버 연결 테스트 및 ngrok URL 자동 감지 지원
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

// 네트워크 인터페이스에서 로컬 IP 주소 찾기
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // IPv4이고 내부 IP가 아닌 경우
      if (iface.family === 'IPv4' && !iface.internal) {
        const addr = iface.address;
        // 사설 IP 대역 확인
        if (addr.startsWith('192.168.')) {
          candidates.push({ addr, priority: 1, name }); // Wi-Fi 우선
        } else if (addr.startsWith('10.')) {
          candidates.push({ addr, priority: 2, name });
        } else if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr)) {
          candidates.push({ addr, priority: 3, name });
        }
      }
    }
  }

  // 우선순위에 따라 정렬 (192.168.x.x를 우선)
  candidates.sort((a, b) => a.priority - b.priority);

  if (candidates.length > 0) {
    console.log(`   네트워크: ${candidates[0].name}`);
    return candidates[0].addr;
  }

  return 'localhost';
}

// URL 연결 테스트
function testConnection(url, timeout = 5000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: '/',
      method: 'GET',
      timeout: timeout,
    };

    const req = http.request(options, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

// ngrok URL 감지 (ngrok이 실행 중인 경우)
async function detectNgrokUrl() {
  try {
    const ngrokApiUrl = 'http://localhost:4040/api/tunnels';
    const response = await new Promise((resolve, reject) => {
      http.get(ngrokApiUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    if (response.tunnels && response.tunnels.length > 0) {
      // HTTP 터널 찾기
      const httpTunnel = response.tunnels.find(t => t.proto === 'https');
      if (httpTunnel) {
        return httpTunnel.public_url;
      }
    }
  } catch (err) {
    // ngrok이 실행되지 않음
  }
  return null;
}

// 메인 실행
(async () => {
  console.log('========================================');
  console.log('   API URL 자동 설정');
  console.log('========================================\n');

  // API 파일 경로
  const apiFilePath = path.join(__dirname, '..', 'src', 'services', 'api.js');

  // 1. ngrok 확인
  console.log('[1/3] ngrok 터널 확인 중...');
  const ngrokUrl = await detectNgrokUrl();

  let finalUrl;
  let connectionType;

  if (ngrokUrl) {
    console.log('   ✓ ngrok 터널 발견!');
    console.log('   URL:', ngrokUrl);
    finalUrl = ngrokUrl;
    connectionType = 'ngrok (인터넷을 통한 연결)';
  } else {
    console.log('   ! ngrok 터널 없음');

    // 2. 로컬 IP 감지
    console.log('\n[2/3] 로컬 IP 주소 감지 중...');
    const localIP = getLocalIP();
    console.log('   감지된 IP:', localIP);

    finalUrl = `http://${localIP}:8000`;
    connectionType = '로컬 네트워크 (같은 Wi-Fi)';
  }

  // 3. 서버 연결 테스트
  console.log('\n[3/3] 서버 연결 테스트 중...');
  console.log('   테스트 URL:', finalUrl);

  const testResult = await testConnection(finalUrl);

  if (testResult.success) {
    console.log(`   ✓ 연결 성공! (HTTP ${testResult.status})`);
  } else {
    console.log(`   ⚠️  연결 실패: ${testResult.error}`);
    console.log('\n   백엔드 서버가 실행 중인지 확인하세요!');
    console.log('   실행 방법: python run.py');
  }

  // 4. API 파일 업데이트
  console.log('\n[4/4] API 파일 업데이트 중...');

  try {
    let apiContent = fs.readFileSync(apiFilePath, 'utf8');

    // API_BASE_URL 찾아서 교체
    const urlPattern = /const API_BASE_URL = ['"](.*?)['"];?/;
    const newUrlLine = `const API_BASE_URL = '${finalUrl}';`;

    if (urlPattern.test(apiContent)) {
      apiContent = apiContent.replace(urlPattern, newUrlLine);
      fs.writeFileSync(apiFilePath, apiContent, 'utf8');

      console.log('   ✅ API URL이 설정되었습니다!');
      console.log(`   파일: ${apiFilePath}`);
    } else {
      console.log('   ⚠️  API_BASE_URL을 찾을 수 없습니다.');
    }
  } catch (err) {
    console.error('   ❌ 파일 업데이트 실패:', err.message);
  }

  // 5. 요약
  console.log('\n========================================');
  console.log('   설정 완료!');
  console.log('========================================');
  console.log(`\n연결 방식: ${connectionType}`);
  console.log(`API URL: ${finalUrl}`);

  if (!testResult.success) {
    console.log('\n⚠️  주의: 서버 연결 테스트에 실패했습니다.');
    console.log('백엔드 서버를 먼저 실행해주세요.');
  }

  console.log('\n💡 다음 단계:');
  if (ngrokUrl) {
    console.log('   1. ngrok을 계속 실행 상태로 유지하세요');
    console.log('   2. npm start 로 모바일 앱 시작');
  } else {
    console.log('   1. 모바일 디바이스를 같은 Wi-Fi에 연결하세요');
    console.log('   2. npm start 로 모바일 앱 시작');
    console.log('\n   또는 다른 네트워크를 사용하려면:');
    console.log('   - ngrok을 설치하고 실행: ngrok http 8000');
    console.log('   - 이 스크립트를 다시 실행: node scripts/setup-api-url.js');
  }
  console.log('');
})();

