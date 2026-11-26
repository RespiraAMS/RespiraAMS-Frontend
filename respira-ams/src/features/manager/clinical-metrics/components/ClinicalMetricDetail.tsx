'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Info, Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
	useClinicalMetricDetail,
	useClinicalMetricMutations,
	useMetricRuleDetail,
	useMetricRuleMutations,
} from '../queries';
import { MetricRuleForm } from './MetricRuleForm';
import {
	type CreateMetricRuleRequest,
	type UpdateMetricRuleRequest,
	type MetricRule,
	type CreateClinicalMetricRequest,
	type UpdateClinicalMetricRequest,
} from '../types';
import { ClinicalMetricForm } from './ClinicalMetricForm';

interface ClinicalMetricDetailProps {
	id: string;
	readOnly?: boolean;
}

export function ClinicalMetricDetail({ id, readOnly = false }: ClinicalMetricDetailProps) {
	const router = useRouter();
	const tDetail = useTranslations('manager.clinicalMetrics.detail');
	const tCommon = useTranslations('common');
	const t = useTranslations('manager.clinicalMetrics');

	const { data: metric, isLoading: isLoadingMetric } = useClinicalMetricDetail(id);
	const { createMutation, updateMutation, deleteMutation } = useMetricRuleMutations(id);

	const { updateMutation: metricUpdateMutation, deleteMutation: metricDeleteMutation } =
		useClinicalMetricMutations();

	const [modalMode, setModalMode] = useState<'create' | 'update' | null>(null);
	const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
	const [ruleToDelete, setRuleToDelete] = useState<MetricRule | null>(null);

	const [isMetricUpdateOpen, setIsMetricUpdateOpen] = useState(false);
	const [isMetricDeleteOpen, setIsMetricDeleteOpen] = useState(false);

	const { data: ruleDetail, isFetching: isFetchingRule } = useMetricRuleDetail(
		selectedRuleId as string,
		{
			enabled: !readOnly && modalMode === 'update' && !!selectedRuleId,
		},
	);

	if (isLoadingMetric) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!metric) {
		return (
			<div className="py-12 text-center font-medium text-destructive">
				{tDetail('notFound')}
			</div>
		);
	}

	const handleMetricUpdateSubmit = (
		data: UpdateClinicalMetricRequest | CreateClinicalMetricRequest,
	) => {
		metricUpdateMutation.mutate(
			{ id, data: data as UpdateClinicalMetricRequest },
			{
				onSuccess: () => {
					setIsMetricUpdateOpen(false);
					toast.success(t('toast.updateSuccess'));
				},
				onError: (error) => toast.error(t('toast.updateError', { error: error.message })),
			},
		);
	};

	const handleMetricDelete = () => {
		metricDeleteMutation.mutate(id, {
			onSuccess: () => {
				toast.success(t('toast.deleteSuccess', { name: metric.name }));
				router.push('/manage/clinical-metrics');
			},
			onError: (error) => toast.error(t('toast.deleteError', { error: error.message })),
		});
	};

	const openCreate = () => {
		setSelectedRuleId(null);
		setModalMode('create');
	};

	const openUpdate = (rule: MetricRule) => {
		setSelectedRuleId(rule.id);
		setModalMode('update');
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedRuleId(null);
	};

	const handleFormSubmit = (data: CreateMetricRuleRequest | UpdateMetricRuleRequest) => {
		if (modalMode === 'create') {
			createMutation.mutate(data as CreateMetricRuleRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(tDetail('toastCreateSuccess'));
				},
				onError: (err) => toast.error(tDetail('toastCreateError', { error: err.message })),
			});
		} else if (modalMode === 'update' && selectedRuleId) {
			updateMutation.mutate(
				{ ruleId: selectedRuleId, data: data as UpdateMetricRuleRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(tDetail('toastUpdateSuccess'));
					},
					onError: (err) =>
						toast.error(tDetail('toastUpdateError', { error: err.message })),
				},
			);
		}
	};

	const handleDelete = () => {
		if (ruleToDelete) {
			deleteMutation.mutate(ruleToDelete.id, {
				onSuccess: () => {
					setRuleToDelete(null);
					toast.success(tDetail('toastDeleteSuccess'));
				},
				onError: (err) => toast.error(tDetail('toastDeleteError', { error: err.message })),
			});
		}
	};

	const renderRuleTypeScore = (rule: MetricRule) => {
		if (rule.isMajorRule != null) {
			return rule.isMajorRule ? (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
					{tDetail('majorRule')}
				</span>
			) : (
				<span className="inline-flex shrink-0 items-center whitespace-nowrap rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
					{tDetail('minorRule')}
				</span>
			);
		}

		return (
			<span className="font-mono font-bold text-foreground">
				{rule.scoreFunction != null ? rule.scoreFunction : '-'}
			</span>
		);
	};

	return (
		<div className="mx-auto space-y-6 bg-background text-foreground">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="shrink-0 rounded-full text-foreground hover:bg-accent"
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="min-w-0">
						<h2 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
							<span className="break-words">{metric.name}</span>
							{metric.isApplied ? (
								<span className="shrink-0 whitespace-nowrap rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
									{tDetail('statusActive')}
								</span>
							) : (
								<span className="shrink-0 whitespace-nowrap rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
									{tDetail('statusInactive')}
								</span>
							)}
						</h2>
						<p className="mt-1 font-mono text-xs text-muted-foreground sm:text-sm">
							{metric.code} | {tDetail('versionLabel')}: {metric.version}
						</p>
					</div>
				</div>
				{!readOnly && (
					<div className="flex w-full items-center gap-2 sm:w-auto shrink-0">
						<Button
							variant="outline"
							className="flex-1 gap-2 border-border text-foreground hover:bg-accent sm:flex-initial"
							onClick={() => setIsMetricUpdateOpen(true)}
						>
							<Edit className="h-4 w-4" />
							{tCommon('update')}
						</Button>
						<Button
							variant="destructive"
							className="flex-1 gap-2 sm:flex-initial"
							onClick={() => setIsMetricDeleteOpen(true)}
						>
							<Trash className="h-4 w-4" />
							{tCommon('delete')}
						</Button>
					</div>
				)}
			</div>

			<div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm text-card-foreground shadow-sm sm:p-5">
				<div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
					<span className="shrink-0 font-semibold text-foreground sm:w-48">
						{tDetail('publisherLabel')}:
					</span>
					<span className="text-muted-foreground break-words">{metric.publisher}</span>
				</div>
				<div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
					<span className="shrink-0 font-semibold text-foreground sm:w-48">
						{tDetail('descriptionLabel')}:
					</span>
					<span className="text-muted-foreground break-words">{metric.description}</span>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
				<div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 className="text-base font-bold tracking-wide text-foreground sm:text-lg">
							{tDetail('rulesTitle')}
						</h3>
						<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
							<Info className="h-4 w-4 shrink-0 text-primary" />
							<span>{tDetail('totalRulesCount', { count: metric.rules.length })}</span>
						</div>
					</div>
					{!readOnly && (
						<Button
							onClick={openCreate}
							size="sm"
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
						>
							<Plus className="mr-2 h-4 w-4" /> {tDetail('addRuleButton')}
						</Button>
					)}
				</div>

				{metric.rules.length === 0 ? (
					<div className="rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
						{tDetail('emptyRules')}
					</div>
				) : (
					<>
						<div className="space-y-3 md:hidden">
							{metric.rules.map((rule) => (
								<div
									key={rule.id}
									className="space-y-2.5 rounded-lg border border-border bg-background/50 p-3.5"
								>
									<div className="flex items-start justify-between gap-2">
										<p className="min-w-0 font-semibold text-foreground break-words">
											{rule.criterion.name}
										</p>
										{renderRuleTypeScore(rule)}
									</div>

									<div className="rounded border border-border bg-muted/40 p-2.5 text-xs whitespace-normal break-words">
										{rule.criterion.formula}
									</div>

									{!readOnly && (
										<div className="flex justify-end gap-1.5 border-t border-border pt-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openUpdate(rule)}
												className="h-8 w-8 text-foreground hover:bg-accent"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setRuleToDelete(rule)}
												className="h-8 w-8 text-destructive hover:bg-destructive/10"
											>
												<Trash className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
							))}
						</div>

						<div className="hidden overflow-x-auto rounded-md border border-border md:block">
							<table className="w-full text-left text-sm">
								<thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
									<tr>
										<th className="min-w-44 px-4 py-3 font-semibold lg:w-1/6">
											{tDetail('colCriterionName')}
										</th>
										<th className="min-w-64 px-4 py-3 font-semibold lg:w-3/6">
											{tDetail('colFormula')}
										</th>
										<th className="min-w-32 whitespace-nowrap px-4 py-3 text-center font-semibold lg:w-1/6">
											{tDetail('colTypeScore')}
										</th>
										{!readOnly && (
											<th className="min-w-24 whitespace-nowrap px-4 py-3 text-right font-semibold">
												{tCommon('actions')}
											</th>
										)}
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{metric.rules.map((rule) => (
										<tr
											key={rule.id}
											className="border-border hover:bg-accent/50"
										>
											<td className="px-4 py-3 align-top font-medium text-foreground whitespace-normal break-words">
												{rule.criterion.name}
											</td>
											<td className="px-4 py-3 align-top">
												<div className="rounded border border-border bg-muted/40 p-2 whitespace-normal break-words">
													{rule.criterion.formula}
												</div>
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-center align-top font-mono font-bold">
												{renderRuleTypeScore(rule)}
											</td>
											{!readOnly && (
												<td className="whitespace-nowrap px-4 py-3 align-top">
													<div className="flex justify-end gap-1.5 lg:gap-1">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => openUpdate(rule)}
															className="h-8 w-8 text-foreground hover:bg-accent"
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setRuleToDelete(rule)}
															className="h-8 w-8 text-destructive hover:bg-destructive/10"
														>
															<Trash className="h-4 w-4" />
														</Button>
													</div>
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>

			{!readOnly && (
				<>
					<Dialog open={isMetricUpdateOpen} onOpenChange={setIsMetricUpdateOpen}>
						<DialogContent className="max-h-[90dvh] w-[95vw] overflow-y-auto border-border bg-popover text-popover-foreground sm:max-w-xl">
							<DialogHeader>
								<DialogTitle className="text-foreground">
									{t('dialog.updateTitle')}
								</DialogTitle>
							</DialogHeader>
							{isMetricUpdateOpen && (
								<ClinicalMetricForm
									initialData={metric}
									onSubmit={handleMetricUpdateSubmit}
									onCancel={() => setIsMetricUpdateOpen(false)}
									isPending={metricUpdateMutation.isPending}
								/>
							)}
						</DialogContent>
					</Dialog>

					<AlertDialog open={isMetricDeleteOpen} onOpenChange={setIsMetricDeleteOpen}>
						<AlertDialogContent className="w-[95vw] border-border bg-popover text-popover-foreground sm:max-w-lg">
							<AlertDialogHeader>
								<AlertDialogTitle className="font-semibold text-destructive">
									{t('dialog.deleteTitle')}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground">
									{t.rich('dialog.deleteDescription', {
										name: metric?.name || '',
										b: (chunks: ReactNode) => (
											<span className="font-bold text-foreground">{chunks}</span>
										),
									})}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="gap-2 sm:gap-0">
								<Button
									variant="outline"
									onClick={() => setIsMetricDeleteOpen(false)}
									className="border-border text-foreground hover:bg-accent"
								>
									{tCommon('cancel')}
								</Button>
								<Button
									variant="destructive"
									onClick={handleMetricDelete}
									disabled={metricDeleteMutation.isPending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{metricDeleteMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : null}{' '}
									{tCommon('delete')}
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
						<DialogContent className="max-h-[90dvh] w-[95vw] overflow-y-auto border-border bg-popover text-popover-foreground sm:max-w-xl">
							<DialogHeader>
								<DialogTitle className="text-foreground">
									{modalMode === 'create'
										? tDetail('dialogCreateTitle')
										: tDetail('dialogUpdateTitle')}
								</DialogTitle>
							</DialogHeader>
							{modalMode === 'update' && isFetchingRule ? (
								<div className="flex justify-center p-10">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : (
								modalMode && (
									<MetricRuleForm
										metricId={id}
										existingRules={metric.rules}
										initialData={modalMode === 'update' ? ruleDetail : null}
										onSubmit={handleFormSubmit}
										onCancel={closeModal}
										isPending={createMutation.isPending || updateMutation.isPending}
									/>
								)
							)}
						</DialogContent>
					</Dialog>

					<AlertDialog
						open={!!ruleToDelete}
						onOpenChange={(open) => !open && setRuleToDelete(null)}
					>
						<AlertDialogContent className="w-[95vw] border-border bg-popover text-popover-foreground sm:max-w-lg">
							<AlertDialogHeader>
								<AlertDialogTitle className="font-semibold text-destructive">
									{tDetail('dialogDeleteTitle')}
								</AlertDialogTitle>
								<AlertDialogDescription className="text-muted-foreground">
									{tDetail.rich('dialogDeleteDescription', {
										name: ruleToDelete?.criterion.name || '',
										b: (chunks) => (
											<span className="font-bold text-foreground">{chunks}</span>
										),
									})}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="gap-2 sm:gap-0">
								<Button
									variant="outline"
									onClick={() => setRuleToDelete(null)}
									className="border-border text-foreground hover:bg-accent"
								>
									{tCommon('cancel')}
								</Button>
								<Button
									variant="destructive"
									onClick={handleDelete}
									disabled={deleteMutation.isPending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{deleteMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : null}{' '}
									{tCommon('delete')}
								</Button>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			)}
		</div>
	);
}