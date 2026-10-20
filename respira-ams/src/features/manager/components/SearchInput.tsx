"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "../stores/searchStore";

export function SearchInput({ placeholder }: { placeholder?: string }) {
    const t = useTranslations("manager.search");
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const setSearchValue = useSearchStore((s) => s.setValue);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const sanitizedValue = rawValue.replace(/[^\p{L}\p{N}\s-]/gu, "");
        
        setValue(sanitizedValue);
        if (error) setError("");
    };

    const handleSearch = () => {
        const trimmed = value.trim();

        if (trimmed.length === 0) {
            setError("");
            setSearchValue("");
            return;
        }

        if (trimmed.length < 2) {
            setError(t("minLengthError"));
            return;
        }

        setError("");
        setSearchValue(trimmed);
    };

    const handleClear = () => {
        setValue("");
        setError("");
        setSearchValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const isTooShort = value.trim().length === 1;

    return (
        <div className="flex flex-col flex-1 max-w-md gap-1">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={value}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder ?? t("placeholder")}
                        className={`pl-9 pr-8 bg-background text-foreground placeholder:text-muted-foreground ${
                            error ? "border-destructive focus-visible:ring-destructive" : ""
                        }`}
                        id="manager-search-input"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={isTooShort}
                    id="manager-search-button"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    <Search className="h-4 w-4 mr-1" />
                    {t("button")}
                </Button>
            </div>
            {error && (
                <span className="text-xs text-destructive font-medium pl-1">
                    {error}
                </span>
            )}
        </div>
    );
}