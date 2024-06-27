import { useDispatch, useSelector } from "react-redux"
import { faCartShopping } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Badge } from "antd"
import { useLocation, useNavigate } from "react-router"
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import CartModal from "../cartModal"
import { useState } from "react"
import { getMemoizedCartData } from "../../redux/selectors/cart"

const ShoppingCartIcon = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { pathname } = useLocation()
    const [openModal, setOpenModal] = useState(false)
    const reducerBlueprint = useSelector(getMemoizedBlueprint3dData)
    const { sidebarCollapsed } = reducerBlueprint
    const reducerCart = useSelector(getMemoizedCartData)
    const { cartItemsCount } = reducerCart

    return (
        <div className="cartShopping"
            style={{ right: sidebarCollapsed ? "60px" : "20px" }}
            onClick={() => {
                if (!openModal) {
                    setOpenModal(!openModal)
                }
            }}
        >
            <Badge size="small" count={cartItemsCount}>
                <FontAwesomeIcon
                    className="Cart_Shopping"
                    icon={faCartShopping} />
            </Badge>
            {openModal && <CartModal onCancel={() => {
                setOpenModal(!openModal)
            }} />}
        </div>
    )
}
export default ShoppingCartIcon;