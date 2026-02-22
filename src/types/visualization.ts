// src/types/visualization.ts

/** Base props shared by all visualization components */
export interface BaseVisualizationProps {
  width?: number;
  height?: number;
  className?: string;
  tierColor?: string;
}

/** Props for Mafs-based visualizations (Tier 0) */
export interface MafsVisualizationProps extends BaseVisualizationProps {
  showGrid?: boolean;
  showCoordinates?: boolean;
  interactive?: boolean;
}

/** Props for Canvas/Konva-based visualizations (Tier 1-2) */
export interface CanvasVisualizationProps extends BaseVisualizationProps {
  animate?: boolean;
  speed?: number;
}

/** Vector representation for math visualizations */
export interface Vector2D {
  x: number;
  y: number;
  color?: string;
  label?: string;
  draggable?: boolean;
}

/** Data point for ML visualizations */
export interface DataPoint {
  x: number;
  y: number;
  label?: number;
  color?: string;
}
