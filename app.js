// Aplicação principal - Design do Figma
class MemoriasApp {
  constructor() {
    this.currentAlbum = null
    this.editingImage = null
    this.editingAlbum = null
    this.authStep = "email" // 'email', 'register', 'login'
    this.userEmail = ""

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
          <div class="card-content">
              ${image.title ? `<h3 class="card-title">${image.title}</h3>` : ""}
              ${image.description ? `<p class="card-description">${image.description}</p>` : ""}
              ${image.date ? `<div class="card-date"><i class="fas fa-calendar"></i> ${this.formatDate(image.date)}</div>` : ""}
              <div class="card-actions">
                  <button class="btn-icon" onclick="app.editImage('${image.id}')">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon danger" onclick="app.deleteImage('${image.id}')">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>
      `

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
    const select = document.getElementById("select-image")

    if (!modal || !select) return

    const user = this.authManager.getCurrentUser()
    const allImages = StorageManager.getImages(user.id)
    const availableImages = allImages.filter(
      (img) => !this.currentAlbum.imageIds || !this.currentAlbum.imageIds.includes(img.id),
    )

    select.innerHTML = '<option value="">Escolha uma imagem</option>'
    availableImages.forEach((image) => {
      const option = document.createElement("option")
      option.value = image.id
      option.textContent = image.title || `Imagem ${image.id}`
      select.appendChild(option)
    })

    modal.classList.remove("hidden")
  }

  async handleImageSubmit(e) {
    e.preventDefault()

    try {
      const fileInput = document.getElementById("image-file")
      const file = fileInput?.files[0]

      if (!file) {
        alert("Por favor, selecione uma imagem")
        return
      }

      this.setButtonLoading("image-form", true)

      const imageUrl = await this.fileToBase64(file)
      const user = this.authManager.getCurrentUser()

      const image = {
        id: Date.now().toString(),
        userId: user.id,
        title: document.getElementById("image-title")?.value || null,
        description: document.getElementById("image-description")?.value || null,
        date: document.getElementById("image-date")?.value || null,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
      }

      if (StorageManager.saveImage(image)) {
        this.closeModals()
        this.loadImages()
      } else {
        alert("Erro ao salvar imagem")
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error)
      alert("Erro ao processar imagem")
    }

    this.setButtonLoading("image-form", false)
  }

  handleEditImageSubmit(e) {
    e.preventDefault()

    if (!this.editingImage) return

    const updates = {
      title: document.getElementById("edit-image-title")?.value || null,
      description: document.getElementById("edit-image-description")?.value || null,
      date: document.getElementById("edit-image-date")?.value || null,
    }

    if (StorageManager.updateImage(this.editingImage, updates)) {
      this.closeModals()
      this.loadImages()
      if (this.currentAlbum) {
        this.loadAlbumImages()
      }
    } else {
      alert("Erro ao atualizar imagem")
    }
  }

  handleAlbumSubmit(e) {
    e.preventDefault()

    const title = document.getElementById("album-title-input")?.value

    if (!title?.trim()) {
      alert("Título é obrigatório")
      return
    }

    this.setButtonLoading("album-form", true)

    if (this.editingAlbum) {
      if (StorageManager.updateAlbum(this.editingAlbum, { title: title.trim() })) {
        this.closeModals()
        this.loadAlbums()
        if (this.currentAlbum && this.currentAlbum.id === this.editingAlbum) {
          this.currentAlbum.title = title.trim()
          const albumTitle = document.getElementById("album-title")
          if (albumTitle) albumTitle.textContent = title.trim()
        }
      } else {
        alert("Erro ao atualizar álbum")
      }
    } else {
      const user = this.authManager.getCurrentUser()
      const album = {
        id: Date.now().toString(),
        userId: user.id,
        title: title.trim(),
        imageIds: [],
        createdAt: new Date().toISOString(),
      }

      if (StorageManager.saveAlbum(album)) {
        this.closeModals()
        this.loadAlbums()
      } else {
        alert("Erro ao criar álbum")
      }
    }

    this.setButtonLoading("album-form", false)
  }

  handleAddToAlbumSubmit(e) {
    e.preventDefault()

    const imageId = document.getElementById("select-image")?.value

    if (!imageId || !this.currentAlbum) {
      alert("Por favor, selecione uma imagem")
      return
    }

    const updatedImageIds = [...(this.currentAlbum.imageIds || []), imageId]

    if (StorageManager.updateAlbum(this.currentAlbum.id, { imageIds: updatedImageIds })) {
      this.currentAlbum.imageIds = updatedImageIds
      this.closeModals()
      this.loadAlbumImages()
    } else {
      alert("Erro ao adicionar imagem ao álbum")
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
          <div class="card-content">
              ${image.title ? `<h3 class="card-title">${image.title}</h3>` : ""}
              ${image.description ? `<p class="card-description">${image.description}</p>` : ""}
              ${image.date ? `<div class="card-date"><i class="fas fa-calendar"></i> ${this.formatDate(image.date)}</div>` : ""}
              <div class="card-actions">
                  <button class="btn-icon" onclick="app.editImage('${image.id}')">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon danger" onclick="app.removeImageFromAlbum('${image.id}')">
                      <i class="fas fa-trash"></i>
                  </button>
              </div>
          </div>
      `

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
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, inicializando app...")
  window.app = new MemoriasApp()
})
