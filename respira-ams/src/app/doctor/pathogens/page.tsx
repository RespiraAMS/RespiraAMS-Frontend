import { PathogensView } from '@/features/manager/pathogens/components/PathogensView';

export const metadata = {
    title: 'Danh sách tác nhân gây bệnh | RespiraAMS',
    description: 'Tra cứu danh sách tác nhân vi sinh gây bệnh đường hô hấp và phân loại.',
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<PathogensView readOnly={true} />
		</div>
	);
}
