"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/navbar";
import {
  ArrowPathIcon,
  BellIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

// Dynamically import Calendar to prevent SSR issues
const Calendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-md" />
    ),
  }
);

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  details: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]),
  dueDate: z.date(),
});

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

interface Event {
  id: number;
  title: string;
  time: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const events: Event[] = [
    { id: 1, title: "Team Meeting", time: "10:00 AM" },
    { id: 2, title: "Client Call", time: "02:30 PM" },
    { id: 3, title: "Project Review", time: "04:00 PM" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      details: "",
      status: "pending",
      dueDate: new Date("2024-03-25"), // Fixed initial date
    },
  });

  useEffect(() => {
    setMounted(true);
    // Initialize todos after mount
    setTodos([
      {
        id: 1,
        title: "Complete project proposal",
        completed: false,
        dueDate: new Date("2024-03-25"),
      },
      {
        id: 2,
        title: "Review technical documentation",
        completed: true,
        dueDate: new Date("2024-03-22"),
      },
      {
        id: 3,
        title: "Prepare presentation slides",
        completed: false,
        dueDate: new Date("2024-03-24"),
      },
    ]);
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // API call implementation
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          dueDate: values.dueDate.toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create task");

      setTodos([
        ...todos,
        {
          id: todos.length + 1,
          title: values.title,
          completed: false,
          dueDate: values.dueDate,
        },
      ]);

      form.reset();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-Noto">
      <div className="flex h-screen">
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl">
          <Navbar />
        </div>

        <div className="flex-1 flex flex-col">
          <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-lg border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Today's Tasks
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" className="rounded-full">
                <BellIcon className="h-6 w-6 text-gray-600" />
                <span className="sr-only">Notifications</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <PlusIcon className="h-5 w-5" />
                    New Task
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-600">
                      Create New Task
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Task title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="details"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Details</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Task description"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="rounded-md border"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.reset()}
                        >
                          Reset
                        </Button>
                        <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Create Task
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="flex-1 grid grid-cols-3 gap-8 p-8">
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all group bg-white"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="h-6 w-6 rounded-lg data-[state=checked]:bg-emerald-500"
                    />
                    <div className="ml-4 flex-1">
                      <p
                        className={`text-gray-900 text-lg ${
                          todo.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.dueDate && (
                        <div className="flex items-center mt-2">
                          <CalendarIcon className="w-4 h-4 text-emerald-500 mr-2" />
                          <span className="text-sm text-emerald-600">
                            Due {todo.dueDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-900">
                    Calendar Events
                  </h3>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 gap-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Sync
                  </Button>
                </div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-16 text-emerald-600 font-medium">
                        {event.time}
                      </div>
                      <div className="flex-1 text-gray-700 font-medium">
                        {event.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-6">
                  Profile
                </h3>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full">
                    <UserCircleIcon className="h-12 w-12 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Chakrit Tokavan</h4>
                    <p className="text-emerald-600 text-sm">
                      chakrit@example.com
                    </p>
                    <Button
                      variant="link"
                      className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                    >
                      View Profile →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
