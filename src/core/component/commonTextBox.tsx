import React from "react";

interface TextBoxProps {
  label?: string;
  name: string; // Explicitly defining the type for name
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  icon?: React.ElementType;
  [key: string]: any; // Allowing additional props
}

const TextBox: React.FC<TextBoxProps> = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  icon: Icon = null,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition duration-200 ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          } ${inputClassName}`}
          {...props}
        />
      </div>
      {error && (
        <p
          className={`mt-1 text-sm text-red-600 ${errorClassName}`}
          id={`${name}-error`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default TextBox;
