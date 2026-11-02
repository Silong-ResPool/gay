// ===========================================================================
// App configuration constants
// ===========================================================================

export const CONFIG = Object.freeze({
  BG_COLOR:              0x1a1a2e,
  MODEL_FIT_PADDING:     0.9,
  ZOOM_SENSITIVITY:      0.075,
  MIN_ZOOM:              0.01,
  MAX_ZOOM:              10.0,
  HIT_HIGHLIGHT_MS:      500,
  OUTLINE_COLOR:         0x8c5eff,
  OUTLINE_THICKNESS:     2,
  OUTLINE_ALPHA:         0.1,
  OUTLINE_CORNER_RADIUS: 10,
});

// ===========================================================================
// DOM references
// ===========================================================================

export const DOM = {
  canvas:               document.getElementById('live2d-canvas'),
  loadingOverlay:       document.getElementById('loading-overlay'),
  emptyMessage:         document.getElementById('empty-message'),
  modelUrlInput:        document.getElementById('model-url-input'),
  loadUrlBtn:           document.getElementById('load-url-btn'),
  hitareasToggle:       document.getElementById('hitareas-toggle'),
  expressionsPanel:     document.getElementById('expressions-panel'),
  motionsPanel:         document.getElementById('motions-panel'),
  hitareasPanel:        document.getElementById('hitareas-panel'),
  deleteModelBtn:       document.getElementById('delete-model-btn'),
  modelLabel:           document.getElementById('model-label'),
  dropdown:             document.getElementById('model-dropdown'),
  dropdownLabel:        document.getElementById('dropdown-label'),
  dropdownList:         document.getElementById('dropdown-list'),
  dropdownValue:        document.getElementById('dropdown-value'),
  loadSelectedBtn:      document.getElementById('load-selected-btn'),
  openExplorerBtn:      document.getElementById('open-fe-btn'),
  explorerModal:        document.getElementById('fe-modal'),
  closeExplorerBtn:     document.getElementById('fe-close-btn'),
  ownerInput:           document.getElementById('fe-owner-input'),
  repoInput:            document.getElementById('fe-repo-input'),
  loadRepoBtn:          document.getElementById('fe-load-repo-btn'),
  breadcrumbs:          document.getElementById('fe-breadcrumbs'),
  fileListingContainer: document.getElementById('fe-file-listing-container'),
  filePreviewContainer: document.getElementById('fe-file-preview-container'),
  previewFileName:      document.getElementById('fe-preview-filename'),
  closePreviewBtn:      document.getElementById('fe-close-preview-btn'),
  previewContent:       document.getElementById('fe-preview-content'),
  previewActions:       document.getElementById('fe-preview-actions'),
  statusMessage:        document.getElementById('fe-status-message'),
  loader:               document.getElementById('fe-loader'),
  body:                 document.body,
};

// ===========================================================================
// Application state
// ===========================================================================

export const state = {
  app:              null, // PIXI.Application instance
  models:           [],   // All loaded Live2DModel instances (z-order: last = top)
  selectedModel:    null, // Currently selected model
  modelIdCounter:   0,    // Monotonically increasing ID per loaded model
  hitAreaFrames:    null, // PIXI.live2d.HitAreaFrames overlay for the selected model
  selectionOutline: null, // PIXI.Graphics rectangle drawn around the selected model
  interaction: {
    isDragging:         false,
    wasDragging:        false, // true if drag occurred between pointerdown and pointerup
    dragStartOffset:    { x: 0, y: 0 },
    activeDragTarget:   null,
    isPinching:         false,
    activePointers:     {},    // pointerId → last known position
    pinchDistanceStart: 0,
    pinchScaleStart:    1,
    activePinchTarget:  null,
    modelJustSelected:  false, // suppresses tap motions on the selecting pointerdown
  },
};