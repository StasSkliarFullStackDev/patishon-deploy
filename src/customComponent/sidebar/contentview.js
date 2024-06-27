import React from "react"
import { useDispatch, useSelector } from "react-redux";
import { Slider } from 'antd';
import ThemeImages from "../../themes/appImage";
import { Tabs } from 'antd';
import { Radio } from 'antd';
import { ViewTypeContext } from '../../hoc/mainLayout'
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d";
const { TabPane } = Tabs;
// import ContentView from './contentview';



const ContentView = (props) => {
    const contextData = React.useContext(ViewTypeContext)

    const dispatch = useDispatch()


    const {
        step,
        handleChangeState,
    } = props

    const formatter = (value) => `${value}mm`;
    return (
        <div className='backtonormal'>

            <h4>3D View</h4>
            <p>You are now in the 3D view. Use the mouse to move the panel place directly in the 3D view.</p>

            {/* <div className="button_lite_ions">

                <div className='button dviews button_space_j'>
                    <button
                        type='submit'
                        id="back-to-2d"
                        onClick={() => {
                            // contextData[1]('2D')
                            dispatch(updateEngineStatesAction('2D', 'selectedType'))
                        }}
                        className='sucess_button'
                    >Back to normal view</button>

                </div>
            </div> */}
            {/* {step > 3 && <div class="floating-text"><p>total<br /> price</p><h3>£ 150</h3></div>} */}

        </div>
    )
}
export default ContentView
