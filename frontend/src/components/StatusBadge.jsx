import React from 'react';

const StatusBadge = ({ status }) => {
    let badgeClass = 'status-badge ';

    switch (status) {
        case 'Active':
            badgeClass += 'status-active';
            break;
        case 'Low Stock':
            badgeClass += 'status-low';
            break;
        case 'Expired':
            badgeClass += 'status-expired';
            break;
        case 'Out of Stock':
            badgeClass += 'status-out';
            break;
        default:
            badgeClass += 'status-active';
    }

    return (
        <span className={badgeClass}>
            {status}
        </span>
    );
};

export default StatusBadge;
