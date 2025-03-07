import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { Player } from './player.js';
import { Colleague } from './colleague.js';
import { JiraTicket } from './jiraTicket.js';

class Game {
    constructor() {
        // Set up title screen
        this.titleScreen = document.getElementById('titleScreen');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.gameStarted = false;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.wip = 0;
        this.isGameOver = false;
        this.storyPoints = 0;
        this.lastPointIncrement = Date.now();
        this.lastColleagueSpawn = Date.now();
        this.colleagueSpawnInterval = 30000; // 30 seconds
        
        // Set up the game but don't start yet
        this.setupGame();

        // Add start button listener
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());

        // Start render loop
        this.animate();
    }

    setupGame() {
        // Set up office floor
        const floorSize = 50;
        const floorGroup = new THREE.Group();
        
        // Base floor with carpet texture
        const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x607D8B,  // Blue-gray carpet color
            side: THREE.DoubleSide 
        });
        const baseFloor = new THREE.Mesh(floorGeometry, floorMaterial);
        floorGroup.add(baseFloor);

        // Add grid lines for tiles/carpet pattern
        const gridHelper = new THREE.GridHelper(floorSize, 25, 0x455A64, 0x455A64);
        gridHelper.rotation.x = Math.PI / 2;
        floorGroup.add(gridHelper);

        // Add desks with computers and flowers
        const deskPositions = [
            { x: -18, z: -12 },  // Left desk
            { x: 0, z: 8 },      // Center desk
            { x: 18, z: -10 }    // Right desk
        ];

        deskPositions.forEach(pos => {
            // Create desk
            const deskGeometry = new THREE.BoxGeometry(6, 0.5, 3);
            const deskMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Wood color
            const desk = new THREE.Mesh(deskGeometry, deskMaterial);
            desk.position.set(pos.x, 0, pos.z);
            this.scene.add(desk);

            // Add desk legs
            const legGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
            const legMaterial = new THREE.MeshBasicMaterial({ color: 0x5C3A21 });
            
            const positions = [
                { x: -2.5, z: -1.2 }, // Front left
                { x: 2.5, z: -1.2 },  // Front right
                { x: -2.5, z: 1.2 },  // Back left
                { x: 2.5, z: 1.2 }    // Back right
            ];

            positions.forEach(legPos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(
                    pos.x + legPos.x,
                    -0.75,
                    pos.z + legPos.z
                );
                this.scene.add(leg);
            });

            // Add computer
            const monitorStand = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.5, 0.3),
                new THREE.MeshBasicMaterial({ color: 0x2C3E50 })
            );
            monitorStand.position.set(pos.x, 0.5, pos.z);
            this.scene.add(monitorStand);

            const monitor = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1.2, 0.1),
                new THREE.MeshBasicMaterial({ color: 0x2C3E50 })
            );
            monitor.position.set(pos.x, 1.3, pos.z);
            this.scene.add(monitor);

            const screen = new THREE.Mesh(
                new THREE.PlaneGeometry(1.8, 1),
                new THREE.MeshBasicMaterial({ color: 0x85C1E9 })
            );
            screen.position.set(pos.x, 1.3, pos.z + 0.06);
            this.scene.add(screen);

            // Add flower vase
            const vaseGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 8);
            const vaseMaterial = new THREE.MeshBasicMaterial({ color: 0x48C9B0 });
            const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
            vase.position.set(pos.x + 1.5, 0.45, pos.z - 0.8);
            this.scene.add(vase);

            // Add flowers
            const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF6B6B];
            for (let i = 0; i < 3; i++) {
                const flowerGeometry = new THREE.SphereGeometry(0.15, 8, 8);
                const flowerMaterial = new THREE.MeshBasicMaterial({ color: flowerColors[i] });
                const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flower.position.set(
                    pos.x + 1.5 + (Math.random() * 0.2 - 0.1),
                    0.8 + (Math.random() * 0.1),
                    pos.z - 0.8 + (Math.random() * 0.2 - 0.1)
                );
                this.scene.add(flower);
            }

            // Add stem
            const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
            const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(pos.x + 1.5, 0.6, pos.z - 0.8);
            this.scene.add(stem);
        });

        // Add walkways (slightly different color)
        const walkwayGeometry = new THREE.PlaneGeometry(4, floorSize);
        const walkwayMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x78909C,
            side: THREE.DoubleSide 
        });

        // Vertical walkway
        const verticalWalkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
        verticalWalkway.position.y = 0.005;
        floorGroup.add(verticalWalkway);

        // Horizontal walkway
        const horizontalWalkway = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
        horizontalWalkway.rotation.z = Math.PI / 2;
        horizontalWalkway.position.y = 0.005;
        floorGroup.add(horizontalWalkway);

        floorGroup.rotation.x = -Math.PI / 2;
        floorGroup.position.y = -1;
        this.scene.add(floorGroup);

        // Set up lighting
        const light = new THREE.AmbientLight(0xffffff);
        this.scene.add(light);

        // Position camera for isometric view
        const iso = Math.PI / 6; // 30 degrees
        this.camera.position.set(30 * Math.cos(iso), 20, 30 * Math.sin(iso));
        this.camera.lookAt(0, 0, 0);

        // Create player
        this.player = new Player();
        this.scene.add(this.player.mesh);

        // Create colleagues
        this.colleagues = [];
        for (let i = 0; i < 3; i++) {
            const colleague = new Colleague();
            this.colleagues.push(colleague);
            this.scene.add(colleague.mesh);
        }

        // Array to store active Jira tickets
        this.jiraTickets = [];
    }

    startGame() {
        this.gameStarted = true;
        this.titleScreen.style.display = 'none';
        this.storyPoints = 0;
        this.lastPointIncrement = Date.now();
        this.lastColleagueSpawn = Date.now();
        document.getElementById('storyPoints').textContent = `Business Value: ${this.storyPoints}`;

        // Set up controls
        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (event) => {
            if (this.isGameOver || !this.gameStarted) return;
            this.player.handleKeyDown(event);
        });

        document.addEventListener('keyup', (event) => {
            if (this.isGameOver || !this.gameStarted) return;
            this.player.handleKeyUp(event);
        });
    }

    checkCollisions() {
        for (let ticket of this.jiraTickets) {
            if (ticket.mesh.position.distanceTo(this.player.mesh.position) < 1) {
                this.wip++;
                document.getElementById('score').textContent = `WIP: ${this.wip}`;
                
                // Remove the ticket
                this.scene.remove(ticket.mesh);
                this.jiraTickets = this.jiraTickets.filter(t => t !== ticket);

                if (this.wip >= 3) {
                    this.gameOver();
                }
            }
        }
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = this.storyPoints;
    }

    restartGame() {
        // Hide game over screen
        document.getElementById('gameOver').style.display = 'none';
        
        // Reset game state
        this.wip = 0;
        document.getElementById('score').textContent = 'WIP: 0';
        this.storyPoints = 0;
        this.lastPointIncrement = Date.now();
        this.lastColleagueSpawn = Date.now();
        document.getElementById('storyPoints').textContent = `Business Value: ${this.storyPoints}`;
        this.isGameOver = false;
        
        // Reset player position
        this.player.mesh.position.set(0, 0, 0);
        this.player.velocity.set(0, 0, 0);
        
        // Clear all Jira tickets
        for (let ticket of this.jiraTickets) {
            this.scene.remove(ticket.mesh);
        }
        this.jiraTickets = [];
        
        // Reset colleagues to random positions
        for (let colleague of this.colleagues) {
            this.scene.remove(colleague.mesh);
        }
        this.colleagues = [];
        for (let i = 0; i < 3; i++) {
            const colleague = new Colleague();
            this.colleagues.push(colleague);
            this.scene.add(colleague.mesh);
        }
    }

    showNewStakeholderMessage() {
        const message = document.createElement('div');
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#ff4444';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.fontSize = '32px';
        message.style.fontWeight = 'bold';
        message.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        message.textContent = 'A new stakeholder has joined!';
        document.body.appendChild(message);

        // Fade out and remove after 2 seconds
        message.style.transition = 'opacity 2s';
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 2000);
        }, 2000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Only update game logic if the game has started and isn't over
        if (!this.gameStarted || this.isGameOver) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Increment story points every second
        const now = Date.now();
        if (now - this.lastPointIncrement >= 1000) {
            this.storyPoints++;
            document.getElementById('storyPoints').textContent = `Business Value: ${this.storyPoints}`;
            this.lastPointIncrement = now;
        }

        // Add new colleague every 30 seconds
        if (now - this.lastColleagueSpawn >= this.colleagueSpawnInterval) {
            const newColleague = new Colleague();
            this.colleagues.push(newColleague);
            this.scene.add(newColleague.mesh);
            this.lastColleagueSpawn = now;
            this.showNewStakeholderMessage();
        }

        // Update player
        this.player.update();

        // Update colleagues and generate Jira tickets
        for (let colleague of this.colleagues) {
            colleague.update();
            if (Math.random() < 0.01) { // 1% chance each frame to throw a ticket
                const ticket = new JiraTicket(colleague.mesh.position, this.player.mesh.position);
                this.jiraTickets.push(ticket);
                this.scene.add(ticket.mesh);
            }
        }

        // Update Jira tickets
        for (let ticket of this.jiraTickets) {
            ticket.update();
            if (ticket.isOutOfBounds()) {
                this.scene.remove(ticket.mesh);
                this.jiraTickets = this.jiraTickets.filter(t => t !== ticket);
            }
        }

        this.checkCollisions();
        this.renderer.render(this.scene, this.camera);
    }
}

new Game(); 