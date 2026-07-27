type TicketWithUrls = {
  previewUrl?: string | null;
  downloadUrl?: string | null;
  url?: string | null;
};

export async function downloadTicketPdf(
  downloadUrl: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error("Download failed");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function getTicketPreviewUrl(ticket: TicketWithUrls): string | null {
  return ticket.previewUrl ?? ticket.url ?? null;
}

export function getTicketDownloadUrl(ticket: TicketWithUrls): string | null {
  return ticket.downloadUrl ?? ticket.url ?? null;
}

export async function downloadTicketFromUrl(
  downloadUrl: string,
  fileName: string,
): Promise<void> {
  try {
    await downloadTicketPdf(downloadUrl, fileName);
  } catch {
    throw new Error("Failed to download ticket");
  }
}
