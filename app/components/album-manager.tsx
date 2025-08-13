"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, FolderOpen, ImageIcon, Calendar, Hand, X } from "lucide-react"

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
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  })

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
    if (!selectedAlbum || selectedImageIds.length === 0) return

    const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
    const updatedAlbums = allAlbums.map((album: Album) =>
      album.id === selectedAlbum.id ? { ...album, imageIds: [...album.imageIds, ...selectedImageIds] } : album,
    )

    localStorage.setItem("albums", JSON.stringify(updatedAlbums))
    loadAlbums()
    setIsAddImageDialogOpen(false)
    setSelectedImageIds([])

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

    const updatedAlbum = updatedAlbums.find((a: Album) => a.id === selectedAlbum.id)
    setSelectedAlbum(updatedAlbum)
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const getAlbumImages = (album: Album) => {
    return images.filter((img) => album.imageIds.includes(img.id))
  }

  const getAvailableImages = () => {
    if (!selectedAlbum) return []
    return images.filter((img) => !selectedAlbum.imageIds.includes(img.id))
  }

  const handleEditImage = (image: ImageData) => {
    setEditingImage(image)
    setFormData({
      title: image.title || "",
      description: image.description || "",
      date: image.date || "",
    })
    setSelectedImage(null)
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

      const allAlbums = JSON.parse(localStorage.getItem("albums") || "[]")
      const updatedAlbums = allAlbums.map((album: Album) => ({
        ...album,
        imageIds: album.imageIds.filter((id: string) => id !== imageId),
      }))
      localStorage.setItem("albums", JSON.stringify(updatedAlbums))

      loadImages()
      loadAlbums()
      setSelectedImage(null)

      if (selectedAlbum) {
        const updatedSelectedAlbum = updatedAlbums.find((a: Album) => a.id === selectedAlbum.id)
        setSelectedAlbum(updatedSelectedAlbum)
      }
    }
  }

  const handleOpenFullscreen = () => {
    setIsFullscreenOpen(true)
    setSelectedImage(null)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
    })
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
              <p className="text-gray-500 text-center">Este álbum não possui memórias</p>
            </CardContent>
          </Card>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {albumImages.map((image) => (
              <Card key={image.id} className="overflow-hidden break-inside-avoid mb-6">
                <div className="relative">
                  <img
                    src={image.imageUrl || "/placeholder.svg"}
                    alt={image.title || "Imagem"}
                    className="w-full h-auto object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.title || "Imagem"}
                  className="w-full h-auto max-h-[50vh] object-cover"
                />
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold mb-2">{selectedImage.title || "Sem título"}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    Data:{" "}
                    {selectedImage.date ? new Date(selectedImage.date).toLocaleDateString("pt-BR") : "Não colocado"}
                  </div>
                  <div className="text-gray-600 mb-6">
                    <p className="text-sm leading-relaxed">{selectedImage.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" onClick={() => handleEditImage(selectedImage)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteImage(selectedImage.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleOpenFullscreen}>
                      <Hand className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 bg-black/95">
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setIsFullscreenOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
              {selectedImage && (
                <img
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.title || "Imagem"}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

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
