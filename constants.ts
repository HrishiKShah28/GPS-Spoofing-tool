import type { Scenario } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PROTECTED_ZONE = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: 80 };
export const SAFE_ZONE = { x: CANVAS_WIDTH * 0.8, y: CANVAS_HEIGHT * 0.8, radius: 60 };
export const DRONE_START_POS = { x: CANVAS_WIDTH - 50, y: 50 };
export const WARNING_DISTANCE = 200;


export const SCENARIOS: Scenario[] = [
  { 
    id: 'bluetooth', 
    name: 'Bluetooth Drone', 
    description: 'Short-range, fast, and low-flying threat.', 
    range: '< 100m', 
    speed: 0.8, 
    altitude: 50,
    defenseMethod: 'Signal Overpowering',
    bestUseCase: 'Close-range denial of consumer drones in crowded areas.'
  },
  { 
    id: 'wifi', 
    name: 'WiFi Drone', 
    description: 'Medium-range commercial drone.', 
    range: '100-500m', 
    speed: 0.6, 
    altitude: 100,
    defenseMethod: 'Coordinate Shifting',
    bestUseCase: 'Subtly diverting commercial drones from sensitive locations.'
  },
  { 
    id: 'satellite', 
    name: 'Satellite GPS Drone', 
    description: 'Long-range surveillance drone.', 
    range: 'Global', 
    speed: 0.4, 
    altitude: 200,
    defenseMethod: 'Signal Hijacking',
    bestUseCase: 'Taking control of high-value assets relying on public GPS.'
  },
  { 
    id: 'geofence', 
    name: 'Geo-Fenced Drone', 
    description: 'Programmed to avoid specific zones.', 
    range: 'Configurable', 
    speed: 0.7, 
    altitude: 75,
    defenseMethod: 'Virtual Boundary Manipulation',
    bestUseCase: 'Tricking automated drones into violating their own no-fly zones.'
  },
];

export const SCENARIO_BRIEFINGS = {
  bluetooth: {
    ingress: "**Status: Ingress.** A high-speed, low-altitude drone has been detected on a direct course for the protected zone.",
    detected: "**Status: Threat Detected!** The drone is in critical range. Activate the GPS spoofer now.",
    defense_active: "**Status: Defense Active.** Counterfeit GPS signal is broadcasting, diverting the drone towards the Safe Zone. Path correction is in progress.",
    neutralized: "**Status: Threat Neutralized.** The drone has been successfully diverted into the designated safe area."
  },
  wifi: {
    ingress: "**Status: Ingress.** A commercial-grade WiFi drone is approaching. Monitor its trajectory.",
    detected: "**Status: Threat Detected!** The drone has breached the outer perimeter. Prepare to engage countermeasures.",
    defense_active: "**Status: Defense Active.** The spoofer is active, shifting the drone's perceived position. Its actual trajectory is now curving toward the Safe Zone.",
    neutralized: "**Status: Threat Neutralized.** The drone's navigation has been successfully compromised, leading it into the safe zone."
  },
  satellite: {
    ingress: "**Status: Ingress.** A long-range surveillance drone is on approach. Awaiting optimal engagement window.",
    detected: "**Status: Threat Detected!** The drone is entering the effective range of our ground-based spoofer. It is now vulnerable.",
    defense_active: "**Status: Defense Active.** Broadcasting a powerful, localized GPS signal to overpower the satellite link. Its flight path is being altered.",
    neutralized: "**Status: Threat Neutralized.** The drone has been successfully steered into the safe diversion zone."
  },
  geofence: {
    ingress: "**Status: Ingress.** An automated drone with geo-fencing is approaching. We will override its instructions.",
    detected: "**Status: Threat Detected!** The drone is nearing its programmed boundary. Ideal moment to engage.",
    defense_active: "**Status: Defense Active.** Our spoofing signal is creating a 'virtual' location for the drone, tricking its system into believing it is on a safe course while we guide it.",
    neutralized: "**Status: Threat Neutralized.** The drone's geo-fencing has been bypassed by manipulating its perceived position."
  }
};


export const THEORY_CONTENT = [
    {
      title: "GPS Fundamentals & Trilateration",
      content: "Global Positioning System (GPS) is a satellite-based navigation system. A receiver on Earth determines its position by measuring the time it takes for signals to travel from multiple satellites. With signals from at least four satellites, the receiver can calculate its 3D position (latitude, longitude, altitude) through a process called trilateration. Each satellite signal defines a sphere with the satellite at its center; the intersection of these spheres pinpoints the receiver's location."
    },
    {
      title: "GPS Spoofing Techniques",
      content: "GPS spoofing is an attack where a malicious actor broadcasts counterfeit GPS signals to deceive a receiver. There are two main techniques: \n1. **Signal Overpowering:** A powerful transmitter near the target broadcasts fake signals that drown out the legitimate, weaker satellite signals. \n2. **Coordinate Shifting:** The attacker subtly introduces false timing data into the counterfeit signals, causing the receiver to calculate a slightly incorrect position. Over time, this offset can be increased to divert the target without triggering immediate alarms."
    },
    {
      title: "Detection & Countermeasures",
      content: "Detecting spoofing involves monitoring for signal anomalies. Methods include: \n- **Signal Analysis:** Looking for inconsistencies in signal strength, timing, or satellite IDs. \n- **Multi-Antenna Systems:** Using multiple antennas to verify the direction of arrival for GPS signals. Legitimate signals come from different directions in the sky, while spoofed signals often originate from a single ground-based source. \nCountermeasures include encrypted GPS signals (like military M-Code) and inertial navigation systems (INS) that can detect sudden, illogical jumps in position."
    },
    {
      title: "Key Mathematical Formulas",
      content: "Several formulas are crucial in GPS and defense calculations: \n- **Haversine Formula:** Calculates the great-circle distance between two points on a sphere given their longitudes and latitudes. Used for accurate distance measurement. \n- **Position Error (ε):** ε = √[(Δx)² + (Δy)² + (Δz)²]. Measures the absolute distance between the drone's true position and its spoofed, perceived position. \n- **Vector to Target (θ):** θ = atan2(targetY - droneY, targetX - droneX). Calculates the angle needed to direct the drone towards a specific coordinate, essential for path correction."
    },
    {
        title: "Disclaimer: Educational Use Only",
        content: "This simulation is for educational and informational purposes only. It is designed to demonstrate the principles of GPS technology and anti-drone defense systems in a controlled, virtual environment. The activities of GPS spoofing and interfering with aircraft are illegal in most jurisdictions and can carry severe penalties. This tool does not perform any real-world signal transmission or interference. Do not attempt to replicate these concepts with real hardware."
    }
];