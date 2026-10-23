"use client";

import { Trash, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	type FormulaNode,
	type FormulaOperator,
	type ClinicalVariableListOption,
} from "../clinical-variables/types";

interface PrerequisiteNodeProps {
	value: FormulaNode | null;
	onChange: (value: FormulaNode | null) => void;
	label?: string;
	variables: ClinicalVariableListOption[];
}

export function PrerequisiteNode({ value, onChange, label, variables }: PrerequisiteNodeProps) {
	const t = useTranslations("manager.prerequisite");

	let nodeType = "";
	if (value?.constant !== undefined) nodeType = "Constant";
	else if (value?.variable !== undefined) nodeType = "Variable";
	else if (value?.left !== undefined || value?.right !== undefined) nodeType = "Binary";
	else if (value?.operand !== undefined) nodeType = "Unary";
	else if (value?.condition !== undefined) nodeType = "Ternary";

	const handleTypeChange = (type: string) => {
		if (!type || type === "none") {
			onChange(null);
			return;
		}

		let newState: FormulaNode = {};
		if (type === "Constant") newState = { constant: "" };
		else if (type === "Variable") newState = { variable: "" };
		else if (type === "Binary") newState = { operator: "Eq", left: null, right: null };
		else if (type === "Unary") newState = { operand: null };
		else if (type === "Ternary") newState = { condition: null, ifTrue: null, ifFalse: null };

		onChange(newState);
	};

	const handleWrapInBinary = () => {
		if (!value) return;
		onChange({ operator: "And", left: value, right: null });
	};

	const typeColorMap: Record<string, string> = {
		Binary: "border-l-blue-500",
		Unary: "border-l-purple-500",
		Variable: "border-l-emerald-500",
		Constant: "border-l-amber-500",
		Ternary: "border-l-pink-500",
	};

	return (
		<div className="relative pl-4 border-l-2 border-dashed border-border ml-1.5 mb-2">
			{label && (
				<div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide bg-muted inline-block px-2 py-0.5 rounded mb-1">
					{label}
				</div>
			)}

			<div
				className={`border border-border rounded-lg bg-card/60 ${
					nodeType ? `border-l-4 ${typeColorMap[nodeType]}` : ""
				}`}
			>
				<div className="p-2 border-b border-border bg-muted/40 rounded-t-lg">
					<Select value={nodeType} onValueChange={handleTypeChange}>
						<SelectTrigger className="border-0 bg-transparent shadow-none font-semibold text-foreground focus:ring-0">
							<SelectValue placeholder={t("nodeTypes.placeholder")} />
						</SelectTrigger>
						<SelectContent className="bg-popover text-popover-foreground border-border">
							<SelectItem value="none" className="text-muted-foreground">
								{t("nodeTypes.none")}
							</SelectItem>
							<SelectItem value="Binary">{t("nodeTypes.binary")}</SelectItem>
							<SelectItem value="Unary">{t("nodeTypes.unary")}</SelectItem>
							<SelectItem value="Variable">{t("nodeTypes.variable")}</SelectItem>
							<SelectItem value="Constant">{t("nodeTypes.constant")}</SelectItem>
							<SelectItem value="Ternary">{t("nodeTypes.ternary")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{nodeType && (
					<div className="p-3 space-y-3">
						{nodeType === "Constant" && (
							<Input
								value={value?.constant || ""}
								onChange={(e) => onChange({ ...value, constant: e.target.value })}
								placeholder={t("placeholders.constant")}
								className="bg-background text-foreground border-input placeholder:text-muted-foreground"
							/>
						)}

						{nodeType === "Variable" && (
							<Select
								value={value?.variable || ""}
								onValueChange={(val) => onChange({ ...value, variable: val })}
							>
								<SelectTrigger className="bg-background text-foreground border-input">
									<SelectValue placeholder={t("placeholders.selectVariable")} />
								</SelectTrigger>
								<SelectContent className="max-h-60 overflow-y-auto bg-popover text-popover-foreground border-border">
									{variables.map((v) => (
										<SelectItem key={v.id} value={v.id}>
											<span className="font-semibold">{v.name}</span>{" "}
											<span className="text-muted-foreground text-xs">({v.code})</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{nodeType === "Binary" && (
							<div className="space-y-2">
								<PrerequisiteNode
									label={t("labels.left")}
									value={value?.left || null}
									onChange={(v) => onChange({ ...value, left: v ?? undefined })}
									variables={variables}
								/>

								<div className="flex items-center my-2 before:flex-1 before:border-b before:border-blue-500/30 after:flex-1 after:border-b after:border-blue-500/30">
									<Select
										value={value?.operator || "Eq"}
										onValueChange={(val: FormulaOperator) => onChange({ ...value, operator: val })}
									>
										<SelectTrigger className="w-auto mx-4 bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold h-8">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-popover text-popover-foreground border-border">
											<SelectGroup>
												<SelectLabel>{t("groups.logic")}</SelectLabel>
												<SelectItem value="And">{t("operators.and")}</SelectItem>
												<SelectItem value="Or">{t("operators.or")}</SelectItem>
											</SelectGroup>
											<SelectGroup>
												<SelectLabel>{t("groups.comparison")}</SelectLabel>
												<SelectItem value="Eq">{t("operators.eq")}</SelectItem>
												<SelectItem value="Ne">{t("operators.ne")}</SelectItem>
												<SelectItem value="Gt">{t("operators.gt")}</SelectItem>
												<SelectItem value="Gte">{t("operators.gte")}</SelectItem>
												<SelectItem value="Lt">{t("operators.lt")}</SelectItem>
												<SelectItem value="Lte">{t("operators.lte")}</SelectItem>
											</SelectGroup>
											<SelectGroup>
												<SelectLabel>{t("groups.math")}</SelectLabel>
												<SelectItem value="Add">{t("operators.add")}</SelectItem>
												<SelectItem value="Sub">{t("operators.sub")}</SelectItem>
												<SelectItem value="Mul">{t("operators.mul")}</SelectItem>
												<SelectItem value="Div">{t("operators.div")}</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>

								<PrerequisiteNode
									label={t("labels.right")}
									value={value?.right || null}
									onChange={(v) => onChange({ ...value, right: v ?? undefined })}
									variables={variables}
								/>
							</div>
						)}

						{nodeType === "Unary" && (
							<PrerequisiteNode
								label={t("labels.operand")}
								value={value?.operand || null}
								onChange={(v) => onChange({ ...value, operand: v ?? undefined })}
								variables={variables}
							/>
						)}

						{nodeType === "Ternary" && (
							<div className="flex flex-col gap-2">
								<PrerequisiteNode
									label={t("labels.condition")}
									value={value?.condition || null}
									onChange={(v) => onChange({ ...value, condition: v ?? undefined })}
									variables={variables}
								/>
								<PrerequisiteNode
									label={t("labels.then")}
									value={value?.ifTrue || null}
									onChange={(v) => onChange({ ...value, ifTrue: v ?? undefined })}
									variables={variables}
								/>
								<PrerequisiteNode
									label={t("labels.else")}
									value={value?.ifFalse || null}
									onChange={(v) => onChange({ ...value, ifFalse: v ?? undefined })}
									variables={variables}
								/>
							</div>
						)}
					</div>
				)}

				{nodeType && (
					<div className="p-2 border-t border-dashed border-border bg-muted/30 flex justify-end gap-2 rounded-b-lg">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleWrapInBinary}
							className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
						>
							<PackageOpen className="w-3.5 h-3.5 mr-1.5" />
							{t("actions.wrapBinary")}
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={() => handleTypeChange("")}
							className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
						>
							<Trash className="w-3.5 h-3.5 mr-1.5" />
							{t("actions.delete")}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function PrerequisiteBuilder({
	title,
	value,
	onChange,
	variables = [],
}: {
	title?: string;
	value: FormulaNode | null;
	onChange: (val: FormulaNode | null) => void;
	variables: ClinicalVariableListOption[];
}) {
	const t = useTranslations("manager.prerequisite");

	return (
		<div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
			{title && <h4 className="text-sm font-semibold mb-4 border-b border-border pb-2 text-foreground">{title}</h4>}
			<PrerequisiteNode
				label={t("labels.root")}
				value={value}
				onChange={onChange}
				variables={variables}
			/>
		</div>
	);
}