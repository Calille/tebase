import React, { useState } from "react";
import { PlusCircle, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface CustomerTasksProps {
  customerId?: string;
  customerName?: string;
}

const CustomerTasks = ({
  customerId = "123",
  customerName = "John Doe",
}: CustomerTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Follow up on proposal",
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      completed: false,
      priority: "high",
    },
    {
      id: "2",
      title: "Send contract for signature",
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      completed: false,
      priority: "medium",
    },
    {
      id: "3",
      title: "Schedule quarterly review",
      dueDate: new Date(Date.now() + 86400000 * 10), // 10 days from now
      completed: true,
      priority: "low",
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: new Date(),
    priority: "medium" as const,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleAddTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      dueDate: newTask.dueDate,
      completed: false,
      priority: newTask.priority,
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      dueDate: new Date(),
      priority: "medium",
    });
    setDialogOpen(false);
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Tasks</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="task-title" className="text-sm font-medium">
                  Task Title
                </label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Follow up with customer"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="due-date" className="text-sm font-medium">
                  Due Date
                </label>
                <Input
                  id="due-date"
                  type="date"
                  value={format(newTask.dueDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      dueDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="priority-low"
                      name="priority"
                      checked={newTask.priority === "low"}
                      onChange={() =>
                        setNewTask({ ...newTask, priority: "low" })
                      }
                    />
                    <label htmlFor="priority-low">Low</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="priority-medium"
                      name="priority"
                      checked={newTask.priority === "medium"}
                      onChange={() =>
                        setNewTask({ ...newTask, priority: "medium" })
                      }
                    />
                    <label htmlFor="priority-medium">Medium</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="priority-high"
                      name="priority"
                      checked={newTask.priority === "high"}
                      onChange={() =>
                        setNewTask({ ...newTask, priority: "high" })
                      }
                    />
                    <label htmlFor="priority-high">High</label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} disabled={!newTask.title}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <CheckCircle2 className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p>No tasks scheduled for this customer</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setDialogOpen(true)}
              >
                Create your first task
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start justify-between rounded-lg border p-4 ${task.completed ? "bg-muted/50" : "bg-card"}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(task.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {task.title}
                    </label>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(task.dueDate, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(task.dueDate, "h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>{getPriorityBadge(task.priority)}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTasks;
