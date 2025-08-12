// Funções de criptografia para senhas (RNF02)
class CryptoUtils {
  static async hashPassword(password) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(password + "salt_secreto_sistema_memorias")
      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    } catch (error) {
      console.error("Erro ao criptografar senha:", error)
      // Fallback para navegadores que não suportam crypto.subtle
      return this.simpleHash(password)
    }
  }

  static async verifyPassword(password, hash) {
    try {
      const hashedInput = await this.hashPassword(password)
      return hashedInput === hash
    } catch (error) {
      console.error("Erro ao verificar senha:", error)
      return false
    }
  }

  // Fallback simples para navegadores antigos
  static simpleHash(str) {
    let hash = 0
    if (str.length === 0) return hash.toString()
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

// Disponibilizar globalmente
window.CryptoUtils = CryptoUtils
