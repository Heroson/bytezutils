interface ISubTreeMap {
  [propName: string]: string[] | number[]
}

interface ITreeConfig {
  idKey?: string,
  parentIdKey?: string,
  sortKey?: string
  sortOrder?: string
  root?: any,
}

// 如果扁平数据中的根节点是 falsy 值（undefined/null），则统一转换为这个常量值
const DEFAULT_ROOT = 'root'
const DEFAULT_CONFIG = {
  idKey: 'id',
  parentIdKey: 'parentId',
  root: '-1'
}

// 判断除了 0 以外的 falsy 值
function isFalsy(obj: any): boolean {
  return !obj && typeof (obj) !== 'number';
}

class Treefy {
  idKey!: string;
  parentIdKey!: string;
  root!: string;
  sortKey!: string;
  sortOrder!: 'asc' | 'desc';

  public constructor(config?: ITreeConfig){
    this.setConfig(config)
  }

  /**
   * 
   * 用于节点排序，默认按照 id 进行排序
   */ 
  private compareNode(node1: any, node2: any) {
    const sortKey = this.sortKey || this.idKey
    const sortOrder = this.sortOrder
    const node1Id = node1[sortKey]
    const node2Id = node2[sortKey]

    if (node1Id < node2Id) {
      return sortOrder === 'desc' ? 1 : -1
    } else if (node1Id > node2Id) {
      return sortOrder === 'desc' ? -1 : 1
    }
    return 0
  }

  // 找到所有的父——子树
  private buildMap(datalist: any[]) {
    const subTreeMap = datalist.reduce((map, item) => {
      const parentIdKey = this.parentIdKey
      let parentId = item[parentIdKey]
      if (isFalsy(parentId)) {
        parentId = DEFAULT_ROOT
      }
      if (map[parentId]) {
        map[parentId].push(item)
      } else {
        map[parentId] = [item]
      }
      return map
    }, {})
    return subTreeMap
  }

  // 遍历第一层节点，如果发现节点有子树则递归赋值
  private buildTree(nodelist: any[], map: ISubTreeMap) {
    nodelist.map((node: any) => {
      const parentIdKey = this.parentIdKey
      if (isFalsy(node[parentIdKey])) {
        node[parentIdKey] = DEFAULT_ROOT
      }
      return this.getSubTreeNode(node, map)
    }, [])

    // 对第一层节点进行排序，默认使用 id 作为排序依据
    nodelist.sort(this.compareNode.bind(this))

    return nodelist
  }

  // 通过递归子节点，补充子树
  private recurseTree(nodelist: any[], childrenArr: any[], map: ISubTreeMap) {
    nodelist.forEach((node) => {
      this.getSubTreeNode(node, map)
      childrenArr.push(node)
    })

    // 加入完所有子节点后，对子节点进行重新排序，默认使用 id 作为排序依据
    childrenArr.sort(this.compareNode.bind(this))
  }

  // 遍历
  private getSubTreeNode(node: any, map: ISubTreeMap) {
    const idKey = this.idKey;
    const nodeId = node[idKey]
    const subNodes = map[nodeId];
    node.children = []

    if (subNodes) {
      this.recurseTree(subNodes, node.children, map)
    }

    return node
  }

  public setConfig(config?: ITreeConfig){
    Object.assign(this, DEFAULT_CONFIG, config)

    // 若 root 值为 undefined/null，则重置
    if (isFalsy(this.root)) {
      this.root = DEFAULT_ROOT
    }
  }

  public transform(datalist: any[]){
    const subTreeMap = this.buildMap(datalist)
    const topNodeList = subTreeMap[this.root]
    const resultTree = this.buildTree(topNodeList, subTreeMap);

    return resultTree
  }
}

export default Treefy;