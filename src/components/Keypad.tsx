import React from 'react';
import { Delete, Send } from 'lucide-react';
import clsx from 'clsx';
import { KeypadProps, GameSettings } from '../types';

interface ExtendedKeypadProps extends KeypadProps {
    settings?: GameSettings;
    currentInput?: string;
    maxLength?: number;
}

export const Keypad: React.FC<ExtendedKeypadProps> = ({
                                                          onNumberPress,
                                                          onBackspace,
                                                          onSubmit,
                                                          disabled = false,
                                                          submitLabel = '확인',
                                                          settings,
                                                          currentInput = '',
                                                          maxLength
                                                      }) => {

    // 숫자 버튼 데이터 생성
    const generateNumbers = () => {
        const numbers = [];

        // 0을 포함할지 결정
        const startNumber = settings?.allowZero ? 0 : 1;
        const endNumber = 9;

        for (let i = startNumber; i <= endNumber; i++) {
            numbers.push(i.toString());
        }

        return numbers;
    };

    const numbers = generateNumbers();
    const canAddMore = !maxLength || currentInput.length < maxLength;
    const canSubmit = currentInput.length > 0;
    const canBackspace = currentInput.length > 0;

    // 숫자가 입력 가능한지 확인
    const isNumberDisabled = (number: string) => {
        if (disabled || !canAddMore) return true;

        // 중복 허용 안하는 경우 이미 입력된 숫자는 비활성화
        if (settings && !settings.allowDuplicate) {
            return currentInput.includes(number);
        }

        return false;
    };

    // 숫자 버튼 렌더링
    const renderNumberButton = (number: string) => (
        <button
            key={number}
            onClick={() => onNumberPress(number)}
            disabled={isNumberDisabled(number)}
            className={clsx(
                'keypad-btn',
                isNumberDisabled(number) && 'opacity-50 cursor-not-allowed'
            )}
        >
            {number}
        </button>
    );

    // 키패드 레이아웃 생성 (3x3 + 추가 행)
    const renderKeypad = () => {
        const rows = [];
        const numbersPerRow = 3;

        // 숫자를 3개씩 나누어 행 생성
        for (let i = 0; i < numbers.length; i += numbersPerRow) {
            const rowNumbers = numbers.slice(i, i + numbersPerRow);
            rows.push(rowNumbers);
        }

        return (
            <div className="space-y-3">
                {/* 숫자 행들 */}
                {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-3">
                        {row.map(renderNumberButton)}
                        {/* 마지막 행이 3개 미만이면 빈 공간 채우기 */}
                        {row.length < numbersPerRow &&
                            Array.from({ length: numbersPerRow - row.length }).map((_, emptyIndex) => (
                                <div key={`empty-${emptyIndex}`} />
                            ))
                        }
                    </div>
                ))}

                {/* 컨트롤 버튼 행 */}
                <div className="grid grid-cols-2 gap-3">
                    {/* 백스페이스 버튼 */}
                    <button
                        onClick={onBackspace}
                        disabled={disabled || !canBackspace}
                        className={clsx(
                            'keypad-btn bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
                            (disabled || !canBackspace) && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <Delete className="w-5 h-5 mx-auto" />
                    </button>

                    {/* 확인 버튼 */}
                    <button
                        onClick={onSubmit}
                        disabled={disabled || !canSubmit}
                        className={clsx(
                            'keypad-btn bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200',
                            (disabled || !canSubmit) && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <Send className="w-5 h-5 mx-auto" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-xs mx-auto">
            {renderKeypad()}

            {/* 도움말 텍스트 */}
            {settings && (
                <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
                    <p>
                        {settings.digits}자리 숫자를 입력하세요
                    </p>
                    <div className="flex justify-center gap-4">
                        <span>0: {settings.allowZero ? '허용' : '금지'}</span>
                        <span>중복: {settings.allowDuplicate ? '허용' : '금지'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// 입력 표시 컴포넌트
interface NumberDisplayProps {
    value: string;
    maxLength: number;
    className?: string;
    placeholder?: string;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
                                                                value,
                                                                maxLength,
                                                                className,
                                                                placeholder = '?'
                                                            }) => {
    return (
        <div className={clsx(
            'flex justify-center gap-2 mb-6',
            className
        )}>
            {Array.from({ length: maxLength }).map((_, index) => (
                <div
                    key={index}
                    className={clsx(
                        'w-12 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold font-mono',
                        index < value.length
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-300 bg-gray-50 text-gray-400'
                    )}
                >
                    {index < value.length ? value[index] : placeholder}
                </div>
            ))}
        </div>
    );
};

// 숫자야구 유틸리티 함수들
export const validateNumberInput = (
    input: string,
    settings: GameSettings
): { isValid: boolean; error?: string } => {

    // 길이 검사
    if (input.length !== settings.digits) {
        return {
            isValid: false,
            error: `${settings.digits}자리 숫자를 입력해주세요.`
        };
    }

    // 숫자만 포함하는지 검사
    if (!/^\d+$/.test(input)) {
        return {
            isValid: false,
            error: '숫자만 입력해주세요.'
        };
    }

    // 0 포함 여부 검사
    if (!settings.allowZero && input.includes('0')) {
        return {
            isValid: false,
            error: '0은 사용할 수 없습니다.'
        };
    }

    // 첫 자리가 0인지 검사 (0 허용이어도 첫 자리는 0이면 안됨)
    if (input[0] === '0') {
        return {
            isValid: false,
            error: '첫 번째 자리는 0이 될 수 없습니다.'
        };
    }

    // 중복 허용 여부 검사
    if (!settings.allowDuplicate) {
        const uniqueChars = new Set(input);
        if (uniqueChars.size !== input.length) {
            return {
                isValid: false,
                error: '중복된 숫자는 사용할 수 없습니다.'
            };
        }
    }

    return { isValid: true };
};