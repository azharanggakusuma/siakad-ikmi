"use client";

import React, { useState, useRef, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  children: React.ReactNode;
  content: string;
  enabled?: boolean;
  position?: "right" | "bottom" | "top";
};

export default function Tooltip({ 
  children, 
  content, 
  enabled = true, 
  position = "right" 
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const childRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!enabled || !childRef.current) return;

    const rect = childRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;

    if (position === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + 10;
    } else if (position === "bottom") {
      top = rect.bottom + 10;
      left = rect.left + rect.width / 2;
    } else if (position === "top") {
      top = rect.top - 10;
      left = rect.left + rect.width / 2;
    }

    setCoords({ top, left });
    setShow(true);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  if (!isValidElement(children)) return <>{children}</>;

  const child = children as React.ReactElement<any>;

  return (
    <>
      {cloneElement(child, {
        ref: childRef,
        onMouseEnter: (e: React.MouseEvent) => {
          child.props.onMouseEnter?.(e);
          handleMouseEnter(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          child.props.onMouseLeave?.(e);
          handleMouseLeave();
        }
      })}

      {/* Tooltip hanya muncul di Desktop (lg:block) */}
      {show && enabled && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed z-[9999] px-3 py-2 bg-slate-800 text-white text-[11px] font-medium rounded shadow-xl pointer-events-none whitespace-nowrap transition-opacity duration-200 hidden lg:block"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            transform: 
                position === "right" ? "translateY(-50%)" : 
                position === "bottom" ? "translateX(-50%)" :
                "translate(-50%, -100%)"
          }}
        >
          {content}
          
          {position === "right" && (
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
          )}
          {position === "bottom" && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800" />
          )}
          {position === "top" && (
             <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
          )}
        </div>,
        document.body
      )}
    </>
  );
}