import { useState } from 'react'
import LeftSidebar from './components/LeftSidebar'
import CanvasContainer from './components/CanvasContainer'
import RightSidebar from './components/RightSidebar'
import ImageEditorPage from './components/ImageEditorPage'

function App() {
  const [showImageEditor, setShowImageEditor] = useState(false)

  if (showImageEditor) {
    return <ImageEditorPage onClose={() => setShowImageEditor(false)} />
  }

  return (
    <div className="app-container flex h-screen bg-gray-100 overflow-hidden">
      <LeftSidebar />
      <CanvasContainer onOpenImageEditor={() => setShowImageEditor(true)} />
      <RightSidebar />
    </div>
  )
}

export default App
