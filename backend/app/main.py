from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import os
import time

from app.api import generate

app = FastAPI(title="중고거래 AI 포스터 에디터", version="1.0.0")

# 요청 로깅 미들웨어
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        import sys
        print(f"\n{'='*60}", file=sys.stderr, flush=True)
        print(f"🌐 요청: {request.method} {request.url.path}", file=sys.stderr, flush=True)
        print(f"   전체 URL: {request.url}", file=sys.stderr, flush=True)
        print(f"   쿼리: {dict(request.query_params)}", file=sys.stderr, flush=True)
        print(f"   헤더: {dict(request.headers)}", file=sys.stderr, flush=True)
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        print(f"   응답: {response.status_code} ({process_time:.3f}초)", file=sys.stderr, flush=True)
        print(f"{'='*60}\n", file=sys.stderr, flush=True)
        
        return response

app.add_middleware(LoggingMiddleware)

# 디버깅: 라우터 등록 확인
print("=" * 60)
print("🔍 라우터 등록 확인")
print(f"   generate 모듈: {generate}")
print(f"   router: {generate.router}")
print("=" * 60)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록 (정적 파일보다 먼저 등록)
app.include_router(generate.router, prefix="/api", tags=["generate"])

# 정적 파일 서빙 (라우터 등록 후)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 등록된 라우트 확인
print("\n📋 등록된 라우트:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        print(f"   {list(route.methods)} {route.path}")
print("=" * 60 + "\n")

# 헬스체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {"status": "ok", "message": "Poster Generator API is running"}

@app.get("/")
async def root():
    return {"message": "중고거래 AI 포스터 에디터 API"}

# 중복 로깅 제거 (LoggingMiddleware가 이미 처리함)

