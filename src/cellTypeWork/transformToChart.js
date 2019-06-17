
// Transform the data from the server into the chart format.

import { get as rxGet, set as rxSet } from 'state/rx'
import { getCatColormap } from 'color/colorCat'
import { buildBubblesOnLoad } from 'cellTypeWork/transformToBubbles'
import { tsvToArrays } from 'app/util'

const buildClusters = (data) => {
    // Find the clusters and sort them by column position.
    if (!data || !data.clusters) {
        return
    }
    // Clusters are received with positional columns,
    // cluster names, cell counts, cell type colorbar and cell type:
    //      column  cluster cell_count  bar_color   cell_type
    //      0       2       321         0           Ventricular CMs
    //      1       0       456         4
    //      2       1       344         3           Atrial CMs
    const lines = tsvToArrays(data.clusters)
    const clusterCount = lines.length - 1
    let clusters = Array.from(clusterCount)
    let cellTypes = Array.from(clusterCount)
    let colorBar = Array.from(clusterCount)
    lines.slice(1).forEach((line,i) => {
        clusters[line[0]] = {
            name: line[1],
            cellCount: parseFloat(line[2]),
        }
        cellTypes[line[0]] = line[4]
        colorBar[line[0]] = line[3]
    })

    return {colorBar, clusters, cellTypes }
}

const buildGenes = (data) => {
    // Find the genes and sort them by row position.
    if (!data || !data.genes) {
        return
    }
    // Genes are received with positional rows and genes:
    //      row     gene
    //      3       ALK
    //      2       TP53
    //      ...
    let lines = tsvToArrays(data.genes).slice(1)
    let genes = Array.from(lines.length)
    lines.forEach((line) => {
        genes[line[0]] = line[1]
    })

    return genes
}

const transfromToChart = (data) => {
    // Transform the format from the server response to worksheet chart.
    rxSet('cellTypeWork.dims.default')
    rxSet('cellTypeWork.colormap.default')
    rxSet('cellTypeWork.data.default')
    const { colorBar, clusters, cellTypes } = buildClusters(data)
    const genes = buildGenes(data)
    const { bubbles, colorRange, sizeRange } = buildBubblesOnLoad(data)

    // Update the dimensions now that we know the cluster and gene counts.
    let clusterCount = 0
    if (clusters) {
        clusterCount = clusters.length
    }
    let geneCount = 0
    if (genes) {
        geneCount = genes.length
    }
    let dims = rxGet('cellTypeWork.dims')
    const { colWidth, rowHeight } = dims
    dims.bubblesWidth = (clusterCount * colWidth) + (colWidth / 4)
    dims.bubblesHeight = (geneCount * rowHeight) + (colWidth / 4)
    dims.colorRange = colorRange
    dims.sizeRange = sizeRange
    rxSet('cellTypeWork.dims.load', { value: dims })

    // Create the colormap which will be static for this data load.
    const colormap = getCatColormap('hexmap', clusterCount)
    rxSet('cellTypeWork.colormap.create', { value: colormap })

    // Update the chart data.
    rxSet('cellTypeWork.data.load', { value: {
        dataset:         data.dataset_name,
        clusterSolution: data.cluster_solution_name,
        sizeBy:          data.size_by,
        colorBy:         data.color_by,
        clusters,
        colorBar,
        cellTypes,
        genes,
        bubbles,
    }})
}

export default transfromToChart
