import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title,
} from 'chart.js';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Dashboard.css';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
} from '@tanstack/react-table';

// Register Chart.js components
ChartJS.register( ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title );

// --- Helper function to format text to Title Case ---
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// --- Helper function to process expenses for the Pie Chart ---
const processPieData = (expenses) => {
  const categories = {};
  expenses.forEach(expense => {
    const category = toTitleCase(expense.category.trim());
    if (categories[category]) {
      categories[category] += expense.amount;
    } else {
      categories[category] = expense.amount;
    }
  });
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  return {
    labels: labels,
    datasets: [
      {
        label: 'Expenses by Category',
        data: data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };
};

// --- Helper function to process data for the Bar Chart ---
const processBarData = (expenses, budget) => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalSpent;
  return {
    labels: ['Budget Overview'],
    datasets: [
      { label: 'Total Spent', data: [totalSpent], backgroundColor: 'rgba(255, 99, 132, 0.8)', borderRadius: 4 },
      { label: 'Remaining', data: [remaining < 0 ? 0 : remaining], backgroundColor: 'rgba(75, 192, 192, 0.8)', borderRadius: 4 },
      { label: 'Total Budget', data: [budget], backgroundColor: 'rgba(54, 162, 235, 0.8)', borderRadius: 4 }
    ],
  };
};


const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(0); // Initial budget
  const [isLoading, setIsLoading] = useState(true);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [sorting, setSorting] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const pieChartRef = useRef(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      console.log("--- Fetching initial data ---"); // Log fetch start
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const [budgetResponse, expensesResponse] = await Promise.all([
          apiService.getBudget(),
          apiService.getExpenses()
        ]);
        console.log("Fetched Budget:", budgetResponse.data.budget); // Log fetched budget
        setBudget(budgetResponse.data.budget);
        setNewBudget(budgetResponse.data.budget.toString());
        setExpenses(expensesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API Handlers ---
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseName || !amountNum || amountNum <= 0 || !expenseCategory) {
      alert("Please enter a valid name, category, and positive amount."); return;
    }
    try {
      const newExpense = { name: expenseName, amount: amountNum, category: expenseCategory };
      const response = await apiService.addExpense(newExpense);
      setExpenses(prev => [...prev, response.data]);
      setExpenseName(''); setExpenseAmount(''); setExpenseCategory('');
    } catch (error) {
      console.error("Failed to add expense:", error);
      alert("Error adding expense.");
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    const budgetNum = parseFloat(newBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      alert("Please enter a valid, positive budget amount."); return;
    }
    console.log("--- Setting new budget ---"); // Log set budget start
    try {
      const response = await apiService.setBudget(budgetNum);
      console.log("Budget set response:", response.data.budget); // Log new budget value
      setBudget(response.data.budget);
      alert("Budget updated!");
    } catch (error) {
      console.error("Failed to set budget:", error);
      alert("Error updating budget.");
    }
  };

  const handleDeleteExpense = async (idToDelete) => {
    // --- <<< ADDED LOG >>> ---
    console.log(`--- Deleting expense ID: ${idToDelete}. Current budget BEFORE delete call:`, budget);
    // ---
    try {
      await apiService.deleteExpense(idToDelete);
      setExpenses(prev => {
        const updatedExpenses = prev.filter(expense => expense.id !== idToDelete);
        console.log("Expenses state updated after delete."); // Log state update
        return updatedExpenses;
      });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      alert("Error deleting expense.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log('User logged out');
    navigate('/');
  };

  // --- Memoized Calculations & Chart Options ---
  const pieData = useMemo(() => processPieData(expenses), [expenses]);
  const barData = useMemo(() => processBarData(expenses, budget), [expenses, budget]);
  const totalSpent = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
  const totalRemaining = useMemo(() => budget - totalSpent, [budget, totalSpent]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, font: { size: 18 }, color: '#333' },
    },
  }), []);

  const barChartOptions = useMemo(() => ({
    ...chartOptions,
    scales: { y: { beginAtZero: true } },
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...(chartOptions.plugins?.title || {}),
        text: 'Budget vs. Spent'
      }
    },
  }), [chartOptions]);

  const pieChartOptions = useMemo(() => ({
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        title: {
          ...(chartOptions.plugins?.title || {}),
          text: 'Expense Breakdown'
        }
      },
      onClick: (event, elements) => {
          if (!pieChartRef.current || !elements || elements.length === 0) return;
          const chart = pieChartRef.current;
          const dataIndex = elements[0].index;
          const clickedLabel = chart.data.labels[dataIndex];
          setSelectedCategory(clickedLabel);
      }
  }), [chartOptions]);

  // --- Filtered Expenses ---
  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter(expense => toTitleCase(expense.category.trim()) === selectedCategory);
  }, [expenses, selectedCategory]);

  // --- Table Columns ---
  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name', cell: info => info.getValue() },
    { accessorKey: 'category', header: 'Category', cell: info => toTitleCase(info.getValue()) },
    { accessorKey: 'amount', header: 'Amount', cell: info => `$${info.getValue().toFixed(2)}` },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (<button onClick={() => handleDeleteExpense(row.original.id)} className="btn btn-danger btn-sm">Delete</button>),
    },
  ], []); // Keep empty dependencies if stable

  // --- React Table Instance ---
  const table = useReactTable({
    data: filteredExpenses, columns, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  });

  // --- Loading State ---
  if (isLoading) {
    return <div className="loading-message">Loading your dashboard...</div>;
  }

  // --- <<< ADDED LOG >>> ---
  console.log(`--- Rendering Dashboard. Current budget state:`, budget, `| Current newBudget state:`, newBudget);
  // ---

  // --- JSX ---
  return (
    <div className="dashboard-container">
      {/* --- Top Actions --- */}
      <div className="dashboard-top-actions">
        <Link to="/profile" className="btn btn-secondary profile-link">Profile</Link>
        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
      </div>

      <h1 className="dashboard-header">Your Financial Dashboard</h1>

      {/* --- Totals Display --- */}
      <div className="totals-grid">
         {/* Use typeof check for safety */}
        <div className="totals-card budget"><h3>Total Budget</h3><p>${typeof budget === 'number' ? budget.toFixed(2) : 'N/A'}</p></div>
        <div className="totals-card spent"><h3>Total Spent</h3><p>${typeof totalSpent === 'number' ? totalSpent.toFixed(2) : 'N/A'}</p></div>
        <div className="totals-card remaining"><h3>Remaining</h3><p>${typeof totalRemaining === 'number' ? totalRemaining.toFixed(2) : 'N/A'}</p></div>
      </div>

      {/* --- Forms Section --- */}
      <div className="forms-grid">
        <form onSubmit={handleSetBudget} className="card form-card">
          <h2>Set Your Budget</h2>
          <div className="form-group"> <label>Total Budget Amount</label> <input type="number" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} placeholder="e.g., 1000"/> </div>
          <button type="submit" className="btn btn-primary">Set Budget</button>
        </form>
        <form onSubmit={handleAddExpense} className="card form-card">
          <h2>Add New Expense</h2>
          <div className="form-group"><label>Expense Name</label><input type="text" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="e.g., Coffee"/></div>
          <div className="form-group"><label>Amount</label><input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="e.g., 5"/></div>
          <div className="form-group"><label>Category</label><input type="text" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} placeholder="e.g., Food, Transport"/></div>
          <button type="submit" className="btn btn-primary">Add Expense</button>
        </form>
      </div>

      {/* --- Charts Section --- */}
      <div className="charts-grid">
        <div className="card chart-card"><Bar data={barData} options={barChartOptions} /></div>
        <div className="card chart-card">
          {expenses.length > 0 ? (
             <Pie ref={pieChartRef} data={pieData} options={pieChartOptions} />
          ) : ( <p>Add expense for category breakdown.</p> )}
        </div>
      </div>

      {/* --- Expense Table Card --- */}
      <div className="card expense-table-card">
        <div className="expense-table-header">
            <h2>Expense Log {selectedCategory ? `(${selectedCategory})` : ''}</h2>
            {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="btn btn-secondary btn-sm clear-filter-btn">
                    Show All Categories
                </button>
            )}
        </div>
        {filteredExpenses.length === 0 ? <p>No expenses {selectedCategory ? `in category "${selectedCategory}"` : 'added yet'}.</p> : (
          <table className="expense-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {!header.isPlaceholder && (
                        <div {...{ className: header.column.getCanSort() ? 'cursor-pointer select-none' : '', onClick: header.column.getToggleSortingHandler() }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;