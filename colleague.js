import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Colleague {
    constructor() {
        this.mesh = new THREE.Group();

        // Body - red shirt
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 }); // Light red
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const skinMaterial = new THREE.MeshBasicMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.1;
        this.mesh.add(head);

        // Hair - different hairstyle than player
        const hairGeometry = new THREE.BoxGeometry(0.85, 0.2, 0.85);
        const hairMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 }); // Dark hair
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.35;
        this.mesh.add(hair);

        // Name tag
        const tagGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
        const tagMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const nameTag = new THREE.Mesh(tagGeometry, tagMaterial);
        nameTag.position.set(0, 0.5, 0.3);
        this.mesh.add(nameTag);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xff9999 }); // Match shirt
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 0.4, 0);
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 0.4, 0);
        this.mesh.add(rightArm);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark gray pants
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.8, 0);
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, -0.8, 0);
        this.mesh.add(rightLeg);
        
        // Random starting position
        this.mesh.position.x = (Math.random() - 0.5) * 40;
        this.mesh.position.z = (Math.random() - 0.5) * 40;
        
        this.speed = 0.1;
        this.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
        
        // Add walking animation properties
        this.walkCycle = Math.random() * Math.PI * 2; // Random start phase
    }

    update() {
        // Calculate next position
        const nextPosition = this.mesh.position.clone().add(
            this.direction.clone().multiplyScalar(this.speed)
        );
        
        // Check desk collisions
        const deskPositions = [
            { x: -18, z: -12 },
            { x: 0, z: 8 },
            { x: 18, z: -10 }
        ];
        
        const deskWidth = 6;
        const deskDepth = 3;
        
        let collision = false;
        deskPositions.forEach(desk => {
            if (Math.abs(nextPosition.x - desk.x) < deskWidth/2 + 0.5 && 
                Math.abs(nextPosition.z - desk.z) < deskDepth/2 + 0.5) {
                collision = true;
                
                // Calculate avoidance direction
                const toDesk = new THREE.Vector3(
                    desk.x - this.mesh.position.x,
                    0,
                    desk.z - this.mesh.position.z
                ).normalize();
                
                // Create a perpendicular direction to avoid the desk
                this.direction.set(-toDesk.z, 0, toDesk.x);
                
                // Randomly choose between clockwise and counterclockwise
                if (Math.random() < 0.5) {
                    this.direction.multiplyScalar(-1);
                }
            }
        });
        
        if (!collision) {
            this.mesh.position.copy(nextPosition);
        }

        // Make character face movement direction
        this.mesh.rotation.y = Math.atan2(this.direction.x, this.direction.z);
        
        // Bounce off walls
        if (Math.abs(this.mesh.position.x) > 24) {
            this.direction.x *= -1;
        }
        if (Math.abs(this.mesh.position.z) > 24) {
            this.direction.z *= -1;
        }

        // Walking animation
        this.walkCycle += 0.1;
        const swing = Math.sin(this.walkCycle) * 0.2;
        this.mesh.children.forEach((part, index) => {
            if (index === 5) part.rotation.x = swing;
            if (index === 6) part.rotation.x = -swing;
            if (index === 7) part.rotation.x = -swing;
            if (index === 8) part.rotation.x = swing;
        });
    }
} 