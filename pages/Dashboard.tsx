import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import { formatCurrency, formatNumber } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { type AssetMovement, type AssetTrade, MovementType, TradeType } from '../types';

const Dashboard: React.FC = () => {
    const { brlMovements, assetTrades, assetMovements } = useData();
    const [filter, setFilter] = useState('all');

    const filteredData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYear = new Date(now.getFullYear(), 0, 1);

        const filterDate = (dateStr: string) => {
            const date = new Date(dateStr);
            switch (filter) {
                case 'today': return date >= today;
                case 'month': return date >= thisMonth;
                case 'year': return date >= thisYear;
                case 'all':
                default:
                    return true;
            }
        };
        
        return {
            brlMovements: brlMovements.filter(m => filterDate(m.date)),
            assetTrades: assetTrades.filter(t => filterDate(t.date)),
            assetMovements: assetMovements.filter(m => filterDate(m.date)),
        }
    }, [brlMovements, assetTrades, assetMovements, filter]);


    const kpis = useMemo(() => {
        const totalDeposited = filteredData.brlMovements
            .filter(m => m.type === 'DEPOSITO')
            .reduce((sum, m) => sum + m.brlValue, 0);

        const totalWithdrawn = filteredData.brlMovements
            .filter(m => m.type === 'RETIRO')
            .reduce((sum, m) => sum + m.brlValue, 0);

        const totalBRLInvested = filteredData.assetTrades
            .filter(t => t.type === 'COMPRA')
            .reduce((sum, t) => sum + t.brlValue, 0);
        
        const totalBRLFromSales = filteredData.assetTrades
            .filter(t => t.type === 'VENTA')
            .reduce((sum, t) => sum + t.brlValue, 0);
        
        const totalFees = filteredData.assetTrades.reduce((sum, t) => sum + (t.brlValue * 0.001), 0);
        
        const brlBalance = totalDeposited - totalBRLInvested;

        return { totalDeposited, totalWithdrawn, totalBRLInvested, totalBRLFromSales, totalFees, brlBalance };
    }, [filteredData]);

    const assetSummaryData = useMemo(() => {
        const summary: { [key: string]: { balance: number, totalBRLSpent: number, totalAmountBought: number } } = {};

        filteredData.assetTrades.forEach(trade => {
            if (!summary[trade.currency]) {
                summary[trade.currency] = { balance: 0, totalBRLSpent: 0, totalAmountBought: 0 };
            }
            if (trade.type === TradeType.COMPRA) {
                summary[trade.currency].balance += trade.netAmount;
                summary[trade.currency].totalBRLSpent += trade.brlValue;
                summary[trade.currency].totalAmountBought += trade.amount;
            } else { // VENTA
                summary[trade.currency].balance -= trade.amount;
            }
        });

        filteredData.assetMovements.forEach(movement => {
            if (!summary[movement.currency]) {
                summary[movement.currency] = { balance: 0, totalBRLSpent: 0, totalAmountBought: 0 };
            }
            if (movement.type === MovementType.DEPOSITO) {
                summary[movement.currency].balance += movement.amount;
            } else { // RETIRO
                summary[movement.currency].balance -= (movement.amount + movement.networkFee);
            }
        });

        return Object.entries(summary)
            .map(([currency, data]) => ({
                currency,
                balance: data.balance,
                avgBuyPrice: data.totalAmountBought > 0 ? data.totalBRLSpent / data.totalAmountBought : 0,
            }))
            .filter(d => d.balance > 0.00000001) // Filter out dust balances
            .sort((a,b) => a.currency.localeCompare(b.currency));
    }, [filteredData.assetTrades, filteredData.assetMovements]);

    const assetDistributionForPieChart = useMemo(() => {
        return assetSummaryData.map(d => ({ name: d.currency, value: d.balance }));
    }, [assetSummaryData]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#AF19FF'];

    const summaryHeaders = ['Activo', 'Saldo Actual', 'Precio Promedio Compra'];
    const renderSummaryRow = (item: typeof assetSummaryData[0]) => (
        <tr key={item.currency} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
            <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">{item.currency}</td>
            <td className="px-6 py-4">{formatNumber(item.balance)}</td>
            <td className="px-6 py-4">{formatCurrency(item.avgBuyPrice)}</td>
        </tr>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <select onChange={(e) => setFilter(e.target.value)} value={filter} className="bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500">
                    <option value="all">Todo el Período</option>
                    <option value="today">Hoy</option>
                    <option value="month">Este Mes</option>
                    <option value="year">Este Año</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card><h4 className="text-gray-400">BRL Depositado</h4><p className="text-2xl font-semibold text-green-400">{formatCurrency(kpis.totalDeposited)}</p></Card>
                <Card><h4 className="text-gray-400">BRL Retirado</h4><p className="text-2xl font-semibold text-red-400">{formatCurrency(kpis.totalWithdrawn)}</p></Card>
                <Card><h4 className="text-gray-400">BRL Invertido</h4><p className="text-2xl font-semibold text-yellow-400">{formatCurrency(kpis.totalBRLInvested)}</p></Card>
                <Card><h4 className="text-gray-400">BRL de Ventas</h4><p className="text-2xl font-semibold text-blue-400">{formatCurrency(kpis.totalBRLFromSales)}</p></Card>
                <Card><h4 className="text-gray-400">Balance BRL</h4><p className={`text-2xl font-semibold ${kpis.brlBalance >= 0 ? 'text-indigo-400' : 'text-orange-400'}`}>{formatCurrency(kpis.brlBalance)}</p></Card>
                <Card><h4 className="text-gray-400">Total Comisiones</h4><p className="text-2xl font-semibold">{formatCurrency(kpis.totalFees)}</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h3 className="font-semibold text-xl mb-4 text-white">Precios Promedio de Compra</h3>
                    {assetSummaryData.length > 0 ? (
                        <ul className="space-y-2">
                            {assetSummaryData.map((item) => (
                                <li key={item.currency} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                    <span className="font-medium text-gray-100">{item.currency}</span>
                                    <span className="font-semibold text-blue-300">{formatCurrency(item.avgBuyPrice)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No hay datos de compra para mostrar precios promedio.</p>
                    )}
                </Card>
                <Card>
                    <h3 className="font-semibold text-xl mb-4 text-white">Resumen de Activos</h3>
                    <Table headers={summaryHeaders} data={assetSummaryData} renderRow={renderSummaryRow} />
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96">
                    <h3 className="font-semibold mb-4">Movimientos BRL</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                            { name: 'Movimientos', DEPOSITO: kpis.totalDeposited, RETIRO: kpis.totalWithdrawn }
                        ]} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568"/>
                            <XAxis dataKey="name" stroke="#A0AEC0"/>
                            <YAxis stroke="#A0AEC0" tickFormatter={(value) => formatCurrency(Number(value), '')}/>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }}
                                labelStyle={{ color: '#E2E8F0' }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Legend wrapperStyle={{color: '#E2E8F0'}}/>
                            <Bar dataKey="DEPOSITO" fill="#48BB78" name="Depósitos"/>
                            <Bar dataKey="RETIRO" fill="#F56565" name="Retiros"/>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card className="h-96">
                    <h3 className="font-semibold mb-4">Distribución de Activos (por Saldo)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                             <Pie data={assetDistributionForPieChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                                {assetDistributionForPieChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                             </Pie>
                             <Tooltip formatter={(value: number, name) => [formatNumber(value), name]} contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }}/>
                             <Legend wrapperStyle={{color: '#E2E8F0'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;