"use client";
import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import axios from 'axios';
import {
  Dialog,
  DialogClose,
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
  PencilIcon,
} from "@heroicons/react/24/outline";
import { title } from "process";


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
  details?: string;
  status?: string;
  data?: string; // Added to match the API response format
  userEmail?: string; // Added to match the API response format
}

interface Event {
  id: number;
  title: string;
  time: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Add state for viewing todo details
  const [viewingTodo, setViewingTodo] = useState<TodoItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const events: Event[] = [
    // { id: 1, title: "Team Meeting", time: "10:00 AM" },
    // { id: 2, title: "Client Call", time: "02:30 PM" },
    // { id: 3, title: "Project Review", time: "04:00 PM" },
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

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      details: "",
      status: "pending",
      dueDate: new Date(),
    },
  });

  useEffect(() => {
    if (editingTodo) {
      editForm.reset({
        title: editingTodo.title,
        details: editingTodo.details || editingTodo.data || "", // Support both formats
        status: (editingTodo.status as "pending" | "in-progress" | "completed") || "pending",
        dueDate: editingTodo.dueDate || new Date(),
      });
    }
  }, [editingTodo, editForm]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile');
        if (!response.data) {
          window.location.href = '/login'; // Redirect to login page if no user data
        } else {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        window.location.href = '/login'; // Redirect to login page on error
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        if (user?.email) {
          const response = await axios.get(`/api/getTodo?email=${encodeURIComponent(user.email)}`);
          setTodos(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch todos:', err);
      }
    };

    fetchTodos();
    console.log("User data:", user);
    console.log("Todos data:", todos);
  }, [user]);

  useEffect(() => {
    console.log("Todos updated:", todos);
  }, [todos]);

  useEffect(() => {
    setMounted(true);
    // Initialize todos after mount
    setTodos([
      // {
      //   id: 1,
      //   title: "Complete project proposal",
      //   completed: false,
      //   dueDate: new Date("2024-03-25"),
      // },
      // {
      //   id: 2,
      //   title: "Review technical documentation",
      //   completed: true,
      //   dueDate: new Date("2024-03-22"),
      // },
      // {
      //   id: 3,
      //   title: "Prepare presentation slides",
      //   completed: false,
      //   dueDate: new Date("2024-03-24"),
      // },
    ]);
  }, []);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // API call implementation
      console.log("Form submitted:", values);

      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // ...values,
          userEmail: user?.email,
          title: values.title,
          data: values.details,
          status: values.status,
          dueDate: values.dueDate.toISOString(),
          completed: editingTodo?.completed || false,
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
          details: values.details,
          status: values.status,
        },
      ]);
      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingTodo) return;

    try {
      // API call to update the todo
      const response = await axios.put('/api/updateTodo', {
        id: editingTodo.id,
        data: {
          title: values.title,
          details: values.details,
          status: values.status,
          dueDate: values.dueDate.toISOString(),
          completed: editingTodo.completed,
        },
      });

      if (response.status === 200) {
        // Update the todos state with the edited todo
        setTodos(
          todos.map((todo) =>
            todo.id === editingTodo.id
              ? {
                ...todo,
                title: values.title,
                details: values.details,
                status: values.status,
                dueDate: values.dueDate,
              }
              : todo
          )
        );

        // Close the edit dialog and reset the editing state
        setIsEditDialogOpen(false);
        setEditingTodo(null);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const toggleTodo = async (id: number) => {
    const todoToToggle = todos.find((todo) => todo.id === id);
    if (!todoToToggle) return;

    const isCompleted = !todoToToggle.completed; // ค่าที่จะเปลี่ยนไป
    const newStatus = isCompleted ? 'completed' : 'in-progress';

    console.log("Toggle todo with ID:", id);

    await axios.put('/api/updateTodo', {
      id: id,
      data: {
        status: newStatus,
        completed: isCompleted,
      },
    });

    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: isCompleted, status: newStatus }
          : todo
      )
    );

    console.log("Todo toggled:", id, "=>", newStatus);
  };

  const deleteTodo = (id: number) => {
    console.log("Delete todo with ID:", id);
    const deleteTodoItem = async (id: number) => {
      try {
        axios.delete(`/api/delete?id=${id}`);
      } catch (error) {
        console.error("Error deleting todo:", error);
      }
    };
    deleteTodoItem(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const openEditDialog = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsEditDialogOpen(true);
  };

  // Function to open the view dialog
  const openViewDialog = (todo: TodoItem) => {
    setViewingTodo(todo);
    setIsViewDialogOpen(true);
  };

  // Helper function to get formatted status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-Noto">
      <div className="flex h-screen">
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 shadow-xl">
          <Navbar user={user} />
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full border-1 border-gray-200"
                  >
                    <BellIcon className="h-6 w-6 text-gray-600" />
                    {todos.some((todo) => !todo.completed) && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">
                      Task Notifications
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {todos.length > 0 ? (
                      todos.map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                        >
                          <div className="flex-1">
                            <p
                              className={`text-gray-900 text-lg ${todo.completed ? "line-through text-gray-400" : ""
                                }`}
                            >
                              {todo.title}
                            </p>
                            {todo.dueDate && (
                              <div className="flex items-center mt-2">
                                <CalendarIcon className="w-4 h-4 text-emerald-500 mr-2" />
                                <span className="text-sm text-emerald-600">
                                  Due {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No notifications available.</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                          onClick={() => DialogClose}
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

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
              {todos.map((todo) => (
                <div
                key={todo.id}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all group bg-white cursor-pointer"
                onClick={() => openViewDialog(todo)}
                >
                <Checkbox
                  checked={todo.completed}
                  onClick={(e) => e.stopPropagation()} // Prevent opening dialog
                  onCheckedChange={() => toggleTodo(todo.id)} // Toggle status
                  className="h-6 w-6 rounded-lg data-[state=checked]:bg-emerald-500"
                />

                <div className="ml-4 flex-1">
                  <p
                  className={`text-gray-900 text-lg ${todo.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                  {todo.title}
                  </p>
                  {todo.dueDate && (
                  <div className="flex items-center mt-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="text-sm text-emerald-600">
                    Due {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  )}
                </div>
                <div className="flex">
                  <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-emerald-500"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening view dialog
                    openEditDialog(todo);
                  }}
                  >
                  <PencilIcon className="h-5 w-5" />
                  </Button>
                  <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening view dialog
                    deleteTodo(todo.id);
                  }}
                  >
                  <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
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
                <h4 className="font-bold text-gray-900">{user?.name}</h4>
                <p className="text-emerald-600 text-sm">
                  {user?.email}
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

      {/* Edit Todo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600">
              Edit Task
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-6"
            >
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingTodo(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Update Task
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Todo Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600">
              Task Details
            </DialogTitle>
          </DialogHeader>
          {viewingTodo && (
            <div className="space-y-6 py-4">
              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{viewingTodo.title}</h3>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingTodo.status || 'pending')}`}>
                    {getStatusLabel(viewingTodo.status || 'pending')}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-emerald-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="text-gray-900">
                    {viewingTodo.dueDate ? new Date(viewingTodo.dueDate).toLocaleDateString('th-TH', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Details/Description */}
              <div>
                <p className="text-sm font-medium text-gray-500">Details</p>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {viewingTodo.details || viewingTodo.data || 'No details provided.'}
                  </p>
                </div>
              </div>

              {/* Completion Status */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={viewingTodo.completed}
                  className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-500"
                  onCheckedChange={() => {
                    toggleTodo(viewingTodo.id);
                    setViewingTodo({
                      ...viewingTodo,
                      completed: !viewingTodo.completed
                    });
                  }}
                />
                <span className="text-gray-700">
                  {viewingTodo.completed ? 'Completed' : 'Not completed'}
                </span>
              </div>

              {/* Email info if available */}
              {viewingTodo.userEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Associated Email</p>
                  <p className="text-gray-900">{viewingTodo.userEmail}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setViewingTodo(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(viewingTodo);
                  }}
                >
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}