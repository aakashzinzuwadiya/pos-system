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
                        max={today}
                    />
                </div>
                <div>
                    <label className="block text-gray-700">End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="p-2 border rounded-md"
                        max={today}
                    />
                </div>
                <div className="flex justify-end space-x-2 ml-auto">
                    {!error && (
                        <>
                            <button
                                onClick={() => onFilter(startDate, endDate)}
                                className="bg-blue-500 hover:bg-blue-600 shadow px-4 py-2 rounded-md text-white transition"
                            >
                                Filter
                            </button><button
                                onClick={onExport}
                                className="bg-green-500 hover:bg-green-600 shadow px-4 py-2 rounded-md text-white transition"
                            >
                                Export CSV
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleReset}
                        className="bg-gray-500 hover:bg-gray-600 shadow px-4 py-2 rounded-md text-white transition"
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
