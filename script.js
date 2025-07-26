// ===============================================
// 타이머 앱 로직 (변경 없음)
// ===============================================

// HTML 요소 가져오기 (타이머)
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

function triggerHapticFeedback() { if (navigator.vibrate) { navigator.vibrate(5); } }

function populatePicker(select, max) {
    for (let i = 0; i < max; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = String(i).padStart(2, '0');
        select.appendChild(option);
    }
    select.addEventListener('change', triggerHapticFeedback);
}

populatePicker(hoursSelect, 24);
populatePicker(minutesSelect, 60);
populatePicker(secondsSelect, 60);

function updateDisplay() {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    timeDisplay.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
    if (isPaused) {
        if (totalSeconds === undefined || totalSeconds <= 0) {
            totalSeconds = parseInt(hoursSelect.value) * 3600 + parseInt(minutesSelect.value) * 60 + parseInt(secondsSelect.value);
        }
        if (totalSeconds > 0) {
            isPaused = false;
            timePicker.style.display = 'none';
            timeDisplay.style.display = 'block';
            updateDisplay();
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

function pauseTimer() { isPaused = true; clearInterval(timer); }

function resetTimer() {
    isPaused = true; clearInterval(timer); totalSeconds = 0;
    hoursSelect.value = 0; minutesSelect.value = 0; secondsSelect.value = 0;
    timePicker.style.display = 'flex';
    timeDisplay.style.display = 'none';
}

function showVideo() { timerContainer.style.display = 'none'; videoContainer.style.display = 'block'; videoPlayer.play(); }
function hideVideo() { videoPlayer.pause(); videoPlayer.currentTime = 0; videoContainer.style.display = 'none'; timerContainer.style.display = 'flex'; }

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
videoBtn.addEventListener('click', showVideo);
exitVideoBtn.addEventListener('click', hideVideo);
videoPlayer.addEventListener('ended', hideVideo);

// ===============================================
// 오목 게임 AI 로직 (업그레이드된 코드)
// ===============================================

const omokBtn = document.getElementById('omok-btn');
const omokContainer = document.getElementById('omok-container');
const omokBoardCanvas = document.getElementById('omok-board');
const omokStatus = document.getElementById('omok-status');
const restartOmokBtn = document.getElementById('restart-omok-btn');
const exitOmokBtn = document.getElementById('exit-omok-btn');
const ctx = omokBoardCanvas.getContext('2d');

const BOARD_SIZE = 15;
const CELL_SIZE = 30; // PC 화면에 맞게 크기 조정
omokBoardCanvas.width = CELL_SIZE * (BOARD_SIZE + 1);
omokBoardCanvas.height = CELL_SIZE * (BOARD_SIZE + 1);

let board = [];
let currentPlayer = 1; // 1: 플레이어(흑), 2: AI(백)
let gameOver = false;

// 게임판 그리기
function drawBoard() {
    ctx.clearRect(0, 0, omokBoardCanvas.width, omokBoardCanvas.height);
    ctx.strokeStyle = '#5c4033';
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        // 가로줄
        ctx.moveTo(CELL_SIZE, CELL_SIZE * (i + 1));
        ctx.lineTo(CELL_SIZE * BOARD_SIZE, CELL_SIZE * (i + 1));
        // 세로줄
        ctx.moveTo(CELL_SIZE * (i + 1), CELL_SIZE);
        ctx.lineTo(CELL_SIZE * (i + 1), CELL_SIZE * BOARD_SIZE);
        ctx.stroke();
    }
}

// 돌 그리기
function drawStone(x, y, player) {
    ctx.beginPath();
    ctx.arc(CELL_SIZE * (x + 1), CELL_SIZE * (y + 1), CELL_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fillStyle = player === 1 ? 'black' : 'white';
    ctx.fill();
}

// 게임 초기화
function initOmok() {
    gameOver = false;
    currentPlayer = 1;
    omokStatus.textContent = '당신 차례 (흑돌)';
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    drawBoard();
}

// 보드 클릭 처리
omokBoardCanvas.addEventListener('click', (e) => {
    if (gameOver || currentPlayer !== 1) return;

    const rect = omokBoardCanvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / CELL_SIZE) - 1;
    const y = Math.round((e.clientY - rect.top) / CELL_SIZE) - 1;

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || board[y][x] !== 0) {
        return;
    }

    placeStone(x, y, 1);

    if (checkWin(1)) {
        gameOver = true;
        omokStatus.textContent = "당신 승리!";
    } else {
        currentPlayer = 2;
        aiMove();
    }
});

// AI의 다음 수 계산 및 실행
function aiMove() {
    if (gameOver) return;
    omokStatus.textContent = "AI가 생각 중...";

    setTimeout(() => {
        const bestMove = findBestMove();
        placeStone(bestMove.x, bestMove.y, 2);

        if (checkWin(2)) {
            gameOver = true;
            omokStatus.textContent = "AI 승리!";
        } else {
            currentPlayer = 1;
            omokStatus.textContent = "당신 차례";
        }
    }, 500);
}

// 실제 돌을 놓고 그리는 함수
function placeStone(x, y, player) {
    board[y][x] = player;
    drawStone(x, y, player);
}

// AI가 최적의 수를 찾는 로직
function findBestMove() {
    let bestScore = -Infinity;
    let move = { x: -1, y: -1 };

    // 중앙 우선
    const center = Math.floor(BOARD_SIZE / 2);
    const moves = [{ x: center, y: center }];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === 0) {
                moves.push({ x, y });
            }
        }
    }

    for (let i = 0; i < moves.length; i++) {
        const { x, y } = moves[i];

        // AI의 공격 점수
        board[y][x] = 2;
        let score = evaluateBoard(2);

        // 플레이어의 공격 점수(AI의 수비 점수)
        board[y][x] = 1;
        score += evaluateBoard(1);

        board[y][x] = 0; // 보드 원상복구

        if (score > bestScore) {
            bestScore = score;
            move = { x, y };
        }
    }
    return move;
}

// 현재 보드 상태를 평가하여 점수 반환
function evaluateBoard(player) {
    let totalScore = 0;
    const patterns = {
        '11111': 100000, // 5개 연속 (승리)
        '011110': 10000, // 열린 4
        '11110': 500,    // 닫힌 4
        '01111': 500,
        '01110': 1000,   // 열린 3
        '11100': 100,
        '00111': 100,
        '011010': 500,   // 띄어진 3
        '010110': 500,
        '001100': 100,   // 열린 2
    };

    const opponent = player === 1 ? 2 : 1;

    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            // 가로, 세로, 대각선(\), 역대각선(/)
            const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
            directions.forEach(([dx, dy]) => {
                let line = '';
                for (let i = -1; i < 6; i++) {
                    const nx = x + i * dx;
                    const ny = y + i * dy;
                    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] === opponent) {
                        line += '2'; // 2는 벽 또는 상대방 돌
                    } else {
                        line += board[ny][nx];
                    }
                }
                for (const [pattern, score] of Object.entries(patterns)) {
                    if (line.includes(pattern.replace(/1/g, player))) {
                        totalScore += score;
                    }
                }
            });
        }
    }

    return totalScore;
}


// 승리 조건 확인 (수정된 코드)
function checkWin(player) {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== player) continue; // 현재 플레이어의 돌이 아니면 건너뛰기

            const directions = [[1, 0], [0, 1], [1, 1], [1, -1]]; // 가로, 세로, 대각선(\), 역대각선(/)

            for (const [dx, dy] of directions) {
                let count = 1;
                for (let i = 1; i < 5; i++) {
                    const nx = x + i * dx;
                    const ny = y + i * dy;

                    // 보드 범위를 벗어나거나 다른 플레이어의 돌이면 중단
                    if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE || board[ny][nx] !== player) {
                        break;
                    }
                    count++;
                }

                if (count === 5) {
                    return true; // 5개의 돌이 연속되면 승리
                }
            }
        }
    }
    return false; // 승리 조건을 만족하지 못함
}

// 오목 게임 화면 전환 및 초기화
omokBtn.addEventListener('click', () => {
    timerContainer.style.display = 'none';
    omokContainer.style.display = 'flex';
    initOmok();
});

exitOmokBtn.addEventListener('click', () => {
    omokContainer.style.display = 'none';
    timerContainer.style.display = 'flex';
});

restartOmokBtn.addEventListener('click', initOmok);

// 초기 상태에서는 타이머만 보이도록 설정
omokContainer.style.display = 'none';