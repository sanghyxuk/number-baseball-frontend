// 게임 설정 타입
export interface GameSettings {
    digits: number;           // 3, 4, 5
    allowZero: boolean;       // 0 포함 여부
    allowDuplicate: boolean;  // 중복 허용 여부
}

// 게임 상태 enum
export enum GameStatus {
    WAITING_FOR_JOINER = 'WAITING_FOR_JOINER',
    WAITING_FOR_READY = 'WAITING_FOR_READY',
    SETTING_ANSWERS = 'SETTING_ANSWERS',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
    ABANDONED = 'ABANDONED'
}

// 게임 턴 정보
export interface GameTurn {
    turnNumber: number;
    guesserSessionId: string;
    guess: string;
    result: string;
    timestamp: string;
}

// API 응답 타입 (제네릭 개선)
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
}

// 방 생성 요청/응답
export interface CreateRoomRequest {
    nickname?: string;
    digits: number;
    allowZero: boolean;
    allowDuplicate: boolean;
}

export interface CreateRoomResponse {
    roomCode: string;
    sessionId: string;
    settings: GameSettings;
}

// 방 참가 요청/응답
export interface JoinRoomRequest {
    roomCode: string;
    nickname?: string;
}

export interface JoinRoomResponse {
    roomCode: string;
    sessionId: string;
    settings: GameSettings;
    status: GameStatus;
}

// 게임 상태 정보
export interface GameStateInfo {
    roomCode: string;
    status: GameStatus;
    currentTurn?: string;
    creatorReady: boolean;
    joinerReady: boolean;
    turnCount: number;
}

// WebSocket 메시지 타입
export enum WebSocketMessageType {
    STATE_CHANGE = 'STATE_CHANGE',
    PLAYER_READY = 'PLAYER_READY',
    ANSWER_SET = 'ANSWER_SET',
    NEW_GUESS = 'NEW_GUESS',
    GAME_FINISHED = 'GAME_FINISHED',
    PLAYER_CONNECTED = 'PLAYER_CONNECTED',
    PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
    ERROR = 'ERROR'
}

// WebSocket 메시지 구조 (개선된 제네릭)
export interface WebSocketMessage<T = any> {
    type: WebSocketMessageType;
    payload: T;
    timestamp: number;
}

// WebSocket 페이로드 타입들
export interface StateChangePayload {
    status: GameStatus;
    currentTurn?: string;
    roomCode: string;
    creatorReady: boolean;
    joinerReady: boolean;
}

export interface PlayerReadyPayload {
    sessionId: string;
    ready: boolean;
    nickname: string;
}

export interface AnswerSetPayload {
    sessionId: string;
    answerSet: boolean;
    allAnswersSet: boolean;
}

export interface NewGuessPayload {
    guesser: string;
    guess: string;
    result: string;
    turnNumber: number;
    nextTurn?: string;
}

export interface GameFinishedPayload {
    winner: string;
    reason: 'WIN' | 'ABANDON' | 'TIMEOUT';
    gameHistory: GameTurn[];
    totalTurns: number;
    creatorAnswer?: string;
    joinerAnswer?: string;
}

export interface PlayerConnectionPayload {
    sessionId: string;
    nickname: string;
    connected: boolean;
    connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTED';
}

export interface ErrorPayload {
    errorCode: string;
    message: string;
    details?: string;
}

// 게임 상태 관리 타입 (개선됨)
export interface GameState {
    // 연결 상태
    isConnected: boolean;
    isConnecting: boolean;

    // 세션 정보
    sessionId?: string;
    nickname?: string;

    // 방 정보
    roomCode?: string;
    settings?: GameSettings;
    status: GameStatus;

    // 플레이어 상태
    isCreator: boolean;
    creatorReady: boolean;
    joinerReady: boolean;

    // 게임 진행 상태
    currentTurn?: string;
    myAnswer?: string;
    opponentAnswer?: string;
    gameHistory: GameTurn[];

    // UI 상태
    currentPage: GamePage;
    isLoading: boolean;
    error?: string;
}

// 게임 페이지 enum
export enum GamePage {
    HOME = 'HOME',                    // 시작 화면
    CREATE_ROOM = 'CREATE_ROOM',      // 방 생성
    JOIN_ROOM = 'JOIN_ROOM',          // 방 참가
    WAITING = 'WAITING',              // 대기/준비
    SET_ANSWER = 'SET_ANSWER',        // 정답 설정
    PLAYING = 'PLAYING',              // 게임 진행
    RESULT = 'RESULT'                 // 게임 결과
}

// 액션 타입들 (더 명확한 타입 정의)
export type GameAction =
    | { type: 'CONNECT_START' }
    | { type: 'CONNECT_SUCCESS' }
    | { type: 'CONNECT_FAIL'; error: string }
    | { type: 'DISCONNECT' }
    | { type: 'SET_SESSION'; sessionId: string; nickname?: string }
    | { type: 'SET_ROOM'; roomCode: string; settings: GameSettings; isCreator: boolean }
    | { type: 'SET_STATUS'; status: GameStatus }
    | { type: 'SET_READY'; isCreator: boolean; ready: boolean }
    | { type: 'PLAYER_READY_UPDATE'; sessionId: string; ready: boolean; nickname: string }
    | { type: 'PLAYER_CONNECTION_UPDATE'; sessionId: string; connected: boolean; nickname: string }
    | { type: 'SET_TURN'; sessionId?: string }
    | { type: 'SET_ANSWER'; answer: string }
    | { type: 'ADD_TURN'; turn: GameTurn }
    | { type: 'SET_PAGE'; page: GamePage }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_ERROR'; error?: string }
    | { type: 'RESET_GAME' };

// 컴포넌트 Props 타입들 (개선됨)
export interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ButtonProps extends BaseProps {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseProps {
    type?: 'text' | 'number' | 'password';
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    disabled?: boolean;
    maxLength?: number;
    pattern?: string;
    autoFocus?: boolean;
}

export interface CardProps extends BaseProps {
    title?: string;
    subtitle?: string;
}

// 숫자야구 게임 로직 타입
export interface JudgeResult {
    strikes: number;
    balls: number;
    isComplete: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// 키패드 타입 (개선됨)
export interface KeypadProps {
    onNumberPress: (num: string) => void;
    onBackspace: () => void;
    onSubmit: () => void;
    disabled?: boolean;
    submitLabel?: string;
}

// 게임 히스토리 표시용 타입
export interface GameHistoryItem extends GameTurn {
    isMyTurn: boolean;
    playerName: string;
}

// 환경 설정 타입
export interface EnvConfig {
    apiUrl: string;
    wsUrl: string;
    environment: 'development' | 'production';
    debug?: boolean;
}

// 에러 처리 타입들
export interface AppError {
    code: string;
    message: string;
    details?: string;
    timestamp: number;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorInfo {
    error: AppError;
    severity: ErrorSeverity;
    context?: Record<string, any>;
}

// 네트워크 상태 타입
export interface NetworkStatus {
    isOnline: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
}

// 타입 가드 함수들
export const isValidGameStatus = (status: string): status is GameStatus => {
    return Object.values(GameStatus).includes(status as GameStatus);
};

export const isValidGamePage = (page: string): page is GamePage => {
    return Object.values(GamePage).includes(page as GamePage);
};

export const isValidWebSocketMessageType = (type: string): type is WebSocketMessageType => {
    return Object.values(WebSocketMessageType).includes(type as WebSocketMessageType);
};

// 유틸리티 타입들
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 상태 선택자 타입들
export type GameStateSelector<T> = (state: GameState) => T;

// 이벤트 핸들러 타입들
export type GameEventHandler<T = void> = (data?: T) => void | Promise<void>;
export type ErrorHandler = (error: AppError | Error) => void;
export type StateChangeHandler<T> = (newState: T, prevState: T) => void;

// 커스텀 훅 반환 타입들
export interface UseGameWebSocketReturn {
    isConnected: boolean;
    isConnecting: boolean;
    connect: () => void;
    disconnect: () => void;
    sendReady: (ready?: boolean) => boolean;
}

// API 클라이언트 타입들
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
    method: HttpMethod;
    url: string;
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
}

// 폼 관련 타입들
export interface FormField<T = string> {
    value: T;
    error?: string;
    touched: boolean;
    dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
    fields: { [K in keyof T]: FormField<T[K]> };
    isValid: boolean;
    isSubmitting: boolean;
    errors: string[];
}

// 라우팅 관련 타입들 (필요시)
export interface RouteParams {
    roomCode?: string;
    sessionId?: string;
}

// 테마/스타일 관련 타입들
export interface ThemeColors {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
}

// 디바이스/미디어 쿼리 타입들
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
    type: DeviceType;
    orientation: Orientation;
    isTouch: boolean;
    screenWidth: number;
    screenHeight: number;
}