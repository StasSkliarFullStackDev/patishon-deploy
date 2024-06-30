import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Slider, Tabs } from 'antd';
import { Radio } from 'antd';

import ThemeImages from "../../themes/appImage";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { dollyInZoom, firstLetterUpperCase, isInternetConnected, isObjEmpty } from "../../common/utils"
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { BP3D } from "../../common/blueprint3d";
import { toast } from "react-nextjs-toast";
import { updateConfigurationStates } from "../../redux/actions/configuration";

const { TabPane } = Tabs;

const Step3 = (props) => {
  const dispatch = useDispatch()
  let glassPrice = 0

  const {
    handleChangeState,
    blueprint3d,
    prevStep
  } = props

  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const configurationData = useSelector(getMemoizedConfigurationData)
  const {
    doorChannelTabSelected,
    selectedDoorSize,
    BP3DData,
    perCmEqualToMm,
  } = reducerBluePrint
  const {
    doorChannels,
    doorHinges,
    partitionWallLength,
    doorHandles,
    partitionLeftWallLength,
    partitionRightWallLength,
    hingeLoader,
    step3HandleApply,
    roomHeight,
    totalPrice,
    panelPricePerMm,
    skipThirdStep
  } = configurationData

  let reducerData = blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")
  const [doorGlass, setDoorGlass] = React.useState(reducerData.doorGlass ? reducerData.doorGlass : 0)
  const [frameType, setframeType] = React.useState({ category: reducerData.hinges?.category || "push", direction: reducerData.hinges?.direction || "right" })
  const [errorMsg, setErrorMsg] = React.useState(false)
  const [loaderHinge, setLoaderHinge] = React.useState(false)
  const [numbersOfBars, setNumbersOfBars] = React.useState(reducerData.horizontalBarForDoor || 1)

  const formatter = (value) => `${value}`;

  let selectedCategoryHinges = doorHinges.find((eachCategory) => eachCategory.category == frameType.category)

  const handleOnChange = (value) => {
    setNumbersOfBars(value)
  }
  const handleChangeCategory = (e) => {
    setframeType(data => ({ ...data, category: e.target.value }))
  }
  const handleChangedoorChannelTab = (e) => {
    dispatch(updateEngineStatesAction(e.target.value, "doorChannelTabSelected"))
    setErrorMsg(false)
    if (e.target.value == "1") {
      dispatch(updateEngineStatesAction(768, "selectedDoorSize"))
    } else {
      dispatch(updateEngineStatesAction(1488, "selectedDoorSize"))
    }
      
  }
  const handleChangeDirection = (e) => {
    setframeType(data => ({ ...data, direction: e.target.value }))
    //blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration",{hinges:frameType,doorGlass:doorGlass,selectedDoorSize:selectedDoorSize, doorType: (doorChannelTabSelected == 1 ? "single" : "double")})

  }
  const handeDoorType = (eachDoorSize) => {
    if (eachDoorSize.isActivated) {
      setErrorMsg(false)
      dispatch(updateEngineStatesAction(eachDoorSize.size, "selectedDoorSize"))
    }
  }

  useEffect(() => {

    setTimeout(() => {
      // console.log("this is hinge loader = ", hingeLoader, doorChannelTabSelected, selectedDoorSize)
      if (hingeLoader) {
        dispatch(updateConfigurationStates(true, 'step3HandleApply'))
      } else {
        if (doorChannelTabSelected == 1 && (selectedDoorSize == 768)) {
          handleApply()
        } else if (doorChannelTabSelected == 2 && (selectedDoorSize == 1488)) {
          handleApply()
        } else {
          executeScroll()
        }
      }
    }, 0)

  }, [selectedDoorSize, frameType, numbersOfBars, doorGlass])
  const onSkip = () => {
    if (isInternetConnected) {
      blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {})
      blueprint3d[0]?.globals?.setGlobal("activePanelIndex", -1)
      let leftLength = partitionLeftWallLength
      if (!blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")?.selectedDoorSize) {
        leftLength = blueprint3d[0]?.floorplanner?.floorplan?.walls[4].getLength()
      }
      dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
      dispatch(updateEngineStatesAction(0, 'numberOfPanelsRight'))
      blueprint3d[0]?.globals?.getCurrentPrice()
      handleChangeState(undefined, 5)
    }
  }
  const handleApply = () => {
    // dispatch(updateConfigurationStates(false, 'step3HandleApply'))
    if (isInternetConnected) {
      if ((BP3D.Core.Dimensioning.cmToMeasure(partitionWallLength) - BP3D.Core.Dimensioning.cmToMeasure(11.453*2)) < selectedDoorSize) {
        toast.notify("Please select the wall length according to door size.", {
          duration: 5,
          type: "error",
        })
      } else {
        let defaultHandleIndex = 0
        doorHandles.map((e, i) => {
          if (e.isDefault) {
            defaultHandleIndex = i
          }
        })

        // console.log("this is hinge loader = ", frameType, "doorGlass = ", doorGlass, "selectedDoorSize = ", selectedDoorSize, "defaultHandleIndex = ", defaultHandleIndex, "numbersOfBars = ", numbersOfBars)
        console.log("DATATATAT", blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start, blueprint3d[0]?.floorplanner?.floorplan?.walls[4].end)
        blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", { hinges: frameType, doorGlass: doorGlass, selectedDoorSize: selectedDoorSize, doorType: (doorChannelTabSelected == 1 ? "single" : "double"), selectedHandle: defaultHandleIndex, horizontalBarForDoor: numbersOfBars })
        reducerBluePrint?.BP3DData.model.floorplan.update()
        blueprint3d[0]?.globals?.getCurrentPrice()
        //document.getElementsByClassName("disable_icon")[0]?.classList.remove("disable_icon")
      }
      dollyInZoom(BP3DData)
    }
  }
  const handleMetalGlazing = (key) => {
    setDoorGlass(key)
    //blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration",{hinges:frameType,doorGlass:key,selectedDoorSize:selectedDoorSize, doorType: (doorChannelTabSelected == 1 ? "single" : "double")})

  }

  useEffect(() => {
    if (prevStep < 3) {
      dispatch(updateEngineStatesAction(true, "infoPopUp"))
    }
  }, [])

  useEffect(() => {
    if (prevStep > 3 && !isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) {
      let defaultHandleIndex = 0
      doorHandles.map((e, i) => {
        if (e.isDefault) {
          defaultHandleIndex = i
        }
      })
      blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {
        ...blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"),
        selectedHandle: defaultHandleIndex
      })
    }
    for (let i = 0; i < doorHinges.length; i++) {
      if (doorHinges[i].category == "push" && !doorHinges[i].isEnabled) {
        setframeType(state => ({ ...state, category: "pull" }))
      }
    }
    dollyInZoom(BP3DData)
    // blueprint3d[0]?.globals?.setGlobal("selectedHandle",0)
  }, [])

  const getPrice = (eachDoorSize) => {
    if (eachDoorSize.size == selectedDoorSize) {
      glassPrice = eachDoorSize.price
    }
  }

  useEffect(() => {
    selectedCategoryHinges = doorHinges.find((eachCategory) => eachCategory.category == frameType.category)
    for (let e of selectedCategoryHinges.doorHinges) {
      if (e.type == "left" && e.isActivated) {
        setframeType(state => ({ ...state, direction: reducerData.hinges?.direction || "left" }))
        break
      } else if (e.type == "right" && e.isActivated) {
        setframeType(state => ({ ...state, direction: reducerData.hinges?.direction || "right" }))
        break
      }
    }
    blueprint3d[0]?.globals?.getCurrentPrice()

  }, [frameType.category])

  useEffect(() => {
    if (step3HandleApply && !hingeLoader) {
      handleApply()
    }
  }, [step3HandleApply, hingeLoader])

  const executeScroll = () => {
    setErrorMsg(true)
    const element = document.getElementById("sizes_" + doorChannelTabSelected);
    element.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  useEffect(() => {
    if (skipThirdStep) {
      onSkip()
    }
  }, [skipThirdStep])

  return (
      <div className='step4 custom_height'>
        <div className='dimensions-data'>
          <h3>Doors</h3>
        </div>
        <div>
          <h4 className="single door_p door_point">Door Type</h4>
          <div className="good">
            <Radio.Group onChange={handleChangedoorChannelTab} value={doorChannelTabSelected}>
              <div className="radio_line">
                <div className='custom_width'>Hinged</div>
                <div className='btn_radio'><Radio defaultChecked value={'1'}/></div>
              </div>
              <div className="radio_line">
                <div className='custom_width'>Sliding</div>
                <div className='btn_radio'><Radio value={'2'}/></div>
              </div>
            </Radio.Group>
          </div>
        </div>
        {doorChannelTabSelected == 1 ?
            <>
              <div className="category-details bg_home">
                <h3>Door Direction</h3>
                <div className="good">
                  <Radio.Group onChange={handleChangeCategory} value={frameType.category}>
                    <div className="radio_line">
                      <div className='custom_width'>Push</div>
                      <div className='btn_radio'><Radio defaultChecked disabled={!doorHinges[0]?.isEnabled}
                                                        value="push"/>
                      </div>
                    </div>
                    <div className="radio_line">
                      <div className='custom_width'>Pull</div>
                      <div className='btn_radio'><Radio disabled={!doorHinges[1]?.isEnabled} value="pull"/></div>
                    </div>
                  </Radio.Group>
                </div>
                {doorChannelTabSelected == 1 ?
                    <>
                      <h3>Hinged on the</h3>
                      <div className="good">
                        <Radio.Group onChange={handleChangeDirection} value={frameType.direction}>
                          {selectedCategoryHinges.doorHinges?.map((obj, index) => {
                            return (<div className="radio_line">
                              <div className='custom_width'>{firstLetterUpperCase(obj.type)}</div>
                              <div className='btn_radio'><Radio disabled={!obj.isActivated} value={obj.type}/></div>
                            </div>);
                          })}
                        </Radio.Group>
                      </div>
                    </> :
                    null}
              </div>
            </> : null
        }
        <h4 className="single door_p door_point">Door Style</h4>
        <div className="panelsizes sizes space-line door_point ">
          <div className={doorGlass === 1 ? 'wrapper_frames' : 'wrapper_frames active'}>
            <div className="first_div" onClick={() => {
              handleMetalGlazing(0)
            }}></div>
            <p>Frameless</p>
          </div>
          <div className={doorGlass === 0 ? 'wrapper_frames' : 'wrapper_frames active'}>
            <img src={ThemeImages.frames2} className='jack_imgd' onClick={() => {
              handleMetalGlazing(1)
            }}/>
            <p>Framed</p>
          </div>
        </div>
        <h4 className="single size mb-10px">{`Sizes Of ${doorChannelTabSelected == 1 ? "Single" : "Double"} Door`}</h4>
        <Radio.Group>
          {doorChannels.map((item, index) => {
            return <div className="doors-size-radio-list" key={index}>
              {item.doorSize?.map((eachDoorSize, indexOfDoorSize) => {
                getPrice(eachDoorSize)
                return (
                    <div key={indexOfDoorSize} className='radio_line'>
                      <div className="radio-item">
                        <span className='radio-item__label'>{eachDoorSize.size} mm</span>
                      </div>
                      <div className='btn_radio'><Radio defaultChecked value={eachDoorSize.size}/></div>
                    </div>
                )
              })}
            </div>
          })}
        </Radio.Group>
        {doorGlass === 1 && <div className="toggle_slider">
          <div className='first-silder'>
            <h3>Number of Horizontal Bars</h3>
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
        {/* <div className='button top_new'>
        <button type='submit'
          onClick={() => {
            if (hingeLoader) {
              dispatch(updateConfigurationStates(true, 'step3HandleApply'))
            } else {
              if (doorChannelTabSelected == 1) {
                handleApply()
              } else if (doorChannelTabSelected == 2) {
                handleApply()
              } else {
                executeScroll()
              }
            }
          }}
          className='update-floorplan sucess_button'>Apply</button>
      </div> */}
        <div className='button top_new'>
          <button type='submit'
                  onClick={() => {
                    handleApply()
                    let paritionWall = blueprint3d[0].floorplanner.floorplan.walls[4]
                    let doorStart = {
                      x: ((paritionWall.start.x + paritionWall.end.x) / 2) - (((blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")?.selectedDoorSize || 0) / perCmEqualToMm) / 2),
                      y: paritionWall.start.y
                    }
                    blueprint3d[0]?.globals?.setGlobal("doorStartVector", doorStart)
                    handleApply()
                  }}
                  className='update-floorplan sucess_button'>Center
          </button>
        </div>
        {/* <div className="target-data-button-i">
        <div className='button'>
          <button type='submit' onClick={onSkip} className='sucess_button'>Skip</button>
        </div>
        <div className='button'>
          <button type='submit' onClick={() => {
            if (isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) {
              blueprint3d[0]?.globals?.setGlobal("activePanelIndex", -1)
              let leftLength = blueprint3d[0]?.floorplanner?.floorplan?.walls[4].getLength()
              dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
              dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
              blueprint3d[0]?.globals?.getCurrentPrice()
              handleChangeState(undefined, 5)
            } else {
              let leftLength = partitionLeftWallLength
              dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
              dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
              handleChangeState(undefined, 4)
            }
          }} className='sucess_button'>Next</button>

        </div>
      </div> */}
        {/* <p className="previous">Previous Price = £{(Math.floor(partitionWallLength * perCmEqualToMm) * panelPricePerMm)} + Door(channel and glass)Price £{glassPrice}</p>
      <div className="floating-text">
        <p>total<br></br> price</p>
        <h3>{`£${totalPrice}`}</h3> */}
        {/* </div> */}
        <div className="floating_next_btn target-data-button-i">
          <div className='button'>
            <button type='submit' onClick={onSkip} className='sucess_button'>Skip</button>
          </div>
          <div className='button'>
            <button type='submit' onClick={() => {
              if (isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) {
                blueprint3d[0]?.globals?.setGlobal("activePanelIndex", -1)
                let leftLength = partitionLeftWallLength
                dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
                dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
                blueprint3d[0]?.globals?.getCurrentPrice()
                handleChangeState(undefined, 5)
              } else {
                let leftLength = partitionLeftWallLength
                dispatch(updateEngineStatesAction(Math.ceil(parseInt(leftLength * perCmEqualToMm) / 600), 'numberOfPanels'))
                dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
                handleChangeState(undefined, 4)
              }
            }} className='sucess_button'>Next
            </button>

          </div>
        </div>
      </div>
  )
}
export default Step3