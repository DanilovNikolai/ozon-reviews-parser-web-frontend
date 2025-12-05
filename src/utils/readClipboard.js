export async function readClipboard() {
  try {
    if (!navigator.clipboard?.readText) return null;

    const text = await navigator.clipboard.readText();
    if (!text) return null;

    if (text.startsWith('https://www.ozon.ru/product/')) {
      return text.trim();
    }
  } catch (e) {}

  return null;
}
