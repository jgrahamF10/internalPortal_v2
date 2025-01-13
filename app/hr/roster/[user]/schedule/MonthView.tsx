import { useState } from 'react';
import { getDateRange, isSameDay } from '@/lib/dateUtils';
import { Task } from '@/types/calendar';
import { Badge } from "@/components/ui/badge"

interface MonthViewProps {
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  onSelectDay: (date: Date) => void;
}

export function MonthView({ startDate, endDate, tasks, onSelectDay }: MonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const days = getDateRange(startDate, endDate);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDay(date);
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center font-semibold p-2">
          {day}
        </div>
      ))}
      {days.map((date, index) => {
        const tasksForDay = tasks.filter((task) => isSameDay(task.date, date));
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isCurrentMonth = date.getMonth() === startDate.getMonth();
        return (
          <div
            key={index}
            className={`p-2 border rounded-md cursor-pointer ${
              isSelected ? 'bg-primary text-primary-foreground' : ''
            } ${isCurrentMonth ? '' : 'text-muted-foreground'}`}
            onClick={() => handleDateClick(date)}
          >
            <div className="text-sm">{date.getDate()}</div>
            
            {tasksForDay.length > 0 && (
              <Badge variant="secondary" className="mt-1">
                {tasksForDay.length}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}

