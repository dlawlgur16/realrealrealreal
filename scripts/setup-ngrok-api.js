/**
 * ngrok URL을 모바일 앱 API 설정에 자동으로 적용
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// ngrok API에서 터널 정보 가져오기
function getNgrokUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:4040/api/tunnels', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data);
          if (tunnels.tunnels && tunnels.tunnels.length > 0) {
            resolve(tunnels.tunnels[0].public_url);
          } else {
            reject(new Error('터널을 찾을 수 없습니다. ngrok이 실행 중인지 확인하세요.'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(new Error('ngrok API에 연결할 수 없습니다. ngrok이 실행 중인지 확인하세요.'));
    });
  });
}

// API 파일 업데이트
function updateApiUrl(ngrokUrl) {
  const apiFilePath = path.join(__dirname, '..', 'mobile', 'src', 'services', 'api.js');
  
  let apiContent = fs.readFileSync(apiFilePath, 'utf8');
  const urlPattern = /const API_BASE_URL = ['"](.*?)['"];?/;
  const newUrlLine = `const API_BASE_URL = '${ngrokUrl}';`;
  
  if (urlPattern.test(apiContent)) {
    apiContent = apiContent.replace(urlPattern, newUrlLine);
    fs.writeFileSync(apiFilePath, apiContent, 'utf8');
    console.log('✅ API URL이 ngrok URL로 업데이트되었습니다!');
    console.log(`   ${ngrokUrl}`);
    return true;
  } else {
    console.log('⚠️  API_BASE_URL을 찾을 수 없습니다.');
    return false;
  }
}

// 실행
console.log('🔍 ngrok 터널 정보 확인 중...');
getNgrokUrl()
  .then((url) => {
    console.log(`🌐 ngrok URL 발견: ${url}`);
    updateApiUrl(url);
  })
  .catch((err) => {
    console.error('❌ 오류:', err.message);
    console.log('\n💡 해결 방법:');
    console.log('1. ngrok이 실행 중인지 확인하세요');
    console.log('2. 다른 터미널에서 다음 명령어 실행:');
    console.log('   ngrok http 8000');
    process.exit(1);
  });



