import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { clearAddPoints, clearPositionPoints } from "../../helpers/clear";
import axios from "axios";
import axiosInstance from "../../axiosInstance";
import { myAlert } from "../../helpers/MyAlert";
import { setStateLoad } from "./mapSlice";
import { transformDate } from "../../helpers/transformDate";

const { REACT_APP_API_URL, REACT_APP_MAP_KEY } = process.env;

const initialState = {
  infoNewPoint: {
    lat: "",
    lon: "",
    codeid: 0,
    name: "",
    address: "",
    phone: "",
    inn: "",
    ittn: "",
    name_owner: "",
    number_owner: "",
  }, /// для создания новой ТТ от имени ТА

  infoNextpoint: {
    point: { label: "", value: "" },
    comment: "",
    route_sheet_guid: "",
    position: { label: "", value: "" },
  }, //// для добавление в маршрут новой точки от имени ТА

  listsTasks: [], /// список задач для ТА
};

////// getAddres - get наименование точки
export const getAddres = createAsyncThunk(
  "getAddres",
  async function (infoNewPoint, { dispatch, rejectWithValue }) {
    const { lon, lat } = infoNewPoint;
    const url = `https://catalog.api.2gis.com/3.0/items/geocode?lon=${lat}&lat=${lon}&fields=items.point&key=${REACT_APP_MAP_KEY}`;
    try {
      const response = await axiosInstance(url);
      if (response.status >= 200 && response.status < 300) {
        const address = response.data?.result?.items?.[0]?.full_name;
        dispatch(setInfoNewPoint({ ...infoNewPoint, address }));
        return response.data;
      } else {
        throw Error(`Error: ${response.status}`);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

////// addNewPonts - создаю новую точку от имени ТА
export const addNewPonts = createAsyncThunk(
  "addNewPonts",
  async function (props, { dispatch, rejectWithValue }) {
    const data = {
      type_guid: "85DB5D34-2FB5-45EA-849F-97BF11BC2E4C", //// timmmms
      ...props,
      lat: props?.lon,
      lon: props?.lat,
    };
    const url = `${REACT_APP_API_URL}/ta/create_point`;
    try {
      const response = await axiosInstance.post(url, data);
      if (response.status >= 200 && response.status < 300) {
        if (response.data?.result == 1) {
          dispatch(setStateLoad()); // (нужен для перезагрузки карт)
        }
        return {
          result: response.data?.result,
          navigate: props?.navigate,
        };
      } else {
        throw Error(`Error: ${response.status}`);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

////// addNewPontToday - добавляю новую точку на сегодняшний день
export const addNewPontToday = createAsyncThunk(
  "addNewPontToday",
  async function (data, { dispatch, rejectWithValue }) {
    const url = `${REACT_APP_API_URL}/ta/add_route_agent`;
    try {
      const response = await axiosInstance.post(url, data);
      if (response.status >= 200 && response.status < 300) {
        if (response.data?.result == 1) {
          myAlert("Новый маршрут был построен");
          data?.navigate("/maps");
          dispatch(setStateLoad()); // (нужен для перезагрузки карт)
        }
        if (response.data?.result == 0) {
          myAlert("Маршрут с такой точкой уже построен!", "error");
        }
        return response.data?.result;
      } else {
        throw Error(`Error: ${response.status}`);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

////// getTasks - get наименование точки
export const getTasks = createAsyncThunk(
  "getTasks",
  async function (props, { dispatch, rejectWithValue }) {
    const date = transformDate(new Date());
    const { agent_guid, point_guid } = props;
    const url = `${REACT_APP_API_URL}/ta/get_tasks?agent_guid=${agent_guid}&date=${date}&point_guid=${point_guid}&is_admin`;
    try {
      const response = await axiosInstance(url);
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else {
        throw Error(`Error: ${response.status}`);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const pointsSlice = createSlice({
  name: "pointsSlice",
  initialState,
  reducers: {
    setInfoNewPoint: (state, action) => {
      state.infoNewPoint = action?.payload;
    },
    clearInfoNewPoint: (state, action) => {
      state.infoNewPoint = clearAddPoints;
    },

    setInfoNextpoint: (state, action) => {
      state.infoNextpoint = action?.payload;
    },
    clearInfoNextpoint: (state, action) => {
      state.infoNextpoint = clearPositionPoints;
    },
  },

  extraReducers: (builder) => {
    ////////////// addNewPonts
    builder.addCase(addNewPonts.fulfilled, (state, action) => {
      state.preloader = false;
      if (action.payload?.result == 1) {
        myAlert("Новая точка успешно добавлена");
        action.payload?.navigate("/maps");
      } else if (action.payload?.result == -2) {
        myAlert("Такая точка уже есть в нашей системе", "error");
      }
    });
    builder.addCase(addNewPonts.rejected, (state, action) => {
      state.error = action.payload;
      state.preloader = false;
    });
    builder.addCase(addNewPonts.pending, (state, action) => {
      state.preloader = true;
    });

    ///////////// getTasks
    builder.addCase(getTasks.fulfilled, (state, action) => {
      state.preloader = false;
      state.listsTasks = action.payload;
    });
    builder.addCase(getTasks.rejected, (state, action) => {
      state.error = action.payload;
      state.preloader = false;
    });
    builder.addCase(getTasks.pending, (state, action) => {
      state.preloader = true;
    });
  },
});

export const {
  setInfoNewPoint,
  clearInfoNewPoint,
  setInfoNextpoint,
  clearInfoNextpoint,
} = pointsSlice.actions;

export default pointsSlice.reducer;
