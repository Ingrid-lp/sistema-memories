// Aplicação principal - Design do Figma
class MemoriasApp {
  constructor() {
    this.currentAlbum = null
    this.editingImage = null
    this.editingAlbum = null
    this.authStep = "email" // 'email', 'register', 'login'
    this.userEmail = ""
    this.selectedImageIds = [] // Adicionando selectedImageIds para armazenar imagens selecionadas

    // Inicializar AuthManager após garantir que as dependências estão carregadas
    this.initializeApp()
  }

  initializeApp() {
    // Removido: setTimeout para garantir que as dependências foram carregadas
    try {
      this.authManager = new window.AuthManager()
      this.init()
    } catch (error) {
      console.error("Erro ao inicializar aplicação:", error)
      this.showError("auth-error", "Erro ao carregar aplicação")
      this.hideLoading()
    }
  }

  init() {
    try {
      this.setupEventListeners()
      this.checkAuthState()

      // Simular carregamento
      setTimeout(() => {
        this.hideLoading()
      }, 1000)
    } catch (error) {
      console.error("Erro na inicialização:", error)
      this.hideLoading()
    }
  }

  setupEventListeners() {
    try {
      // Formulário de autenticação
      const authForm = document.getElementById("authForm")
      if (authForm) {
        authForm.addEventListener("submit", (e) => {
          this.handleAuthSubmit(e)
        })
      }

      // Botão Google
      const googleBtn = document.getElementById("google-btn")
      if (googleBtn) {
        googleBtn.addEventListener("click", () => {
          this.handleGoogleAuth()
        })
      }

      // Navegação do dashboard
      document.querySelectorAll(".nav-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.switchSection(e.target.dataset.section)
        })
      })

      // Botões principais
      // Atualizado para o novo ID do botão de logout no sidebar
      const logoutBtn = document.getElementById("logout-btn-sidebar")
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          this.handleLogout()
        })
      }

      const addImageBtn = document.getElementById("add-image-btn")
      if (addImageBtn) {
        addImageBtn.addEventListener("click", () => {
          this.showImageModal()
        })
      }

      const addAlbumBtn = document.getElementById("add-album-btn")
      if (addAlbumBtn) {
        addAlbumBtn.addEventListener("click", () => {
          this.showAlbumModal()
        })
      }

      const addImageToAlbumBtn = document.getElementById("add-image-to-album-btn")
      if (addImageToAlbumBtn) {
        addImageToAlbumBtn.addEventListener("click", () => {
          this.showAddToAlbumModal()
        })
      }

      // Formulários dos modais
      const imageForm = document.getElementById("image-form")
      if (imageForm) {
        imageForm.addEventListener("submit", (e) => {
          this.handleImageSubmit(e)
        })
      }

      const editImageForm = document.getElementById("edit-image-form")
      if (editImageForm) {
        editImageForm.addEventListener("submit", (e) => {
          this.handleEditImageSubmit(e)
        })
      }

      const albumForm = document.getElementById("album-form")
      if (albumForm) {
        albumForm.addEventListener("submit", (e) => {
          this.handleAlbumSubmit(e)
        })
      }

      const addToAlbumForm = document.getElementById("add-to-album-form")
      if (addToAlbumForm) {
        addToAlbumForm.addEventListener("submit", (e) => {
          this.handleAddToAlbumSubmit(e)
        })
      }

      // Preview de imagem
      const imageFile = document.getElementById("image-file")
      if (imageFile) {
        imageFile.addEventListener("change", (e) => {
          this.handleImagePreview(e)
        })
      }

      // Fechar modais
      document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          this.closeModals()
        })
      })

      // Fechar modal clicando fora
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            this.closeModals()
          }
        })
      })

      // Menu sanduíche
      const menuToggle = document.getElementById("menu-toggle") // ID do botão
      const sidebar = document.getElementById("sidebar-menu")
      const menuClose = document.getElementById("menu-close")
      const sidebarOverlay = document.querySelector(".sidebar-overlay")

      console.log("Procurando elementos do menu...")
      console.log("Menu toggle (ID):", menuToggle)
      console.log("Sidebar:", sidebar)

      if (menuToggle && sidebar) {
        console.log("Menu toggle e sidebar encontrados! Adicionando listeners.")

        menuToggle.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation() // Evita que o clique se propague para outros elementos
          console.log("Menu toggle clicado!")
          sidebar.classList.toggle("active")
          console.log("Sidebar active:", sidebar.classList.contains("active"))
        })
      } else {
        console.error("Menu toggle ou sidebar NÃO encontrados! Verifique os IDs e classes.")
      }

      if (menuClose && sidebar) {
        menuClose.addEventListener("click", (e) => {
          e.preventDefault()
          sidebar.classList.remove("active")
          console.log("Menu fechado pelo botão 'X'.")
        })
      }

      if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener("click", (e) => {
          e.preventDefault()
          sidebar.classList.remove("active")
          console.log("Menu fechado pelo overlay.")
        })
      }

      // Menu items
      document.addEventListener("click", (e) => {
        if (e.target.closest(".menu-item")) {
          const action = e.target.closest(".menu-item").dataset.action
          this.handleMenuAction(action)
        }

        if (e.target.closest(".album-menu-item")) {
          const albumId = e.target.closest(".album-menu-item").dataset.albumId
          this.openAlbumFromMenu(albumId)
        }
      })

      const confirmAddButton = document.getElementById("confirm-add-images")
      if (confirmAddButton) {
        confirmAddButton.addEventListener("click", (e) => {
          this.handleAddToAlbumSubmit(e)
        })
      }
    } catch (error) {
      console.error("Erro ao configurar event listeners:", error)
    }
  }

  // Fluxo de autenticação seguindo design do Figma
  async handleAuthSubmit(e) {
    e.preventDefault()

    try {
      const email = document.getElementById("authEmail").value
      const name = document.getElementById("authName").value
      const password = document.getElementById("authPassword").value

      this.setButtonLoading("authForm", true)

      if (this.authStep === "email") {
        // Primeiro passo: verificar se email existe
        this.userEmail = email
        const userExists = StorageManager.findUserByEmail(email)

        if (userExists) {
          // Usuário existe, mostrar campo de senha para login
          this.showPasswordField("login")
        } else {
          // Usuário não existe, mostrar campos para cadastro
          this.showRegisterFields()
        }
      } else if (this.authStep === "login") {
        // Login com email e senha
        const result = await this.authManager.loginWithEmail(email, password)

        if (result.success) {
          this.showDashboard()
        } else {
          this.showError("auth-error", result.error)
        }
      } else if (this.authStep === "register") {
        // Cadastro com nome, email e senha
        const result = await this.authManager.register(name, email, password)

        if (result.success) {
          this.showDashboard()
        } else {
          this.showError("auth-error", result.error)
        }
      }

      this.setButtonLoading("authForm", false)
    } catch (error) {
      console.error("Erro no handleAuthSubmit:", error)
      this.setButtonLoading("authForm", false)
      this.showError("auth-error", "Erro interno. Tente novamente.")
    }
  }

  showPasswordField(type) {
    const passwordGroup = document.getElementById("passwordGroup")
    const button = document.querySelector("#authForm .btn-text")

    if (passwordGroup) passwordGroup.classList.remove("hidden")
    if (button) button.textContent = type === "login" ? "Entrar" : "Cadastrar"
    this.authStep = type

    // Focar no campo de senha
    setTimeout(() => {
      const passwordField = document.getElementById("authPassword")
      if (passwordField) passwordField.focus()
    }, 100)
  }

  showRegisterFields() {
    const nameGroup = document.getElementById("nameGroup")
    const passwordGroup = document.getElementById("passwordGroup")
    const button = document.querySelector("#authForm .btn-text")

    if (nameGroup) nameGroup.classList.remove("hidden")
    if (passwordGroup) passwordGroup.classList.remove("hidden")
    if (button) button.textContent = "Criar conta"
    this.authStep = "register"

    // Focar no campo de nome
    setTimeout(() => {
      const nameField = document.getElementById("authName")
      if (nameField) nameField.focus()
    }, 100)
  }

  async handleGoogleAuth() {
    try {
      // Simular autenticação com Google
      this.setButtonLoading("authForm", true)

      // Simular delay da autenticação
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Criar usuário simulado do Google
      const googleUser = {
        id: "google_" + Date.now(),
        name: "Usuário Google",
        email: "usuario@gmail.com",
        createdAt: new Date().toISOString(),
      }

      this.authManager.currentUser = googleUser
      StorageManager.setCurrentUser(googleUser)

      this.setButtonLoading("authForm", false)
      this.showDashboard()
    } catch (error) {
      console.error("Erro no Google Auth:", error)
      this.setButtonLoading("authForm", false)
    }
  }

  hideLoading() {
    const loadingScreen = document.getElementById("loading-screen")
    if (loadingScreen) {
      loadingScreen.classList.add("hidden")
    }
  }

  checkAuthState() {
    try {
      if (this.authManager && this.authManager.isAuthenticated()) {
        this.showDashboard()
      } else {
        this.showAuthScreen()
      }
    } catch (error) {
      console.error("Erro ao verificar estado de autenticação:", error)
      this.showAuthScreen()
    }
  }

  showAuthScreen() {
    const authScreen = document.getElementById("auth-screen")
    const dashboardScreen = document.getElementById("dashboard-screen")

    if (authScreen) authScreen.classList.remove("hidden")
    if (dashboardScreen) dashboardScreen.classList.add("hidden")

    // Reset auth form
    this.authStep = "email"
    const nameGroup = document.getElementById("nameGroup")
    const passwordGroup = document.getElementById("passwordGroup")
    const button = document.querySelector("#authForm .btn-text")

    if (nameGroup) nameGroup.classList.add("hidden")
    if (passwordGroup) passwordGroup.classList.add("hidden")
    if (button) button.textContent = "Continue with email"

    // Esconder o menu lateral na tela de autenticação
    this.closeSidebar()
  }

  showDashboard() {
    const authScreen = document.getElementById("auth-screen")
    const dashboardScreen = document.getElementById("dashboard-screen")

    if (authScreen) authScreen.classList.add("hidden")
    if (dashboardScreen) dashboardScreen.classList.remove("hidden")

    // Atualizado para o novo ID do elemento de nome do usuário no sidebar
    const userName = document.getElementById("user-name-sidebar")
    const user = this.authManager.getCurrentUser()
    if (userName && user) {
      userName.textContent = `Olá, ${user.name}`
    }

    this.loadImages()
    this.loadAlbums()
    this.updateAlbumsMenu() // Adicionar esta linha
  }

  switchSection(section) {
    // Atualizar navegação
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    const activeBtn = document.querySelector(`[data-section="${section}"]`)
    if (activeBtn) activeBtn.classList.add("active")

    // Atualizar seções
    document.querySelectorAll(".dashboard-section").forEach((sec) => {
      sec.classList.remove("active")
    })

    if (section === "images") {
      const imagesSection = document.getElementById("images-section")
      if (imagesSection) imagesSection.classList.add("active")
    } else if (section === "albums") {
      const albumsSection = document.getElementById("albums-section")
      if (albumsSection) albumsSection.classList.add("active")
    }
  }

  handleLogout() {
    if (this.authManager) {
      this.authManager.logout()
    }
    this.showAuthScreen()
    this.clearForms()
  }

  loadImages() {
    try {
      const user = this.authManager.getCurrentUser()
      if (!user) return

      const images = StorageManager.getImages(user.id)
      const grid = document.getElementById("images-grid")
      const noImages = document.getElementById("no-images")

      if (!grid) return

      if (images.length === 0) {
        if (noImages) noImages.classList.remove("hidden")
        grid.innerHTML = ""
        if (noImages) grid.appendChild(noImages)
      } else {
        if (noImages) noImages.classList.add("hidden")
        grid.innerHTML = ""

        images.forEach((image) => {
          const card = this.createImageCard(image)
          grid.appendChild(card)
        })
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error)
    }
  }

  loadAlbums() {
    try {
      const user = this.authManager.getCurrentUser()
      if (!user) return

      const albums = StorageManager.getAlbums(user.id)
      const grid = document.getElementById("albums-grid")
      const noAlbums = document.getElementById("no-albums")

      if (!grid) return

      if (albums.length === 0) {
        if (noAlbums) noAlbums.classList.remove("hidden")
        grid.innerHTML = ""
        if (noAlbums) grid.appendChild(noAlbums)
      } else {
        if (noAlbums) noAlbums.classList.add("hidden")
        grid.innerHTML = ""

        albums.forEach((album) => {
          const card = this.createAlbumCard(album)
          grid.appendChild(card)
        })
      }

      // Atualizar menu lateral
      this.updateAlbumsMenu()
    } catch (error) {
      console.error("Erro ao carregar álbuns:", error)
    }
  }

  createImageCard(image) {
    const card = document.createElement("div")
    card.className = "image-card"

    card.innerHTML = `
          <div class="image-preview-container">
              <img src="${image.imageUrl}" alt="${image.title || "Imagem"}" />
          </div>
      `

    const imageElement = card.querySelector("img")
    if (imageElement) {
      imageElement.style.cursor = "pointer"
      imageElement.addEventListener("click", () => this.openImageDetails(image))
    }

    return card
  }

  createAlbumCard(album) {
    const user = this.authManager.getCurrentUser()
    const images = StorageManager.getImages(user.id)
    const albumImages = images.filter((img) => album.imageIds && album.imageIds.includes(img.id))
    const previewImage = albumImages[0]

    const card = document.createElement("div")
    card.className = "album-card"

    card.innerHTML = `
          <div class="album-preview-container" onclick="app.openAlbum('${album.id}')">
              ${
                previewImage
                  ? `<img src="${previewImage.imageUrl}" alt="${album.title}" />`
                  : '<i class="fas fa-folder-open"></i>'
              }
              <div class="image-count">${albumImages.length} ${albumImages.length === 1 ? "imagem" : "imagens"}</div>
          </div>
          <div class="card-content">
              <h3 class="card-title">${album.title}</h3>
              <p class="card-description">Criado em ${this.formatDate(album.createdAt)}</p>
              <div class="card-actions">
                  <button class="btn-icon" onclick="app.editAlbum('${album.id}')">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon danger" onclick="app.deleteAlbum('${album.id}')">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>
      `

    return card
  }

  showImageModal(isEdit = false) {
    const modal = isEdit ? document.getElementById("edit-image-modal") : document.getElementById("image-modal")
    if (modal) modal.classList.remove("hidden")

    if (!isEdit) {
      const form = document.getElementById("image-form")
      const preview = document.getElementById("image-preview")
      if (form) form.reset()
      if (preview) preview.classList.add("hidden")
    }
  }

  showAlbumModal(isEdit = false) {
    const modal = document.getElementById("album-modal")
    const title = document.getElementById("album-modal-title")
    const button = modal?.querySelector(".btn-text")

    if (title) title.textContent = isEdit ? "Editar Álbum" : "Criar Novo Álbum"
    if (button) button.textContent = isEdit ? "Salvar" : "Criar"
    if (modal) modal.classList.remove("hidden")

    if (!isEdit) {
      const form = document.getElementById("album-form")
      if (form) form.reset()
    }
  }

  showAddToAlbumModal() {
    if (!this.currentAlbum) return

    const modal = document.getElementById("add-to-album-modal")
    const grid = document.getElementById("image-selection-grid")
    const noImagesDiv = document.getElementById("no-available-images")
    const confirmButton = document.getElementById("confirm-add-images")

    if (!modal || !grid) return

    const user = this.authManager.getCurrentUser()
    const allImages = StorageManager.getImages(user.id)
    const availableImages = allImages.filter(
      (img) => !this.currentAlbum.imageIds || !this.currentAlbum.imageIds.includes(img.id),
    )

    this.selectedImageIds = []
    if (confirmButton) confirmButton.disabled = true

    if (availableImages.length === 0) {
      grid.innerHTML = ""
      if (noImagesDiv) noImagesDiv.classList.remove("hidden")
    } else {
      if (noImagesDiv) noImagesDiv.classList.add("hidden")

      grid.innerHTML = ""
      availableImages.forEach((image) => {
        const imageItem = document.createElement("div")
        imageItem.className = "image-selection-item"
        imageItem.dataset.imageId = image.id

        imageItem.innerHTML = `
          <img src="${image.imageUrl || "/placeholder.svg"}" alt="${image.title || "Imagem"}" />
          <div class="image-overlay"></div>
          <div class="image-checkbox">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
        `

        imageItem.addEventListener("click", () => this.toggleImageSelection(image.id))
        grid.appendChild(imageItem)
      })
    }

    modal.classList.remove("hidden")
  }

  toggleImageSelection(imageId) {
    if (!this.selectedImageIds) this.selectedImageIds = []

    const index = this.selectedImageIds.indexOf(imageId)
    const imageItem = document.querySelector(`[data-image-id="${imageId}"]`)
    const confirmButton = document.getElementById("confirm-add-images")

    if (index > -1) {
      this.selectedImageIds.splice(index, 1)
      if (imageItem) imageItem.classList.remove("selected")
    } else {
      this.selectedImageIds.push(imageId)
      if (imageItem) imageItem.classList.add("selected")
    }

    if (confirmButton) {
      confirmButton.disabled = this.selectedImageIds.length === 0
    }
  }

  handleAddToAlbumSubmit(e) {
    e.preventDefault()

    if (!this.selectedImageIds || this.selectedImageIds.length === 0) {
      alert("Selecione pelo menos uma imagem")
      return
    }

    if (!this.currentAlbum) return

    const updatedImageIds = [...(this.currentAlbum.imageIds || []), ...this.selectedImageIds]

    if (StorageManager.updateAlbum(this.currentAlbum.id, { imageIds: updatedImageIds })) {
      this.currentAlbum.imageIds = updatedImageIds
      this.closeModals()
      this.loadAlbumImages()
      this.selectedImageIds = []
    } else {
      alert("Erro ao adicionar imagens ao álbum")
    }
  }

  editImage(imageId) {
    const user = this.authManager.getCurrentUser()
    const images = StorageManager.getImages(user.id)
    const image = images.find((img) => img.id === imageId)

    if (!image) return

    this.editingImage = imageId

    const titleField = document.getElementById("edit-image-title")
    const descField = document.getElementById("edit-image-description")
    const dateField = document.getElementById("edit-image-date")

    if (titleField) titleField.value = image.title || ""
    if (descField) descField.value = image.description || ""
    if (dateField) dateField.value = image.date || ""

    this.showImageModal(true)
  }

  deleteImage(imageId) {
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
      if (StorageManager.deleteImage(imageId)) {
        this.loadImages()

        if (this.currentAlbum) {
          if (this.currentAlbum.imageIds && this.currentAlbum.imageIds.includes(imageId)) {
            const updatedImageIds = this.currentAlbum.imageIds.filter((id) => id !== imageId)
            StorageManager.updateAlbum(this.currentAlbum.id, { imageIds: updatedImageIds })
            this.currentAlbum.imageIds = updatedImageIds
          }
          setTimeout(() => {
            this.loadAlbumImages()
          }, 100)
        }

        this.loadAlbums()
      } else {
        alert("Erro ao excluir imagem")
      }
    }
  }

  editAlbum(albumId) {
    const user = this.authManager.getCurrentUser()
    const albums = StorageManager.getAlbums(user.id)
    const album = albums.find((a) => a.id === albumId)

    if (!album) return

    this.editingAlbum = albumId
    const titleInput = document.getElementById("album-title-input")
    if (titleInput) titleInput.value = album.title

    this.showAlbumModal(true)
  }

  deleteAlbum(albumId) {
    if (confirm("Tem certeza que deseja excluir este álbum?")) {
      if (StorageManager.deleteAlbum(albumId)) {
        this.loadAlbums()
        if (this.currentAlbum && this.currentAlbum.id === albumId) {
          this.showAlbumsSection()
        }
        setTimeout(() => {
          this.loadImages()
        }, 100)
      } else {
        alert("Erro ao excluir álbum")
      }
    }
  }

  openAlbum(albumId) {
    const user = this.authManager.getCurrentUser()
    const albums = StorageManager.getAlbums(user.id)
    const album = albums.find((a) => a.id === albumId)

    if (!album) return

    this.currentAlbum = album
    const albumTitle = document.getElementById("album-title")
    if (albumTitle) albumTitle.textContent = album.title

    document.querySelectorAll(".dashboard-section").forEach((sec) => {
      sec.classList.remove("active")
    })
    const albumView = document.getElementById("album-view")
    if (albumView) albumView.classList.add("active")

    this.loadAlbumImages()
  }

  showAlbumsSection() {
    this.currentAlbum = null
    this.switchSection("albums")
  }

  loadAlbumImages() {
    if (!this.currentAlbum) return

    const user = this.authManager.getCurrentUser()
    const allImages = StorageManager.getImages(user.id)
    const albumImages = allImages.filter(
      (img) => this.currentAlbum.imageIds && this.currentAlbum.imageIds.includes(img.id),
    )

    const grid = document.getElementById("album-images-grid")
    const noImages = document.getElementById("no-album-images")

    if (!grid) return

    if (albumImages.length === 0) {
      if (noImages) noImages.classList.remove("hidden")
      grid.innerHTML = ""
      if (noImages) grid.appendChild(noImages)
    } else {
      if (noImages) noImages.classList.add("hidden")
      grid.innerHTML = ""

      albumImages.forEach((image) => {
        const card = this.createAlbumImageCard(image)
        grid.appendChild(card)
      })
    }
  }

  createAlbumImageCard(image) {
    const card = document.createElement("div")
    card.className = "image-card"

    card.innerHTML = `
          <div class="image-preview-container">
              <img src="${image.imageUrl}" alt="${image.title || "Imagem"}" />
          </div>
      `

    const imageElement = card.querySelector("img")
    if (imageElement) {
      imageElement.style.cursor = "pointer"
      imageElement.addEventListener("click", () => this.openImageDetails(image))
    }

    return card
  }

  removeImageFromAlbum(imageId) {
    if (!this.currentAlbum) return

    if (confirm("Remover esta imagem do álbum?")) {
      const updatedImageIds = this.currentAlbum.imageIds.filter((id) => id !== imageId)

      if (StorageManager.updateAlbum(this.currentAlbum.id, { imageIds: updatedImageIds })) {
        this.currentAlbum.imageIds = updatedImageIds
        this.loadAlbumImages()
        this.loadAlbums()
      } else {
        alert("Erro ao remover imagem do álbum")
      }
    }
  }

  handleImagePreview(e) {
    const file = e.target.files[0]
    const preview = document.getElementById("image-preview")

    if (file && preview) {
      const reader = new FileReader()
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`
        preview.classList.remove("hidden")
      }
      reader.readAsDataURL(file)
    } else if (preview) {
      preview.classList.add("hidden")
    }
  }

  closeModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.add("hidden")
    })

    this.editingImage = null
    this.editingAlbum = null
    this.selectedImageIds = [] // Resetando selectedImageIds ao fechar modais

    const forms = ["image-form", "edit-image-form", "album-form", "add-to-album-form"]
    forms.forEach((formId) => {
      const form = document.getElementById(formId)
      if (form) form.reset()
    })

    const preview = document.getElementById("image-preview")
    if (preview) preview.classList.add("hidden")
  }

  setButtonLoading(formId, loading) {
    const form = document.getElementById(formId)
    if (!form) return

    const button = form.querySelector('button[type="submit"]')
    if (!button) return

    const textSpan = button.querySelector(".btn-text")
    const loadingSpan = button.querySelector(".btn-loading")

    if (loading) {
      if (textSpan) textSpan.classList.add("hidden")
      if (loadingSpan) loadingSpan.classList.remove("hidden")
      button.disabled = true
    } else {
      if (textSpan) textSpan.classList.remove("hidden")
      if (loadingSpan) loadingSpan.classList.add("hidden")
      button.disabled = false
    }
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    if (errorElement) {
      errorElement.textContent = message
      errorElement.classList.remove("hidden")

      setTimeout(() => {
        errorElement.classList.add("hidden")
      }, 5000)
    }
  }

  clearErrors() {
    document.querySelectorAll(".error-message").forEach((error) => {
      error.classList.add("hidden")
    })
  }

  clearForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.reset()
    })
    this.clearErrors()
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR")
    } catch (error) {
      return dateString
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Métodos do Menu Sanduíche
  toggleSidebar() {
    console.log("toggleSidebar chamado!")
    const sidebar = document.getElementById("sidebar-menu")

    if (sidebar) {
      sidebar.classList.toggle("active")
      console.log("Sidebar toggled, active:", sidebar.classList.contains("active"))
      this.updateMenuState()
    } else {
      console.error("Sidebar não encontrado!")
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById("sidebar-menu")
    if (sidebar) {
      sidebar.classList.remove("active")
    }
  }

  handleMenuAction(action) {
    this.updateMenuState(action)

    switch (action) {
      case "home":
        this.goToHome()
        break
      case "create-album":
        this.showAlbumModal()
        break
    }
    this.closeSidebar()
  }

  goToHome() {
    // Limpar seleção de álbum atual
    this.currentAlbum = null

    // Voltar para seção de imagens
    this.switchSection("images")
  }

  openAlbumFromMenu(albumId) {
    this.updateMenuState(null, albumId)
    this.openAlbum(albumId)
    this.closeSidebar()
  }

  updateMenuState(activeAction = null, activeAlbumId = null) {
    // Remover classe active de todos os itens
    document.querySelectorAll(".menu-item").forEach((item) => {
      item.classList.remove("active")
    })

    document.querySelectorAll(".album-menu-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Marcar item ativo baseado nos parâmetros ou estado atual
    if (activeAction) {
      const activeItem = document.querySelector(`[data-action="${activeAction}"]`)
      if (activeItem) activeItem.classList.add("active")
    } else if (activeAlbumId) {
      const activeAlbumItem = document.querySelector(`[data-album-id="${activeAlbumId}"]`)
      if (activeAlbumItem) activeAlbumItem.classList.add("active")
    } else if (!this.currentAlbum) {
      // Se não há álbum selecionado, marcar "home" como ativo
      const homeItem = document.querySelector('[data-action="home"]')
      if (homeItem) homeItem.classList.add("active")
    } else {
      // Se há álbum selecionado, marcar o álbum como ativo
      const activeAlbumItem = document.querySelector(`[data-album-id="${this.currentAlbum.id}"]`)
      if (activeAlbumItem) activeAlbumItem.classList.add("active")
    }
  }

  updateAlbumsMenu() {
    const user = this.authManager.getCurrentUser()
    if (!user) return

    const albums = StorageManager.getAlbums(user.id)
    const albumsMenuList = document.getElementById("albums-menu-list")

    if (!albumsMenuList) return

    if (albums.length === 0) {
      albumsMenuList.innerHTML = `
      <div class="empty-albums-menu">
        <i class="fas fa-folder-open"></i>
        <span>Nenhum álbum criado</span>
      </div>
    `
    } else {
      albumsMenuList.innerHTML = ""

      albums.forEach((album) => {
        const images = StorageManager.getImages(user.id)
        const albumImages = images.filter((img) => album.imageIds && album.imageIds.includes(img.id))

        const albumItem = document.createElement("button")
        albumItem.className = "album-menu-item"
        albumItem.dataset.albumId = album.id

        albumItem.innerHTML = `
        <i class="fas fa-folder"></i>
        <span class="album-name">${album.title}</span>
        <span class="image-count">${albumImages.length}</span>
      `

        albumsMenuList.appendChild(albumItem)
      })
    }

    this.updateMenuState()
  }

  openImageDetails(image) {
    const modal = document.getElementById("image-details-modal")
    const detailsImage = document.getElementById("details-image")
    const detailsTitle = document.getElementById("details-title")
    const detailsDate = document.getElementById("details-date")
    const detailsDescription = document.getElementById("details-description")

    // Configurar imagem
    detailsImage.src = image.imageUrl
    detailsImage.alt = image.title || "Imagem"

    // Configurar título
    detailsTitle.textContent = image.title || "Sem título"

    // Configurar data
    const dateSpan = detailsDate.querySelector("span")
    if (image.date) {
      dateSpan.textContent = `Data: ${this.formatDate(image.date)}`
    } else {
      dateSpan.textContent = "Data: Não colocado"
    }

    detailsDescription.textContent = image.description || "Sem descrição"

    // Configurar botões
    const editBtn = document.getElementById("edit-image-details")
    const deleteBtn = document.getElementById("delete-image-details")
    const fullscreenBtn = document.getElementById("fullscreen-image-details")

    editBtn.onclick = () => {
      modal.classList.add("hidden")
      this.editImage(image.id)
    }

    deleteBtn.onclick = () => {
      modal.classList.add("hidden")
      this.deleteImage(image.id)
    }

    fullscreenBtn.onclick = () => {
      this.openFullscreen(image)
    }

    modal.classList.remove("hidden")
  }

  openFullscreen(image) {
    const modal = document.getElementById("fullscreen-modal")
    const fullscreenImage = document.getElementById("fullscreen-image")
    const closeBtn = document.getElementById("close-fullscreen")

    fullscreenImage.src = image.imageUrl
    fullscreenImage.alt = image.title || "Imagem"

    closeBtn.onclick = () => {
      modal.classList.add("hidden")
    }

    // Fechar ao clicar no fundo
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden")
      }
    }

    modal.classList.remove("hidden")

    // Fechar modal de detalhes se estiver aberto
    const detailsModal = document.getElementById("image-details-modal")
    detailsModal.classList.add("hidden")
  }

  async handleImageSubmit(e) {
    e.preventDefault()

    try {
      const user = this.authManager.getCurrentUser()
      if (!user) return

      const fileInput = document.getElementById("image-file")
      const titleInput = document.getElementById("image-title")
      const descriptionInput = document.getElementById("image-description")
      const dateInput = document.getElementById("image-date")

      if (!fileInput.files[0]) {
        alert("Por favor, selecione uma imagem")
        return
      }

      this.setButtonLoading("image-form", true)

      const imageUrl = await this.fileToBase64(fileInput.files[0])

      const newImage = {
        id: Date.now().toString(),
        userId: user.id,
        title: titleInput.value || undefined,
        description: descriptionInput.value || undefined,
        date: dateInput.value || undefined,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
      }

      if (StorageManager.saveImage(newImage)) {
        this.loadImages()
        this.closeModals()
      } else {
        alert("Erro ao salvar imagem")
      }

      this.setButtonLoading("image-form", false)
    } catch (error) {
      console.error("Erro ao adicionar imagem:", error)
      alert("Erro ao adicionar imagem")
      this.setButtonLoading("image-form", false)
    }
  }

  async handleEditImageSubmit(e) {
    e.preventDefault()

    try {
      if (!this.editingImage) return

      const titleInput = document.getElementById("edit-image-title")
      const descriptionInput = document.getElementById("edit-image-description")
      const dateInput = document.getElementById("edit-image-date")

      this.setButtonLoading("edit-image-form", true)

      const updates = {
        title: titleInput.value || undefined,
        description: descriptionInput.value || undefined,
        date: dateInput.value || undefined,
      }

      if (StorageManager.updateImage(this.editingImage, updates)) {
        this.loadImages()
        if (this.currentAlbum) {
          this.loadAlbumImages()
        }
        this.closeModals()
      } else {
        alert("Erro ao atualizar imagem")
      }

      this.setButtonLoading("edit-image-form", false)
    } catch (error) {
      console.error("Erro ao editar imagem:", error)
      alert("Erro ao editar imagem")
      this.setButtonLoading("edit-image-form", false)
    }
  }

  async handleAlbumSubmit(e) {
    e.preventDefault()

    try {
      const user = this.authManager.getCurrentUser()
      if (!user) return

      const titleInput = document.getElementById("album-title-input")

      if (!titleInput.value.trim()) {
        alert("Por favor, digite um título para o álbum")
        return
      }

      this.setButtonLoading("album-form", true)

      if (this.editingAlbum) {
        // Editando álbum existente
        const updates = {
          title: titleInput.value.trim(),
        }

        if (StorageManager.updateAlbum(this.editingAlbum, updates)) {
          this.loadAlbums()
          this.closeModals()
        } else {
          alert("Erro ao atualizar álbum")
        }
      } else {
        // Criando novo álbum
        const newAlbum = {
          id: Date.now().toString(),
          userId: user.id,
          title: titleInput.value.trim(),
          createdAt: new Date().toISOString(),
          imageIds: [],
        }

        if (StorageManager.saveAlbum(newAlbum)) {
          this.loadAlbums()
          this.closeModals()
        } else {
          alert("Erro ao criar álbum")
        }
      }

      this.setButtonLoading("album-form", false)
    } catch (error) {
      console.error("Erro ao processar álbum:", error)
      alert("Erro ao processar álbum")
      this.setButtonLoading("album-form", false)
    }
  }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, inicializando app...")
  window.app = new MemoriasApp()
})
