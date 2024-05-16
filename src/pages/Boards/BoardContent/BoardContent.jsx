import Box from '@mui/material/Box'
import ListColums from './LiistColumns/ListColums'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './LiistColumns/Column/Column'
import Card from './LiistColumns/Column/ListCards/Card/Card'
import { cloneDeep } from 'lodash'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 }})

  // yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 }})

  // nhấn giữ khoảng 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 }})

  //const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // cùng 1 thời điểm chỉ có 1 column đang đc kéo (hoặc là column, hoặc là card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  //Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Khi bắt đầu kéo (drag)
  const handleDragStart = (event) => {
    // console.log('handleDragStart: ', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId
      ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)
  }

  // Quá trình kéo (drag)
  const handleDragOver = (event) => {
    // Không làm gì thêm nếu như đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return
    // còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các columns
    // console.log('handleDragOver: ', event)
    const { active, over } = event
    // nếu th ko tồn tạ actice hoặc over thì cũng sẽ không làm gì cả để tránh crash trang
    if (!active || !over) return

    // activeDraggingCard: là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: LÀ cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên
    const { id: overCardId } = over
    // Tìm 2 column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    if (!activeColumn || !overColumn ) return
    // nếu 2 column khác nhau mới đổi chỗ
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        // tìm vị trí của card trong column đích
        const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

        // logic tính toán cho card index mới
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? newCardIndex + modifier : overColumn?.card?.length + 1

        // clone mảng cũ ra mảng mới để ử lý data rồi return
        const nextColumns = cloneDeep(prevColumns)
        const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
        if (nextActiveColumn) {
          // xóa card khỏi column cũ
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Cập lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }

        if (nextOverColumn) {
          // kiểm tra xem card đang kéo có tồn tại ở column đích hay chưa, nếu có thì càn xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Thếm card đang kéo vào column đích theo vị trí index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)
          // Cập lại mảng cardOrderIds cho chuẩn dữ liệu
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }

        return nextColumns
      })
    }
  }

  // Khi kết thúc kéo (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd: ', event)

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      // Hành động kéo thả card và tạm thời không làm gì
      return
    }

    const { active, over } = event

    if (!active || !over) return

    if (active.id !== over.id) {
      // Lấy vị trí cũ của active
      const oldIndex = orderedColumns.findIndex(c => c._id === active.id)
      // Lấy vị trí ới từ over
      const newIndex = orderedColumns.findIndex(c => c._id === over.id)
      // mảng columns sau khi đã kéo thả
      const andOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // const andOrderedColumnsIds = andOrderedColumns.map(c => c._id)
      setOrderedColumns(andOrderedColumns)
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity:'0.5'
        }
      }
    })
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColums columns={orderedColumns}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {/* Nếu như đang kéo column */}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {/* Nếu như đang kéo card */}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent