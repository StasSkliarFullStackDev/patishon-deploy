import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import React, { useEffect, useLayoutEffect } from "react"
import { useSelector } from "react-redux";
import { dollyInZoom } from "../../common/utils";
import { LOCAL_SERVER } from "../../constant"
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";

const Step4 = (props) => {
  const {
    blueprint3d,
    handleChangeState,
    prevStep
  } = props

  let globalReducerData = blueprint3d[0]?.globals?.getGlobal("doorHandles")
  let selectedHandel = blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")?.selectedHandle
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const configurationData = useSelector(getMemoizedConfigurationData)
  const {
    BP3DData
  } = reducerBluePrint
  const {
    totalPrice
  } = configurationData

  const [frameType, setframeType] = React.useState(parseInt(selectedHandel) || 0)
  const [handlePrice, setHandlePrice] = React.useState(globalReducerData[parseInt(selectedHandel)].isDefault ? 0 : globalReducerData[parseInt(selectedHandel)])

  useLayoutEffect(() => {
    if (prevStep < 4) {
      for (const i in globalReducerData) {
        if (globalReducerData[i].isDefault) {
          blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {
            ...blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"),
            selectedHandle: +i
          })
        }
      }
    }
    dollyInZoom(BP3DData)
  }, [])
  useEffect(() => {
    dollyInZoom(BP3DData)
  }, [])


  // useLayoutEffect(() => {
  //   if (!globalReducerData[frameType]?.isDefault) {
  //     stTotalPriceLocal(totalPrice + (globalReducerData[frameType]?.price))
  //   }
  // }, [frameType])

  const handelSelection = (i) => {
    blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {
      ...blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"),
      selectedHandle: i
    })
    setframeType(i)
    reducerBluePrint?.BP3DData.model.floorplan.update()
  }

  return (
    <div className='step4'>
      <div className='dimensions-data varients steps7'>
        <div class="label_container_For_customization custom_centered_aligned">
          <h3>Door Handle</h3>
          <Tooltip placement="topRight" title={<span style={{ fontSize: '14px'}}>Please choose your door handle.</span>}>
            <InfoCircleOutlined className="custom_icon" />
          </Tooltip>
        </div>
        <h4>Variants</h4>
        <div className="wrapper-frames-talent default_div_p">
          {globalReducerData?.map((eachHandel, index) => {
            return (<div className={`wrapper_frames ${frameType === index && 'active'}`} >
              <img src={LOCAL_SERVER + eachHandel.type} className={`second_div data_second_t ${!eachHandel.isActivated && "block"}`}
                onClick={() => {
                  if (eachHandel.isActivated) {
                    setHandlePrice(eachHandel.isDefault ? 0 : eachHandel.price)
                    handelSelection(index)
                    blueprint3d[0]?.globals?.getCurrentPrice()
                  }
                }} alt="handel" />
              <p>{eachHandel.isDefault ? "Default" : "Handle " + (index + 1)}</p>
            </div>)
          })}
        </div>
      </div>
      <div className="button_lite_ions padding_line">
        <div className='button'>
          <button type='submit' onClick={() => {
            handleChangeState(undefined, 5)
            blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {
              ...blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"),
              selectedHandle: frameType
            })
            blueprint3d[0]?.globals?.getCurrentPrice()
          }} className='sucess_button'>Next</button>
        </div>
      </div>
      {/* <p class="previous text-center prevois_prices small-prices">Previous Price = £{blueprint3d[0]?.globals?.getGlobal("previousPrice")} + Handle £{handlePrice.price ?? handlePrice}</p>
      <div className="floating-text">
        <p>total<br></br> price</p>
        <h3>{`£${totalPrice}`}</h3>
      </div> */}
    </div>
  )
}
export default Step4