// Gerenciamento de dados no localStorage
class StorageManager {
  static getUsers() {
    try {
      return JSON.parse(localStorage.getItem("users") || "[]")
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      return []
    }
  }

  static saveUser(user) {
    try {
      const users = this.getUsers()
      users.push(user)
      localStorage.setItem("users", JSON.stringify(users))
      return true
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
      return false
    }
  }

  static findUser(name) {
    const users = this.getUsers()
    return users.find((user) => user.name === name)
  }

  // Novo método para buscar por email
  static findUserByEmail(email) {
    const users = this.getUsers()
    return users.find((user) => user.email === email)
  }

  static userExists(name, email) {
    const users = this.getUsers()
    return users.some((user) => user.name === name || user.email === email)
  }

  static getCurrentUser() {
    try {
      const user = localStorage.getItem("currentUser")
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error)
      return null
    }
  }

  static setCurrentUser(user) {
    try {
      localStorage.setItem("currentUser", JSON.stringify(user))
      return true
    } catch (error) {
      console.error("Erro ao salvar usuário atual:", error)
      return false
    }
  }

  static clearCurrentUser() {
    localStorage.removeItem("currentUser")
  }

  static getImages(userId = null) {
    try {
      const images = JSON.parse(localStorage.getItem("images") || "[]")
      return userId ? images.filter((img) => img.userId === userId) : images
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
      return []
    }
  }

  static saveImage(image) {
    try {
      const images = this.getImages()
      images.push(image)
      localStorage.setItem("images", JSON.stringify(images))
      return true
    } catch (error) {
      console.error("Erro ao salvar imagem:", error)
      return false
    }
  }

  static updateImage(imageId, updates) {
    try {
      const images = this.getImages()
      const index = images.findIndex((img) => img.id === imageId)
      if (index !== -1) {
        images[index] = { ...images[index], ...updates }
        localStorage.setItem("images", JSON.stringify(images))
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error)
      return false
    }
  }

  static deleteImage(imageId) {
    try {
      const images = this.getImages()
      const filteredImages = images.filter((img) => img.id !== imageId)
      localStorage.setItem("images", JSON.stringify(filteredImages))
      return true
    } catch (error) {
      console.error("Erro ao excluir imagem:", error)
      return false
    }
  }

  static getAlbums(userId = null) {
    try {
      const albums = JSON.parse(localStorage.getItem("albums") || "[]")
      return userId ? albums.filter((album) => album.userId === userId) : albums
    } catch (error) {
      console.error("Erro ao carregar álbuns:", error)
      return []
    }
  }

  static saveAlbum(album) {
    try {
      const albums = this.getAlbums()
      albums.push(album)
      localStorage.setItem("albums", JSON.stringify(albums))
      return true
    } catch (error) {
      console.error("Erro ao salvar álbum:", error)
      return false
    }
  }

  static updateAlbum(albumId, updates) {
    try {
      const albums = this.getAlbums()
      const index = albums.findIndex((album) => album.id === albumId)
      if (index !== -1) {
        albums[index] = { ...albums[index], ...updates }
        localStorage.setItem("albums", JSON.stringify(albums))
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao atualizar álbum:", error)
      return false
    }
  }

  static deleteAlbum(albumId) {
    try {
      const albums = this.getAlbums()
      const filteredAlbums = albums.filter((album) => album.id !== albumId)
      localStorage.setItem("albums", JSON.stringify(filteredAlbums))
      return true
    } catch (error) {
      console.error("Erro ao excluir álbum:", error)
      return false
    }
  }
}

// Disponibilizar globalmente
window.StorageManager = StorageManager
