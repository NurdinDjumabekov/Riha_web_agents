////// hooks
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

////// components

////// style
import "./style.scss";

////// fns
import { getListProdsInInvoiceNur } from "../../../../store/reducers/standartSlice";
import { getDataInvoiceSend } from "../../../../store/reducers/standartSlice";
import { clearListOrdersNurFN } from "../../../../store/reducers/standartSlice";

///// helpers
import { roundingNum } from "../../../../helpers/totals";

const Realization = ({ send_guid }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { listOrdersNur, activeSlide } = useSelector(
    (state) => state.standartSlice
  );

  const getData = () => dispatch(getListProdsInInvoiceNur(send_guid));
  /// список товаров определённой накладной

  useEffect(() => {
    if (activeSlide == 2) {
      getData();
    } else {
      dispatch(clearListOrdersNurFN());
    }
    dispatch(getDataInvoiceSend(send_guid));
  }, [send_guid, activeSlide]);

  const count_kg =
    listOrdersNur?.length == 0 ? 0 : listOrdersNur?.[0]?.total_count_kg;

  const count =
    listOrdersNur?.length == 0 ? 0 : listOrdersNur?.[0]?.total_count;

  const price =
    listOrdersNur?.length == 0 ? 0 : listOrdersNur?.[0]?.total_price;

  const createInvoice = () => {
    const obj = {
      action: 1,
      date_from: "",
      date_to: "",
      invoice_guid: send_guid,
    };
    navigate("/app/crud_invoice", { state: obj });
  };

  return (
    <div className="mainInfo rerurnProd">
      <div className="mainInfo__inner">
        <div className="info">
          <p>Сумма товара: </p>
          <span>{roundingNum(price)} сом</span>
        </div>
        <div className="info">
          <p>Общий вес товара: </p>
          <span>{roundingNum(count_kg)} кг</span>
        </div>
        <div className="info">
          <p>Количество товара: </p>
          <span>{roundingNum(count)} кг</span>
        </div>
        <button className="pdfBtn">
          <p>Распечатать накладную отпуска</p>
        </button>
      </div>
      <button className="startEndTA" onClick={createInvoice}>
        <p>+ Оформить товар</p>
      </button>
    </div>
  );
};

export default Realization;