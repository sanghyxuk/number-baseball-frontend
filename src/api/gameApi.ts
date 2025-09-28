import {
    ApiResponse,
    CreateRoomRequest,
    CreateRoomResponse,
    JoinRoomRequest,
    JoinRoomResponse,
    GameStateInfo,
    AppError
} from '../types';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/game';
const DEFAULT_TIMEOUT = 10000; // 10초

// 에러 클래스
class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// HTTP 클라이언트 설정
class ApiClient {
    private baseURL: string;
    private defaultHeaders: HeadersInit;
    private timeout: number;

    constructor(baseURL: string, timeout = DEFAULT_TIMEOUT) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${API_PREFIX}${endpoint}`;

        // AbortController로 타임아웃 처리
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const config: RequestInit = {
            headers: { ...this.defaultHeaders, ...options.headers },
            signal: controller.signal,
            ...options,
        };

        try {
            console.log(`🚀 API 요청: ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // 응답 상태 확인
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

                try {
                    const errorBody = await response.text();
                    if (errorBody) {
                        // JSON 응답인 경우 파싱 시도
                        try {
                            const errorJson = JSON.parse(errorBody);
                            errorMessage = errorJson.message || errorMessage;
                        } catch {
                            // JSON이 아니면 텍스트 그대로 사용
                            errorMessage = errorBody;
                        }
                    }
                } catch (e) {
                    console.warn('에러 응답 파싱 실패:', e);
                }

                throw new ApiError(errorMessage, response.status);
            }

            // 응답 파싱
            const contentType = response.headers.get('content-type');
            let data: ApiResponse<T>;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // JSON이 아닌 응답의 경우 기본 구조로 래핑
                const textData = await response.text();
                data = {
                    success: true,
                    message: 'Success',
                    data: textData as unknown as T
                };
            }

            console.log(`✅ API 응답 성공:`, data);
            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ApiError) {
                console.error(`❌ API 에러 (${error.statusCode}):`, error.message);
                return {
                    success: false,
                    message: error.message,
                    data: null
                };
            }

            // 네트워크 에러 또는 기타 에러 처리
            let errorMessage = '알 수 없는 오류가 발생했습니다.';

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
                } else {
                    errorMessage = error.message;
                }
            }

            console.error('❌ API 요청 실패:', error);

            return {
                success: false,
                message: errorMessage,
                data: null
            };
        }
    }

    // GET 요청
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    // POST 요청
    async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // PUT 요청
    async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // DELETE 요청
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

// API 클라이언트 인스턴스
const apiClient = new ApiClient(API_BASE_URL);

// ========== 게임 API 함수들 ==========

/**
 * 새 게임 방 생성
 */
export async function createRoom(request: CreateRoomRequest): Promise<ApiResponse<CreateRoomResponse>> {
    console.log('🏠 방 생성 요청:', request);

    // 요청 데이터 검증
    const validation = validateGameSettings(request);
    if (!validation.isValid) {
        return {
            success: false,
            message: validation.errors.join(', '),
            data: null
        };
    }

    const response = await apiClient.post<CreateRoomResponse>('/create', request);

    if (response.success) {
        console.log('✅ 방 생성 성공:', response.data);
    } else {
        console.error('❌ 방 생성 실패:', response.message);
    }

    return response;
}

/**
 * 기존 게임 방에 참가
 */
export async function joinRoom(request: JoinRoomRequest): Promise<ApiResponse<JoinRoomResponse>> {
    console.log('🚪 방 참가 요청:', request);

    // 방 코드 검증
    if (!isValidRoomCode(request.roomCode)) {
        return {
            success: false,
            message: '올바른 방 코드를 입력해주세요. (6자리 영문/숫자)',
            data: null
        };
    }

    const response = await apiClient.post<JoinRoomResponse>('/join', request);

    if (response.success) {
        console.log('✅ 방 참가 성공:', response.data);
    } else {
        console.error('❌ 방 참가 실패:', response.message);
    }

    return response;
}

/**
 * 현재 게임 상태 조회
 */
export async function getGameStatus(sessionId: string): Promise<ApiResponse<GameStateInfo>> {
    if (!sessionId) {
        return {
            success: false,
            message: '세션 ID가 필요합니다.',
            data: null
        };
    }

    console.log('📊 게임 상태 조회:', sessionId);

    const response = await apiClient.get<GameStateInfo>(`/status/${sessionId}`);

    if (response.success) {
        console.log('✅ 상태 조회 성공:', response.data);
    } else {
        console.error('❌ 상태 조회 실패:', response.message);
    }

    return response;
}

/**
 * 게임 방 나가기
 */
export async function leaveRoom(sessionId: string): Promise<ApiResponse<void>> {
    if (!sessionId) {
        return {
            success: false,
            message: '세션 ID가 필요합니다.',
            data: null
        };
    }

    console.log('🚪 방 나가기:', sessionId);

    const response = await apiClient.post<void>(`/leave/${sessionId}`);

    if (response.success) {
        console.log('✅ 방 나가기 성공');
    } else {
        console.error('❌ 방 나가기 실패:', response.message);
    }

    return response;
}

/**
 * 서버 상태 확인 (디버깅용)
 */
export async function getServerStatus(): Promise<ApiResponse<string>> {
    console.log('🔍 서버 상태 확인');

    const response = await apiClient.get<string>('/debug/status');

    if (response.success) {
        console.log('✅ 서버 상태:', response.data);
    } else {
        console.error('❌ 서버 상태 확인 실패:', response.message);
    }

    return response;
}

// ========== 유틸리티 함수들 ==========

/**
 * API 응답이 성공인지 확인하는 타입 가드
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
    return response.success && response.data !== null;
}

/**
 * 방 코드 유효성 검사
 */
export function isValidRoomCode(roomCode: string): boolean {
    if (!roomCode) return false;

    // 6자리 영문/숫자 조합
    const roomCodePattern = /^[A-Z0-9]{6}$/;
    return roomCodePattern.test(roomCode.toUpperCase());
}

/**
 * 닉네임 유효성 검사
 */
export function isValidNickname(nickname: string): boolean {
    if (!nickname) return true; // 닉네임은 선택사항

    // 1-10자리, 특수문자 제외
    const nicknamePattern = /^[가-힣a-zA-Z0-9\s]{1,10}$/;
    return nicknamePattern.test(nickname.trim());
}

/**
 * 게임 설정 유효성 검사
 */
export function validateGameSettings(settings: Partial<CreateRoomRequest>): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // 자릿수 검사
    if (!settings.digits || ![3, 4, 5].includes(settings.digits)) {
        errors.push('자릿수는 3, 4, 5 중 하나여야 합니다.');
    }

    // 닉네임 검사 (선택사항)
    if (settings.nickname && !isValidNickname(settings.nickname)) {
        errors.push('닉네임은 1-10자의 한글, 영문, 숫자만 허용됩니다.');
    }

    // Boolean 값 검사
    if (typeof settings.allowZero !== 'boolean') {
        errors.push('0 포함 여부는 true 또는 false여야 합니다.');
    }

    if (typeof settings.allowDuplicate !== 'boolean') {
        errors.push('중복 허용 여부는 true 또는 false여야 합니다.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function formatErrorMessage(error: string): string {
    // 일반적인 에러 메시지들을 한글로 변환
    const errorMessages: Record<string, string> = {
        'Network Error': '네트워크 연결을 확인해주세요.',
        'Failed to fetch': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
        'Request timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        'HTTP 400': '잘못된 요청입니다. 입력 정보를 확인해주세요.',
        'HTTP 401': '인증이 필요합니다. 다시 로그인해주세요.',
        'HTTP 403': '접근 권한이 없습니다.',
        'HTTP 404': '요청한 리소스를 찾을 수 없습니다.',
        'HTTP 409': '이미 진행 중인 게임이 있거나 방이 가득 찼습니다.',
        'HTTP 500': '서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        'HTTP 502': '서버가 일시적으로 사용할 수 없습니다.',
        'HTTP 503': '서버가 점검 중입니다. 잠시 후 다시 시도해주세요.',
    };

    // 정확한 매치 확인
    if (errorMessages[error]) {
        return errorMessages[error];
    }

    // 부분 매치 확인
    for (const [key, message] of Object.entries(errorMessages)) {
        if (error.includes(key)) {
            return message;
        }
    }

    // 특정 패턴 매치
    if (error.includes('timeout') || error.includes('TIMEOUT')) {
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    if (error.includes('connection') || error.includes('CONNECTION')) {
        return '연결에 문제가 있습니다. 네트워크를 확인해주세요.';
    }

    return error; // 매치되지 않으면 원본 반환
}

/**
 * 앱 에러 생성 유틸리티
 */
export function createAppError(
    code: string,
    message: string,
    details?: string
): AppError {
    return {
        code,
        message,
        details,
        timestamp: Date.now()
    };
}

/**
 * 재시도 로직이 포함된 API 호출
 */
export async function retryApiCall<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<ApiResponse<T>> {
    let lastError: ApiResponse<T> | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await apiCall();

            if (result.success) {
                return result;
            }

            lastError = result;

            // 마지막 시도가 아니면 대기
            if (attempt < maxRetries) {
                console.log(`🔄 API 재시도 ${attempt}/${maxRetries}, ${delay}ms 대기...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // 지수 백오프
            }

        } catch (error) {
            console.error(`❌ API 호출 시도 ${attempt} 실패:`, error);

            if (attempt === maxRetries) {
                return {
                    success: false,
                    message: error instanceof Error ? error.message : '알 수 없는 오류',
                    data: null
                };
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }

    return lastError || {
        success: false,
        message: '모든 재시도가 실패했습니다.',
        data: null
    };
}

// ========== 환경 설정 ==========

/**
 * 개발 환경에서 API 관련 디버그 정보 출력
 */
export function logApiConfig() {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 API Configuration:');
        console.log('  Base URL:', API_BASE_URL);
        console.log('  Full API URL:', `${API_BASE_URL}${API_PREFIX}`);
        console.log('  Environment:', process.env.NODE_ENV);
        console.log('  Timeout:', DEFAULT_TIMEOUT + 'ms');
    }
}

// 앱 시작시 API 설정 로그 출력
logApiConfig();