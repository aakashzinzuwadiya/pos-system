import React, { useState } from 'react';

interface DateFilterProps {
    onFilter: (startDate: string, endDate: string) => void;
    onExport: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilter, onExport }) => {
    // Get today's date in the YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Initialize the state with today's date
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [error, setError] = useState('');

    // Handle date changes and validate range
    const handleStartDateChange = (date: string) => {
        setStartDate(date);
        validateDateRange(date, endDate);
    };

    const handleEndDateChange = (date: string) => {
        setEndDate(date);
        validateDateRange(startDate, date);
    };

    // Validate date range to ensure end date is not before start date
    const validateDateRange = (start: string, end: string) => {
        if (new Date(start) > new Date(end)) {
            setError('End date cannot be earlier than start date.');
        } else {
            setError('');
        }
    };

    // Reset dates to today's date and clear error
    const handleReset = () => {
        setStartDate(today);
        setEndDate(today);
        setError('');
        onFilter(today, today);
    };

    return (
        <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center space-x-4">
                <div>
                    <label className="block text-gray-700">Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                </div>
                <div className="flex space-x-2 ml-auto justify-end">
                    {!error && (
                        <>
                            <button
                                onClick={() => onFilter(startDate, endDate)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
                            >
                                Filter
                            </button><button
                                onClick={onExport}
                                className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
                            >
                                Export CSV
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
                    >
                        Reset
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default DateFilter;
