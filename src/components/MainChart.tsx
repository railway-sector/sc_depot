import "@esri/calcite-components/dist/components/calcite-tabs";
import "@esri/calcite-components/dist/components/calcite-tab";
import "@esri/calcite-components/dist/components/calcite-tab-nav";
import "@esri/calcite-components/dist/components/calcite-tab-title";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalciteTab,
  CalciteTabs,
  CalciteTabNav,
  CalciteTabTitle,
} from "@esri/calcite-components-react";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import { useEffect, useState } from "react";
import { buildingLayer, buildingLayer_cw } from "../layers";

// import LotChart from "./LotChart";
import "../index.css";
import "../App.css";
import BuildingChart from "./BuildingChart";
import CivilWorkChart from "./CivilWorkChart";

function MainChart() {
  const [buildingLayerLoaded, setBuildingLayerLoaded] = useState<any>(); // 'loaded'
  const [buildingLayerCwLoaded, setBuildingLayerCwLoaded] = useState<any>();
  const [chartTabName, setChartTabName] = useState("depotBuilding");

  // Somehow if you do not add arcgisScene here, the child components (ie., LotChart)
  // will not inherit arcgisScene
  // const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;

  useEffect(() => {
    buildingLayer.load().then(() => {
      setBuildingLayerLoaded(buildingLayer.loadStatus);
    });

    buildingLayer_cw.load().then(() => {
      setBuildingLayerCwLoaded(buildingLayer_cw.loadStatus);
    });
  });

  useEffect(() => {
    if (chartTabName === "depotBuilding") {
      buildingLayer.visible = true;
      buildingLayer_cw.visible = false;
    } else if (chartTabName === "civilWorks") {
      buildingLayer.visible = false;
      buildingLayer_cw.visible = true;
    }
  }, [chartTabName]);

  return (
    <>
      <CalciteTabs
        style={{
          width: "35%",
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          // borderTopWidth: 5,
          borderColor: "#555555",
        }}
        scale="l"
        slot="panel-end"
        layout="center"
      >
        <CalciteTabNav
          slot="title-group"
          id="thetabs"
          onCalciteTabChange={(event: any) =>
            setChartTabName(event.srcElement.selectedTitle.className)
          }
        >
          <CalciteTabTitle class="depotBuilding">
            Depot Building
          </CalciteTabTitle>
          <CalciteTabTitle class="civilWorks">Civil Works</CalciteTabTitle>
        </CalciteTabNav>

        {/* CalciteTab: Building */}
        <CalciteTab>
          {buildingLayerLoaded === "loaded" ? <BuildingChart /> : ""}
        </CalciteTab>

        {/* CalciteTab: Civil Works */}
        <CalciteTab>
          {buildingLayerCwLoaded === "loaded" ? <CivilWorkChart /> : ""}
        </CalciteTab>
      </CalciteTabs>
    </>
  );
}

export default MainChart;
