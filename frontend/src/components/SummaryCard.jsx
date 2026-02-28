import React from 'react';

const SummaryCard = ({ title, value, isCurrency = false }) => {
    return (
        <div className={`summary-card ${isCurrency ? 'currency' : ''}`}>
            <h4 className="summary-card-title">{title}</h4>
            <div className="summary-card-value">
                {isCurrency && typeof value === 'number' ? value.toFixed(2) : value}
            </div>
        </div>
    );
};

export default SummaryCard;
