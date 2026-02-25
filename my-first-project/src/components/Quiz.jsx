import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const steps = [
    {
        id: 'age',
        title: 'How old are you?',
        subtitle: 'This helps us determine which plans you qualify for.',
        type: 'input',
        inputType: 'number',
        placeholder: 'Enter your age',
        key: 'age'
    },
    {
        id: 'coverage',
        title: 'Do you currently have life insurance?',
        subtitle: 'Existing coverage often makes you eligible for better rates.',
        type: 'options',
        options: ['Yes, I have coverage', 'No, I am looking for a new plan', 'I am not sure'],
        key: 'hasCoverage'
    },
    {
        id: 'zipcode',
        title: 'What is your zipcode?',
        subtitle: 'Rates vary by state and local area.',
        type: 'input',
        inputType: 'text',
        placeholder: '5-digit zipcode',
        key: 'zip'
    }
];

const Quiz = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        age: '',
        hasCoverage: '',
        zip: ''
    });
    const [isFinished, setIsFinished] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [steps[currentStep].key]: e.target.value });
    };

    const handleOptionSelect = (option) => {
        setFormData({ ...formData, [steps[currentStep].key]: option });
        setTimeout(() => nextStep(), 300);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsFinished(true);
        }
    };

    const isQualified = () => {
        const age = parseInt(formData.age);
        return age >= 50 && age <= 85;
    };

    if (isFinished) {
        const qualified = isQualified();
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="quiz-card result-container"
            >
                {qualified ? (
                    <>
                        <CheckCircle size={64} className="icon-success" />
                        <h2 className="question-title">Great News! You Qualify</h2>
                        <p className="question-subtitle">
                            Based on your answers, you are eligible for Harborway Life's final expense plans. Speak with an agent now to lock in your rate.
                        </p>
                        <a href="tel:18005550199" className="phone-link">1-800-555-0199</a>
                        <button className="cta-button">
                            <Phone size={20} /> Call Now to Secure Rates
                        </button>
                    </>
                ) : (
                    <>
                        <AlertCircle size={64} style={{ color: '#64748B', marginBottom: '1.5rem' }} />
                        <h2 className="question-title">Thank You</h2>
                        <p className="question-subtitle">
                            Unfortunately, we may not have a plan that fits your current profile. We appreciate your interest in Harborway Life.
                        </p>
                        <button className="cta-button" onClick={() => window.location.reload()}>
                            Back to Home
                        </button>
                    </>
                )}
            </motion.div>
        );
    }

    const step = steps[currentStep];
    const progress = ((currentStep) / steps.length) * 100;

    return (
        <div className="quiz-card">
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <h2 className="question-title">{step.title}</h2>
                    <p className="question-subtitle">{step.subtitle}</p>

                    {step.type === 'input' && (
                        <div className="input-group">
                            <input
                                type={step.inputType}
                                className="input-field"
                                placeholder={step.placeholder}
                                value={formData[step.key]}
                                onChange={handleInputChange}
                                autoFocus
                            />
                            <button
                                className="cta-button"
                                onClick={nextStep}
                                disabled={!formData[step.key]}
                            >
                                Continue <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {step.type === 'options' && (
                        <div className="options-grid">
                            {step.options.map((option) => (
                                <button
                                    key={option}
                                    className={`option-button ${formData[step.key] === option ? 'selected' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option}
                                    <ChevronRight size={18} opacity={0.5} />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Quiz;
