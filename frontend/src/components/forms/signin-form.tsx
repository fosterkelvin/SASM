import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface SigninData {
  email: string;
  password: string;
}

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const {
    mutate: signinMutate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (credentials: SigninData) => login(credentials),
    onSuccess: () => {
      console.log("Signin successful, navigating...");
      navigate("/dashboard", { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signinMutate({ email, password });
  };

  return (
    <div
      className={cn("flex flex-col gap-6 font-serif: Georgia", className)}
      {...props}
    >
      <Card className="overflow-hidden dark:bg-gray-600">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to your SASM-IMS account
                </p>
              </div>
              {isError && (
                <div className="p-2 text-red-500 bg-gray-300 dark:bg-gray-700 rounded">
                  <p>Invalid email or password</p>
                </div>
              )}
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email :</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password :</Label>
                  <a
                    href="/password/forgot"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value.trim())}
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending || !email || password.length < 8}
                className="w-full hover:bg-green-600 dark:hover:bg-green-800 dark:text-gray-100 bg-red-600 dark:bg-red-800"
              >
                {isPending ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Sign up
                </a>
              </div>
            </div>
          </form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="/SI.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
