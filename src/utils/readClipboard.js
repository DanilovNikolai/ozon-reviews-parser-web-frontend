export async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) return;

    if (text.startsWith('https://www.ozon.ru/product/')) {
      setLinks([text.trim()]);
    }

    if (inputRef.current) inputRef.current.focus();
  } catch (e) {
    // в некоторых браузерах запрещено — игнорируем
  }
}
