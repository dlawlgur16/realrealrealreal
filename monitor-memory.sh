#!/bin/bash
# 실시간 메모리 모니터링 스크립트

echo "========================================"
echo "   당근 부스터 - 실시간 메모리 모니터링"
echo "========================================"
echo ""

# 서버 프로세스 찾기 (여러 방법 시도)
PIDS=$(lsof -ti :8000 2>/dev/null | tr '\n' ',' | sed 's/,$//')

if [ -z "$PIDS" ]; then
    # 두 번째 시도: ps로 찾기
    PIDS=$(ps aux | grep "python.*run.py\|uvicorn.*app.main" | grep -v grep | awk '{print $2}' | tr '\n' ',' | sed 's/,$//')
fi

if [ -z "$PIDS" ]; then
    echo "❌ 백엔드 서버가 실행 중이지 않습니다."
    echo ""
    echo "서버를 먼저 실행하세요:"
    echo "  source venv/bin/activate && python run.py"
    echo ""
    echo "또는:"
    echo "  ./start-with-ngrok.sh"
    exit 1
fi

echo "✅ 백엔드 서버 발견 (PID: $PIDS)"
echo ""
echo "실시간 메모리 사용량을 모니터링합니다."
echo "앱에서 이미지를 업로드하고 처리해보세요!"
echo ""
echo "종료: Ctrl+C"
echo ""
echo "========================================"
echo ""

# 헤더 출력
printf "%-20s | %-15s | %-15s | %-15s\n" "시간" "RSS (MB)" "VSZ (MB)" "CPU (%)"
echo "------------------------------------------------------------------------"

# 실시간 모니터링 (1초마다)
while true; do
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

    # 프로세스별 메모리 합산
    MEMORY_INFO=$(ps -o rss,vsz,%cpu -p $(echo $PIDS | tr ',' ' ') 2>/dev/null | awk '
        NR > 1 {
            rss += $1
            vsz += $2
            cpu += $3
        }
        END {
            printf "%.2f %.2f %.1f", rss/1024, vsz/1024, cpu
        }
    ')

    if [ -z "$MEMORY_INFO" ]; then
        echo "❌ 서버가 종료되었습니다."
        exit 0
    fi

    RSS=$(echo $MEMORY_INFO | awk '{print $1}')
    VSZ=$(echo $MEMORY_INFO | awk '{print $2}')
    CPU=$(echo $MEMORY_INFO | awk '{print $3}')

    printf "%-20s | %-15s | %-15s | %-15s\n" "$TIMESTAMP" "${RSS} MB" "${VSZ} MB" "${CPU}%"

    sleep 1
done
