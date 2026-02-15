import { CONFIG } from '../config';

export class InputManager {
    constructor() {
        this.keys = {};
        this.tilt = 0; // -1 to 1 based on gamma
        this.isMobile = false;

        // Check if device orientation is available (rough check)
        // In a real scenario, we'd do a more robust feature detection
        // For now, we'll try to listen to it.
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
        }

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    handleOrientation(e) {
        // Gamma is the left-to-right tilt in degrees (-90 to 90)
        // When in landscape, gamma acts as the tilt.
        // However, it depends on browser implementation and exact orientation.
        // Typically for landscape:
        // - Beta might be the tilt if we consider landscape as base.
        // - But standard API: Gamma is rotation around Y axis.
        // If phone is landscape (held with home button on right), tilting screen towards you/away is Beta, tilting left/right is Gamma.
        // Actually, when held in landscape:
        // - Tilting left/right (like a steering wheel) is Beta.
        // Let's use 'beta' primarily for landscape steering if orientation is 90/-90.

        let tiltValue = 0;

        // We can use window.orientation (deprecated but useful) or screen.orientation
        const angle = screen.orientation ? screen.orientation.angle : window.orientation || 0;

        if (angle === 90) {
            // Landscape (Home button right)
            // Beta: -180 to 180.
            // Tilting left (up) -> negative beta
            // Tilting right (down) -> positive beta
            tiltValue = e.beta;
        } else if (angle === -90 || angle === 270) {
            // Landscape (Home button left)
            // Beta is inverted
            tiltValue = -e.beta;
        } else {
            // Portrait - fallback to Gamma? User shouldn't be here due to orientation gate.
            tiltValue = e.gamma;
        }

        // Dead zone and scaling
        const deadZone = 5;
        const maxTilt = 20;

        if (Math.abs(tiltValue) < deadZone) {
            this.tilt = 0;
        } else {
            let val = (Math.abs(tiltValue) - deadZone) / (maxTilt - deadZone);
            val = Math.min(1, Math.max(0, val));
            this.tilt = tiltValue > 0 ? val : -val;
        }
    }

    getDirection() {
        // Keyboard has priority if pressed
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) return -1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) return 1;

        // Otherwise tilt
        // For this game, we want simple -1 or 1, or maybe analog?
        // "Aro moves left and right" - usually implies speed is constant or we just toggle direction.
        // Let's implement full speed control or just threshold.
        // User requirement: "PC: arrows. Mobile: rotating phone."
        // Let's return the float value for "analog" feel, or just sign for digital.
        // Start with digital feel for consistency with keyboard.
        if (this.tilt < -0.3) return -1;
        if (this.tilt > 0.3) return 1;

        return 0;
    }

    // Helper to request permission (needed for iOS 13+)
    static async requestPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    return true;
                } else {
                    alert('Permission for accelerometer was denied');
                    return false;
                }
            } catch (error) {
                console.error(error);
                return false;
            }
        }
        return true;
    }
}
