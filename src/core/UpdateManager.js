fetch('/src/version.txt')
  .then(response => {
    if (!response.ok) throw new Error('File not found! (Looking for /src/version.txt)');
    return response.text();
  })
  .then(textData => {
    document.getElementById("updateText").innerText = textData;
  })
  .catch(error => console.error('Fetch error:', error));