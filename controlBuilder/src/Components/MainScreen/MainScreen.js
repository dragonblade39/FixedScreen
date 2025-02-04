import React from 'react';
import TreeView1 from '../TreeView1/TreeView1';
import TreeView from '../TreeView/TreeView';
import DefaultView from '../DefaultView/DefaultView';

function MainScreen() {
  return (
    <div >
        <TreeView /> Automatic Collapsing
        {/* <TreeView1 />  Two Section View */}
        {/* <DefaultView /> */}
    </div>
  );
}

export default MainScreen;