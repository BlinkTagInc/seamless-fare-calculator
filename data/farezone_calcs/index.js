const fs = require('fs')
const Graph = require('node-dijkstra')
const csv = require('csvtojson')
const { omit } = require('lodash')

const csvFilePath='../farezone_adjacent.csv'

const buildAdjacencyGraph = async () => {
  const importedData = await csv().fromFile(csvFilePath)
  const graph = new Graph()

  for (const row of importedData) {
    const neighbors = {}

    for (const [zone, value] of Object.entries(row))  {
      if (value === '1') {
        neighbors[zone] = 1
      }
    }
  
    graph.addNode(row.field1, neighbors)
  }

  const zones = Object.keys(omit(importedData[0], 'field1'))

  const zoneMatrix = {}
  for (const originZone of zones) {
    zoneMatrix[originZone] = {}

    for (const destinationZone of zones) {
      const route = graph.path(originZone, destinationZone, { cost: true })
      zoneMatrix[originZone][destinationZone] = route.cost + 1
    }
  }
  
  fs.writeFileSync('farezones_matrix.json', JSON.stringify(zoneMatrix, null, 2))
}

buildAdjacencyGraph();
