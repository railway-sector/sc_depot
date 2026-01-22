import { useEffect, useRef, useState, use } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import "../App.css";
import {
  buildingSpotZoom,
  generateChartData,
  generateTotalProgress,
  thousands_separators,
} from "../Query";
import "@esri/calcite-components/dist/components/calcite-label";
import { CalciteLabel } from "@esri/calcite-components-react";
import { ArcgisScene } from "@arcgis/map-components/dist/components/arcgis-scene";
import { MyContext } from "../contexts/MyContext";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

// Draw chart
const BuildingChart = () => {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const { buildings } = use(MyContext);
  const legendRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [progress, setProgress] = useState([]);

  const chartID = "station-bar";
  useEffect(() => {
    generateChartData(buildings).then((response: any) => {
      setChartData(response);
    });

    generateTotalProgress(buildings).then((response: any) => {
      setProgress(response);
    });

    buildingSpotZoom(buildings, arcgisScene);

    // layerVisibleTrue();
  }, [buildings]);

  // Define parameters
  const marginTop = 0;
  const marginLeft = 0;
  const marginRight = 0;
  const marginBottom = 0;
  const paddingTop = 10;
  const paddingLeft = 5;
  const paddingRight = 5;
  const paddingBottom = 0;

  const xAxisNumberFormat = "#'%'";
  const seriesBulletLabelFontSize = "1vw";

  // axis label
  const yAxisLabelFontSize = "0.8vw";
  const xAxisLabelFontSize = "0.8vw";
  const legendFontSize = "0.8vw";

  const chartPaddingRightIconLabel = 10;

  const chartSeriesFillColorComp = "#0070ff";
  const chartSeriesFillColorIncomp = "#000000";
  // const chartSeriesFillColorOngoing = "#d3d3d3"; // orfiginal: #FF0000
  const chartBorderLineColor = "#00c5ff";
  const chartBorderLineWidth = 0.4;

  useEffect(() => {
    maybeDisposeRoot(chartID);

    const root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Responsive.new(root),
    ]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        marginTop: marginTop,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginBottom: marginBottom,
        paddingTop: paddingTop,
        paddingLeft: paddingLeft,
        paddingRight: paddingRight,
        paddingBottom: paddingBottom,
        scale: 1,
        height: am5.percent(100),
      }),
    );
    chartRef.current = chart;

    const yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
    });
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: yRenderer,

        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    yRenderer.labels.template.setAll({
      paddingRight: chartPaddingRightIconLabel,
    });

    yRenderer.grid.template.setAll({
      location: 1,
    });

    // Label properties Y axis
    yAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: yAxisLabelFontSize,
    });

    yAxis.data.setAll(chartData);

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        numberFormat: xAxisNumberFormat,
        calculateTotals: true,
        renderer: am5xy.AxisRendererX.new(root, {
          strokeOpacity: 0,
          strokeWidth: 1,
          stroke: am5.color("#ffffff"),
        }),
      }),
    );

    xAxis.get("renderer").labels.template.setAll({
      //oversizedBehavior: "wrap",
      textAlign: "center",
      fill: am5.color("#ffffff"),
      //maxWidth: 150,
      fontSize: xAxisLabelFontSize,
    });

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        centerY: am5.percent(50),
        x: am5.percent(60),
        y: am5.percent(97),
        marginTop: 20,
        scale: 0.9,
        layout: root.horizontalLayout,
      }),
    );
    legendRef.current = legend;

    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      fontSize: legendFontSize,
      // scale: 1.2,
      //textDecoration: "underline"
      //width: am5.percent(600),
      //fontWeight: '300',
    });

    function makeSeries(name: any, fieldName: any) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: name,
          stacked: true,
          xAxis: xAxis,
          yAxis: yAxis,
          baseAxis: yAxis,
          valueXField: fieldName,
          valueXShow: "valueXTotalPercent",
          categoryYField: "category",
          fill:
            fieldName === "incomp"
              ? am5.color(chartSeriesFillColorIncomp)
              : am5.color(chartSeriesFillColorComp),
          stroke: am5.color(chartBorderLineColor),
        }),
      );

      series.columns.template.setAll({
        fillOpacity: fieldName === "comp" ? 1 : 0.5,
        tooltipText: "{name}: {valueX}", // "{categoryY}: {valueX}",
        tooltipY: am5.percent(90),
        strokeWidth: chartBorderLineWidth,
      });
      series.data.setAll(chartData);

      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text:
              fieldName === "comp"
                ? "{valueXTotalPercent.formatNumber('#.')}%"
                : "",
            fill: root.interfaceColors.get("alternativeText"),
            opacity: fieldName === "incomp" ? 0 : 1,
            fontSize: seriesBulletLabelFontSize,
            centerY: am5.p50,
            centerX: am5.p50,
            populateText: true,
          }),
        });
      });

      // series.columns.template.events.on("click", (ev) => {
      //   const selected: any = ev.target.dataItem?.dataContext;
      //   const categorySelect: string = selected.category;
      //   const typeSelect = buildingType.find(
      //     (emp: any) => emp.category === categorySelect,
      //   )?.value;

      //   const buildingExpressin = "Name = '" + buildings + "'";
      //   const typeExpression = "Type = " + typeSelect;
      //   const expression = !buildings
      //     ? typeExpression
      //     : buildingExpressin + " AND " + typeExpression;

      //   // Find sublayer
      //   const selectedSublayerName = buildingType.find(
      //     (emp: any) => emp.category === categorySelect,
      //   );

      //   if (categorySelect === buildingType[0].category) {
      //     console.log("Foundation clicked");
      //     stFoundationLayer.visible = true;
      //     stFoundationLayer.definitionExpression = expression;
      //     stColumnLayer.visible = false;
      //     stFramingLayer.visible = false;
      //     doorsLayer.visible = false;
      //     stairsLayer.visible = false;
      //     windowsLayer.visible = false;
      //     wallsLayer.visible = false;
      //     roofsLayer.visible = false;
      //     floorsLayer.visible = false;
      //     columnsLayer.visible = false;
      //     furnitureLayer.visible = false;
      //   }

      //   arcgisScene?.view
      //     .whenLayerView(buildingLayer)
      //     .then((buildingSceneLayerView: any) => {
      //       // layerVisibleTrue();
      //       const sublayerView = buildingSceneLayerView.sublayerViews.find(
      //         (sublayerView: any) => {
      //           return (
      //             sublayerView.sublayer.modelName ===
      //             selectedSublayerName?.modelName
      //           );
      //         },
      //       );
      //       setSublayerViewFilter(sublayerView);

      //       const query = sublayerView.createQuery();
      //       query.where = expression;
      //       // !sublayerViewFilter
      //       //   ? (query.where = "Status > 1")
      //       //   : (query.where = expression);

      //       sublayerView.queryFeatures(query).then((results: any) => {
      //         const lengths = results.features;
      //         const rows = lengths.length;
      //         const objID = [];
      //         for (let i = 0; i < rows; i++) {
      //           const obj = results.features[i].attributes.OBJECTID;
      //           objID.push(obj);
      //         }
      //         sublayerView.filter = new FeatureFilter({
      //           where: expression,
      //         });
      //       });
      //     });
      // });
      legend.data.push(series);
    }
    makeSeries("Completed", "comp");
    makeSeries("To be Constructed", "incomp");
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  });

  // const resetButtonHandler = () => {
  //   if (sublayerViewFilter) {
  //     sublayerViewFilter.filter = new FeatureFilter({
  //       where: undefined,
  //     });
  //     layerVisibleTrue();
  //   }

  //   // if (categoryClicked === "Others") {
  //   //   layerVisibleTrue();
  //   // }
  // };

  const primaryLabelColor = "#9ca3af";
  const valueLabelColor = "#d1d5db";

  return (
    <div>
      <div
        style={{
          color: primaryLabelColor,
          fontSize: "1.3rem",
          marginLeft: "13px",
          marginTop: "10px",
          marginBottom: "-5px",
        }}
      >
        Total Progress
      </div>
      <CalciteLabel layout="inline">
        <div
          style={{
            color: valueLabelColor,
            fontSize: "2.7rem",
            fontWeight: "bold",
            fontFamily: "calibri",
            lineHeight: "1.2",
            marginLeft: "30px",
          }}
        >
          {progress[2]} %
        </div>

        <img
          src="https://EijiGorilla.github.io/Symbols/Station_Structures_icon.png"
          alt="Utility Logo"
          height={"55px"}
          width={"55px"}
          style={{ marginLeft: "35%", display: "flex", marginTop: "-40px" }}
        />
      </CalciteLabel>
      <div
        style={{
          color: valueLabelColor,
          fontSize: "1rem",
          fontFamily: "calibri",
          lineHeight: "1.2",
          marginLeft: "45px",
        }}
      >
        ({thousands_separators(progress[0])})
      </div>

      <div
        id={chartID}
        style={{
          width: "24vw",
          height: "64vh",
          backgroundColor: "rgb(0,0,0,0)",
          color: "white",
          marginRight: "10px",
        }}
      ></div>
      {/* <div
        id="filterButton"
        style={{
          width: "50%",
          marginLeft: "30%",
          // paddingTop: "10%",
        }}
      >
        <CalciteButton iconEnd="reset" scale="s" onClick={resetButtonHandler}>
          Reset Chart Filter
        </CalciteButton>
      </div> */}
    </div>
  );
};

export default BuildingChart;
