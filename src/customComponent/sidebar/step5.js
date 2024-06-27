import React, { useEffect, useLayoutEffect, useState } from "react"
import { Select, Tooltip } from 'antd';
import { useDispatch, useSelector } from "react-redux";
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d";
import { updateConfigurationStates } from "../../redux/actions/configuration";
import { setdollyInCount } from "../../hoc/mainLayout";
import { dollyInZoom, isInternetConnected, isObjEmpty } from "../../common/utils";
import { BP3D } from "../../common/blueprint3d";
import { InfoCircleOutlined } from "@ant-design/icons";
import "./step5.css";

const Step5 = (props) => {
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const dispatch = useDispatch()

  const {
    perCmEqualToMm,
    numberOfPanels,
    numberOfPanelsRight,
    BP3DData,
    selectedPanelSize,
    selectedPanelSizeRight
  } = reducerBluePrint

  const {
    partitionWallLength,
    panelPricePerMm,
    perPanelPrice,
    partitionRightWallLength,
    partitionLeftWallLength,
    totalPrice
  } = configuratorData

  const {
    handleChangeState,
    blueprint3d,
    step
  } = props

  const [panels, setPanels] = useState(Math.ceil(parseInt(partitionLeftWallLength * perCmEqualToMm) / 600))
  const [panelsRight, setPanelsRight] = useState(Math.ceil(parseInt(partitionRightWallLength * perCmEqualToMm) / 600))
  const [optionValues, setOptionsValues] = useState([])
  const [optionValuesRight, setOptionsValuesRight] = useState([])
  const [pricePerPanel, setPricePerPanel] = useState(0)
  const [pricePerPanelRight, setPricePerPanelRight] = useState(0)

  let optionsValues = []
  let optionsValuesRight = []

  useEffect(() => {
    dispatch(updateEngineStatesAction(perPanelSize(panels, BP3D.Core.Dimensioning.cmToMeasure(partitionLeftWallLength)), "selectedPanelSize"))
    dispatch(updateEngineStatesAction(perPanelSize(panelsRight, BP3D.Core.Dimensioning.cmToMeasure(partitionRightWallLength)), "selectedPanelSizeRight"))
    if ((isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")))) {
      setPricePerPanel(calulatePerPanelPrice(perPanelSize(panels, BP3D.Core.Dimensioning.cmToMeasure(partitionLeftWallLength))))
    } else {
      setPricePerPanel(calulatePerPanelPrice(perPanelSize(panels, BP3D.Core.Dimensioning.cmToMeasure(partitionLeftWallLength))))
      setPricePerPanelRight(calulatePerPanelPrice(perPanelSize(panelsRight, BP3D.Core.Dimensioning.cmToMeasure(partitionRightWallLength))))
    }

    for (let i = Math.ceil(parseInt(partitionLeftWallLength * perCmEqualToMm) / 600); i < Math.ceil(parseInt(partitionLeftWallLength * perCmEqualToMm) / 300); i++) {
      optionsValues.push({ value: i, lable: i })
      setOptionsValues(optionsValues)
    }
    for (let i = Math.ceil(parseInt(partitionRightWallLength * perCmEqualToMm) / 600); i < Math.ceil(parseInt(partitionRightWallLength * perCmEqualToMm) / 300); i++) {
      optionsValuesRight.push({ value: i, lable: i })
      setOptionsValuesRight(optionsValuesRight)
    }

    handleApply()
    dollyInZoom(reducerBluePrint?.BP3DData)
    dispatch(updateConfigurationStates(false, 'skipThirdStep'))
  }, [step])

  const calulatePerPanelPrice = (panelSize) => {
    let res = 0
    if (panelSize) {
      return res = Number.isInteger(panelSize * perPanelPrice) ? panelSize * perPanelPrice : (panelSize * perPanelPrice).toFixed(2)
    } else {
      return res
    }
  }

  const perPanelSize = (panels, wallLength) => {
    let res = +wallLength / panels.toFixed(2)
    res = +res.toFixed(2)
    return res
  }

  const handePanelSizeChange = (value, type) => {
    if (type == "left") {
      setPanels(value)
      dispatch(updateEngineStatesAction(perPanelSize(value, BP3D.Core.Dimensioning.cmToMeasure(partitionLeftWallLength)), "selectedPanelSize"))
    } else {
      setPanelsRight(value)
      dispatch(updateEngineStatesAction(perPanelSize(value, BP3D.Core.Dimensioning.cmToMeasure(partitionRightWallLength)), "selectedPanelSizeRight"))
    }
  }

  useEffect(() => {
    handleApply()
    if ((isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")))) {
      setPricePerPanel(calulatePerPanelPrice(selectedPanelSize))
    } else {
      setPricePerPanel(calulatePerPanelPrice(selectedPanelSize))
      setPricePerPanelRight(calulatePerPanelPrice(selectedPanelSizeRight))
    }
  }, [panels, panelsRight])

  useEffect(() => {
    blueprint3d[0]?.globals?.getCurrentPrice()
  }, [numberOfPanelsRight, numberOfPanels])

  const handleApply = () => {
    const zoomScope = [1, 1.1, 1.21, 1.33, 1.46,]
    if (isInternetConnected()) {
      dispatch(updateEngineStatesAction(panels, "numberOfPanels"))
      dispatch(updateEngineStatesAction(panelsRight, "numberOfPanelsRight"))
      blueprint3d[0]?.globals?.setGlobal("numberOfPanels", panels)
      blueprint3d[0]?.globals?.setGlobal("numberOfPanelsRight", panelsRight)
      reducerBluePrint?.BP3DData.model.floorplan.update()
      BP3DData.three.controls.dollyIn(zoomScope[setdollyInCount])
      BP3DData.three.controls.update();
    }
  }

  const text = (val) => <span style={{ fontSize: '14px'}}>{val}</span>;

  const addPanelToSchema = (sizeOfPanel) => {

  }

  return (
      <div className='step4 step4WithPrice'>
        <div className='dimensions-data'>
          <div class="label_container_For_customization custom_centered_aligned">
            <h3>Panels</h3>
          </div>
        </div>
        <div className="first-silder">
          {/*<h3>Number of panels</h3>*/}
          {/*<Select*/}
          {/*    style={{*/}
          {/*      width: "100%",*/}
          {/*      height: "100%"*/}
          {/*    }}*/}
          {/*    defaultActiveFirstOption*/}
          {/*    showArrow={true}*/}
          {/*    value={panels}*/}
          {/*    placeholder="Enter number of panels"*/}
          {/*    onChange={(e) => handePanelSizeChange(e, 'left')}*/}
          {/*    options={optionValues}*/}
          {/*/>*/}
          {/*<h4>{`Size per panel: ${selectedPanelSize} mm`}</h4>*/}
          <ul className='panels-list'>
            <li className='panels-list__item'>
              <span className='panels-list__label'>150 mm Panel</span>
              <button className="panels-list__btn" onClick={() => addPanelToSchema(150)}>Add panel to schema</button>
            </li>
            <li className='panels-list__item'>
              <span className='panels-list__label'>350 mm Panel</span>
              <button className="panels-list__btn" onClick={() => addPanelToSchema(350)}>Add panel to schema</button>
            </li>
            <li className='panels-list__item'>
              <span className='panels-list__label'>550 mm Panel</span>
              <button className="panels-list__btn" onClick={() => addPanelToSchema(550)}>Add panel to schema</button>
            </li>
            <li className='panels-list__item'>
              <span className='panels-list__label'>750 mm Panel</span>
              <button className="panels-list__btn" onClick={() => addPanelToSchema(750)}>Add panel to schema</button>
            </li>
          </ul>
        </div>
        <h3 className={`panel_price mt-45 target panel_news ${(!isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) && 'both_show'}`}>
          {`${!isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")) ? 'Price per left panel = £' : 'Price per panel = £'} ${pricePerPanel}`}
        </h3>
        {(!isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")))
            &&  <h3 className="panel_price mt-45 target panel_news less_margin">{`Price per right panel = £ ${pricePerPanelRight}`}</h3>}

        <div className="floating-text special_case" style={{ display: 'block'}}>
          <div className="" style={{ textAlign: 'center', background: '#212832', padding: '10px'}}>
            <button type='submit' onClick={() => {
              handleChangeState(undefined, 6)
            }} className='sucess_button'>Next</button>
          </div>
          <div className="new_floating" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
            <p>total<br></br> price</p>
            <h3>{`£${totalPrice}`}</h3>
          </div>
        </div>
      </div>
  )
}

export default Step5