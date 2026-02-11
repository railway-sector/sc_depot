/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  buildingLayer,
  floorsLayer,
  stColumnLayer,
  stFoundationLayer,
  stFramingLayer,
  wallsLayer,
  columnsLayer,
  dateTable,
  buildingSpotLayer,
  buildingLayer_cw,
  stFoundationLayer_cw,
  stColumnsLayer_cw,
  stFramingLayer_cw,
} from "./layers";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import Query from "@arcgis/core/rest/support/Query";

// Updat date
export async function dateUpdate() {
  const monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const query = dateTable.createQuery();
  query.where = "project = 'SC'" + " AND " + "category = 'Depot Buildings'";

  return dateTable.queryFeatures(query).then((response: any) => {
    const stats = response.features;
    const dates = stats.map((result: any) => {
      const date = new Date(result.attributes.date);
      const year = date.getFullYear();
      const month = monthList[date.getMonth()];
      const day = date.getDate();
      const final = year < 1990 ? "" : `${month} ${day}, ${year}`;
      return final;
    });
    return dates;
  });
}

export const buildingType = [
  {
    category: "St.Foundation",
    modelName: "StructuralFoundation",
    value: 1,
  },
  {
    category: "St.Column",
    modelName: "StructuralColumns",
    value: 2,
  },
  {
    category: "St.Framing",
    modelName: "StructuralFraming",
    value: 3,
  },
  {
    category: "Floors",
    modelName: "Floors",
    value: 5,
  },
  {
    category: "Walls",
    modelName: "Walls",
    value: 6,
  },
  {
    category: "Columns",
    modelName: "Columns",
    value: 7,
  },
];

export const layerVisibleTrue = () => {
  stColumnLayer.definitionExpression = "1=1";
  stFoundationLayer.definitionExpression = "1=1";
  stFramingLayer.definitionExpression = "1=1";
  floorsLayer.definitionExpression = "1=1";
  wallsLayer.definitionExpression = "1=1";
  stColumnLayer.visible = true;
  stFoundationLayer.visible = true;
  stFramingLayer.visible = true;
  floorsLayer.visible = true;
  wallsLayer.visible = true;
  buildingLayer.visible = true;
};

export const layerVisibleTrue_cw = () => {
  stFoundationLayer_cw.definitionExpression = "1=1";
  stColumnsLayer_cw.definitionExpression = "1=1";
  stFramingLayer_cw.definitionExpression = "1=1";
  stFoundationLayer_cw.visible = true;
  stColumnsLayer_cw.visible = true;
  stFramingLayer_cw.visible = true;

  buildingLayer_cw.visible = true;
};

export async function buildingSpotZoom(buildingname: any, view: any) {
  const query = buildingSpotLayer.createQuery();
  const queryExpression = "Name = '" + buildingname + "'";
  const queryAll = "1=1";
  if (!buildingname) {
    query.where = queryAll;
  } else {
    query.where = queryExpression;
  }

  buildingSpotLayer.queryExtent(query).then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}

// SC Depot Civil Works
export const buildingType_cw = [
  {
    category: "St.Foundation",
    value: 1,
  },
  {
    category: "St.Column",
    value: 2,
  },
  {
    category: "St.Framing",
    value: 3,
  },
];

export async function generateChartData_cw() {
  const total_incomp = new StatisticDefinition({
    onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp",
    statisticType: "sum",
  });

  const total_comp = new StatisticDefinition({
    onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp",
    statisticType: "sum",
  });

  const query = new Query();
  query.outStatistics = [total_incomp, total_comp];

  const stFoundationCompile = stFoundationLayer_cw
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;
      return [total_incomp, total_comp];
    });

  const stColumnsCompile = stColumnsLayer_cw
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;
      return [total_incomp, total_comp];
    });

  const stFramingCompile = stFramingLayer_cw
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;
      return [total_incomp, total_comp];
    });

  const stfoundation = await stFoundationCompile;
  const stcolumns = await stColumnsCompile;
  const stframing = await stFramingCompile;
  const data_cw = [
    {
      category: buildingType_cw[0].category,
      comp: stfoundation[1],
      incomp: stfoundation[0],
    },
    {
      category: buildingType_cw[1].category,
      comp: stcolumns[1],
      incomp: stcolumns[0],
    },
    {
      category: buildingType_cw[2].category,
      comp: stframing[1],
      incomp: stframing[0],
    },
  ];

  const total =
    stfoundation[0] +
    stfoundation[1] +
    stcolumns[0] +
    stcolumns[1] +
    stframing[0] +
    stframing[1];

  const comp = stfoundation[1] + stcolumns[1] + stframing[1];
  const progress = ((comp / total) * 100).toFixed(1);
  return [data_cw, progress, total];
}

export async function generateChartData(buildingname: any) {
  const total_incomp = new StatisticDefinition({
    onStatisticField: "CASE WHEN Status = 1 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_incomp",
    statisticType: "sum",
  });

  const total_comp = new StatisticDefinition({
    onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp",
    statisticType: "sum",
  });

  const query = new Query();
  query.outStatistics = [total_incomp, total_comp];

  const queryExpression = "Name = '" + buildingname + "'";
  const queryAll = "1=1";

  if (!buildingname) {
    stColumnLayer.definitionExpression = queryAll;
    stFoundationLayer.definitionExpression = queryAll;
    stFramingLayer.definitionExpression = queryAll;
    columnsLayer.definitionExpression = queryAll;
    floorsLayer.definitionExpression = queryAll;
    wallsLayer.definitionExpression = queryAll;
    query.where = queryAll;
  } else {
    stColumnLayer.definitionExpression = queryExpression;
    stFoundationLayer.definitionExpression = queryExpression;
    stFramingLayer.definitionExpression = queryExpression;
    columnsLayer.definitionExpression = queryExpression;
    floorsLayer.definitionExpression = queryExpression;
    wallsLayer.definitionExpression = queryExpression;
    query.where = queryExpression;
  }

  const stColumnCompile = stColumnLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;

      return [total_incomp, total_comp];
    });

  const stFoundationCompile = stFoundationLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;

      return [total_incomp, total_comp];
    });

  const stFramingCompile = stFramingLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;

      return [total_incomp, total_comp];
    });

  const columnsCompile = columnsLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;

      return [total_incomp, total_comp];
    });

  const floorsCompile = floorsLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_incomp = stats.total_incomp;
      const total_comp = stats.total_comp;

      return [total_incomp, total_comp];
    });

  const wallsCompile = wallsLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const total_incomp = stats.total_incomp;
    const total_comp = stats.total_comp;
    return [total_incomp, total_comp];
  });

  const stcolumn = await stColumnCompile;
  const stfoundation = await stFoundationCompile;
  const stframing = await stFramingCompile;
  const columns = await columnsCompile;
  const floors = await floorsCompile;
  const walls = await wallsCompile;

  const data = [
    {
      category: buildingType[0].category,
      comp: stfoundation[1],
      incomp: stfoundation[0],
    },
    {
      category: buildingType[1].category,
      comp: stcolumn[1],
      incomp: stcolumn[0],
    },
    {
      category: buildingType[2].category,
      comp: stframing[1],
      incomp: stframing[0],
    },
    {
      category: buildingType[3].category,
      comp: floors[1],
      incomp: floors[0],
    },
    {
      category: buildingType[4].category,
      comp: walls[1],
      incomp: walls[0],
    },
    {
      category: buildingType[5].category,
      comp: columns[1],
      incomp: columns[0],
    },
  ];

  return data;
}

export async function generateTotalProgress(buildingname: any) {
  const total_number = new StatisticDefinition({
    onStatisticField: "Status",
    outStatisticFieldName: "total_number",
    statisticType: "count",
  });

  const total_comp = new StatisticDefinition({
    onStatisticField: "CASE WHEN Status = 4 THEN 1 ELSE 0 END",
    outStatisticFieldName: "total_comp",
    statisticType: "sum",
  });

  const query = new Query();
  query.outStatistics = [total_number, total_comp];

  const queryExpression = "Name = '" + buildingname + "'";
  const queryAll = "1=1";

  !buildingname ? (query.where = queryAll) : (query.where = queryExpression);
  const stColumnCompile = stColumnLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_number = stats.total_number;
      const total_comp = stats.total_comp;

      return [total_number, total_comp];
    });

  const stFoundationCompile = stFoundationLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_number = stats.total_number;
      const total_comp = stats.total_comp;

      return [total_number, total_comp];
    });

  const stFramingCompile = stFramingLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_number = stats.total_number;
      const total_comp = stats.total_comp;

      return [total_number, total_comp];
    });

  const columnsCompile = columnsLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_number = stats.total_number;
      const total_comp = stats.total_comp;

      return [total_number, total_comp];
    });

  const floorsCompile = floorsLayer
    .queryFeatures(query)
    .then((response: any) => {
      const stats = response.features[0].attributes;
      const total_number = stats.total_number;
      const total_comp = stats.total_comp;

      return [total_number, total_comp];
    });

  const wallsCompile = wallsLayer.queryFeatures(query).then((response: any) => {
    const stats = response.features[0].attributes;
    const total_number = stats.total_number;
    const total_comp = stats.total_comp;

    return [total_number, total_comp];
  });

  const stcolumn = await stColumnCompile;
  const stfoundation = await stFoundationCompile;
  const stframing = await stFramingCompile;
  const columns = await columnsCompile;
  const floors = await floorsCompile;
  const walls = await wallsCompile;

  const total =
    stcolumn[0] +
    stfoundation[0] +
    stframing[0] +
    columns[0] +
    floors[0] +
    walls[0];

  const comp =
    stcolumn[1] +
    stfoundation[1] +
    stframing[1] +
    columns[1] +
    floors[1] +
    walls[1];
  const progress = ((comp / total) * 100).toFixed(1);
  return [total, comp, progress];
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    const num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export function zoomToLayer(layer: any, view: any) {
  return layer.queryExtent().then((response: any) => {
    view
      ?.goTo(response.extent, {
        //response.extent
        speedFactor: 2,
      })
      .catch((error: any) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });
  });
}

// Layer list
export async function defineActions(event: any) {
  const { item } = event;
  if (item.layer.type !== "group") {
    item.panel = {
      content: "legend",
      open: true,
    };
  }
  item.title === "Depot Civil Works" ||
  item.title === "Architectural (reference only)" ||
  item.title === "Land & Structure" ||
  item.title === "ExteriorShell" ||
  item.title === "Generic Model (Not Monitoring)" ||
  item.title === "Furniture (Not Monitoring)" ||
  item.title === "Doors (Not Monitoring)" ||
  item.title === "Stairs (Not Monitoring)" ||
  item.title === "Roofs (Not Monitoring)" ||
  item.title === "Windows (Not Monitoring)"
    ? (item.visible = false)
    : (item.visible = true);
}
