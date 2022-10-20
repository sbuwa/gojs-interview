import React from 'react';
// import Graph from './scripts/Graph'
import TextEditor from './components/TextEditor';
import { PresenceProvider } from 'y-presence';
import Room from './components/Room';
import './App.css';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const ydoc = new Y.Doc();
const provider = new WebrtcProvider('mouse-demo', ydoc);
const awareness = provider.awareness;

export default function App() {
  return (
    <div>
      {/* <Graph /> */}
      <TextEditor />
      {/* <TextEditor /> */}
      <PresenceProvider awareness={awareness}>
        <Room />
      </PresenceProvider>
    </div>
  );
}
