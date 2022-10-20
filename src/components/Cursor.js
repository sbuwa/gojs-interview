import React, {useEffect} from 'react'

const Cursor = ({x, y, color}) => {
	useEffect (()=>{
		console.log("Cursor mounted")
		return ()=>{
			console.log("Cursor unmounted")
		}
	},[])
	
  return (
    <div>
      <svg
        // ref={rCursor}
        className='cursor'
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 35 35'
        fill='none'
        fillRule='evenodd'
		style={{
			"transform": `translate(${x}px, ${y}px)`
		}}
      >
        <g fill='rgba(0,0,0,92)'>
          <path d='m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z' />
          <path d='m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z' />
        </g>
        <g fill={color}>
          <path d='m12 24.4219v-16.015l11.591 11.619h-6.781l-.411.124z' />
          <path d='m21.0845 25.0962-3.605 1.535-4.682-11.089 3.686-1.553z' />
        </g>
      </svg>
    </div>
  );
}

export default Cursor