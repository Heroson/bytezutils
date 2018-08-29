/**
 * 数据结构为
 *
 * {
 *   name: 'root',
 *   children: [
 *     {name: 'member1', children: [
 *       {name: '张三', children:[]}
 *       {name: '李四', children:[]}
 *       {name: '王五', children:[]}
 *     ]},
 *     {name: 'member2', children:[]}
 *     {name: 'member3', children:[]}
 *   ]
 * }
 */
function buildRoot(taskCreator, members){
  let root = {name:taskCreator, children:[]}
  let map = {}
  members.forEach((m) => {
    root.children.push({ user_id:m.user_id, name: m.truename||m.nickname||'佚名', children: [] })
    map[m.user_id] = []
  })

  return {
    data:root, map
  }
}


function buildMap(originData, ctx){ // 注意传入的成员 from 属性应该为字符串"0"，这样可以不用 typeof 判断假值

  let map = ctx.map

  for(let i in originData){
    const val = originData[i]   
    const from = val.from
    const memberId = val.teammember_id

    if(!originData[from] || from === 0){
      val.from = memberId
      if(!map[memberId]) map[memberId] = [] // 初始化存放子节点的空间，下同
      map[memberId].push({ user_id: i, ...val })
    }else{
      if(!map[from]) map[from] = []
      map[from].push({ user_id: i, ...val }) // 形成小树
    }
  }
  return ctx
}

function treeFy(originData,members,taskCreator){

  let ctx = buildRoot(taskCreator, members) // 生成成员层

  ctx = buildMap(originData, ctx) // 生成父-子对 map

  const {data, map} = ctx

  let maxLayer = 0
  let count = 0
  let layers = []
  let layerMap = { // 记录每个节点所在的层数
    // 2438783: 0
    // 24: 1,
    // 28: 1,
    // 25: 2,
    // 26: 2
  }

  function traverse(node, ctx){
    const _id = node.user_id
    const children = map[_id] // 检索map, 看是否有子节点，没有则直接忽略
    const isLeaf = (!children || !children.length)
    let _from = node.from
    let parentLayer

    // console.log('node ==>', _id, ' count ==>', count)
    
    if(_from){ // 查找来源的层数，以此设置自身的层数，并设置映射
      parentLayer = layerMap[_from]
      count = layerMap[_id] = parentLayer + 1

      // if(!layers[count]){ // 拼接每层的id
      //   layers[count] = [node]
      // }else{
      //   layers[count].push(node)
      // }
      if(!layers[count]){ // 拼接每层的id
        layers[count] = ''+ _id
      }else{
        layers[count] += ','+_id
      }

      if(!isLeaf){ // 非叶子节点（children不为空），都往下加一层
        count++
      }else if(maxLayer < count){ // 是叶子节点，则说明是当前路径的最后一层，比较当前层数后决定最大层数
        maxLayer = count
      }
    }

    if(children && children.length > 0){
      children.forEach((item) => {
        let nextCtx = []
        ctx.push({user_id:item.user_id ,name:item.truename||item.nickname||'佚名', children: nextCtx})
        return traverse(item, nextCtx)
      })
    }

  }

  // layers[0] = data.slice(0) // 所有成员都属于顶层
  let idStr = ''
  idStr = layers[0] = data.children.reduce((str, item) => {
    return str += item.user_id + ','
  }, '')
  idStr = idStr.slice(0,-1)
  layers[0] = idStr

  data.children.forEach((member) => {
    layerMap[member.user_id] = 0 // 所有成员节点都处于顶层
    traverse(member, member.children)
  })
  
  return {
    'maxLayer': maxLayer,
    'layers': layers,
    'data': data,
  }
}