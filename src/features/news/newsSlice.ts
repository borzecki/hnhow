import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

import {
  NewsComment,
  NewsDetails,
  NewsHit,
  ResourceStatus,
} from "./news.types";
import { fetchDetails, fetchNews } from "./newsAPI";

export interface NewsState {
  activeNews?: NewsDetails;
  hits: NewsHit[];
  page: number;
  hitsPerPage: number;
  status: ResourceStatus;
  activeNewsStatus: ResourceStatus;
}

export const initialState: NewsState = {
  activeNews: undefined,
  hits: [],
  page: 0,
  hitsPerPage: 20,
  status: "idle",
  activeNewsStatus: "idle",
};

export const loadNews = createAsyncThunk<
  { data: NewsHit[]; loadMore?: boolean },
  { query: string; loadMore?: boolean },
  { state: RootState }
>("news/fetchNews", async ({ query, loadMore }, { getState }) => {
  const { page, hitsPerPage } = selectBasePageParams(getState());
  const response = await fetchNews({
    query,
    page: loadMore ? page : 0,
    hitsPerPage,
  });

  return { data: response.data.hits, loadMore };
});

export const loadDetails = createAsyncThunk(
  "news/fetchComments",
  async (itemId: string) => {
    const response = await fetchDetails(itemId);
    return response.data;
  }
);

export const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    reset: (state) => {
      state.hits = initialState.hits;
      state.page = initialState.page;
      state.activeNews = initialState.activeNews;
      state.status = "idle";
      state.activeNewsStatus = "idle";
      localStorage.removeItem("hiddenNews");
    },
    toggleVisibility: (state, action) => {
      // update state
      const id = action.payload;
      const idx = state.hits.findIndex((item) => +item.objectID === id);
      if (idx >= 0) state.hits[idx].isHidden = !state.hits[idx].isHidden;

      // update localstorage
      const hiddenNews = JSON.parse(localStorage.getItem("hiddenNews") || "[]");
      const isHidden = hiddenNews.includes(id);
      const value = isHidden
        ? hiddenNews.filter((i: number) => i !== id)
        : [...hiddenNews, id];
      localStorage.setItem("hiddenNews", JSON.stringify(value));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadNews.fulfilled, (state, action) => {
        // there's two modes of loading data - determined by the value of loadMore
        // in case loadMore is true data is being appened to results found in the store
        // and `page` index is incremented for next request
        // other case is reseting the state and sets the data found in payload as is
        const { data, loadMore } = action.payload;

        const hiddenNews = JSON.parse(
          localStorage.getItem("hiddenNews") || "[]"
        );
        // filtering out empty and hidden news items
        const filteredData = data
          .filter((item) => item.author && item.title)
          .map((item) => ({
            ...item,
            isHidden: hiddenNews.includes(+item.objectID),
          }));

        state.status = "idle";
        // load new page action was triggered
        if (loadMore) {
          state.page += 1;
          state.hits = state.hits.concat(filteredData);
        } else {
          // reset search and start from scratch
          state.page = 1;
          state.hits = filteredData;
        }
      })
      .addCase(loadNews.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(loadDetails.pending, (state) => {
        state.activeNewsStatus = "loading";
        state.activeNews = undefined;
      })
      .addCase(loadDetails.fulfilled, (state, action) => {
        state.activeNewsStatus = "idle";
        const activeComments = action.payload.children.filter(
          (comment: NewsComment) => comment.author && comment.text
        );
        state.activeNews = { ...action.payload, children: activeComments };
      })
      .addCase(loadDetails.rejected, (state) => {
        state.activeNewsStatus = "failed";
      });
  },
});

export const { reset, toggleVisibility } = newsSlice.actions;

// selectors
export const selectNews = (state: RootState) => state.news.hits;
export const selectVisibleNews = createSelector(selectNews, (news) =>
  news.filter((item) => !item.isHidden)
);
export const selectNewsStatus = (state: RootState) => state.news.status;
export const selectActiveNews = (state: RootState) => state.news.activeNews;
export const selectActiveNewsStatus = (state: RootState) =>
  state.news.activeNewsStatus;

export const selectBasePageParams = (state: RootState) => ({
  page: state.news.page,
  hitsPerPage: state.news.hitsPerPage,
});

export default newsSlice.reducer;
