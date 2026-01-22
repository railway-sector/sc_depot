import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import {
  SimpleLineSymbol,
  MeshSymbol3D,
  FillSymbol3DLayer,
  SimpleFillSymbol,
  PolygonSymbol3D,
  ExtrudeSymbol3DLayer,
} from "@arcgis/core/symbols";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D";
import { labelSymbol3DLine } from "./Label";
import BuildingSceneLayer from "@arcgis/core/layers/BuildingSceneLayer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import CustomContent from "@arcgis/core/popup/content/CustomContent";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import GroupLayer from "@arcgis/core/layers/GroupLayer";

/* Standalone table for Dates */
export const dateTable = new FeatureLayer({
  portalItem: {
    id: "b2a118b088a44fa0a7a84acbe0844cb2",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
});

// * PROW *//
const prowRenderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "#ff0000",
    width: "2px",
  }),
});

export const prowLayer = new FeatureLayer({
  url: "https://gis.railway-sector.com/server/rest/services/SC_Alignment/FeatureServer/5",
  title: "PROW",
  popupEnabled: false,
  renderer: prowRenderer,
});
prowLayer.listMode = "hide";

// * Station Layer * //
const stationLayerTextSymbol = labelSymbol3DLine({
  materialColor: "#d4ff33",
  fontSize: 15,
  fontFamily: "Ubuntu Mono",
  fontWeight: "normal",
  haloColor: "black",
  haloSize: 0.5,
  vOffsetScreenLength: 100,
  vOffsetMaxWorldLength: 700,
  vOffsetMinWorldLength: 80,
});

const labelClass = new LabelClass({
  symbol: stationLayerTextSymbol,
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: 'DefaultValue($feature.Station, "no data")',
    //value: "{TEXTSTRING}"
  },
});

export const stationLayer = new FeatureLayer({
  portalItem: {
    id: "e09b9af286204939a32df019403ef438",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 6,
  title: "Station",
  definitionExpression: "Station <> 'Banlic Depot'",
  labelingInfo: [labelClass],
  elevationInfo: {
    mode: "relative-to-ground",
  },
});
stationLayer.listMode = "hide";

// Lot Layer
/* The colors used for the each transit line */
const lotIdLabel = new LabelClass({
  labelExpressionInfo: { expression: "$feature.LotID" },
  symbol: {
    type: "text",
    color: "black",
    haloColor: "white",
    haloSize: 0.5,
    font: {
      size: 11,
      weight: "bold",
    },
  },
});

const lotDefaultSymbol = new SimpleFillSymbol({
  color: [0, 0, 0, 0],
  style: "solid",
  outline: {
    // autocasts as new SimpleLineSymbol()
    color: [110, 110, 110],
    width: 0.7,
  },
});

const lotStatusLabel = [
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Offer to Buy",
  "For Notice of Taking",
  "With PTE",
  "For Expropriation",
  "Harmonized",
];
const endorsedStatus = ["Not Endorsed", "Endorsed", "NA"];
const lotStatusColor = [
  "#00734d",
  "#0070ff",
  "#ffff00",
  "#ffaa00",
  "#FF5733",
  "#70AD47",
  "#FF0000",
  "#B2B2B2",
];
const lotUseArray = [
  "Agricultural",
  "Agricultural & Commercial",
  "Agricultural / Residential",
  "Commercial",
  "Industrial",
  "Irrigation",
  "Residential",
  "Road",
  "Road Lot",
  "Special Exempt",
];
const lotStatusField = "StatusLA";
const lotHandedOverDateField = "HandedOverDate";
const percentHandedOverField = "percentHandedOver";
const landUseField = "LandUse";
const municipalityField = "Municipality";
const barangayField = "Barangay";
const landOwnerField = "LandOwner";
const cpField = "CP";
const endorsedField = "Endorsed";

const uniqueValueInfosLotStatus = lotStatusLabel.map(
  (status: any, index: any) => {
    return Object.assign({
      value: index + 1,
      label: status,
      symbol: new SimpleFillSymbol({
        color: lotStatusColor[index],
      }),
    });
  },
);
const lotLayerRenderer = new UniqueValueRenderer({
  field: lotStatusField,
  defaultSymbol: lotDefaultSymbol, // autocasts as new SimpleFillSymbol()
  uniqueValueInfos: uniqueValueInfosLotStatus,
});

// Custom popup for lot layer
const customContentLot = new CustomContent({
  outFields: ["*"],
  creator: (event: any) => {
    // Extract AsscessDate of clicked pierAccessLayer
    const handedOverDate = event.graphic.attributes[lotHandedOverDateField];
    const handOverArea = event.graphic.attributes[percentHandedOverField];
    const statusLot = event.graphic.attributes[lotStatusField];
    const landUse = event.graphic.attributes[landUseField];
    const municipal = event.graphic.attributes[municipalityField];
    const barangay = event.graphic.attributes[barangayField];
    const landOwner = event.graphic.attributes[landOwnerField];
    const cpNo = event.graphic.attributes[cpField];
    const endorse = event.graphic.attributes[endorsedField];
    const endorsed = endorsedStatus[endorse];

    let daten: any;
    let date: any;
    if (handedOverDate) {
      daten = new Date(handedOverDate);
      const year = daten.getFullYear();
      const month = daten.getMonth() + 1;
      const day = daten.getDate();
      date = `${year}-${month}-${day}`;
    } else {
      date = "Undefined";
    }
    // Convert numeric to date format 0
    //const daten = new Date(handedOverDate);
    //const date = dateFormat(daten, 'MM-dd-yyyy');
    //<li>Hand-Over Date: <b>${date}</b></li><br>

    return `
    <div style='color: #eaeaea'>
    <ul><li>Handed-Over Area: <b>${handOverArea} %</b></li>
    <li>Handed-Over Date: <b>${date}</b></li>
              <li>Status:           <b>${
                statusLot >= 0 ? lotStatusLabel[statusLot - 1] : ""
              }</b></li>
              <li>Land Use:         <b>${
                landUse >= 1 ? lotUseArray[landUse - 1] : ""
              }</b></li>
              <li>Municipality:     <b>${municipal}</b></li>
              <li>Barangay:         <b>${barangay}</
              b></li>
              <li>Land Owner:       <b>${landOwner}</b>
              <li>CP:               <b>${cpNo}</b>
              <li>Endorsed:         <b>${endorsed}</b></li></ul>
              </div>
              `;
  },
});

const templateLot = new PopupTemplate({
  title: "<div style='color: #eaeaea'>Lot No.: <b>{LotID}</b></div>",
  lastEditInfoEnabled: false,
  content: [customContentLot],
});

export const lotLayer = new FeatureLayer({
  portalItem: {
    id: "99500faf0251426ea1df934a739faa6f",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 1,
  labelingInfo: [lotIdLabel],
  renderer: lotLayerRenderer,
  popupTemplate: templateLot,
  title: "Land Acquisition",
  minScale: 150000,
  maxScale: 0,
  definitionExpression: "CP = 'S-07'",
  //labelsVisible: false,
  elevationInfo: {
    mode: "on-the-ground",
  },
});

// Structure Layer
const structureStatusField = "StatusStruc";
const structureStatusLabel = [
  "Demolished",
  "Paid",
  "For Payment Processing",
  "For Legal Pass",
  "For Offer to Compensate",
  "For Notice of Taking",
  "No Need to Acquire",
];

const structureStatusColorRgb = [
  [0, 197, 255, 0.6],
  [112, 173, 71, 0.6],
  [0, 112, 255, 0.6],
  [255, 255, 0, 0.6],
  [255, 170, 0, 0.6],
  [255, 83, 73, 0.6],
  [178, 190, 181, 0.6],
];

// const height = 5;
const edgeSize = 0.3;

const defaultStructureRenderer = new PolygonSymbol3D({
  symbolLayers: [
    new ExtrudeSymbol3DLayer({
      size: 5,
      material: {
        color: [0, 0, 0, 0.4],
      },
      edges: new SolidEdges3D({
        color: "#4E4E4E",
        size: edgeSize,
      }),
    }),
  ],
});

const uniqueValueInfosStrucStatus = structureStatusLabel.map(
  (status: any, index: any) => {
    return Object.assign({
      value: index + 1,
      symbol: new PolygonSymbol3D({
        symbolLayers: [
          new ExtrudeSymbol3DLayer({
            size: 5,
            material: {
              color: structureStatusColorRgb[index],
            },
            edges: new SolidEdges3D({
              color: "#4E4E4E",
              size: edgeSize,
            }),
          }),
        ],
      }),
      label: status,
    });
  },
);
const structureRenderer = new UniqueValueRenderer({
  defaultSymbol: defaultStructureRenderer,
  defaultLabel: "Other",
  field: structureStatusField,
  uniqueValueInfos: uniqueValueInfosStrucStatus,
});

export const structureLayer = new FeatureLayer({
  portalItem: {
    id: "99500faf0251426ea1df934a739faa6f",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 2,
  title: "Structure",
  renderer: structureRenderer,
  definitionExpression: "CP = 'S-07'",
  elevationInfo: {
    mode: "on-the-ground",
  },
  popupTemplate: {
    title: "<div style='color: #eaeaea'>{StrucID}</div>",
    lastEditInfoEnabled: false,
    returnGeometry: true,
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "StrucOwner",
            label: "Structure Owner",
          },
          {
            fieldName: "Municipality",
          },
          {
            fieldName: "Barangay",
          },
          {
            fieldName: "StatusStruc",
            label: "<p>Status for Structure</p>",
          },
          {
            fieldName: "Name",
          },
          {
            fieldName: "Status",
            label: "Households Ownership (structure) ",
          },
        ],
      },
    ],
  },
});

export const lotStructureGroupLayer = new GroupLayer({
  title: "Land & Structure",
  visible: true,
  visibilityMode: "independent",
  layers: [lotLayer, structureLayer],
});

/* Building Scene Layer for station structures */
const buildingSpotLabel = labelSymbol3DLine({
  materialColor: "#d4ff33",
  fontSize: 15,
  fontFamily: "Ubuntu Mono",
  fontWeight: "normal",
  haloColor: "black",
  haloSize: 0.5,
  vOffsetScreenLength: 100,
  vOffsetMaxWorldLength: 700,
  vOffsetMinWorldLength: 80,
  calloutColor: "gray",
  calloutSize: 0.3,
});

const labelClassBulding = new LabelClass({
  symbol: buildingSpotLabel,
  labelPlacement: "above-center",
  labelExpressionInfo: {
    expression: 'DefaultValue($feature.Name, "no data")',
    //value: "{TEXTSTRING}"
  },
});

export const buildingSpotLayer = new FeatureLayer({
  portalItem: {
    id: "285e68f3fcce48f6ab196f912c5c58c5",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  popupEnabled: false,
  outFields: ["*"],
  labelingInfo: [labelClassBulding],
});
buildingSpotLayer.listMode = "hide";

// Building layers for Depot buildings
export const buildingLayer = new BuildingSceneLayer({
  portalItem: {
    id: "2fcb3db0ec324f92805cc45c0e79f29d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  // Do not add outFields; otherwise, rendering get extremely slow
  legendEnabled: false,
  title: "Depot Buildings",
});

const colorStatus = [
  [225, 225, 225, 0.1], // To be Constructed (white)
  [211, 211, 211, 0.5], // Under Construction
  [255, 0, 0, 0.8], // Delayed
  [0, 112, 255, 0.8], // Completed
];

const renderer = new UniqueValueRenderer({
  field: "Status",
  uniqueValueInfos: [
    {
      value: 1,
      label: "To be Constructed",
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[0],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
    // {
    //   value: 2,
    //   label: "Under Construction",
    //   symbol: new MeshSymbol3D({
    //     symbolLayers: [
    //       new FillSymbol3DLayer({
    //         material: {
    //           color: colorStatus[1],
    //           colorMixMode: "replace",
    //         },
    //         edges: new SolidEdges3D({
    //           color: [225, 225, 225, 0.3],
    //         }),
    //       }),
    //     ],
    //   }),
    // },
    {
      value: 4,
      label: "Completed",
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[3],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
  ],
});

// Discipline: Architectural
export let columnsLayer: null | any;
export let floorsLayer: null | any;
export let wallsLayer: null | any;
export let doorsLayer: null | any;
export let roofsLayer: null | any;
export let furnitureLayer: null | any;
export let stairsLayer: null | any;
export let windowsLayer: null | any;

// Discipline: Structural
export let stFramingLayer: null | any;
export let stColumnLayer: null | any;
export let stFoundationLayer: null | any;

export let genericModelLayer: null | any;

export const popuTemplate = {
  title: "{Name}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "Type",
          label: "Type",
        },
        {
          fieldName: "Category",
          label: "Category",
        },
        {
          fieldName: "Status",
          label: "Construction Status",
        },
        {
          fieldName: "BldgLevel",
          label: "Building Level",
        },
        {
          fieldName: "StructureLevel",
          label: "Structure Level",
        },
        // {
        //   fieldName: 'P6ID',
        //   label: 'P6 ID',
        // },
      ],
    },
  ],
};

export let exteriorShellLayer: null | any;

buildingLayer.when(() => {
  buildingLayer.allSublayers.forEach((layer: any) => {
    switch (layer.modelName) {
      case "FullModel":
        layer.visible = true;
        break;

      case "Architectural":
        layer.visible = true;
        break;

      case "Overview":
        exteriorShellLayer = layer;
        break;

      case "GenericModel":
        genericModelLayer = layer;
        genericModelLayer.popupTemplate = popuTemplate;
        genericModelLayer.title = "Generic Model";
        genericModelLayer.renderer = renderer;
        break;

      case "Furniture":
        furnitureLayer = layer;
        furnitureLayer.popupTemplate = popuTemplate;
        furnitureLayer.title = "Furniture";
        furnitureLayer.renderer = renderer;
        break;

      case "Doors":
        doorsLayer = layer;
        doorsLayer.popupTemplate = popuTemplate;
        doorsLayer.title = "Doors";
        doorsLayer.renderer = renderer;
        break;

      case "Columns":
        columnsLayer = layer;
        columnsLayer.popupTemplate = popuTemplate;
        columnsLayer.title = "Columns";
        columnsLayer.renderer = renderer;
        //excludedLayers.push(layer);
        break;

      case "Floors":
        floorsLayer = layer;
        floorsLayer.popupTemplate = popuTemplate;
        floorsLayer.title = "Floors";
        floorsLayer.renderer = renderer;
        //excludedLayers
        break;

      case "Stairs":
        stairsLayer = layer;
        stairsLayer.popupTemplate = popuTemplate;
        stairsLayer.title = "Stairs";
        stairsLayer.renderer = renderer;
        break;

      case "Roofs":
        roofsLayer = layer;
        roofsLayer.popupTemplate = popuTemplate;
        roofsLayer.title = "Roofs";
        roofsLayer.renderer = renderer;
        break;

      case "Walls":
        wallsLayer = layer;
        wallsLayer.popupTemplate = popuTemplate;
        wallsLayer.title = "Walls";
        wallsLayer.renderer = renderer;
        break;

      case "Windows":
        windowsLayer = layer;
        windowsLayer.popupTemplate = popuTemplate;
        windowsLayer.title = "Windows";
        windowsLayer.renderer = renderer;
        break;

      case "StructuralFraming":
        stFramingLayer = layer;
        stFramingLayer.popupTemplate = popuTemplate;
        stFramingLayer.title = "Structural Framing";
        stFramingLayer.renderer = renderer;
        break;

      case "StructuralColumns":
        stColumnLayer = layer;
        stColumnLayer.popupTemplate = popuTemplate;
        stColumnLayer.title = "Structural Columns";
        stColumnLayer.renderer = renderer;
        break;

      case "StructuralFoundation":
        stFoundationLayer = layer;
        stFoundationLayer.popupTemplate = popuTemplate;
        stFoundationLayer.title = "Structural Foundation";
        stFoundationLayer.renderer = renderer;
        break;

      default:
        layer.visible = true;
    }
  });
});

// Building layers for Depot civil works
const renderer_cw = new UniqueValueRenderer({
  field: "Status",
  uniqueValueInfos: [
    {
      value: 1,
      label: "To be Constructed",
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[0],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
    // {
    //   value: 2,
    //   label: "Under Construction",
    //   symbol: new MeshSymbol3D({
    //     symbolLayers: [
    //       new FillSymbol3DLayer({
    //         material: {
    //           color: colorStatus[1],
    //           colorMixMode: "replace",
    //         },
    //         edges: new SolidEdges3D({
    //           color: [225, 225, 225, 0.3],
    //         }),
    //       }),
    //     ],
    //   }),
    // },
    {
      value: 4,
      label: "Completed",
      symbol: new MeshSymbol3D({
        symbolLayers: [
          new FillSymbol3DLayer({
            material: {
              color: colorStatus[3],
              colorMixMode: "replace",
            },
            edges: new SolidEdges3D({
              color: [225, 225, 225, 0.3],
            }),
          }),
        ],
      }),
    },
  ],
});

export const buildingLayer_cw = new BuildingSceneLayer({
  portalItem: {
    id: "09a326d846c84a50a332c2b8f64d2c31", //"02ae45b1cec743599866829abc1cab05",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  legendEnabled: false,
  // Do not add outFields; otherwise, rendering get extremely slow
  title: "Depot Civil Works",
});

// Discipline: Architectural
export let architecturalLayer_cw: null | any;
export let floorsLayer_cw: null | any;
export let wallsLayer_cw: null | any;
export let stairsRailingLayer_cw: null | any;
export let plumbinFixturesLayer_cw: null | any;

// Discipline_cw: Structural
export let stFoundationLayer_cw: null | any;
export let stFramingLayer_cw: null | any;
export let stColumnsLayer_cw: null | any;
export let genericModelLayer_cw: null | any;

export const popupTemplate_cw = {
  title: "{Status}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "BaseCategory",
          label: "BaseCategory",
        },
        {
          fieldName: "Status",
          label: "Construction Status",
        },
      ],
    },
  ],
};

export let exteriorShellLayer_cw: null | any;

const rendererNotMonitoring = new SimpleRenderer({
  symbol: new MeshSymbol3D({
    symbolLayers: [
      new FillSymbol3DLayer({
        material: {
          color: [255, 255, 155, 0.3],
          colorMixMode: "replace",
        },
        edges: new SolidEdges3D({
          color: [255, 255, 155, 0.3],
        }),
      }),
    ],
  }),
});

buildingLayer_cw.when(() => {
  buildingLayer_cw.allSublayers.forEach((layer: any) => {
    switch (layer.modelName) {
      case "FullModel":
        layer.visible = true;
        break;

      case "Architectural":
        architecturalLayer_cw = layer;
        architecturalLayer_cw.visible = false;
        architecturalLayer_cw.title = "Architectural (reference only)";
        break;

      case "Overview":
        exteriorShellLayer_cw = layer;
        exteriorShellLayer_cw.title = "ExteriorShell";
        exteriorShellLayer_cw.visible = false;
        layer.visible = false;
        break;

      case "GenericModel":
        genericModelLayer_cw = layer;
        genericModelLayer_cw.title = "GeneralModel";
        genericModelLayer_cw.renderer = rendererNotMonitoring;
        break;

      case "Floors":
        floorsLayer_cw = layer;
        floorsLayer_cw.popupTemplate = popupTemplate_cw;
        floorsLayer_cw.renderer = rendererNotMonitoring;
        floorsLayer_cw.title = "Floors";
        //excludedLayers
        break;

      case "PlumbingFixtures":
        plumbinFixturesLayer_cw = layer;
        plumbinFixturesLayer_cw.popupTemplate = popupTemplate_cw;
        plumbinFixturesLayer_cw.renderer = rendererNotMonitoring;
        plumbinFixturesLayer_cw.title = "PlumbingFixtures";
        break;

      case "StairsRailing":
        stairsRailingLayer_cw = layer;
        stairsRailingLayer_cw.popupTemplate = popupTemplate_cw;
        stairsRailingLayer_cw.renderer = rendererNotMonitoring;
        stairsRailingLayer_cw.title = "StairsRailing";
        break;

      case "Walls":
        wallsLayer_cw = layer;
        wallsLayer_cw.popupTemplate = popupTemplate_cw;
        wallsLayer_cw.renderer = rendererNotMonitoring;
        wallsLayer_cw.title = "Walls";
        break;

      case "StructuralFoundation":
        stFoundationLayer_cw = layer;
        stFoundationLayer_cw.popupTemplate = popupTemplate_cw;
        stFoundationLayer_cw.renderer = renderer_cw;
        stFoundationLayer_cw.title = "StructuralFoundation";
        break;

      case "StructuralColumns":
        stColumnsLayer_cw = layer;
        stColumnsLayer_cw.popupTemplate = popupTemplate_cw;
        stColumnsLayer_cw.renderer = renderer_cw;
        stColumnsLayer_cw.title = "StructuralColumns";
        break;

      case "StructuralFraming":
        stFramingLayer_cw = layer;
        stFramingLayer_cw.popupTemplate = popupTemplate_cw;
        stFramingLayer_cw.renderer = renderer_cw;
        stFramingLayer_cw.title = "StructuralFraming (Reference only?)";
        break;

      default:
        layer.visible = true;
    }
  });
});
