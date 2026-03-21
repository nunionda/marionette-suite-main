'use client';

import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle } from 'lucide-react';

const STEPS = [
  'Parsing screenplay...',
  'Extracting features...',
  'Analyzing emotions...',
  'Generating beat sheet...',
  'Predicting rating & ROI...',
  'Running coverage analysis...',
  'Analyzing production feasibility...',
  'Identifying tropes & comp films...',
];

export default function AnalysisProgress() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel analysis-progress">
      <h3 className="panel-heading">
        <Loader size={20} className="spin section-icon" />
        Analyzing Script...
      </h3>
      <div className="progress-steps">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`progress-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}
          >
            {i < currentStep ? (
              <CheckCircle size={16} className="progress-step-icon text-success" />
            ) : i === currentStep ? (
              <Loader size={16} className="spin progress-step-icon" />
            ) : (
              <span className="progress-step-dot" />
            )}
            <span>{step}</span>
          </div>
        ))}
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
