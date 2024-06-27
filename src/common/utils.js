import { toast } from "react-nextjs-toast"
import { useNavigate } from "react-router"
import { setdollyInCount } from "../hoc/mainLayout"

export const isObjEmpty = (obj1) => {
    let flag = true
    const traverseNode = (arr, id, n, obj) => {
        if (id >= n) return

        if (obj[arr[id]] instanceof Object) {
            traverseNode(
                Object.keys(obj[arr[id]]),
                0,
                Object.keys(obj[arr[id]]).length,
                obj[arr[id]]
            )
        } else if (obj[arr[id]] !== '') {
            flag = false

            return
        } else {
            traverseNode(arr, id + 1, n, obj)
        }
    }
    traverseNode(Object.keys(obj1), 0, Object.keys(obj1).length, obj1)

    return flag
}

export const toNumbers = (n) => {
    let realFeet = n.split("'")
    let sum = (realFeet[0] * 12) + parseInt(realFeet[1])

    return sum
}

export const DataManager = {
    setPartitionType(type) {
        return localStorage.setItem('partitionType', type)
    },
    getPartitionType() {
        return localStorage.getItem('partitionType')
    },

    deletePartitionType() {
        return localStorage.removeItem('partitionType')
    },
    setOrderDetail(type) {
        return localStorage.setItem('orderDetail', JSON.stringify(type))
    },
    getOrderDetail() {
        return localStorage.getItem('orderDetail')
    },

    deleteOrderDetail() {
        return localStorage.removeItem('orderDetail')
    },
    removeData() {
        localStorage.clear()
    },
}

export const sliderTooltipFormatter = (value) => {

    return `${value}
    mm`
}

export const firstLetterUpperCase = (data) => {
    return data ? data.charAt(0).toUpperCase() + data.slice(1) : "";
};

export const isInternetConnected = (type = "error") => {
    if (navigator.onLine) {
        return true
    } else {
        toast.notify("Please check your internet connection.", {
            duration: 5,
            type: type,
        })
    }
};

export const getPreviousTotalAmount = (array) => {
    let tempPriceArr = [...array]
    let tempTotalPrice = tempPriceArr.reduce((a, b, c) => a + b[`step${c + 1}`], 0)

    return +tempTotalPrice
}

export const dollyInZoom = (BP3DData) => {
    const zoomScope = [1, 1.1, 1.21, 1.33, 1.46,]
    BP3DData.model.floorplan.update()
    BP3DData.three.controls.dollyIn(zoomScope[setdollyInCount])
    BP3DData.three.controls.update()
}
