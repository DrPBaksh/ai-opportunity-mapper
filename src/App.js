import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Plus, Filter, RotateCcw, Eye, EyeOff } from 'lucide-react';

// Corndel brand colors
const COLORS = {
  primary: '#CE0058',    // Rubine Red
  secondary: '#E96301',  // Spanish Orange
  tertiary: '#1F2A44',   // Dusk to Dawn
  light: '#ddd0c0',      // Dust Storm
  accent: '#B52555'      // Imperial Red
};

// Helper function to create text texture
function createTextTexture(text, fontSize = 64, color = '#1F2A44') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 512;
  canvas.height = 128;
  
  // Set font
  context.font = `${fontSize}px Arial`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Clear background
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Add background for better visibility
  context.fillStyle = 'rgba(255, 255, 255, 0.9)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add border
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  
  // Add text
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas;
}

// Helper function to create axis labels
function createAxisLabel(text, fontSize = 48, color = '#CE0058') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = 256;
  canvas.height = 64;
  
  context.font = `bold ${fontSize}px Arial`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Clear background
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Add semi-transparent background
  context.fillStyle = 'rgba(255, 255, 255, 0.8)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add text
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas;
}

// 3D Scene Component
function ThreeVisualization({ tasks, highlightedTasks, onTaskClick, selectedTask }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const taskMeshesRef = useRef([]);
  const labelMeshesRef = useRef([]);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear any existing content and append renderer
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(15, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create coordinate system with scale 0-10 mapped to -4 to +4
    const axisLength = 4.5;
    const tickLength = 0.2;
    
    // X-axis (ROI) - Red line
    const xGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, 0),
      new THREE.Vector3(axisLength, 0, 0)
    ]);
    const xLine = new THREE.Line(xGeometry, new THREE.LineBasicMaterial({ color: 0xCE0058, linewidth: 3 }));
    scene.add(xLine);

    // Y-axis (Task Enjoyment) - Red line
    const yGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLength, 0),
      new THREE.Vector3(0, axisLength, 0)
    ]);
    const yLine = new THREE.Line(yGeometry, new THREE.LineBasicMaterial({ color: 0xCE0058, linewidth: 3 }));
    scene.add(yLine);

    // Z-axis (Complexity) - Red line
    const zGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLength),
      new THREE.Vector3(0, 0, axisLength)
    ]);
    const zLine = new THREE.Line(zGeometry, new THREE.LineBasicMaterial({ color: 0xCE0058, linewidth: 3 }));
    scene.add(zLine);

    // Add tick marks and numerical labels for each axis
    const tickMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
    
    // X-axis ticks and labels (ROI: 1-10)
    for (let i = 1; i <= 10; i++) {
      const x = (i - 5.5) * 0.8; // Map 1-10 to coordinate system
      
      // Tick mark
      const tickGeometry = new THREE.BoxGeometry(0.02, tickLength, 0.02);
      const tick = new THREE.Mesh(tickGeometry, tickMaterial);
      tick.position.set(x, -tickLength/2, 0);
      scene.add(tick);
      
      // Number label
      const numberCanvas = createAxisLabel(i.toString(), 32, '#666666');
      const numberTexture = new THREE.CanvasTexture(numberCanvas);
      const numberMaterial = new THREE.SpriteMaterial({ map: numberTexture });
      const numberSprite = new THREE.Sprite(numberMaterial);
      numberSprite.position.set(x, -0.5, 0);
      numberSprite.scale.set(0.5, 0.125, 1);
      scene.add(numberSprite);
    }

    // Y-axis ticks and labels (Task Enjoyment: 1-10)
    for (let i = 1; i <= 10; i++) {
      const y = (i - 5.5) * 0.8;
      
      // Tick mark
      const tickGeometry = new THREE.BoxGeometry(tickLength, 0.02, 0.02);
      const tick = new THREE.Mesh(tickGeometry, tickMaterial);
      tick.position.set(-tickLength/2, y, 0);
      scene.add(tick);
      
      // Number label
      const numberCanvas = createAxisLabel(i.toString(), 32, '#666666');
      const numberTexture = new THREE.CanvasTexture(numberCanvas);
      const numberMaterial = new THREE.SpriteMaterial({ map: numberTexture });
      const numberSprite = new THREE.Sprite(numberMaterial);
      numberSprite.position.set(-0.7, y, 0);
      numberSprite.scale.set(0.5, 0.125, 1);
      scene.add(numberSprite);
    }

    // Z-axis ticks and labels (Complexity: 1-10)
    for (let i = 1; i <= 10; i++) {
      const z = (i - 5.5) * 0.8;
      
      // Tick mark
      const tickGeometry = new THREE.BoxGeometry(0.02, 0.02, tickLength);
      const tick = new THREE.Mesh(tickGeometry, tickMaterial);
      tick.position.set(0, -tickLength/2, z);
      scene.add(tick);
      
      // Number label
      const numberCanvas = createAxisLabel(i.toString(), 32, '#666666');
      const numberTexture = new THREE.CanvasTexture(numberCanvas);
      const numberMaterial = new THREE.SpriteMaterial({ map: numberTexture });
      const numberSprite = new THREE.Sprite(numberMaterial);
      numberSprite.position.set(0, -0.5, z);
      numberSprite.scale.set(0.5, 0.125, 1);
      scene.add(numberSprite);
    }

    // Add axis title labels
    // ROI label (X-axis)
    const roiCanvas = createAxisLabel('ROI Potential →', 40, '#CE0058');
    const roiTexture = new THREE.CanvasTexture(roiCanvas);
    const roiMaterial = new THREE.SpriteMaterial({ map: roiTexture });
    const roiSprite = new THREE.Sprite(roiMaterial);
    roiSprite.position.set(5, -1, 0);
    roiSprite.scale.set(2, 0.5, 1);
    scene.add(roiSprite);

    // Task Enjoyment label (Y-axis)
    const enjoymentCanvas = createAxisLabel('↑ Task Enjoyment', 40, '#CE0058');
    const enjoymentTexture = new THREE.CanvasTexture(enjoymentCanvas);
    const enjoymentMaterial = new THREE.SpriteMaterial({ map: enjoymentTexture });
    const enjoymentSprite = new THREE.Sprite(enjoymentMaterial);
    enjoymentSprite.position.set(-1.5, 5, 0);
    enjoymentSprite.scale.set(2, 0.5, 1);
    scene.add(enjoymentSprite);

    // Complexity label (Z-axis)
    const complexityCanvas = createAxisLabel('Solution Complexity →', 40, '#CE0058');
    const complexityTexture = new THREE.CanvasTexture(complexityCanvas);
    const complexityMaterial = new THREE.SpriteMaterial({ map: complexityTexture });
    const complexitySprite = new THREE.Sprite(complexityMaterial);
    complexitySprite.position.set(0, -1, 5);
    complexitySprite.scale.set(2, 0.5, 1);
    scene.add(complexitySprite);

    // Add a subtle grid floor
    const gridHelper = new THREE.GridHelper(8, 16, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -axisLength - 0.5;
    scene.add(gridHelper);

    // Mouse controls
    let isMouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = 0.8;
    let currentRotationX = 0.2;
    let currentRotationY = 0.8;
    let radius = 15;

    const handleMouseDown = (event) => {
      event.preventDefault();
      isMouseDown = true;
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseMove = (event) => {
      if (!isMouseDown) return;
      
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;
      targetRotationX = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRotationX));
      
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (event) => {
      event.preventDefault();
      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      radius = Math.max(8, Math.min(40, radius * scale));
    };

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      if (isMouseDown) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(taskMeshesRef.current);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const taskIndex = taskMeshesRef.current.indexOf(clickedMesh);
        if (taskIndex !== -1 && onTaskClick) {
          onTaskClick(tasks[taskIndex]);
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Smooth camera rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.1;
      currentRotationY += (targetRotationY - currentRotationY) * 0.1;

      camera.position.x = radius * Math.sin(currentRotationY) * Math.cos(currentRotationX);
      camera.position.y = radius * Math.sin(currentRotationX);
      camera.position.z = radius * Math.cos(currentRotationY) * Math.cos(currentRotationX);
      camera.lookAt(0, 0, 0);

      // Animate highlighted tasks
      taskMeshesRef.current.forEach((mesh, index) => {
        if (mesh && tasks[index] && highlightedTasks.includes(tasks[index].id)) {
          mesh.rotation.y += 0.03;
          mesh.rotation.x += 0.02;
        }
      });

      // Make labels always face camera
      labelMeshesRef.current.forEach(label => {
        if (label) {
          label.lookAt(camera.position);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('click', handleClick);
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update task meshes when tasks change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing task meshes and labels
    [...taskMeshesRef.current, ...labelMeshesRef.current].forEach(mesh => {
      if (mesh) {
        sceneRef.current.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (mesh.material.map) mesh.material.map.dispose();
          mesh.material.dispose();
        }
      }
    });
    taskMeshesRef.current = [];
    labelMeshesRef.current = [];

    // Create new task meshes
    tasks.forEach((task, index) => {
      // Convert 1-10 scale to coordinate system
      const x = (task.roi - 5.5) * 0.8;
      const y = (task.enjoyment - 5.5) * 0.8;
      const z = (task.complexity - 5.5) * 0.8;

      // Size based on complexity (make them clearly visible)
      const baseSize = 0.25;
      const size = baseSize + (task.complexity / 10) * 0.35;
      
      // Color based on ROI and highlight status
      let color;
      if (highlightedTasks.includes(task.id)) {
        color = new THREE.Color(0xE96301); // Orange for highlighted
      } else {
        // Color gradient from pink to deep red based on ROI
        const intensity = task.roi / 10;
        color = new THREE.Color().lerpColors(
          new THREE.Color(0xffb6c1), // Light pink for low ROI
          new THREE.Color(0x8B0000),  // Dark red for high ROI
          intensity
        );
      }

      // Create sphere with better materials for visibility
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
        specular: new THREE.Color(0x111111)
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add outline for better visibility
      const outlineGeometry = new THREE.SphereGeometry(size * 1.05, 16, 16);
      const outlineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.position.set(x, y, z);
      
      sceneRef.current.add(outline);
      sceneRef.current.add(mesh);
      taskMeshesRef.current.push(mesh);
      
      // Create text label for task name
      const labelCanvas = createTextTexture(task.name, 48, '#1F2A44');
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.SpriteMaterial({ 
        map: labelTexture,
        transparent: true,
        opacity: 0.9
      });
      const labelSprite = new THREE.Sprite(labelMaterial);
      labelSprite.position.set(x, y + size + 0.5, z);
      labelSprite.scale.set(1.5, 0.375, 1); // Adjust scale for readability
      
      sceneRef.current.add(labelSprite);
      labelMeshesRef.current.push(labelSprite);

      // Add small indicator showing the values below the sphere
      const valueText = `ROI:${task.roi} E:${task.enjoyment} C:${task.complexity}`;
      const valueCanvas = createTextTexture(valueText, 32, '#666666');
      const valueTexture = new THREE.CanvasTexture(valueCanvas);
      const valueMaterial = new THREE.SpriteMaterial({ 
        map: valueTexture,
        transparent: true,
        opacity: 0.8
      });
      const valueSprite = new THREE.Sprite(valueMaterial);
      valueSprite.position.set(x, y - size - 0.3, z);
      valueSprite.scale.set(1.2, 0.3, 1);
      
      sceneRef.current.add(valueSprite);
      labelMeshesRef.current.push(valueSprite);
    });

    console.log(`Created ${tasks.length} task spheres with labels`);
  }, [tasks, highlightedTasks]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

export default function AIOpportunityMapper() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Content Creation",
      roi: 8,
      enjoyment: 3,
      complexity: 4
    },
    {
      id: 2,
      name: "Data Entry",
      roi: 9,
      enjoyment: 2,
      complexity: 2
    },
    {
      id: 3,
      name: "Email Management",
      roi: 7,
      enjoyment: 2,
      complexity: 3
    }
  ]);
  
  const [newTask, setNewTask] = useState({
    name: '',
    roi: 5,
    enjoyment: 5,
    complexity: 5
  });
  
  const [filters, setFilters] = useState({
    minROI: 1,
    maxROI: 10,
    minEnjoyment: 1,
    maxEnjoyment: 10,
    minComplexity: 1,
    maxComplexity: 10
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedTasks, setHighlightedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, {
        ...newTask,
        id: Date.now(),
        name: newTask.name.trim()
      }]);
      setNewTask({ name: '', roi: 5, enjoyment: 5, complexity: 5 });
    }
  };

  const applyFilters = () => {
    const filtered = tasks.filter(task => 
      task.roi >= filters.minROI && task.roi <= filters.maxROI &&
      task.enjoyment >= filters.minEnjoyment && task.enjoyment <= filters.maxEnjoyment &&
      task.complexity >= filters.minComplexity && task.complexity <= filters.maxComplexity
    );
    setHighlightedTasks(filtered.map(t => t.id));
  };

  const clearFilters = () => {
    setHighlightedTasks([]);
    setFilters({
      minROI: 1, maxROI: 10,
      minEnjoyment: 1, maxEnjoyment: 10,
      minComplexity: 1, maxComplexity: 10
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Quick filter presets
  const quickWins = () => {
    const filtered = tasks.filter(task => 
      task.roi >= 7 && task.enjoyment <= 4 && task.complexity <= 5
    );
    setHighlightedTasks(filtered.map(t => t.id));
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b" style={{ borderColor: COLORS.light }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: COLORS.tertiary }}>
                AI Opportunity Mapper
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualize and prioritize AI implementation opportunities
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <div style={{ color: COLORS.primary }}>■</div>
              Corndel
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Add New Task */}
          <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
            <h3 className="font-semibold mb-4" style={{ color: COLORS.tertiary }}>
              Add New Challenge
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Challenge name"
                value={newTask.name}
                onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.light, '--tw-ring-color': COLORS.primary }}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.tertiary }}>
                  Potential ROI: {newTask.roi}
                </label>
                <input
                  type="range"
                  min="1" max="10"
                  value={newTask.roi}
                  onChange={(e) => setNewTask({...newTask, roi: parseInt(e.target.value)})}
                  className="w-full"
                  style={{ accentColor: COLORS.primary }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.tertiary }}>
                  Task Enjoyment: {newTask.enjoyment}
                </label>
                <input
                  type="range"
                  min="1" max="10"
                  value={newTask.enjoyment}
                  onChange={(e) => setNewTask({...newTask, enjoyment: parseInt(e.target.value)})}
                  className="w-full"
                  style={{ accentColor: COLORS.primary }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: COLORS.tertiary }}>
                  Solution Complexity: {newTask.complexity}
                </label>
                <input
                  type="range"
                  min="1" max="10"
                  value={newTask.complexity}
                  onChange={(e) => setNewTask({...newTask, complexity: parseInt(e.target.value)})}
                  className="w-full"
                  style={{ accentColor: COLORS.primary }}
                />
              </div>
              
              <button
                onClick={addTask}
                className="w-full flex items-center justify-center gap-2 p-2 text-white rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: COLORS.primary }}
              >
                <Plus size={16} />
                Add Challenge
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
            <h3 className="font-semibold mb-4" style={{ color: COLORS.tertiary }}>
              Quick Filters
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={quickWins}
                className="w-full p-2 text-white rounded hover:opacity-90 transition-opacity text-sm"
                style={{ backgroundColor: COLORS.secondary }}
              >
                Show Quick Wins
                <div className="text-xs opacity-75">High ROI + Low Enjoyment + Low Complexity</div>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 p-2 border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
              >
                <Filter size={16} />
                {showFilters ? 'Hide' : 'Show'} Custom Filters
              </button>
              
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 p-2 border rounded hover:bg-gray-50 transition-colors"
                style={{ borderColor: COLORS.tertiary, color: COLORS.tertiary }}
              >
                <RotateCcw size={16} />
                Clear Highlights
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
              <h3 className="font-semibold mb-4" style={{ color: COLORS.tertiary }}>
                Filter by Range
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ROI: {filters.minROI} - {filters.maxROI}</label>
                  <div className="flex gap-2">
                    <input
                      type="range" min="1" max="10"
                      value={filters.minROI}
                      onChange={(e) => setFilters({...filters, minROI: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                    <input
                      type="range" min="1" max="10"
                      value={filters.maxROI}
                      onChange={(e) => setFilters({...filters, maxROI: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Enjoyment: {filters.minEnjoyment} - {filters.maxEnjoyment}</label>
                  <div className="flex gap-2">
                    <input
                      type="range" min="1" max="10"
                      value={filters.minEnjoyment}
                      onChange={(e) => setFilters({...filters, minEnjoyment: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                    <input
                      type="range" min="1" max="10"
                      value={filters.maxEnjoyment}
                      onChange={(e) => setFilters({...filters, maxEnjoyment: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Complexity: {filters.minComplexity} - {filters.maxComplexity}</label>
                  <div className="flex gap-2">
                    <input
                      type="range" min="1" max="10"
                      value={filters.minComplexity}
                      onChange={(e) => setFilters({...filters, minComplexity: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                    <input
                      type="range" min="1" max="10"
                      value={filters.maxComplexity}
                      onChange={(e) => setFilters({...filters, maxComplexity: parseInt(e.target.value)})}
                      className="flex-1" style={{ accentColor: COLORS.primary }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={applyFilters}
                  className="w-full p-2 text-white rounded hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Selected Task Info */}
          {selectedTask && (
            <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
              <h3 className="font-semibold mb-2" style={{ color: COLORS.tertiary }}>
                Selected Challenge
              </h3>
              <div className="space-y-1 text-sm">
                <div><strong>Name:</strong> {selectedTask.name}</div>
                <div><strong>ROI Potential:</strong> {selectedTask.roi}/10</div>
                <div><strong>Task Enjoyment:</strong> {selectedTask.enjoyment}/10</div>
                <div><strong>Complexity:</strong> {selectedTask.complexity}/10</div>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
            <h3 className="font-semibold mb-4" style={{ color: COLORS.tertiary }}>
              Current Challenges ({tasks.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto tasks-list">
              {tasks.map(task => (
                <div 
                  key={task.id}
                  className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                    highlightedTasks.includes(task.id) ? 'bg-orange-100' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="font-medium">{task.name}</div>
                  <div className="text-xs text-gray-600">
                    ROI: {task.roi} | Enjoyment: {task.enjoyment} | Complexity: {task.complexity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Visualization */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border h-[700px]" style={{ borderColor: COLORS.light }}>
            <div className="p-4 border-b" style={{ borderColor: COLORS.light }}>
              <h3 className="font-semibold" style={{ color: COLORS.tertiary }}>
                3D Opportunity Map
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Click and drag to rotate • Scroll to zoom • Click spheres for details
              </p>
            </div>
            
            <div className="h-[calc(100%-80px)]">
              <ThreeVisualization 
                tasks={tasks} 
                highlightedTasks={highlightedTasks}
                onTaskClick={handleTaskClick}
                selectedTask={selectedTask}
              />
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 bg-white rounded-lg shadow-sm p-4 border" style={{ borderColor: COLORS.light }}>
            <h4 className="font-semibold mb-3" style={{ color: COLORS.tertiary }}>Legend & Sweet Spot</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong style={{ color: COLORS.primary }}>Axes (1-10 scale):</strong>
                <div>🔴 X = ROI Potential</div>
                <div>🔴 Y = Task Enjoyment</div>
                <div>🔴 Z = Solution Complexity</div>
              </div>
              <div>
                <strong style={{ color: COLORS.primary }}>Visual Cues:</strong>
                <div>🎨 Color = ROI Level</div>
                <div>📏 Size = Complexity Level</div>
                <div>🟠 Orange = Highlighted</div>
                <div>📊 Values shown below spheres</div>
              </div>
              <div>
                <strong style={{ color: COLORS.primary }}>🎯 Sweet Spot:</strong>
                <div>✅ High ROI (right)</div>
                <div>✅ Low Enjoyment (bottom)</div>
                <div>✅ Low Complexity (front)</div>
                <div className="text-xs mt-1 text-gray-600">Best AI opportunities!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
