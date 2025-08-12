"use client"
import { useAuth } from "../contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, ImageIcon, FolderOpen } from "lucide-react"
import ImageManager from "./image-manager"
import AlbumManager from "./album-manager"

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Sistema Memórias</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Olá, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="images" className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Minhas Memórias
            </TabsTrigger>
            <TabsTrigger value="albums" className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-2" />
              Meus Álbuns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <ImageManager />
          </TabsContent>

          <TabsContent value="albums">
            <AlbumManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
