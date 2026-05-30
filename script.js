// ============================================================================
// SYSTEM RUNTIME CODENAMES & VARIABLES
// ============================================================================
let IS_ADMIN_AUTHENTICATED = false; 

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    if(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Standard System Core Elements
let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;
let difficulty = 'easy';
let activeLocationName = "Oakhaven";
let bossSpawned = false;
let screenShake = 0;
let hasSuperSpeed = false; 

const diffSettings = {
    easy: { enemySpeed: 1.5, spawnRate: 0.01, bossHp: 5, shootRate: 120 },
    medium: { enemySpeed: 3.0, spawnRate: 0.02, bossHp: 10, shootRate: 90 },
    hard: { enemySpeed: 5.0, spawnRate: 0.03, bossHp: 15, shootRate: 60 },
    extreme: { enemySpeed: 5.0, spawnRate: 0.05, bossHp: 25, shootRate: 45 },
    impossible: { enemySpeed: 0, spawnRate: 0, bossHp: 12, shootRate: 80 }
};

// ============================================================================
// CHARACTER MONETIZATION UPGRADE HOOKS (COOLNESS RATINGS)
// ============================================================================
let currentHeroType = 'ninja'; 
const characterInventory = { ninja: true, volt: false, goliath: false, emperor: false };

const heroesDatabase = {
    ninja: {
        name: "Shadow Ninja", coolness: 10, price: 0, color: "#111", scarfColor: "#00ff66", 
        width: 35, height: 45, speedX: 6, maxLives: 3, weapon: "shuriken", 
        description: "Baseline Balance. Clear all 4 archers for a speed surge!"
    },
    volt: {
        name: "Volt Runner", coolness: 55, price: 1.00, color: "#112244", scarfColor: "#33b5e5", 
        width: 32, height: 45, speedX: 13, maxLives: 3, weapon: "shuriken", 
        description: "Hyper-Speed Runner. Automatically cruises past ground targets."
    },
    goliath: {
        name: "Goliath Heavy", coolness: 80, price: 1.50, color: "#3d2d1d", scarfColor: "#ff6600", 
        width: 46, height: 58, speedX: 4.5, maxLives: 5, weapon: "shuriken", 
        description: "Heavy Titan. Starts with 5 lives, but slower pacing."
    },
    emperor: {
        name: "Cyber Emperor", coolness: 999, price: 5.00, color: "#2d0a3d", scarfColor: "#ff00ff", 
        width: 36, height: 46, speedX: 7.5, maxLives: 3, weapon: "rocket", 
        description: "LUXURY CLASS: Right-Click / Enter fires explosive area-of-effect Rockets!"
    }
};

const ninja = {
    x: 100, y: 0, width: 35, height: 45, speedX: 6, speedY: 0,
    gravity: 0.5, onGround: false, color: "#111", scarfColor: "#00ff66",
    facingRight: true, isAttacking: false, attackTimer: 0, attackRange: 75
};

// Runtime Entities Containers
let enemies = [], shooters = [], arrows = [], shurikens = [], platforms = [], particles = [], bosses = [];
let impossibleBossTimer = 0;

// ============================================================================
// SYSTEM NAVIGATION LOGIC
// ============================================================================
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(scr => scr.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    
    if (screenId === 'action-screen') {
        resizeCanvas();
        resetGame();
    }
}

function selectMapNode(locationName, assignedDifficulty) {
    activeLocationName = locationName;
    difficulty = assignedDifficulty;
    document.getElementById("current-location-title").innerText = `LIBERATING: ${locationName.toUpperCase()}`;
    switchScreen('action-screen');
}

function abortMission() {
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("victory-screen").classList.add("hidden");
    gameOver = true;
    switchScreen('map-screen');
}

// ============================================================================
// CHARACTER INVENTORY MARKETPLACE SIMULATOR
// ============================================================================
function purchaseHero(heroKey) {
    const hero = heroesDatabase[heroKey];
    
    // Check ownership
    if (characterInventory[heroKey] || IS_ADMIN_AUTHENTICATED) {
        currentHeroType = heroKey;
        updateShopUI();
        alert(`${hero.name} has been deployed as your active fighter!`);
        return;
    }

    // Process simulated microtransaction window
    let confirmPurchase = confirm(`PROCEED TO CHECKOUT:\n\nCharacter: ${hero.name}\nCoolness Rating: ${hero.coolness} Stars\nPrice: $${hero.price.toFixed(2)}\n\nWould you like to process this simulation purchase transaction?`);
    if (confirmPurchase) {
        characterInventory[heroKey] = true;
        currentHeroType = heroKey;
        updateShopUI();
        alert(`Transaction Success! Unlocked ${hero.name}.`);
    }
}

function updateShopUI() {
    Object.keys(heroesDatabase).forEach(key => {
        const btn = document.getElementById(`buy-btn-${key}`);
        if (!btn) return;

        if (key === currentHeroType) {
            btn.className = "buy-btn unlocked";
            btn.innerText = "Selected";
        } else if (characterInventory[key] || IS_ADMIN_AUTHENTICATED) {
            btn.className = "buy-btn unlocked";
            btn.innerText = "Equip Character";
        } else {
            btn.className = key === 'emperor' ? "buy-btn locked luxury-glow" : "buy-btn locked";
            btn.innerText = `Unlock ($${heroesDatabase[key].price.toFixed(2)})`;
        }
    });
}

// ============================================================================
// CRYPTOGRAPHIC DEVELOPER ADMIN CONTROL PANEL
// ============================================================================
function openAdminModal() {
    document.getElementById("admin-modal").classList.remove("hidden");
}

function closeAdminModal() {
    document.getElementById("admin-modal").classList.add("hidden");
    document.getElementById("admin-password-input").value = "";
    document.getElementById("admin-error-msg").classList.add("hidden");
}

function submitAdminPassword() {
    const inputPass = document.getElementById("admin-password-input").value;
    
    // Validate target key match constraints
    if (inputPass === "129643751@#") {
        IS_ADMIN_AUTHENTICATED = true;
        document.getElementById("admin-error-msg").classList.add("hidden");
        document.getElementById("admin-auth-btn").classList.add("hidden");
        document.getElementById("admin-password-input").classList.add("hidden");
        document.getElementById("admin-controls-panel").classList.remove("hidden");
        updateShopUI();
    } else {
        document.getElementById("admin-error-msg").classList.remove("hidden");
    }
}

// Secret Backdoor Shortcut Activation: Tap keyboard 'P' key to open terminal panel instantly
window.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") {
        openAdminModal();
    }
});

// Admin Sub-Command Functions
function adminToggleGodMode() {
    lives = 99;
    document.getElementById("lives-val").innerText = lives;
    alert("Admin Injector: Set Active Lives to 99.");
    closeAdminModal();
}

function adminUnlockAllStore() {
    Object.keys(characterInventory).forEach(k => characterInventory[k] = true);
    updateShopUI();
    alert("Admin Injector: All Coolness Tier store characters forced open.");
    closeAdminModal();
}

function adminInstantWin() {
    if (!gameOver && document.getElementById("action-screen").classList.contains("hidden") === false) {
        gameWon = true;
        document.getElementById("victory-screen").classList.remove("hidden");
        closeAdminModal();
    } else {
        alert("Enter an active match level before calling an Instant Win command execution.");
    }
}

// ============================================================================
// ENHANCED CORE COMBAT SUB-SYSTEM ENGINE
// ============================================================================
function applyCharacterArchetype() {
    const config = heroesDatabase[currentHeroType];
    ninja.width = config.width;
    ninja.height = config.height;
    ninja.speedX = config.speedX;
    ninja.color = config.color;
    ninja.scarfColor = config.scarfColor;
    lives = config.maxLives;
    
    document.getElementById("active-hero-lbl").innerText = config.name;
    document.getElementById("active-hero-lbl").style.color = config.scarfColor;
    document.getElementById("hero-ability-desc").innerText = `Ability: ${config.description}`;
}

function generatePlatforms() {
    platforms = [];
    const groundLevel = canvas.height - 100;
    
    platforms.push({ x: 200, y: groundLevel - 120, width: 220, height: 15 });
    platforms.push({ x: 550, y: groundLevel - 240, width: 250, height: 15 });
    platforms.push({ x: 900, y: groundLevel - 140, width: 200, height: 15 });
    platforms.push({ x: canvas.width / 2 - 150, y: groundLevel - 360, width: 300, height: 15 });

    shooters = [];
    if (difficulty !== 'impossible') {
        platforms.forEach(plat => {
            shooters.push({
                x: plat.x + plat.width / 2 - 15, y: plat.y - 42,
                width: 30, height: 42,
                platXStart: plat.x, platXEnd: plat.x + plat.width,
                speed: 1, direction: 1, shootTimer: Math.random() * 60, color: "#8a5eb8" 
            });
        });
    }
    updateArcherUI();
}

// Control Input Maps
const keys = {};
window.addEventListener("keydown", (e) => { 
    keys[e.code] = true; 
    if (e.code === "Enter" && !gameOver && !gameWon) fireSpecialWeapon();
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });
window.addEventListener("contextmenu", (e) => { e.preventDefault(); });

window.addEventListener("mousedown", (e) => {
    const screenActive = !document.getElementById("action-screen").classList.contains("hidden");
    if (gameOver || gameWon || !screenActive) return;

    if (e.button === 0) {
        if (!ninja.isAttacking) {
            ninja.isAttacking = true;
            ninja.attackTimer = 8; 
            checkSlashAttack();
        }
    } else if (e.button === 2) {
        fireSpecialWeapon();
    }
});

function fireSpecialWeapon() {
    let velocityX = ninja.facingRight ? 12 : -12;
    let spawnX = ninja.facingRight ? (ninja.x + ninja.width) : ninja.x;
    const currentWeapon = heroesDatabase[currentHeroType].weapon;

    shurikens.push({
        x: spawnX, y: ninja.y + ninja.height / 2,
        radius: currentWeapon === "rocket" ? 12 : 8,
        vx: velocityX, angle: 0,
        rotationSpeed: currentWeapon === "rocket" ? 0 : 0.25,
        type: currentWeapon 
    });
}

function updateArcherUI() {
    const elContainer = document.getElementById("powerup-status");
    if (!elContainer) return;
    if (difficulty === 'impossible') {
        elContainer.innerHTML = "<span style='color: #ff0033;'>BOSS RUSH ACTIVE!</span>";
        return;
    }
    if (hasSuperSpeed && currentHeroType === 'ninja') {
        elContainer.innerHTML = "<span style='color: #33b5e5;'>★ SUPER SPEED UNLOCKED ★</span>";
    } else {
        elContainer.innerHTML = `Archers Alive: <span id='archer-count' style='color:#ffcc00;'>${shooters.length}</span>`;
    }
}

function resetGame() {
    score = 0;
    gameOver = false;
    gameWon = false;
    bossSpawned = false;
    hasSuperSpeed = false;
    
    applyCharacterArchetype(); 
    bosses = []; enemies = []; arrows = []; shurikens = []; particles = [];
    impossibleBossTimer = 0;
    
    ninja.x = 100;
    ninja.y = canvas.height - 200;
    ninja.speedY = 0;
    ninja.facingRight = true;
    ninja.isAttacking = false;
    
    document.getElementById("score-val").innerText = score;
    document.getElementById("lives-val").innerText = lives;
    generatePlatforms();
}

function createExplosion(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
            radius: Math.random() * 4 + 2, alpha: 1, color: color
        });
    }
}

function detonateRocketExplosion(targetX, targetY) {
    screenShake = 30;
    createExplosion(targetX, targetY, "#ff3300", 25);
    createExplosion(targetX, targetY, "#ffcc00", 25);
    
    let blastRadius = 160;

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        let dX = (e.x + e.width/2) - targetX;
        let dY = (e.y + e.height/2) - targetY;
        if (Math.sqrt(dX*dX + dY*dY) <= blastRadius) {
            createExplosion(e.x + e.width/2, e.y + e.height/2, "#9acc9a");
            enemies.splice(i, 1); score++;
        }
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
        let s = shooters[i];
        let dX = (s.x + s.width/2) - targetX;
        let dY = (s.y + s.height/2) - targetY;
        if (Math.sqrt(dX*dX + dY*dY) <= blastRadius) {
            createExplosion(s.x + s.width/2, s.y + s.height/2, "#cda2db");
            shooters.splice(i, 1); score += 2;
            checkArcherPurgePowerup();
        }
    }
    for (let i = bosses.length - 1; i >= 0; i--) {
        let b = bosses[i];
        let dX = (b.x + b.width/2) - targetX;
        let dY = (b.y + b.height/2) - targetY;
        if (Math.sqrt(dX*dX + dY*dY) <= blastRadius) {
            b.hp -= 4; 
            createExplosion(b.x + b.width/2, b.y + b.height/2, "#00ff66");
            if (b.hp <= 0) {
                createExplosion(b.x + b.width/2, b.y + b.height/2, "#ff3333", 35);
                bosses.splice(i, 1); score += 10;
                checkVictoryConditions();
            }
        }
    }
    document.getElementById("score-val").innerText = score;
}

function checkSlashAttack() {
    let hitboxX = ninja.facingRight ? (ninja.x + ninja.width) : (ninja.x - ninja.attackRange);
    const attackHitbox = { x: hitboxX, y: ninja.y - 10, width: ninja.attackRange, height: ninja.height + 20 };

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        if (attackHitbox.x < e.x + e.width && attackHitbox.x + attackHitbox.width > e.x &&
            attackHitbox.y < e.y + e.height && attackHitbox.y + attackHitbox.height > e.y) {
            createExplosion(e.x + e.width/2, e.y + e.height/2, "#9acc9a");
            enemies.splice(i, 1); score++;
            document.getElementById("score-val").innerText = score;
        }
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
        let s = shooters[i];
        if (attackHitbox.x < s.x + s.width && attackHitbox.x + attackHitbox.width > s.x &&
            attackHitbox.y < s.y + s.height && attackHitbox.y + attackHitbox.height > s.y) {
            createExplosion(s.x + s.width/2, s.y + s.height/2, "#cda2db");
            shooters.splice(i, 1); score += 2; 
            document.getElementById("score-val").innerText = score;
            checkArcherPurgePowerup();
        }
    }
    for (let i = 0; i < arrows.length; i++) {
        let a = arrows[i];
        if (!a.fromPlayer) {
            if (attackHitbox.x < a.x + a.width && attackHitbox.x + attackHitbox.width > a.x &&
                attackHitbox.y < a.y + a.height && attackHitbox.y + attackHitbox.height > a.y) {
                createExplosion(a.x, a.y, "#00ff66"); 
                a.vx = -a.vx * 1.5; a.vy = -a.vy * 1.5; a.fromPlayer = true; 
            }
        }
    }
    for (let i = bosses.length - 1; i >= 0; i--) {
        let b = bosses[i];
        if (attackHitbox.x < b.x + b.width && attackHitbox.x + attackHitbox.width > b.x &&
            attackHitbox.y < b.y + b.height && attackHitbox.y + attackHitbox.height > b.y) {
            b.hp--; createExplosion(b.x + b.width/2, b.y + b.height/2, "#00ff66");
            if (b.hp <= 0) {
                createExplosion(b.x + b.width/2, b.y + b.height/2, "#ff3333", 40);
                bosses.splice(i, 1); score += 10;
                document.getElementById("score-val").innerText = score;
                checkVictoryConditions();
            }
        }
    }
}

function checkArcherPurgePowerup() {
    updateArcherUI();
    if (shooters.length === 0 && !hasSuperSpeed && currentHeroType === 'ninja') {
        hasSuperSpeed = true;
        ninja.speedX = 14; 
        updateArcherUI();
        createExplosion(ninja.x + ninja.width/2, ninja.y + ninja.height/2, "#33b5e5", 30);
    }
}

function checkVictoryConditions() {
    if ((difficulty !== 'impossible' && bossSpawned && bosses.length === 0) || 
        (difficulty === 'impossible' && score >= 60)) {
        gameWon = true;
        document.getElementById("victory-screen").classList.remove("hidden");
    }
}

function spawnZombie() {
    if (bossSpawned && difficulty !== 'impossible') return;
    if (difficulty === 'impossible') return;

    const groundLevel = canvas.height - 100;
    if (Math.random() < diffSettings[difficulty].spawnRate) {
        enemies.push({
            x: canvas.width, y: groundLevel - 40, width: 32, height: 42,
            speed: diffSettings[difficulty].enemySpeed, color: "#4d6a4e"
        });
    }
}

function spawnGiantZombieBoss(customHp = null, scale = 1) {
    const groundLevel = canvas.height - 100;
    let baseHp = customHp || diffSettings[difficulty].bossHp;
    
    bosses.push({
        x: canvas.width - (200 * scale), y: groundLevel - (180 * scale),
        width: 100 * scale, height: 180 * scale,
        speed: (difficulty === 'impossible') ? 2.5 : diffSettings[difficulty].enemySpeed * 0.5,
        hp: baseHp, maxHp: baseHp,
        color: (difficulty === 'impossible') ? "#7a1111" : "#2b4c2d",
        direction: -1, shootTimer: Math.random() * 40
    });
    bossSpawned = true;
}

function update() {
    const screenActive = !document.getElementById("action-screen").classList.contains("hidden");
    if (gameOver || gameWon || !screenActive) return;

    const groundLine = canvas.height - 100;

    if (keys["ArrowLeft"]) { ninja.x -= ninja.speedX; ninja.facingRight = false; }
    if (keys["ArrowRight"]) { ninja.x += ninja.speedX; ninja.facingRight = true; }
    if (keys["ArrowUp"] && ninja.onGround) { ninja.speedY = -14; ninja.onGround = false; }
    if (keys["ArrowDown"] && !ninja.onGround) { ninja.speedY = 18; }

    if ((currentHeroType === 'volt' || hasSuperSpeed) && (keys["ArrowLeft"] || keys["ArrowRight"])) {
        if (Math.random() < 0.4) {
            particles.push({
                x: ninja.x + Math.random()*ninja.width, y: ninja.y + Math.random()*ninja.height,
                vx: 0, vy: (Math.random() - 0.5) * 2, radius: Math.random() * 3 + 1, alpha: 0.5,
                color: "rgba(51, 181, 229, 0.5)"
            });
        }
    }

    if (ninja.isAttacking) {
        ninja.attackTimer--;
        if (ninja.attackTimer <= 0) ninja.isAttacking = false;
    }

    ninja.y += ninja.speedY;
    ninja.speedY += ninja.gravity;

    let currentlyOnSurface = false;
    if (ninja.y + ninja.height >= groundLine) {
        ninja.y = groundLine - ninja.height;
        ninja.speedY = 0; currentlyOnSurface = true;
    }

    platforms.forEach(plat => {
        if (ninja.x + ninja.width > plat.x && ninja.x < plat.x + plat.width) {
            if (ninja.speedY >= 0 && ninja.y + ninja.height <= plat.y + 12 && ninja.y + ninja.height >= plat.y - 6) {
                ninja.y = plat.y - ninja.height; ninja.speedY = 0; currentlyOnSurface = true;
            }
        }
    });
    ninja.onGround = currentlyOnSurface;

    if (ninja.x < 0) ninja.x = 0;
    if (ninja.x > canvas.width) ninja.x = 0;

    shooters.forEach(s => {
        s.x += s.speed * s.direction;
        if (s.x <= s.platXStart || s.x + s.width >= s.platXEnd) s.direction *= -1;
        s.shootTimer++;
        if (s.shootTimer >= diffSettings[difficulty].shootRate) {
            s.shootTimer = 0;
            let diffX = (ninja.x + ninja.width/2) - (s.x + s.width/2);
            let diffY = (ninja.y + ninja.height/2) - (s.y + s.height/2);
            let dist = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
            arrows.push({
                x: s.x + s.width/2, y: s.y + s.height/3, width: 15, height: 4,
                vx: (diffX / dist) * 5, vy: (diffY / dist) * 5, fromPlayer: false, isGiant: false
            });
        }
    });

    if (difficulty === 'impossible') {
        impossibleBossTimer++;
        if (bosses.length < 3 && impossibleBossTimer % 160 === 0) {
            spawnGiantZombieBoss(diffSettings.impossible.bossHp, 0.8);
        }
    }

    for (let i = bosses.length - 1; i >= 0; i--) {
        let b = bosses[i];
        b.x += b.speed * b.direction;
        if (b.x < canvas.width * 0.1) b.direction = 1;
        if (b.x > canvas.width - b.width) b.direction = -1;

        if (difficulty === 'impossible') {
            b.shootTimer++;
            if (b.shootTimer >= diffSettings.impossible.shootRate) {
                b.shootTimer = 0;
                let diffX = (ninja.x + ninja.width/2) - (b.x + b.width/2);
                let diffY = (ninja.y + ninja.height/2) - (b.y + b.height/2);
                let dist = Math.sqrt(diffX * diffX + diffY * diffY) || 1;
                arrows.push({
                    x: b.x + b.width/2, y: b.y + b.height/3, width: 45, height: 14,
                    vx: (diffX / dist) * 8, vy: (diffY / dist) * 8, fromPlayer: false, isGiant: true
                });
            }
        }
        if (ninja.x < b.x + b.width && ninja.x + ninja.width > b.x && ninja.y < b.y + b.height && ninja.y + ninja.height > b.y) {
            lives--; document.getElementById("lives-val").innerText = lives;
            ninja.x = 50; 
            if (lives <= 0) { gameOver = true; document.getElementById("game-over-screen").classList.remove("hidden"); }
        }
    }

    for (let i = arrows.length - 1; i >= 0; i--) {
        let a = arrows[i]; a.x += a.vx; a.y += a.vy;
        if (!a.fromPlayer) {
            if (ninja.x < a.x + a.width && ninja.x + ninja.width > a.x && ninja.y < a.y + a.height && ninja.y + ninja.height > a.y) {
                arrows.splice(i, 1); lives = a.isGiant ? lives - 2 : lives - 1;
                document.getElementById("lives-val").innerText = lives;
                if (lives <= 0) { gameOver = true; document.getElementById("game-over-screen").classList.remove("hidden"); }
                continue;
            }
        } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
                let e = enemies[j];
                if (a.x < e.x + e.width && a.x + a.width > e.x && a.y < e.y + e.height && a.y + a.height > e.y) {
                    createExplosion(e.x + e.width/2, e.y + e.height/2, "#9acc9a");
                    enemies.splice(j, 1); score++; document.getElementById("score-val").innerText = score;
                    arrows.splice(i, 1); break;
                }
            }
            if (arrows[i] === undefined) continue; 
            for (let k = shooters.length - 1; k >= 0; k--) {
                let s = shooters[k];
                if (a.x < s.x + s.width && a.x + a.width > s.x && a.y < s.y + s.height && a.y + a.height > s.y) {
                    createExplosion(s.x + s.width/2, s.y + s.height/2, "#cda2db");
                    shooters.splice(k, 1); score += 2; document.getElementById("score-val").innerText = score;
                    arrows.splice(i, 1); checkArcherPurgePowerup(); break;
                }
            }
            if (arrows[i] === undefined) continue;
            for (let bIdx = bosses.length - 1; bIdx >= 0; bIdx--) {
                let b = bosses[bIdx];
                if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) {
                    b.hp -= a.isGiant ? 3 : 1;
                    createExplosion(b.x + b.width/2, b.y + b.height/2, "#00ff66"); arrows.splice(i, 1);
                    if (b.hp <= 0) {
                        createExplosion(b.x + b.width/2, b.y + b.height/2, "#ff3333", 35);
                        bosses.splice(bIdx, 1); score += 10; document.getElementById("score-val").innerText = score;
                        checkVictoryConditions();
                    }
                    break;
                }
            }
        }
        if (a.x < -100 || a.x > canvas.width + 100 || a.y < -100 || a.y > canvas.height + 100) arrows.splice(i, 1);
    }

    for (let i = shurikens.length - 1; i >= 0; i--) {
        let sh = shurikens[i]; sh.x += sh.vx; sh.angle += sh.rotationSpeed; 

        if (sh.type === "rocket") {
            let triggeredDetonation = false;
            for (let j = 0; j < enemies.length; j++) {
                if (sh.x > enemies[j].x && sh.x < enemies[j].x + enemies[j].width && sh.y > enemies[j].y && sh.y < enemies[j].y + enemies[j].height) { triggeredDetonation = true; break; }
            }
            if (!triggeredDetonation) {
                for (let k = 0; k < shooters.length; k++) {
                    if (sh.x > shooters[k].x && sh.x < shooters[k].x + shooters[k].width && sh.y > shooters[k].y && sh.y < shooters[k].y + shooters[k].height) { triggeredDetonation = true; break; }
                }
            }
            if (!triggeredDetonation) {
                for (let b = 0; b < bosses.length; b++) {
                    if (sh.x > bosses[b].x && sh.x < bosses[b].x + bosses[b].width && sh.y > bosses[b].y && sh.y < bosses[b].y + bosses[b].height) { triggeredDetonation = true; break; }
                }
            }
            if (triggeredDetonation) { detonateRocketExplosion(sh.x, sh.y); shurikens.splice(i, 1); continue; }
        } else {
            for (let j = enemies.length - 1; j >= 0; j--) {
                let e = enemies[j];
                if (sh.x + sh.radius > e.x && sh.x - sh.radius < e.x + e.width && sh.y + sh.radius > e.y && sh.y - sh.radius < e.y + e.height) {
                    createExplosion(e.x + e.width/2, e.y + e.height/2, "#9acc9a");
                    enemies.splice(j, 1); score++; document.getElementById("score-val").innerText = score;
                    shurikens.splice(i, 1); break;
                }
            }
            if (shurikens[i] === undefined) continue;
            for (let k = shooters.length - 1; k >= 0; k--) {
                let s = shooters[k];
                if (sh.x + sh.radius > s.x && sh.x - sh.radius < s.x + s.width && sh.y + sh.radius > s.y && sh.y - sh.radius < s.y + s.height) {
                    createExplosion(s.x + s.width/2, s.y + s.height/2, "#cda2db");
                    shooters.splice(k, 1); score += 2; document.getElementById("score-val").innerText = score;
                    shurikens.splice(i, 1); checkArcherPurgePowerup(); break;
                }
            }
            if (shurikens[i] === undefined) continue;
            for (let bIdx = bosses.length - 1; bIdx >= 0; bIdx--) {
                let b = bosses[bIdx];
                if (sh.x + sh.radius > b.x && sh.x - sh.radius < b.x + b.width && sh.y + sh.radius > b.y && sh.y - sh.radius < b.y + b.height) {
                    b.hp--; createExplosion(b.x + b.width/2, b.y + b.height/2, "#00ff66"); shurikens.splice(i, 1);
                    if (b.hp <= 0) {
                        createExplosion(b.x + b.width/2, b.y + b.height/2, "#ff3333", 35);
                        bosses.splice(bIdx, 1); score += 10; document.getElementById("score-val").innerText = score;
                        checkVictoryConditions();
                    }
                    break;
                }
            }
        }
        if (shurikens[i] && (sh.x < -40 || sh.x > canvas.width + 40)) shurikens.splice(i, 1);
    }

    if (difficulty !== 'impossible' && score >= 15 && !bossSpawned) spawnGiantZombieBoss();
    spawnZombie();

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= 0.02;
        if (p.alpha <= 0) particles.splice(i, 1);
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i]; e.x -= e.speed;
        if (ninja.x < e.x + e.width && ninja.x + ninja.width > e.x && ninja.y < e.y + e.height && ninja.y + ninja.height > e.y) {
            enemies.splice(i, 1); lives--; document.getElementById("lives-val").innerText = lives;
            if (lives <= 0) { gameOver = true; document.getElementById("game-over-screen").classList.remove("hidden"); }
        }
        if (e.x + e.width < 0) enemies.splice(i, 1);
    }

    if (screenShake > 0) screenShake *= 0.9;
    if (screenShake < 0.5) screenShake = 0;
}

function draw() {
    const screenActive = !document.getElementById("action-screen").classList.contains("hidden");
    if (!screenActive) return;

    ctx.save();
    if (screenShake > 0) ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#141419"; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const groundLine = canvas.height - 100;
    platforms.forEach(plat => {
        ctx.fillStyle = "#5c4033"; ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = "#00ff66"; ctx.fillRect(plat.x, plat.y, plat.width, 3);
    });

    ctx.fillStyle = "#09090d"; ctx.fillRect(0, groundLine, canvas.width, 100);
    ctx.fillStyle = "#22222b"; ctx.fillRect(0, groundLine, canvas.width, 6);

    particles.forEach(p => {
        ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });

    ctx.fillStyle = ninja.color; ctx.fillRect(ninja.x, ninja.y, ninja.width, ninja.height);
    ctx.fillStyle = ninja.scarfColor;
    if (ninja.facingRight) {
        ctx.fillRect(ninja.x - 10, ninja.y + 12, 12, 6); 
        ctx.fillStyle = "#fff"; ctx.fillRect(ninja.x + (ninja.width - 13), ninja.y + 8, 8, 3);   
    } else {
        ctx.fillRect(ninja.x + ninja.width, ninja.y + 12, 12, 6); 
        ctx.fillStyle = "#fff"; ctx.fillRect(ninja.x + 5, ninja.y + 8, 8, 3);    
    }

    if (ninja.isAttacking) {
        ctx.save();
        let slashCenterX = ninja.facingRight ? (ninja.x + ninja.width + 10) : (ninja.x - 10);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(slashCenterX, ninja.y + ninja.height / 2, ninja.attackRange - 20, 0, Math.PI*2); ctx.stroke();
        ctx.restore();
    }

    enemies.forEach(e => {
        ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.width, e.height);
    });
    shooters.forEach(s => {
        ctx.fillStyle = s.color; ctx.fillRect(s.x, s.y, s.width, s.height);
    });
    arrows.forEach(a => {
        ctx.fillStyle = a.isGiant ? "#ff0055" : "#e69122"; ctx.fillRect(a.x, a.y, a.width, a.height);
    });

    shurikens.forEach(sh => {
        ctx.save(); ctx.translate(sh.x, sh.y);
        if (sh.type === "rocket") {
            ctx.fillStyle = "#ff3300"; ctx.fillRect(-12, -4, 24, 8);
        } else {
            ctx.rotate(sh.angle); ctx.fillStyle = "#d1d5db"; ctx.fillRect(-6, -6, 12, 12);
        }
        ctx.restore();
    });

    bosses.forEach(b => {
        ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(b.x - 10, b.y - 25, b.width + 20, 10);
        ctx.fillStyle = "#ff0055"; let hpRatio = (b.hp / b.maxHp) * (b.width + 20); ctx.fillRect(b.x - 10, b.y - 25, hpRatio, 10);
    });

    ctx.restore();
}

function gameLoop() {
    update(); draw(); requestAnimationFrame(gameLoop);
}
gameLoop();