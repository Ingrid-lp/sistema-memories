"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { hashPassword, verifyPassword } from "../utils/crypto"

interface User {
  id: string
  name: string
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  login: (name: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Verificar se usuário já existe
      if (users.find((u: User) => u.name === name || u.email === email)) {
        return false
      }

      const hashedPassword = await hashPassword(password)
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      const userForSession = { ...newUser }
      delete userForSession.password
      setUser(userForSession as User)
      localStorage.setItem("currentUser", JSON.stringify(userForSession))

      return true
    } catch (error) {
      console.error("Erro no cadastro:", error)
      return false
    }
  }

  const login = async (name: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: User) => u.name === name)

      if (!user) return false

      const isValid = await verifyPassword(password, user.password)
      if (!isValid) return false

      const userForSession = { ...user }
      delete userForSession.password
      setUser(userForSession as User)
      localStorage.setItem("currentUser", JSON.stringify(userForSession))

      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
