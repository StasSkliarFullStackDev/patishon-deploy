import Breadcrumbs from "../../customComponent/breadcrumbs"

const RoomPartition = () => {
    return (
        <div className='container_wrapper'>
            <Breadcrumbs />
            <div className="horizontal-container">

                {/* <div className="sidebar">
          <div>
            <ul className="nav nav-sidebar vertical-container">
              <li id="floorplan_tab">
                <button
                  placement="right"
                >
                  Edit FloorPlan
                </button>
              </li>
              <li id="design_tab">
                <button
                  placement="right"
                >
                  Design
                </button>
              </li>
              <li id="items_tab">
                <button
                  placement="right"
                >
                  Items
                </button>
              </li>
            </ul>
          </div>
          <div>
            <ul className="nav nav-sidebar vertical-container">
              <li>
                <button
                  placement="right"
                >
                  New Plain
                </button>
              </li>
            </ul>
          </div>
        </div> */}
                <div id="texture-context-container">
                    {/* Context Menu */}
                    <div id="context-menu">
                        {/* <ContextMenu /> */}
                    </div>
                    {/* Floor Textures */}
                    <div id="floorTexturesDiv" style={{ display: "none" }}>
                        {/* <FloorTextureList loggedIn={store.getLoggedIn} /> */}
                    </div>

                    {/* Wall Textures */}
                    <div id="wallTextures" style={{ display: "none" }}>
                        {/* <WallTextureList loggedIn={store.getLoggedIn} /> */}
                    </div>
                </div>
                {/* End Left Column */}

                {/* Right Column */}
                <div className="right-container">
                    {/* 3D Viewer */}
                    <div id="viewer">
                        <div id="camera-controls">
                            <button
                                id="zoom-out"
                                className={"basic-button"}
                            >
                                min
                            </button>
                            <button
                                id="reset-view"
                                className={"basic-button"}
                            >
                                home
                            </button>
                            <button
                                // variant="danger"
                                // size="sm"
                                id="zoom-in"
                                className={"basic-button"}
                            >
                                search
                                {/* <FaSearchPlus /> */}
                            </button>

                            <button
                                // variant="danger"
                                // size="sm"
                                id="move-left"
                                className={"basic-button"}
                            >
                                left
                                {/* <FaArrowLeft /> */}
                            </button>
                            <div className={"vertical-controls-container"}>
                                <button
                                    variant="danger"
                                    size="sm"
                                    id="move-up"
                                    className={"basic-button"}
                                >
                                    up
                                    {/* <FaArrowUp /> */}
                                </button>
                                <button
                                    variant="danger"
                                    size="sm"
                                    id="move-down"
                                    className={"basic-button"}
                                >
                                    down
                                    {/* <FaArrowDown /> */}
                                </button>
                            </div>
                            <button
                                variant="danger"
                                size="sm"
                                id="move-right"
                                className={"basic-button"}
                            >
                                right
                                {/* <FaArrowRight /> */}
                            </button>
                        </div>
                        {/* <div id="loading-modal">
            <h1>Loading...</h1>
          </div> */}
                    </div>
                    {/*2D Floorplanner */}
                    <div id="floorplanner">
                        <canvas id="floorplanner-canvas"></canvas>
                        <div id="floorplanner-controls">
                            <button
                                variant="secondary"
                                size="sm"
                                className="icon-text-button"
                                id="move"
                            >
                                <span className="text-centre">Move Walls</span>
                            </button>
                            <button
                                variant="secondary"
                                size="sm"
                                className="icon-text-button"
                                id="draw"
                            >
                                <span className="text-centre">Draw Walls</span>
                            </button>
                            <button
                                variant="secondary"
                                size="sm"
                                className="icon-text-button"
                                id="delete"
                            >
                                <span className="text-centre">Delete Walls</span>
                            </button>

                            <button
                                variant="danger"
                                size="sm"
                                className="icon-text-button"
                                id="update-floorplan"
                            >
                                <span className="text-centre">Done</span>
                            </button>
                        </div>
                        <div id="draw-walls-hint">
                            Press the "Esc" key to stop drawing walls
                        </div>
                    </div>
                    {/* Add Items */}
                    <div id="add-items">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomPartition