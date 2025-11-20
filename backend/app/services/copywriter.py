"""
Gemini API를 사용한 광고 카피 생성
REST API 직접 호출 방식
"""
import os
import json
import aiohttp
from dotenv import load_dotenv

load_dotenv()

class CopyWriter:
    """Gemini API를 사용하여 광고 카피를 생성하는 클래스"""
    
    def __init__(self):
        """초기화: Gemini API 키 설정"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            print("⚠️ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
            print("   기본 카피를 사용합니다.")
            return
        
        # API 키 형식 확인
        if self.api_key.startswith("AIza") or len(self.api_key) > 20:
            print("✅ Gemini API configured (REST API - gemini-2.0-flash)")
        else:
            print("⚠️ GEMINI_API_KEY 형식이 올바르지 않습니다.")
            print("   기본 카피를 사용합니다.")
            self.api_key = None
    
    async def generate_copy(
        self,
        tone: str,
        product_name: str,
        description: str = "",
        price: str = None
    ) -> dict:
        """
        Gemini API를 사용하여 광고 카피를 생성합니다.
        
        Args:
            tone: 스타일 톤 ("apple", "funny", "dramatic")
            product_name: 제품명
            description: 제품 설명
            price: 가격 (선택)
            
        Returns:
            카피 딕셔너리 (headline, subcopy, cta)
        """
        # API 키가 없으면 기본값 반환
        if not self.api_key:
            print("   Using default copy (Gemini API not available)")
            return {
                "headline": "당신의 새로운 시작",
                "subcopy": "시간이 지나도 변하지 않는 가치",
                "cta": "당근에서 만나보세요 →"
            }
        
        # 톤에 따른 설명
        tone_descriptions = {
            "apple": "애플 광고 톤의 미니멀하고 절제된 표현",
            "funny": "유머러스하고 재미있는 톤",
            "dramatic": "드라마틱하고 임팩트 있는 톤"
        }
        
        tone_desc = tone_descriptions.get(tone, "애플 광고 톤의 미니멀하고 절제된 표현")
        
        prompt = f"""당신은 세계적 광고회사의 카피라이터입니다.
사용자가 업로드한 중고 제품 사진을 보고, {tone_desc}의 감성적인 카피를 작성하세요.

제품 정보:
- 제품명: {product_name}
- 설명: {description}
- 가격: {price if price else "가격 정보 없음"}

조건:
- 헤드라인 20자 이하
- 서브카피 30자 이하
- CTA 15자 이하
- 미니멀하고 절제된 표현
- 제품의 가치를 재발견하는 느낌

출력 형식 (JSON만 출력):
{{
  "headline": "",
  "subcopy": "",
  "cta": ""
}}"""

        try:
            # Gemini REST API 직접 호출
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
            
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"   Gemini API error: {response.status} - {error_text}")
                        raise Exception(f"API error: {response.status}")
                    
                    result = await response.json()
                    
                    # 응답에서 텍스트 추출
                    if "candidates" in result and len(result["candidates"]) > 0:
                        content = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    else:
                        raise Exception("No content in response")
            
            # JSON 파싱
            # 코드 블록 제거
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # JSON 파싱
            result = json.loads(content)
            
            return {
                "headline": result.get("headline", "당신의 새로운 시작"),
                "subcopy": result.get("subcopy", "시간이 지나도 변하지 않는 가치"),
                "cta": result.get("cta", "당근에서 만나보세요 →")
            }
        
        except Exception as e:
            print(f"카피 생성 에러: {e}")
            # 에러 발생 시 기본값 반환
            return {
                "headline": "당신의 새로운 시작",
                "subcopy": "시간이 지나도 변하지 않는 가치",
                "cta": "당근에서 만나보세요 →"
            }
