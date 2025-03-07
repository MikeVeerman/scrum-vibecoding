import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';

export class JiraTicket {
    constructor(startPosition, targetPosition) {
        // Create a group to hold the Post-it note parts
        this.mesh = new THREE.Group();
        
        // Main Post-it note
        const postItGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const postItMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff99,  // Light yellow
            side: THREE.DoubleSide 
        });
        const postIt = new THREE.Mesh(postItGeometry, postItMaterial);
        
        // Add a slightly darker border/shadow effect
        const borderGeometry = new THREE.BoxGeometry(1.05, 1.05, 0.05);
        const borderMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xe6e689  // Slightly darker yellow
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.05;

        // Add some "text" lines using thin boxes
        const lineGeometry = new THREE.BoxGeometry(0.7, 0.1, 0.01);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
        
        const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
        line1.position.set(0, 0.2, 0.06);
        
        const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
        line2.position.set(0, 0, 0.06);
        
        const line3 = new THREE.Mesh(lineGeometry, lineMaterial);
        line3.position.set(0, -0.2, 0.06);

        // Add all parts to the group
        this.mesh.add(border);
        this.mesh.add(postIt);
        this.mesh.add(line1);
        this.mesh.add(line2);
        this.mesh.add(line3);

        // Position the ticket
        this.mesh.position.copy(startPosition);
        
        // Add some random rotation for visual interest
        this.mesh.rotation.z = Math.random() * Math.PI * 2;
        this.mesh.rotation.x = Math.PI / 6; // Tilt forward slightly
        
        // Calculate direction towards player
        this.direction = new THREE.Vector3()
            .subVectors(targetPosition, startPosition)
            .normalize();
        
        this.speed = 0.3;

        // Add spinning effect
        this.spinSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        const movement = this.direction.clone().multiplyScalar(this.speed);
        this.mesh.position.add(movement);
        
        // Make it spin as it flies
        this.mesh.rotation.z += this.spinSpeed;
    }

    isOutOfBounds() {
        return Math.abs(this.mesh.position.x) > 25 || 
               Math.abs(this.mesh.position.z) > 25;
    }
} 