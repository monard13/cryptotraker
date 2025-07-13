import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { TradeType } from '../types';
import type { AssetTrade } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/Modal';
import Table from '../components/ui/Table';
import { exportToCsv, formatDate, formatCurrency, formatNumber } from '../lib/utils';

const PRESET_CURRENCIES = ['USDT', 'TRX', 'BTC'];

const AssetTradeForm: React.FC<{onClose: () => void, tradeToEdit?: AssetTrade | null}> = ({onClose, tradeToEdit}) => {
    const { addAssetTrade, updateAssetTrade } = useData();

    const getLocalDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [formState, setFormState] = useState({
        currency: tradeToEdit?.currency || '',
        type: tradeToEdit?.type || TradeType.COMPRA,
        date: tradeToEdit?.date || getLocalDateString(),
        brlValue: tradeToEdit?.brlValue.toString() || '',
        rate: tradeToEdit?.rate.toString() || '',
    });
    
    const [isCustomCurrency, setIsCustomCurrency] = useState(
        tradeToEdit ? !PRESET_CURRENCIES.includes(tradeToEdit.currency) : false
    );

    const [calculated, setCalculated] = useState({
        amount: tradeToEdit?.amount || 0,
        fee: tradeToEdit?.fee || 0,
        feeValue: tradeToEdit?.feeValue || 0,
        netAmount: tradeToEdit?.netAmount || 0,
        finalRate: tradeToEdit?.finalRate || 0,
    });
    
    useEffect(() => {
        const brlValue = parseFloat(formState.brlValue);
        const rate = parseFloat(formState.rate);

        if(!isNaN(brlValue) && !isNaN(rate) && rate > 0) {
            const amount = brlValue / rate;
            const fee = amount * 0.001; // 0.1% fee
            const feeValue = brlValue * 0.001;
            const netAmount = amount - fee;
            const finalRate = netAmount > 0 ? brlValue / netAmount : 0;
            setCalculated({ amount, fee, feeValue, netAmount, finalRate });
        } else {
            setCalculated({ amount: 0, fee: 0, feeValue: 0, netAmount: 0, finalRate: 0 });
        }

    }, [formState.brlValue, formState.rate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

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
        if(!formState.currency || !formState.brlValue || !formState.rate) {
            alert("Por favor, complete todos los campos requeridos.");
            return;
        }

        const tradeData = {
            ...formState,
            brlValue: parseFloat(formState.brlValue),
            rate: parseFloat(formState.rate),
            ...calculated
        };

        if (tradeToEdit) {
            updateAssetTrade({ ...tradeData, id: tradeToEdit.id });
        } else {
            addAssetTrade(tradeData);
        }
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" value={tradeToEdit?.id || `trade-${Date.now()}`} />
            
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
                  <option value={TradeType.COMPRA}>COMPRA</option>
                  <option value={TradeType.VENTA}>VENTA</option>
              </select>
            </div>
            <Input label="DATA" name="date" type="date" value={formState.date} onChange={handleChange} required />
            <Input label="Valor BRL" name="brlValue" type="number" step="0.01" value={formState.brlValue} onChange={handleChange} required />
            <Input label="Tasa" name="rate" type="number" step="any" value={formState.rate} onChange={handleChange} required />
            <Input label="monto" value={formatNumber(calculated.amount)} readOnly disabled />
            <Input label="fee 0.1%" value={formatNumber(calculated.fee)} readOnly disabled />
            <Input label="Valor FEE" value={formatCurrency(calculated.feeValue)} readOnly disabled />
            <Input label="Monto Liquido" value={formatNumber(calculated.netAmount)} readOnly disabled />
            <Input label="Tasa Final" value={formatCurrency(calculated.finalRate)} readOnly disabled />

            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar Registro</Button>
            </div>
        </form>
    );
};

const AssetTrades: React.FC = () => {
  const { assetTrades, deleteAssetTrade } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<AssetTrade | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const handleOpenModalForEdit = (trade: AssetTrade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  }

  const handleOpenModalForAdd = () => {
    setEditingTrade(null);
    setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrade(null);
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
        deleteAssetTrade(id);
    }
  };

  const handleExport = () => {
    if (!exportStartDate || !exportEndDate) {
        alert('Por favor, seleccione un rango de fechas.');
        return;
    }

    const filteredData = assetTrades.filter(t => {
        return t.date >= exportStartDate && t.date <= exportEndDate;
    });

    if (filteredData.length === 0) {
        alert('No hay datos en el rango de fechas seleccionado.');
        return;
    }

    exportToCsv(`trades_activos_${exportStartDate}_a_${exportEndDate}.csv`, filteredData);
    setIsExportModalOpen(false);
    setExportStartDate('');
    setExportEndDate('');
  };

  const headers = ['TICKET', 'MONEDA', 'TIPO', 'DATA', 'Valor BRL', 'Tasa', 'monto', 'fee 0.1%', 'Valor FEE', 'Monto Liquido', 'Tasa Final', 'Acciones'];

  const renderRow = (t: AssetTrade) => (
    <tr key={t.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
        <td className="px-6 py-4">{t.id}</td>
        <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{t.currency}</td>
        <td className="px-6 py-4">{t.type}</td>
        <td className="px-6 py-4">{formatDate(t.date)}</td>
        <td className="px-6 py-4">{formatCurrency(t.brlValue)}</td>
        <td className="px-6 py-4">{formatCurrency(t.rate)}</td>
        <td className="px-6 py-4">{formatNumber(t.amount)}</td>
        <td className="px-6 py-4">{formatNumber(t.fee)}</td>
        <td className="px-6 py-4">{formatCurrency(t.feeValue)}</td>
        <td className="px-6 py-4">{formatNumber(t.netAmount)}</td>
        <td className="px-6 py-4">{formatCurrency(t.finalRate)}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <Button variant="secondary" className="text-xs px-2 py-1 mr-2" onClick={() => handleOpenModalForEdit(t)}>Editar</Button>
            <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDelete(t.id)}>Eliminar</Button>
        </td>
    </tr>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Registro de Compra y Venta de Activos</h1>
            <div>
              <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" className="mr-4">Exportar a CSV</Button>
              <Button onClick={handleOpenModalForAdd}>Añadir Registro</Button>
            </div>
        </div>
        
        <Table headers={headers} data={assetTrades} renderRow={renderRow} />
      
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTrade ? "Editar Trade de Activo" : "Nuevo Trade de Activo"}>
            <AssetTradeForm onClose={handleCloseModal} tradeToEdit={editingTrade} />
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

export default AssetTrades;