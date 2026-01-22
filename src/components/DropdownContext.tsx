import { useEffect, useState, use } from "react";
import Select from "react-select";
import "../index.css";
import "../App.css";
import { MyContext } from "../contexts/MyContext";
import { buildingSpotLayer } from "../layers";
import GenerateDropdownData from "npm-dropdown-package";

export default function DropdownData() {
  const { updateBuildings } = use(MyContext);
  const [buildingName, setBuildingName] = useState<null | any>(null);
  const [initBuildingNames, setInitBuildingNames] = useState([]);

  useEffect(() => {
    const dropdownData = new GenerateDropdownData(
      [buildingSpotLayer],
      ["Name"],
    );

    dropdownData.dropDownQuery().then((response: any) => {
      setInitBuildingNames(response);
    });
  }, []);

  // handle change event of the Municipality dropdown
  const handleBuildingChange = (obj: any) => {
    setBuildingName(obj);
    updateBuildings(obj.field1);
  };

  // Style CSS
  const customstyles = {
    option: (styles: any, { isFocused, isSelected }: any) => {
      // const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: isFocused
          ? "#999999"
          : isSelected
            ? "#2b2b2b"
            : "#2b2b2b",
        color: "#ffffff",
        width: "200px",
      };
    },

    control: (defaultStyles: any) => ({
      ...defaultStyles,
      backgroundColor: "#2b2b2b",
      borderColor: "#949494",
      color: "#ffffff",
      touchUi: false,
      width: "200px",
    }),
    singleValue: (defaultStyles: any) => ({ ...defaultStyles, color: "#fff" }),
  };

  return (
    <div className="dropdownFilterLayout">
      <div
        style={{
          color: "white",
          fontSize: "0.85rem",
          margin: "auto",
          paddingRight: "0.5rem",
        }}
      ></div>
      <Select
        placeholder="Select Building"
        value={buildingName}
        options={initBuildingNames}
        onChange={handleBuildingChange}
        getOptionLabel={(x: any) => x.field1}
        styles={customstyles}
      />
    </div>
  );
}
