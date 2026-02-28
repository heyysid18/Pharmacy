import React from 'react';
import StatusBadge from './StatusBadge';

const MedicineTable = ({ medicines, onEdit, onStatusChange }) => {
    if (!medicines || medicines.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No medicines found.</div>;
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Batch No.</th>
                        <th>Expiry Date</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.map((med) => (
                        <tr key={med.id}>
                            <td style={{ fontWeight: 500, color: 'var(--secondary)' }}>{med.name}</td>
                            <td>{med.batch_number}</td>
                            <td>{new Date(med.expiry_date).toLocaleDateString()}</td>
                            <td>{med.quantity}</td>
                            <td>${med.price.toFixed(2)}</td>
                            <td><StatusBadge status={med.status} /></td>
                            <td>
                                <button
                                    className="btn"
                                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', marginRight: '0.5rem' }}
                                    onClick={() => onEdit(med)}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MedicineTable;
