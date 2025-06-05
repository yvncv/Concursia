import { Switch } from '@headlessui/react';

interface GeneralInfoData {
    name: string;
    description: string;
    status: string;
}

interface GeneralInfoProps {
    data: GeneralInfoData;
    updateData: (data: GeneralInfoData) => void;
    isOnlyRead: boolean;
}

export default function GeneralInfo({ data, updateData, isOnlyRead }: GeneralInfoProps) {
    return (
        <div className="space-y-10">
            <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-4">
                    Nombre del evento
                </label>
                <input
                    type="text"
                    id="eventName"
                    value={data.name}
                    onChange={(e) => updateData({ ...data, name: e.target.value })}
                    disabled={isOnlyRead}
                    className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)]
            placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:outline-none
            transition-all ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
                    placeholder="Ingresa el nombre del evento"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-4">
                    Descripción
                </label>
                <textarea
                    id="description"
                    rows={4}
                    value={data.description}
                    onChange={(e) => updateData({ ...data, description: e.target.value })}
                    disabled={isOnlyRead}
                    className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)]
            placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:outline-none
            transition-all resize-none ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
                    placeholder="Ingresa la descripción del evento"
                ></textarea>
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-4">
                    Status
                </label>
                <Switch
                    checked={data.status === 'active'}
                    onChange={(checked) => updateData({ ...data, status: checked ? 'active' : 'inactive' })}
                    disabled={isOnlyRead}
                    className={`${isOnlyRead ? 'bg-gray-200 cursor-not-allowed' : data.status === 'active' ? 'bg-green-500' : 'bg-red-500'} relative inline-flex items-center h-6 rounded-full w-11`}
                >
                    <span className="sr-only">Toggle Status</span>
                    <span
                        className={`${data.status === 'active' ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                    />
                </Switch>
                <span className="ml-3 text-sm text-gray-700">{data.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>
    );
}