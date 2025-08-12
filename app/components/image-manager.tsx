"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"

interface ImageData {
  id: string
  userId: string
  title?: string
  description?: string
  date?: string
  imageUrl: string
  createdAt: string
}

export default function ImageManager() {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageData[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    imageFile: null as File | null,
  })

  useEffect(() => {
    loadImages()
  }, [user])

  const loadImages = () => {
    if (!user) return
    const allImages = JSON.parse(localStorage.getItem("images") || "[]")
    const userImages = allImages.filter((img: ImageData) => img.userId === user.id)
    setImages(userImages)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
    }
  }

  const handleAddImage = async () => {
    if (!user || !formData.imageFile) return

    const reader = new FileReader()
    reader.onload = () => {
      const imageUrl = reader.result as string
      const newImage: ImageData = {
        id: Date.now().toString(),
        userId: user.id,
        title: formData.title || undefined,
        description: formData.description || undefined,
        date: formData.date || undefined,
        imageUrl,
        createdAt: new Date().toISOString(),
      }

      const allImages = JSON.parse(localStorage.getItem("images") || "[]")
      allImages.push(newImage)
      localStorage.setItem("images", JSON.stringify(allImages))

      loadImages()
      setIsAddDialogOpen(false)
      resetForm()
    }
    reader.readAsDataURL(formData.imageFile)
  }

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image)
    setFormData({
      title: image.title || "",
      description: image.description || "",
      date: image.date || "",
      imageFile: null,
    })
  }

  const handleUpdateImage = () => {
    if (!editingImage) return

    const allImages = JSON.parse(localStorage.getItem("images") || "[]")
    const updatedImages = allImages.map((img: ImageData) =>
      img.id === editingImage.id
        ? {
            ...img,
            title: formData.title || undefined,
            description: formData.description || undefined,
            date: formData.date || undefined,
          }
        : img,
    )

    localStorage.setItem("images", JSON.stringify(updatedImages))
    loadImages()
    setEditingImage(null)
    resetForm()
  }

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
      const allImages = JSON.parse(localStorage.getItem("images") || "[]")
      const filteredImages = allImages.filter((img: ImageData) => img.id !== imageId)
      localStorage.setItem("images", JSON.stringify(filteredImages))
      loadImages()
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      imageFile: null,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Memórias</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Memórias
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Memória</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-file">Imagem *</Label>
                <Input id="image-file" type="file" accept="image/*" onChange={handleFileChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-title">Título</Label>
                <Input
                  id="image-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título da imagem (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-description">Descrição</Label>
                <Textarea
                  id="image-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da imagem (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-date">Data</Label>
                <Input
                  id="image-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddImage} disabled={!formData.imageFile}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-center">
              Você ainda não adicionou nenhuma memória.
              <br />
              Clique em "Adicionar Memórias" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden break-inside-avoid mb-6">
              <div className="relative">
                <img
                  src={image.imageUrl || "/placeholder.svg"}
                  alt={image.title || "Imagem"}
                  className="w-full h-auto object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {image.title && <h3 className="font-semibold text-lg">{image.title}</h3>}
                  {image.description && <p className="text-gray-600 text-sm">{image.description}</p>}
                  {image.date && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(image.date).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditImage(image)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteImage(image.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Memória</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da memória"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da memória"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingImage(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateImage}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
