import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class Player {
    constructor() {
        this.mesh = new THREE.Group();

        // Body - light blue shirt
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x99ccff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const skinMaterial = new THREE.MeshBasicMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 1.1;
        this.mesh.add(head);

        // Hair
        const hairGeometry = new THREE.BoxGeometry(0.85, 0.3, 0.85);
        const hairMaterial = new THREE.MeshBasicMaterial({ color: 0x4a3000 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.4;
        this.mesh.add(hair);

        // Glasses
        const glassesGeometry = new THREE.BoxGeometry(0.9, 0.2, 0.1);
        const glassesMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
        glasses.position.set(0, 1.1, 0.3);
        this.mesh.add(glasses);

        // Lenses (two circles)
        const lensGeometry = new THREE.CircleGeometry(0.15, 16);
        const lensMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff });
        
        const leftLens = new THREE.Mesh(lensGeometry, lensMaterial);
        leftLens.position.set(-0.25, 1.1, 0.31);
        this.mesh.add(leftLens);
        
        const rightLens = new THREE.Mesh(lensGeometry, lensMaterial);
        rightLens.position.set(0.25, 1.1, 0.31);
        this.mesh.add(rightLens);

        // Tie
        const tieGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.1);
        const tieMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const tie = new THREE.Mesh(tieGeometry, tieMaterial);
        tie.position.set(0, 0.4, 0.3);
        this.mesh.add(tie);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0x99ccff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.6, 0.4, 0);
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.6, 0.4, 0);
        this.mesh.add(rightArm);

        // Legs
        const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x000066 }); // Dark blue pants
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, -0.8, 0);
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, -0.8, 0);
        this.mesh.add(rightLeg);

        // Initialize with the tie facing forward
        this.mesh.rotation.y = -Math.PI / 2;  // Rotate 90 degrees so tie faces forward
        
        this.speed = 0.2;
        this.rotationSpeed = 0.15;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3(0, 0, 1);
        this.walkCycle = 0;
        this.isMoving = false;
        
        // Add separate flags for movement and rotation
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.movingForward = false;
        this.movingBackward = false;
    }

    handleKeyDown(event) {
        switch(event.key) {
            case 'ArrowUp':
                this.movingForward = true;
                break;
            case 'ArrowDown':
                this.movingBackward = true;
                break;
            case 'ArrowLeft':
                this.rotatingLeft = true;
                break;
            case 'ArrowRight':
                this.rotatingRight = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.key) {
            case 'ArrowUp':
                this.movingForward = false;
                break;
            case 'ArrowDown':
                this.movingBackward = false;
                break;
            case 'ArrowLeft':
                this.rotatingLeft = false;
                break;
            case 'ArrowRight':
                this.rotatingRight = false;
                break;
        }
    }

    update() {
        // Handle rotation
        if (this.rotatingLeft) {
            this.mesh.rotation.y += this.rotationSpeed;
            this.direction.set(
                Math.sin(this.mesh.rotation.y),
                0,
                Math.cos(this.mesh.rotation.y)
            );
        }
        if (this.rotatingRight) {
            this.mesh.rotation.y -= this.rotationSpeed;
            this.direction.set(
                Math.sin(this.mesh.rotation.y),
                0,
                Math.cos(this.mesh.rotation.y)
            );
        }

        // Handle movement
        if (this.movingForward || this.movingBackward) {
            const moveDirection = this.direction.clone();
            if (this.movingBackward) {
                moveDirection.multiplyScalar(-1);
            }
            this.velocity.copy(moveDirection.multiplyScalar(this.speed));
        } else {
            this.velocity.set(0, 0, 0);
        }

        // Check desk collisions before moving
        const nextPosition = this.mesh.position.clone().add(this.velocity);
        const deskPositions = [
            { x: -18, z: -12 },
            { x: 0, z: 8 },
            { x: 18, z: -10 }
        ];
        
        // Desk dimensions
        const deskWidth = 6;
        const deskDepth = 3;
        
        let collision = false;
        deskPositions.forEach(desk => {
            if (Math.abs(nextPosition.x - desk.x) < deskWidth/2 + 0.5 && 
                Math.abs(nextPosition.z - desk.z) < deskDepth/2 + 0.5) {
                collision = true;
            }
        });
        
        // Only update position if there's no collision
        if (!collision) {
            this.mesh.position.add(this.velocity);
        }

        // Keep player within bounds
        this.mesh.position.x = Math.max(-24, Math.min(24, this.mesh.position.x));
        this.mesh.position.z = Math.max(-24, Math.min(24, this.mesh.position.z));

        // Add walking animation when moving
        if ((this.movingForward || this.movingBackward) && !collision) {
            this.walkCycle += 0.2;
            const swing = Math.sin(this.walkCycle) * 0.2;
            this.mesh.children.forEach((part, index) => {
                if (index === 7) part.rotation.x = swing;
                if (index === 8) part.rotation.x = -swing;
                if (index === 9) part.rotation.x = -swing;
                if (index === 10) part.rotation.x = swing;
            });
        }
    }
} 