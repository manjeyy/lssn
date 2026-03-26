'use client'

import { useEffect, useState, useRef } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { type CarouselApi } from "@/components/ui/carousel"
import { createLssn, getApiBaseUrl, getCategories, getTopics, updateLssn, uploadImage } from "@/lib/api"
import { CreatorTopBar } from "@/components/creator/CreatorTopBar"
import { CreatorCanvas } from "@/components/creator/CreatorCanvas"
import { CreatorToolsBar } from "@/components/creator/CreatorToolsBar"
import { PublishDialog } from "@/components/creator/PublishDialog"
import type { CanvasElement, ElementType } from "@/components/creator/types"

export default function Page() {

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [items, setItems] = useState<number[]>([1])
  const [cardsData, setCardsData] = useState<Record<number, CanvasElement[]>>({})
  const [selectedElements, setSelectedElements] = useState<{ cardId: number, elementId: string }[]>([])
  const [guidelines, setGuidelines] = useState<{ type: 'horizontal' | 'vertical', pos: number }[]>([])
  const [guidelineCardId, setGuidelineCardId] = useState<number | null>(null)

  const [lssnTitle, setLssnTitle] = useState('')
  const [lssnDescription, setLssnDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [lssnId, setLssnId] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<{ id: number; name: string; thumbnailUrl?: string | null }[]>([])
  const [topics, setTopics] = useState<{ id: number; name: string }[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [isPublishOpen, setIsPublishOpen] = useState(false)

  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null)
  const [selectionBox, setSelectionBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
  const [activeCardId, setActiveCardId] = useState<number | null>(null)

  const isDragging = useRef(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const imageReplaceTarget = useRef<{ cardId: number; elementId: string } | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [categoryRows, topicRows] = await Promise.all([
          getCategories(),
          getTopics(),
        ])
        setCategories(categoryRows)
        setTopics(topicRows)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load categories/topics'
        setSaveMessage(message)
      }
    }

    loadMeta()
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      if (event.key === "ArrowLeft") {
        api?.scrollPrev()
      } else if (event.key === "ArrowRight") {
        api?.scrollNext()
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedElements.length > 0) {
          deleteSelectedElements()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [api, selectedElements])

  const resolveAssetUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${getApiBaseUrl()}${url}`
  }

  const parseTags = () =>
    tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

  const buildPayload = (status: 'draft' | 'published') => ({
    title: lssnTitle.trim() || 'Untitled LSSN',
    description: lssnDescription.trim() || undefined,
    thumbnailUrl: thumbnailUrl ?? undefined,
    status,
    content: {
      items,
      cardsData,
    },
    slidesCount: items.length,
    categoryIds: selectedCategoryIds,
    topicIds: selectedTopicIds,
    tags: parseTags(),
  })

  const saveLssn = async (status: 'draft' | 'published') => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const payload = buildPayload(status)
      const saved = lssnId
        ? await updateLssn(lssnId, payload)
        : await createLssn(payload)
      if (saved?.id) {
        setLssnId(saved.id)
      }
      setSaveMessage(status === 'published' ? 'Published' : 'Draft saved')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      setSaveMessage(message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    const success = await saveLssn('published')
    if (success) {
      setIsPublishOpen(false)
    }
  }

  const uploadAndResolve = async (file: File, onSuccess: (url: string) => void) => {
    const result = await uploadImage(file)
    onSuccess(resolveAssetUrl(result.url))
  }

  const handleThumbnailPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    try {
      await uploadAndResolve(file, (url) => setThumbnailUrl(url))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Thumbnail upload failed'
      setSaveMessage(message)
    }

    event.target.value = ''
  }

  const addItem = () => {
    const newItem = items.length > 0 ? Math.max(...items) + 1 : 1
    setItems([...items, newItem])
    setTimeout(() => {
      api?.scrollTo(items.length)
    }, 10)
  }

  const getActiveCardId = () => {
    const index = Math.max(current - 1, 0)
    return items[index] ?? items[0]
  }

  const insertImageElement = (cardId: number, src: string, x: number, y: number) => {
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      x,
      y,
      width: 240,
      height: 160,
      src,
      fill: 'transparent',
      color: '#000000',
    }

    setCardsData(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), newElement]
    }))
    setSelectedElements([{ cardId, elementId: newElement.id }])
    return newElement.id
  }

  const handleImagePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    const target = imageReplaceTarget.current

    if (target) {
      updateElement(target.cardId, target.elementId, { src: previewUrl })
      imageReplaceTarget.current = null
      setSelectedElements([{ cardId: target.cardId, elementId: target.elementId }])

      try {
        await uploadAndResolve(file, (url) => updateElement(target.cardId, target.elementId, { src: url }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Image upload failed'
        setSaveMessage(message)
      }

      event.target.value = ''
      return
    }

    const cardId = getActiveCardId()
    const elementId = insertImageElement(cardId, previewUrl, 120, 120)

    try {
      await uploadAndResolve(file, (url) => updateElement(cardId, elementId, { src: url }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setSaveMessage(message)
    }

    event.target.value = ''
  }

  const requestImageUpload = (replaceTarget?: { cardId: number; elementId: string }) => {
    imageReplaceTarget.current = replaceTarget ?? null
    imageInputRef.current?.click()
  }

  const handleToolDrop = (cardId: number, type: ElementType, x: number, y: number) => {
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y,
      width: type === 'text' ? 100 : 100,
      height: type === 'text' ? 40 : 100,
      content: type === 'text' ? 'Text' : undefined,
      fill: type === 'text' ? 'transparent' : '#3b82f6',
      color: '#000000',
      fontSize: 16
    };

    setCardsData(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), newElement]
    }))
    setSelectedElements([{ cardId, elementId: newElement.id }])
  }

  const handleFileDrop = async (cardId: number, file: File, x: number, y: number) => {
    if (!file.type.startsWith('image/')) return

    const previewUrl = URL.createObjectURL(file)
    const elementId = insertImageElement(cardId, previewUrl, x, y)

    try {
      await uploadAndResolve(file, (url) => updateElement(cardId, elementId, { src: url }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setSaveMessage(message)
    }
  }

  const updateElement = (cardId: number, elementId: string, updates: Partial<CanvasElement>) => {
    setCardsData(prev => ({
      ...prev,
      [cardId]: prev[cardId].map(el => el.id === elementId ? { ...el, ...updates } : el)
    }));
  }

  const deleteSelectedElements = () => {
    setCardsData(prev => {
      const newData = { ...prev };
      selectedElements.forEach(sel => {
        if (newData[sel.cardId]) {
          newData[sel.cardId] = newData[sel.cardId].filter(el => el.id !== sel.elementId);
        }
      });
      return newData;
    });
    setSelectedElements([]);
  }

  const getSelectedElementData = () => {
    if (selectedElements.length !== 1) return null;
    const sel = selectedElements[0];
    return cardsData[sel.cardId]?.find(el => el.id === sel.elementId);
  }

  const handleElementDrag = (cardId: number, elementId: string, d: any, width: number, height: number) => {
    const { x, y, deltaX, deltaY } = d;
    setGuidelineCardId(cardId)

    setCardsData(prev => {
      const elements = prev[cardId] || [];
      const isSelected = selectedElements.some(sel => sel.elementId === elementId && sel.cardId === cardId);

      if (isSelected) {
        const selectedIds = selectedElements
          .filter(sel => sel.cardId === cardId)
          .map(sel => sel.elementId);

        return {
          ...prev,
          [cardId]: elements.map(el => {
            if (selectedIds.includes(el.id)) {
              return { ...el, x: el.x + deltaX, y: el.y + deltaY };
            }
            return el;
          })
        };
      }
      return {
        ...prev,
        [cardId]: elements.map(el => {
          if (el.id === elementId) {
            return { ...el, x: el.x + deltaX, y: el.y + deltaY };
          }
          return el;
        })
      };
    });

    const otherElements = (cardsData[cardId] || []).filter(el =>
      el.id !== elementId &&
      !selectedElements.some(sel => sel.elementId === el.id && sel.cardId === cardId)
    );
    const newGuidelines: { type: 'horizontal' | 'vertical', pos: number }[] = [];
    const threshold = 5;

    const cx = x + width / 2;
    const cy = y + height / 2;
    const right = x + width;
    const bottom = y + height;

    otherElements.forEach(other => {
      const otherRight = other.x + other.width;
      const otherBottom = other.y + other.height;
      const otherCx = other.x + other.width / 2;
      const otherCy = other.y + other.height / 2;

      if (Math.abs(x - other.x) < threshold) newGuidelines.push({ type: 'vertical', pos: other.x });
      if (Math.abs(x - otherRight) < threshold) newGuidelines.push({ type: 'vertical', pos: otherRight });
      if (Math.abs(right - other.x) < threshold) newGuidelines.push({ type: 'vertical', pos: other.x });
      if (Math.abs(right - otherRight) < threshold) newGuidelines.push({ type: 'vertical', pos: otherRight });
      if (Math.abs(cx - otherCx) < threshold) newGuidelines.push({ type: 'vertical', pos: otherCx });

      if (Math.abs(y - other.y) < threshold) newGuidelines.push({ type: 'horizontal', pos: other.y });
      if (Math.abs(y - otherBottom) < threshold) newGuidelines.push({ type: 'horizontal', pos: otherBottom });
      if (Math.abs(bottom - other.y) < threshold) newGuidelines.push({ type: 'horizontal', pos: other.y });
      if (Math.abs(bottom - otherBottom) < threshold) newGuidelines.push({ type: 'horizontal', pos: otherBottom });
      if (Math.abs(cy - otherCy) < threshold) newGuidelines.push({ type: 'horizontal', pos: otherCy });
    });

    setGuidelines(newGuidelines);
  }

  const handleMouseDown = (e: React.MouseEvent, cardId: number) => {
    if (e.target !== e.currentTarget) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionStart({ x, y });
    setIsSelecting(true);
    setActiveCardId(cardId);
    setSelectionBox({ x, y, width: 0, height: 0 });

    if (!e.shiftKey) {
      setSelectedElements([]);
    }
  }

  const handleMouseMove = (e: React.MouseEvent, cardId: number) => {
    if (!isSelecting || !selectionStart || activeCardId !== cardId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const newBox = {
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      width: Math.abs(currentX - selectionStart.x),
      height: Math.abs(currentY - selectionStart.y)
    };

    setSelectionBox(newBox);

    const elements = cardsData[cardId] || [];
    const newSelected = elements.filter(el =>
      el.x < newBox.x + newBox.width &&
      el.x + el.width > newBox.x &&
      el.y < newBox.y + newBox.height &&
      el.y + el.height > newBox.y
    ).map(el => ({ cardId, elementId: el.id }));

    setSelectedElements(newSelected);
  }

  const handleMouseUp = () => {
    setIsSelecting(false);
    setSelectionBox(null);
    setSelectionStart(null);
    setActiveCardId(null);
  }

  const selectedData: any = getSelectedElementData();
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;

  const handleElementDragStart = (event: any, cardId: number, elementId: string, isSelected: boolean) => {
    if (!isSelected) {
      if (event.shiftKey) {
        setSelectedElements((prev) => [...prev, { cardId, elementId }]);
      } else {
        setSelectedElements([{ cardId, elementId }]);
      }
    }
  };

  const handleElementClick = (event: any, cardId: number, elementId: string, isSelected: boolean) => {
    event.stopPropagation();
    if (isDragging.current) return;

    if (event.shiftKey) {
      if (isSelected) {
        setSelectedElements((prev) => prev.filter((sel) => sel.elementId !== elementId));
      } else {
        setSelectedElements((prev) => [...prev, { cardId, elementId }]);
      }
    } else {
      setSelectedElements([{ cardId, elementId }]);
    }
  };

  const handleElementResizeStop = (cardId: number, elementId: string, ref: any, position: any) => {
    updateElement(cardId, elementId, {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
      ...position,
    });
    setSelectedElements([{ cardId, elementId }]);
  };

  const handleElementDragStop = (cardId: number) => {
    setGuidelines([]);
    setGuidelineCardId(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="creator-ui creator-shell text-strong w-screen h-screen flex flex-col overflow-hidden">
        <CreatorTopBar
          lssnTitle={lssnTitle}
          itemsCount={items.length}
          selectedData={selectedData}
          selectedElement={selectedElement}
          selectedCount={selectedElements.length}
          saveMessage={saveMessage}
          isSaving={isSaving}
          onUpdateElement={updateElement}
          onRequestImageUpload={requestImageUpload}
          onDeleteSelected={deleteSelectedElements}
          onSaveDraft={() => saveLssn("draft")}
          onOpenPublish={() => setIsPublishOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <CreatorCanvas
            items={items}
            cardsData={cardsData}
            selectedElements={selectedElements}
            guidelines={guidelines}
            guidelineCardId={guidelineCardId}
            selectionBox={selectionBox}
            activeCardId={activeCardId}
            onDropTool={handleToolDrop}
            onDropFile={handleFileDrop}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onAddItem={addItem}
            onElementDragStart={handleElementDragStart}
            onElementDrag={handleElementDrag}
            onElementDragStop={handleElementDragStop}
            onElementResizeStop={handleElementResizeStop}
            onElementClick={handleElementClick}
            isDraggingRef={isDragging}
            setApi={setApi}
          />

          <CreatorToolsBar onRequestImageUpload={() => requestImageUpload()} />
        </div>

        <PublishDialog
          open={isPublishOpen}
          onOpenChange={setIsPublishOpen}
          lssnTitle={lssnTitle}
          lssnDescription={lssnDescription}
          thumbnailUrl={thumbnailUrl}
          categories={categories}
          topics={topics}
          selectedCategoryIds={selectedCategoryIds}
          selectedTopicIds={selectedTopicIds}
          tagsInput={tagsInput}
          isSaving={isSaving}
          onTitleChange={setLssnTitle}
          onDescriptionChange={setLssnDescription}
          onThumbnailClick={() => thumbnailInputRef.current?.click()}
          onCategoryChange={setSelectedCategoryIds}
          onTopicChange={setSelectedTopicIds}
          onTagsChange={setTagsInput}
          onCancel={() => setIsPublishOpen(false)}
          onPublish={handlePublish}
        />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbnailPick}
        />
      </div>
    </DndProvider>
  )
}