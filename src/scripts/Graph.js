import React from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'

function formatAMPM(date) {
	var hours = date.getHours()
	var minutes = date.getMinutes()
	var ampm = hours >= 12 ? 'pm' : 'am'
	hours = hours % 12
	hours = hours ? hours : 12 // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes
	var strTime = hours + ':' + minutes + ' ' + ampm
	return strTime
}

function initDiagram() {
	// const timeNow = new Date()
	const $ = go.GraphObject.make
	const diagram = $(go.Diagram, {
		'undoManager.isEnabled': true, // must be set to allow for model change listening
		// 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
		'clickCreatingTool.archetypeNodeData': {
			text: formatAMPM(new Date()),
			color: new go.Brush.randomColor(),
		},
		model: new go.GraphLinksModel({
			linkKeyProperty: 'key',
		}),
	})

	// define a simple Node template
	diagram.nodeTemplate = $(
		go.Node,
		'Auto', // the Shape will go around the TextBlock
		$(
			go.Shape,
			{
				name: 'SHAPE',
				strokeWidth: 1,
				height: 100,
				width: 100,
				geometryString:
					'F M86.60254037844386 0L173.20508075688772 50L173.20508075688772 150L86.60254037844386 200L0 150L0 50Z',
				fill: go.Brush.randomColor(),
			},
			// Shape.fill is bound to Node.data.color
			new go.Binding('fill', 'color').makeTwoWay()
		),
		// $(go.Shape, 'Ellipse', new go.Binding('fill', 'color')),
		$(
			go.TextBlock,
			{ margin: 1, editable: true }, // some room around the text
			new go.Binding('text').makeTwoWay()
		)
	)

	return diagram
}

function handleModelChange(changes) {
	console.log('GoJS model changed!')
}

export default function Graph() {
	return (
		<div>
			<ReactDiagram
				initDiagram={initDiagram}
				divClassName='diagram-component'
				nodeDataArray={[
					{ key: 0, text: 'Alpha', color: 'lightblue', loc: '0 0' },
					{ key: 1, text: 'Beta', color: 'yellow', loc: '100 0' },
					{
						key: 2,
						text: 'Gamma',
						color: 'lightgreen',
						loc: '100 0',
					},
					{ key: 3, text: 'Delta', color: 'pink', loc: '100 100' },
				]}
				linkDataArray={[{ key: 1, from: 0, to: 3 }]}
				onModelChange={handleModelChange}
			/>
		</div>
	)
}
