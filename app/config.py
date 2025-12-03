"""설정 및 초기화"""
import os
import traceback
from google import genai

# .env 파일 로드 (있는 경우)
try:
    from dotenv import load_dotenv
    try:
        load_dotenv()
        print("[초기화] .env 파일 로드 시도 완료")
    except Exception as e:
        print(f"[초기화] .env 파일 로드 중 오류 (무시하고 계속): {e}")
except ImportError:
    print("[초기화] python-dotenv 미설치 (환경변수로 직접 설정 가능)")

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3-pro-image-preview"

# Gemini 클라이언트 초기화 (API 키가 없으면 None)
client = None
print(f"\n[초기화] GEMINI_API_KEY 확인 중...")
if GEMINI_API_KEY:
    print(f"[초기화] API 키 길이: {len(GEMINI_API_KEY)} (처음 10자: {GEMINI_API_KEY[:10]}...)")
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print(f"[초기화] [OK] Gemini 클라이언트 초기화 성공!")
    except Exception as e:
        print(f"[초기화] [ERROR] Gemini 클라이언트 초기화 실패: {e}")
        print(traceback.format_exc())
else:
    print(f"[초기화] [ERROR] GEMINI_API_KEY 환경변수가 설정되지 않았습니다!")
    print(f"[초기화] 환경변수 설정 방법:")
    print(f"  Windows (cmd): set GEMINI_API_KEY=your-api-key-here")
    print(f"  Windows (PowerShell): $env:GEMINI_API_KEY='your-api-key-here'")
    print(f"  Linux/Mac: export GEMINI_API_KEY='your-api-key-here'")

