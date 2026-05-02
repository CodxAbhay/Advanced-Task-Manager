import './Input.css';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  required = false,
  disabled = false,
  id,
  name,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-field ${icon ? 'input-with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
