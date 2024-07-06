import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import {getMemoizedBlueprint3dData} from "../../redux/selectors/blueprint3d";
import {updateEngineStatesAction} from "../../redux/actions/blueprint3d";
import {updateConfigurationStates} from "../../redux/actions/configuration";
import {setdollyInCount} from "../../hoc/mainLayout";
import {dollyInZoom, isInternetConnected, isObjEmpty} from "../../common/utils";
import {BP3D} from "../../common/blueprint3d";
import "./step5.css";
import {ReactSortable} from "react-sortablejs";

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

  const [maximumWidth, setMaximumWidth] = useState(5000)
  const [currentWidth, setCurrentWidth] = useState(0)

  const [items, setItems] = useState([
    { id: 1, name: '150 mm', value: 150 },
    { id: 2, name: '350 mm', value: 350 },
    { id: 3, name: '550 mm', value: 550 },
    { id: 4, name: '750 mm', value: 750 }
  ]);

  const [addedPanels, setAddedPanels] = useState([
    { id: 1, name: 'Door', value: 768 },
  ]);

  const cloneFunction = (item) => {
    return { ...item, id: new Date().getTime() };
  };

  const removeSortableItem = (id, setList) => {
    setList((prevList) => prevList.filter((item) => item.id !== id));
  };

  const calcCurrentWidth = () => {
    return addedPanels.reduce((total, item) => total + item.value, 0)
  }

  const onSetSortableList = (newState) => {
    const newPanel = newState.find(item => !addedPanels.some(panel => panel.id === item.id));

    const remainWidth = maximumWidth - currentWidth;
    if (newState.length > addedPanels.length && newPanel && newPanel.value > remainWidth) {
      alert("Cannot add panel, not enough space!");
    } else {
      setAddedPanels(newState);
    }
  }

  const onApplyChanges = () => {
    if (addedPanels[0].name === "Door" || addedPanels[addedPanels.length - 1].name === "Door") {
      alert("Door can not be on the start or on the end of Patishon")
    } else {
      alert("Feature in progress")
    }
  }

  useEffect(() => {
    setCurrentWidth(calcCurrentWidth())
  }, [addedPanels]);

  return (
      <div className='step4 step4WithPrice'>
        <div className='dimensions-data'>
          <div class="label_container_For_customization custom_centered_aligned">
            <h3>Panels</h3>
            <h3>(In progress)</h3>
          </div>
        </div>
        <div className="first-silder">
          <ReactSortable
              tag='div'
              className='sortable-item-1'
              list={items}
              setList={setItems}
              group={{name: 'shared', pull: 'clone', put: false}}
              sort={false}
          >
            {items.map((item, index) => (
                <div className={'sortable-item-1__item ' + ('panel--' + item.value + 'mm')}
                     key={item.id}>{item.name}</div>
            ))}
          </ReactSortable>

          <ReactSortable
              tag='div'
              className='patishon-container-scroll sortable-item-2'
              list={addedPanels}
              setList={(newState) => onSetSortableList(newState)}
              group={{name: 'shared', pull: 'clone', put: true}}
              clone={cloneFunction}
              animation={400}
              swap={true}
              delayOnTouchStart={true}
              delay={2}
          >
            {addedPanels.map((item, index) => (
                <div
                    className={'sortable-item-1__item ' + (item.value ? ('panel--' + item.value + 'mm') : '')}
                    key={item.id}
                >
                  <span>{item.name}</span>
                  {
                    item.name !== 'Door'
                        ? <div
                            onClick={() => removeSortableItem(item.id, setAddedPanels)}
                            className="remove-item-icon"
                        >
                          ×
                        </div>
                        : ''
                  }
                </div>
            ))}
          </ReactSortable>
        </div>

        <span className='width-label'>Room width: {maximumWidth}mm</span>
        <span className='width-label'>Patishon width: {currentWidth}mm</span>
        <span className='width-label'>Remain: {maximumWidth - currentWidth}mm</span>

        <div className="floating-text special_case" style={{display: 'block'}}>
          <div className="" style={{textAlign: 'center', background: '#212832', padding: '10px'}}>
            <button type='submit' onClick={() => {
              // handleChangeState(undefined, 6)
              onApplyChanges()
            }} className='sucess_button'>
              Apply changes
            </button>
          </div>
          <div className="new_floating"
               style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
            <p>total<br></br> price</p>
            <h3>{`£${totalPrice}`}</h3>
          </div>
        </div>
      </div>
  )
}

export default Step5