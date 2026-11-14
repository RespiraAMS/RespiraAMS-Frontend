'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VALID_SEARCH_REGEX = /^[\p{L}\p{N}\s-]+$/u;
const MIN_SEARCH_LENGTH = 2;

interface TableSearchInputProps {
	onSearchChange: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
}

export function TableSearchInput({
	onSearchChange,
	placeholder,
	debounceMs = 400,
}: TableSearchInputProps) {
    const t = useTranslations('manager.search');

    const [inputValue, setInputValue] = useState('');
    const trimmedInput = inputValue.trim();
    const error =
        trimmedInput.length === 0
            ? null
            : !VALID_SEARCH_REGEX.test(inputValue)
              ? t('invalidChars')
              : trimmedInput.length < MIN_SEARCH_LENGTH
                ? t('minLength', { min: MIN_SEARCH_LENGTH })
                : null;

    useEffect(() => {
        const trimmed = trimmedInput;

        if (trimmed.length === 0) {
            onSearchChange('');
            return;
        }

        if (!VALID_SEARCH_REGEX.test(inputValue)) {
            return;
        }

        if (trimmed.length < MIN_SEARCH_LENGTH) {
            onSearchChange('');
            return;
        }

        const timer = setTimeout(() => {
            onSearchChange(trimmed);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [inputValue, trimmedInput, debounceMs, onSearchChange]);

    const handleClear = () => {
        setInputValue('');
        onSearchChange('');
    };

    return (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto text-card-foreground w-full max-w-sm">
            <div className="w-full max-w-sm space-y-1.5">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder || t("placeholder")}
                        className="pr-9 pl-9 border-border bg-background text-foreground"
                    />
                    {inputValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        </div>
    );
}
