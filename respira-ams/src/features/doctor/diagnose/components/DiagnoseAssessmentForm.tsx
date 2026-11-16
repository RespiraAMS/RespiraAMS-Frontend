'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Download, Plus, Trash2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { PatientDetail } from '@/features/doctor/patients/types';
import {
    ALLERGY_TYPE_OPTIONS,
    type AllergyType,
    AWARE_LABELS,
    CATEGORY_LABELS,
    CATEGORY_ORDER,
    type ClinicalVariableDto,
    type DiagnoseFormResponse,
    type DiagnosisResultDto,
    INFECTION_TYPES,
    MIC_CATEGORIES,
    type MicCategory,
    SAMPLE_TYPES,
    type SubmitDiagnosisRequest,
    type VariableCategory,
} from '../types';
import {
    calculateAge,
    extractPreviousObservations,
    getNormalPlaceholder,
    plainNumber,
    validateVariableValue,
} from '../validation';

interface SampleRow {
    rowId: string;
    sampleType: number;
    micCategory: MicCategory;
    pathogenId: string;
}

interface DiagnoseAssessmentFormProps {
    metadata: DiagnoseFormResponse;
    patient: PatientDetail | null;
    previousDiagnosis?: DiagnosisResultDto | null;
    isSubmitting: boolean;
    onSubmit: (payload: SubmitDiagnosisRequest) => Promise<void>;
}

const STEPS = [
    { step: 1, title: 'Đánh giá lâm sàng' },
    { step: 2, title: 'Dị ứng kháng sinh' },
    { step: 3, title: 'Tiền sử đặc biệt' },
    { step: 4, title: 'Nhiễm khuẩn khác' },
    { step: 5, title: 'Mẫu vi sinh' },
];

export function DiagnoseAssessmentForm({
    metadata,
    patient,
    previousDiagnosis = null,
    isSubmitting,
    onSubmit,
}: DiagnoseAssessmentFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [variableSearch, setVariableSearch] = useState('');
    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

    const [allergyType, setAllergyType] = useState<AllergyType>('No');
    const [selectedAllergyIds, setSelectedAllergyIds] = useState<Set<string>>(new Set());
    const [otherAllergy, setOtherAllergy] = useState('');
    const [antibioticSearch, setAntibioticSearch] = useState('');
    const [allergyError, setAllergyError] = useState<string | null>(null);

    const [historyInput, setHistoryInput] = useState('');
    const [specialHistory, setSpecialHistory] = useState<string[]>([]);

    const [otherInfections, setOtherInfections] = useState<Set<string>>(new Set());

    const [samples, setSamples] = useState<SampleRow[]>([]);
    const [sampleError, setSampleError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const previousObsValues = extractPreviousObservations(
            previousDiagnosis,
            metadata.clinicalVariables,
        );

        setValues((prev) => {
            const next: Record<string, string | boolean> = { ...previousObsValues, ...prev };
            const age = calculateAge(patient?.dateOfBirth);

            for (const v of metadata.clinicalVariables) {
                if (next[v.id] === undefined && v.valueType === 'Boolean' && v.isRequired) {
                    next[v.id] = false;
                }
                if (patient) {
                    if (v.code === 'AGE' && age !== undefined) {
                        next[v.id] = String(age);
                    }
                    if (v.code === 'GENDER' && patient.gender) {
                        const matched = v.acceptedValues?.find(
                            (opt) => opt.toLowerCase() === patient.gender.toLowerCase(),
                        );
                        next[v.id] = matched || patient.gender;
                    }
                    if (v.code === 'WEIGHT' && patient.weight !== undefined) {
                        next[v.id] = String(patient.weight);
                    }
                    if (v.code === 'HEIGHT' && patient.height !== undefined) {
                        next[v.id] = String(patient.height);
                    }
                }
            }
            return next;
        });

        if (previousDiagnosis?.allergy) {
            setAllergyType(previousDiagnosis.allergy.type || 'No');
            setSelectedAllergyIds(
                new Set((previousDiagnosis.allergy.allergicAntibiotics || []).map((a) => a.id)),
            );
            setOtherAllergy(previousDiagnosis.allergy.otherAllergy || '');
        }

        if (Array.isArray(previousDiagnosis?.otherInfections)) {
            setOtherInfections(new Set(previousDiagnosis.otherInfections));
        }
    }, [metadata.clinicalVariables, patient, previousDiagnosis]);

    useEffect(() => {
        if (!pendingScrollId) return;

        const timer = window.setTimeout(() => {
            const el = document.getElementById(pendingScrollId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const focusable = el.querySelector<HTMLElement>(
                    "input:not([type='hidden']), select, textarea, button",
                );
                focusable?.focus({ preventScroll: true });
            }
            setPendingScrollId(null);
        }, 60);

        return () => window.clearTimeout(timer);
    }, [pendingScrollId, currentStep, variableSearch]);

    const orderedVariables = useMemo(() => {
        const groups = new Map<VariableCategory, ClinicalVariableDto[]>();
        for (const cat of CATEGORY_ORDER) groups.set(cat, []);
        for (const v of metadata.clinicalVariables) {
            const cat = CATEGORY_ORDER.includes(v.category) ? v.category : 'Other';
            if (!groups.has(cat)) groups.set(cat, []);
            groups.get(cat)!.push(v);
        }
        return Array.from(groups.values()).flat();
    }, [metadata.clinicalVariables]);

    const groupedVariables = useMemo(() => {
        const query = variableSearch.trim().toLowerCase();
        const filtered = metadata.clinicalVariables.filter((v) => {
            if (!query) return true;
            return (
                v.name.toLowerCase().includes(query) ||
                v.code.toLowerCase().includes(query) ||
                (v.description || '').toLowerCase().includes(query)
            );
        });

        const groups = new Map<VariableCategory, ClinicalVariableDto[]>();
        for (const cat of CATEGORY_ORDER) groups.set(cat, []);

        for (const v of filtered) {
            const cat = CATEGORY_ORDER.includes(v.category) ? v.category : 'Other';
            if (!groups.has(cat)) groups.set(cat, []);
            groups.get(cat)!.push(v);
        }

        return Array.from(groups.entries()).filter(([, list]) => list.length > 0);
    }, [metadata.clinicalVariables, variableSearch]);

    const antibioticGroups = useMemo(() => {
        const map = new Map<string, string[]>();
        for (const ab of metadata.antibiotics) {
            const groupName = ab.antibioticGroupName || 'Khác';
            if (!map.has(groupName)) map.set(groupName, []);
            map.get(groupName)!.push(ab.id);
        }
        return Array.from(map.entries());
    }, [metadata.antibiotics]);

    const filteredAntibiotics = useMemo(() => {
        const q = antibioticSearch.trim().toLowerCase();
        if (!q) return metadata.antibiotics;
        return metadata.antibiotics.filter(
            (ab) =>
                ab.name.toLowerCase().includes(q) ||
                ab.antibioticGroupName.toLowerCase().includes(q) ||
                ab.classification.toLowerCase().includes(q),
        );
    }, [metadata.antibiotics, antibioticSearch]);

    const validateStep1 = (shouldScroll = true): boolean => {
        const errors: Record<string, string> = {};
        for (const v of orderedVariables) {
            const { error } = validateVariableValue(v, values[v.id]);
            if (error) errors[v.id] = error;
        }
        setFieldErrors(errors);

        const firstInvalidVar = orderedVariables.find((v) => Boolean(errors[v.id]));
        if (firstInvalidVar) {
            if (shouldScroll) {
                if (variableSearch.trim()) {
                    setVariableSearch('');
                }
                setCurrentStep(1);
                setPendingScrollId(`clinical-var-${firstInvalidVar.id}`);
            }
            return false;
        }
        return true;
    };

    const validateStep2 = (shouldScroll = true): boolean => {
        if (allergyType === 'Yes' && selectedAllergyIds.size === 0) {
            setAllergyError('Vui lòng chọn ít nhất một kháng sinh bệnh nhân bị dị ứng.');
            if (shouldScroll) {
                setCurrentStep(2);
                setPendingScrollId('step-2-allergy-section');
            }
            return false;
        }
        if (
            (allergyType === 'NonRegisteredAntibiotic' || allergyType === 'Unknown') &&
            !otherAllergy.trim()
        ) {
            setAllergyError('Vui lòng mô tả thông tin dị ứng của bệnh nhân.');
            if (shouldScroll) {
                setCurrentStep(2);
                setPendingScrollId('step-2-other-allergy-input');
            }
            return false;
        }
        setAllergyError(null);
        return true;
    };

    const validateStep5 = (shouldScroll = true): boolean => {
        for (let i = 0; i < samples.length; i++) {
            if (!samples[i].pathogenId) {
                setSampleError(`Mẫu bệnh phẩm #${i + 1}: Vui lòng chọn tác nhân gây bệnh.`);
                if (shouldScroll) {
                    setCurrentStep(5);
                    setPendingScrollId(`sample-row-${samples[i].rowId}`);
                }
                return false;
            }
        }
        setSampleError(null);
        return true;
    };

    const handleGoStep = (targetStep: number) => {
        if (targetStep > currentStep) {
            if (currentStep === 1 && !validateStep1(true)) return;
            if (currentStep === 2 && !validateStep2(true)) return;
        }
        setCurrentStep(targetStep);
    };

    const buildPayload = (): SubmitDiagnosisRequest => {
        const observations = metadata.clinicalVariables
            .map((v) => {
                const raw = values[v.id];
                if (raw === undefined || raw === null || String(raw).trim() === '') return null;
                const formatted =
                    v.valueType === 'Numeric' ? plainNumber(String(raw)) : String(raw);
                return { variableId: v.id, value: formatted };
            })
            .filter((item): item is { variableId: string; value: string } => item !== null);

        return {
            observations,
            allergy: {
                type: allergyType,
                allergicAntibioticIds: allergyType === 'Yes' ? Array.from(selectedAllergyIds) : [],
                otherAllergy:
                    allergyType === 'NonRegisteredAntibiotic' || allergyType === 'Unknown'
                        ? otherAllergy.trim()
                        : null,
            },
            specialMedicalHistory: specialHistory,
            otherInfections: Array.from(otherInfections),
            microbialSamples: samples.map((s) => ({
                sampleType: s.sampleType,
                micCategory: s.micCategory,
                pathogenId: s.pathogenId,
            })),
        };
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1(true)) return;
        if (!validateStep2(true)) return;
        if (!validateStep5(true)) return;
        await onSubmit(buildPayload());
    };

    const handleExportJson = () => {
        const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respira-diagnosis-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const parsed: Partial<SubmitDiagnosisRequest> = JSON.parse(await file.text());
            if (Array.isArray(parsed.observations)) {
                const nextValues: Record<string, string | boolean> = { ...values };
                for (const obs of parsed.observations) {
                    const meta = metadata.clinicalVariables.find((v) => v.id === obs.variableId);
                    if (!meta) continue;
                    nextValues[obs.variableId] =
                        meta.valueType === 'Boolean'
                            ? String(obs.value).toLowerCase() === 'true'
                            : String(obs.value);
                }
                setValues(nextValues);
            }
            if (parsed.allergy) {
                setAllergyType(parsed.allergy.type || 'No');
                setSelectedAllergyIds(new Set(parsed.allergy.allergicAntibioticIds || []));
                setOtherAllergy(parsed.allergy.otherAllergy || '');
            }
            if (Array.isArray(parsed.specialMedicalHistory)) {
                setSpecialHistory(parsed.specialMedicalHistory);
            }
            if (Array.isArray(parsed.otherInfections)) {
                setOtherInfections(new Set(parsed.otherInfections));
            }
            if (Array.isArray(parsed.microbialSamples)) {
                setSamples(
                    parsed.microbialSamples.map((s, idx) => ({
                        rowId: `import-${Date.now()}-${idx}`,
                        sampleType: Number(s.sampleType ?? 0),
                        micCategory: s.micCategory || 'Susceptible',
                        pathogenId: s.pathogenId || '',
                    })),
                );
            }
        } catch {
            alert('File JSON không đúng định dạng payload chẩn đoán.');
        } finally {
            e.target.value = '';
        }
    };

    const toggleAllergyId = (id: string) => {
        setSelectedAllergyIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setAllergyError(null);
    };

    const toggleAllergyGroup = (ids: string[]) => {
        setSelectedAllergyIds((prev) => {
            const next = new Set(prev);
            const allSelected = ids.every((id) => next.has(id));
            if (allSelected) ids.forEach((id) => next.delete(id));
            else ids.forEach((id) => next.add(id));
            return next;
        });
        setAllergyError(null);
    };

    const addHistoryEntry = () => {
        const trimmed = historyInput.trim();
        if (!trimmed) return;
        if (!specialHistory.includes(trimmed)) {
            setSpecialHistory((prev) => [...prev, trimmed]);
        }
        setHistoryInput('');
    };

    return (
        <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
            {/* <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Import JSON
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportJson}
                    className="gap-1.5"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportJson}
                    className="hidden"
                />
            </div> */}

            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {STEPS.map(({ step, title }) => {
                    const isActive = currentStep === step;
                    const isCompleted = currentStep > step;
                    return (
                        <button
                            key={step}
                            type="button"
                            onClick={() => handleGoStep(step)}
                            className={cn(
                                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition',
                                isActive
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                    : isCompleted
                                      ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : isCompleted
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {isCompleted ? <Check className="h-3 w-3" /> : step}
                            </span>
                            <span className="truncate">{title}</span>
                        </button>
                    );
                })}
            </nav>

            {currentStep === 1 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">
                    <div className="border-b border-border pb-3 space-y-2">
                        <h3 className="text-base font-bold text-foreground">
                            1. Đánh giá chỉ số lâm sàng
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Các trường có dấu <span className="font-bold text-destructive">*</span>{' '}
                            là bắt buộc. Giá trị ngoài ngưỡng bình thường sẽ hiển thị cảnh báo vàng;
                            ngoài ngưỡng cho phép sẽ bị từ chối.
                        </p>
                        <Input
                            type="search"
                            value={variableSearch}
                            onChange={(e) => setVariableSearch(e.target.value)}
                            placeholder="Tìm theo tên biến, mã code (VD: CURB, RR, SPO2, AGE)..."
                        />
                    </div>

                    <div className="space-y-6">
                        {groupedVariables.map(([category, vars]) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-dashed border-border pb-1.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                        {CATEGORY_LABELS[category]}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="border-primary bg-primary/10 text-primary shadow-sm"
                                    >
                                        {vars.length}
                                    </Badge>
                                </div>

                                <div className="space-y-2.5">
                                    {vars.map((v) => {
                                        const val = values[v.id];
                                        const { warning } = validateVariableValue(v, val);
                                        const error = fieldErrors[v.id];

                                        return (
                                            <div
                                                key={v.id}
                                                id={`clinical-var-${v.id}`}
                                                className={cn(
                                                    'rounded-lg border p-3.5 transition',
                                                    error
                                                        ? 'border-destructive bg-destructive/5 ring-1 ring-destructive/30'
                                                        : warning
                                                          ? 'border-amber-300 bg-amber-50/60'
                                                          : 'border-border bg-muted/20 focus-within:border-primary/60',
                                                )}
                                            >
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px] md:items-center">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <Label className="text-sm font-semibold">
                                                                {v.name}
                                                                {v.isRequired && (
                                                                    <span className="ml-0.5 text-destructive">
                                                                        *
                                                                    </span>
                                                                )}
                                                            </Label>
                                                            <Badge
                                                                variant="outline"
                                                                className="font-mono text-[10px]"
                                                            >
                                                                {v.code}
                                                            </Badge>
                                                        </div>
                                                        {v.description && (
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {v.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        {v.valueType === 'Numeric' && (
                                                            <div
                                                                className={cn(
                                                                    'group flex h-10 items-center overflow-hidden rounded-md border bg-surface transition-all',
                                                                    error
                                                                        ? 'border-destructive focus-within:ring-2 focus-within:ring-destructive/20'
                                                                        : 'border-input hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
                                                                )}
                                                            >
                                                                <input
                                                                    type="number"
                                                                    step="any"
                                                                    value={
                                                                        typeof val === 'string'
                                                                            ? val
                                                                            : ''
                                                                    }
                                                                    placeholder={getNormalPlaceholder(
                                                                        v,
                                                                    )}
                                                                    onChange={(e) => {
                                                                        const nextVal =
                                                                            e.target.value;
                                                                        setValues((prev) => ({
                                                                            ...prev,
                                                                            [v.id]: nextVal,
                                                                        }));
                                                                        const check =
                                                                            validateVariableValue(
                                                                                v,
                                                                                nextVal,
                                                                            );
                                                                        setFieldErrors((prev) => {
                                                                            const copy = {
                                                                                ...prev,
                                                                            };
                                                                            if (check.error)
                                                                                copy[v.id] =
                                                                                    check.error;
                                                                            else delete copy[v.id];
                                                                            return copy;
                                                                        });
                                                                    }}
                                                                    className="h-full w-full min-w-0 bg-transparent px-3 text-sm font-medium text-text-primary placeholder:text-text-tertiary focus:outline-none"
                                                                />
                                                                {v.canonicalUnit && (
                                                                    <span
                                                                        className={cn(
                                                                            'flex h-full shrink-0 items-center border-l px-3 text-xs font-semibold transition-colors select-none',
                                                                            error
                                                                                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                                                                : 'border-input bg-surface-secondary text-text-secondary group-focus-within:border-primary/30 group-focus-within:bg-primary/10 group-focus-within:text-primary',
                                                                        )}
                                                                    >
                                                                        {v.canonicalUnit}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {v.valueType === 'Boolean' && (
                                                            <div className="grid h-10 grid-cols-2 gap-1 rounded-md border border-border bg-surface-secondary p-1">
                                                                {[
                                                                    { label: 'Có', boolVal: true },
                                                                    {
                                                                        label: 'Không',
                                                                        boolVal: false,
                                                                    },
                                                                ].map((opt) => {
                                                                    const active =
                                                                        val === opt.boolVal;
                                                                    return (
                                                                        <button
                                                                            key={String(
                                                                                opt.boolVal,
                                                                            )}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setValues(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [v.id]:
                                                                                            opt.boolVal,
                                                                                    }),
                                                                                );
                                                                                setFieldErrors(
                                                                                    (prev) => {
                                                                                        const copy =
                                                                                            {
                                                                                                ...prev,
                                                                                            };
                                                                                        delete copy[
                                                                                            v.id
                                                                                        ];
                                                                                        return copy;
                                                                                    },
                                                                                );
                                                                            }}
                                                                            className={cn(
                                                                                'flex h-full cursor-pointer items-center justify-center rounded-sm text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                                                                active
                                                                                    ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                                                                                    : 'font-medium text-text-secondary hover:bg-surface-tertiary/70 hover:text-text-primary',
                                                                            )}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {v.valueType === 'Categorical' && (
                                                            <div
                                                                className={cn(
                                                                    'flex h-10 gap-1 rounded-md border bg-surface-secondary p-1',
                                                                    error
                                                                        ? 'border-destructive'
                                                                        : 'border-border',
                                                                )}
                                                            >
                                                                {(v.acceptedValues || []).map(
                                                                    (option) => {
                                                                        const active =
                                                                            val === option;
                                                                        const displayLabel =
                                                                            option.toUpperCase() ===
                                                                            'MALE'
                                                                                ? 'Nam'
                                                                                : option.toUpperCase() ===
                                                                                    'FEMALE'
                                                                                  ? 'Nữ'
                                                                                  : option;
                                                                        return (
                                                                            <button
                                                                                key={option}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setValues(
                                                                                        (prev) => ({
                                                                                            ...prev,
                                                                                            [v.id]:
                                                                                                option,
                                                                                        }),
                                                                                    );
                                                                                    setFieldErrors(
                                                                                        (prev) => {
                                                                                            const copy =
                                                                                                {
                                                                                                    ...prev,
                                                                                                };
                                                                                            delete copy[
                                                                                                v.id
                                                                                            ];
                                                                                            return copy;
                                                                                        },
                                                                                    );
                                                                                }}
                                                                                className={cn(
                                                                                    'flex h-full flex-1 cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                                                                                    active
                                                                                        ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                                                                                        : 'font-medium text-text-secondary hover:bg-surface-tertiary/70 hover:text-text-primary',
                                                                                )}
                                                                            >
                                                                                {displayLabel}
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {error && (
                                                    <p className="mt-2 text-xs font-semibold text-destructive">
                                                        {error}
                                                    </p>
                                                )}
                                                {!error && warning && (
                                                    <p className="mt-2 text-xs font-medium text-amber-700">
                                                        ⚠ {warning}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border">
                        <Button
                            type="button"
                            onClick={() => handleGoStep(2)}
                            className="bg-primary"
                        >
                            Tiếp theo: Dị ứng kháng sinh →
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div
                    id="step-2-allergy-section"
                    className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
                >
                    <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground">
                            2. Tiền sử dị ứng kháng sinh
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Ghi nhận trạng thái dị ứng kháng sinh của bệnh nhân để loại trừ phác đồ
                            không an toàn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                        {ALLERGY_TYPE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    setAllergyType(opt.value);
                                    setAllergyError(null);
                                }}
                                className={cn(
                                    'rounded-lg border px-3 py-2.5 text-xs font-semibold transition',
                                    allergyType === opt.value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-muted/40 text-foreground hover:bg-muted',
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {(allergyType === 'NonRegisteredAntibiotic' || allergyType === 'Unknown') && (
                        <div id="step-2-other-allergy-input" className="space-y-1.5">
                            <Label>
                                Mô tả chi tiết dị ứng <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={otherAllergy}
                                onChange={(e) => {
                                    setOtherAllergy(e.target.value);
                                    setAllergyError(null);
                                }}
                                placeholder="VD: Nổi mề đay khi dùng thuốc nhóm Beta-lactam..."
                            />
                        </div>
                    )}

                    {allergyType === 'Yes' && (
                        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <Input
                                    type="search"
                                    value={antibioticSearch}
                                    onChange={(e) => setAntibioticSearch(e.target.value)}
                                    placeholder="Tìm kháng sinh hoặc nhóm kháng sinh..."
                                    className="sm:max-w-xs bg-background"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setSelectedAllergyIds((prev) => {
                                                const next = new Set(prev);
                                                filteredAntibiotics.forEach((a) => next.add(a.id));
                                                return next;
                                            })
                                        }
                                    >
                                        Chọn tất cả hiển thị
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedAllergyIds(new Set())}
                                    >
                                        Xóa tất cả
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Chọn nhanh theo nhóm kháng sinh
                                </span>
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {antibioticGroups.map(([groupName, ids]) => {
                                        const selectedCount = ids.filter((id) =>
                                            selectedAllergyIds.has(id),
                                        ).length;
                                        const isAll = selectedCount === ids.length;
                                        const isPartial = selectedCount > 0 && !isAll;
                                        return (
                                            <button
                                                key={groupName}
                                                type="button"
                                                onClick={() => toggleAllergyGroup(ids)}
                                                className={cn(
                                                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                                                    isAll
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : isPartial
                                                          ? 'border-primary/50 bg-primary/10 text-primary'
                                                          : 'border-border bg-background text-foreground hover:border-primary/50',
                                                )}
                                            >
                                                {groupName} ({selectedCount}/{ids.length})
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredAntibiotics.map((ab) => {
                                    const checked = selectedAllergyIds.has(ab.id);
                                    return (
                                        <label
                                            key={ab.id}
                                            className={cn(
                                                'relative flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs transition',
                                                checked
                                                    ? 'border-primary bg-primary/10'
                                                    : 'border-border bg-background hover:border-primary/40',
                                            )}
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={() => toggleAllergyId(ab.id)}
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold text-foreground">
                                                    {ab.name}
                                                </div>
                                                <div className="truncate text-[11px] text-muted-foreground">
                                                    {ab.antibioticGroupName} •{' '}
                                                    {AWARE_LABELS[ab.classification]}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="pt-2 border-t border-border">
                                <div className="text-xs font-semibold text-muted-foreground mb-1.5">
                                    Đã chọn ({selectedAllergyIds.size})
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(selectedAllergyIds).map((id) => {
                                        const ab = metadata.antibiotics.find((x) => x.id === id);
                                        if (!ab) return null;
                                        return (
                                            <Badge
                                                key={id}
                                                variant="secondary"
                                                className="gap-1.5 pr-1.5"
                                            >
                                                {ab.name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAllergyId(id)}
                                                    className="hover:text-destructive"
                                                >
                                                    ×
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {allergyError && (
                        <p className="text-xs font-semibold text-destructive">{allergyError}</p>
                    )}

                    <div className="flex justify-between pt-2 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                            ← Quay lại
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleGoStep(3)}
                            className="bg-primary"
                        >
                            Tiếp theo: Tiền sử đặc biệt →
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                    <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground">
                            3. Tiền sử bệnh lý đặc biệt
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Nhập các ghi chú tiền sử bổ sung ngoài danh mục biến lâm sàng (không bắt
                            buộc).
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={historyInput}
                            onChange={(e) => setHistoryInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addHistoryEntry();
                                }
                            }}
                            placeholder="VD: Tiền sử lao phổi cũ, hóa trị gần đây..."
                        />
                        <Button type="button" variant="secondary" onClick={addHistoryEntry}>
                            Thêm
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {specialHistory.length === 0 ? (
                            <span className="text-xs italic text-muted-foreground">
                                Chưa có ghi nhận tiền sử đặc biệt nào.
                            </span>
                        ) : (
                            specialHistory.map((item) => (
                                <Badge key={item} variant="secondary" className="gap-1.5 pr-1.5">
                                    {item}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSpecialHistory((prev) =>
                                                prev.filter((x) => x !== item),
                                            )
                                        }
                                        className="font-bold hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between pt-2 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                            ← Quay lại
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleGoStep(4)}
                            className="bg-primary"
                        >
                            Tiếp theo: Nhiễm khuẩn khác →
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                    <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground">
                            4. Nhiễm khuẩn hoạt động khác đi kèm
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Chọn các ổ nhiễm khuẩn phối hợp ngoài viêm phổi (có thể chọn nhiều hoặc
                            bỏ qua).
                        </p>
                    </div>

                    <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto pr-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {INFECTION_TYPES.map((inf) => {
                            const checked = otherInfections.has(inf.name);
                            return (
                                <label
                                    key={inf.name}
                                    className={cn(
                                        'relative flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition',
                                        checked
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border bg-muted/20 hover:border-primary/40',
                                    )}
                                >
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() => {
                                            setOtherInfections((prev) => {
                                                const next = new Set(prev);
                                                if (next.has(inf.name)) next.delete(inf.name);
                                                else next.add(inf.name);
                                                return next;
                                            });
                                        }}
                                    />
                                    <span>{inf.label}</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex justify-between pt-2 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                            ← Quay lại
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleGoStep(5)}
                            className="bg-primary"
                        >
                            Tiếp theo: Mẫu vi sinh →
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 5 && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                    <div className="border-b border-border pb-3">
                        <h3 className="text-base font-bold text-foreground">
                            5. Kết quả mẫu bệnh phẩm vi sinh
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Thêm kết quả phân lập vi sinh và kháng sinh đồ nếu có. Bỏ trống nếu chưa
                            có kết quả xét nghiệm.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {samples.map((row, idx) => (
                            <div
                                key={row.rowId}
                                id={`sample-row-${row.rowId}`}
                                className={cn(
                                    'rounded-lg border p-3.5 space-y-3',
                                    !row.pathogenId && sampleError
                                        ? 'border-destructive bg-destructive/5'
                                        : 'border-border bg-muted/20',
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-primary">
                                        Mẫu bệnh phẩm #{idx + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setSamples((prev) =>
                                                prev.filter((r) => r.rowId !== row.rowId),
                                            )
                                        }
                                        className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Xóa
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Loại bệnh phẩm</Label>
                                        <select
                                            value={row.sampleType}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setSamples((prev) =>
                                                    prev.map((r) =>
                                                        r.rowId === row.rowId
                                                            ? { ...r, sampleType: val }
                                                            : r,
                                                    ),
                                                );
                                            }}
                                            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                                        >
                                            {SAMPLE_TYPES.map((st) => (
                                                <option key={st.value} value={st.value}>
                                                    {st.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">Mức độ nhạy cảm (MIC)</Label>
                                        <select
                                            value={row.micCategory}
                                            onChange={(e) => {
                                                const val = e.target.value as MicCategory;
                                                setSamples((prev) =>
                                                    prev.map((r) =>
                                                        r.rowId === row.rowId
                                                            ? { ...r, micCategory: val }
                                                            : r,
                                                    ),
                                                );
                                            }}
                                            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                                        >
                                            {MIC_CATEGORIES.map((mc) => (
                                                <option key={mc.value} value={mc.value}>
                                                    {mc.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Tác nhân gây bệnh{' '}
                                            <span className="text-destructive">*</span>
                                        </Label>
                                        <select
                                            value={row.pathogenId}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSamples((prev) =>
                                                    prev.map((r) =>
                                                        r.rowId === row.rowId
                                                            ? { ...r, pathogenId: val }
                                                            : r,
                                                    ),
                                                );
                                                setSampleError(null);
                                            }}
                                            className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs font-medium"
                                        >
                                            <option value="">-- Chọn tác nhân --</option>
                                            {metadata.pathogens.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sampleError && (
                        <p className="text-xs font-semibold text-destructive">{sampleError}</p>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setSamples((prev) => [
                                ...prev,
                                {
                                    rowId: `sample-${Date.now()}-${prev.length}`,
                                    sampleType: 0,
                                    micCategory: 'Susceptible',
                                    pathogenId: '',
                                },
                            ])
                        }
                        className="gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm mẫu bệnh phẩm
                    </Button>

                    <div className="flex justify-between border-t border-border pt-4">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(4)}>
                            ← Quay lại
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2 bg-primary">
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isSubmitting
                                ? 'Đang phân tích chẩn đoán...'
                                : 'Chẩn đoán & Gợi ý phác đồ'}
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
