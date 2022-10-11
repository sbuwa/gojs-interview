import React, { useEffect } from 'react'
import * as go from 'gojs'
import { ReactDiagram } from 'gojs-react'

var AllowTopLevel = false
var CellSize = new go.Size(50, 50)

function init() {
	const $ = go.GraphObject.make

	const myDiagram = $(go.Diagram, 'diagram-component', {
		grid: $(
			go.Panel,
			'Grid',
			{ gridCellSize: CellSize },
			$(go.Shape, 'LineH', { stroke: 'lightgray' }),
			$(go.Shape, 'LineV', { stroke: 'lightgray' })
		),
		// support grid snapping when dragging and when resizing
		'draggingTool.isGridSnapEnabled': true,
		'draggingTool.gridSnapCellSpot': go.Spot.Center,
		'resizingTool.isGridSnapEnabled': true,
		'animationManager.isEnabled': false,
		'undoManager.isEnabled': true,
	})

	// Regular Nodes represent items to be put onto racks.
	// Nodes are currently resizable, but if that is not desired, just set resizable to false.
	myDiagram.nodeTemplate = $(
		go.Node,
		'Auto',
		{
			resizable: true,
			resizeObjectName: 'SHAPE',
			// because the gridSnapCellSpot is Center, offset the Node's location
			locationSpot: new go.Spot(
				0,
				0,
				CellSize.width / 2,
				CellSize.height / 2
			),
			// provide a visual warning about dropping anything onto an "item"
			mouseDragEnter: (e, node) => {
				e.handled = true
				node.findObject('SHAPE').fill = 'red'
				e.diagram.currentCursor = 'not-allowed'
				highlightGroup(node.containingGroup, false)
			},
			mouseDragLeave: (e, node) => node.updateTargetBindings(),
			// disallow dropping anything onto an "item"
			mouseDrop: (e, node) => node.diagram.currentTool.doCancel(),
		},
		// always save/load the point that is the top-left corner of the node, not the location
		new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(
			go.Point.stringify
		),
		// this is the primary thing people see
		$(
			go.Shape,
			'Rectangle',
			{
				name: 'SHAPE',
				fill: 'white',
				minSize: CellSize,
				desiredSize: CellSize, // initially 1x1 cell
			},
			new go.Binding('fill', 'color'),
			new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
				go.Size.stringify
			)
		),
		// with the textual key in the middle
		$(
			go.TextBlock,
			{ alignment: go.Spot.Center, font: 'bold 16px sans-serif' },
			new go.Binding('text', 'key')
		)
	) // end Node

	// Groups represent racks where items (Nodes) can be placed.
	// Currently they are movable and resizable, but you can change that
	// if you want the racks to remain "fixed".
	// Groups provide feedback when the user drags nodes onto them.

	function highlightGroup(grp, show) {
		if (!grp) return false
		// check that the drop may really happen into the Group
		var tool = grp.diagram.toolManager.draggingTool
		grp.isHighlighted = show && grp.canAddMembers(tool.draggingParts)
		return grp.isHighlighted
	}

	var groupFill = 'rgba(128,128,128,0.2)'
	var groupStroke = 'gray'
	var dropFill = 'rgba(128,255,255,0.2)'
	var dropStroke = 'red'

	myDiagram.groupTemplate = $(
		go.Group,
		{
			layerName: 'Background',
			resizable: true,
			resizeObjectName: 'SHAPE',
			// because the gridSnapCellSpot is Center, offset the Group's location
			locationSpot: new go.Spot(
				0,
				0,
				CellSize.width / 2,
				CellSize.height / 2
			),
		},
		// always save/load the point that is the top-left corner of the node, not the location
		new go.Binding('position', 'pos', go.Point.parse).makeTwoWay(
			go.Point.stringify
		),
		{
			// what to do when a drag-over or a drag-drop occurs on a Group
			mouseDragEnter: (e, grp, prev) => {
				if (!highlightGroup(grp, true))
					e.diagram.currentCursor = 'not-allowed'
				else e.diagram.currentCursor = ''
			},
			mouseDragLeave: (e, grp, next) => highlightGroup(grp, false),
			mouseDrop: (e, grp) => {
				var ok = grp.addMembers(grp.diagram.selection, true)
				if (!ok) grp.diagram.currentTool.doCancel()
			},
		},
		$(
			go.Shape,
			'Rectangle', // the rectangular shape around the members
			{
				name: 'SHAPE',
				fill: groupFill,
				stroke: groupStroke,
				minSize: new go.Size(CellSize.width * 2, CellSize.height * 2),
			},
			new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(
				go.Size.stringify
			),
			new go.Binding('fill', 'isHighlighted', (h) =>
				h ? dropFill : groupFill
			).ofObject(),
			new go.Binding('stroke', 'isHighlighted', (h) =>
				h ? dropStroke : groupStroke
			).ofObject()
		)
	)

	// decide what kinds of Parts can be added to a Group
	myDiagram.commandHandler.memberValidation = (grp, node) => {
		if (grp instanceof go.Group && node instanceof go.Group) return false // cannot add Groups to Groups
		// but dropping a Group onto the background is always OK
		return true
	}

	// what to do when a drag-drop occurs in the Diagram's background
	myDiagram.mouseDragOver = (e) => {
		if (!AllowTopLevel) {
			// OK to drop a group anywhere or any Node that is a member of a dragged Group
			var tool = e.diagram.toolManager.draggingTool
			if (
				!tool.draggingParts.all(
					(p) =>
						p instanceof go.Group ||
						(!p.isTopLevel &&
							tool.draggingParts.contains(p.containingGroup))
				)
			) {
				e.diagram.currentCursor = 'not-allowed'
			} else {
				e.diagram.currentCursor = ''
			}
		}
	}

	myDiagram.mouseDrop = (e) => {
		if (AllowTopLevel) {
			// when the selection is dropped in the diagram's background,
			// make sure the selected Parts no longer belong to any Group
			if (
				!e.diagram.commandHandler.addTopLevelParts(
					e.diagram.selection,
					true
				)
			) {
				e.diagram.currentTool.doCancel()
			}
		} else {
			// disallow dropping any regular nodes onto the background, but allow dropping "racks",
			// including any selected member nodes
			if (
				!e.diagram.selection.all((p) => {
					return (
						p instanceof go.Group ||
						(!p.isTopLevel && p.containingGroup.isSelected)
					)
				})
			) {
				e.diagram.currentTool.doCancel()
			}
		}
	}

	// start off with four "racks" that are positioned next to each other
	myDiagram.model = new go.GraphLinksModel([
		{ key: 'G1', isGroup: true, pos: '0 0', size: '200 200' },
		{ key: 'G2', isGroup: true, pos: '200 0', size: '200 200' },
		{ key: 'G3', isGroup: true, pos: '0 200', size: '200 200' },
		{ key: 'G4', isGroup: true, pos: '200 200', size: '200 200' },
	])
	// this sample does not make use of any links
	return myDiagram
}

function handleModelChange(changes) {
	alert('GoJS model changed!')
}

export default function Planogram() {
	// useEffect(() => {
	// 	init()
	// }, [])
	window.addEventListener('DOMContentLoaded', init)

	return (
		<div>
			{/* <GraphWoGrid /> */}
			<ReactDiagram
				initDiagram={init}
				divClassName='diagram-component'
				nodeDataArray={[
					{ key: 0, text: 'Alpha', color: 'lightblue', loc: '0 0' },
					{ key: 1, text: 'Beta', color: 'orange', loc: '150 0' },
					{
						key: 2,
						text: 'Gamma',
						color: 'lightgreen',
						loc: '0 150',
					},
					{ key: 3, text: 'Delta', color: 'pink', loc: '150 150' },
				]}
				linkDataArray={[{ key: 1, from: 0, to: 3 }]}
				onModelChange={handleModelChange}
			/>
			Hello There
		</div>
	)
}
