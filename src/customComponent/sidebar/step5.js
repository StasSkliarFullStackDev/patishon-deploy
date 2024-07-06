import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import "./step5.css";
import {ReactSortable} from "react-sortablejs";

const Step5 = (props) => {
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const dispatch = useDispatch()

  const {
    clientWallWidth,
    skipThirdStep
  } = configuratorData

  const {
    handleChangeState,
  } = props


  const [maximumWidth, setMaximumWidth] = useState(clientWallWidth)
  const [currentWidth, setCurrentWidth] = useState(0)

  const [items, setItems] = useState([
    { id: 1, name: '150 mm', value: 150 },
    { id: 2, name: '350 mm', value: 350 },
    { id: 3, name: '550 mm', value: 550 },
    { id: 4, name: '750 mm', value: 750 }
  ]);

  const [addedPanels, setAddedPanels] = useState([]);

  useEffect(() => {
    if (!skipThirdStep) {
      setAddedPanels([{ id: 1, name: 'Door', value: 768 }])
    }
  }, [skipThirdStep]);

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
      handleChangeState(undefined, 6)
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
                <div
                    className={'sortable-item-1__item ' + ('panel--' + item.value + 'mm')}
                    key={item.id}
                >
                  {item.name}
                </div>
            ))}
          </ReactSortable>

          <div
              className="top-decor-line"
              style={{ width: clientWallWidth * 0.1125 + 10 + 'px' }}
          >
            <div className="top-decor-line__text">
              {clientWallWidth} mm
            </div>
          </div>

          <ReactSortable
              tag='div'
              className='patishon-container-scroll'
              list={addedPanels}
              setList={(newState) => onSetSortableList(newState)}
              group={{name: 'shared', pull: 'clone', put: true}}
              clone={cloneFunction}
              animation={400}
              swap={true}
              delayOnTouchStart={true}
              delay={2}
              style={{ width: clientWallWidth * 0.1125 + 10 + 'px' }}
          >
            {addedPanels.map((item, index) => (
                <div
                    className={'sortable-item-1__item ' + (item.value ? ('panel--' + item.value + 'mm') : '')}
                    key={item.id}
                >
                  <span>{item.name}</span>

                  {item.name !== 'Door'
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
        <span className='width-label'>Your Patishon width: {currentWidth}mm</span>
        <span className='width-label'>Remain: {maximumWidth - currentWidth}mm</span>

        <div className="floating-text special_case" style={{display: 'block'}}>
          <div className="button-container">
            <button type='submit' onClick={() => onApplyChanges()} className='sucess_button'>
              Apply changes
            </button>
          </div>
        </div>
      </div>
  )
}

export default Step5