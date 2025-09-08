import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import WeightChart from './charts/WeightChart';
import Spinner from './common/Spinner';
import { Meal, WaterLog, WeightLog, WorkoutLog } from '../types';
import ProgressSummary from './progress/ProgressSummary';
import MealHistoryList from './progress/MealHistoryList';
import { CalendarIcon, DownloadIcon } from './common/Icons';
import DateRangePickerModal from './DateRangePickerModal';
import WorkoutSummary from './progress/WorkoutSummary';
import WorkoutHistoryList from './progress/WorkoutHistoryList';
import NutritionChart from './charts/NutritionChart';
import CaloriesBurnedChart from './charts/CaloriesBurnedChart';
import WeightHistoryList from './progress/WeightHistoryList';
import { exportToCsv, exportToPdf } from '../utils/exportUtils';
import WaterChart from './charts/WaterChart';
import WaterSummary from './progress/WaterSummary';
import WaterHistoryList from './progress/WaterHistoryList';

type Period = 'week' | 'month' | 'custom';
type ProgressTab = 'nutrition' | 'workouts' | 'weight' | 'water';
type ViewMode = 'summary' | 'chart';

const Progress: React.FC = () => {
  const { allMeals, allWorkouts, weightLogs, allWaterLogs, isLoading } = useData();
  
  const [activePeriod, setActivePeriod] = useState<Period>('week');
  const [dateRange, setDateRange] = useState<{ startDate: Date, endDate: Date }>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    return { startDate, endDate };
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ProgressTab>('nutrition');
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  const setPeriod = (period: Period) => {
    const endDate = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(endDate.getDate() - 6);
    } else if (period === 'month') {
      startDate.setDate(endDate.getDate() - 29);
    }
    setActivePeriod(period);
    setDateRange({ startDate, endDate });
    if (period === 'custom') {
      setIsDatePickerOpen(true);
    }
  };
  
  const handleApplyCustomDate = (start: string, end: string) => {
      // Add timezone offset to prevent date from being off by one day
      const startDate = new Date(new Date(start).valueOf() + new Date().getTimezoneOffset() * 60 * 1000);
      const endDate = new Date(new Date(end).valueOf() + new Date().getTimezoneOffset() * 60 * 1000);
      setDateRange({ startDate, endDate });
      setIsDatePickerOpen(false);
  }

  const { filteredMeals, filteredWorkouts, filteredWeightLogs, filteredWaterLogs } = useMemo(() => {
    const start = dateRange.startDate.setHours(0, 0, 0, 0);
    const end = dateRange.endDate.setHours(23, 59, 59, 999);

    const filterByDate = <T extends { date: string }>(item: T) => {
      const itemDate = new Date(item.date).getTime();
      return itemDate >= start && itemDate <= end;
    };

    return {
      filteredMeals: allMeals.filter(filterByDate),
      filteredWorkouts: allWorkouts.filter(filterByDate),
      filteredWeightLogs: weightLogs.filter(filterByDate),
      filteredWaterLogs: allWaterLogs.filter(filterByDate),
    };
  }, [allMeals, allWorkouts, weightLogs, allWaterLogs, dateRange]);
  
  const handleExport = (format: 'pdf' | 'csv') => {
    setIsExportMenuOpen(false);
    
    let dataToExport: any[];
    let processedDataForCsv;

    switch(activeTab) {
        case 'nutrition':
            dataToExport = filteredMeals;
            if (format === 'csv') {
                processedDataForCsv = dataToExport.map(m => ({
                    date: m.date,
                    meal_type: m.mealType,
                    name: m.name,
                    description: m.description,
                    calories: Math.round(m.macros.calories),
                    protein_g: Math.round(m.macros.protein),
                    carbs_g: Math.round(m.macros.carbs),
                    fat_g: Math.round(m.macros.fat),
                }));
            }
            break;
        case 'workouts':
            dataToExport = filteredWorkouts;
             if (format === 'csv') {
                processedDataForCsv = dataToExport.map(w => ({
                    date: w.date,
                    exercise_type: w.exerciseType,
                    duration_minutes: w.duration,
                    intensity: w.intensity,
                    calories_burned: Math.round(w.caloriesBurned),
                }));
            }
            break;
        case 'weight':
            dataToExport = filteredWeightLogs;
             if (format === 'csv') {
                processedDataForCsv = dataToExport.map(l => ({
                    date: l.date,
                    weight_kg: l.weight,
                }));
            }
            break;
        case 'water':
            dataToExport = filteredWaterLogs;
             if (format === 'csv') {
                processedDataForCsv = dataToExport.map(l => ({
                    date: l.date,
                    water_ml: l.amount,
                }));
            }
            break;
        default:
            dataToExport = [];
    }

    if (format === 'pdf') {
        exportToPdf(dataToExport, activeTab, dateRange);
    } else {
        const filename = `${activeTab}_report_${dateRange.startDate.toISOString().split('T')[0]}_to_${dateRange.endDate.toISOString().split('T')[0]}`;
        exportToCsv(processedDataForCsv || [], filename);
    }
  };


  if (isLoading) {
      return <div className="flex justify-center items-center h-64"><Spinner /></div>
  }
  
  const renderContent = () => {
    if (viewMode === 'chart') {
       switch (activeTab) {
        case 'nutrition':
          return <NutritionChart data={filteredMeals} />;
        case 'workouts':
          return <CaloriesBurnedChart data={filteredWorkouts} />;
        case 'weight':
          return <WeightChart data={filteredWeightLogs} />;
        case 'water':
          return <WaterChart data={filteredWaterLogs} />;
      }
    } else {
       switch (activeTab) {
        case 'nutrition':
          return (
            <>
              {/* FIX: The 'period' prop was hardcoded to "custom", causing a type error. It is now correctly passed from the activePeriod state. */}
              <ProgressSummary meals={filteredMeals} period={activePeriod} />
              <div className="mt-6"><MealHistoryList meals={filteredMeals} /></div>
            </>
          );
        case 'workouts':
           return (
            <>
              <WorkoutSummary workouts={filteredWorkouts} />
              <div className="mt-6"><WorkoutHistoryList workouts={filteredWorkouts} /></div>
            </>
          );
        case 'weight':
          return (
            <>
              <p className="text-center mb-4"><span className="font-bold">{filteredWeightLogs.length}</span> entries found for this period.</p>
              <WeightHistoryList weightLogs={filteredWeightLogs} />
            </>
          );
        case 'water':
          return (
            <>
              <WaterSummary waterLogs={filteredWaterLogs} />
              <div className="mt-6"><WaterHistoryList waterLogs={filteredWaterLogs} /></div>
            </>
          );
      }
    }
  }

  const periodButtons: { id: Period, label: string }[] = [
      { id: 'week', label: 'This Week'},
      { id: 'month', label: 'This Month'},
  ]

  const tabButtons: { id: ProgressTab, label: string }[] = [
      { id: 'nutrition', label: 'Nutrition' },
      { id: 'workouts', label: 'Workouts' },
      { id: 'weight', label: 'Weight' },
      { id: 'water', label: 'Water' },
  ]
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Progress</h1>
        <div className="relative" ref={exportMenuRef}>
            <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                Export
            </button>
            {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                    >
                        Export as PDF
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
                    >
                        Export as CSV
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {isDatePickerOpen && 
        <DateRangePickerModal 
          onClose={() => setIsDatePickerOpen(false)} 
          onApply={handleApplyCustomDate}
          initialStartDate={dateRange.startDate}
          initialEndDate={dateRange.endDate}
        />
      }

      {/* Period Filter */}
      <div className="grid grid-cols-3 gap-2">
          {periodButtons.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} className={`py-2 text-sm font-medium rounded-md transition-colors ${activePeriod === p.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {p.label}
              </button>
          ))}
          <button onClick={() => setPeriod('custom')} className={`py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${activePeriod === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
             <CalendarIcon className="w-4 h-4 mr-2"/> Custom
          </button>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabButtons.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.label}
            </button>
        ))}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow min-h-[400px]">
          {/* View Mode Toggle */}
          <div className="flex justify-end mb-4">
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 w-48">
                {(['summary', 'chart'] as ViewMode[]).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} className={`w-full py-1 text-sm font-medium rounded-md transition-colors ${viewMode === mode ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
          </div>
          {renderContent()}
      </div>
    </div>
  );
};

export default Progress;