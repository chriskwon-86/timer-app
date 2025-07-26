// HTML 요소 가져오기
const timerContainer = document.querySelector('.timer-container');
const timePicker = document.getElementById('time-picker');
const timeDisplay = document.getElementById('time-display');
const hoursSelect = document.getElementById('hours');
const minutesSelect = document.getElementById('minutes');
const secondsSelect = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const videoBtn = document.getElementById('video-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('my-video');
const exitVideoBtn = document.getElementById('exit-video-btn');

let timer;
let totalSeconds;
let isPaused = true;

// 햅틱 반응 함수
function triggerHapticFeedback() {
    // navigator.vibrate는 아이폰에서만 잘 작동합니다.
    if (navigator.vibrate) {
        navigator.vibrate(5); // 약한 진동
    }
}

// 시간/분/초 선택 옵션 채우기
function populatePicker(select, max) {
    for (let i = 0; i <= max; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = String(i).padStart(2, '0');
        select.appendChild(option);
    }
    // 옵션을 선택할 때마다 햅틱 반응
    select.addEventListener('change', triggerHapticFeedback);
}

populatePicker(hoursSelect, 23);
populatePicker(minutesSelect, 59);
populatePicker(secondsSelect, 59);

// 시간을 '시:분:초' 형태로 업데이트
function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    timeDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 타이머 시작
function startTimer() {
    if (isPaused) {
        // 선택된 시간으로 totalSeconds 설정
        const h = parseInt(hoursSelect.value);
        const m = parseInt(minutesSelect.value);
        const s = parseInt(secondsSelect.value);

        // 타이머가 멈춘 상태에서 시작할 때만 시간 재설정
        if (totalSeconds === undefined || totalSeconds <= 0) {
            totalSeconds = h * 3600 + m * 60 + s;
        }

        if (totalSeconds > 0) {
            isPaused = false;
            timePicker.style.display = 'none';
            timeDisplay.style.display = 'block';

            // ▼▼▼ 이 코드가 핵심입니다! ▼▼▼
            // 타이머를 시작하기 전에 화면을 먼저 현재 시간으로 업데이트합니다.
            updateDisplay();
            // ▲▲▲ 여기까지 ▲▲▲

            timer = setInterval(() => {
                totalSeconds--;
                updateDisplay();

                if (totalSeconds <= 0) {
                    clearInterval(timer);
                    alert("시간 종료!");
                    resetTimer();
                }
            }, 1000);
        }
    }
}

// 일시정지
function pauseTimer() {
    isPaused = true;
    clearInterval(timer);
}

// 초기화
function resetTimer() {
    isPaused = true;
    clearInterval(timer);
    totalSeconds = 0;

    // ▼ 피커 값을 0으로 되돌리는 코드 추가
    hoursSelect.value = 0;
    minutesSelect.value = 0;
    secondsSelect.value = 0;
    // ▲ 여기까지

    timePicker.style.display = 'flex';
    timeDisplay.style.display = 'none';
}

// 동영상 재생 화면 보이기
function showVideo() {
    timerContainer.style.display = 'none';
    videoContainer.style.display = 'block';
    videoPlayer.play();
}

// 동영상 재생 화면 숨기기
function hideVideo() {
    videoPlayer.pause(); // 비디오 정지
    videoPlayer.currentTime = 0; // 비디오 처음으로
    videoContainer.style.display = 'none';
    timerContainer.style.display = 'flex';
}

// 이벤트 리스너 연결
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
videoBtn.addEventListener('click', showVideo);
exitVideoBtn.addEventListener('click', hideVideo);
videoPlayer.addEventListener('ended', hideVideo); // 비디오 끝나면 자동으로 숨김