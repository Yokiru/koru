import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ value, onChange, options, name, label, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="form-group">
            {label && (
                <label>
                    {Icon && <Icon size={16} />}
                    {label}
                </label>
            )}
            <div className="custom-select-wrapper" ref={dropdownRef}>
                <button
                    type="button"
                    className={`custom-select-btn ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{selectedOption?.label || 'Select...'}</span>
                    <ChevronDown
                        size={16}
                        className={`dropdown-icon ${isOpen ? 'rotate' : ''}`}
                    />
                </button>

                {isOpen && (
                    <div className="custom-select-menu">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`select-option ${value === option.value ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                                onClick={() => !option.disabled && handleSelect(option.value)}
                                disabled={option.disabled}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
