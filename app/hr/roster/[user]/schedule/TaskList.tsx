import { Task } from '@/types/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskListProps {
  tasks: Task[];
  selectedDate: Date | null;
}

export function TaskList({ tasks, selectedDate }: TaskListProps) {
  if (!selectedDate) {
    return <div className="text-center p-4">Select a date to view tasks</div>;
  }

  const tasksForDay = tasks.filter((task) =>
    task.date.toDateString() === selectedDate.toDateString()
  );

  if (tasksForDay.length === 0) {
    return <div className="text-center p-4">No tasks scheduled for this day</div>;
  }

  return (
    <div className="space-y-4">
      {tasksForDay.map((task) => (
        <Card key={task.id}>
          <CardHeader>
            <CardTitle>{task.title}</CardTitle>
            <CardDescription>{task.date.toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{task.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

