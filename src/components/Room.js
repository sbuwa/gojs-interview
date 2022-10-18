import React, { useCallback } from 'react'
import { useSelf, useOthers, usePresence } from 'y-presence'
import { Cursor } from './Cursor'

export default function Room() {
	const others = useOthers()
	const { self, updatePresence } = useSelf()

	const handlePointMove = useCallback(
		(event) => {
			updatePresence({
				x: event.clientX,
				y: event.clientY,
			})
			console.log(event.clientX, event.clientY)
		},
		[updatePresence]
	)
	return (
		<div className='room' onPointerMove={handlePointMove}>
			<div className='info'>
				Number of connected users: {others.length + 1}
			</div>
			{others.map((user) => {
				return <Cursor key={user.id} {...user.presence} />
			})}
		</div>
	)
}
