import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Slider } from '../Slider/Slider';

/** Where the picture sits in the round window: the zoom in % (100 fills the window) and the shift of the picture's
 *  centre from the window's centre, as a share of the window's side */
export type Crop = { zoom: number; x: number; y: number };

export const defaultCrop: Crop = { zoom: 100, x: 0, y: 0 };
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
const ZOOM_STEP = 10;

/** Figma "Upload photo flow" (Global Settings, 372:79594): the crop step of the upload modal. */
export type ImageCropProps = {
  /** The original picture (an object URL or a data URL); keep it to crop again later from the original */
  src: string;
  value?: Crop;
  defaultValue?: Crop;
  onChange?: (crop: Crop) => void;
  /** Name of the window for screen readers */
  label?: string;
  /** Name of the zoom slider */
  zoomLabel?: string;
  className?: string;
};

type Size = { width: number; height: number };

/** The picture's size in window sides at a zoom: the shorter side fills the window at 100% */
const span = ({ width, height }: Size, zoom: number) => {
  const short = Math.min(width, height);
  return { w: (zoom / 100) * (width / short), h: (zoom / 100) * (height / short) };
};

/** Keep the window covered: the picture can't move so far that an edge shows inside the square */
const clamp = (crop: Crop, size: Size | null): Crop => {
  const zoom = Math.min(Math.max(crop.zoom, MIN_ZOOM), MAX_ZOOM);
  if (!size) return { zoom, x: 0, y: 0 };
  const { w, h } = span(size, zoom);
  const limit = (value: number, side: number) => Math.min(Math.max(value, -(side - 1) / 2), (side - 1) / 2);
  return { zoom, x: limit(crop.x, w), y: limit(crop.y, h) };
};

/**
 * A round window over a picture: drag the picture (or use the arrow keys) to place it, zoom with the slider, its −
 * and + or the + and − keys. PrimeReact has no crop component: the window is drawn here, the zoom is Slider
 * (PrimeReact Slider). `cropImage` turns the result into a square picture.
 */
export function ImageCrop({ src, value, defaultValue = defaultCrop, onChange, label = 'Picture position', zoomLabel = 'Zoom', className = '' }: ImageCropProps) {
  const hintId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [local, setLocal] = useState(defaultValue);
  const crop = clamp(value ?? local, size);
  const set = (next: Crop) => {
    const clamped = clamp(next, size);
    if (value === undefined) setLocal(clamped);
    onChange?.(clamped);
  };

  const drag = useRef<{ x: number; y: number; crop: Crop } | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, crop };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = drag.current;
    const side = box.current?.clientWidth;
    if (!start || !side) return;
    set({ ...start.crop, x: start.crop.x + (event.clientX - start.x) / side, y: start.crop.y + (event.clientY - start.y) / side });
  };
  const onPointerUp = () => { drag.current = null; };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Arrows move by 2% of the window, with Shift by 10%; + and − zoom by one slider step
    const by = event.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-by, 0], ArrowRight: [by, 0], ArrowUp: [0, -by], ArrowDown: [0, by] };
    if (moves[event.key]) set({ ...crop, x: crop.x + moves[event.key][0], y: crop.y + moves[event.key][1] });
    else if (event.key === '+' || event.key === '=') set({ ...crop, zoom: crop.zoom + ZOOM_STEP });
    else if (event.key === '-' || event.key === '−') set({ ...crop, zoom: crop.zoom - ZOOM_STEP });
    else return;
    event.preventDefault();
  };

  const { w, h } = size ? span(size, crop.zoom) : { w: 1, h: 1 };
  return (
    <div className={`grg-image-crop ${className}`}>
      <div ref={box} className="grg-image-crop__window" tabIndex={0} role="group" aria-label={label} aria-describedby={hintId}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}>
        <img className="grg-image-crop__image" src={src} alt="" draggable={false}
          onLoad={event => setSize({ width: event.currentTarget.naturalWidth || 1, height: event.currentTarget.naturalHeight || 1 })}
          style={{ width: `${w * 100}%`, height: `${h * 100}%`, left: `${50 + crop.x * 100}%`, top: `${50 + crop.y * 100}%` }} />
        <span className="grg-image-crop__veil" aria-hidden="true" />
        <span id={hintId} className="grg-sr-only">Drag or use the arrow keys to move it, + and − to zoom</span>
      </div>
      <Slider aria-label={zoomLabel} value={crop.zoom} onChange={zoom => set({ ...crop, zoom })} min={MIN_ZOOM} max={MAX_ZOOM} step={ZOOM_STEP}
        steppers showValue={false} format={zoom => `${zoom}%`} />
    </div>
  );
}

/** The part of the picture inside the window, as a square PNG (a data URL) of `size` pixels */
export function cropImage(src: string, crop: Crop, size = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const natural = { width: image.naturalWidth || size, height: image.naturalHeight || size };
      const { zoom, x, y } = clamp(crop, natural);
      // One window side in the picture's own pixels, and the window's top left corner in them
      const side = Math.min(natural.width, natural.height) / (zoom / 100);
      const left = natural.width / 2 - x * side - side / 2;
      const top = natural.height / 2 - y * side - side / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d')?.drawImage(image, left, top, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('The picture could not be read'));
    image.src = src;
  });
}
