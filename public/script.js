function startGame() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("game-play").style.display = "block";
}

function makeMove(move) {
    alert(`You chose ${move}. The game will continue...`);
}

function topUp() {
    document.getElementById("game-section").style.display = "none";
    document.getElementById("payment-section").style.display = "block";
}

function goToPayment() {
    alert("Redirecting to payment page...");
    // In a real implementation, this would be a redirect to the payment provider
}
