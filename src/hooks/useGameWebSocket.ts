import { useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useGameStore } from '../stores/gameStore';
import {
    WebSocketMessage,
    WebSocketMessageType,
    StateChangePayload,
    PlayerReadyPayload,
    AnswerSetPayload,
    NewGuessPayload,
    GameFinishedPayload,
    PlayerConnectionPayload,
    ErrorPayload,
    GameStatus
} from '../types';

// WebSocket 연결 URL 생성
const getWebSocketBaseUrl = () => {
    return process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
};

const WS_BASE_URL = getWebSocketBaseUrl();
const WS_ENDPOINT = '/ws';

console.log('🔗 WebSocket Base URL:', WS_BASE_URL);

export function useGameWebSocket() {
    const clientRef = useRef<Client | null>(null);
    const subscriptionsRef = useRef<string[]>([]);
    const connectionAttemptRef = useRef<boolean>(false);

    const {
        sessionId,
        roomCode,
        isConnected,
        isConnecting,
        isCreator,
        dispatch,
        updateGameStatus,
        setPlayerReady,
        setCurrentTurn,
        addGameTurn,
        setOpponentAnswer,
        setError
    } = useGameStore();

    // WebSocket 연결
    const connect = useCallback(() => {
        if (!sessionId) {
            console.warn('⚠️ 세션 ID가 없어 WebSocket 연결을 시도하지 않습니다.');
            return;
        }

        if (clientRef.current?.connected || isConnecting || connectionAttemptRef.current) {
            console.log('✅ 이미 WebSocket에 연결되어 있거나 연결 중입니다.');
            return;
        }

        console.log('🔌 WebSocket 연결 시도...', { sessionId, roomCode });
        connectionAttemptRef.current = true;
        dispatch({ type: 'CONNECT_START' });

        try {
            // STOMP 클라이언트 생성 (새로운 방식)
            const client = new Client({
                webSocketFactory: () => new SockJS(`${WS_BASE_URL}${WS_ENDPOINT}`),
                connectHeaders: {
                    'X-Player-Session-Id': sessionId
                },
                debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: (frame) => {
                    console.log('✅ WebSocket 연결 성공:', frame);
                    clientRef.current = client;
                    connectionAttemptRef.current = false;
                    dispatch({ type: 'CONNECT_SUCCESS' });

                    // 기본 구독 설정
                    subscribeToChannels(client);

                    // 방이 있으면 게임 채널 구독
                    if (roomCode) {
                        subscribeToGameRoom(client, roomCode);
                    }
                },
                onStompError: (frame) => {
                    console.error('❌ STOMP 에러:', frame);
                    connectionAttemptRef.current = false;
                    dispatch({ type: 'CONNECT_FAIL', error: frame.headers.message || 'STOMP 연결 실패' });
                },
                onWebSocketError: (error) => {
                    console.error('❌ WebSocket 에러:', error);
                    connectionAttemptRef.current = false;
                    dispatch({ type: 'CONNECT_FAIL', error: 'WebSocket 연결 실패' });
                },
                onDisconnect: () => {
                    console.log('🔌 WebSocket 연결 해제됨');
                    connectionAttemptRef.current = false;
                    dispatch({ type: 'DISCONNECT' });
                }
            });

            client.activate();

        } catch (error) {
            connectionAttemptRef.current = false;
            const errorMessage = error instanceof Error ? error.message : String(error);
            dispatch({ type: 'CONNECT_FAIL', error: errorMessage });
        }
    }, [sessionId, roomCode, dispatch]);

    // WebSocket 연결 해제
    const disconnect = useCallback(() => {
        if (clientRef.current?.connected) {
            console.log('🔌 WebSocket 연결 해제...');

            // 구독 해제
            subscriptionsRef.current.forEach(id => {
                try {
                    clientRef.current?.unsubscribe(id);
                } catch (error) {
                    console.warn('구독 해제 실패:', id, error);
                }
            });
            subscriptionsRef.current = [];

            // 연결 해제
            clientRef.current.deactivate();
            clientRef.current = null;
        }

        connectionAttemptRef.current = false;
        dispatch({ type: 'DISCONNECT' });
    }, [dispatch]);

    // 기본 채널 구독
    const subscribeToChannels = useCallback((client: Client) => {
        if (!sessionId) return;

        // 개별 오류 메시지 구독
        const errorSubscription = client.subscribe(
            '/user/queue/errors',
            (message) => {
                try {
                    const wsMessage: WebSocketMessage<ErrorPayload> = JSON.parse(message.body);
                    console.error('🚨 WebSocket 오류:', wsMessage.payload);
                    setError(wsMessage.payload.message);
                } catch (error) {
                    console.error('오류 메시지 파싱 실패:', error);
                }
            }
        );
        subscriptionsRef.current.push(errorSubscription.id);

        // 개별 게임 상태 구독
        const gameStateSubscription = client.subscribe(
            '/user/queue/game-state',
            (message) => {
                try {
                    const wsMessage: WebSocketMessage<StateChangePayload> = JSON.parse(message.body);
                    handleStateChange(wsMessage.payload);
                } catch (error) {
                    console.error('게임 상태 메시지 파싱 실패:', error);
                }
            }
        );
        subscriptionsRef.current.push(gameStateSubscription.id);

    }, [sessionId, setError]);

    // 게임 방 채널 구독
    const subscribeToGameRoom = useCallback((client: Client, roomCode: string) => {
        console.log('🎮 게임 방 채널 구독:', roomCode);

        const gameSubscription = client.subscribe(
            `/topic/game/${roomCode}/sync`,
            (message) => {
                try {
                    const wsMessage: WebSocketMessage = JSON.parse(message.body);
                    console.log('📨 게임 방 메시지 수신:', wsMessage);
                    handleGameMessage(wsMessage);
                } catch (error) {
                    console.error('게임 메시지 파싱 실패:', error);
                }
            }
        );
        subscriptionsRef.current.push(gameSubscription.id);

    }, []);

    // 게임 메시지 처리
    const handleGameMessage = useCallback((message: WebSocketMessage) => {
        console.log('🎮 게임 메시지 수신:', message.type, message.payload);

        switch (message.type) {
            case WebSocketMessageType.STATE_CHANGE:
                handleStateChange(message.payload as StateChangePayload);
                break;

            case WebSocketMessageType.PLAYER_READY:
                handlePlayerReady(message.payload as PlayerReadyPayload);
                break;

            case WebSocketMessageType.ANSWER_SET:
                handleAnswerSet(message.payload as AnswerSetPayload);
                break;

            case WebSocketMessageType.NEW_GUESS:
                handleNewGuess(message.payload as NewGuessPayload);
                break;

            case WebSocketMessageType.GAME_FINISHED:
                handleGameFinished(message.payload as GameFinishedPayload);
                break;

            case WebSocketMessageType.PLAYER_CONNECTED:
            case WebSocketMessageType.PLAYER_DISCONNECTED:
                handlePlayerConnection(message.payload as PlayerConnectionPayload);
                break;

            default:
                console.warn('알 수 없는 메시지 타입:', message.type);
        }
    }, []);

    // 상태 변경 처리
    const handleStateChange = useCallback((payload: StateChangePayload) => {
        console.log('📊 게임 상태 변경:', payload);
        console.log('📊 현재 상태 - creatorReady:', payload.creatorReady, 'joinerReady:', payload.joinerReady);
        
        updateGameStatus(payload.status);
        setCurrentTurn(payload.currentTurn);
        setPlayerReady(true, payload.creatorReady);
        setPlayerReady(false, payload.joinerReady);
    }, [updateGameStatus, setCurrentTurn, setPlayerReady]);

    // 플레이어 준비 상태 처리
    const handlePlayerReady = useCallback((payload: PlayerReadyPayload) => {
        console.log('👤 플레이어 준비 상태:', payload);
        
        // 플레이어 준비 상태 업데이트
        // payload.sessionId가 현재 sessionId와 같으면 자신의 상태
        // 다르면 상대방의 상태
        dispatch({ 
            type: 'PLAYER_READY_UPDATE', 
            sessionId: payload.sessionId, 
            ready: payload.ready,
            nickname: payload.nickname
        });
    }, [dispatch]);

    // 정답 설정 처리
    const handleAnswerSet = useCallback((payload: AnswerSetPayload) => {
        console.log('✅ 정답 설정:', payload);
        if (payload.allAnswersSet) {
            console.log('🎯 모든 플레이어 정답 설정 완료 - 게임 시작!');
        }
    }, []);

    // 새 추측 처리
    const handleNewGuess = useCallback((payload: NewGuessPayload) => {
        console.log('🎯 새 추측:', payload);

        const turn = {
            turnNumber: payload.turnNumber,
            guesserSessionId: payload.guesser,
            guess: payload.guess,
            result: payload.result,
            timestamp: new Date().toISOString()
        };

        addGameTurn(turn);
        setCurrentTurn(payload.nextTurn);
    }, [addGameTurn, setCurrentTurn]);

    // 게임 종료 처리
    const handleGameFinished = useCallback((payload: GameFinishedPayload) => {
        console.log('🏆 게임 종료:', payload);
        
        // 상대방 정답 저장
        if (payload.creatorAnswer && payload.joinerAnswer) {
            const opponentAnswer = isCreator ? payload.joinerAnswer : payload.creatorAnswer;
            setOpponentAnswer(opponentAnswer);
            console.log('💡 상대방 정답 저장:', opponentAnswer);
        }
        
        updateGameStatus(GameStatus.FINISHED);
    }, [updateGameStatus, setOpponentAnswer, isCreator]);

    // 플레이어 연결 상태 처리
    const handlePlayerConnection = useCallback((payload: PlayerConnectionPayload) => {
        console.log('🔗 플레이어 연결 상태:', payload);
        
        dispatch({
            type: 'PLAYER_CONNECTION_UPDATE',
            sessionId: payload.sessionId,
            connected: payload.connected,
            nickname: payload.nickname
        });
    }, [dispatch]);

    // WebSocket 메시지 전송
    const sendMessage = useCallback((destination: string, body: any) => {
        if (!clientRef.current?.connected) {
            console.error('❌ WebSocket이 연결되지 않았습니다.');
            setError('서버와 연결이 끊어졌습니다. 다시 연결해주세요.');
            return false;
        }

        try {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body)
            });
            console.log('📤 메시지 전송:', destination, body);
            return true;
        } catch (error) {
            console.error('❌ 메시지 전송 실패:', error);
            setError('메시지 전송에 실패했습니다.');
            return false;
        }
    }, [setError]);

    // 게임 액션 함수들
    const sendReady = useCallback((ready: boolean = true) => {
        if (!sessionId) return false;

        return sendMessage('/app/game/ready', {
            sessionId,
            ready
        });
    }, [sessionId, sendMessage]);

    const sendAnswer = useCallback((answer: string) => {
        if (!sessionId || !roomCode) return false;

        return sendMessage(`/app/game/${roomCode}/setAnswer`, {
            sessionId,
            answer
        });
    }, [sessionId, roomCode, sendMessage]);

    const sendGuess = useCallback((guess: string) => {
        if (!sessionId || !roomCode) return false;

        return sendMessage(`/app/game/${roomCode}/guess`, {
            sessionId,
            guess
        });
    }, [sessionId, roomCode, sendMessage]);

    const sendAbandon = useCallback(() => {
        if (!sessionId || !roomCode) return false;

        return sendMessage(`/app/game/${roomCode}/abandon`, {
            sessionId
        });
    }, [sessionId, roomCode, sendMessage]);

    // 컴포넌트 마운트/언마운트 시 연결 관리
    useEffect(() => {
        if (sessionId && !isConnected && !isConnecting) {
            connect();
        }

        // cleanup 함수에서는 disconnect를 호출하지 않음 (의도적인 연결 유지)
        return () => {
            // 필요시에만 연결 해제
        };
    }, [sessionId, isConnected, isConnecting]); // connect, disconnect 제거

    // roomCode 변경시 게임 채널 재구독
    useEffect(() => {
        if (clientRef.current?.connected && roomCode) {
            subscribeToGameRoom(clientRef.current, roomCode);
        }
    }, [roomCode, subscribeToGameRoom]);

    return {
        isConnected,
        isConnecting,
        connect,
        disconnect,
        sendReady,
        sendAnswer,
        sendGuess,
        sendAbandon
    };
}