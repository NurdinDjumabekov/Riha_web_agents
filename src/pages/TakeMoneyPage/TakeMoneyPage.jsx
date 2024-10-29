/////// hooks
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

////// icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/////// style
import "./style.scss";

////// components
import SendInput from "../../common/SendInput/SendInput";
import Modals from "../../components/Modals/Modals";

////// fns
import {
  clearDataPay,
  sendPayFN,
  setDataPay,
} from "../../store/reducers/paySlice";

////// helpers
import { getMyGeo } from "../../helpers/transformDate";
import {
  sendCommentInRoute,
  setActiveActions_TA,
} from "../../store/reducers/mapSlice";

const TakeMoneyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { route_guid, guid_point, type } = useParams(); //// в guid_point лежит guid продавца
  const oldComment = location.state?.comment;
  const guidRoute = location.state?.guid; // guid каждого маршрута
  ///// type - 3 для получения денег
  ///// type - 4 для отправки комментарий

  const { dataPay } = useSelector((state) => state.paySlice);
  const { activeActions_TA } = useSelector((state) => state.mapSlice);

  const [comment, setComment] = useState("");

  const prevNav = () => {
    navigate("/");
    navigate("/maps");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    dispatch(setDataPay({ ...dataPay, [name]: value }));
  };

  const sendPay = () => {
    const send = {
      ...dataPay,
      user_guid_to: guid_point, // check тут продавец или точка ?
      user_type_to: "4", // check
    };
    dispatch(sendPayFN(send));
    prevNav();
  };

  useEffect(() => {
    dispatch(clearDataPay()); /// clear поля ввода данных для оплаты
    setComment(oldComment);
  }, []);

  // 3 для получения денег
  if (type == 3) {
    return (
      <div className="takeMoneyPage">
        <button className="prev" onClick={prevNav}>
          <ArrowBackIcon sx={{ color: "#222" }} />
        </button>

        <Modals openModal={true} closeModal={prevNav} title={"Оплата"}>
          <div className="takeMoneyPage__inner">
            <SendInput
              value={dataPay?.amount}
              onChange={onChange}
              title={"Сумма"}
              name={"amount"}
              type="number"
            />

            <SendInput
              value={dataPay?.comment}
              onChange={onChange}
              title={"Ваш комментарий"}
              name={"comment"}
              type="text"
              typeInput="textarea"
            />

            <button className="sendData" onClick={sendPay}>
              Произвести оплату
            </button>
          </div>
        </Modals>
      </div>
    );
  }

  const sendComment = async () => {
    const send = { comment, route_guid, prevNav };
    const res = await dispatch(sendCommentInRoute(send)).unwrap(); /// добавляю коммент в маршрут

    if (res?.result == 1) {
      dispatch(setActiveActions_TA({ ...activeActions_TA, comment })); /// подсталвяю добавленный коммент в активный маршрут
      prevNav();
    }
    // getMyGeo().then(({ lat, lon }) => {});
  };

  // 4 для отправки комментарий
  if (type == 4) {
    return (
      <div className="takeMoneyPage">
        <button className="prev" onClick={prevNav}>
          <ArrowBackIcon sx={{ color: "#222" }} />
        </button>
        <Modals openModal={true} closeModal={prevNav} title={"Комментарий"}>
          <div className="takeMoneyPage__inner">
            <SendInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              title={"Ваш комментарий"}
              name={"comment"}
              type="text"
              typeInput="textarea"
            />
            <button className="sendData" onClick={sendComment}>
              Отправить
            </button>
          </div>
        </Modals>
      </div>
    );
  }
};

export default TakeMoneyPage;
