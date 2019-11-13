import Treefy from './treefy'

let treefy: Treefy

beforeEach(() => {
  treefy = new Treefy()
})

// 处理多层级数据
test('transform multilevel data', () => {
  const source = [
    {id: '1', name: '他的', parentId: '-1'},
    {id: '2', name: '你的', parentId: '-1'},
    {id: '3', name: '我的', parentId: '-1'},
    {id: '4', name: '我的书', parentId: '3'},
    {id: '5', name: '技术', parentId: '4'},
    {id: '6', name: '文艺', parentId: '4'},
  ]
  const result = [
    {id: '1', name: '他的', parentId: '-1', children: []},
    {id: '2', name: '你的', parentId: '-1', children: []},
    {id: '3', name: '我的', parentId: '-1', children: [
      {id: '4', name: '我的书', parentId: '3', children: [
          {id: '5', name: '技术', parentId: '4', children: []},
          {id: '6', name: '文艺', parentId: '4', children: []}
      ]}
    ]},
  ]

  const calcResult = treefy.transform(source)
  expect(calcResult).toEqual(result)
})

// 处理层级属性 key 不同的数据
test('transform data with different key', () => {
  const source = [
    {no: '1', name: '我的', parentNo: undefined},
    {no: '2', name: '我的书', parentNo: '1'},
    {no: '3', name: '技术', parentNo: '2'},
    {no: '4', name: '方法论', parentNo: '2'},
    {no: '5', name: '前端', parentNo: '3'},
    {no: '6', name: '后端', parentNo: '3'},
    {no: '7', name: '如何阅读一本书', parentNo: '4'},
    {no: '8', name: '学会提问', parentNo: '4'},
  ]
  const result = [
    {no: '1', name: '我的', parentNo: 'root', children: [
      {no: '2', name: '我的书', parentNo: '1', children: [
        {no: '3', name: '技术', parentNo: '2', children: [
          {no: '5', name: '前端', parentNo: '3', children: []},
          {no: '6', name: '后端', parentNo: '3', children: []}
        ]},
        {no: '4', name: '方法论', parentNo: '2', children: [
          {no: '7', name: '如何阅读一本书', parentNo: '4', children: []},
          {no: '8', name: '学会提问', parentNo: '4', children: []}
        ]}
      ]}
    ]}
  ]

  treefy.setConfig({
    idKey: 'no',
    parentIdKey: 'parentNo',
    root: undefined
  })
  const calcResult = treefy.transform(source)
  expect(calcResult).toEqual(result)
})

/**
 * 处理无序的数据
 * 
 * 结构如下：
 * |-1
 *    |-2
 *      |-3
 *        |-5
 *        |-6
 *      |-4
 *        |-7
 *        |-8
 * |-9
 */
test('transform out-of-order data, default by idKey', () => {
  const source = [
    {no: '7', name: '如何阅读一本书', parentNo: '4'},
    {no: '1', name: '我的', parentNo: undefined},
    {no: '4', name: '方法论', parentNo: '2'},
    {no: '2', name: '我的书', parentNo: '1'},
    {no: '5', name: '前端', parentNo: '3'},
    {no: '3', name: '技术', parentNo: '2'},
    {no: '8', name: '学会提问', parentNo: '4'},
    {no: '6', name: '后端', parentNo: '3'},
  ]
  const result = [
    {no: '1', name: '我的', parentNo: 'root', children: [
      {no: '2', name: '我的书', parentNo: '1', children: [
        {no: '3', name: '技术', parentNo: '2', children: [
          {no: '5', name: '前端', parentNo: '3', children: []},
          {no: '6', name: '后端', parentNo: '3', children: []}
        ]},
        {no: '4', name: '方法论', parentNo: '2', children: [
          {no: '7', name: '如何阅读一本书', parentNo: '4', children: []},
          {no: '8', name: '学会提问', parentNo: '4', children: []}
        ]}
      ]}
    ]}
  ]
  
  treefy.setConfig({
    idKey: 'no',
    parentIdKey: 'parentNo',
    root: undefined
  })
  const calcResult = treefy.transform(source)

  expect(calcResult).toEqual(result)
})

/**
 * 按照某个 key 进行排序，默认升序
 * 
 * 结构如下：
 * |-1
 *    |-2
 *      |-3
 *        |-5
 *        |-6
 *      |-4
 *        |-7
 *        |-8
 * |-9
 * 
 * 希望如下：
 *
 * |-9
 * |-1
 *    |-2
 *      |-4
 *        |-7
 *        |-8
 *      |-3
 *        |-6
 *        |-5
 * 
 */
test('transform data that needs to be reordered, default sort order is asc', () => {
  const source = [
    {no: '2', name: '我的书', parentNo: '1', priority:1},
    {no: '1', name: '我的', parentNo: null, priority:2},
    {no: '7', name: '如何阅读一本书', parentNo: '4', priority:99},
    {no: '4', name: '方法论', parentNo: '2', priority:1},
    {no: '9', name: '你的', parentNo: null, priority:1},
    {no: '5', name: '前端', parentNo: '3', priority:21},
    {no: '3', name: '技术', parentNo: '2', priority:2},
    {no: '8', name: '学会提问', parentNo: '4', priority:57},
    {no: '6', name: '后端', parentNo: '3', priority:-1},
  ]
  const result = [
    {no: '9', name: '你的', parentNo: 'root', priority:1, children: []},
    {no: '1', name: '我的', parentNo: 'root', priority:2, children: [
      {no: '2', name: '我的书', parentNo: '1', priority:1, children: [
        {no: '4', name: '方法论', parentNo: '2', priority:1, children: [
          {no: '8', name: '学会提问', parentNo: '4', priority:57, children: []},
          {no: '7', name: '如何阅读一本书', parentNo: '4', priority:99, children: []}
        ]},
        {no: '3', name: '技术', parentNo: '2', priority:2, children: [
          {no: '6', name: '后端', parentNo: '3', priority:-1, children: []},
          {no: '5', name: '前端', parentNo: '3', priority:21, children: []}
        ]}
      ]}
    ]}
  ]
  
  treefy.setConfig({
    idKey: 'no',
    parentIdKey: 'parentNo',
    root: null,
    sortKey: 'priority'
  })

  const calcResult = treefy.transform(source)

  expect(calcResult).toEqual(result)
})

/**
 * 按照某个 key 进行排序，按降序排列
 * 
 * 结构如下：
 * |-1
 *    |-2
 *      |-3
 *        |-5
 *        |-6
 *      |-4
 *        |-7
 *        |-8
 * |-9
 * 
 * 希望如下：
 *
 * |-9
 * |-1
 *    |-2
 *      |-4
 *        |-7
 *        |-8
 *      |-3
 *        |-6
 *        |-5
 * 
 */
test('transform data that needs to be reordered, sort order is desc', () => {
  const source = [
    {no: '9', name: '你的', parentNo: null, priority:99},
    {no: '1', name: '我的', parentNo: null, priority:1},
    {no: '2', name: '我的书', parentNo: '1', priority:1},
    {no: '4', name: '方法论', parentNo: '2', priority:65},
    {no: '3', name: '技术', parentNo: '2', priority:77},
    {no: '5', name: '前端', parentNo: '3', priority:21},
    {no: '6', name: '后端', parentNo: '3', priority:-1},
    {no: '7', name: '如何阅读一本书', parentNo: '4', priority:99},
    {no: '8', name: '学会提问', parentNo: '4', priority:57},
  ]
  const result = [
    {no: '9', name: '你的', parentNo: 'root', priority:99, children: []},
    {no: '1', name: '我的', parentNo: 'root', priority:1, children: [
      {no: '2', name: '我的书', parentNo: '1', priority:1, children: [
        {no: '3', name: '技术', parentNo: '2', priority:77, children: [
          {no: '5', name: '前端', parentNo: '3', priority:21, children: []},
          {no: '6', name: '后端', parentNo: '3', priority:-1, children: []}
        ]},
        {no: '4', name: '方法论', parentNo: '2', priority:65, children: [
          {no: '7', name: '如何阅读一本书', parentNo: '4', priority:99, children: []},
          {no: '8', name: '学会提问', parentNo: '4', priority:57, children: []}
        ]}
      ]}
    ]}
  ]

  treefy.setConfig({
    idKey: 'no',
    parentIdKey: 'parentNo',
    root: null,
    sortKey: 'priority',
    sortOrder: 'desc'
  })
  
  const calcResult = treefy.transform(source)

  expect(calcResult).toEqual(result)
})