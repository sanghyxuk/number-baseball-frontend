import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import {
    GameState,
    GameStatus,
    GamePage,
    GameSettings,
    GameTurn,
    GameAction
} from '../types';

// 초기 상태
const initialState: GameState = {
    isConnected: false,
    isConnecting: false,
    status: GameStatus.WAITING_FOR_JOINER,
    isCreator: false,
    creatorReady: false,
    joinerReady: false,
    gameHistory: [],
    currentPage: GamePage.HOME,
    isLoading: false,
};

// 게임 상태 관리 스토어
interface GameStore extends GameState {
    // 액션들
    dispatch: (action: GameAction) => void;

    // WebSocket 연결 관리
    connect: () => void;
    disconnect: () => void;

    // 세션 관리
    setSession: (sessionId: string, nickname?: string) => void;
    clearSession: () => void;

    // 방 관리
    setRoom: (roomCode: string, settings: GameSettings, isCreator?: boolean) => void;

    // 게임 상태 업데이트
    updateGameStatus: (status: GameStatus) => void;
    setPlayerReady: (isCreator: boolean, ready: boolean) => void;
    setCurrentTurn: (sessionId?: string) => void;
    setMyAnswer: (answer: string) => void;
    setOpponentAnswer: (answer: string) => void;
    addGameTurn: (turn: GameTurn) => void;

    // 페이지 네비게이션
    navigateTo: (page: GamePage) => void;

    // UI 상태
    setLoading: (loading: boolean) => void;
    setError: (error?: string) => void;

    // 게임 리셋
    resetGame: () => void;

    // WebSocket 액션들
    sendReady: (ready?: boolean) => boolean;
    sendAnswer: (answer: string) => boolean;
    sendGuess: (guess: string) => boolean;
    sendAbandon: () => boolean;

    // WebSocket 함수들을 설정하는 함수
    setWebSocketActions: (actions: {
        sendReady: (ready?: boolean) => boolean;
        sendAnswer: (answer: string) => boolean;
        sendGuess: (guess: string) => boolean;
        sendAbandon: () => boolean;
    }) => void;

    // 유틸리티 함수들
    isMyTurn: () => boolean;
    canMakeGuess: () => boolean;
    getOpponentNickname: () => string;
}

export const useGameStore = create<GameStore>()(
    devtools(
        subscribeWithSelector(
            (set, get) => ({
                ...initialState,

                // 리듀서 패턴을 사용한 상태 업데이트
                dispatch: (action: GameAction) => {
                    const state = get();

                    switch (action.type) {
                        case 'CONNECT_START':
                            set({ isConnecting: true, error: undefined }, false, 'CONNECT_START');
                            break;

                        case 'CONNECT_SUCCESS':
                            set({ isConnected: true, isConnecting: false, error: undefined }, false, 'CONNECT_SUCCESS');
                            break;

                        case 'CONNECT_FAIL':
                            set({ isConnected: false, isConnecting: false, error: action.error }, false, 'CONNECT_FAIL');
                            break;

                        case 'DISCONNECT':
                            set({ isConnected: false, isConnecting: false }, false, 'DISCONNECT');
                            break;

                        case 'SET_SESSION':
                            set({ sessionId: action.sessionId, nickname: action.nickname }, false, 'SET_SESSION');
                            break;

                        case 'SET_ROOM':
                            set({
                                roomCode: action.roomCode,
                                settings: action.settings,
                                isCreator: action.isCreator,
                                currentPage: GamePage.WAITING
                            }, false, 'SET_ROOM');
                            break;

                        case 'SET_STATUS':
                            set({ status: action.status }, false, 'SET_STATUS');
                            break;

                        case 'SET_READY':
                            if (action.isCreator) {
                                set({ creatorReady: action.ready }, false, 'SET_CREATOR_READY');
                            } else {
                                set({ joinerReady: action.ready }, false, 'SET_JOINER_READY');
                            }
                            break;

                        case 'PLAYER_READY_UPDATE':
                            // 현재 사용자의 sessionId와 비교하여 방장/참가자 구분
                            const currentSessionId = get().sessionId;
                            const isCurrentUserCreator = get().isCreator;
                            
                            if (action.sessionId === currentSessionId) {
                                // 자신의 준비 상태 업데이트
                                if (isCurrentUserCreator) {
                                    set({ creatorReady: action.ready }, false, 'PLAYER_READY_UPDATE_SELF');
                                } else {
                                    set({ joinerReady: action.ready }, false, 'PLAYER_READY_UPDATE_SELF');
                                }
                            } else {
                                // 상대방의 준비 상태 업데이트
                                if (isCurrentUserCreator) {
                                    // 현재 사용자가 방장이면 상대방은 참가자
                                    set({ joinerReady: action.ready }, false, 'PLAYER_READY_UPDATE_OTHER');
                                } else {
                                    // 현재 사용자가 참가자면 상대방은 방장
                                    set({ creatorReady: action.ready }, false, 'PLAYER_READY_UPDATE_OTHER');
                                }
                            }
                            break;

                        case 'PLAYER_CONNECTION_UPDATE':
                            console.log('🔗 플레이어 연결 상태 업데이트:', action);
                            // 필요시 플레이어 연결 상태에 따른 UI 업데이트 등 처리
                            break;

                        case 'SET_TURN':
                            set({ currentTurn: action.sessionId }, false, 'SET_TURN');
                            break;

                        case 'SET_ANSWER':
                            set({ myAnswer: action.answer }, false, 'SET_ANSWER');
                            break;

                        case 'ADD_TURN':
                            set(state => ({
                                gameHistory: [...state.gameHistory, action.turn]
                            }), false, 'ADD_TURN');
                            break;

                        case 'SET_PAGE':
                            set({ currentPage: action.page }, false, 'SET_PAGE');
                            break;

                        case 'SET_LOADING':
                            set({ isLoading: action.loading }, false, 'SET_LOADING');
                            break;

                        case 'SET_ERROR':
                            set({ error: action.error }, false, 'SET_ERROR');
                            break;

                        case 'RESET_GAME':
                            set({
                                ...initialState,
                                currentPage: GamePage.HOME
                            }, false, 'RESET_GAME');
                            break;

                        default:
                            console.warn('Unknown action type:', action);
                    }
                },

                // WebSocket 연결 관리
                connect: () => {
                    get().dispatch({ type: 'CONNECT_START' });
                },

                disconnect: () => {
                    get().dispatch({ type: 'DISCONNECT' });
                },

                // 세션 관리
                setSession: (sessionId: string, nickname?: string) => {
                    get().dispatch({ type: 'SET_SESSION', sessionId, nickname });
                },

                clearSession: () => {
                    set({ sessionId: undefined, nickname: undefined }, false, 'CLEAR_SESSION');
                },

                // 방 관리
                setRoom: (roomCode: string, settings: GameSettings, isCreator = false) => {
                    get().dispatch({ type: 'SET_ROOM', roomCode, settings, isCreator });
                },

                // 게임 상태 업데이트
                updateGameStatus: (status: GameStatus) => {
                    get().dispatch({ type: 'SET_STATUS', status });

                    // 상태에 따른 페이지 자동 전환
                    switch (status) {
                        case GameStatus.WAITING_FOR_READY:
                            get().dispatch({ type: 'SET_PAGE', page: GamePage.WAITING });
                            break;
                        case GameStatus.SETTING_ANSWERS:
                            get().dispatch({ type: 'SET_PAGE', page: GamePage.SET_ANSWER });
                            break;
                        case GameStatus.IN_PROGRESS:
                            get().dispatch({ type: 'SET_PAGE', page: GamePage.PLAYING });
                            break;
                        case GameStatus.FINISHED:
                        case GameStatus.ABANDONED:
                            get().dispatch({ type: 'SET_PAGE', page: GamePage.RESULT });
                            break;
                    }
                },

                setPlayerReady: (isCreator: boolean, ready: boolean) => {
                    get().dispatch({ type: 'SET_READY', isCreator, ready });
                },

                setCurrentTurn: (sessionId?: string) => {
                    get().dispatch({ type: 'SET_TURN', sessionId });
                },

                setMyAnswer: (answer: string) => {
                    get().dispatch({ type: 'SET_ANSWER', answer });
                },

                setOpponentAnswer: (answer: string) => {
                    set({ opponentAnswer: answer }, false, 'SET_OPPONENT_ANSWER');
                },

                addGameTurn: (turn: GameTurn) => {
                    get().dispatch({ type: 'ADD_TURN', turn });
                },

                // 페이지 네비게이션
                navigateTo: (page: GamePage) => {
                    get().dispatch({ type: 'SET_PAGE', page });
                },

                // UI 상태
                setLoading: (loading: boolean) => {
                    get().dispatch({ type: 'SET_LOADING', loading });
                },

                setError: (error?: string) => {
                    get().dispatch({ type: 'SET_ERROR', error });
                },

                // 게임 리셋
                resetGame: () => {
                    get().dispatch({ type: 'RESET_GAME' });
                },

                // 유틸리티 함수들
                isMyTurn: () => {
                    const { currentTurn, sessionId } = get();
                    return currentTurn === sessionId;
                },

                canMakeGuess: () => {
                    const { status, isMyTurn } = get();
                    return status === GameStatus.IN_PROGRESS && isMyTurn();
                },

                getOpponentNickname: () => {
                    const { isCreator } = get();
                    return isCreator ? '참가자' : '방장';
                },

                // WebSocket 액션들 (기본값은 빈 함수)
                sendReady: () => {
                    console.warn('WebSocket이 아직 초기화되지 않았습니다.');
                    return false;
                },
                sendAnswer: () => {
                    console.warn('WebSocket이 아직 초기화되지 않았습니다.');
                    return false;
                },
                sendGuess: () => {
                    console.warn('WebSocket이 아직 초기화되지 않았습니다.');
                    return false;
                },
                sendAbandon: () => {
                    console.warn('WebSocket이 아직 초기화되지 않았습니다.');
                    return false;
                },

                // WebSocket 함수들을 설정하는 함수
                setWebSocketActions: (actions) => {
                    set({
                        sendReady: actions.sendReady,
                        sendAnswer: actions.sendAnswer,
                        sendGuess: actions.sendGuess,
                        sendAbandon: actions.sendAbandon,
                    });
                },
            })
        ),
        {
            name: 'game-store', // devtools에서 보이는 이름
        }
    )
);

// 스토어에서 특정 값들만 선택하는 셀렉터들 (최적화됨)
export const useGameStatus = () => useGameStore(state => state.status);
export const useCurrentPage = () => useGameStore(state => state.currentPage);
export const useIsConnected = () => useGameStore(state => state.isConnected);
export const useGameSettings = () => useGameStore(state => state.settings);
export const useGameHistory = () => useGameStore(state => state.gameHistory);
export const useSessionInfo = () => useGameStore(state => ({
    sessionId: state.sessionId,
    nickname: state.nickname,
    roomCode: state.roomCode
}));
export const usePlayerStatus = () => useGameStore(state => ({
    isCreator: state.isCreator,
    creatorReady: state.creatorReady,
    joinerReady: state.joinerReady,
    currentTurn: state.currentTurn,
    isMyTurn: state.isMyTurn(),
    myAnswer: state.myAnswer,
    opponentAnswer: state.opponentAnswer
}));

// 상태 변화 구독 (디버깅 및 로깅용)
if (process.env.NODE_ENV === 'development') {
    useGameStore.subscribe(
        (state) => state.currentPage,
        (currentPage, previousPage) => {
            console.log(`📄 페이지 변경: ${previousPage} → ${currentPage}`);
        }
    );

    useGameStore.subscribe(
        (state) => state.status,
        (status, previousStatus) => {
            console.log(`🎮 게임 상태 변경: ${previousStatus} → ${status}`);
        }
    );

    useGameStore.subscribe(
        (state) => state.isConnected,
        (isConnected, previousIsConnected) => {
            console.log(`🔗 연결 상태 변경: ${previousIsConnected} → ${isConnected}`);
        }
    );
}