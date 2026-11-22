'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { DesktopCardItem, AppId } from '@/types/os';
import { useWindowStore } from '@/stores/useWindowStore';
import { ReadmeSticker } from './widgets/ReadmeSticker';
import { PolaroidCard } from './widgets/PolaroidCard';
import { AwardBadge } from './widgets/AwardBadge';
import { MapWidget } from './widgets/MapWidget';
import { ProjectPreviewCard } from './widgets/ProjectPreviewCard';
import { MessageSnippetWidget } from './widgets/MessageSnippetWidget';

interface DesktopItemProps {
  item: DesktopCardItem;
  zIndex?: number;
  onFocus?: () => void;
  dragConstraintsRef?: React.RefObject<Element>;
}

export function DesktopItem({
  item,
  zIndex: propZIndex,
  onFocus,
  dragConstraintsRef,
}: DesktopItemProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const [isDragging, setIsDragging] = useState(false);
  const [localZIndex, setLocalZIndex] = useState(1);
  const dragDistanceRef = useRef(0);

  const effectiveZIndex = propZIndex !== undefined ? propZIndex : (isDragging ? 25 : localZIndex);

  const handleOpenApp = () => {
    if (item.targetAppId) {
      openWindow(item.targetAppId);
    }
  };

  const handlePointerDown = () => {
    dragDistanceRef.current = 0;
    setLocalZIndex(25);
    onFocus?.();
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setLocalZIndex(25);
    onFocus?.();
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    dragDistanceRef.current = Math.hypot(info.offset.x, info.offset.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Only trigger if it wasn't a significant drag
    if (dragDistanceRef.current < 6) {
      handleOpenApp();
    }
  };

  const renderWidgetContent = () => {
    switch (item.type) {
      case 'readme':
        return <ReadmeSticker item={item} onOpenApp={handleOpenApp} />;
      case 'polaroid':
        return <PolaroidCard item={item} onOpenApp={handleOpenApp} />;
      case 'award':
        return <AwardBadge item={item} onOpenApp={handleOpenApp} />;
      case 'map':
        return <MapWidget item={item} onOpenApp={handleOpenApp} />;
      case 'project':
        return <ProjectPreviewCard item={item} onOpenApp={handleOpenApp} />;
      case 'message':
        return <MessageSnippetWidget item={item} onOpenApp={handleOpenApp} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={dragConstraintsRef}
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      initial={{
        x: item.defaultPosition.x,
        y: item.defaultPosition.y,
        rotate: item.rotation || 0,
        opacity: 0,
        scale: 0.92,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: item.rotation || 0,
      }}
      whileHover={{
        scale: 1.03,
        rotate: 0,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{
        scale: 0.98,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: effectiveZIndex,
        touchAction: 'none',
      }}
      className="pointer-events-auto cursor-grab active:cursor-grabbing select-none"
    >
      {renderWidgetContent()}
    </motion.div>
  );
}
