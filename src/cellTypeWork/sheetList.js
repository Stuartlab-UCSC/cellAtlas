
// The cluster worksheet sheet pick list logic.

import { connect } from 'react-redux'
import PickList from 'components/PickList'
import { get as rxGet, set as rxSet } from 'state/rx'
import fetchData, { receiveData } from 'fetch/data'
import { getWorksheetData } from 'cellTypeWork/worksheet'

const USE_TEST_DATA = false
const DOMAIN = 'cellTypeSheet'

const testData = [
    'pbmc',  // as admin@replace.me
    // test@test.com/test
]
let prevUser = null

const getSelected = (sheets) => {
    // Get the most recently used worksheet, or the first in the list.
    let selected = rxGet('cellTypeWork.sheetSelected')
    if (!selected) {
        if (sheets.length) {
            selected = sheets[0].name
            rxSet('cellTypeWork.sheetSelected.load', { value: selected })
        }
        rxSet('cellTypeWork.sheetSelected.firstSheet', { value: selected })
    }

    if (selected) {
        getWorksheetData(selected)
    }
}

const receiveDataFromServer = (data) => {
    // Transform data from server into that needed for the pick list.
    const error = rxGet(DOMAIN + '.fetchMessage')
    if (error !== null) {
        alert(error)
        return
    } else if (data === null || data.length < 1) {
        alert('No worksheet names were receive from the server.')
        return
    }
    const user = rxGet('auth.user').name
    // Find the worksheets owned by the user.
    let userSheets = data.filter(sheet => {
        const i = sheet.indexOf('/')
        return (i < 0 || sheet.slice(0, i) === user)
    })
    userSheets.sort()
    // Find the worksheets owned by others.
    let otherSheets = data.filter(sheet => {
        const i = sheet.indexOf('/')
        return (i > -1 && sheet.slice(0, i) !== user)
    })
    otherSheets.sort()
    // Transform the sheets owned by the user, stripping off the user name.
    let sheets = userSheets.map(sheet => {
        const i = sheet.indexOf('/')
        const name = sheet.slice(i+1)
        return { value: name, name: name }
    })
    // Transform the sheets owned by others.
    sheets.push(...otherSheets.map(name => {
        return { value: name, name: name }
    }))
    rxSet('cellTypeWork.sheetList.load', { value: sheets })
    // Get the most recently used worksheet, or the first in the list.
    getSelected(sheets)
}

const getSheetListData = () => {
    // Load a new sheetList when the user changes or on initial page load.
    const initialPageLoaded = rxGet('cellTypeWork.initialPageLoaded')
    let user = rxGet('auth.user').name
    if (user === prevUser && initialPageLoaded) {
        return
    }
    if (!initialPageLoaded) {
        rxSet('cellTypeWork.initialPageLoaded.true')
    }
    prevUser = user
    
    // Now get the data.
    const url = '/user/worksheets'
    let options = { credentials: true }
    if (USE_TEST_DATA) {
        receiveData(DOMAIN, testData, receiveDataFromServer, options)
    } else {
        fetchData(DOMAIN, url, receiveDataFromServer, options)
    }
}

const mapStateToProps = (state) => {
    // TODO there must be a better way to do this.
    // maybe setting something in auth.user?
    setTimeout(() => getSheetListData() )

    return {
        id: 'cell_type_work_sheet',
        label: 'Cell Type Worksheet',
        list: state.cellTypeWork.sheetList,
        selected: state.cellTypeWork.sheetSelected,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: ev => {
            const sheet = ev.target.value
            dispatch({
                type: 'cellTypeWork.sheetSelected.uiSelect',
                value: sheet,
            })
            dispatch({
                type: 'cellTypeWork.sheetOwnedByUser.uiSelect',
                value: sheet
            })
            getWorksheetData(sheet)
        },
    }
}

const SheetList = connect(
    mapStateToProps, mapDispatchToProps
)(PickList)

export default SheetList
export { getSheetListData, USE_TEST_DATA }
