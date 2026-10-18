import { getTranslations } from "next-intl/server";
import { AntibioticsView } from "@/features/manager/antibiotics/components/AntibioticsView";

export async function generateMetadata() {
	const t = await getTranslations("manager.antibiotics");
	return {
		title: `${t("title")} | RespiraAMS`,
		description: t("description"),
	};
}

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8 bg-background text-foreground">
			<AntibioticsView />
		</div>
	);
}