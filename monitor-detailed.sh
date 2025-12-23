#!/bin/bash
# 상세 메모리 모니터링 (htop 스타일)

echo "========================================"
echo "   실시간 메모리 모니터링 (상세)"
echo "========================================"
echo ""

# 서버 프로세스 찾기 (여러 방법 시도)
PIDS=$(lsof -ti :8000 2>/dev/null)

if [ -z "$PIDS" ]; then
    # 두 번째 시도: ps로 찾기
    PIDS=$(ps aux | grep "python.*run.py\|uvicorn.*app.main" | grep -v grep | awk '{print $2}')
fi

if [ -z "$PIDS" ]; then
    echo "❌ 백엔드 서버가 실행 중이지 않습니다."
    echo ""
    echo "서버를 먼저 실행하세요:"
    echo "  source venv/bin/activate && python run.py"
    exit 1
fi

echo "✅ 모니터링 중..."
echo ""

# 실시간 모니터링
while true; do
    clear
    echo "========================================"
    echo "   당근 부스터 - 메모리 모니터링"
    echo "   $(date '+%Y-%m-%d %H:%M:%S')"
    echo "========================================"
    echo ""

    # 전체 시스템 메모리 (macOS)
    echo "📊 시스템 전체 메모리:"
    if command -v vm_stat &> /dev/null; then
        # macOS
        VM_STAT=$(vm_stat)
        PAGE_SIZE=$(pagesize)
        FREE_PAGES=$(echo "$VM_STAT" | grep "Pages free" | awk '{print $3}' | tr -d '.')
        ACTIVE_PAGES=$(echo "$VM_STAT" | grep "Pages active" | awk '{print $3}' | tr -d '.')

        FREE_MB=$((FREE_PAGES * PAGE_SIZE / 1024 / 1024))
        ACTIVE_MB=$((ACTIVE_PAGES * PAGE_SIZE / 1024 / 1024))

        echo "  여유 메모리: ${FREE_MB} MB"
        echo "  사용 중: ${ACTIVE_MB} MB"
    else
        # Linux
        free -h | head -2
    fi

    echo ""
    echo "🚀 당근 부스터 백엔드:"
    echo "----------------------------------------"
    printf "%-8s | %-10s | %-10s | %-8s | %-15s\n" "PID" "RSS (MB)" "VSZ (MB)" "CPU%" "명령"
    echo "----------------------------------------"

    TOTAL_RSS=0
    TOTAL_VSZ=0
    TOTAL_CPU=0

    for PID in $PIDS; do
        if ps -p $PID > /dev/null 2>&1; then
            PROC_INFO=$(ps -o pid,rss,vsz,%cpu,comm -p $PID | tail -1)
            PID_NUM=$(echo $PROC_INFO | awk '{print $1}')
            RSS=$(echo $PROC_INFO | awk '{print $2}')
            VSZ=$(echo $PROC_INFO | awk '{print $3}')
            CPU=$(echo $PROC_INFO | awk '{print $4}')
            COMM=$(echo $PROC_INFO | awk '{print $5}' | rev | cut -d'/' -f1 | rev)

            RSS_MB=$(echo "scale=2; $RSS/1024" | bc)
            VSZ_MB=$(echo "scale=2; $VSZ/1024" | bc)

            printf "%-8s | %-10s | %-10s | %-8s | %-15s\n" "$PID_NUM" "$RSS_MB" "$VSZ_MB" "$CPU" "$COMM"

            TOTAL_RSS=$((TOTAL_RSS + RSS))
            TOTAL_VSZ=$((TOTAL_VSZ + VSZ))
            TOTAL_CPU=$(echo "$TOTAL_CPU + $CPU" | bc)
        fi
    done

    echo "----------------------------------------"
    TOTAL_RSS_MB=$(echo "scale=2; $TOTAL_RSS/1024" | bc)
    TOTAL_VSZ_MB=$(echo "scale=2; $TOTAL_VSZ/1024" | bc)
    printf "%-8s | %-10s | %-10s | %-8s | %-15s\n" "총계" "$TOTAL_RSS_MB" "$TOTAL_VSZ_MB" "$TOTAL_CPU" ""

    echo ""
    echo "📈 메모리 사용률:"
    echo "  실제 사용 (RSS): ${TOTAL_RSS_MB} MB"
    echo "  가상 메모리 (VSZ): ${TOTAL_VSZ_MB} MB"
    echo "  CPU 사용률: ${TOTAL_CPU}%"

    echo ""
    echo "💡 팁:"
    echo "  - RSS: 실제 물리 메모리 사용량 (중요!)"
    echo "  - VSZ: 가상 메모리 (참고용)"
    echo "  - 앱에서 이미지를 업로드하면 RSS가 증가합니다"
    echo ""
    echo "종료: Ctrl+C"

    sleep 1
done
