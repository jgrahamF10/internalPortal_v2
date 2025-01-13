'use client';
import { useState } from 'react';
import { MonthView } from './MonthView';
import { TaskList } from './TaskList';
import { Task } from '@/types/calendar';
import { getDateRange, formatDate } from '@/lib/dateUtils';
import { Button } from "@/components/ui/button"
import { CalendarIcon } from 'lucide-react'
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"

// Mock data for tasks (unchanged)
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix AC Unit',
    date: new Date(2024, 11, 15, 10, 0),
    description: 'Repair faulty AC unit at 123 Main St.'
  },
  {
    id: '2',
    title: 'Install New Wiring',
    date: new Date(2024, 11, 18, 14, 30),
    description: 'Install new electrical wiring at 456 Elm St.'
  },
  {
    id: '3',
    title: 'Plumbing Inspection',
    date: new Date(2024, 11, 22, 9, 0),
    description: 'Conduct plumbing inspection at 789 Oak St.'
  },
];

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };

  console.log("dateRange", dateRange);

  const filteredTasks = mockTasks.filter(
    task => dateRange?.from && dateRange?.to && task.date >= dateRange.from && task.date <= dateRange.to
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Date Selection</h2>
      <div className="mb-4">
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {dateRange?.from && dateRange?.to && (
            <MonthView
              startDate={dateRange.from}
              endDate={dateRange.to}
              tasks={filteredTasks}
              onSelectDay={setSelectedDate}
            />
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          <TaskList tasks={filteredTasks} selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}

