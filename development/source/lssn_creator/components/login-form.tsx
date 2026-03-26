"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null | any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return parsed.message ?? "Login failed";
    } catch {
      return value || "Login failed";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0  border-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your LSSN account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                    <p className="text-sm text-muted-foreground">
                      No account yet?{" "}
                      <Link
                        href="/register"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
                      >
                        Create one
                      </Link>
                    </p>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              <Field>
                <Button
                  className=" bg-sky-500 hover:bg-sky-600 text-white font-bold"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
              {error ? (
                <Field>
                  <div className="rounded-md px-0 py-2 text-sm text-red-700">
                    {getErrorMessage(error)}, please try again
                  </div>
                </Field>
              ) : null}
              <Field className="grid grid-cols-3 gap-4"></Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://i.pinimg.com/736x/39/14/70/3914705dff9d801198dea6d3ca326768.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-white">
        By clicking continue, you agree to our{" "}
        <a href="https://en.wikipedia.org/wiki/Terms_of_service">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="https://en.wikipedia.org/wiki/Privacy_policy">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
