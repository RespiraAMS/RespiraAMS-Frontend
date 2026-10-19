"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Edit, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useAntibioticDetail, useAntibioticMutations } from "../queries";
import { type AntibioticItem, type UpdateAntibioticRequest, type CreateAntibioticRequest } from "../types";
import { AntibioticForm } from "./AntibioticForm";
import { DeleteAntibioticSheet } from "./DeleteAntibioticSheet";

const MAX_DECIMAL = 79228162514264337593543950335;

function formatCrCl(
	crcl: { min: number; isMinExclusive: boolean; max: number; isMaxExclusive: boolean } | null,
	allLabel: string
) {
	if (!crcl) return null;
	const { min, max, isMinExclusive, isMaxExclusive } = crcl;
	const isMinInf = min <= -MAX_DECIMAL || min === 0;
	const isMaxInf = max >= MAX_DECIMAL;
	if (isMinInf && isMaxInf) return allLabel;
	if (isMaxInf) return `${isMinExclusive ? ">" : ">="} ${min}`;
	if (isMinInf) return `${isMaxExclusive ? "<" : "<="} ${max}`;
	return `${min} ${isMinExclusive ? "<" : "<="} CrCl ${isMaxExclusive ? "<" : "<="} ${max}`;
}

function formatRouteOfAdministration(
	route: string | undefined | null,
	t: (key: string) => string
): string {
	if (!route) return "";

	const normalized = route.toLowerCase().trim();

	switch (normalized) {
		case "oral":
			return t("form.routeOral");
		case "intravenous":
			return t("form.routeIntravenous");
		default:
			return route;
	}
}

interface AntibioticDetailProps {
	id: string;
}

export function AntibioticDetail({ id }: AntibioticDetailProps) {
	const t = useTranslations("manager.antibiotics");
	const tCommon = useTranslations("common");
	const router = useRouter();

	const { data: detailData, isLoading } = useAntibioticDetail(id);
	const { updateMutation, deleteMutation } = useAntibioticMutations();

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!detailData) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				{t("table.empty")}
			</div>
		);
	}

	const antibioticItem: AntibioticItem = {
		id: detailData.id,
		name: detailData.name,
		antibioticGroup: { id: detailData.antibioticGroup.id, name: detailData.antibioticGroup.name },
		classification: detailData.classification
	};

	const handleUpdate = (data: CreateAntibioticRequest | UpdateAntibioticRequest) => {
		updateMutation.mutate(
			{ id: detailData.id, data: data as UpdateAntibioticRequest },
			{
				onSuccess: () => setIsEditModalOpen(false)
			}
		);
	};

	const handleDelete = () => {
		deleteMutation.mutate(detailData.id, {
			onSuccess: () => {
				setIsDeleteOpen(false);
				router.back();
			}
		});
	};

	return (
		<div className="flex flex-col gap-6 text-foreground bg-background">
			{/* Header & Actions */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="hover:bg-accent text-foreground"
						aria-label={t("detail.back")}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{detailData.name}</h2>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="gap-2 border-border text-foreground hover:bg-accent"
						onClick={() => setIsEditModalOpen(true)}
					>
						<Edit className="h-4 w-4" />
						{tCommon("update")}
					</Button>
					<Button
						variant="destructive"
						className="gap-2"
						onClick={() => setIsDeleteOpen(true)}
					>
						<Trash className="h-4 w-4" />
						{tCommon("delete")}
					</Button>
				</div>
			</div>

			{/* Info Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Basic Info */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
					<h3 className="font-semibold text-lg mb-4 text-card-foreground">{t("detail.title")}</h3>
					<div className="space-y-3 text-sm">
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("form.categoryLabel")}:</span>
							<span className="col-span-2 font-medium text-foreground">{detailData.classification}</span>
						</div>
						<div className="grid grid-cols-3 gap-2">
							<span className="text-muted-foreground">{t("form.groupLabel")}:</span>
							<span className="col-span-2 font-medium text-foreground">{detailData.antibioticGroup.name}</span>
						</div>
						{detailData.antibioticGroup.parentName && (
							<div className="grid grid-cols-3 gap-2">
								<span className="text-muted-foreground">{t("detail.parentGroup")}:</span>
								<span className="col-span-2 font-medium text-foreground">{detailData.antibioticGroup.parentName}</span>
							</div>
						)}
					</div>
				</div>

				{/* Group Description */}
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
					<h3 className="font-semibold text-lg mb-4 text-card-foreground">{t("detail.groupInfo")}</h3>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{detailData.antibioticGroup.description || t("detail.noDescription")}
					</p>
				</div>
			</div>

			{/* Dosages Table */}
			<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden text-card-foreground">
				<div className="p-6 pb-0">
					<h3 className="font-semibold text-lg text-card-foreground">{t("detail.dosages")}</h3>
				</div>
				<div className="p-4">
					<Table className="border-border">
						<TableHeader>
							<TableRow className="border-border hover:bg-transparent">
								<TableHead className="text-muted-foreground font-semibold">{t("detail.route")}</TableHead>
								<TableHead className="text-muted-foreground font-semibold">{t("detail.crcl")}</TableHead>
								<TableHead className="text-muted-foreground font-semibold w-1/2">{t("detail.dose")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{detailData.dosages && detailData.dosages.length > 0 ? (
								detailData.dosages.map((dosage) => {
									const crclText = formatCrCl(dosage.crcl, t("detail.allCrcl"));
									return (
										<TableRow key={dosage.id} className="border-border hover:bg-accent/50">
											<TableCell className="font-medium align-middle">
												<span className="inline-flex items-center rounded-md bg-secondary border border-border px-2.5 py-1 text-xs font-medium text-secondary-foreground">
													{formatRouteOfAdministration(dosage.routeOfAdministration, t)}
												</span>
											</TableCell>
											<TableCell className="align-middle">
												{crclText ? (
													<span className="font-mono text-sm text-foreground">{crclText}</span>
												) : (
													<span className="text-muted-foreground text-sm italic">{t("detail.standardDose")}</span>
												)}
											</TableCell>
											<TableCell className="text-sm whitespace-pre-wrap align-middle text-foreground">
												{dosage.dose}
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow className="border-border">
									<TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
										{t("detail.noDosages")}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Edit Dialog */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="sm:max-w-[600px] border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">{t("dialog.updateTitle")}</DialogTitle>
					</DialogHeader>
					<AntibioticForm
						initialData={antibioticItem}
						onSubmit={handleUpdate}
						onCancel={() => setIsEditModalOpen(false)}
						isPending={updateMutation.isPending}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Sheet */}
			<DeleteAntibioticSheet
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				onConfirm={handleDelete}
				antibioticName={detailData.name}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	);
}