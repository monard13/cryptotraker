import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MovementType } from '../types';
import type { AssetMovement } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/Modal';
import Table from '../components/ui/Table';
import { exportToCsv, formatDate, formatNumber } from '../lib/utils';

const PRESET_CURRENCIES = ['USDT', 'TRX', 'BTC'];

const AssetMovementForm: React.FC<{onClose: () => void, movementToEdit?: AssetMovement | null}> = ({onClose, movementToEdit}) => {
    const { addAssetMovement, updateAssetMovement } = useData();

    const getLocalDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [formState, setFormState] = useState({
        currency: movementToEdit?.currency || '',
        type: movementToEdit?.type || MovementType.DEPOSITO,
        date: movementToEdit?.date || getLocalDateString(),
        amount: movementToEdit?.amount.toString() || '',
        networkFee: movementToEdit?.networkFee.toString() || '',
        hash: movementToEdit?.hash || '',
    });

    const [isCustomCurrency, setIsCustomCurrency] = useState(
        movementToEdit ? !PRESET_CURRENCIES.includes(movementToEdit.currency) : false
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: value}));
    }

    const handleCurrencyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'Otra') {
            setIsCustomCurrency(true);
            setFormState(prev => ({ ...prev, currency: '' }));
        } else {
            setIsCustomCurrency(false);
            setFormState(prev => ({ ...prev, currency: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formState.currency || !formState.amount || !formState.date) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }
        
        const movementData = {
            ...formState,
            amount: parseFloat(formState.amount),
            networkFee: parseFloat(formState.networkFee || '0'),
        };

        if (movementToEdit) {
            updateAssetMovement({ ...movementData, id: movementToEdit.id });
        } else {
            addAssetMovement(movementData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" value={movementToEdit?.id || `asset-${Date.now()}`} />
             <div>
              <label htmlFor="currency-select" className="block text-sm font-medium text-gray-300 mb-1">MONEDA</label>
              <select 
                id="currency-select"
                value={isCustomCurrency ? 'Otra' : formState.currency}
                onChange={handleCurrencyTypeChange}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                  <option value="" disabled>Seleccione...</option>
                  {PRESET_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Otra">Otra</option>
              </select>
              {isCustomCurrency && (
                  <div className="mt-2">
                    <Input 
                      label="Especificar Moneda" 
                      name="currency" 
                      type="text" 
                      value={formState.currency} 
                      onChange={handleChange}
                      placeholder="Ej: ETH"
                      required 
                    />
                  </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">TIPO</label>
              <select name="type" value={formState.type} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                  <option value={MovementType.DEPOSITO}>DEPOSITO</option>
                  <option value={MovementType.RETIRO}>RETIRO</option>
              </select>
            </div>
            <Input label="DATA" name="date" type="date" value={formState.date} onChange={handleChange} required />
            <Input label="MONTO" name="amount" type="number" step="any" value={formState.amount} onChange={handleChange} required />
            <Input label="TASA DE RED" name="networkFee" type="number" step="any" value={formState.networkFee} onChange={handleChange} />
            <Input label="HASH" name="hash" type="text" value={formState.hash} onChange={handleChange} className="md:col-span-2" />
            
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Registro</Button>
            </div>
        </form>
    );
}

const AssetMovements: React.FC = () => {
  const { assetMovements, deleteAssetMovement } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<AssetMovement | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const handleOpenModalForEdit = (movement: AssetMovement) => {
    setEditingMovement(movement);
    setIsModalOpen(true);
  }

  const handleOpenModalForAdd = () => {
    setEditingMovement(null);
    setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovement(null);
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
        deleteAssetMovement(id);
    }
  };

  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
        alert('Por favor, seleccione un rango de fechas.');
        return;
    }

    const filteredData = assetMovements.filter(m => {
        return m.date >= exportStartDate && m.date <= exportEndDate;
    });

    if (filteredData.length === 0) {
        alert('No hay datos en el rango de fechas seleccionado.');
        return;
    }

    exportToCsv(`movimientos_activos_${exportStartDate}_a_${exportEndDate}.csv`, filteredData);
    setIsExportModalOpen(false);
    setExportStartDate('');
    setExportEndDate('');
  };
  
  const headers = ['TICKET', 'MONEDA', 'TIPO', 'DATA', 'MONTO', 'TASA DE RED', 'HASH', 'Acciones'];

  const renderRow = (m: AssetMovement) => (
    <tr key={m.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
        <td className="px-6 py-4">{m.id}</td>
        <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{m.currency}</td>
        <td className="px-6 py-4">{m.type}</td>
        <td className="px-6 py-4">{formatDate(m.date)}</td>
        <td className={`px-6 py-4 ${m.type === MovementType.DEPOSITO ? 'text-green-400' : 'text-red-400'}`}>{formatNumber(m.amount)}</td>
        <td className="px-6 py-4">{formatNumber(m.networkFee)}</td>
        <td className="px-6 py-4 truncate max-w-xs">{m.hash}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Button variant="secondary" className="text-xs px-2 py-1 mr-2" onClick={() => handleOpenModalForEdit(m)}>Editar</Button>
            <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(m.id)}>Eliminar</Button>
        </td>
    </tr>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Registro Movimiento de Activos</h1>
            <div>
              <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" className="mr-4">Exportar a CSV</Button>
              <Button onClick={handleOpenModalForAdd}>Añadir Registro</Button>
            </div>
        </div>
        
        <Table headers={headers} data={assetMovements} renderRow={renderRow} />
      
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMovement ? "Editar Movimiento de Activo" : "Nuevo Movimiento de Activo"}>
            <AssetMovementForm onClose={handleCloseModal} movementToEdit={editingMovement}/>
        </Modal>

        <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Exportar Registros por Fecha">
            <div className="space-y-4">
                <Input label="Fecha de Inicio" type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} />
                <Input label="Fecha de Fin" type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} />
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setIsExportModalOpen(false)}>Cancelar</Button>
                    <Button type="button" variant="primary" onClick={handleExport}>Exportar</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default AssetMovements;