"use client"

import type React from "react"
import { useState } from "react"
import { HeartHandshake, User, Lock, Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xl md:grid-cols-2">
        {/* Painel esquerdo */}
        <div className="hidden flex-col justify-center gap-6 bg-primary p-10 text-primary-foreground md:flex">
          <HeartHandshake className="h-14 w-14" strokeWidth={1.5} aria-hidden="true" />
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-balance">Comunidade Restauração</h2>
            <p className="text-sm leading-relaxed text-primary-foreground/80 text-pretty">
              Transformando vidas através do cuidado, respeito e restauração contínua.
            </p>
          </div>
        </div>

        {/* Painel direito */}
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartHandshake className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold text-foreground">Clínica Restauração</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Acesso restrito</p>
            <h1 className="text-2xl font-semibold text-foreground">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Insira suas credenciais para acessar o sistema clínico.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Usuário
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="seu.usuario"
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-11 w-full gap-2 text-sm font-medium">
              Entrar
              <LogIn className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
