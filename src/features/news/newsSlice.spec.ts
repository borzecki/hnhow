import newsReducer, {
  initialState,
  loadNews,
  reset,
  toggleVisibility,
} from "./newsSlice";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { store } from "../../app/store";

const hit1 = {
  created_at: "2022-06-14T03:50:30.000Z",
  title: "Stephen Hawking has died",
  url: "http://www.bbc.com/news/uk-43396008",
  author: "Cogito",
  points: 6015,
  num_comments: 436,
  objectID: "16582136",
  isHidden: false,
  text: "",
};

const getListResponse = {
  hits: [hit1],
};

const mockNetworkResponse = () => {
  const mock = new MockAdapter(axios);
  mock
    .onGet("https://hn.algolia.com/api/v1/search")
    .reply(200, getListResponse);
};

const mockNetworkError = () => {
  const mock = new MockAdapter(axios);
  mock.onGet("https://hn.algolia.com/api/v1/search").networkError();
};

describe("news reducer", () => {
  it("should handle initial state", () => {
    expect(newsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle reset", () => {
    const actual = newsReducer(
      { ...initialState, page: 10, status: "loading" },
      reset()
    );
    expect(actual.page).toEqual(initialState.page);
    expect(actual.status).toEqual(initialState.status);
  });

  it("should handle toggleVisibility", () => {
    const state1 = newsReducer(
      {
        ...initialState,
        hits: [hit1],
      },
      toggleVisibility(16582136)
    );
    expect(state1.hits[0].isHidden).toBeTruthy();

    // toggle back
    const state2 = newsReducer(state1, toggleVisibility(16582136));
    expect(state2.hits[0].isHidden).toBeFalsy();
  });

  it("should handle loadNews - success case", async () => {
    mockNetworkResponse();

    const result = await store.dispatch(loadNews({ query: "" }));
    expect(result.type).toBe("news/fetchNews/fulfilled");
    expect(result.payload).toEqual({ data: [hit1], loadMore: undefined });

    const newsState = store.getState().news;
    expect(newsState.status).toEqual("idle");
    expect(newsState.hits).toHaveLength(1);
    expect(newsState.page).toEqual(1);
  });

  it("should handle loadMoreNews", async () => {
    mockNetworkResponse();

    // initial load should populate hits
    await store.dispatch(loadNews({ query: "" }));

    // secondary call appends values to existing hits
    const result = await store.dispatch(
      loadNews({ query: "", loadMore: true })
    );
    expect(result.type).toBe("news/fetchNews/fulfilled");

    // check the state values
    const newsState = store.getState().news;

    expect(newsState.status).toEqual("idle");
    expect(newsState.hits).toHaveLength(2);
    expect(newsState.page).toEqual(2);
  });

  it("should be able handle network errors on load news", async () => {
    mockNetworkError();

    const result = await store.dispatch(loadNews({ query: "" }));
    expect(result.type).toBe("news/fetchNews/rejected");
    expect(store.getState().news.status).toEqual("failed");
  });
});
