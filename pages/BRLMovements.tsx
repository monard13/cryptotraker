import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MovementType } from '../types';
import type { BRLMovement } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/Modal';
import Table from '../components/ui/Table';
import { exportToCsv, formatDate, formatCurrency } from '../lib/utils';

const BRLMovementForm: React.FC<{onClose: () => void, movementToEdit?: BRLMovement | null}> = ({onClose, movementToEdit}) => {
    const { addBrlMovement, updateBrlMovement } = useData();
    const [type, setType] = useState<MovementType>(movementToEdit?.type || MovementType.DEPOSITO);

    const getLocalDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    const [date, setDate] = useState(movementToEdit?.date || getLocalDateString());

    const [brlValue, setBrlValue] = useState(movementToEdit?.brlValue.toString() || '');
    const [proof, setProof] = useState(movementToEdit?.proof || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!date || !brlValue) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }
        
        const movementData = {
            type,
            date,
            brlValue: parseFloat(brlValue),
            proof
        };

        if(movementToEdit){
            updateBrlMovement({ ...movementData, id: movementToEdit.id });
        } else {
            addBrlMovement(movementData);
        }
        
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" value={movementToEdit?.id || `brl-${Date.now()}`} />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">TIPO</label>
              <select value={type} onChange={(e) => setType(e.target.value as MovementType)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                  <option value={MovementType.DEPOSITO}>DEPOSITO</option>
                  <option value={MovementType.RETIRO}>RETIRO</option>
              </select>
            </div>
            <Input label="DATA" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Valor BRL" type="number" step="0.01" value={brlValue} onChange={(e) => setBrlValue(e.target.value)} required />
            <Input label="COMPROBANTE" type="text" value={proof} onChange={(e) => setProof(e.target.value)} />
            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Registro</Button>
            </div>
        </form>
    );
}

const BRLMovements: React.FC = () => {
  const { brlMovements, deleteBrlMovement } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<BRLMovement | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const handleOpenModalForEdit = (movement: BRLMovement) => {
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
        deleteBrlMovement(id);
    }
  };

  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
        alert('Por favor, seleccione un rango de fechas.');
        return;
    }

    const filteredData = brlMovements.filter(m => {
        return m.date >= exportStartDate && m.date <= exportEndDate;
    });

    if (filteredData.length === 0) {
        alert('No hay datos en el rango de fechas seleccionado.');
        return;
    }

    exportToCsv(`movimientos_brl_${exportStartDate}_a_${exportEndDate}.csv`, filteredData);
    setIsExportModalOpen(false);
    setExportStartDate('');
    setExportEndDate('');
  };

  const headers = ['TICKET', 'TIPO', 'DATA', 'Valor BRL', 'COMPROBANTE', 'Acciones'];

  const renderRow = (m: BRLMovement) => (
    <tr key={m.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
      <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{m.id}</td>
      <td className="px-6 py-4">{m.type}</td>
      <td className="px-6 py-4">{formatDate(m.date)}</td>
      <td className={`px-6 py-4 ${m.type === MovementType.DEPOSITO ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(m.brlValue)}</td>
      <td className="px-6 py-4">{m.proof}</td>
      <td className="px-6 py-4 whitespace-nowrap">
          <Button variant="secondary" className="text-xs px-2 py-1 mr-2" onClick={() => handleOpenModalForEdit(m)}>Editar</Button>
          <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(m.id)}>Eliminar</Button>
      </td>
    </tr>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Registro de Movimientos BRL</h1>
            <div>
              <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" className="mr-4">Exportar a CSV</Button>
              <Button onClick={handleOpenModalForAdd}>Añadir Registro</Button>
            </div>
        </div>
        
        <Table headers={headers} data={brlMovements} renderRow={renderRow} />
      
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMovement ? "Editar Movimiento BRL" : "Nuevo Movimiento BRL"}>
            <BRLMovementForm onClose={handleCloseModal} movementToEdit={editingMovement}/>
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

export default BRLMovements;