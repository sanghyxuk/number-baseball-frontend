# 🎯 숫자야구 게임 - 프론트엔드

커플 전용 1:1 실시간 숫자야구 게임의 **React TypeScript** 프론트엔드입니다.

## 📱 주요 특징

- **🎮 실시간 멀티플레이**: WebSocket을 통한 실시간 1:1 대전
- **📱 iPad 최적화**: 터치 친화적 UI/UX 디자인
- **⚡ 빠른 성능**: React 18 + TypeScript + Zustand
- **🎨 모던 디자인**: Tailwind CSS + Lucide Icons
- **🔄 실시간 동기화**: 게임 상태 실시간 동기화
- **📳 PWA 지원**: 앱처럼 설치 가능

## 🚀 기술 스택

### 핵심 기술
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **Zustand** - 상태 관리
- **SockJS + STOMP** - WebSocket 통신

### 개발 도구
- **Create React App** - 프로젝트 부트스트래핑
- **Lucide React** - 아이콘 라이브러리
- **clsx** - 조건부 CSS 클래스

## 📋 사전 요구사항

- **Node.js** 16.0.0 이상
- **npm** 8.0.0 이상
- **백엔드 서버** 실행 중 (Spring Boot)

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/number-baseball-frontend.git
cd number-baseball-frontend
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env .env.local

# 필요시 API URL 수정
echo "REACT_APP_API_URL=http://localhost:8080" >> .env.local
echo "REACT_APP_WS_URL=http://localhost:8080" >> .env.local
```

### 4. 개발 서버 실행
```bash
npm start
# 또는
npm run dev
```

앱이 http://localhost:3000 에서 실행됩니다.

### 5. 프로덕션 빌드
```bash
npm run build:prod
```

## 📁 프로젝트 구조

```
src/
├── components/           # 재사용 가능한 컴포넌트
│   ├── ui/              # 기본 UI 컴포넌트
│   ├── Keypad.tsx       # 숫자 입력 키패드
│   └── GameHistory.tsx  # 게임 기록 표시
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx     # 홈 화면
│   ├── CreateRoomPage.tsx # 방 생성
│   ├── JoinRoomPage.tsx # 방 참가
│   ├── WaitingPage.tsx  # 대기실
│   ├── SetAnswerPage.tsx # 정답 설정
│   ├── PlayingPage.tsx  # 게임 진행
│   └── ResultPage.tsx   # 게임 결과
├── stores/              # 상태 관리
│   └── gameStore.ts     # 게임 상태 스토어
├── hooks/               # 커스텀 훅
│   └── useGameWebSocket.ts # WebSocket 훅
├── api/                 # API 호출 함수
│   └── gameApi.ts       # REST API 클라이언트
├── types/               # TypeScript 타입 정의
│   └── index.ts         # 전역 타입
├── index.css           # 전역 스타일
└── App.tsx             # 메인 앱 컴포넌트
```

## 🎮 게임 플로우

### 1. 홈 화면
- 방 만들기 / 방 참가하기 선택
- 게임 규칙 설명

### 2. 방 생성 (Phase 1)
- 닉네임 입력 (선택사항)
- 게임 설정: 자릿수(3,4,5), 0포함 여부, 중복 허용 여부
- 방 코드 생성 및 공유

### 3. 방 참가 (Phase 1)
- 방 코드 입력
- 닉네임 입력 (선택사항)

### 4. 대기실 (Phase 2)
- 플레이어 상태 확인
- 게임 시작 준비
- 실시간 연결 상태 표시

### 5. 정답 설정 (Phase 3)
- 각자 정답 숫자 설정
- 게임 규칙에 맞는 유효성 검증
- 양쪽 설정 완료시 게임 시작

### 6. 게임 진행 (Phase 4)
- 턴제 숫자 추측
- 실시간 스트라이크/볼 판정
- 게임 기록 표시
- 포기 기능

### 7. 게임 결과 (Phase 5)
- 승부 결과 표시
- 상세 통계 및 기록
- 재대결 또는 홈으로

## 🔧 주요 기능

### WebSocket 실시간 통신
```typescript
// 준비 상태 전송
sendReady(true);

// 정답 설정
sendAnswer("1234");

// 추측 전송  
sendGuess("5678");

// 게임 포기
sendAbandon();
```

### 상태 관리
```typescript
// 게임 상태 접근
const { status, currentPage, isConnected } = useGameStore();

// 액션 실행
navigateTo(GamePage.PLAYING);
setPlayerReady(true, ready);
addGameTurn(turn);
```

### iPad 최적화
- 터치 친화적 버튼 크기 (최소 48px)
- 반응형 그리드 레이아웃
- 세로/가로 모드 지원
- Safe Area 대응

## 🌐 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `REACT_APP_API_URL` | 백엔드 API URL | `http://localhost:8080` |
| `REACT_APP_WS_URL` | WebSocket URL | `http://localhost:8080` |
| `REACT_APP_ENV` | 환경 구분 | `development` |

## 📜 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm start` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | 테스트 실행 |
| `npm run lint` | 코드 린팅 |
| `npm run format` | 코드 포맷팅 |
| `npm run type-check` | 타입 체크 |
| `npm run preview` | 빌드 결과 미리보기 |

## 🤝 백엔드 연동

### REST API 엔드포인트
- `POST /api/game/create` - 방 생성
- `POST /api/game/join` - 방 참가
- `GET /api/game/status/{sessionId}` - 상태 조회
- `POST /api/game/leave/{sessionId}` - 방 나가기

### WebSocket 채널
- `/ws` - 연결 엔드포인트
- `/app/game/ready` - 준비 상태
- `/app/game/{roomCode}/setAnswer` - 정답 설정
- `/app/game/{roomCode}/guess` - 추측 전송
- `/topic/game/{roomCode}/sync` - 실시간 동기화

## 📱 PWA 기능

### 설치 가능
- 홈 화면에 추가
- 앱처럼 실행
- 오프라인 기본 지원

### 최적화 기능
- 빠른 로딩
- 캐싱 전략
- 터치 최적화

## 🐛 트러블슈팅

### WebSocket 연결 실패
```bash
# 백엔드 서버 상태 확인
curl http://localhost:8080/api/game/debug/status

# CORS 설정 확인
# 백엔드에서 http://localhost:3000 허용 필요
```

### 빌드 실패
```bash
# 캐시 정리
npm run clean

# 의존성 재설치  
npm run reinstall
```

### 타입 에러
```bash
# 타입 체크
npm run type-check

# TypeScript 컴파일러 버전 확인
npx tsc --version
```

## 📈 성능 최적화

### 번들 크기 분석
```bash
npm run analyze
```

### 코드 스플리팅
- 페이지별 코드 분할
- 지연 로딩 적용
- 트리 쉐이킹 최적화

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#3b82f6` (파란색)
- **Strike**: `#dc2626` (빨간색)
- **Ball**: `#ea580c` (주황색)
- **Out**: `#6b7280` (회색)

### 브레이크포인트
- **Mobile**: `< 768px`
- **iPad**: `768px ~ 1024px`
- **iPad Pro**: `1024px ~ 1366px`
- **Desktop**: `> 1366px`

## 📄 라이선스

MIT License

## 👥 기여하기

1. 이 저장소를 포크합니다
2. feature 브랜치를 만듭니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 만듭니다

## 📞 지원

문제가 있으시면 [Issues](https://github.com/your-username/number-baseball-frontend/issues)에 등록해주세요.

---

**Made with ❤️ for couples**