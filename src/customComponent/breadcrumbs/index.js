import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux"
import { useOutletContext } from "react-router-dom";
import ThemeImages from "../../themes/appImage";
import { ViewTypeContext } from '../../hoc/mainLayout'
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";



const Breadcrumbs = () => {

    const dispatch = useDispatch();
    const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
    const {
        selectedType,
        configurationStep
    } = reducerBluePrint
    const [x, y, z] = useOutletContext();

    const configuratorData = useSelector(getMemoizedConfigurationData)
    const {
        step,
        stepMoreThan3
    } = configuratorData


    const viewTypeContext = React.useContext(ViewTypeContext);

    return (
        <div>
            <div className="switch_bar">
                <div className="heading_data">
                    <h3 className="heading_switch">Switch To</h3>
                    <div className="button_switch">
                        <img
                            id="floorplan_tab"
                            // className="floorplan_tab"
                            src={selectedType === '2D' && !stepMoreThan3 ? ThemeImages.logo2 : ThemeImages.blur2d}
                            style={{display: configurationStep > 2 ? "none" : 'initial'}}
                            onClick={() => {

                                dispatch(updateEngineStatesAction('2D', 'selectedType'))
                                // viewTypeContext[1]('2D')
                            }}
                        />

                        <img
                            id="design_2d_tab"
                            style={{display: configurationStep < 3 ? "none" : 'initial'}}
                            // className="floorplan_tab"
                            src={selectedType === '2D' && !stepMoreThan3 ? ThemeImages.logo2 : ThemeImages.blur2d}
                            onClick={() => {

                                dispatch(updateEngineStatesAction('2D', 'selectedType'))
                                // viewTypeContext[1]('2D')
                            }}
                        />
                        <img
                            src={selectedType === '2D' ? ThemeImages.logo3 : ThemeImages.color3d}
                            id="update-floorplan"
                            onClick={() => {

                                dispatch(updateEngineStatesAction('3D', 'selectedType'))
                                // viewTypeContext[1]('3D')
                            }}
                        />
                    </div>
                </div>
                {/* <div className="breadbrumb">
                    <h3>Determine the Room Size</h3>
                </div> */}
            </div>
        </div>
    )


}
export default Breadcrumbs
