'use client';
import { useState, useEffect } from 'react';
import { MonthView } from './MonthView';
import { TaskList } from './TaskList';
import { Task } from '@/types/calendar';
import { getDateRange, formatDate } from '@/lib/dateUtils';
import { Button } from "@/components/ui/button"
import { CalendarIcon } from 'lucide-react'
import { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { getTasks } from './actions';


export function Calendar({ techIds }: { techIds: any[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1))
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (techIds.length > 0) {
      const fetchData = async () => {
        const response = await getTasks(techIds);
        setTasks(response);
      }
      fetchData();
    } 
    }, [techIds]);
  

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };

 console.log("tasks", tasks);

 const filteredTasks = tasks.filter(task => {
  
  if (!dateRange?.from || !dateRange?.to) {
    console.log("Date range incomplete");
    return false;
  }
  
  // Convert to timestamp for reliable comparison
  const taskTime = new Date(task.date).getTime();
  const fromTime = dateRange.from.getTime();
  const toTime = dateRange.to.getTime();
  
  const isInRange = taskTime >= fromTime && taskTime <= toTime;
  console.log("Is in range:", isInRange);
  return isInRange;
});

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Date Selection </h2>
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

