export const exportToCsv = (filename: string, rows: object[]) => {
  if (!rows || rows.length === 0) {
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = String(cell).replace(/"/g, '""');
        if (String(cell).includes(separator) || String(cell).includes('"') || String(cell).includes('\n')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatDate = (dateString: string) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return '';
  // Avoid creating a new Date() object to prevent timezone issues where the date
  // could be shifted by a day. We directly manipulate the string for a reliable result.
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (value: number, currency = 'BRL') => {
  if (!currency) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
    }).format(value);
};