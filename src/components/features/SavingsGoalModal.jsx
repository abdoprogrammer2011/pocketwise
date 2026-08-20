/**
 * Savings Goal Modal
 * Modal for creating/editing savings goals.
 */

import { useState, useEffect } from 'react';
import { DATE_FORMATS } from '../../constants';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Modal } from '../ui/Modal';

export function SavingsGoalModal({ isOpen, onClose, onSubmit, initialData, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          description: initialData.description || '',
          targetAmount: initialData.targetAmount || '',
          currentAmount: initialData.currentAmount || 0,
          targetDate: initialData.targetDate ? formatDate(initialData.targetDate, DATE_FORMATS.ISO) : '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          targetAmount: '',
          currentAmount: '0',
          targetDate: '',
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter a goal name';
    }
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    if (formData.currentAmount && Number(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    }
    if (formData.targetDate && new Date(formData.targetDate) < new Date()) {
      newErrors.targetDate = 'Target date must be in the future';
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount || 0),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'New Savings Goal'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Goal Name"
          type="text"
          placeholder="e.g., New Bike, Video Game, College Fund"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          required
        />

        <Input
          label="Description (optional)"
          type="text"
          placeholder="What are you saving for?"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="100.00"
            value={formData.targetAmount}
            onChange={(e) => handleChange('targetAmount', e.target.value)}
            onBlur={() => handleBlur('targetAmount')}
            error={touched.targetAmount ? errors.targetAmount : undefined}
            required
          />
          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.currentAmount}
            onChange={(e) => handleChange('currentAmount', e.target.value)}
            onBlur={() => handleBlur('currentAmount')}
            error={touched.currentAmount ? errors.currentAmount : undefined}
          />
        </div>

        <Input
          label="Target Date (optional)"
          type="date"
          value={formData.targetDate}
          onChange={(e) => handleChange('targetDate', e.target.value)}
          onBlur={() => handleBlur('targetDate')}
          error={touched.targetDate ? errors.targetDate : undefined}
          min={formatDate(new Date(), DATE_FORMATS.ISO)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ContributeToGoalModal({ isOpen, onClose, onSubmit, goal, loading = false }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError('');
    }
  }, [isOpen]);

  if (!goal) return null;

  const validate = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (Number(amount) > goal.targetAmount - goal.currentAmount) {
      setError(`Maximum contribution is ${goal.targetAmount - goal.currentAmount}`);
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(Number(amount));
    }
  };

  const remaining = goal.targetAmount - goal.currentAmount;
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add to ${goal.name}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
        </div>

        <Input
          label="Contribution Amount"
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          placeholder={`Max: ${formatCurrency(remaining)}`}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          autoFocus
        />

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Remaining to goal: <span className="font-medium text-gray-900 dark:text-gray-50">{formatCurrency(remaining)}</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Add Contribution
          </Button>
        </div>
      </form>
    </Modal>
  );
}