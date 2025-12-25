export function maskPhone(value: string) {
  return value
    .replace(/\D/g, "") // Remove tudo o que não é dígito
    .replace(/^(\d{2})(\d)/g, "($1) $2") // Coloca parênteses em volta dos dois primeiros dígitos
    .replace(/(\d)(\d{4})$/, "$1-$2") // Coloca hífen entre o quarto e o quinto dígitos
    .slice(0, 15); // Limita o tamanho
}

export function maskCEP(value: string) {
  return value
    .replace(/\D/g, "") // Remove tudo o que não é dígito
    .replace(/^(\d{5})(\d)/, "$1-$2") // Coloca o hífen
    .slice(0, 9); // Limita o tamanho (XXXXX-XXX)
}

// Remove formatação para salvar no banco limpo
export function unmask(value: string) {
  return value.replace(/\D/g, "");
}
