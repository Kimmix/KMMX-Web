const SECRET_KEY = env.SECRET_KEY;

// Function to generate the code based on time
async function generateCode() {
  const time = Math.floor(Date.now() / 60000); // 60-second intervals
  const hash = await sha256(SECRET_KEY + time); // Await the hash computation
  return hash.substring(0, 4); // First 6 characters of the hash
}

// SHA-256 hash function
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fading FavIcon
const favicon = document.querySelector('link[rel="icon"]');
const originalTitle = document.title;
document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    document.title = await generateCode();
    favicon.setAttribute("href", '/favicon-hidden.png');
  } else {
    document.title = originalTitle;
    favicon.setAttribute("href", '/favicon.png');
  }
});

async function sendCode() {
  const codeElement = document.getElementById("code");
  const resultElement = document.getElementById("result");

  // Generate the code
  const code = await generateCode();
  codeElement.textContent = `Generated Code: ${code}`;

  // Send the code to the validation endpoint
  const response = await fetch(`${env.API_HOST}/validate-code?code=${code}`);
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