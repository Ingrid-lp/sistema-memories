// Sistema de autenticação
// Removido: const CryptoUtils = require("./CryptoUtils")

class AuthManager {
  constructor() {
    this.currentUser = null
    this.init()
  }

  init() {
    this.currentUser = StorageManager.getCurrentUser()
  }

  async register(name, email, password) {
    try {
      // RN01: Verificar campos obrigatórios
      if (!name || !email || !password) {
        throw new Error("Nome, e-mail e senha são obrigatórios")
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres")
      }

      // Verificar se usuário já existe
      if (StorageManager.userExists(name, email)) {
        throw new Error("Nome ou e-mail já cadastrado")
      }

      // Criptografar senha
      const hashedPassword = await window.CryptoUtils.hashPassword(password) // Usa o CryptoUtils global

      // Criar usuário
      const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      }

      // Salvar usuário
      if (!StorageManager.saveUser(user)) {
        throw new Error("Erro ao salvar usuário")
      }

      // Fazer login automático
      const userForSession = { ...user }
      delete userForSession.password

      this.currentUser = userForSession
      StorageManager.setCurrentUser(userForSession)

      return { success: true, user: userForSession }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async login(name, password) {
    try {
      // RN02: Verificar campos obrigatórios
      if (!name || !password) {
        throw new Error("Nome e senha são obrigatórios")
      }

      // Buscar usuário
      const user = StorageManager.findUser(name)
      if (!user) {
        throw new Error("Nome ou senha incorretos")
      }

      // Verificar senha
      const isValidPassword = await window.CryptoUtils.verifyPassword(password, user.password) // Usa o CryptoUtils global
      if (!isValidPassword) {
        throw new Error("Nome ou senha incorretos")
      }

      // Criar sessão
      const userForSession = { ...user }
      delete userForSession.password

      this.currentUser = userForSession
      StorageManager.setCurrentUser(userForSession)

      return { success: true, user: userForSession }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Novo método para login por email
  async loginWithEmail(email, password) {
    try {
      if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios")
      }

      const user = StorageManager.findUserByEmail(email)
      if (!user) {
        throw new Error("E-mail ou senha incorretos")
      }

      const isValidPassword = await window.CryptoUtils.verifyPassword(password, user.password) // Usa o CryptoUtils global
      if (!isValidPassword) {
        throw new Error("E-mail ou senha incorretos")
      }

      const userForSession = { ...user }
      delete userForSession.password

      this.currentUser = userForSession
      StorageManager.setCurrentUser(userForSession)

      return { success: true, user: userForSession }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  logout() {
    this.currentUser = null
    StorageManager.clearCurrentUser()
  }

  isAuthenticated() {
    return this.currentUser !== null
  }

  getCurrentUser() {
    return this.currentUser
  }
}

// Disponibilizar globalmente
window.AuthManager = AuthManager
