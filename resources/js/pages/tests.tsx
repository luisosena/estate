import { SectionsTable } from '@/components/sections-table';
import Stats07 from '@/components/stats-07';
import Table05 from '@/components/table-05';

export default function SomePage() {
    return (
        <div className="p-6">
            <SectionsTable />
            <Stats07 />
            <Table05 />
        </div>
    );
}
