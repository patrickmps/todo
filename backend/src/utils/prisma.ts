/**
 * Função que recebe um objeto e uma lista de chaves e retorna um novo objeto
 * sem as chaves especificadas.
 *
 * @template T - O tipo do objeto.
 * @template K - O tipo das chaves.
 * @param {T} obj - O objeto a ser filtrado.
 * @param {K[]} keys - A lista de chaves a serem excluídas.
 * @returns {Omit<T, K>} - O novo objeto sem as chaves especificadas.
 */
export function excludeField<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  // Filtra as entradas do objeto original, excluindo as que possuem as chaves especificadas.
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
}
