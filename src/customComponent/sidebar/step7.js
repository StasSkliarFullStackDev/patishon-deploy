import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {getMemoizedBlueprint3dData} from "../../redux/selectors/blueprint3d";
import {LOCAL_SERVER} from "../../constant";
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import {dollyInZoom, isObjEmpty} from "../../common/utils";
import {placeOrderInitiate, updateConfigurationStates} from "../../redux/actions/configuration";
import {BP3D} from "../../common/blueprint3d";
import {useNavigate} from "react-router";


let filmPrice = 0

const Step7 = (props) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const {
    placeOrderLoader,
    pdfUrl
  } = configuratorData

  const {
    step,
    blueprint3d,
  } = props

  const {
    roomHeight,
    partitionWallLength,
    totalPrice,
    roomLength,
    roomBreath,
    glassCovering,
    numberOfhorizontalFrames,
    newDoor,
    skipThirdStep,
    newPanels,
    newImage,
    newImageWidth,
    newImageHeight
  } = configuratorData;

  const {
    numberOfPanels,
    numberOfPanelsRight,
    selectedPanelSize,
    selectedPanelSizeRight,
    perCmEqualToMm,
  } = reducerBluePrint;

  const doorConfigurationObj = blueprint3d[0]?.globals?.getGlobal(
      "selectedDoorConfiguration"
  );
  const horizontalBars = blueprint3d[0]?.globals?.getGlobal(
      "selectedHorizontalFrames"
  );
  const selectedMetalFrameType = blueprint3d[0]?.globals?.getGlobal(
      "selectedMetalFrameType"
  );

  const [order, setOrder] = useState('')

  const navigateToHome = () => {
    localStorage.removeItem("selectedType")
    localStorage.removeItem("partitionType")
    navigate('/')
    window.history.pushState({}, '', "/landing");
  }

  const handleSubmit = async () => {
    let data = [];
    const partitionType = localStorage.getItem("partitionType");
    const allData = Object.assign({});

    dispatch(updateConfigurationStates([], 'newPanels'))

    const productName =
        partitionType === "fixed"
            ? "Fixed to two wall"
            : partitionType === "floating"
                ? "Floating"
                : "Fixed to one wall";

    allData["glassCovering"] = glassCovering;
    allData["newDoor"] = newDoor;
    allData["skipThirdStep"] = skipThirdStep;
    allData["newPanels"] = newPanels;
    allData["wallLength"] =
        +BP3D.Core.Dimensioning.cmToMeasure(partitionWallLength) ?? 0;
    allData["wallHeight"] = roomHeight;
    if (isObjEmpty(doorConfigurationObj)) {
      allData["door"] = null;
    } else {
      allData["door"] = {
        size: doorConfigurationObj?.selectedDoorSize,
        type: doorConfigurationObj?.doorType,
        doorChannel: doorConfigurationObj?.doorType,
        doorGlass:
            doorConfigurationObj?.doorGlass === 0
                ? "single metal glazing"
                : "framed single metal glazing",
        horizontalBars:
            doorConfigurationObj?.doorGlass === 1
                ? doorConfigurationObj?.horizontalBarForDoor
                : 0,
        doorCategory: doorConfigurationObj?.hinges.category,
        doorHinges: doorConfigurationObj?.hinges.direction,
        handleVarient:
        blueprint3d[0]?.globals?.getGlobal("doorHandles")[
            doorConfigurationObj.selectedHandle
            ].type,
        handleSize:
        blueprint3d[0]?.globals?.getGlobal("doorHandles")[
            doorConfigurationObj.selectedHandle
            ].size,
      };
    }
    allData["panels"] = {
      left: {
        size: numberOfPanels === 0 ? 0 : selectedPanelSize,
        count: numberOfPanels,
        horizontalBars:
            selectedMetalFrameType === "Single metal glazing"
                ? 0
                : horizontalBars,
      },
      right: {
        size: numberOfPanelsRight === 0 ? 0 : selectedPanelSizeRight,
        count: numberOfPanelsRight,
        horizontalBars:
            selectedMetalFrameType === "Single metal glazing"
                ? 0
                : horizontalBars,
      },
    };
    allData["newImage"] = newImage;
    allData["newImageWidth"] = newImageWidth;
    allData["newImageHeight"] = newImageHeight;
    allData["roomSize"] = {
      length: Math.floor(roomLength * perCmEqualToMm),
      width: Math.floor(roomBreath * perCmEqualToMm),
    };
    allData["product"] = {
      name: productName,
    };

    allData["name"] = productName ?? "";
    allData["partition"] = Math.floor(partitionWallLength);
    allData["frameColorCode"] = blueprint3d[0]?.globals?.getGlobal(
        "selectedColorVariant"
    );
    allData["frameType"] = blueprint3d[0]?.globals?.getGlobal(
        "selectedMetalFrameType"
    );
    allData["price"] = totalPrice;
    allData["numberOfHorizontalFrames"] = numberOfhorizontalFrames;
    data.push(allData);
    handleCheck().then((e) => {
      allData["base64"] = e;
      dispatch(placeOrderInitiate({ data }));
    });
  };

  const handleCheck = async () => {
    let canvas = document.getElementsByTagName("canvas");
    return new Promise((resolve, reject) => {
      canvas[0].toBlob((e) => {
        convertBlobToBase64(e)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
      }, 'image/png', 0.9);
    });
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onerror = reject;
      reader.onload = () => {
        let pureString = reader.result.split(',')[1]
        resolve(pureString);
      };
    });
  };

  useEffect(() => {
    dollyInZoom(reducerBluePrint?.BP3DData)
    handleSubmit()
  }, [])

  useEffect(() => {
    blueprint3d[0]?.globals?.getCurrentPrice()
    if (step < 7 || !(blueprint3d[0]?.globals?.getGlobal("selectedFilm"))) {
      filmPrice = 0
    }
  }, [blueprint3d[0]?.globals?.getGlobal("selectedFilm")])

  useEffect(() => {
    if (pdfUrl) {
      setOrder(pdfUrl[0])
    }
  }, [pdfUrl])

  return (
      <div className='step4'>
        <h3 className="panel_price congratulations-title mt-45">
          Congratulations! <br></br> Now you can download your
          Quote PDF
        </h3>
        <div className="target-data-button-i target-data-button-i--step-7 justify-center gap-2">
          {
              placeOrderLoader && <div className="small-loader-container">
                <span id="loader"></span>
                Creating a quote PDF...
              </div>
          }
          {
              !placeOrderLoader &&
              <a
                  href={LOCAL_SERVER + order}
                  target="_blank"
                  rel="noreferrer"
              >
                <div className='button'>
                  <button type='submit' className='sucess_button'>Download Quote PDF</button>
                </div>
              </a>
          }
          <div className='button'>
            <button type='submit' onClick={() => navigateToHome()} className='sucess_button'>Back to Home</button>
          </div>
        </div>
      </div>
  )
}
export default Step7
