"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, FolderOpen, ImageIcon } from "lucide-react"

interface Album {
  id: string
  userId: string
  title: string
  createdAt: string
  imageIds: string[]
}

interface ImageData {
  id: string
  userId: string
  title?: string
  description?: string
  date?: string
  imageUrl: string
  createdAt: string
}

export default function AlbumManager() {
  const { user } = useAuth()
  const [albums, setAlbums] = useState<Album[]>([])
  const [images, setImages] = useState<ImageData[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [isAddImageDialogOpen, setIsAddImageDialogOpen] = useState(false)
  const [albumTitle, setAlbumTitle] = useState("")
  const [selectedImageId, setSelectedImageId] = useState("")

  useEffect(() => {
    loadAlbums()
    loadImages()
  }, [user])

  const loadAlbums = () => {
    if (!user) return
    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    const userAlbums = allAlbums.filter((album: Album) => album.userId === user.id)
    setAlbums(userAlbums)
  }

  const loadImages = () => {
    if (!user) return
    const allImages = JSON.parse(localStorage.getItem("images") || "[]")
    const userImages = allImages.filter((img: ImageData) => img.userId === user.id)
    setImages(userImages)
  }

  const handleCreateAlbum = () => {
    if (!user || !albumTitle.trim()) return

    const newAlbum: Album = {
      id: Date.now().toString(),
      userId: user.id,
      title: albumTitle.trim(),
      createdAt: new Date().toISOString(),
      imageIds: [],
    }

    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    allAlbums.push(newAlbum)
    localStorage.setItem("albums", JSON.stringify(allAlbums))

    loadAlbums()
    setIsAddDialogOpen(false)
    setAlbumTitle("")
  }

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album)
    setAlbumTitle(album.title)
  }

  const handleUpdateAlbum = () => {
    if (!editingAlbum || !albumTitle.trim()) return

    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    const updatedAlbums = allAlbums.map((album: Album) =>
      album.id === editingAlbum.id ? { ...album, title: albumTitle.trim() } : album,
    )

    localStorage.setItem("albums", JSON.stringify(updatedAlbums))
    loadAlbums()
    setEditingAlbum(null)
    setAlbumTitle("")
  }

  const handleDeleteAlbum = (albumId: string) => {
    if (confirm("Tem certeza que deseja excluir este álbum?")) {
      const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
      const filteredAlbums = allAlbums.filter((album: Album) => album.id !== albumId)
      localStorage.setItem("albums", JSON.stringify(filteredAlbums))
      loadAlbums()
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null)
      }
    }
  }

  const handleAddImageToAlbum = () => {
    if (!selectedAlbum || !selectedImageId) return

    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    const updatedAlbums = allAlbums.map((album: Album) =>
      album.id === selectedAlbum.id ? { ...album, imageIds: [...album.imageIds, selectedImageId] } : album,
    )

    localStorage.setItem("albums", JSON.stringify(updatedAlbums))
    loadAlbums()
    setIsAddImageDialogOpen(false)
    setSelectedImageId("")

    // Atualizar o álbum selecionado
    const updatedAlbum = updatedAlbums.find((a: Album) => a.id === selectedAlbum.id)
    setSelectedAlbum(updatedAlbum)
  }

  const handleRemoveImageFromAlbum = (imageId: string) => {
    if (!selectedAlbum) return

    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    const updatedAlbums = allAlbums.map((album: Album) =>
      album.id === selectedAlbum.id ? { ...album, imageIds: album.imageIds.filter((id) => id !== imageId) } : album,
    )

    localStorage.setItem("albums", JSON.stringify(updatedAlbums))
    loadAlbums()

    // Atualizar o álbum selecionado
    const updatedAlbum = updatedAlbums.find((a: Album) => a.id === selectedAlbum.id)
    setSelectedAlbum(updatedAlbum)
  }

  const getAlbumImages = (album: Album) => {
    return images.filter((img) => album.imageIds.includes(img.id))
  }

  const getAvailableImages = () => {
    if (!selectedAlbum) return []
    return images.filter((img) => !selectedAlbum.imageIds.includes(img.id))
  }

  if (selectedAlbum) {
    const albumImages = getAlbumImages(selectedAlbum)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{selectedAlbum.title}</h2>
          <Button onClick={() => setIsAddImageDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Memórias
          </Button>
        </div>

        {albumImages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <ImageIcon className="w-16 h-16" />
              </div>
              <p className="text-gray-500 text-center">Clique em "Adicionar Memórias" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albumImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.title || "Imagem"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {image.title && <h3 className="font-semibold text-lg">{image.title}</h3>}
                    {image.description && <p className="text-gray-600 text-sm">{image.description}</p>}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleRemoveImageFromAlbum(image.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para adicionar imagem ao álbum */}
        <Dialog open={isAddImageDialogOpen} onOpenChange={setIsAddImageDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Memória ao Álbum</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="select-image">Selecionar Imagem</Label>
                <Select value={selectedImageId} onValueChange={setSelectedImageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma imagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableImages().map((image) => (
                      <SelectItem key={image.id} value={image.id}>
                        {image.title || `Imagem ${image.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddImageDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddImageToAlbum} disabled={!selectedImageId}>
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meus Álbuns</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Álbum
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Álbum</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="album-title">Título do Álbum *</Label>
                <Input
                  id="album-title"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Digite o título do álbum"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAlbum} disabled={!albumTitle.trim()}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {albums.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <FolderOpen className="w-16 h-16" />
            </div>
            <p className="text-gray-500 text-center">
              Você ainda não criou nenhum álbum.
              <br />
              Clique em "Criar Álbum" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const albumImages = getAlbumImages(album)
            const previewImage = albumImages[0]

            return (
              <Card key={album.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-gray-100" onClick={() => setSelectedAlbum(album)}>
                  {previewImage ? (
                    <img
                      src={previewImage.imageUrl || "/placeholder.svg"}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {albumImages.length} {albumImages.length === 1 ? "imagem" : "imagens"}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{album.title}</h3>
                      <p className="text-gray-500 text-sm">
                        Criado em {new Date(album.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditAlbum(album)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAlbum(album.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de Edição de Álbum */}
      <Dialog open={!!editingAlbum} onOpenChange={() => setEditingAlbum(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Álbum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-album-title">Título do Álbum</Label>
              <Input
                id="edit-album-title"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                placeholder="Digite o título do álbum"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingAlbum(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateAlbum} disabled={!albumTitle.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
