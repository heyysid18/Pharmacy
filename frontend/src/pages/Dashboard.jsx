import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Loader from '../components/Loader';
import {
    Download, Plus, TrendingUp, ShoppingCart,
    AlertTriangle, Package, Search, DollarSign,
    FileText
} from 'lucide-react';

// Format Indian Rupee currency
const formatInr = (num) => {
    return '₹' + num.toLocaleString('en-IN');
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        todaySales: 0,
        itemsSold: 0,
        lowStockCount: 0,
        purchaseSummary: 0,
        recentSales: []
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [saleQty, setSaleQty] = useState(1);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [salesRes, itemsRes, lowStockRes, purchaseRes, recentRes] = await Promise.all([
                axiosInstance.get('/dashboard/today-sales'),
                axiosInstance.get('/dashboard/items-sold'),
                axiosInstance.get('/dashboard/low-stock'),
                axiosInstance.get('/dashboard/purchase-summary'),
                axiosInstance.get('/dashboard/recent-sales')
            ]);

            setData({
                todaySales: salesRes.data.today_sales || 0,
                itemsSold: itemsRes.data.items_sold || 0,
                lowStockCount: lowStockRes.data.low_stock_count || 0,
                purchaseSummary: purchaseRes.data.total_inventory_value || 0,
                recentSales: recentRes.data || []
            });
            setError(null);
        } catch (err) {
            console.error(err);
            setData({
                todaySales: 0,
                itemsSold: 0,
                lowStockCount: 0,
                purchaseSummary: 0,
                recentSales: []
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNewSale = async () => {
        if (!searchQuery) return alert("Please enter a medicine ID to sell");
        if (!saleQty || saleQty < 1) return alert("Please enter a valid quantity");

        try {
            const medId = parseInt(searchQuery, 10);
            if (isNaN(medId)) return alert("Please enter a numeric Medicine ID");

            const res = await axiosInstance.post(`/dashboard/dummy-sale?medicine_id=${medId}&qty=${saleQty}`);
            if (res.data.msg.includes("Failed")) {
                alert(res.data.msg);
            } else {
                alert(`Sale recorded successfully! Sold ${saleQty} items.`);
                setSearchQuery("");
                setSaleQty(1);
                fetchDashboardData();
            }
        } catch (err) {
            console.error(err);
            alert("Error processing sale");
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

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
                    <button className="btn btn-primary">
                        <Plus size={16} /> Add Medicine
                    </button>
                </div>
            </div>

            <div className="summary-cards-grid">
                {/* Card 1 */}
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-green">
                            <DollarSign size={24} />
                        </div>
                        <div className="card-pill pill-green">
                            <TrendingUp size={12} /> +12.5%
                        </div>
                    </div>
                    <div className="value">{formatInr(data.todaySales)}</div>
                    <div className="label">Today's Sales</div>
                </div>

                {/* Card 2 */}
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-blue">
                            <ShoppingCart size={24} />
                        </div>
                        <div className="card-pill pill-blue">
                            32 Orders
                        </div>
                    </div>
                    <div className="value">{data.itemsSold}</div>
                    <div className="label">Items Sold Today</div>
                </div>

                {/* Card 3 */}
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-orange">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="card-pill pill-orange">
                            Action Needed
                        </div>
                    </div>
                    <div className="value">{data.lowStockCount}</div>
                    <div className="label">Low Stock Items</div>
                </div>

                {/* Card 4 */}
                <div className="summary-card">
                    <div className="card-top-row">
                        <div className="card-icon-box icon-box-purple">
                            <Package size={24} />
                        </div>
                        <div className="card-pill pill-purple">
                            5 Pending
                        </div>
                    </div>
                    <div className="value">{formatInr(data.purchaseSummary)}</div>
                    <div className="label">Purchase Orders</div>
                </div>
            </div>

            <div className="tabs-row">
                <div className="tabs-container">
                    <button className="tab active"><ShoppingCart size={16} /> Sales</button>
                    <button className="tab"><Package size={16} /> Purchase</button>
                    <button className="tab" onClick={() => navigate('/inventory')}><FileText size={16} /> Inventory</button>
                </div>
                <div className="tabs-actions">
                    <button className="btn btn-primary" onClick={() => document.querySelector('.input-with-icon input').focus()}>
                        <Plus size={16} /> New Sale
                    </button>
                    <button className="btn btn-outline" onClick={() => navigate('/inventory')}>
                        <Plus size={16} /> New Purchase
                    </button>
                </div>
            </div>

            <div className="section-cyan">
                <h3>Make a Sale</h3>
                <p className="sub-text">Select medicines from inventory</p>

                <div className="inputs-row">
                    <input type="text" className="input-field" placeholder="Patient Id" style={{ maxWidth: '150px' }} />
                    <div className="input-with-icon" style={{ flex: 2 }}>
                        <Search />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Medicine ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="input-with-icon" style={{ flex: 1, paddingLeft: '0.5rem' }}>
                        <input
                            type="number"
                            min="1"
                            className="input-field"
                            placeholder="Qty"
                            value={saleQty}
                            onChange={(e) => setSaleQty(e.target.value)}
                            style={{ paddingLeft: '1rem' }}
                        />
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', marginLeft: '0.5rem' }}>Enter</button>
                    <button className="btn btn-danger" onClick={handleNewSale} style={{ padding: '0.75rem 2rem', marginLeft: 'auto' }}>Bill</button>
                </div>

                <div className="cyan-headers">
                    <span style={{ flex: 1.5 }}>MEDICINE NAME</span>
                    <span style={{ flex: 1.5 }}>GENERIC NAME</span>
                    <span>BATCH NO</span>
                    <span>EXPIRY DATE</span>
                    <span>QUANTITY</span>
                    <span>MRP / PRICE</span>
                    <span>SUPPLIER</span>
                    <span>STATUS</span>
                    <span>ACTIONS</span>
                </div>
            </div>

            <div className="recent-sales-section">
                <h3 className="section-title">Recent Sales</h3>

                <div className="list-container">
                    {data.recentSales.map((sale, i) => (
                        <div className="list-item" key={i}>
                            <div className="item-icon-wrapper">
                                <ShoppingCart size={20} />
                            </div>
                            <div className="item-details">
                                <div className="item-title">INV-{sale.id}</div>
                                <div className="item-subtitle">{sale.medicine_name}</div>
                            </div>
                            <div className="item-meta">
                                <div className="item-meta-title">{formatInr(sale.amount)}</div>
                                <div className="item-meta-subtitle">{sale.date}</div>
                            </div>
                            <div className="badge-status badge-completed">
                                Completed
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
