import React from 'react';
import { useSelector, useDispatch } from "react-redux"
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse, Modal } from "antd";
import { getMemoizedCartData } from "../../redux/selectors/cart";
import ModalPop from "../../common/confirmModal";
import { deleteOrderMsg } from "../../constant"
import { deleteCartItemInitiate, updateCartStates } from "../../redux/actions/cart";
import { placeOrderInitiate } from "../../redux/actions/configuration";
import { firstLetterUpperCase, isInternetConnected } from "../../common/utils";
import { useState } from "react";

const CartModal = ({ Visible, onOk, onCancel }) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const reducerCart = useSelector(getMemoizedCartData)
  const { cartItems } = reducerCart

  const handleOk = (data) => {
    console.log("confirm = ", data);
    dispatch(deleteCartItemInitiate(data._id))
  }

  const [clickDelete, setClickDelete] = useState(true)

  // React.useEffect(() => {
  //   document.addEventListener("click", handleClickOutside, false);
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside, false);
  //   };
  // }, []);

  // const handleClickOutside = (event) => {
  //   console.log("this is click header = ", event.target)
  //   // let parentDomtooltip = document.getElementsByClassName("mainHeader")
  //   // let elementsToIgnore = [...parentDomtooltip.getElementsByTagName("*"), parentDomtooltip]
  //   // if (
  //   //   !elementsToIgnore.includes(event.target)
  //   // ) {
  //   //   tooltipRef.current.classList.remove("active");
  //   // }
  // };

  const items = (title, data, index) => (
    <Collapse
      // onChange={onChange}
      expandIconPosition={"start"}
      onChange={(e) => console.log("this is click = ", e)}
      className="mainHeader"
    >
      <Collapse.Panel
        header={title}
        key={data?._id}
        extra={
          <FontAwesomeIcon icon={faTrash}
            onClick={(event) => {
              event.stopPropagation()
              // setClickDelete(true)
              ModalPop("Delete", deleteOrderMsg, () => handleOk(data))
            }} 
          />
        }
      >
        <div className="collapse-user-detail-info-wrapper">
          <div className="collapse-user-detail-info-container">
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Room Size(Length*Breath): </span>
              <span className="collapse-user-detail-value-wrapper">{data?.roomSize?.length}*{data?.roomSize?.width}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Door: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.door ? firstLetterUpperCase(data?.door?.doorChannel) : "N/A"}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Door Glass: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.door ? firstLetterUpperCase(data?.door?.doorGlass) : "N/A"}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Left Panels Count/Size(mm): </span>
              <span className="collapse-user-detail-value-wrapper">{data?.panels?.left?.count}/{data?.panels?.left?.size}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Frame Type: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.frameType ? firstLetterUpperCase(data?.frameType) : "N/A"}</span>
            </div>
          </div>
          <div className="collapse-user-detail-info-container">
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Wall Length/Height: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.wallLength}/{data?.wallHeight}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Door Size: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.door ? data?.door?.size : "N/A"}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Door Category: </span>
              <span className="collapse-user-detail-value-wrapper">{data?.door ? firstLetterUpperCase(data?.door?.doorCategory) : "N/A"}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Right Panels Count/Size(mm): </span>
              <span className="collapse-user-detail-value-wrapper">{data?.panels?.right?.count}/{data?.panels?.right?.size}</span>
            </div>
            <div className="collapse-user-info-values-wrapper">
              <span className="collapse-user-detail-key-wrapper">Total Price: </span>
              <span className="collapse-user-detail-value-wrapper">{`£${data?.price}`}</span>
            </div>
          </div>
        </div>
      </Collapse.Panel>
    </Collapse>
  )

  return (
    <Modal
      className="cartModal"
      maskClosable={false}
      onCancel={onCancel}
      closable={true}
      visible={true}
      footer={false}
      bodyStyle={{ display: "contents" }}
      zIndex={99999}
    >
      <div className="modalContent-wrapper">
        <div className="content-e">
          <div>
            <div className="cart-lable">Cart</div>
          </div>
          <div className="cart-bg">
            {
              cartItems.length > 0 ? cartItems?.map((item, index) => {
                return (
                  items(`Order ${index + 1} (${item?.product?.name})`, item, index)
                )
              }) :
                <div className="emptyCart-wrap">
                  <div className="emptyCart">Your cart is empty!</div>
                </div>
            }
            {cartItems.length > 0 && <div style={{ margin: "25px" }}>
              <button
                className="build_on wall"
                onClick={() => {
                  if (isInternetConnected()) {
                    dispatch(placeOrderInitiate({ data: cartItems, fromCart: true }))
                    dispatch(updateCartStates(true, 'placeOrder'))
                    navigate('/payment', { state: cartItems?.map((item, index) => item.price) })
                    onCancel()
                  }
                }}
              >Place Order</button>
            </div>}
          </div>
        </div>
      </div>

    </Modal>
  );
};

export default CartModal;