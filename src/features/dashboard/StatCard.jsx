import React from 'react';
import Card from '../../components/Card';

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, onClick }) => (
    <Card
        className="flex-1 stat-card-btn"
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div
                style={{
                    backgroundColor: `${color === 'primary' ? 'var(--primary)' :
                        color === 'danger' ? 'var(--danger)' :
                            'var(--success)'}20`,
                    color: color === 'primary' ? 'var(--primary)' :
                        color === 'danger' ? 'var(--danger)' :
                            'var(--success)',
                    padding: '1rem',
                    borderRadius: '50%',
                    display: 'flex'
                }}
            >
                <Icon size={32} />
            </div>
            <div>
                <span className="text-sm text-muted" style={{ display: 'block' }}>{title}</span>
                <span className="font-bold" style={{ fontSize: '2rem', lineHeight: 1, display: 'block' }}>{value}</span>
                {trend && (
                    <span
                        className="text-sm"
                        style={{
                            display: 'block',
                            color: trendUp ? 'var(--success)' : 'var(--danger)',
                            marginTop: '0.25rem'
                        }}
                    >
                        {trend}
                    </span>
                )}
            </div>
        </div>
    </Card>
);

export default StatCard;
