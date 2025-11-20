FROM python:3.11-slim

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# GPU 지원 (NVIDIA)
# nvidia-docker 사용 시 주석 해제
# ENV NVIDIA_VISIBLE_DEVICES=all
# ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
