import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Meal, WeightLog, WorkoutLog, WaterLog } from '../types';
import { formatDate } from './dateUtils';

// A type guard or union type for the data would be good.
type ReportData = Meal[] | WorkoutLog[] | WeightLog[] | WaterLog[];
type DataType = 'nutrition' | 'workouts' | 'weight' | 'water';

const formatDateForFilename = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateFilename = (type: DataType, startDate: Date, endDate: Date) => {
    return `${type}_report_${formatDateForFilename(startDate)}_to_${formatDateForFilename(endDate)}`;
}

/**
 * Generates and downloads a CSV file from an array of objects.
 * @param data The data array.
 * @param filename The name of the file to download.
 */
export const exportToCsv = (data: Record<string, any>[], filename: string) => {
  if (data.length === 0) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let cell = row[header] === null || row[header] === undefined ? '' : row[header];
        cell = String(cell).replace(/"/g, '""'); // Escape double quotes
        if (String(cell).includes(',')) {
          cell = `"${cell}"`; // Enclose in double quotes if it contains a comma
        }
        return cell;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


/**
 * Generates and downloads a PDF report.
 * @param data The filtered data array.
 * @param type The type of data ('nutrition', 'workouts', 'weight').
 * @param dateRange The selected date range.
 */
export const exportToPdf = (
  data: ReportData,
  type: DataType,
  dateRange: { startDate: Date, endDate: Date }
) => {
  if (data.length === 0) {
    alert("No data to export.");
    return;
  }

  const doc = new jsPDF();
  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
  const dateStr = `${formatDate(dateRange.startDate.toISOString())} to ${formatDate(dateRange.endDate.toISOString())}`;
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.text(dateStr, 14, 30);
  
  let head: string[][] = [];
  let body: (string | number)[][] = [];
  const filename = generateFilename(type, dateRange.startDate, dateRange.endDate);

  switch (type) {
    case 'nutrition':
      head = [['Date', 'Type', 'Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)']];
      body = (data as Meal[]).map(m => [
        formatDate(m.date),
        m.mealType,
        m.name,
        Math.round(m.macros.calories),
        Math.round(m.macros.protein),
        Math.round(m.macros.carbs),
        Math.round(m.macros.fat)
      ]);
      break;
    
    case 'workouts':
      head = [['Date', 'Exercise', 'Duration (min)', 'Intensity', 'Calories Burned']];
      body = (data as WorkoutLog[]).map(w => [
        formatDate(w.date),
        w.exerciseType,
        w.duration,
        w.intensity,
        Math.round(w.caloriesBurned)
      ]);
      break;

    case 'weight':
      head = [['Date', 'Weight (kg)']];
      body = (data as WeightLog[]).map(l => [
        formatDate(l.date),
        l.weight
      ]);
      break;

    case 'water':
      head = [['Date', 'Intake (ml)']];
      body = (data as WaterLog[]).map(l => [
        formatDate(l.date),
        l.amount
      ]);
      break;
  }

  autoTable(doc, {
    startY: 35,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] } // indigo-600
  });

  doc.save(`${filename}.pdf`);
};