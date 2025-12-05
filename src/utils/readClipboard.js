export async function readClipboard() {
  if (typeof window === 'undefined') return null;
  if (!navigator?.clipboard?.readText) return null;

  try {
    const text = await navigator.clipboard.readText();
    return text || null;
  } catch (e) {
    return null;
  }
}
