import React, { useEffect } from 'react'
import * as Y from 'yjs'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import { QuillBinding } from 'y-quill'
import { WebrtcProvider } from 'y-webrtc'

export default function TextEditor() {
	useEffect(() => {
		//Create a new Y Document that we will use to create the editor & Initialize the WebRTC provider.
		const ydoc = new Y.Doc()
		const provider = new WebrtcProvider('quill-demo', ydoc)

		//Register cursors
		Quill.register('modules/cursors', QuillCursors)

		//Initialize & add text editor to the DOM
		const ytext = ydoc.getText('quill')
		const editorContainer = document.createElement('div') //
		editorContainer.setAttribute('id', 'editor')
		document.body.insertBefore(editorContainer, null)
		const editor = new Quill(editorContainer, {
			modules: {
				cursors: true,
				toolbar: [
					[{ header: [1, 2, false] }],
					['bold', 'italic', 'underline'],
					['image', 'code-block'],
				],
				history: {
					userOnly: true,
				},
			},
			placeholder: 'Start collaborating...',
			theme: 'snow', // or 'bubble'
		})

		//Bind to window
		const binding = new QuillBinding(ytext, editor, provider.awareness)
		window.example = { provider, ydoc, ytext, binding, Y }
	}, [])

	return (
		<div className='text-editor'>
			<h1>Editor</h1>
			<div id='editor' />
		</div>
	)
}
