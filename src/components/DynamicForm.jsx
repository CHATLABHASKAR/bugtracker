import React from 'react';
import { createPortal } from 'react-dom';

/**
 * DynamicForm - A reusable form component that can handle various field types
 * 
 * @param {Object} props
 * @param {Array} props.fields - Array of field configurations
 * @param {Object} props.formData - Current form data object
 * @param {Function} props.onChange - Handler for field changes: (fieldName, value) => void
 * @param {Function} props.onSubmit - Form submit handler: (e) => void
 * @param {Function} props.onCancel - Cancel handler: () => void
 * @param {String} props.title - Form title
 * @param {String} props.submitLabel - Submit button label
 * @param {String} props.cancelLabel - Cancel button label
 * @param {Boolean} props.isModal - Whether to render as modal overlay
 * @param {Boolean} props.loading - Loading state
 * @param {Number} props.gridCols - Number of columns for grid layout (default: 2)
 */
const DynamicForm = ({
    fields = [],
    formData = {},
    onChange,
    onSubmit,
    onCancel,
    title = "Form",
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    isModal = true,
    loading = false,
    gridCols = 2,
    icon = null,
    iconColor = "blue"
}) => {
    const handleFieldChange = (fieldName, value) => {
        if (onChange) {
            onChange(fieldName, value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    const renderField = (field) => {
        const {
            name,
            type = 'text',
            label,
            placeholder,
            required = false,
            options = [],
            rows = 3,
            accept,
            multiple = false,
            disabled = false,
            colSpan = 1,
            render
        } = field;

        const value = formData[name] || '';
        const fieldId = `field-${name}`;
        const baseInputClasses = "w-full border border-slate-300 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white";

        // Custom render function
        if (render) {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    {render(value, (val) => handleFieldChange(name, val), formData)}
                </div>
            );
        }

        // Text input
        if (type === 'text' || type === 'email' || type === 'number') {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    <input
                        id={fieldId}
                        type={type}
                        className={baseInputClasses}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => handleFieldChange(name, e.target.value)}
                        required={required}
                        disabled={disabled}
                    />
                </div>
            );
        }

        // Textarea
        if (type === 'textarea') {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    <textarea
                        id={fieldId}
                        className={baseInputClasses}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => handleFieldChange(name, e.target.value)}
                        rows={rows}
                        required={required}
                        disabled={disabled}
                    />
                </div>
            );
        }

        // Select dropdown
        if (type === 'select') {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    <select
                        id={fieldId}
                        className={baseInputClasses}
                        value={value || ''}
                        onChange={(e) => handleFieldChange(name, e.target.value)}
                        required={required}
                        disabled={disabled}
                    >
                        {(placeholder || field.placeholder) && <option value="">{placeholder || 'Select...'}</option>}
                        {options.map((option) => {
                            if (typeof option === 'string') {
                                return <option key={option} value={option}>{option}</option>;
                            }
                            return <option key={option.value} value={option.value}>{option.label}</option>;
                        })}
                    </select>
                </div>
            );
        }

        // Date input
        if (type === 'date') {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    <input
                        id={fieldId}
                        type="date"
                        className={baseInputClasses}
                        value={value}
                        onChange={(e) => handleFieldChange(name, e.target.value)}
                        required={required}
                        disabled={disabled}
                    />
                </div>
            );
        }

        // File input
        if (type === 'file') {
            return (
                <div key={name} className={`col-span-${colSpan} md:col-span-${colSpan}`}>
                    {label && (
                        <label htmlFor={fieldId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            {label} {required && <span className="text-red-500">*</span>}
                        </label>
                    )}
                    <input
                        id={fieldId}
                        type="file"
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        accept={accept}
                        multiple={multiple}
                        onChange={(e) => {
                            const MAX_FILE_SIZE = 75 * 1024; // 75KB limit due to backend constraints

                            if (multiple) {
                                const files = Array.from(e.target.files);
                                const validFiles = files.filter(file => {
                                    if (file.size > MAX_FILE_SIZE) {
                                        alert(`File "${file.name}" is too large (${(file.size / 1024).toFixed(1)}KB). strict server limit is 75KB.`);
                                        return false;
                                    }
                                    return true;
                                });

                                if (validFiles.length === 0 && files.length > 0) return; // All rejected

                                const filePromises = validFiles.map(file => new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve({ name: file.name, url: reader.result });
                                    reader.readAsDataURL(file);
                                }));
                                Promise.all(filePromises).then(newFiles => {
                                    const currentFiles = formData[name] || [];
                                    handleFieldChange(name, [...currentFiles, ...newFiles]);
                                });
                            } else {
                                const file = e.target.files[0];
                                if (file) {
                                    if (file.size > MAX_FILE_SIZE) {
                                        alert(`File "${file.name}" is too large (${(file.size / 1024).toFixed(1)}KB). strict server limit is 75KB.`);
                                        e.target.value = ''; // Reset input
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleFieldChange(name, { name: file.name, url: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }
                        }}
                        required={required}
                        disabled={disabled}
                    />
                    {value && Array.isArray(value) && value.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600 font-medium">
                            {value.length} file(s) selected
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    const formContent = (
        <form onSubmit={handleSubmit} className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>
            {fields.map(renderField)}
            <div className={`col-span-1 md:col-span-${gridCols} flex flex-col-reverse md:flex-row justify-end gap-3 pt-2 border-t border-slate-100 mt-2`}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full md:w-auto px-5 py-2 text-slate-600 bg-slate-100 rounded hover:bg-slate-200 text-sm font-medium transition-colors"
                        disabled={loading}
                    >
                        {cancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : submitLabel}
                </button>
            </div>
        </form>
    );

    if (isModal) {
        return createPortal(
            <div
                className="fixed inset-0 flex items-center justify-center z-[100] p-4"
                style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                onClick={onCancel}
            >
                <div
                    className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl animate-fade-in-down max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        {icon && <span className={`material-icons text-${iconColor}-600`}>{icon}</span>}
                        {title}
                    </h2>
                    {formContent}
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                {icon && <span className={`material-icons text-${iconColor}-600`}>{icon}</span>}
                {title}
            </h2>
            {formContent}
        </div>
    );
};

export default DynamicForm;
