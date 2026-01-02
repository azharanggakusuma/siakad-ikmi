"use client";

import React, { useState, useEffect } from "react";
import { Menu } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { reorderMenus } from "@/app/actions/menus";
import { GripVertical, FolderOpen, CornerDownRight, Info } from "lucide-react";

// --- TYPES ---
type MenuItemWithChildren = Menu & { children: Menu[] };
type MenuSection = {
  name: string;
  items: MenuItemWithChildren[];
};

// --- HELPER: SORTABLE CHILD ---
function SortableChild({ id, label }: { id: number; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 mb-1 ml-6 rounded-md border bg-slate-50
        ${isDragging ? "ring-2 ring-blue-500 opacity-80 z-50 shadow-md" : "border-slate-100"}
      `}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1 flex-shrink-0">
        <GripVertical size={16} />
      </div>
      <CornerDownRight size={14} className="text-slate-300 flex-shrink-0" />
      <span className="text-sm text-slate-600 truncate">{label}</span>
    </div>
  );
}

// --- HELPER: SORTABLE ROOT ---
function SortableRoot({ 
  id, 
  label, 
  childrenItems, 
  onChildDragEnd 
}: { 
  id: number; 
  label: string; 
  childrenItems: Menu[];
  onChildDragEnd: (event: DragEndEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), 
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <div 
        className={`
          flex items-center gap-3 p-3 bg-white border rounded-md shadow-sm relative
          ${isDragging ? "ring-2 ring-blue-500 opacity-80 shadow-lg z-50" : "border-slate-200"}
        `}
      >
        <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 p-1 flex-shrink-0">
          <GripVertical size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-slate-700 text-sm truncate">{label}</span>
          {childrenItems.length > 0 && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
               <FolderOpen size={10} /> {childrenItems.length} Sub-menu
            </span>
          )}
        </div>
      </div>

      {childrenItems.length > 0 && (
        <div className="mt-1 relative before:absolute before:left-[19px] before:top-0 before:bottom-2 before:w-[2px] before:bg-slate-100">
           <DndContext 
              collisionDetection={closestCenter} 
              onDragEnd={onChildDragEnd}
              sensors={sensors}
           >
              <SortableContext 
                items={childrenItems.map(c => c.id)} 
                strategy={verticalListSortingStrategy}
              >
                 {childrenItems.map((child) => (
                    <SortableChild key={child.id} id={child.id} label={child.label} />
                 ))}
              </SortableContext>
           </DndContext>
        </div>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
interface MenuReorderListProps {
  initialItems: Menu[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function MenuReorderList({ initialItems, onClose, onSuccess }: MenuReorderListProps) {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const sorted = [...initialItems].sort((a, b) => a.sequence - b.sequence);
    
    const groupedBySection: Record<string, MenuItemWithChildren[]> = {};
    const sectionOrder: string[] = []; 

    sorted.forEach(item => {
      if (!item.parent_id) { 
        const sec = item.section || "Lainnya";
        if (!groupedBySection[sec]) {
          groupedBySection[sec] = [];
          sectionOrder.push(sec);
        }
        const children = sorted.filter(c => c.parent_id === item.id);
        groupedBySection[sec].push({ ...item, children });
      }
    });

    const result = sectionOrder.map(sec => ({
      name: sec,
      items: groupedBySection[sec]
    }));
    
    setSections(result);
  }, [initialItems]);

  const handleDragRoot = (event: DragEndEvent, sectionIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const newSections = [...prev];
      const section = { ...newSections[sectionIndex] };
      const items = [...section.items];

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        section.items = arrayMove(items, oldIndex, newIndex);
        newSections[sectionIndex] = section;
        return newSections;
      }
      return prev;
    });
  };

  const handleDragChild = (event: DragEndEvent, sectionIndex: number, parentId: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
        return prev.map((section, idx) => {
            if (idx !== sectionIndex) return section;

            return {
                ...section,
                items: section.items.map((item) => {
                    if (item.id !== parentId) return item;

                    const children = [...item.children];
                    const oldIndex = children.findIndex((c) => c.id === active.id);
                    const newIndex = children.findIndex((c) => c.id === over.id);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        return {
                            ...item,
                            children: arrayMove(children, oldIndex, newIndex)
                        };
                    }
                    return item;
                })
            };
        });
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updates: { id: number; sequence: number }[] = [];

    sections.forEach((section) => {
       section.items.forEach((root, rootIndex) => {
          // UPDATE: Gunakan kelipatan 10 untuk Parent (10, 20, 30...)
          updates.push({ id: root.id, sequence: (rootIndex + 1) * 10 });

          root.children.forEach((child, childIndex) => {
             // UPDATE: Gunakan format 100+ untuk Child (101, 102, 103...)
             updates.push({ id: child.id, sequence: 100 + (childIndex + 1) });
          });
       });
    });

    try {
      await reorderMenus(updates);
      toast.success("Urutan menu berhasil disimpan!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Gagal menyimpan.", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Alert Info */}
      <div className="bg-slate-50 text-slate-600 px-3 py-3 rounded-md mb-4 text-xs border border-slate-200 shrink-0 flex gap-2">
        <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
        <div className="space-y-1">
            <p className="font-semibold text-slate-700">Petunjuk:</p>
            <ul className="list-disc pl-3 opacity-90 leading-relaxed">
                <li>Tahan & Geser <b>Menu Induk</b> untuk mengubah posisi menu utama.</li>
                <li>Tahan & Geser <b>Sub-menu</b> di dalam induknya untuk mengubah urutan anak.</li>
            </ul>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 pl-1">
        <Accordion type="multiple" defaultValue={sections.map(s => s.name)} className="space-y-4">
           {sections.map((section, secIndex) => (
             <AccordionItem key={section.name} value={section.name} className="border rounded-lg px-3 bg-slate-50/50">
               <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className="bg-white text-slate-700">{section.name}</Badge>
                     <span className="text-xs text-muted-foreground font-normal">({section.items.length} item)</span>
                  </div>
               </AccordionTrigger>
               <AccordionContent className="pt-2 pb-4">
                  
                  <DndContext 
                     collisionDetection={closestCenter} 
                     onDragEnd={(e) => handleDragRoot(e, secIndex)}
                     sensors={sensors}
                  >
                     <SortableContext 
                        items={section.items.map(i => i.id)} 
                        strategy={verticalListSortingStrategy}
                     >
                        {section.items.map((root) => (
                           <SortableRoot 
                              key={root.id} 
                              id={root.id} 
                              label={root.label} 
                              childrenItems={root.children}
                              onChildDragEnd={(e) => handleDragChild(e, secIndex, root.id)}
                           />
                        ))}
                     </SortableContext>
                  </DndContext>

               </AccordionContent>
             </AccordionItem>
           ))}
        </Accordion>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0 bg-white z-10">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan Urutan"}
        </Button>
      </div>
    </div>
  );
}