import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Loader from '../components/Loader';
import {
    Download, Plus, ShoppingCart,
    Package, Search,
    FileText, Filter, CheckCircle2,
    AlertTriangle, DollarSign, Box, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatInr = (num) => {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2 });
};



const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");

    const [dashboardData, setDashboardData] = useState({
        todaySales: 0,
        itemsSold: 0,
        lowStockCount: 0,
        purchaseSummary: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModal, setIsConfirmModal] = useState(false);
    const [confirmActionMedId, setConfirmActionMedId] = useState(null);
    const [editingMed, setEditingMed] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        batch_number: '',
        expiry_date: '',
        quantity: 0,
        price: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMedicines();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, sortBy, sortOrder]);

    const fetchDashboardData = async () => {
        try {
            const [salesRes, itemsRes, lowStockRes, purchaseRes] = await Promise.all([
                axiosInstance.get('/dashboard/today-sales'),
                axiosInstance.get('/dashboard/items-sold'),
                axiosInstance.get('/dashboard/low-stock'),
                axiosInstance.get('/dashboard/purchase-summary')
            ]);
            setDashboardData({
                todaySales: salesRes.data.today_sales || 0,
                itemsSold: itemsRes.data.items_sold || 0,
                lowStockCount: lowStockRes.data.low_stock_count || 0,
                purchaseSummary: purchaseRes.data.total_inventory_value || 0
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        }
    };

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/inventory?limit=100&search=${searchQuery}&sort_by=${sortBy}&order=${sortOrder}`);
            const items = res.data.data || [];
            if (items.length > 0) {
                const mappedMeds = items.map(med => ({
                    id: med.id,
                    name: med.name,
                    generic: 'Generic ' + med.name,
                    category: 'General',
                    batch: med.batch_number,
                    expiry: new Date(med.expiry_date).toISOString().split('T')[0],
                    quantity: med.quantity,
                    cost: med.price * 0.7,
                    mrp: med.price,
                    supplier: 'Main Supplier',
                    status: med.status
                }));
                setMedicines(mappedMeds);
            } else {
                setMedicines([]);
            }
        } catch (err) {
            console.error('Failed to fetch inventory:', err);
            setMedicines([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (med = null) => {
        if (med) {
            setEditingMed(med);
            setFormData({
                name: med.name,
                batch_number: med.batch,
                expiry_date: med.expiry ? new Date(med.expiry).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                quantity: med.quantity,
                price: med.mrp
            });
        } else {
            setEditingMed(null);
            setFormData({
                name: '',
                batch_number: '',
                expiry_date: new Date().toISOString().slice(0, 16),
                quantity: 0,
                price: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMed(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'price' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, expiry_date: new Date(formData.expiry_date).toISOString() };
            if (editingMed) {
                await axiosInstance.put(`/inventory/${editingMed.id}`, payload);
                toast.success('Medicine updated successfully!');
            } else {
                await axiosInstance.post('/inventory', payload);
                toast.success('Medicine added successfully!');
            }
            handleCloseModal();
            fetchMedicines();
        } catch (err) {
            toast.error('Failed to save medicine.');
            console.error(err);
        }
    };

    const confirmMarkExpired = async () => {
        try {
            await axiosInstance.patch(`/inventory/${confirmActionMedId}/status`, { status: "Expired" });
            toast.success("Medicine explicitly marked as Expired.");
            setIsConfirmModal(false);
            fetchMedicines();
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Active') return <span className="badge-status badge-completed">{status}</span>;
        if (status === 'Low Stock') return <span className="badge-status badge-low">{status}</span>;
        return <span className="badge-status badge-out">{status}</span>;
    };

    if (loading) return <Loader />;

    return (
        <>
            <div className="top-header">
                <div className="header-titles">
                    <h1>Pharmacy CRM</h1>
                    <p>Manage inventory, sales, and purchase orders</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline" style={{ color: '#0284c7', borderColor: '#bae6fd' }}>
                        <Download size={16} /> Export
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={16} /> Add Medicine
                    </button>
                </div>
            </div>

            <div className="summary-cards-grid">
                {/* Reusing exact layout from Dashboard */}
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-green"><DollarSign size={24} /></div>
                        <div className="card-pill pill-green">+12.5%</div>
                    </div>
                    <div className="value">{formatInr(dashboardData.todaySales)}</div>
                    <div className="label">Today's Sales</div>
                </div>
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-blue"><ShoppingCart size={24} /></div>
                        <div className="card-pill pill-blue">32 Orders</div>
                    </div>
                    <div className="value">{dashboardData.itemsSold}</div>
                    <div className="label">Items Sold Today</div>
                </div>
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-orange"><AlertTriangle size={24} /></div>
                        <div className="card-pill pill-orange">Action Needed</div>
                    </div>
                    <div className="value">{dashboardData.lowStockCount}</div>
                    <div className="label">Low Stock Items</div>
                </div>
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-purple"><Package size={24} /></div>
                        <div className="card-pill pill-purple">5 Pending</div>
                    </div>
                    <div className="value">{formatInr(dashboardData.purchaseSummary)}</div>
                    <div className="label">Purchase Orders</div>
                </div>
            </div>

            <div className="tabs-row">
                <div className="tabs-container">
                    <button className="tab"><ShoppingCart size={16} /> Sales</button>
                    <button className="tab"><Package size={16} /> Purchase</button>
                    <button className="tab active"><FileText size={16} /> Inventory</button>
                </div>
                <div className="tabs-actions">
                    <button className="btn btn-outline">
                        <Plus size={16} /> New Sale
                    </button>
                    <button className="btn btn-outline">
                        <Plus size={16} /> New Purchase
                    </button>
                </div>
            </div>

            <div className="section-cyan">
                <h3 style={{ marginBottom: '1.25rem' }}>Inventory Overview</h3>

                <div className="overview-cards">
                    <div className="mini-card">
                        <div className="mini-card-header">
                            <span>Total Items</span>
                            <Box size={14} color="#0284c7" />
                        </div>
                        <div className="mini-card-value">{medicines.length}</div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-card-header">
                            <span>Active Stock</span>
                            <CheckCircle2 size={14} color="#059669" />
                        </div>
                        <div className="mini-card-value">{medicines.filter(m => m.status === 'Active').length}</div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-card-header">
                            <span>Low Stock</span>
                            <AlertTriangle size={14} color="#d97706" />
                        </div>
                        <div className="mini-card-value">{medicines.filter(m => m.status === 'Low Stock').length}</div>
                    </div>
                    <div className="mini-card">
                        <div className="mini-card-header">
                            <span>Total Value</span>
                            <DollarSign size={14} color="#c026d3" />
                        </div>
                        <div className="mini-card-value">{formatInr(medicines.reduce((sum, med) => sum + (med.quantity * med.mrp), 0))}</div>
                    </div>
                </div>
            </div>

            <div className="flex-split" style={{ marginBottom: '1.25rem' }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>Complete Inventory</h3>
                <div className="flex-split gap-3" style={{ flex: 1, paddingLeft: '4rem' }}>
                    <div className="input-with-icon" style={{ flex: 1, maxWidth: '400px' }}>
                        <Search />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search existing stock..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-split gap-3">
                    <select
                        className="input-field"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="expiry_date">Sort by Expiry Date</option>
                        <option value="quantity">Sort by Quantity</option>
                    </select>
                    <select
                        className="input-field"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                    <button className="btn btn-outline" style={{ padding: '0.6rem 1rem' }}><Filter size={16} /> Filter</button>
                    <button className="btn btn-outline" style={{ padding: '0.6rem 1rem' }}><Download size={16} /> Export</button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>MEDICINE NAME</th>
                            <th>GENERIC NAME</th>
                            <th>CATEGORY</th>
                            <th>BATCH NO</th>
                            <th>EXPIRY DATE</th>
                            <th>QUANTITY</th>
                            <th>COST PRICE</th>
                            <th>MRP</th>
                            <th>SUPPLIER</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medicines.map((med, i) => (
                            <tr key={i}>
                                <td>{med.id}</td>
                                <td className="td-bold" style={{ whiteSpace: 'pre-wrap', width: '120px' }}>{med.name}</td>
                                <td>{med.generic}</td>
                                <td>{med.category}</td>
                                <td style={{ whiteSpace: 'pre-wrap', width: '100px' }}>{med.batch.split('-').join('-\n')}</td>
                                <td>{med.expiry}</td>
                                <td style={{ fontWeight: 600, color: med.quantity === 0 ? '#dc2626' : med.quantity < 50 ? '#d97706' : 'var(--text-dark)' }}>{med.quantity}</td>
                                <td>{formatInr(med.cost)}</td>
                                <td className="td-bold">{formatInr(med.mrp)}</td>
                                <td style={{ whiteSpace: 'pre-wrap', width: '100px' }}>{med.supplier}</td>
                                <td>{getStatusBadge(med.status)}</td>
                                <td>
                                    <div className="flex-split gap-2">
                                        <button
                                            className="btn"
                                            style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem' }}
                                            onClick={() => handleOpenModal(med)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ color: '#dc2626', borderColor: '#fecaca', padding: '0.4rem 0.8rem' }}
                                            onClick={() => {
                                                setConfirmActionMedId(med.id);
                                                setIsConfirmModal(true);
                                            }}
                                        >
                                            Mark Expired
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingMed ? 'Edit Medicine' : 'Add New Medicine'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Medicine Name</label>
                                <input required type="text" className="input-field" name="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Batch Number</label>
                                <input required type="text" className="input-field" name="batch_number" value={formData.batch_number} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input required type="datetime-local" className="input-field" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input required type="number" min="0" className="input-field" name="quantity" value={formData.quantity} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Price / MRP (₹)</label>
                                    <input required type="number" min="0" step="0.01" className="input-field" name="price" value={formData.price} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="flex-split" style={{ marginTop: '2rem', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingMed ? 'Save Changes' : 'Add Medicine'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ marginBottom: '0.5rem' }}>Mark as Expired?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Are you absolutely sure you want to manually mark this batch as expired? This status override cannot be automatically undone.
                        </p>
                        <div className="flex-split" style={{ justifyContent: 'center', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setIsConfirmModal(false)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmMarkExpired}>Confirm Expired</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventory;
