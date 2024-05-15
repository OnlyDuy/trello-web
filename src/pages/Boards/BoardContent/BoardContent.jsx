import Box from '@mui/material/Box'
import ListColums from './LiistColumns/ListColums'
import { mapOrder } from '~/utils/sorts'
import { 
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor
 } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'

function BoardContent({ board }) {
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 }})

  // yêu cầu chuột di chuyển 10px thì mới kích hoạt event, fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 }})
  
  // nhấn giữ khoảng 250ms và dung sai của cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 }})

  //const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const handleDragEnd = (event) => {
    console.log('handleDragEnd: ', event)
    const { active, over } = event

    if (!over) return

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
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <Box sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
        width: '100%',
        height: (theme) => theme.trello.boardContentHeight,
        p: '10px 0'
      }}>
        <ListColums columns={orderedColumns}/>
      </Box>
    </DndContext>
  )
}

export default BoardContent