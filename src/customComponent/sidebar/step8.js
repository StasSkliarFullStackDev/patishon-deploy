import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-nextjs-toast";
import ThemeImages from "../../themes/appImage";
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { placeOrderInitiate } from "../../redux/actions/configuration";
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { BP3D } from "../../common/blueprint3d";
import { dollyInZoom, isObjEmpty } from "../../common/utils";
import { getMemoizedProductsData } from "../../redux/selectors/product";
import { addToCartInitiate } from "../../redux/actions/cart";
import { getMemoizedCartData } from "../../redux/selectors/cart";

const Step8 = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const naviagteToHome = () => {
    localStorage.removeItem("selectedType");
    localStorage.removeItem("partitionType");
    navigate("/");
    window.history.pushState({}, "", "/landing");
  };

  const {
    handleChangeState,
    blueprint3d,
    // setCurrentStateOfSideMenu,
  } = props;

  const configuratorData = useSelector(getMemoizedConfigurationData);
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData);
  const productData = useSelector(getMemoizedProductsData);
  const reducerCart = useSelector(getMemoizedCartData);

  const { productList } = productData;
  const {
    roomHeight,
    partitionWallLength,
    totalPrice,
    roomLength,
    roomBreath,
    glassCovering,
    numberOfhorizontalFrames,
    newDoor,
    newPanels
  } = configuratorData;
  const {
    // selectedDoorSize,
    numberOfPanels,
    numberOfPanelsRight,
    selectedPanelSize,
    selectedPanelSizeRight,
    BP3DData,
    perCmEqualToMm,
  } = reducerBluePrint;
  const { cartItemsCount } = reducerCart;

  const doorConfigurationObj = blueprint3d[0]?.globals?.getGlobal(
    "selectedDoorConfiguration"
  );
  const horizontalBars = blueprint3d[0]?.globals?.getGlobal(
    "selectedHorizontalFrames"
  );
  const selectedMetalFrameType = blueprint3d[0]?.globals?.getGlobal(
    "selectedMetalFrameType"
  );
  let filmsVariants = blueprint3d[0]?.globals?.getGlobal("films");

  const handleSubmit = async (actionType = "placeOrder") => {
    let data = [];
    const partitionType = localStorage.getItem("partitionType");
    const allData = Object.assign({});

    const productName =
      partitionType == "fixed"
        ? "Fixed to two wall"
        : partitionType == "floating"
          ? "Floating"
          : "Fixed to one wall";

    allData["glassCovering"] = glassCovering;
    allData["newDoor"] = newDoor;
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
          doorConfigurationObj?.doorGlass == 0
            ? "single metal glazing"
            : "framed single metal glazing",
        horizontalBars:
          doorConfigurationObj?.doorGlass == 1
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
        size: numberOfPanels == 0 ? 0 : selectedPanelSize,
        count: numberOfPanels,
        horizontalBars:
          selectedMetalFrameType === "Single metal glazing"
            ? 0
            : horizontalBars,
      },
      right: {
        size: numberOfPanelsRight == 0 ? 0 : selectedPanelSizeRight,
        count: numberOfPanelsRight,
        horizontalBars:
          selectedMetalFrameType === "Single metal glazing"
            ? 0
            : horizontalBars,
      },
    };
    allData["roomSize"] = {
      length: Math.floor(roomLength * perCmEqualToMm),
      width: Math.floor(roomBreath * perCmEqualToMm),
    };
    allData["product"] = {
      name: productName,
      // image: productList?.filter(e => e.productName === productName)[0].productImage
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
    if (actionType == "cart") {
      handleCheck().then((e) => {
        allData["base64"] = e;
        dispatch(addToCartInitiate(allData));
      });
    } else {
      handleCheck().then((e) => {
        allData["base64"] = e;
        dispatch(placeOrderInitiate({ data }));
      });
    }
    // DataManager.setOrderDetail(allData)
  };
  useEffect(() => {
    dollyInZoom(BP3DData);
  }, []);

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

  const downloadBase64File = (base64Data, fileName) => {
    const linkSource = base64Data;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const handleCheck = async () => {
    let canvas = document.getElementsByTagName("canvas");

    // // set the width and height of the cropped area
    // const width = 1300;
    // const height = 800;

    // // calculate the x and y coordinates of the top-left corner of the cropped area
    // const x = (canvas[0].width - width) / 2;
    // const y = (canvas[0].height - height) / 2;

    // // create a new canvas element with the desired aspect ratio
    // const croppedCanvas = document.createElement('canvas');
    // croppedCanvas.width = width;
    // croppedCanvas.height = height / (canvas[0].width / width);

    // // draw the cropped image onto the new canvas element
    // const ctx = croppedCanvas.getContext('2d');
    // ctx.drawImage(canvas[0], x, y, width, height, 0, 0, width, height / (canvas[0].width / width));

    // create a new image element with the cropped canvas data





    let response = new Promise((resolve, rejcet) => {
      canvas[0].toBlob((e) => {
        console.log("this is blob = ", e)
        convertBlobToBase64(e)
          .then((res) => {
            console.log("this is base64 = ", res)
            resolve(res);
          })
          .catch((err) => {
            rejcet(err);
          });
      }, 'image/png', 0.9);
    });

    return response;
  };

  return (
    <div className="step4">
      <div className="steps_news_point varients dimensions-data">
        <h3>Place Order</h3>
        {/* <div className="top-image-bg">
          <img id="design_2d_tab" src={ThemeImages.colorblue} alt="2d" onClick={() => dispatch(updateEngineStatesAction('2D', 'selectedType'))} />
          <img id="" src={ThemeImages.colorgray} alt="3d" onClick={() => {
            $("#update-floorplan").trigger('click')
          }} />
        </div> */}
        {
          <div className="chart center">
            <div
              className="cart"
              onClick={() => {
                if (cartItemsCount < 5) {
                  handleSubmit("cart");
                  // naviagteToHome()
                } else {
                  toast.notify("Please remove one item from cart.", {
                    duration: 5,
                    type: "error",
                  });
                }
                // navigate('/payment')
              }}>
              <img src={ThemeImages.cart} alt="cart" />
            </div>
            <p>Add to cart</p>
          </div>
        }
        <div className="button-type">
          <div className="button">
            <button
              type="submit"
              onClick={() => {
                navigate('/payment')
                handleSubmit();
                // handleCheck();
              }}
              className={`sucess_button`}>
              Place Order
            </button>
          </div>
          <div className="button">
            <button
              type="submit"
              onClick={() => {
                if (filmsVariants.length > 0) {
                  handleChangeState(undefined, 7);
                } else {
                  handleChangeState(undefined, 6);
                }
              }}
              className={`sucess_button`}>
              Back
            </button>
          </div>
        </div>
      </div>
      <div className="floating-text">
        <p>
          total<br></br> price
        </p>
        <h3>£{totalPrice}</h3>
      </div>
    </div>
  );
};

export default Step8;
