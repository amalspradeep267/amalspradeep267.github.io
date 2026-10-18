// All site content lives here. Edit this file; you shouldn't need to touch index.html or app.js.
window.SITE = {
  profile: {
    name: "Amal S Pradeep",
    shortName: "AP",
    number: "27",                       // "driver number" shown in the HUD
    role: "Robotics Engineer",
    eyebrow: "MS Robotics · Northeastern University",
    tagline: "I design robots from the chassis up: mechanical design, simulation and embedded control, taken from sketch to something that moves.",
    status: "Open to full-time roles · May 2027",
    facts: [
      { label: "Based", value: "Boston, MA" },
      { label: "Studying", value: "MS Robotics, May 2027" },
      { label: "Focus", value: "Mechanical design · Embedded · ROS 2" }
    ],
    resumeUrl: "media/Amal_S_Pradeep_Resume.pdf",   // leave empty to hide the Resume button
    emails: ["amalspradeep267@gmail.com", "souparnikapradeep.a@northeastern.edu"],   // first one is used by "Get in touch"
    photo: ""                           // e.g. "media/profile.jpg"; empty shows initials
  },

  links: [
    { label: "GitHub", url: "https://github.com/amalspradeep267" },
    { label: "LinkedIn", url: "http://www.linkedin.com/in/amal-s-pradeep-b26838317" }
  ],

  // Instrument cluster in the Telemetry section. The "main" pod sits in the centre;
  // the rest alternate left and right. Add or remove entries freely (3 or 5 look best).
  telemetry: [
    { value: 99.3, min: 90, max: 100, step: 2, decimals: 1, unit: "PCTL", main: true,
      label: "JEE Main percentile", detail: "Top 0.7% of ~1 million candidates in India" },
    { value: 60, min: 0, max: 100, step: 20, unit: "%",
      label: "Faster design iterations", detail: "Underwater ROV" },
    { type: "gear", value: 4, max: 8,
      label: "Dell × NVIDIA GB10 Hackathon", detail: "4th place · Hyperion · team of 4" }
  ],
  // Projects on the wheel, in order
  projects: [
    {
      name: "Hyperion",
      kind: "Hackathon · Team of 4",
      date: "Oct 2026",
      description: "An operations supervisor built from two local LLMs on one Dell Pro Max GB10, running a 20-robot Isaac Sim warehouse with zero cloud model calls. I built the command-center UI: live robot feeds, fleet alerts, commissioning charts and the scheduler on one screen.",
      summary: "Two local LLMs on one GB10 supervising a 20-robot warehouse. I built the command-center UI.",
      tags: ["Python", "vLLM", "Isaac Sim", "Discord", "Dashboard UI"],
      metric: { value: "4th", label: "Place, Dell × NVIDIA GB10 Hackathon" },
      image: "media/hyperion.jpg",
      links: [{ label: "Repo", url: "https://github.com/amalspradeep267/hyperion-gb10-hackathon" }]
    },
    {
      name: "Underwater ROV",
      kind: "Co-op · Mechanical R&D Lead",
      date: "May – Aug 2026",
      description: "Led the mechanical design of a startup's first ROV prototype from sketches to pool trials: chassis, thruster layout around a sealed electronics enclosure, a hydrodynamic cover tuned for CB/CG alignment, and a slide-out electronics rail.",
      summary: "Led mechanical design of a startup's first ROV, from sketches and CFD to pool trials.",
      tags: ["SolidWorks", "Fusion 360", "Flow Simulation", "Pixhawk", "3D printing"],
      metric: { value: "60%", label: "Faster design iterations" },
      image: "media/rov.jpg",
      links: [{ label: "Case study", url: "https://github.com/amalspradeep267/underwater-rov-mechanical-design" }]
    },
    {
      name: "Retracting Track Mechanism",
      kind: "ME 5250 · Robot Mechanics",
      date: "Oct – Nov 2025",
      description: "A 10-bar plus Chebyshev 4-bar linkage that pulls a robot's tracks in while lowering auxiliary wheels to cut drag. Mobility, kinematic and singularity analysis, SolidWorks CAD and a 3D-printed prototype.",
      summary: "A linkage that retracts robot tracks and drops auxiliary wheels to cut drag, analysed and prototyped.",
      tags: ["Linkage synthesis", "MATLAB", "SolidWorks", "3D printing"],
      metric: { value: "200°", label: "Crank range, no internal singularities" },
      image: "media/tracks.jpg",
      links: [
        { label: "Repo", url: "https://github.com/amalspradeep267/retracting-track-mechanism" },
        { label: "Video", url: "https://youtu.be/18wIrvqWMg4" }
      ]
    },
    {
      name: "WALL-E Robot",
      kind: "EECE 5554 · Team project",
      date: "Sep – Dec 2025",
      description: "The sensing layer for a differential-drive robot localized with an EKF: a ROS 2 MPU-6050 driver, Arduino encoder and per-wheel PID firmware, a text serial protocol, and 3D-printed sensor mounts.",
      summary: "ROS 2 IMU driver, encoder and PID motor firmware, and sensor mounts for an EKF-localized robot.",
      tags: ["ROS 2", "Python", "Arduino", "PID", "Raspberry Pi"],
      metric: { value: "100 Hz", label: "IMU stream, no dropped messages" },
      image: "media/walle.jpg",
      links: [{ label: "Repo", url: "https://github.com/amalspradeep267/robot-sensing-and-navigation" }]
    },
    {
      name: "DQN vs Double DQN",
      kind: "CS 5180 · Reinforcement Learning",
      date: "Spring 2026",
      description: "A controlled comparison on CartPole and LunarLander across 5 seeds that measures Q-value overestimation directly. Double DQN reduces the bias in both environments, but whether that helps the policy depends on the task.",
      summary: "Measured Q-value overestimation in DQN vs Double DQN on CartPole and LunarLander over 5 seeds.",
      tags: ["PyTorch", "Gymnasium", "Python"],
      metric: { value: "295.7", label: "Double DQN mean reward on CartPole" },
      image: "media/dqn.jpg",
      links: [{ label: "Repo", url: "https://github.com/amalspradeep267/dqn-vs-double-dqn" }]
    },
    {
      name: "3R Arm Under Gravity",
      kind: "ME 5250 · Robot Mechanics",
      date: "Dec 2025",
      description: "Forward dynamics of a three-link arm falling from rest, derived with Euler–Lagrange: mass matrix from link Jacobians, gravity vector, and Coriolis terms from Christoffel symbols, integrated in MATLAB.",
      summary: "Euler–Lagrange forward dynamics of a three-link arm falling under gravity, simulated in MATLAB.",
      tags: ["MATLAB", "Lagrangian dynamics", "Simulation"],
      metric: { value: "3-DOF", label: "Derived from scratch" },
      image: "media/arm.jpg",
      links: [
        { label: "Repo", url: "https://github.com/amalspradeep267/3r-arm-gravity-simulation" },
        { label: "Video", url: "https://youtu.be/a26fu7pMk3Y" }
      ]
    }
  ],

  experience: [
    {
      role: "Mechanical R&D Lead (Co-op)",
      org: "Underwater robotics startup",
      date: "May – Aug 2026",
      points: [
        "Led mechanical design of the V1 underwater vehicle from concept through fabrication",
        "Directed a 3-person mechanical team and released 30+ structural parts in SolidWorks and Fusion 360",
        "Ran flow and structural simulations before fabrication, cutting iteration turnaround by over 60%",
        "Owned the BOM and manufacturing documentation, and coordinated vendors and fabrication"
      ]
    },
    {
      role: "Trainee Engineer",
      org: "Levvan Engineering & Automation · Chennai",
      date: "Aug 2024 – Feb 2025",
      points: [
        "Designed the full SolidWorks model of an industrial tire-cutting machine",
        "Programmed Siemens PLC ladder logic for an automated dual-tank pump system with fail-safe switching",
        "Built HMI screens for real-time monitoring and control of production"
      ]
    },
    {
      role: "Industrial Manufacturing Intern",
      org: "L&T Rubber Machinery · Kanchipuram",
      date: "Jul – Aug 2023",
      points: [
        "Studied tire building and curing machinery through CAD models and the shop floor",
        "Supported quality checks on hydraulic and pneumatic subsystems"
      ]
    }
  ],

  skills: [
    { group: "Design & CAD", items: ["SolidWorks", "Fusion 360", "Engineering drawings", "BOM management", "DFM"] },
    { group: "Analysis & Simulation", items: ["SolidWorks Flow Simulation", "Structural FEA", "MATLAB", "LTspice", "Proteus"] },
    { group: "Fabrication & Hardware", items: ["FDM 3D printing", "Mechanical assembly", "Pixhawk", "Arduino", "Siemens PLC & HMI"] },
    { group: "Software", items: ["Python", "ROS 2", "MATLAB", "Linux", "PyTorch", "Git"] }
  ],

  education: [
    {
      degree: "MS Robotics",
      school: "Northeastern University · Boston",
      date: "Expected May 2027",
      detail: "Mechanics and Control, Control Systems, Sensors and Navigation, Mechatronics, Robot Design"
    },
    {
      degree: "B.Tech Electronics & Communication",
      school: "National Institute of Technology, Trichy",
      date: "2020 – 2024",
      detail: "Embedded Systems, Microcontrollers, Automotive Systems, Signal Processing, Machine Learning"
    }
  ],

  contact: {
    heading: "Box, box.",
    body: "I'm looking for full-time roles in robotics and mechanical design starting May 2027. If you're building something that moves, I'd like to hear about it."
  }
};
