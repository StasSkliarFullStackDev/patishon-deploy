import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { useLocation } from 'react-router-dom'
// import { mainFunction2 } from './script.js'
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { BP3D } from '../../common/blueprint3d';
import { ViewTypeContext } from '../../hoc/mainLayout'

const View = () => {

  const location = useLocation()

  const reducerBlueprint = useSelector(getMemoizedBlueprint3dData)
  const {
    BP3DData
  } = reducerBlueprint

  const [localState, setLocalState] = useState('')
  const viewTypeContext = React.useContext(ViewTypeContext);
  console.log("this is location ", viewTypeContext)

  // useLayoutEffect(() => {

  //   const opts = {
  //     floorplannerElement: "floorplanner-canvas",
  //     threeElement: "#viewer",
  //     threeCanvasElement: "three-canvas",
  //     textureDir: "rooms/textures/",
  //     widget: false,
  //   };
  //   setLocalState(new BP3D.Blueprint3d(opts))


  // }, [])

  // useEffect(() => {
  //   console.log("this is component rerender");
  //   if (typeof localState != 'string') {
  //     mainFunction2(localState)
  //   }

  // }, [localState])

  // useEffect(() => {
  //   mainFunction2(viewTypeContext)
  // }, [])


  return (
    <div>
      <canvas className="webgl"></canvas>
    </div>
  )
}


export default View