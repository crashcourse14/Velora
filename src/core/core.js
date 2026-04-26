const bg = document.getElementById("bg");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

document.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    targetX = (x - 0.5) * 20;
    targetY = (y - 0.5) * 20;
});

function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    bg.style.backgroundPosition = `
        calc(50% + ${currentX}px) calc(50% + ${currentY}px)
    `;

    requestAnimationFrame(animate);
}

animate();