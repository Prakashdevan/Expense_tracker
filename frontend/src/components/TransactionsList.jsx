import { useState, useContext, useEffect } from 'react';
import TransactionContext from '../context/TransactionContext';
import { Search, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionsList = () => {
  const { transactions, deleteTransaction } = useContext(TransactionContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(transactions.map(t => t.category))].filter(Boolean);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add Title
    doc.setFontSize(18);
    doc.text('Transactions Report', 14, 22);

    // Prepare Table Data
    const tableColumn = ["Date", "Type", "Category", "Amount", "Note"];
    const tableRows = [];

    transactions.forEach(t => {
      const row = [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        `₹${t.amount.toFixed(2)}`,
        t.note || ''
      ];
      tableRows.push(row);
    });

    // Configure AutoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229] } // matching var(--primary-color)
    });

    const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
    // Save PDF
    doc.save(`transactions_report_${dateStr}.pdf`);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Recent Transactions</h3>
        <button onClick={exportPDF} className="btn btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '14px', borderRadius: '8px' }}>
          <Download size={16} /> Export PDF
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="input-field" 
            style={{ paddingLeft: '38px', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input-field" 
          style={{ width: '120px', marginBottom: 0 }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>No transactions found.</p>
        ) : (
          filteredTransactions.map(t => (
            <div key={t._id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  background: t.type === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: t.type === 'Income' ? 'var(--income-color)' : 'var(--expense-color)',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '20px'
                }}>
                  {t.type === 'Income' ? '+' : '-'}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '2px' }}>{t.category}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(t.date).toLocaleDateString()} {t.note ? `• ${t.note}` : ''}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ fontWeight: 700, fontSize: '16px', color: t.type === 'Income' ? 'var(--income-color)' : 'var(--expense-color)' }}>
                  ₹{t.amount.toFixed(2)}
                </p>
                <button onClick={() => deleteTransaction(t._id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
