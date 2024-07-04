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
import {ReactSortable, Sortable} from "react-sortablejs";

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

  const [items, setItems] = useState([
    { id: 1, name: '150 mm' },
    { id: 2, name: '350 mm' },
    { id: 3, name: '550 mm' },
    { id: 4, name: '750 mm' }
  ]);

  const [leftPanels, setLeftPanels] = useState([
  ]);

  const [doorSortableItem, setDoorSortableItem] = useState([
    { id: 6, name: 'Door' }
  ]);

  const [rightPanels, setRightPanels] = useState([
  ]);

  const cloneFunction = (item) => {
    return { ...item, id: new Date().getTime() }; // Обновляем id для клонированных элементов
  };

  const removeSortableItem = (id, setList) => {
    setList((prevList) => prevList.filter((item) => item.id !== id));
  };

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
              group={{ name: 'shared', pull: 'clone', put: false }}
              sort={false}
          >
            {items.map((item, index) => (
                <div className='sortable-item-1__item' key={item.id}>{item.name}</div>
            ))}
          </ReactSortable>

          <div className="patishon-container-scroll">
            <ReactSortable
                tag='div'
                className='sortable-item-2'
                list={leftPanels}
                setList={setLeftPanels}
                group={{name: 'shared', pull: 'clone', put: true}}
                clone={cloneFunction}
            >
              {leftPanels.map((item, index) => (
                  <div
                      className='sortable-item-2__item'
                      key={item.id}
                      onClick={() => removeSortableItem(item.id, setLeftPanels)}
                  >
                    {item.name}
                  </div>
              ))}
            </ReactSortable>
            <ReactSortable
                tag='div'
                className='sortable-door'
                list={doorSortableItem}
                setList={setDoorSortableItem}
                group={{name: 'shared', put: true}}
                clone={cloneFunction}
            >
              {doorSortableItem.map((item, index) => (
                  <div className='sortable-door__item' key={item.id}>{item.name}</div>
              ))}
            </ReactSortable>
            <ReactSortable
                tag='div'
                className='sortable-item-2'
                list={rightPanels}
                setList={setRightPanels}
                group={{name: 'shared', put: true}}
                clone={cloneFunction}
            >
              {rightPanels.map((item, index) => (
                  <div
                      className='sortable-item-2__item'
                      key={item.id}
                      onClick={() => removeSortableItem(item.id, setRightPanels)}
                  >
                    {item.name}
                  </div>
              ))}
            </ReactSortable>
          </div>
        </div>

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