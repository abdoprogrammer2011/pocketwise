/**
 * Expense Modal
 * Modal for adding/editing expenses with category selection and validation.
 */

import { useState, useEffect, useRef } from 'react';
import { EXPENSE_CATEGORIES } from '../../constants';
import { DATE_FORMATS } from '../../constants';
import { formatDate } from '../../utils/helpers';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Modal, ConfirmDialog } from '../ui/Modal';
import Badge from '../ui/Badge';

export function ExpenseModal({ isOpen, onClose, onSubmit, initialData, loading = false }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: formatDate(new Date(), DATE_FORMATS.ISO),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const amountRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          amount: initialData.amount || '',
          category: initialData.category || 'food',
          description: initialData.description || '',
          date: initialData.date ? formatDate(initialData.date, DATE_FORMATS.ISO) : formatDate(new Date(), DATE_FORMATS.ISO),
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          amount: '',
          category: 'food',
          description: '',
          date: formatDate(new Date(), DATE_FORMATS.ISO),
          notes: '',
        });
      }
      setErrors({});
      setTouched({});
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field] && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        amount: Number(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: new Date(formData.date),
        notes: formData.notes.trim(),
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Expense' : 'Add Expense'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            ref={amountRef}
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            onBlur={() => handleBlur('amount')}
            error={touched.amount ? errors.amount : undefined}
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={() => handleBlur('date')}
            error={touched.date ? errors.date : undefined}
            required
            max={formatDate(new Date(), DATE_FORMATS.ISO)}
          />
        </div>

        <Input
          label="Description"
          type="text"
          placeholder="What did you buy?"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          error={touched.description ? errors.description : undefined}
          required
        />

        <div>
          <label className="input-label">Category</label>
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Expense category">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="radio"
                aria-checked={formData.category === cat.id}
                onClick={() => handleChange('category', cat.id)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                  formData.category === cat.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`${cat.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-lg ${cat.textColor}`} data-lucide={cat.icon} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
          {touched.category && errors.category && (
            <p className="error-text" role="alert">{errors.category}</p>
          )}
        </div>

        <Input
          label="Notes (optional)"
          type="text"
          placeholder="Any additional details..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteExpenseConfirm({ isOpen, onClose, onConfirm, loading = false }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Expense"
      message="Are you sure you want to delete this expense? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      loading={loading}
    />
  );
}