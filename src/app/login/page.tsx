'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GoogleLogo } from '@/components/svgs'; // Create this SVG component

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Section - Visual */}
      <div className="hidden lg:block relative bg-gradient-to-br from-indigo-600 to-purple-500">
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
          <p className="text-lg opacity-90">
            Streamline your productivity with our intuitive task management system.
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Workspace"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section - Login Form */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500">Manage your tasks efficiently</p>
          </div>

          {/* Google Auth Button */}
          <Button 
            variant="outline" 
            className="w-full flex gap-3 items-center py-5 border-gray-300 hover:bg-gray-50"
            // onClick={handleGoogleAuth}
          >
            <GoogleLogo className="w-5 h-5" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or continue with email</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@company.com" 
                        {...field} 
                        className="py-5 focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="py-5 focus-visible:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-5 text-base"
              >
                Sign in
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}