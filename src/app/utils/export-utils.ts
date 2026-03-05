/**
 * Sanitiza o nome do arquivo, removendo caracteres especiais e espaços.
 */
export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "Componente";
}

/**
 * Dispara o download de uma string como um arquivo .tsx.
 */
export function downloadAsTsx(code: string, fileName: string): void {
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = `${fileName}.tsx`;
  document.body.appendChild(link);
  link.click();
  
  // Limpeza
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
