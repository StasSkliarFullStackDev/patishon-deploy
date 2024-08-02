import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from 'react-router'
import { Select } from 'antd';
import HeaderBar from '../../customComponent/header';
import ThemeImages from '../../themes/appImage';
import { getMemoizedConfigurationData } from '../../redux/selectors/configuration';
import { LOCAL_SERVER } from '../../constant';
import { updateEngineStatesAction } from '../../redux/actions/blueprint3d';
import { getMemoizedCartData } from '../../redux/selectors/cart';
import { updateCartStates } from '../../redux/actions/cart';

const Payment = (props) => {
    const { state } = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const naviagteToHome = () => {
        localStorage.removeItem("selectedType")
        localStorage.removeItem("partitionType")
        navigate('/')
        window.history.pushState({}, '', "/landing");
    }
    console.log(state);
    const configuratorData = useSelector(getMemoizedConfigurationData)
    const {
        pdfUrl,
        totalPrice,
        placeOrderLoader
    } = configuratorData
    const reeducerCart = useSelector(getMemoizedCartData)
    const { placeOrder, cartItems } = reeducerCart

    const [url, setUrl] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState('')

    useEffect(() => {
        if (pdfUrl) {
            setUrl(pdfUrl)
            setSelectedOrder(pdfUrl[0])
        }
        dispatch(updateEngineStatesAction(true, 'sidebarCollapsed'))
    }, [pdfUrl])

    useEffect(() => {
        window.addEventListener('popstate', () => naviagteToHome())
        window.onload = () => (parseInt(totalPrice) || placeOrder) ? "" : naviagteToHome()

        return () => {
            dispatch(updateCartStates(false, "placeOrder"))
        }
    }, [])


    const onChange = (value) => {
        console.log(`selected ${value}`);
        setSelectedOrder(value)
    };
    console.log("cartItems DATA", state)
    return (
        <div>
            <HeaderBar />
            <div className='Success center-point'>
                <h2>Payment Success</h2>
                <p>Your Order has been placed.</p>
                <img src={ThemeImages.payment} />
                {console.log("total price = ", typeof totalPrice)}
                <h4>Payment Success Of £{placeOrder ? state?.[url?.indexOf(selectedOrder)] : totalPrice}</h4>
                <p className='download'>Please download pdf for checking your chosen product details.</p>
                <div className='button_wrap'>
                    {console.log("this is url = ", selectedOrder)}
                    {placeOrder && <> <Select
                        className='order_dropdown'
                        optionFilterProp="children"
                        defaultActiveFirstOption={true}
                        onChange={onChange}
                        value={selectedOrder}
                        // onSearch={onSearch}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={url?.map((item, index) => {
                            return {
                                value: item,
                                label: `Order ${index + 1}`,
                            }
                        })}
                    />
                        <br /> </>}
                    {
                        placeOrderLoader && <div>Creating a quote PDF...</div>
                    }
                    {
                        !placeOrderLoader &&
                        <a
                            href={LOCAL_SERVER + selectedOrder}
                            className='pdf-one'
                            target="_blank"
                            rel="noreferrer"
                        >
                            Download PDF
                        </a>
                    }
                    <br/>
                    <button className='pdf-one' onClick={naviagteToHome}>
                        Back to Home
                    </button>
                </div>
                {/* <button className='pdf-one' onClick={() => navigate(`http://192.168.3.176:3005/${url}`)}>Download PDF</button> */}
            </div>


        </div >
    )
}

export default Payment
