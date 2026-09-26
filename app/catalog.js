window.EB_APPS = [
  {
    id: 'schematic',
    title: 'Schematic Tool',
    category: 'TAKEOFF',
    description: 'Floor plans, device counts, circuit routes, and estimates.',
    icon: 'S',
    tone: 'green',
    tags: ['schematic', 'floor plan', 'takeoff', 'estimate', 'circuit'],
    modules: [
      {
        id: 'schematic-takeoff',
        title: 'Schematic Takeoff',
        description: 'Mark devices, draw circuits, and estimate a project.',
        icon: 'T',
        tone: 'blueprint',
        href: 'tools/schematic/index.html',
        tags: ['plans', 'devices', 'circuit', 'estimate']
      }
    ]
  }
];