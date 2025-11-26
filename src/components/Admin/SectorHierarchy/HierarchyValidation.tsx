import React from 'react';
import { FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface HierarchyValidationProps {
  errors: string[];
  warnings?: string[];
}

export const HierarchyValidation: React.FC<HierarchyValidationProps> = ({
  errors,
  warnings = []
}) => {
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="validation-container success">
        <div className="validation-item">
          <FiCheckCircle className="icon success" />
          <span>Hierarquia válida</span>
        </div>
      </div>
    );
  }

  return (
    <div className="validation-container">
      {errors.length > 0 && (
        <div className="validation-section errors">
          <h4>
            <FiAlertTriangle className="icon error" />
            Erros ({errors.length})
          </h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="validation-item error">
                <FiAlertTriangle className="icon" />
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="validation-section warnings">
          <h4>
            <FiAlertCircle className="icon warning" />
            Avisos ({warnings.length})
          </h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index} className="validation-item warning">
                <FiAlertCircle className="icon" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};