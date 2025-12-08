import React from 'react';
import './Skeleton.css';

/**
 * Reusable Skeleton component for loading states
 * 
 * Usage:
 * <Skeleton width="100%" height="20px" />
 * <Skeleton variant="circle" width="40px" height="40px" />
 * <Skeleton variant="card" />
 */
const Skeleton = ({
    width = '100%',
    height = '20px',
    variant = 'text', // 'text', 'circle', 'card', 'button'
    className = '',
    count = 1
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circle':
                return { borderRadius: '50%' };
            case 'card':
                return {
                    width: width || '100%',
                    height: height || '120px',
                    borderRadius: '12px'
                };
            case 'button':
                return {
                    width: width || '100px',
                    height: height || '40px',
                    borderRadius: '8px'
                };
            default:
                return { borderRadius: '4px' };
        }
    };

    const skeletons = Array(count).fill(null);

    return (
        <>
            {skeletons.map((_, index) => (
                <div
                    key={index}
                    className={`skeleton ${className}`}
                    style={{
                        width,
                        height,
                        ...getVariantStyles()
                    }}
                />
            ))}
        </>
    );
};

/**
 * Pre-built skeleton layouts for common use cases
 */
export const SkeletonQuizCard = () => (
    <div className="skeleton-quiz-card">
        <div className="skeleton-quiz-header">
            <Skeleton width="70%" height="20px" />
            <Skeleton width="50px" height="24px" variant="button" />
        </div>
        <div className="skeleton-quiz-meta">
            <Skeleton width="60px" height="22px" variant="button" />
            <Skeleton width="80px" height="22px" variant="button" />
            <Skeleton width="90px" height="22px" variant="button" />
        </div>
        <Skeleton width="100px" height="14px" />
    </div>
);

export const SkeletonHistoryItem = () => (
    <div className="skeleton-history-item">
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton width="80%" height="16px" />
    </div>
);

export default Skeleton;
