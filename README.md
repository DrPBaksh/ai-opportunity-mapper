# AI Opportunity Mapper 🎯

A sophisticated 3D visualization tool for identifying and prioritizing AI implementation opportunities within your organization. Built with React and Three.js, following Corndel's design guidelines.

![AI Opportunity Mapper](https://img.shields.io/badge/React-18.2.0-blue) ![Three.js](https://img.shields.io/badge/Three.js-0.158.0-green) ![Corndel](https://img.shields.io/badge/Brand-Corndel-CE0058)

## 🚀 Features

### 3D Interactive Visualization
- **Immersive 3D plotting** of challenges across three axes
- **Mouse controls** - drag to rotate, scroll to zoom
- **Click interaction** - select tasks for detailed view
- **Real-time animations** for highlighted items

### Smart Prioritization Framework
- **X-axis**: Potential ROI (1-10)
- **Y-axis**: Task Enjoyment (1-10) 
- **Z-axis**: Solution Complexity (1-10)

### Powerful Filtering
- **"Quick Wins" filter** - Automatically highlights high ROI + low enjoyment + low complexity tasks
- **Custom range filters** for each axis
- **Visual highlighting** with color-coded spheres

### Corndel Brand Compliance
- ✅ Official Corndel color scheme (Rubine Red, Spanish Orange, Dusk to Dawn)
- ✅ Arial font family for web content
- ✅ Clean, professional layout with proper spacing
- ✅ Consistent with Corndel style guidelines

## 🏗️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrPBaksh/ai-opportunity-mapper.git
   cd ai-opportunity-mapper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 How to Use

### Adding Challenges
1. Enter a challenge name in the sidebar
2. Adjust the three sliders:
   - **Potential ROI** (1-10)
   - **Task Enjoyment** (1-10) 
   - **Solution Complexity** (1-10)
3. Click "Add Challenge"

### Finding Quick Wins
Click the **"Show Quick Wins"** button to automatically highlight tasks that are:
- High ROI (≥7)
- Low Task Enjoyment (≤4)
- Low Complexity (≤5)

### Custom Filtering
1. Click "Show Custom Filters"
2. Set minimum and maximum ranges for each axis
3. Click "Apply Filters"

### 3D Navigation
- **Rotate**: Click and drag
- **Zoom**: Mouse wheel
- **Select**: Click on any sphere
- **Details**: View selected task info in sidebar

## 🎯 The Sweet Spot

The optimal region for AI implementation is:
- **High ROI** (right side of X-axis)
- **Low Task Enjoyment** (bottom of Y-axis)  
- **Low Solution Complexity** (front of Z-axis)

Tasks in this region represent the best opportunities for AI automation!

## 🛠️ Technical Architecture

### Core Technologies
- **React 18.2.0** - Component framework
- **Three.js 0.158.0** - 3D visualization engine
- **Lucide React** - Icons
- **Tailwind CSS** - Styling (via CDN)

### Key Components
- `ThreeVisualization` - 3D scene management
- `AIOpportunityMapper` - Main application logic
- Custom mouse controls and raycasting for interaction
- Real-time sphere rendering with dynamic colors and sizes

### Performance Features
- **Efficient rendering** with RequestAnimationFrame
- **Memory management** with proper cleanup
- **Responsive design** that works on all screen sizes
- **Optimized geometry** for smooth interactions

## 🎨 Visual Design

### Color Coding
- **Sphere Color**: Intensity based on ROI level
- **Sphere Size**: Proportional to complexity
- **Orange Highlight**: Filtered/selected tasks
- **Red Axes**: Corndel brand color for coordinate system

### Corndel Brand Colors
- `#CE0058` - Rubine Red (Primary)
- `#E96301` - Spanish Orange (Secondary)  
- `#1F2A44` - Dusk to Dawn (Tertiary)
- `#ddd0c0` - Dust Storm (Light)

## 📁 Project Structure

```
ai-opportunity-mapper/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── App.js              # Main application component
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
└── README.md              # This file
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
1. Install GitHub Pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to package.json:
   ```json
   "homepage": "https://DrPBaksh.github.io/ai-opportunity-mapper",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Adding New Features
The app is built with extensibility in mind:
- Add new axis dimensions
- Implement data export/import
- Add collaborative features
- Integrate with external APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Corndel

Corndel is a leading workplace training and development company, specializing in apprenticeships and professional development programs. This tool reflects Corndel's commitment to innovative learning solutions and data-driven decision making.

---

**Built with ❤️ for the future of AI implementation**

For questions or support, please open an issue on GitHub.
