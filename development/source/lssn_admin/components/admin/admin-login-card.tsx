'use client'

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

type AdminLoginCardProps = {
  email: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminLoginCard({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginCardProps) {
  return (
    <div className="flex flex-col gap-6 min-h-svh items-center justify-center app-bg px-6 py-10">
      <div className="w-screen h-screen z-0 absolute bg-cover blur-2xl bg-[url('https://t3.ftcdn.net/jpg/07/29/31/34/360_F_729313469_RTp7bNgwWIo4NtfLEbQQuU0rERzUB6sq.jpg')] "></div>
      <Card className="overflow-hidden z-1 py-0 border-0 w-full max-w-4xl app-surface">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-start gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-6 text-lime-800" />
                  <h1 className="text-2xl font-bold text-strong">
                    LSSN Super Admin
                  </h1>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  disabled={isLoading}
                  className="app-input"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground underline-offset-2 hover:text-lime-800 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  disabled={isLoading}
                  className="app-input"
                />
              </Field>
              {error ? (
                <div className="mb-0 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-lime-800 hover:bg-lime-900 text-white font-semibold w-full"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block overflow-hidden">
            <img
              src="https://www.gardenia.net/wp-content/uploads/2023/05/types-of-flowers.webp"
              alt="Admin Dashboard"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
