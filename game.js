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

        // Add desk areas (lighter rectangles)
        const deskGeometry = new THREE.PlaneGeometry(8, 4);
        const deskMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x90A4AE,
            side: THREE.DoubleSide 
        });

        // Create desk clusters
        const deskPositions = [
            { x: -15, z: -15 }, { x: -15, z: 15 },
            { x: 15, z: -15 }, { x: 15, z: 15 },
            { x: 0, z: -15 }, { x: 0, z: 15 }
        ];

        deskPositions.forEach(pos => {
            const deskArea = new THREE.Mesh(deskGeometry, deskMaterial);
            deskArea.position.set(pos.x, 0.01, pos.z); // Slightly above floor to prevent z-fighting
            floorGroup.add(deskArea);
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
    }

    restartGame() {
        // Hide game over screen
        document.getElementById('gameOver').style.display = 'none';
        
        // Reset game state
        this.wip = 0;
        document.getElementById('score').textContent = 'WIP: 0';
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
            colleague.mesh.position.x = (Math.random() - 0.5) * 40;
            colleague.mesh.position.z = (Math.random() - 0.5) * 40;
            colleague.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Only update game logic if the game has started and isn't over
        if (!this.gameStarted || this.isGameOver) {
            this.renderer.render(this.scene, this.camera);
            return;
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