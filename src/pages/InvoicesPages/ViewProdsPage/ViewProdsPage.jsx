////// hooks
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

////// fns
import { getMyEveryInvoice } from "../../../store/reducers/invoiceSlice";

////// components
import NavMenu from "../../../common/NavMenu/NavMenu";
import ViewProds from "../../../common/ViewProds/ViewProds";

////// style
import "./style.scss";

//// icons
import SummarizeIcon from "@mui/icons-material/Summarize";

const ViewProdsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { guid, codeid, file, total_price, invoice_guid } = location.state; //// хранятся данные накладной

  const { listProdEveryInvoice } = useSelector((state) => state.invoiceSlice);

  useEffect(() => {
    if (!!guid) {
      dispatch(getMyEveryInvoice(guid));
    } else {
      dispatch(getMyEveryInvoice(invoice_guid));
    }
  }, [guid]);

  const keys = {
    key1: "product_name",
    key2: "count_kg",
    key3: "count",
    key4: "price",
  };

  console.log(listProdEveryInvoice);

  return (
    <div className="viewProdsPage">
      <NavMenu navText={`Накладная №${codeid}`} />
      <div className="viewProdsPage__inner">
        <ViewProds
          list={listProdEveryInvoice}
          keys={keys}
          total_price={total_price}
        />
        <a className="lookPdf" href={file}>
          <SummarizeIcon />
        </a>
      </div>
    </div>
  );
};

export default ViewProdsPage;