'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DesktopCardItem } from '@/types/os';
import { useWindowStore } from '@/stores/useWindowStore';
import { ReadmeSticker } from './widgets/ReadmeSticker';
import { PolaroidCard } from './widgets/PolaroidCard';
import { AwardBadge } from './widgets/AwardBadge';
import { MapWidget } from './widgets/MapWidget';
import { ProjectPreviewCard } from './widgets/ProjectPreviewCard';
import { MessageSnippetWidget } from './widgets/MessageSnippetWidget';
import { MusicDesktopWidget } from './widgets/MusicDesktopWidget';
import { DesktopFolderItem } from './widgets/DesktopFolderItem';
import { CatYearWidget } from './widgets/CatYearWidget';

interface DesktopItemProps {
  item: DesktopCardItem;
  zIndex?: number;
  onFocus?: () => void;
  dragConstraintsRef?: React.RefObject<Element>;
  isMobile?: boolean;
}

export function DesktopItem({
  item,
  zIndex: propZIndex,
  onFocus,
  dragConstraintsRef,
  isMobile = false,
}: DesktopItemProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const openFinderToSection = useWindowStore((state) => state.openFinderToSection);
  const [isDragging, setIsDragging] = useState(false);
  const [localZIndex, setLocalZIndex] = useState(1);
  const dragDistanceRef = useRef(0);

  const effectiveZIndex = propZIndex !== undefined ? propZIndex : (isDragging ? 25 : localZIndex);

  const handleOpenApp = () => {
    if (item.type === 'music' || item.type === 'folder') {
      openFinderToSection('music');
    } else if (item.targetAppId) {
      openWindow(item.targetAppId);
    }
  };

  const handlePointerDown = () => {
    if (isMobile) return;
    dragDistanceRef.current = 0;
    setLocalZIndex(25);
    onFocus?.();
  };

  const handleDragStart = () => {
    if (isMobile) return;
    setIsDragging(true);
    setLocalZIndex(25);
    onFocus?.();
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    if (isMobile) return;
    dragDistanceRef.current = Math.hypot(info.offset.x, info.offset.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Only trigger if it wasn't a significant drag on desktop
    if (!isMobile && dragDistanceRef.current < 6) {
      handleOpenApp();
    }
  };

  const handleClick = () => {
    // Single tap to open on mobile
    if (isMobile) {
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
      case 'music':
        return <MusicDesktopWidget item={item} onOpenApp={handleOpenApp} />;
      case 'folder':
        return <DesktopFolderItem item={item} onOpenApp={handleOpenApp} isMobile={isMobile} />;
      case 'numerology':
        return <CatYearWidget item={item} onOpenApp={handleOpenApp} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      drag={!isMobile}
      dragMomentum={false}
      dragElastic={0.08}
      dragConstraints={dragConstraintsRef}
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      initial={
        isMobile
          ? { opacity: 0, y: 15, scale: 0.98 }
          : {
              x: item.defaultPosition.x,
              y: item.defaultPosition.y,
              rotate: item.rotation || 0,
              opacity: 0,
              scale: 0.92,
            }
      }
      animate={
        isMobile
          ? { opacity: 1, y: 0, scale: 1 }
          : {
              opacity: 1,
              scale: 1,
              rotate: item.rotation || 0,
            }
      }
      whileHover={
        isMobile
          ? undefined
          : {
              scale: 1.03,
              rotate: 0,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }
      }
      whileTap={{
        scale: 0.97,
      }}
      style={
        isMobile
          ? {
              position: 'relative',
              touchAction: 'pan-y',
              zIndex: effectiveZIndex,
              display: 'flex',
              justifyContent: 'center',
            }
          : {
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: effectiveZIndex,
              touchAction: 'none',
            }
      }
      className={`pointer-events-auto select-none ${
        isMobile
          ? 'cursor-pointer w-full flex justify-center py-1 transition-transform active:scale-[0.98]'
          : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {renderWidgetContent()}
    </motion.div>
  );
}
