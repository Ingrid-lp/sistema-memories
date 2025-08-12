// Simulação de criptografia para senhas (RNF02)
export async function hashPassword(password: string): Promise<string> {
  // Em produção, use bcrypt ou similar
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "salt_secreto")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}
