import React from 'react';
import { X, Check, Crown, Zap, Sparkles } from 'lucide-react';
import './PlanModal.css';

const PlanModal = ({ isOpen, onClose, currentPlan = 'free' }) => {
    if (!isOpen) return null;

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 'Rp 0',
            period: '',
            icon: Zap,
            description: 'Perfect for getting started',
            features: [
                '5 generations per day',
                '3 quizzes per month',
                'Basic AI model',
                'Community support'
            ],
            buttonText: 'Current Plan',
            highlighted: false
        },
        {
            id: 'plus',
            name: 'Plus',
            price: 'Rp 29.000',
            period: '/month',
            icon: Sparkles,
            description: 'For regular learners',
            features: [
                '20 generations per day',
                '15 quizzes per month',
                'Advanced AI model',
                'Priority support'
            ],
            buttonText: 'Upgrade to Plus',
            highlighted: false
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 'Rp 79.000',
            period: '/month',
            icon: Crown,
            description: 'Unlimited learning power',
            features: [
                'Unlimited generations',
                'Unlimited quizzes',
                'Best AI model',
                'Priority support',
                'Early access to features'
            ],
            buttonText: 'Upgrade to Premium',
            highlighted: true
        }
    ];

    const handleUpgrade = (planId) => {
        // TODO: Implement payment integration
        console.log('Upgrade to:', planId);
        alert('Payment integration coming soon!');
    };

    return (
        <div className="plan-modal-overlay" onClick={onClose}>
            <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
                <button className="plan-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="plan-modal-header">
                    <h2 className="plan-modal-title">Choose Your Plan</h2>
                    <p className="plan-modal-subtitle">
                        Unlock more features and supercharge your learning
                    </p>
                </div>

                <div className="plan-cards">
                    {plans.map((plan) => {
                        const IconComponent = plan.icon;
                        const isCurrentPlan = currentPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`plan-card ${plan.highlighted ? 'highlighted' : ''} ${isCurrentPlan ? 'current' : ''}`}
                            >
                                {plan.highlighted && (
                                    <div className="plan-badge">Most Popular</div>
                                )}

                                <div className="plan-icon">
                                    <IconComponent size={24} />
                                </div>

                                <h3 className="plan-name">{plan.name}</h3>

                                <div className="plan-price">
                                    <span className="price-amount">{plan.price}</span>
                                    <span className="price-period">{plan.period}</span>
                                </div>

                                <p className="plan-description">{plan.description}</p>

                                <ul className="plan-features">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="plan-feature">
                                            <Check size={16} className="feature-check" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`plan-button ${isCurrentPlan ? 'current' : ''} ${plan.highlighted ? 'highlighted' : ''}`}
                                    onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PlanModal;
