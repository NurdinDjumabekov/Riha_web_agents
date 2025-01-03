////// hooks
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

////// style
import "./style.scss";

////// components
import Select from "react-select";
import { Table, TableBody, TableCell } from "@mui/material";
import { TableContainer, TableHead } from "@mui/material";
import { TableRow, Paper } from "@mui/material";

///// icons

////// fns
import { setActiveWorkShop } from "../../store/reducers/selectsSlice";
import { getListProdsNur } from "../../store/reducers/standartSlice";

////// helpers
import { transformLists } from "../../helpers/transformLists";
import { roundingNum } from "../../helpers/totals";

const ListChoiceProds = (props) => {
  const { setSearch, invoice_guid } = props;
  const { action, type_unit, checkTypeProds } = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeWorkShop } = useSelector((state) => state.selectsSlice);

  const { listWorkShopsNur } = useSelector((state) => state.standartSlice);
  const { listProdsNur } = useSelector((state) => state.standartSlice);

  const onChangeWS = (item) => {
    dispatch(setActiveWorkShop(item)); ///// выбор селекта цехов

    const objUrl = {
      0: `get_product?workshop_guid=${item?.value}&type=agent`,
      1: `get_agent_leftover?workshop_guid=${item?.value}&type=agent`,
    };

    dispatch(
      getListProdsNur({ links: objUrl?.[checkTypeProds], guid: item?.value })
    );
    // get список товаров с категориями
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const objType = {
    0: transformLists(listWorkShopsNur, "guid", "name"),
    1: transformLists(listWorkShopsNur, "workshop_guid", "workshop_name"),
  };

  const workShop = objType?.[checkTypeProds];

  const clickProd = (obj) => {
    const workshop_price = !!checkTypeProds ? obj?.price : obj?.workshop_price;
    const send = {
      ...obj,
      invoice_guid,
      action,
      count_kg: "",
      type_unit,
      workshop_price,
      checkTypeProds,
    };
    navigate("/app/input_prods", { state: send });
  };

  return (
    <div className="listChoiceProds">
      <div className="listChoiceProds__prods">
        <div className="myInputs">
          <Select
            options={workShop}
            className="select"
            onChange={onChangeWS}
            value={activeWorkShop}
            isSearchable={false}
          />
        </div>
      </div>
      <div className="listProdCRUD">
        {/* <div className="helpers">
          <div>
            <span className="vakuum"></span>
            <p>Вакуум</p>
          </div>
          <div>
            <span></span> <p>Без вакуум</p>
          </div>
        </div> */}
        <div className="listProdCRUD__inner">
          {listProdsNur?.map((item, index) => (
            <TableContainer
              component={Paper}
              className="scroll_table standartTable"
              key={index}
            >
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="left"
                      style={{ width: "12%" }}
                    >
                      {item?.name}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {item?.prods?.slice(0, 100)?.map((row) => (
                    <TableRow
                      key={row?.product_guid}
                      onClick={() => clickProd(row)}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ width: "68%" }}
                      >
                        {row?.product_name}
                      </TableCell>
                      <TableCell align="left" style={{ width: "20%" }}>
                        {roundingNum(
                          !!checkTypeProds ? row?.price : row?.workshop_price
                        )}{" "}
                        сом
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListChoiceProds;
