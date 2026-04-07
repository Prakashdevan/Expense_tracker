import { useState, useContext } from 'react';
import TransactionContext from '../context/TransactionContext';

const PREDEFINED_CATEGORIES = ['Food', 'Shopping', 'Transport', 'Health', 'Bills', 'Salary', 'Other'];

const TransactionForm = ({ onClose }) => {
  const { addTransaction } = useContext(TransactionContext);
  const [type, setType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = type === 'Income' ? 'Income' : (category === 'Custom' ? customCategory : category);
    
    await addTransaction({
      type,
      amount: Number(amount),
      category: finalCategory,
      date,
      note
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-panel animate-fade" style={{
        width: '100%', maxWidth: '480px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        backgroundColor: 'var(--bg-color)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Add Record</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-primary)' }}>&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={() => setType('Expense')}
            className={`btn ${type === 'Expense' ? '' : 'btn-secondary'}`}
            style={{ flex: 1, backgroundColor: type === 'Expense' ? 'var(--expense-color)' : '' }}
          >Expense</button>
          <button 
            type="button" 
            onClick={() => setType('Income')}
            className={`btn ${type === 'Income' ? '' : 'btn-secondary'}`}
            style={{ flex: 1, backgroundColor: type === 'Income' ? 'var(--income-color)' : '' }}
          >Income</button>
        </div>

        <form onSubmit={handleSubmit}>
          <input 
            type="number" 
            step="0.01"
            placeholder="Amount" 
            className="input-field" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            required 
            min="0.01"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          />

          {type === 'Expense' && (
            <>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Custom">Custom...</option>
              </select>

              {category === 'Custom' && (
                <input type="text" placeholder="Enter custom category" className="input-field" value={customCategory} onChange={e => setCustomCategory(e.target.value)} required />
              )}
            </>
          )}

          <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} required />
          
          <input type="text" placeholder="Note (optional)" className="input-field" value={note} onChange={e => setNote(e.target.value)} />
          
          <button type="submit" className="btn" style={{ marginTop: '10px' }}>Save Record</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
