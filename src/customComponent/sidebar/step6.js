import React, {useEffect, useLayoutEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {Slider, Tooltip} from 'antd';

import ThemeImages from "../../themes/appImage";
import {updateConfigurationStates} from "../../redux/actions/configuration"
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import {getMemoizedBlueprint3dData} from "../../redux/selectors/blueprint3d";
import {setdollyInCount} from "../../hoc/mainLayout";
import {dollyInZoom} from "../../common/utils";
import {InfoCircleOutlined} from "@ant-design/icons";
import './step6.css'
import {updateEngineStatesAction} from "../../redux/actions/blueprint3d";
import html2canvas from "html2canvas";

const Step6 = (props) => {

  const configuratorData = useSelector(getMemoizedConfigurationData)
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const {
    roomHeight,
    numberOfhorizontalFrames,
    clientWallWidth,
    newPanels,
    newDoor,
    toggle3dView
  } = configuratorData

  const dispatch = useDispatch()

  const {
    handleChangeState,
    blueprint3d
  } = props

  let frames = blueprint3d[0]?.globals?.getGlobal("frameTypes")
  let framesVariants = blueprint3d[0]?.globals?.getGlobal("frameVariants")
  let filmsVariants = blueprint3d[0]?.globals?.getGlobal("films")
  let selectedColorVariants = blueprint3d[0]?.globals?.getGlobal("selectedColorVariant")
  let selectedFrameType = blueprint3d[0]?.globals?.getGlobal("selectedMetalFrameType")
  const [frameType, setframeType] = useState(selectedFrameType == "Single metal glazing" ? 0 : 1)
  const [frameVariant, setframeVariant] = useState(0)
  const [numbersOfBars, setNumbersOfBars] = useState(numberOfhorizontalFrames)
  const [panelsWidth, setPanelsWidth] = useState()

  useLayoutEffect(() => {
    if (!frames[0].isActivated) {
      setframeType(1)
    }
    for (const i in framesVariants) {
      if (framesVariants[i].isDefault) {
        setframeVariant(selectedColorVariants)
      }
    }
    handleApply()
  }, [])

  const formatter = (value) => `${value}`;

  const handleOnChange = (value) => {
    setNumbersOfBars(value)
    dispatch(updateConfigurationStates(value, "numberOfhorizontalFrames"))
    blueprint3d[0]?.globals?.setGlobal("selectedHorizontalFrames", value)
    reducerBluePrint?.BP3DData.model.floorplan.update()
    handleApply()
  }

  const handleFrameTypeChange = (type) => {
    if (type == "single" && frames[0]?.isActivated) {
      setframeType(0)
      setNumbersOfBars(1)
      blueprint3d[0]?.globals?.setGlobal("selectedHorizontalFrames", 1)
      dispatch(updateConfigurationStates(1, "numberOfhorizontalFrames"))
      blueprint3d[0]?.globals?.setGlobal("selectedMetalFrameType", frames[0]?.type)
      reducerBluePrint?.BP3DData.model.floorplan.update()
    } else if (type == "framed" && frames[1]?.isActivated) {
      setframeType(1)
      blueprint3d[0]?.globals?.setGlobal("selectedMetalFrameType", frames[1]?.type)
      reducerBluePrint?.BP3DData.model.floorplan.update()
    }
    handleApply()
  }

  const handleFrameVariantChange = (type) => {

    blueprint3d[0]?.globals?.setGlobal("selectedColorVariant", type)
    setframeVariant(type)

    handleApply()
  }

  const handleApply = () => {
    const zoomScope = [1, 1.1, 1.21, 1.33, 1.46,]
    reducerBluePrint?.BP3DData.model.floorplan.update()
    reducerBluePrint?.BP3DData.three.controls.dollyIn(zoomScope[setdollyInCount])
    reducerBluePrint?.BP3DData.three.controls.update();
  }

  const getCssCoefficient = () => {
    if (clientWallWidth < 5500) {
      return 0.19
    } else if (clientWallWidth > 5500 && clientWallWidth < 8000) {
      return 0.13
    } else {
      return 0.12
    }
  }

  const calcPanelsWidth = () => {
    setPanelsWidth(newPanels.reduce((sum, item) => sum + item.value, 0))
  }

  useEffect(() => {
    calcPanelsWidth()
  }, []);

  useEffect(() => {
    dollyInZoom(reducerBluePrint?.BP3DData)
    blueprint3d[0]?.globals?.getCurrentPrice()
  }, [frameType])

  const open3D = () => {
    dispatch(updateConfigurationStates(!toggle3dView, 'toggle3dView'))
  }

  const nextStep = async () => {
    const canvas = await html2canvas(document.querySelector("#capture"));
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    dispatch(updateConfigurationStates(imgData, 'newImage'))
    dispatch(updateConfigurationStates(imgHeight, 'newImageHeight'))
    dispatch(updateConfigurationStates(imgWidth, 'newImageWidth'))
    handleChangeState(undefined, 7)
  }

  return (
    <div className='step4'>
      <div className='dimensions-data data'>
        <div class="label_container_For_customization custom_centered_aligned title-with-3d-img">
          <div className='title-with-3d-img__title-wrapper'>
            <h3>Frame Design</h3>
            <Tooltip placement="topRight"
                     title={<span style={{fontSize: '14px'}}>Please choose the frame style, and colour for your Pātishon.</span>}>
              <InfoCircleOutlined className="custom_icon"/>
            </Tooltip>
          </div>
          <button
              className='sucess_button img3d'
              onClick={() => open3D()}
          >
            <img src={ThemeImages.color3d} />
          </button>
        </div>

        <div className="position-relative step-6">
          <div
              id="capture"
              className='patishon-container-scroll position-relative'
              style={{
                width: panelsWidth * getCssCoefficient() + 10 + 'px',
                borderColor: frameVariant
              }}
          >
            {
                frameType === 1 && numbersOfBars === 1 &&
                <div className="frame single-frame">
                  <div
                      className="single-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>
                </div>
            }

            {
                frameType === 1 && numbersOfBars === 2 &&
                <div className="frame double-frame">
                  <div
                      className="double-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>
                  <div
                      className="double-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>
                </div>
            }

            {
                frameType === 1 && numbersOfBars === 3 &&
                <div className="frame triple-frame">
                  <div
                      className="triple-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>
                  <div
                      className="triple-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>

                  <div
                      className="triple-frame__line"
                      style={{backgroundColor: frameVariant}}
                  ></div>
                </div>
            }
            {newPanels.map((item, index) => (
                <div
                    className='sortable-item-1__item position-relative'
                    key={item.id}
                    style={item.name === 'Door' ? {
                      width: newDoor.doorSize * getCssCoefficient() + 'px',
                      borderWidth: 5,
                      zIndex: 100,
                      borderColor: frameVariant
                    } : {
                      width: item.value * getCssCoefficient() + 'px',
                      borderColor: frameVariant
                    }}
                >
                  {item.name === 'Door' && newDoor.doorType === 'single' && newDoor.handlePosition === 'right' &&
                      <div className='hinged-door handle-position-right'>
                        <div className='top-hinge'></div>
                        <div className='bottom-hinge'></div>
                      </div>
                  }

                  {item.name === 'Door' && newDoor.doorType === 'single' && newDoor.handlePosition === 'left' &&
                      <div className='hinged-door handle-position-left'>
                        <div className='top-hinge'></div>
                        <div className='bottom-hinge'></div>
                      </div>
                  }

                  {item.name === 'Door' && newDoor.doorType === 'single' && newDoor.handlePosition === 'right' &&
                      <div className='door-handle-position-left'></div>
                  }

                  {item.name === 'Door' && newDoor.doorType === 'single' && newDoor.handlePosition === 'left' &&
                      <div className='door-handle-position-right'></div>
                  }

                  {item.name === 'Door' && newDoor.doorType === 'double' &&
                      <div className='double-door'>
                        <div className="double-door__left-handle"></div>
                        <div className="double-door__divider"></div>
                        <div className="double-door__right-handle"></div>
                      </div>
                  }

                  {
                      item.name === 'Door' && newDoor.numbersOfBars === 1 &&
                      <div className="frame single-frame">
                        <div
                            className="single-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>
                      </div>
                  }

                  {
                      item.name === 'Door' && newDoor.numbersOfBars === 2 &&
                      <div className="frame double-frame">
                        <div
                            className="double-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>
                        <div
                            className="double-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>
                      </div>
                  }

                  {
                      item.name === 'Door' && newDoor.numbersOfBars === 3 &&
                      <div className="frame triple-frame">
                        <div
                            className="triple-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>
                        <div
                            className="triple-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>

                        <div
                            className="triple-frame__line"
                            style={{backgroundColor: frameVariant}}
                        ></div>
                      </div>
                  }
                </div>
            ))}
        </div>
      </div>

      </div>
      <div className="panelsizes space-line">
        <div
            className={`${frameType === 1 ? 'wrapper_frames' : 'wrapper_frames active'} ${!frames[0]?.isActivated && "block"}`}>
          <img
              src={ThemeImages.frame}
              onClick={() => handleFrameTypeChange("single")}/>
          <p>Frameless</p>
        </div>
        <div
            className={`${frameType === 0 ? 'wrapper_frames' : 'wrapper_frames active'} ${!frames[1]?.isActivated && "block"}`}>
          <img
              src={ThemeImages.frames2}
              onClick={() => handleFrameTypeChange("framed")}/>
          <p>Framed</p>
        </div>
      </div>
      {frameType === 1 && <div className="toggle_slider">
        <div className='first-silder'>
          <h3>Number of Horizontal Bars</h3>
          {console.log("this is value incoming = ", numbersOfBars)}
          <Slider
              className="slider slider_step4"
              defaultValue={6}
              tipFormatter={formatter}
              onChange={handleOnChange}
              min={1}
              max={(Math.ceil(roomHeight / 500) - 1)}
              value={typeof numbersOfBars === "number" ? numbersOfBars : 0}
          />
          <div className='data_line_one'>
            <label>1</label>
            <label>{(Math.ceil(roomHeight / 500) - 1)}</label>
          </div>
        </div>
        <p className="maximum"> Maximum 1 horizontal bar is allowed per 500 mm and minimum 1 full length.</p>
      </div>}

      <h5 className="color_news color_data space-tree">Select Color</h5>
      <div className="small_frames_data">
        {framesVariants.length > 0 && framesVariants.map((item, index) => {
          return (
              <div className={`first_data ${!framesVariants[0].isActivated && 'first_data_disabled'}`}>
                <div
                    className={`frames-strips ${frameVariant == item.type && "active"}`}
                    style={{backgroundColor: `${item.type}` }}
                onClick={() => handleFrameVariantChange(item.type)}
              ></div>
              <p></p>
            </div>
          )
        })}
      </div>

      {/* <p className="previous">Previous Price=£50 + Frame Price =£100</p> */}
      {/* <div className='button step3button'>
        {filmsVariants.length > 0 ? (
           <button type='submit' onClick={() => {
            handleChangeState(undefined, 7)
          }} className='sucess_button'>Next</button>
        ) :
           (
             <>
              <h3 className="panel_price mt-45">Looking great! Preview your finished Pātishon, then you can checkout.</h3>
              <button
                type='submit'
                onClick={() => {
                  handleChangeState(undefined, 8)
                }}
                className='sucess_button'
              >
                Preview
              </button>
            </>
          )
        }
       

      </div> */}
      <div className="floating_next_btn">
      {filmsVariants.length > 0 ? (
           <button type='submit'  onClick={() => nextStep()} className='sucess_button'>Next</button>
        ) :
           (
             <>
              <h3 className="panel_price mt-45">Looking great! Preview your finished Pātishon, then you can checkout.</h3>
              <button
                type='submit'
                onClick={() => nextStep()}
                className='sucess_button'
              >
                Next
              </button>
            </>
          )
        }
      </div>
      {/* <h3 className="panel_price mt-45">Previous Price = {frameType ? 190 : 156.2} x height in metres x length in metres</h3>
      <div className="floating-text">
        <p>total<br></br> price</p>
        <h3>£{totalPrice}</h3>
      </div> */}

    </div>
  )
}
export default Step6
