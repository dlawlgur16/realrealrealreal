"""
ngrok을 사용하여 백엔드 서버를 공개 URL로 노출
다른 네트워크에서도 접근 가능하도록 합니다.
"""

import subprocess
import sys
import time
import requests
import json

def check_ngrok_installed():
    """ngrok이 설치되어 있는지 확인"""
    try:
        result = subprocess.run(['ngrok', 'version'], 
                              capture_output=True, 
                              text=True, 
                              timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def install_ngrok_instructions():
    """ngrok 설치 안내"""
    print("\n" + "="*60)
    print("ngrok이 설치되지 않았습니다.")
    print("="*60)
    print("\n📥 ngrok 설치 방법:")
    print("\n1. ngrok 다운로드:")
    print("   https://ngrok.com/download")
    print("\n2. 또는 Chocolatey로 설치 (Windows):")
    print("   choco install ngrok")
    print("\n3. 또는 npm으로 설치:")
    print("   npm install -g ngrok")
    print("\n4. ngrok 계정 생성 및 인증 토큰 설정:")
    print("   - https://dashboard.ngrok.com/signup 에서 계정 생성")
    print("   - ngrok config add-authtoken [YOUR_TOKEN]")
    print("\n" + "="*60)
    sys.exit(1)

def start_ngrok_tunnel(port=8000):
    """ngrok 터널 시작"""
    print(f"\n🚇 ngrok 터널 시작 중... (포트 {port})")
    print("   잠시만 기다려주세요...\n")
    
    # ngrok 시작 (백그라운드)
    ngrok_process = subprocess.Popen(
        ['ngrok', 'http', str(port)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # ngrok API로 터널 정보 가져오기
    time.sleep(3)  # ngrok 시작 대기
    
    try:
        response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
        if response.status_code == 200:
            tunnels = response.json()
            if tunnels.get('tunnels'):
                public_url = tunnels['tunnels'][0]['public_url']
                print("="*60)
                print("✅ ngrok 터널이 성공적으로 시작되었습니다!")
                print("="*60)
                print(f"\n🌐 공개 URL: {public_url}")
                print(f"\n📱 모바일 앱에서 사용할 API URL:")
                print(f"   {public_url}")
                print("\n" + "="*60)
                print("\n💡 다음 단계:")
                print("1. 위의 공개 URL을 복사하세요")
                print("2. mobile/src/services/api.js 파일을 열어서")
                print(f"   API_BASE_URL을 '{public_url}'로 변경하세요")
                print("3. 또는 다음 명령어로 자동 설정:")
                print(f"   cd mobile && node -e \"const fs=require('fs');const f='src/services/api.js';const c=fs.readFileSync(f,'utf8');fs.writeFileSync(f,c.replace(/const API_BASE_URL = ['\\\"].*?['\\\"];/, \\\"const API_BASE_URL = '{public_url}';\\\"))\"")
                print("\n⚠️  이 터널은 이 터미널을 닫으면 종료됩니다.")
                print("="*60 + "\n")
                
                return public_url, ngrok_process
            else:
                print("❌ 터널 정보를 가져올 수 없습니다.")
                ngrok_process.terminate()
                sys.exit(1)
        else:
            print("❌ ngrok API에 연결할 수 없습니다.")
            ngrok_process.terminate()
            sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"❌ ngrok API 연결 실패: {e}")
        ngrok_process.terminate()
        sys.exit(1)

def update_mobile_api_url(public_url):
    """모바일 앱의 API URL 자동 업데이트"""
    import os
    api_file = os.path.join('mobile', 'src', 'services', 'api.js')
    
    if os.path.exists(api_file):
        try:
            with open(api_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            import re
            pattern = r"const API_BASE_URL = ['\"].*?['\"];"
            replacement = f"const API_BASE_URL = '{public_url}';"
            new_content = re.sub(pattern, replacement, content)
            
            with open(api_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"\n✅ 모바일 앱 API URL이 자동으로 업데이트되었습니다!")
            print(f"   {api_file}")
            return True
        except Exception as e:
            print(f"\n⚠️  API URL 자동 업데이트 실패: {e}")
            print("   수동으로 설정해주세요.")
            return False
    return False

if __name__ == "__main__":
    print("="*60)
    print("  ngrok 터널링 서비스 시작")
    print("="*60)
    
    # ngrok 설치 확인
    if not check_ngrok_installed():
        install_ngrok_instructions()
    
    # 터널 시작
    public_url, ngrok_process = start_ngrok_tunnel(8000)
    
    # 모바일 API URL 자동 업데이트
    update_mobile_api_url(public_url)
    
    print("\n⏸️  터널을 종료하려면 Ctrl+C를 누르세요.\n")
    
    try:
        # 터널 유지
        ngrok_process.wait()
    except KeyboardInterrupt:
        print("\n\n🛑 ngrok 터널 종료 중...")
        ngrok_process.terminate()
        print("✅ 종료되었습니다.")

