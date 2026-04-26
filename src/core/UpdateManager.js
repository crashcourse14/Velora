export async function loadVersionText() {
  try {
    const response = await fetch('/src/version.txt');
    if (!response.ok) throw new Error('File not found! (Looking for /src/version.txt)');
    const textData = await response.text();
    document.getElementById("updateText").innerText = textData;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}