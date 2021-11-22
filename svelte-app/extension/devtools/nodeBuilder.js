function addNode(node, target, anchor) {
    nodeMap.set(node.id, node)
    nodeMap.set(node.detail, node)
  
    let targetNode = nodeMap.get(target)
    if (!targetNode || targetNode.parentBlock != node.parentBlock) {
      targetNode = node.parentBlock
    }
  
    node.parent = targetNode
  
    const anchorNode = nodeMap.get(anchor)
  
    if (targetNode) {
      let index = -1
      if (anchorNode) index = targetNode.children.indexOf(anchorNode)
  
      if (index != -1) {
        targetNode.children.splice(index, 0, node)
      } else {
        targetNode.children.push(node)
      }
    } else {
      rootNodes.push(node)
    }
  
    add(node, anchorNode)
  }
  

function insert(element, target, anchor) {
  const node = {
    id: _id++,
    type:
      element.nodeType == 1
        ? 'element'
        : element.nodeValue && element.nodeValue != ' '
        ? 'text'
        : 'anchor',
    detail: element,
    tagName: element.nodeName.toLowerCase(),
    parentBlock: currentBlock,
    children: []
  }
  addNode(node, target, anchor)

  for (const child of element.childNodes) {
    if (!nodeMap.has(child)) insert(child, element)
  }
}