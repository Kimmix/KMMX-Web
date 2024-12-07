async function generateCode() {
  const hash = await sha256("4E!$cp2W3R%RkX" + Math.floor(Date.now() / 600000));
  return hash.substring(0, 4);
}
async function sha256(message) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message)))).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fading FavIcon
const favicon = document.querySelector('link[rel="icon"]');
const originalTitle = document.title;
document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    // document.title = await generateCode();
    favicon.setAttribute("href", '/favicon-hidden.png');
  } else {
    document.title = originalTitle;
    favicon.setAttribute("href", '/favicon.png');
  }
});

//* Debug
async function sendCode() {
  const codeElement = document.getElementById("code");
  const resultElement = document.getElementById("result");

  // Generate the code
  const code = await generateCode();
  codeElement.textContent = `Generated Code: ${code}`;

  // Send the code to the validation endpoint
  const response = await context.env.worker.fetch(`/validate-code?code=${code}`);
  const data = await response.json();

  // Display the validation result
  if (data.valid) {
    resultElement.textContent = "Code is valid!";
    resultElement.style.color = "green";
  } else {
    resultElement.textContent = "Code is invalid!";
    resultElement.style.color = "red";
  }
}