import React, { useState } from 'react';
import Spinner from './common/Spinner';

interface SuggestMealPromptProps {
  onClose: () => void;
  onSuggest: (preferences: string) => Promise<void>;
}

const SuggestMealPrompt: React.FC<SuggestMealPromptProps> = ({ onClose, onSuggest }) => {
  const [preferences, setPreferences] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setIsLoading(true);
    await onSuggest(preferences);
    setIsLoading(false);
    // The parent component will handle closing on success
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Suggest a Meal</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          What are you in the mood for? Let me know what ingredients you have or any dietary preferences.
        </p>
        <textarea
          placeholder="e.g., 'I have chicken and broccoli, and I want something low-carb.'"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          rows={4}
          required
          autoFocus
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">Cancel</button>
          <button type="submit" disabled={isLoading || !preferences} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-yellow-300 flex items-center justify-center min-w-[150px]">
            {isLoading ? <Spinner /> : 'Get Suggestion'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestMealPrompt;