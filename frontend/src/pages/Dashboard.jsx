import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import TransactionContext from '../context/TransactionContext';
import ThemeContext from '../context/ThemeContext';
import { LogOut, User, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TransactionForm from '../components/TransactionForm';
import TransactionsList from '../components/TransactionsList';

const Dashboard = () => {
  const { user, logout, updateBudget, deleteAccount } = useContext(AuthContext);
  const { transactions } = useContext(TransactionContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(user?.monthlyBudget || 0);

  // Calculate stats
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      if (t.type === 'Expense') {
        expense += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const pieData = Object.keys(categoryTotals).map(key => ({
      name: key,
      value: categoryTotals[key]
    })).sort((a,b) => b.value - a.value);

    return { income, expense, balance: income - expense, pieData };
  }, [transactions]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleUpdateBudget = () => {
    updateBudget(Number(newBudget));
    setIsEditingBudget(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to completely delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
        navigate('/register');
      } catch (err) {
        alert("Failed to delete account");
      }
    }
  };

  const budgetUsagePercent = user?.monthlyBudget ? (stats.expense / user.monthlyBudget) * 100 : 0;
  const isOverBudget = budgetUsagePercent > 80;

  return (
    <div style={{ padding: '0 0 80px', height: '100%' }}>
      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <User size={20} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 0 }}>Welcome back,</p>
            <p style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>{user?.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          <button onClick={handleDeleteAccount} style={{ background: 'none', border: 'none', color: 'var(--expense-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trash2 size={24} />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <div style={{ padding: '0 24px' }}>
        {/* Total Balance Card */}
        <div className="glass-panel" style={{ 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
          color: 'white',
          border: 'none',
          marginBottom: '24px'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Balance</p>
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>
            ₹{stats.balance.toFixed(2)}
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Income</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>+₹{stats.income.toFixed(2)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Expense</p>
              <p style={{ fontWeight: 600, fontSize: '16px' }}>-₹{stats.expense.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Monthly Budget Progress */}
        <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Monthly Budget</h3>
            {isEditingBudget ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  value={newBudget} 
                  onChange={e => setNewBudget(e.target.value)} 
                  style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button onClick={handleUpdateBudget} style={{ border: 'none', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>Save</button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingBudget(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '14px', cursor: 'pointer', fontWeight: 500 }}
              >
                Edit: ₹{user?.monthlyBudget || 0}
              </button>
            )}
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            ₹{stats.expense.toFixed(2)} spent out of ₹{user?.monthlyBudget || 0}
          </p>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${Math.min(budgetUsagePercent, 100)}%`, 
                backgroundColor: isOverBudget ? 'var(--expense-color)' : 'var(--primary-color)' 
              }}
            ></div>
          </div>
          {isOverBudget && <p style={{ fontSize: '12px', color: 'var(--expense-color)', marginTop: '8px' }}>Warning: You have exceeded 80% of your monthly budget!</p>}
        </div>

        {/* Analytics Chart */}
        {stats.pieData.length > 0 && (
          <div className="glass-panel" style={{ marginBottom: '24px', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Spending Analytics</h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)', backgroundColor: 'var(--surface-color)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {stats.pieData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <TransactionsList />
      </div>

      {/* Floating Add Button */}
      <div style={{
          position: 'fixed', 
          bottom: '24px', 
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          justifyContent: 'flex-end',
          paddingRight: '24px',
          pointerEvents: 'none',
          zIndex: 50
      }}>
         <button 
            className="animate-fade"
            onClick={() => setShowAddTransaction(true)}
            style={{
                width: '64px', 
                height: '64px', 
                borderRadius: '32px', 
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                pointerEvents: 'auto'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
         >
             <Plus size={32} />
         </button>
      </div>

      {showAddTransaction && <TransactionForm onClose={() => setShowAddTransaction(false)} />}
    </div>
  );
};

export default Dashboard;
